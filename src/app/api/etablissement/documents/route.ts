import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireGite } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const [ctx, err] = await requireGite();
  if (err) return err;

  const { label, fileName, mimeType, fileUrl } = await req.json();
  if (!label || !fileName || !mimeType || !fileUrl)
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });

  const doc = await prisma.giteDocument.create({
    data: { label, fileName, mimeType, fileUrl, giteId: ctx.giteId },
  });

  return NextResponse.json(doc, { status: 201 });
}

export async function GET() {
  const [ctx, err] = await requireGite();
  if (err) return err;

  const docs = await prisma.giteDocument.findMany({
    where: { giteId: ctx.giteId },
    orderBy: { createdAt: "asc" },
    select: { id: true, label: true, fileName: true, mimeType: true, createdAt: true },
  });

  return NextResponse.json(docs);
}
