import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireGuesthouseById } from "@/lib/auth";
import { isValidSlug, slugError } from "@/lib/slug";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ctx, err] = await requireGuesthouseById(id);
  if (err) return err;

  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const field of ["name", "address", "city", "zipCode", "email", "phone", "contractTemplateGeneral", "contractTemplateHouseRules", "logoUrl"] as const) {
    if (field in body) data[field] = body[field];
  }
  if ("touristTax" in body) data.touristTax = parseFloat(body.touristTax) || 0;
  if ("capacity" in body) data.capacity = parseInt(body.capacity) || 0;
  if ("tableDhotesCapacity" in body) data.tableDhotesCapacity = Math.max(0, parseInt(body.tableDhotesCapacity) || 0);
  if ("defaultDepositPercentage" in body) {
    const pct = parseFloat(body.defaultDepositPercentage);
    data.defaultDepositPercentage = Math.min(100, Math.max(0, isNaN(pct) ? 30 : pct));
  }
  if (typeof data.name === "string" && !data.name.trim())
    return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });

  // Slug d'établissement : optionnel, mais s'il est fourni il doit être valide ET unique
  // contre Gite.slug ET Guesthouse.slug (espace de nommage partagé sous /book/<slug>).
  if ("slug" in body) {
    const raw = body.slug;
    if (raw === null || raw === "") {
      data.slug = null;
    } else {
      const s = String(raw).trim().toLowerCase();
      const fmt = slugError(s);
      if (fmt || !isValidSlug(s)) {
        return NextResponse.json({ error: fmt ?? "Identifiant invalide." }, { status: 400 });
      }
      const [collidingGite, collidingGh] = await Promise.all([
        prisma.gite.findFirst({ where: { slug: s, deletedAt: null }, select: { id: true } }),
        prisma.guesthouse.findFirst({ where: { slug: s, deletedAt: null, NOT: { id: ctx.guesthouseId } }, select: { id: true } }),
      ]);
      if (collidingGite || collidingGh) {
        return NextResponse.json({ error: "Cet identifiant est déjà pris." }, { status: 409 });
      }
      data.slug = s;
    }
  }

  try {
    const guesthouse = await prisma.guesthouse.update({
      where: { id: ctx.guesthouseId },
      data,
      select: { id: true, name: true, slug: true },
    });
    return NextResponse.json({ guesthouse });
  } catch (e) {
    const code = (e as { code?: string })?.code;
    if (code === "P2002") {
      return NextResponse.json({ error: "Cet identifiant est déjà pris." }, { status: 409 });
    }
    throw e;
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ctx, err] = await requireGuesthouseById(id);
  if (err) return err;

  // Soft delete : conserve les archives (réservations / contrats) comme pour le Gîte.
  await prisma.guesthouse.update({
    where: { id: ctx.guesthouseId },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
