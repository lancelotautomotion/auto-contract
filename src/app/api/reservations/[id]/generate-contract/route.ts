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
    include: { gite: true },
  });
  if (!reservation) return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });

  // Crée ou met à jour le contrat en statut GENERATING
  await prisma.contract.upsert({
    where: { reservationId: id },
    create: { reservationId: id, status: 'GENERATING' },
    update: { status: 'GENERATING' },
  });

  // Appel n8n si l'URL est configurée
  const webhookUrl = reservation.gite.n8nWebhookUrl ?? process.env.N8N_WEBHOOK_BASE_URL;
  if (webhookUrl) {
    const fmt = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservation_id: reservation.id,
          nom: reservation.clientLastName,
          prenom: reservation.clientFirstName,
          email: reservation.clientEmail,
          telephone: reservation.clientPhone,
          adresse: reservation.clientAddress,
          ville: reservation.clientCity,
          code_postal: reservation.clientZipCode,
          date_entree: fmt(reservation.checkIn),
          date_sortie: fmt(reservation.checkOut),
          loyer: reservation.rent,
          acompte: reservation.deposit,
          menage: reservation.cleaningFee,
          taxe_sejour: reservation.touristTax,
          bain_nordique: reservation.nordicBath,
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/n8n/callback`,
        }),
      });
    } catch (e) {
      console.error('n8n webhook error:', e);
      // On ne bloque pas si n8n est injoignable
    }
  }

  return NextResponse.json({ success: true });
}
