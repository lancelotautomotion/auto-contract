import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateContractPdf } from '@/lib/contractPdf';
import { resolveReservationProperty, buildContractData } from '@/lib/reservationProperty';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  try {
    const contract = await prisma.contract.findUnique({
      where: { signatureToken: token },
      include: {
        reservation: {
          include: { gite: true, guesthouse: true, reservationOptions: true, meals: true, reservationRooms: { include: { room: true } } },
        },
      },
    });

    if (!contract || !contract.reservation) {
      console.error('[preview] Contract not found for token:', token?.slice(0, 8));
      return NextResponse.json({ error: 'Lien invalide' }, { status: 404 });
    }

    const { reservation } = contract;
    const property = resolveReservationProperty(reservation);
    if (!property) return NextResponse.json({ error: 'Hébergement introuvable' }, { status: 404 });

    const data = buildContractData({ reservation, property });

    const pdfBuffer = await generateContractPdf(data);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Cache-Control': 'private, max-age=300',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[preview] Error:', message, err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
