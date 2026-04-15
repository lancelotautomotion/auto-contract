import { del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireGite } from "@/lib/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  const { docId } = await params;
  const [ctx, err] = await requireGite();
  if (err) return err;

  const doc = await prisma.giteDocument.findFirst({
    where: { id: docId, giteId: ctx.giteId },
  });
  if (!doc) return NextResponse.json({ error: "Document introuvable" }, { status: 404 });

  // Delete from Vercel Blob before removing the DB record
  try {
    await del(doc.fileUrl);
  } catch {
    // Non-fatal: file may already be gone from Blob
  }

  await prisma.giteDocument.delete({ where: { id: docId } });
  return NextResponse.json({ success: true });
}
