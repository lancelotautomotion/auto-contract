import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ctx, err] = await requireAuth();
  if (err) return err;

  const contract = await prisma.contract.findFirst({
    where: { reservation: { id, gite: { userId: ctx.userId } } },
  });

  return NextResponse.json({
    contractStatus: contract?.status ?? null,
    emailStatus: contract?.emailStatus ?? null,
    signedAt: contract?.signedAt ?? null,
    signedByName: contract?.signedByName ?? null,
    depositReceived: contract?.depositReceived ?? false,
  });
}
