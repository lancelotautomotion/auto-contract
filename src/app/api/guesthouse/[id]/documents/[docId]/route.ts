import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireGuesthouseById } from "@/lib/auth";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; docId: string }> }) {
  const { id, docId } = await params;
  const [ctx, err] = await requireGuesthouseById(id);
  if (err) return err;

  const doc = await prisma.guesthouseDocument.findFirst({ where: { id: docId, guesthouseId: ctx.guesthouseId } });
  if (!doc) return NextResponse.json({ error: "Document introuvable" }, { status: 404 });

  await prisma.guesthouseDocument.delete({ where: { id: docId } });
  return NextResponse.json({ success: true });
}
