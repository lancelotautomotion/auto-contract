import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireGiteById, requireGite } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();

  let resolvedGiteId: string;
  if (body.giteId) {
    const [ctx, err] = await requireGiteById(body.giteId);
    if (err) return err;
    resolvedGiteId = ctx.giteId;
  } else {
    const [ctx, err] = await requireGite();
    if (err) return err;
    resolvedGiteId = ctx.giteId;
  }

  const { label, fileName, mimeType, fileUrl } = body;
  if (!label || !fileName || !mimeType || !fileUrl)
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });

  const doc = await prisma.giteDocument.create({
    data: { label, fileName, mimeType, fileUrl, giteId: resolvedGiteId },
  });

  return NextResponse.json(doc, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const giteId = searchParams.get("giteId") ?? "";

  let resolvedGiteId: string;
  if (giteId) {
    const [ctx, err] = await requireGiteById(giteId);
    if (err) return err;
    resolvedGiteId = ctx.giteId;
  } else {
    const [ctx, err] = await requireGite();
    if (err) return err;
    resolvedGiteId = ctx.giteId;
  }

  const docs = await prisma.giteDocument.findMany({
    where: { giteId: resolvedGiteId },
    orderBy: { createdAt: "asc" },
    select: { id: true, label: true, fileName: true, mimeType: true, createdAt: true },
  });

  return NextResponse.json(docs);
}
