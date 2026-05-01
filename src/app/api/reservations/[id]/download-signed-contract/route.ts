import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSignedContractPdf, ContractData, buildSignedContractFilename } from "@/lib/contractPdf";
import { DEFAULT_CONTRACT_TEMPLATE, mergeTemplates } from "@/lib/defaultContractTemplate";
import { requireAuth } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ctx, err] = await requireAuth();
  if (err) return err;

  try {
    const reservation = await prisma.reservation.findFirst({
      where: { id, gite: { userId: ctx.userId } },
      include: { gite: { include: { user: true } }, reservationOptions: true, contract: true },
    });

    if (!reservation) return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
    if (!reservation.contract) return NextResponse.json({ error: "Aucun contrat" }, { status: 404 });
    if (reservation.contract.status !== "SIGNED") return NextResponse.json({ error: "Contrat non signé" }, { status: 400 });

    const filename = buildSignedContractFilename({
      clientLastName: reservation.clientLastName,
      clientFirstName: reservation.clientFirstName,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
    });

    // Chantier 3: if the signed PDF was uploaded to Blob, redirect directly (no regeneration)
    if (reservation.contract.signedPdfUrl) {
      return NextResponse.redirect(reservation.contract.signedPdfUrl);
    }

    // Fallback for contracts signed before Blob migration: regenerate on demand
    const fmt = (d: Date) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

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

    const pdfBuffer = await generateSignedContractPdf(data, {
      signedByName: reservation.contract.signedByName ?? "",
      signedAt: reservation.contract.signedAt ?? new Date(),
      signedByIp: reservation.contract.signedByIp ?? "inconnue",
      reservationId: reservation.id,
      managerName: reservation.gite.user.name?.trim() || reservation.gite.name,
      managerSignedAt: reservation.contract.createdAt,
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("[download-signed-contract]", err);
    return NextResponse.json({ error: "Erreur lors de la génération du PDF" }, { status: 500 });
  }
}
