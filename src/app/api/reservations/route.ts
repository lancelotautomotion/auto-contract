import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();

  // Récupère ou crée l'utilisateur en DB
  let user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    user = await prisma.user.create({
      data: { clerkId: userId, email: body.userEmail ?? "" },
    });
  }

  // Récupère ou crée le gîte par défaut
  let gite = await prisma.gite.findFirst({ where: { userId: user.id } });
  if (!gite) {
    gite = await prisma.gite.create({
      data: { name: "Mon Gîte", userId: user.id },
    });
  }

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
      nordicBath: body.nordicBath === true,
      sheet160: body.sheet160 === true,
      sheet90: body.sheet90 === true,
      towels: body.towels === true,
      notes: body.notes ?? "",
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
    include: { contract: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reservations);
}
