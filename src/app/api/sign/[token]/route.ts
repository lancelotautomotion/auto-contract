import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildEmailHtml, divider, muted } from "@/lib/emailTemplate";
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
        include: { gite: true, reservationOptions: true },
      },
    },
  });

  if (!contract || !contract.reservation) return NextResponse.json({ error: 'Lien invalide' }, { status: 404 });
  if (contract.status === 'SIGNED') return NextResponse.json({ error: 'Déjà signé' }, { status: 400 });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? 'inconnue';
  const signedAt = new Date();
  const { reservation } = contract;

  // Mettre à jour le contrat
  await prisma.contract.update({
    where: { id: contract.id },
    data: { status: 'SIGNED', signedAt, signedByName: name.trim(), signedByIp: ip },
  });

  const fmt = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
  const logoPublicUrl = reservation.gite.logoUrl ?? null;
  const dateEntree = fmt(reservation.checkIn);
  const dateSortie = fmt(reservation.checkOut);
  const montantAcompte = reservation.deposit != null ? `${reservation.deposit.toFixed(2).replace('.', ',')} €` : null;

  // Email au locataire — confirmation de signature, PDF envoyé après réception de l'acompte
  const clientBody = `
    <p style="margin:0 0 16px;">Bonjour <strong>${reservation.clientFirstName}</strong>,</p>
    <p style="margin:0 0 16px;">Votre signature électronique pour le contrat de location du <strong>${dateEntree}</strong> au <strong>${dateSortie}</strong> au <strong>${reservation.gite.name}</strong> a bien été enregistrée.</p>
    <p style="margin:0 0 16px;">${montantAcompte
      ? `Dès réception de votre acompte de <strong>${montantAcompte}</strong>, votre exemplaire du contrat signé vous sera transmis par email.`
      : `Votre exemplaire du contrat signé vous sera transmis par email dès réception de l'acompte.`
    }</p>
    ${divider()}
    ${muted('Pour toute question, contactez directement votre hébergeur.')}
    <p style="margin:24px 0 0; font-size:14px; color:#1C1C1A;">Cordialement,<br/><strong>${reservation.gite.name}</strong></p>
  `;
  await resend.emails.send({
    from: fromEmail,
    to: reservation.clientEmail,
    subject: `Signature enregistrée — ${reservation.gite.name}`,
    html: buildEmailHtml({
      giteName: reservation.gite.name,
      logoPublicUrl,
      preheader: 'Votre signature a bien été enregistrée. Le contrat signé vous sera envoyé dès réception de l\'acompte.',
      body: clientBody,
    }),
  });

  // Email au gérant — notification de signature + action requise
  const notifEmail = reservation.gite.notificationEmail ?? reservation.gite.email;
  if (notifEmail) {
    const managerBody = `
      <p style="margin:0 0 16px;"><strong>${reservation.clientFirstName} ${reservation.clientLastName}</strong> vient de signer son contrat de location pour le séjour du <strong>${dateEntree}</strong> au <strong>${dateSortie}</strong>.</p>
      ${montantAcompte
        ? `<p style="margin:0 0 16px;">Dès réception de l'acompte de <strong>${montantAcompte}</strong>, marquez-le comme reçu dans votre tableau de bord pour que le contrat signé soit automatiquement envoyé au locataire.</p>`
        : `<p style="margin:0 0 16px;">Marquez l'acompte comme reçu dans votre tableau de bord pour envoyer automatiquement le contrat signé au locataire.</p>`
      }
      ${divider()}
      ${muted(`Signé électroniquement le ${signedAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} — IP : ${ip}`)}
    `;
    await resend.emails.send({
      from: fromEmail,
      to: notifEmail,
      subject: `Contrat signé par ${reservation.clientFirstName} ${reservation.clientLastName} — acompte en attente`,
      html: buildEmailHtml({
        giteName: reservation.gite.name,
        logoPublicUrl,
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
