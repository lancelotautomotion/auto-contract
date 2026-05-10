import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const [ctx, err] = await requireAuth();
  if (err) return err;

  const gites = await prisma.gite.findMany({
    where: { userId: ctx.userId },
    select: { id: true, name: true, slug: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ gites });
}

export async function POST(req: NextRequest) {
  const [ctx, err] = await requireAuth();
  if (err) return err;

  const user = await prisma.user.findUnique({
    where: { id: ctx.userId },
    select: { planStatus: true, planTier: true, trialEndsAt: true },
  });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const giteCount = await prisma.gite.count({ where: { userId: ctx.userId } });

  // Admin bypass: skip all plan guards
  const { sessionClaims } = await auth();
  const isAdmin = (sessionClaims?.metadata as Record<string, unknown> | undefined)?.role === "admin";

  if (!isAdmin) {
    const isEssential = user.planTier === "essential";
    const isMulti = user.planTier === "multi";

    if (isEssential && giteCount >= 1) {
      return NextResponse.json(
        { error: "Plan Essentiel limité à 1 hébergement", code: "UPGRADE_REQUIRED" },
        { status: 402 }
      );
    }
    if (isMulti && giteCount >= 3) {
      return NextResponse.json(
        { error: "Plan Multi-Gîtes limité à 3 hébergements", code: "MAX_REACHED" },
        { status: 402 }
      );
    }
  }

  const body = await req.json();
  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });

  const gite = await prisma.gite.create({
    data: {
      userId: ctx.userId,
      name,
      address: body.address ?? null,
      city: body.city ?? null,
      zipCode: body.zipCode ?? null,
      capacity: parseInt(body.capacity ?? "12") || 12,
    },
    select: { id: true, name: true, slug: true },
  });

  return NextResponse.json({ gite }, { status: 201 });
}
