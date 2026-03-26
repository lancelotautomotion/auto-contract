import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// n8n appelle cette route quand le contrat est généré ou l'email envoyé
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret');
  if (process.env.N8N_WEBHOOK_SECRET && secret !== process.env.N8N_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const body = await req.json();
  const { reservation_id, event, drive_file_id, drive_file_url } = body;

  if (!reservation_id || !event) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
  }

  if (event === 'contract_generated') {
    await prisma.contract.upsert({
      where: { reservationId: reservation_id },
      create: { reservationId: reservation_id, status: 'GENERATED', driveFileId: drive_file_id, driveFileUrl: drive_file_url },
      update: { status: 'GENERATED', driveFileId: drive_file_id, driveFileUrl: drive_file_url },
    });
  }

  if (event === 'email_sent') {
    await prisma.contract.update({
      where: { reservationId: reservation_id },
      data: { emailStatus: 'SENT', emailSentAt: new Date() },
    });
  }

  return NextResponse.json({ success: true });
}
