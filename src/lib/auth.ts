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

  const gite = await prisma.gite.findFirst({ where: { userId: ctx.userId, deletedAt: null } });
  if (!gite)
    return [null, NextResponse.json({ error: "Gîte introuvable" }, { status: 404 })];

  return [{ userId: ctx.userId, giteId: gite.id }, null];
}

/**
 * Vérifie que l'appelant a le rôle "admin" dans Clerk.
 * Utilise le JWT d'abord (sessionClaims), puis l'API Clerk si absent.
 */
export async function requireAdmin(): Promise<[AuthCtx, null] | [null, AuthErr]> {
  const { userId: clerkId, sessionClaims } = await auth();
  if (!clerkId)
    return [null, NextResponse.json({ error: "Non autorisé" }, { status: 401 })];

  const roleFromClaims = (sessionClaims?.metadata as Record<string, unknown> | undefined)?.role;
  if (roleFromClaims === "admin") return [{ userId: clerkId }, null];

  const { clerkClient } = await import("@clerk/nextjs/server");
  const client = await clerkClient();
  const user = await client.users.getUser(clerkId);
  if (user.publicMetadata?.role !== "admin")
    return [null, NextResponse.json({ error: "Accès refusé" }, { status: 403 })];

  return [{ userId: clerkId }, null];
}

/**
 * Validates that a specific giteId exists and belongs to the authenticated user.
 * Use this in route handlers that receive a giteId from the request body/params.
 */
export async function requireGiteById(giteId: string): Promise<[GiteCtx, null] | [null, AuthErr]> {
  const [ctx, err] = await requireAuth();
  if (err) return [null, err];

  if (!giteId)
    return [null, NextResponse.json({ error: "giteId manquant" }, { status: 400 })];

  const gite = await prisma.gite.findFirst({ where: { id: giteId, userId: ctx.userId, deletedAt: null } });
  if (!gite)
    return [null, NextResponse.json({ error: "Gîte introuvable ou accès refusé" }, { status: 404 })];

  return [{ userId: ctx.userId, giteId: gite.id }, null];
}

export type GuesthouseCtx = AuthCtx & { guesthouseId: string };

/**
 * Vérifie que le compte est sur l'offre "Maison d'hôtes" (ou admin).
 * Un compte Essentiel (offerType "gite") ne peut pas accéder à cette offre.
 */
export async function requireGuesthouseAccount(): Promise<[AuthCtx, null] | [null, AuthErr]> {
  const { userId: clerkId, sessionClaims } = await auth();
  if (!clerkId)
    return [null, NextResponse.json({ error: "Non autorisé" }, { status: 401 })];

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user)
    return [null, NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 })];

  const isAdmin = (sessionClaims?.metadata as Record<string, unknown> | undefined)?.role === "admin";
  if (!isAdmin && user.offerType !== "guesthouse")
    return [null, NextResponse.json({ error: "Offre Maison d'hôtes requise", code: "OFFER_REQUIRED" }, { status: 403 })];

  return [{ userId: user.id }, null];
}

/**
 * Vérifie qu'une maison d'hôtes existe et appartient à l'utilisateur authentifié.
 */
export async function requireGuesthouseById(guesthouseId: string): Promise<[GuesthouseCtx, null] | [null, AuthErr]> {
  const [ctx, err] = await requireAuth();
  if (err) return [null, err];

  if (!guesthouseId)
    return [null, NextResponse.json({ error: "guesthouseId manquant" }, { status: 400 })];

  const guesthouse = await prisma.guesthouse.findFirst({ where: { id: guesthouseId, userId: ctx.userId, deletedAt: null } });
  if (!guesthouse)
    return [null, NextResponse.json({ error: "Maison d'hôtes introuvable ou accès refusé" }, { status: 404 })];

  return [{ userId: ctx.userId, guesthouseId: guesthouse.id }, null];
}

export async function requireActivePlan(): Promise<[GiteCtx, null] | [null, AuthErr]> {
  const { userId: clerkId, sessionClaims } = await auth();
  if (!clerkId)
    return [null, NextResponse.json({ error: "Non autorisé" }, { status: 401 })];

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user)
    return [null, NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 })];

  const roleFromClaims = (sessionClaims?.metadata as Record<string, unknown> | undefined)?.role;
  if (roleFromClaims !== "admin") {
    const trialInfo = getTrialInfo(user);
    if (trialInfo.isExpired)
      return [null, NextResponse.json({ error: "Essai expiré. Abonnez-vous pour continuer." }, { status: 403 })];
  }

  const gite = await prisma.gite.findFirst({ where: { userId: user.id, deletedAt: null } });
  if (!gite)
    return [null, NextResponse.json({ error: "Gîte introuvable" }, { status: 404 })];

  return [{ userId: user.id, giteId: gite.id }, null];
}
