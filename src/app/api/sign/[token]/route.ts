import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildEmailHtml, divider, infoBox, muted, signOff } from "@/lib/emailTemplate";
import { Resend } from "resend";

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  let name: string;
  try {
    const body = await req.json();
    name = body?.name;
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }

  if (!name?.trim()) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });

  try {
    const contract = await prisma.contract.findUnique({
      where: { signatureToken: token },
      include: {
        reservation: {
          include: { gite: { include: { user: true } }, reservationOptions: true },
        },
      },
    });

    if (!contract || !contract.reservation) return NextResponse.json({ error: 'Lien invalide' }, { status: 404 });
    if (contract.status === 'SIGNED') return NextResponse.json({ error: 'Déjà signé' }, { status: 400 });

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? 'inconnue';
    const signedAt = new Date();
    const { reservation } = contract;

    await prisma.contract.update({
      where: { id: contract.id },
      data: { status: 'SIGNED', signedAt, signedByName: name.trim(), signedByIp: ip },
    });

    const fmt = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    const dateEntree = fmt(reservation.checkIn);
    const dateSortie = fmt(reservation.checkOut);
    const depositFormatted = reservation.deposit != null
      ? `${reservation.deposit.toFixed(2).replace('.', ',')} €`
      : null;

    const giteAddress = [reservation.gite.address, reservation.gite.zipCode, reservation.gite.city]
      .filter(Boolean).join(', ') || undefined;

    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';

    // Email au locataire — confirmation de signature
    const clientBody = `
      <p style="margin:0 0 20px;">Votre signature électronique pour le contrat de location du <strong style="color:#2C2C2A;">${dateEntree}</strong> au <strong style="color:#2C2C2A;">${dateSortie}</strong> au <strong style="color:#2C2C2A;">${reservation.gite.name}</strong> a bien été enregistrée.</p>
      <p style="margin:0 0 20px;">${depositFormatted
        ? `Dès réception de votre acompte de <strong style="color:#2C2C2A;">${depositFormatted}</strong>, votre exemplaire du contrat signé vous sera transmis par email.`
        : `Votre exemplaire du contrat signé vous sera transmis par email dès réception de l'acompte.`
      }</p>
      ${divider()}
      ${muted("Pour toute question, contactez directement votre hébergeur.")}
      ${signOff(reservation.gite.name)}
    `;
    await resend.emails.send({
      from: fromEmail,
      to: reservation.clientEmail,
      subject: `Signature enregistrée — ${reservation.gite.name}`,
      html: buildEmailHtml({
        giteName: reservation.gite.name,
        giteAddress,
        giteLogoUrl: reservation.gite.logoUrl,
        docLabel: 'Signature enregistrée',
        preheader: "Votre signature a bien été enregistrée. Le contrat signé vous sera envoyé dès réception de l'acompte.",
        greeting: reservation.clientFirstName,
        body: clientBody,
      }),
    });

    // Email au gérant — notification de signature
    const notifEmail = reservation.gite.notificationEmail || reservation.gite.email || reservation.gite.user.email;
    if (reservation.gite.notifContractSigned && notifEmail) {
      const signedAtFormatted = signedAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      const managerBody = `
        <p style="margin:0 0 20px;"><strong style="color:#2C2C2A;">${reservation.clientFirstName} ${reservation.clientLastName}</strong> vient de signer son contrat de location pour le séjour du <strong style="color:#2C2C2A;">${dateEntree}</strong> au <strong style="color:#2C2C2A;">${dateSortie}</strong>.</p>
        ${depositFormatted
          ? infoBox(`Dès réception de l'acompte de <strong style="color:#5B52B5;">${depositFormatted}</strong>, marquez-le comme reçu dans votre tableau de bord pour que le contrat signé soit automatiquement envoyé au locataire.`)
          : `<p style="margin:0 0 20px;">Marquez l'acompte comme reçu dans votre tableau de bord pour envoyer automatiquement le contrat signé au locataire.</p>`
        }
        ${divider()}
        ${muted(`Signé le ${signedAtFormatted} — IP : ${ip}`)}
      `;
      await resend.emails.send({
        from: fromEmail,
        to: notifEmail,
        subject: `Contrat signé par ${reservation.clientFirstName} ${reservation.clientLastName} — acompte en attente`,
        html: buildEmailHtml({
          giteName: reservation.gite.name,
          giteAddress,
          giteLogoUrl: reservation.gite.logoUrl,
          docLabel: 'Notification signature',
          preheader: `${reservation.clientFirstName} ${reservation.clientLastName} a signé. En attente de l'acompte.`,
          body: managerBody,
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[sign] Erreur:', err);
    return NextResponse.json({ error: 'Erreur interne lors de la signature' }, { status: 500 });
  }
}
