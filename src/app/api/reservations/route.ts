import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();

  let user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    user = await prisma.user.create({
      data: { clerkId: userId, email: body.userEmail ?? "" },
    });
  }

  let gite = await prisma.gite.findFirst({
    where: { userId: user.id },
    include: { options: true },
  });
  if (!gite) {
    gite = await prisma.gite.create({
      data: { name: "Mon Gîte", userId: user.id },
      include: { options: true },
    });
  }

  const selectedIds: string[] = Array.isArray(body.selectedOptionIds) ? body.selectedOptionIds : [];
  const selectedOptions = gite.options.filter(o => selectedIds.includes(o.id));

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
      checkIn: new Date(body.checkIn),
      checkOut: new Date(body.checkOut),
      rent: parseFloat(body.rent),
      deposit: parseFloat(body.deposit),
      cleaningFee: parseFloat(body.cleaningFee ?? 90),
      touristTax: parseFloat(body.touristTax ?? 1.32),
      notes: body.notes ?? "",
      reservationOptions: {
        create: selectedOptions.map(o => ({
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
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json([]);

  const reservations = await prisma.reservation.findMany({
    where: { gite: { userId: user.id } },
    include: { contract: true, reservationOptions: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reservations);
}
