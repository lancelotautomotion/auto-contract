import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const existing = await prisma.reservation.findFirst({
    where: { id, gite: { userId: dbUser.id }, status: 'PENDING_REVIEW' },
  });
  if (!existing) return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });

  const body = await req.json();

  const updated = await prisma.reservation.update({
    where: { id },
    data: {
      status: 'NEW',
      checkIn: new Date(body.checkIn),
      checkOut: new Date(body.checkOut),
      rent: parseFloat(body.rent),
      deposit: parseFloat(body.deposit),
      cleaningFee: parseFloat(body.cleaningFee ?? 90),
      touristTax: parseFloat(body.touristTax ?? 1.32),
      notes: body.notes ?? existing.notes ?? "",
    },
  });

  return NextResponse.json(updated);
}
