import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireGuesthouseById } from "@/lib/auth";
import { MAX_ROOMS, MAX_GUESTHOUSE_CAPACITY } from "@/lib/billing";
import { isValidSlug, slugError, suggestSlug } from "@/lib/slug";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ctx, err] = await requireGuesthouseById(id);
  if (err) return err;

  const rooms = await prisma.room.findMany({
    where: { guesthouseId: ctx.guesthouseId },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ rooms });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ctx, err] = await requireGuesthouseById(id);
  if (err) return err;

  const existing = await prisma.room.findMany({ where: { guesthouseId: ctx.guesthouseId } });

  // Validation légale : une maison d'hôtes compte au maximum 5 chambres.
  if (existing.length >= MAX_ROOMS) {
    return NextResponse.json(
      { error: `Une maison d'hôtes est limitée à ${MAX_ROOMS} chambres.`, code: "MAX_ROOMS" },
      { status: 422 }
    );
  }

  const body = await req.json();
  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Le nom de la chambre est requis" }, { status: 400 });

  const capacity = parseInt(body.capacity) || 2;
  const basePrice = parseFloat(body.basePrice) || 0;

  // Slug : explicite, ou auto-suggéré depuis le nom. Vide accepté (chambre non réservable en ligne).
  let slug: string | null = null;
  const rawSlug = body.slug;
  if (typeof rawSlug === "string" && rawSlug.trim()) {
    const s = rawSlug.trim().toLowerCase();
    const fmt = slugError(s);
    if (fmt || !isValidSlug(s)) return NextResponse.json({ error: fmt ?? "Identifiant invalide." }, { status: 400 });
    slug = s;
  } else {
    const suggested = suggestSlug(name);
    if (suggested && isValidSlug(suggested)) slug = suggested;
  }

  // Si le slug suggéré (ou fourni) entre en collision, on n'erreur pas à la création : on annule simplement le slug.
  if (slug) {
    const colliding = await prisma.room.findFirst({
      where: { guesthouseId: ctx.guesthouseId, slug },
      select: { id: true },
    });
    if (colliding) {
      if (typeof rawSlug === "string" && rawSlug.trim()) {
        return NextResponse.json({ error: "Cet identifiant est déjà pris dans cette maison d'hôtes." }, { status: 409 });
      }
      slug = null;
    }
  }

  let room;
  try {
    room = await prisma.room.create({
      data: {
        guesthouseId: ctx.guesthouseId,
        name,
        capacity,
        basePrice,
        slug,
        active: body.active === false ? false : true,
        position: existing.length,
      },
    });
  } catch (e) {
    const code = (e as { code?: string })?.code;
    if (code === "P2002") {
      return NextResponse.json({ error: "Cet identifiant est déjà pris dans cette maison d'hôtes." }, { status: 409 });
    }
    throw e;
  }

  // Alerte non bloquante si la capacité totale dépasse le plafond légal de 15 personnes.
  const totalCapacity = existing.reduce((sum, r) => sum + r.capacity, 0) + capacity;
  const warning = totalCapacity > MAX_GUESTHOUSE_CAPACITY
    ? `La capacité totale (${totalCapacity} personnes) dépasse le plafond légal de ${MAX_GUESTHOUSE_CAPACITY} personnes pour une maison d'hôtes.`
    : null;

  return NextResponse.json({ room, warning }, { status: 201 });
}
