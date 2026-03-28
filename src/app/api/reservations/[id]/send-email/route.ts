import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const reservation = await prisma.reservation.findFirst({
    where: { id, gite: { userId: dbUser.id } },
    include: { contract: true, gite: true },
  });
  if (!reservation) return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
  if (reservation.contract?.status !== 'GENERATED') {
    return NextResponse.json({ error: "Le contrat doit d'abord être généré" }, { status: 400 });
  }

  await prisma.contract.update({
    where: { reservationId: id },
    data: { emailStatus: 'SENDING' },
  });

  const emailWebhookUrl = process.env.N8N_EMAIL_WEBHOOK_URL ?? reservation.gite.n8nWebhookUrl;
  if (emailWebhookUrl) {
    try {
      await fetch(emailWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservation_id: reservation.id,
          email: reservation.clientEmail,
          nom: reservation.clientLastName,
          prenom: reservation.clientFirstName,
          drive_file_url: reservation.contract?.driveFileUrl,
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/n8n/callback`,
        }),
      });
    } catch (e) {
      console.error('n8n email webhook error:', e);
    }
  }

  return NextResponse.json({ success: true });
}
