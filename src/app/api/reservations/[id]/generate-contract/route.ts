import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateContractPdf, DEFAULT_CONTRACT_TEMPLATE, ContractData } from "@/lib/contractPdf";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const reservation = await prisma.reservation.findFirst({
    where: { id, gite: { userId: dbUser.id } },
    include: { gite: true, reservationOptions: true },
  });
  if (!reservation) return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });

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
    email_gite: reservation.gite.email,
    telephone_gite: reservation.gite.phone,
  };

  const pdfBuffer = await generateContractPdf(data);

  // Upsert le contrat avec le PDF en base64
  await prisma.contract.upsert({
    where: { reservationId: id },
    create: { reservationId: id, status: 'GENERATED', driveFileUrl: null },
    update: { status: 'GENERATED' },
  });

  // Retourne le PDF directement en réponse
  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="contrat-${reservation.clientLastName}-${reservation.clientFirstName}.pdf"`,
    },
  });
}
