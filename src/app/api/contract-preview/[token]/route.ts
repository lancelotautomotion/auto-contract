import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateContractPdf, ContractData } from '@/lib/contractPdf';
import { DEFAULT_CONTRACT_TEMPLATE } from '@/lib/defaultContractTemplate';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  try {
    const contract = await prisma.contract.findUnique({
      where: { signatureToken: token },
      include: {
        reservation: {
          include: { gite: true, reservationOptions: true },
        },
      },
    });

    if (!contract || !contract.reservation) {
      console.error('[preview] Contract not found for token:', token?.slice(0, 8));
      return NextResponse.json({ error: 'Lien invalide' }, { status: 404 });
    }

    const { reservation } = contract;
    const fmt = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const data: ContractData = {
      template: reservation.gite.contractTemplate ?? DEFAULT_CONTRACT_TEMPLATE,
      nom_client: reservation.clientLastName,
      prenom_client: reservation.clientFirstName,
      email_client: reservation.clientEmail,
      telephone_client: reservation.clientPhone,
      adresse_client: reservation.clientAddress,
      ville_client: reservation.clientCity,
      code_postal_client: reservation.clientZipCode,
      date_entree: fmt(reservation.checkIn),
      date_sortie: fmt(reservation.checkOut),
      loyer: reservation.rent ?? 0,
      acompte: reservation.deposit ?? 0,
      menage: reservation.cleaningFee ?? 0,
      taxe_sejour: reservation.touristTax ?? 0,
      options: reservation.reservationOptions.map(o => ({ label: o.label, price: o.price })),
      nom_gite: reservation.gite.name,
      adresse_gite: reservation.gite.address,
      ville_gite: reservation.gite.city,
      code_postal_gite: reservation.gite.zipCode,
      email_gite: reservation.gite.email,
      telephone_gite: reservation.gite.phone,
      logoUrl: reservation.gite.logoUrl,
    };

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
    return NextResponse.json({ error: 'Erreur interne', detail: message }, { status: 500 });
  }
}
