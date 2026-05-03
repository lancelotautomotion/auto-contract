import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateContractPdf, ContractData } from "@/lib/contractPdf";
import { DEFAULT_CONTRACT_TEMPLATE, mergeTemplates } from "@/lib/defaultContractTemplate";
import { requireActivePlan } from "@/lib/auth";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ctx, err] = await requireActivePlan();
  if (err) return err;

  const reservation = await prisma.reservation.findFirst({
    where: { id, gite: { userId: ctx.userId } },
    include: { gite: true, reservationOptions: true },
  });
  if (!reservation) return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });

  const fmt = (d: Date) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

  const data: ContractData = {
    template: mergeTemplates(reservation.gite.contractTemplateGeneral ?? DEFAULT_CONTRACT_TEMPLATE, reservation.gite.contractTemplateHouseRules),
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
    options: reservation.reservationOptions.map((o) => ({ label: o.label, price: o.price })),
    nom_gite: reservation.gite.name,
    adresse_gite: reservation.gite.address,
    ville_gite: reservation.gite.city,
    code_postal_gite: reservation.gite.zipCode,
    email_gite: reservation.gite.email,
    telephone_gite: reservation.gite.phone,
    logoUrl: reservation.gite.logoUrl,
  };

  const pdfBuffer = await generateContractPdf(data);

  const existingContract = await prisma.contract.findUnique({ where: { reservationId: id } });
  if (existingContract?.status !== 'SIGNED') {
    await prisma.contract.upsert({
      where: { reservationId: id },
      create: { reservationId: id, status: "GENERATED", driveFileUrl: null },
      update: { status: "GENERATED" },
    });
  }

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="contrat-${reservation.clientLastName}-${reservation.clientFirstName}.pdf"`,
    },
  });
}
