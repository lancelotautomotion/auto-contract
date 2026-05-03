/**
 * Centralized auth helpers — single point of contact with Clerk.
 * Never import from "@clerk/nextjs/server" directly in route handlers;
 * use these helpers instead. This makes a future migration to Auth.js
 * a one-file change.
 */
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTrialInfo } from "@/lib/trial";

type AuthErr = NextResponse;
export type AuthCtx = { userId: string };
export type GiteCtx = AuthCtx & { giteId: string };

/**
 * Resolves the authenticated DB user.
 * Returns [ctx, null] on success, [null, errorResponse] on failure.
 */
export async function requireAuth(): Promise<[AuthCtx, null] | [null, AuthErr]> {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return [null, NextResponse.json({ error: "Non autorisé" }, { status: 401 })];

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user)
    return [null, NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 })];

  return [{ userId: user.id }, null];
}

/**
 * Resolves the authenticated DB user AND their Gite.
 * All route handlers that operate on tenant data should use this.
 */
export async function requireGite(): Promise<[GiteCtx, null] | [null, AuthErr]> {
  const [ctx, err] = await requireAuth();
  if (err) return [null, err];

  const gite = await prisma.gite.findFirst({ where: { userId: ctx.userId } });
  if (!gite)
    return [null, NextResponse.json({ error: "Gîte introuvable" }, { status: 404 })];

  return [{ userId: ctx.userId, giteId: gite.id }, null];
}

/**
 * Like requireGite(), but also blocks users whose trial has expired.
 * Use on premium write routes (generate-contract, send-email, create reservation).
 */
export async function requireActivePlan(): Promise<[GiteCtx, null] | [null, AuthErr]> {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return [null, NextResponse.json({ error: "Non autorisé" }, { status: 401 })];

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user)
    return [null, NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 })];

  const trialInfo = getTrialInfo(user);
  if (trialInfo.isExpired)
    return [null, NextResponse.json({ error: "Essai expiré. Abonnez-vous pour continuer." }, { status: 403 })];

  const gite = await prisma.gite.findFirst({ where: { userId: user.id } });
  if (!gite)
    return [null, NextResponse.json({ error: "Gîte introuvable" }, { status: 404 })];

  return [{ userId: user.id, giteId: gite.id }, null];
}
