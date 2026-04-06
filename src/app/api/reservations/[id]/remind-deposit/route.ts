import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildEmailHtml, divider, muted } from "@/lib/emailTemplate";
import { Resend } from "resend";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });

    const reservation = await prisma.reservation.findFirst({
      where: { id, gite: { userId: dbUser.id } },
      include: { gite: true, contract: true },
    });

    if (!reservation) return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    if (!reservation.contract) return NextResponse.json({ error: 'Aucun contrat' }, { status: 400 });
    if (reservation.contract.status !== 'SIGNED') return NextResponse.json({ error: 'Contrat non signé' }, { status: 400 });
    if (reservation.contract.depositReceived) return NextResponse.json({ error: 'Acompte déjà reçu' }, { status: 400 });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const logoPublicUrl = reservation.gite.slug && reservation.gite.logoDataUrl
      ? `${appUrl}/api/gite/logo?slug=${reservation.gite.slug}`
      : null;

    const fmt = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    const dateEntree = fmt(reservation.checkIn);
    const dateSortie = fmt(reservation.checkOut);
    const montantAcompte = reservation.deposit != null
      ? `${reservation.deposit.toFixed(2).replace('.', ',')} €`
      : null;

    const body = `
      <p style="margin:0 0 16px;">Bonjour <strong>${reservation.clientFirstName}</strong>,</p>
      <p style="margin:0 0 16px;">Nous vous rappelons que vous avez signé votre contrat de location pour le séjour du <strong>${dateEntree}</strong> au <strong>${dateSortie}</strong> au <strong>${reservation.gite.name}</strong>.</p>
      ${montantAcompte
        ? `<p style="margin:0 0 16px;">Afin de finaliser votre réservation et de recevoir votre exemplaire du contrat signé, nous vous invitons à procéder au règlement de l'acompte de <strong>${montantAcompte}</strong>.</p>`
        : `<p style="margin:0 0 16px;">Afin de finaliser votre réservation, nous vous invitons à procéder au règlement de l'acompte.</p>`
      }
      <p style="margin:0 0 16px;">Pour toute question concernant les modalités de paiement, n'hésitez pas à nous contacter directement.</p>
      ${divider()}
      ${muted(`Séjour du ${dateEntree} au ${dateSortie} · ${reservation.gite.name}`)}
      <p style="margin:24px 0 0; font-size:14px; color:#1C1C1A;">Cordialement,<br/><strong>${reservation.gite.name}</strong></p>
    `;

    await resend.emails.send({
      from: fromEmail,
      to: reservation.clientEmail,
      subject: `Rappel acompte — ${reservation.gite.name}`,
      html: buildEmailHtml({
        giteName: reservation.gite.name,
        logoPublicUrl,
        preheader: `Rappel : votre acompte${montantAcompte ? ` de ${montantAcompte}` : ''} est en attente pour finaliser votre réservation.`,
        body,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[remind-deposit]', err);
    return NextResponse.json({ error: 'Erreur lors de l\'envoi du rappel' }, { status: 500 });
  }
}
