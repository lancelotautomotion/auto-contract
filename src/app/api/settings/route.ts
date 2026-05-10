import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireGiteById } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [ctx, err] = await requireGiteById(body.giteId);
  if (err) return err;

  const updated = await prisma.gite.update({
    where: { id: ctx.giteId },
    data: {
      notificationEmail: body.notificationEmail ?? null,
      ...(typeof body.notifNewReservation === 'boolean' && { notifNewReservation: body.notifNewReservation }),
      ...(typeof body.notifContractSigned === 'boolean' && { notifContractSigned: body.notifContractSigned }),
      ...(typeof body.notifPrysmNews === 'boolean' && { notifPrysmNews: body.notifPrysmNews }),
    },
  });

  return NextResponse.json(updated, { status: 200 });
}
