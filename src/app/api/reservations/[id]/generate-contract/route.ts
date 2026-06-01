import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateContractPdf } from "@/lib/contractPdf";
import { requireActivePlanAny } from "@/lib/auth";
import { resolveReservationProperty, buildContractData } from "@/lib/reservationProperty";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ctx, err] = await requireActivePlanAny();
  if (err) return err;

  const reservation = await prisma.reservation.findFirst({
    where: { id, OR: [{ gite: { userId: ctx.userId } }, { guesthouse: { userId: ctx.userId } }] },
    include: { gite: true, guesthouse: true, reservationOptions: true, meals: true, reservationRooms: { include: { room: true } } },
  });
  if (!reservation) return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });

  const property = resolveReservationProperty(reservation);
  if (!property) return NextResponse.json({ error: "Hébergement introuvable" }, { status: 404 });

  const data = buildContractData({ reservation, property });

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
