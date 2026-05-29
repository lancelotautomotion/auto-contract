import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSignedContractPdf, buildSignedContractFilename } from "@/lib/contractPdf";
import { requireAuth } from "@/lib/auth";
import { resolveReservationProperty, buildContractData } from "@/lib/reservationProperty";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ctx, err] = await requireAuth();
  if (err) return err;

  try {
    const reservation = await prisma.reservation.findFirst({
      where: { id, OR: [{ gite: { userId: ctx.userId } }, { guesthouse: { userId: ctx.userId } }] },
      include: {
        gite: { include: { user: true } },
        guesthouse: { include: { user: true } },
        reservationOptions: true,
        meals: true,
        contract: true,
      },
    });

    if (!reservation) return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
    if (!reservation.contract) return NextResponse.json({ error: "Aucun contrat" }, { status: 404 });
    if (reservation.contract.status !== "SIGNED") return NextResponse.json({ error: "Contrat non signé" }, { status: 400 });

    const property = resolveReservationProperty(reservation);
    if (!property) return NextResponse.json({ error: "Hébergement introuvable" }, { status: 404 });

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
    const data = buildContractData({ reservation, property });

    const pdfBuffer = await generateSignedContractPdf(data, {
      signedByName: reservation.contract.signedByName ?? "",
      signedAt: reservation.contract.signedAt ?? new Date(),
      signedByIp: reservation.contract.signedByIp ?? "inconnue",
      reservationId: reservation.id,
      managerName: property.user?.name?.trim() || property.name,
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
