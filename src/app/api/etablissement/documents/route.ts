import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { label, fileName, mimeType, fileDataUrl } = await req.json();
  if (!label || !fileName || !mimeType || !fileDataUrl) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });

  const gite = await prisma.gite.findFirst({ where: { userId: dbUser.id } });
  if (!gite) return NextResponse.json({ error: 'Gîte introuvable' }, { status: 404 });

  const doc = await prisma.giteDocument.create({
    data: { label, fileName, mimeType, fileDataUrl, giteId: gite.id },
  });

  return NextResponse.json(doc, { status: 201 });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return NextResponse.json([], { status: 200 });

  const gite = await prisma.gite.findFirst({ where: { userId: dbUser.id } });
  if (!gite) return NextResponse.json([], { status: 200 });

  const docs = await prisma.giteDocument.findMany({
    where: { giteId: gite.id },
    orderBy: { createdAt: 'asc' },
    select: { id: true, label: true, fileName: true, mimeType: true, createdAt: true },
  });

  return NextResponse.json(docs);
}
