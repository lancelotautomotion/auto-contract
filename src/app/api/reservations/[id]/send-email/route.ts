import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { randomBytes } from "crypto";
import { buildEmailHtml, ctaButton, divider, muted } from "@/lib/emailTemplate";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const reservation = await prisma.reservation.findFirst({
    where: { id, gite: { userId: dbUser.id } },
    include: { gite: true },
  });
  if (!reservation) return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY non configurée" }, { status: 500 });
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  const existingContract = await prisma.contract.findUnique({ where: { reservationId: id } });
  const signatureToken = existingContract?.signatureToken ?? randomBytes(32).toString('hex');

  await prisma.contract.upsert({
    where: { reservationId: id },
    create: { reservationId: id, status: 'GENERATED', signatureToken, emailStatus: 'SENT', emailSentAt: new Date() },
    update: { signatureToken, emailStatus: 'SENT', emailSentAt: new Date() },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const signUrl = `${appUrl}/sign/${signatureToken}`;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
  const fmt = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const dateEntree = fmt(reservation.checkIn);
  const dateSortie = fmt(reservation.checkOut);

  const body = `
    <p style="margin:0 0 16px;">Bonjour <strong>${reservation.clientFirstName}</strong>,</p>
    <p style="margin:0 0 16px;">Votre contrat de location pour votre séjour du <strong>${dateEntree}</strong> au <strong>${dateSortie}</strong> au <strong>${reservation.gite.name}</strong> est prêt à être signé.</p>
    <p style="margin:0 0 4px;">Merci de le lire attentivement et de le signer en cliquant sur le bouton ci-dessous :</p>
    ${ctaButton('Lire et signer le contrat', signUrl)}
    ${divider()}
    ${muted('Ce lien est personnel et sécurisé. Une fois signé, vous recevrez automatiquement votre exemplaire par email.')}
    <p style="margin:24px 0 0; font-size:14px; color:#1C1C1A;">Cordialement,<br/><strong>${reservation.gite.name}</strong></p>
  `;

  const html = buildEmailHtml({
    giteName: reservation.gite.name,
    logoDataUrl: reservation.gite.logoDataUrl,
    preheader: `Votre contrat pour le séjour du ${dateEntree} au ${dateSortie} est prêt.`,
    body,
  });

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: reservation.clientEmail,
    subject: `Votre contrat de location à signer — ${reservation.gite.name}`,
    html,
  });

  if (error) {
    console.error('Resend error:', error);
    return NextResponse.json({ error: "Erreur lors de l'envoi de l'email" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

