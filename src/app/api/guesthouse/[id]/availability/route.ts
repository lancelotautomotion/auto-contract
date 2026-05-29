import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireGuesthouseById } from "@/lib/auth";
import { buildRoomAvailability } from "@/lib/availability";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ctx, err] = await requireGuesthouseById(id);
  if (err) return err;

  const [rooms, reservations] = await Promise.all([
    prisma.room.findMany({
      where: { guesthouseId: ctx.guesthouseId },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    }),
    prisma.reservation.findMany({
      where: { guesthouseId: ctx.guesthouseId },
      include: { reservationRooms: true },
    }),
  ]);

  const availability = buildRoomAvailability(rooms, reservations);
  return NextResponse.json({ availability });
}
