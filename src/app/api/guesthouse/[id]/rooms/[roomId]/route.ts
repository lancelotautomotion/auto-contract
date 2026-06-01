import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireGuesthouseById } from "@/lib/auth";
import { MAX_GUESTHOUSE_CAPACITY } from "@/lib/billing";
import { isValidSlug, slugError } from "@/lib/slug";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; roomId: string }> }) {
  const { id, roomId } = await params;
  const [ctx, err] = await requireGuesthouseById(id);
  if (err) return err;

  const room = await prisma.room.findFirst({ where: { id: roomId, guesthouseId: ctx.guesthouseId } });
  if (!room) return NextResponse.json({ error: "Chambre introuvable" }, { status: 404 });

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if ("name" in body) {
    const name = String(body.name ?? "").trim();
    if (!name) return NextResponse.json({ error: "Le nom de la chambre est requis" }, { status: 400 });
    data.name = name;
  }
  if ("capacity" in body) data.capacity = parseInt(body.capacity) || 0;
  if ("basePrice" in body) data.basePrice = parseFloat(body.basePrice) || 0;
  if ("cleaningFee" in body) data.cleaningFee = parseFloat(body.cleaningFee) || 0;
  if ("active" in body) data.active = !!body.active;
  if ("position" in body) data.position = parseInt(body.position) || 0;
  if ("specificClauses" in body) {
    const v = body.specificClauses;
    if (v === null || v === "") {
      data.specificClauses = null;
    } else {
      const s = String(v);
      if (s.length > 5000) return NextResponse.json({ error: "Texte trop long (max 5000 caractères)" }, { status: 400 });
      data.specificClauses = s;
    }
  }

  // Slug : optionnel, unique par maison d'hôtes
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
      const colliding = await prisma.room.findFirst({
        where: { guesthouseId: ctx.guesthouseId, slug: s, NOT: { id: roomId } },
        select: { id: true },
      });
      if (colliding) {
        return NextResponse.json({ error: "Cet identifiant est déjà pris dans cette maison d'hôtes." }, { status: 409 });
      }
      data.slug = s;
    }
  }

  let updated;
  try {
    updated = await prisma.room.update({ where: { id: roomId }, data });
  } catch (e) {
    const code = (e as { code?: string })?.code;
    if (code === "P2002") {
      return NextResponse.json({ error: "Cet identifiant est déjà pris dans cette maison d'hôtes." }, { status: 409 });
    }
    throw e;
  }

  // Alerte non bloquante sur le plafond légal de capacité.
  const rooms = await prisma.room.findMany({ where: { guesthouseId: ctx.guesthouseId } });
  const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
  const warning = totalCapacity > MAX_GUESTHOUSE_CAPACITY
    ? `La capacité totale (${totalCapacity} personnes) dépasse le plafond légal de ${MAX_GUESTHOUSE_CAPACITY} personnes pour une maison d'hôtes.`
    : null;

  return NextResponse.json({ room: updated, warning });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; roomId: string }> }) {
  const { id, roomId } = await params;
  const [ctx, err] = await requireGuesthouseById(id);
  if (err) return err;

  const room = await prisma.room.findFirst({ where: { id: roomId, guesthouseId: ctx.guesthouseId } });
  if (!room) return NextResponse.json({ error: "Chambre introuvable" }, { status: 404 });

  // Hard delete : ReservationRoom.roomId passe à NULL (onDelete: SetNull),
  // les réservations passées conservent leur snapshot (roomName, price).
  await prisma.room.delete({ where: { id: roomId } });

  return NextResponse.json({ success: true });
}
