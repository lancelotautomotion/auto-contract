import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireGuesthouseById } from "@/lib/auth";
import { MAX_ROOMS, MAX_GUESTHOUSE_CAPACITY } from "@/lib/billing";

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

  const room = await prisma.room.create({
    data: {
      guesthouseId: ctx.guesthouseId,
      name,
      capacity,
      basePrice,
      active: body.active === false ? false : true,
      position: existing.length,
    },
  });

  // Alerte non bloquante si la capacité totale dépasse le plafond légal de 15 personnes.
  const totalCapacity = existing.reduce((sum, r) => sum + r.capacity, 0) + capacity;
  const warning = totalCapacity > MAX_GUESTHOUSE_CAPACITY
    ? `La capacité totale (${totalCapacity} personnes) dépasse le plafond légal de ${MAX_GUESTHOUSE_CAPACITY} personnes pour une maison d'hôtes.`
    : null;

  return NextResponse.json({ room, warning }, { status: 201 });
}
