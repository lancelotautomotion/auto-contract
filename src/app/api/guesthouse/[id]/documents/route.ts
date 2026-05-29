import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireGuesthouseById } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ctx, err] = await requireGuesthouseById(id);
  if (err) return err;

  const documents = await prisma.guesthouseDocument.findMany({
    where: { guesthouseId: ctx.guesthouseId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ documents });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ctx, err] = await requireGuesthouseById(id);
  if (err) return err;

  const body = await req.json();
  const { label, fileName, mimeType, fileUrl } = body;
  if (!label || !fileName || !mimeType || !fileUrl)
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });

  const doc = await prisma.guesthouseDocument.create({
    data: { label, fileName, mimeType, fileUrl, guesthouseId: ctx.guesthouseId },
  });
  return NextResponse.json(doc, { status: 201 });
}
