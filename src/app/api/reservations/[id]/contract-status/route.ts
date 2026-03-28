import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const contract = await prisma.contract.findFirst({
    where: { reservation: { id, gite: { userId: dbUser.id } } },
  });

  return NextResponse.json({
    contractStatus: contract?.status ?? null,
    emailStatus: contract?.emailStatus ?? null,
    signedAt: contract?.signedAt ?? null,
    signedByName: contract?.signedByName ?? null,
  });
}
