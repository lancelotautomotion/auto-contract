import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireGuesthouseById } from "@/lib/auth";
import { isValidSlug, slugError } from "@/lib/slug";

// GET /api/guesthouse/[id]/rooms/check-slug?slug=foo&excludeRoomId=...
// Vérifie qu'un slug de chambre est libre au sein de la maison d'hôtes courante.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ctx, err] = await requireGuesthouseById(id);
  if (err) return err;

  const slug = (req.nextUrl.searchParams.get("slug") ?? "").trim();
  const excludeRoomId = req.nextUrl.searchParams.get("excludeRoomId") ?? "";

  const fmtError = slugError(slug);
  if (fmtError) {
    return NextResponse.json({ available: false, reason: fmtError });
  }
  if (!isValidSlug(slug)) {
    return NextResponse.json({ available: false, reason: "Identifiant invalide." });
  }

  const existing = await prisma.room.findFirst({
    where: {
      guesthouseId: ctx.guesthouseId,
      slug,
      ...(excludeRoomId ? { NOT: { id: excludeRoomId } } : {}),
    },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({ available: false, reason: "Cet identifiant est déjà pris dans cette maison d'hôtes." });
  }
  return NextResponse.json({ available: true });
}
