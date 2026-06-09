import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { MAX_GITES, syncEssentialSubscriptionQuantity } from "@/lib/stripe";

export async function GET() {
  const [ctx, err] = await requireAuth();
  if (err) return err;

  const gites = await prisma.gite.findMany({
    where: { userId: ctx.userId, deletedAt: null },
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
    select: { planStatus: true, planTier: true, trialEndsAt: true, stripeSubscriptionId: true },
  });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const giteCount = await prisma.gite.count({ where: { userId: ctx.userId, deletedAt: null } });

  // Admin bypass: skip all plan guards
  const { sessionClaims } = await auth();
  const isAdmin = (sessionClaims?.metadata as Record<string, unknown> | undefined)?.role === "admin";

  // Le plan Essentiel couvre jusqu'à 5 hébergements entiers
  // (10 €/mois pour 1, puis 20 €/mois de 2 à 5).
  if (!isAdmin && giteCount >= MAX_GITES) {
    return NextResponse.json(
      { error: `Plan Essentiel limité à ${MAX_GITES} hébergements`, code: "MAX_REACHED" },
      { status: 402 }
    );
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

  // Aligne la facturation Stripe sur le nouveau nombre d'hébergements
  // (palier 20 € dès le 2e). Best-effort, n'empêche pas la création.
  if (user.planStatus === "ACTIVE" && user.stripeSubscriptionId) {
    await syncEssentialSubscriptionQuantity(user.stripeSubscriptionId, giteCount + 1);
  }

  return NextResponse.json({ gite }, { status: 201 });
}
