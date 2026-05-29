import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireGuesthouseById } from "@/lib/auth";
import { MAX_GUESTHOUSE_CAPACITY } from "@/lib/billing";

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
  if ("active" in body) data.active = !!body.active;
  if ("position" in body) data.position = parseInt(body.position) || 0;

  const updated = await prisma.room.update({ where: { id: roomId }, data });

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
