import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ctx, err] = await requireAuth();
  if (err) return err;

  try {
    const reservation = await prisma.reservation.findFirst({
      where: { id, gite: { userId: ctx.userId } },
    });

    if (!reservation) return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
    if (reservation.status !== "REFUSED") return NextResponse.json({ error: "Réservation non refusée" }, { status: 400 });

    await prisma.reservation.update({
      where: { id },
      data: { status: "PENDING_REVIEW", refusalReason: null, refusalNote: null },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[restore]", message);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
