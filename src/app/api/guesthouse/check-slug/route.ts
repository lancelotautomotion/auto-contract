import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { isValidSlug, slugError } from "@/lib/slug";

// GET /api/guesthouse/check-slug?slug=foo&excludeId=cmpre...
// Vérifie qu'un slug d'établissement est libre (collision contre Gite ET Guesthouse).
export async function GET(req: NextRequest) {
  const [, err] = await requireAuth();
  if (err) return err;

  const slug = (req.nextUrl.searchParams.get("slug") ?? "").trim();
  const excludeId = req.nextUrl.searchParams.get("excludeId") ?? "";

  const fmtError = slugError(slug);
  if (fmtError) {
    return NextResponse.json({ available: false, reason: fmtError });
  }
  if (!isValidSlug(slug)) {
    return NextResponse.json({ available: false, reason: "Identifiant invalide." });
  }

  const [gite, gh] = await Promise.all([
    prisma.gite.findFirst({ where: { slug, deletedAt: null }, select: { id: true } }),
    prisma.guesthouse.findFirst({
      where: { slug, deletedAt: null, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    }),
  ]);

  if (gite || gh) {
    return NextResponse.json({ available: false, reason: "Cet identifiant est déjà pris." });
  }
  return NextResponse.json({ available: true });
}
