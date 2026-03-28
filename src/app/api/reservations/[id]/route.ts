import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const existing = await prisma.reservation.findFirst({
    where: { id, gite: { userId: dbUser.id } },
  });
  if (!existing) return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });

  const body = await req.json();

  const gite = await prisma.gite.findFirst({
    where: { userId: dbUser.id },
    include: { options: true },
  });

  const selectedIds: string[] = Array.isArray(body.selectedOptionIds) ? body.selectedOptionIds : [];
  const selectedOptions = gite?.options.filter(o => selectedIds.includes(o.id)) ?? [];

  const updated = await prisma.reservation.update({
    where: { id },
    data: {
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
        deleteMany: {},
        create: selectedOptions.map(o => ({
          label: o.label,
          price: o.price,
          giteOptionId: o.id,
        })),
      },
    },
  });

  return NextResponse.json(updated);
}
