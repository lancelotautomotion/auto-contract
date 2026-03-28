import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { randomBytes } from "crypto";

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
  const fmt = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const dateEntree = fmt(reservation.checkIn);
  const dateSortie = fmt(reservation.checkOut);

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: reservation.clientEmail,
    subject: `Votre contrat de location à signer — ${reservation.gite.name}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; color: #1C1C1A;">
        <p>Bonjour ${reservation.clientFirstName},</p>
        <p>Votre contrat de location pour votre séjour du <strong>${dateEntree}</strong> au <strong>${dateSortie}</strong> au <strong>${reservation.gite.name}</strong> est prêt.</p>
        <p>Merci de le lire attentivement et de le signer en cliquant sur le bouton ci-dessous :</p>
        <p style="text-align: center; margin: 32px 0;">
          <a href="${signUrl}" style="background-color: #1C1C1A; color: #EDE8E1; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase;">
            Lire et signer le contrat →
          </a>
        </p>
        <p style="font-size: 12px; color: #7A7570;">Ce lien est personnel et sécurisé. Une fois signé, vous recevrez automatiquement votre exemplaire par email.</p>
        <p>Cordialement,<br/>${reservation.gite.name}</p>
      </div>
    `,
  });

  if (error) {
    console.error('Resend error:', error);
    return NextResponse.json({ error: "Erreur lors de l'envoi de l'email" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
