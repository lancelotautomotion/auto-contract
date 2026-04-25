import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const gite = await prisma.gite.findFirst({ where: { userId: user.id } });
  if (!gite) return NextResponse.json({ error: "Gîte introuvable" }, { status: 404 });

  const updated = await prisma.gite.update({
    where: { id: gite.id },
    data: {
      notificationEmail: body.notificationEmail ?? null,
      ...(typeof body.notifNewReservation === 'boolean' && { notifNewReservation: body.notifNewReservation }),
      ...(typeof body.notifContractSigned === 'boolean' && { notifContractSigned: body.notifContractSigned }),
      ...(typeof body.notifPrysmNews === 'boolean' && { notifPrysmNews: body.notifPrysmNews }),
    },
  });

  return NextResponse.json(updated, { status: 200 });
}
