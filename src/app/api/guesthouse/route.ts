import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const [ctx, err] = await requireAuth();
  if (err) return err;

  const guesthouses = await prisma.guesthouse.findMany({
    where: { userId: ctx.userId, deletedAt: null },
    select: { id: true, name: true, createdAt: true, _count: { select: { rooms: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ guesthouses });
}

export async function POST(req: NextRequest) {
  const [ctx, err] = await requireAuth();
  if (err) return err;

  const body = await req.json();
  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });

  const guesthouse = await prisma.guesthouse.create({
    data: {
      userId: ctx.userId,
      name,
      address: body.address ?? null,
      city: body.city ?? null,
      zipCode: body.zipCode ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,
      touristTax: typeof body.touristTax === "number" ? body.touristTax : parseFloat(body.touristTax ?? "1") || 1,
    },
    select: { id: true, name: true },
  });

  return NextResponse.json({ guesthouse }, { status: 201 });
}
