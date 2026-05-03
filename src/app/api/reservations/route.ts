import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActivePlan } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const [ctx, err] = await requireActivePlan();
  if (err) return err;

  const body = await req.json();

  let gite = await prisma.gite.findFirst({
    where: { userId: ctx.userId },
    include: { options: true },
  });
  if (!gite) {
    gite = await prisma.gite.create({
      data: { name: "Mon Gîte", userId: ctx.userId },
      include: { options: true },
    });
  }

  const checkIn = new Date(body.checkIn);
  const checkOut = new Date(body.checkOut);
  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()))
    return NextResponse.json({ error: "Dates invalides" }, { status: 400 });
  if (checkOut <= checkIn)
    return NextResponse.json({ error: "La date de départ doit être après l'arrivée" }, { status: 400 });

  const rent = parseFloat(body.rent);
  const deposit = parseFloat(body.deposit);
  const cleaningFee = parseFloat(body.cleaningFee ?? 90);
  const touristTax = parseFloat(body.touristTax ?? 1.32);
  if (isNaN(rent) || rent < 0) return NextResponse.json({ error: "Loyer invalide" }, { status: 400 });
  if (isNaN(deposit) || deposit < 0) return NextResponse.json({ error: "Acompte invalide" }, { status: 400 });

  const selectedIds: string[] = Array.isArray(body.selectedOptionIds) ? body.selectedOptionIds : [];
  const selectedOptions = gite.options.filter((o) => selectedIds.includes(o.id));

  const reservation = await prisma.reservation.create({
    data: {
      giteId: gite.id,
      clientFirstName: body.clientFirstName,
      clientLastName: body.clientLastName,
      clientEmail: body.clientEmail,
      clientPhone: body.clientPhone,
      clientAddress: body.clientAddress ?? "",
      clientCity: body.clientCity ?? "",
      clientZipCode: body.clientZipCode ?? "",
      checkIn,
      checkOut,
      rent,
      deposit,
      cleaningFee: isNaN(cleaningFee) ? 90 : cleaningFee,
      touristTax: isNaN(touristTax) ? 1.32 : touristTax,
      notes: body.notes ?? "",
      reservationOptions: {
        create: selectedOptions.map((o) => ({
          label: o.label,
          price: o.price,
          giteOptionId: o.id,
        })),
      },
    },
  });

  return NextResponse.json(reservation, { status: 201 });
}

export async function GET() {
  const [ctx, err] = await requireActivePlan();
  if (err) return err;

  const reservations = await prisma.reservation.findMany({
    where: { gite: { userId: ctx.userId } },
    include: { contract: true, reservationOptions: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reservations);
}
