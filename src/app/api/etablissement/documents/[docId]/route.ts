import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ docId: string }> }) {
  const { docId } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });

  const doc = await prisma.giteDocument.findFirst({
    where: { id: docId, gite: { userId: dbUser.id } },
  });
  if (!doc) return NextResponse.json({ error: 'Document introuvable' }, { status: 404 });

  await prisma.giteDocument.delete({ where: { id: docId } });
  return NextResponse.json({ success: true });
}
