import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireGiteById } from "@/lib/auth";
import { fetchAndParseIcal } from "@/lib/ical";

export async function GET(req: NextRequest) {
  const [ctx, err] = await requireAuth();
  if (err) return err;

  const { searchParams } = req.nextUrl;
  const giteId = searchParams.get("giteId") ?? "";

  let giteWhere = {};
  if (giteId) {
    const gite = await prisma.gite.findFirst({ where: { id: giteId, userId: ctx.userId, deletedAt: null } });
    if (!gite) return NextResponse.json({ feeds: [] });
    giteWhere = { giteId };
  } else {
    const gite = await prisma.gite.findFirst({ where: { userId: ctx.userId, deletedAt: null } });
    if (!gite) return NextResponse.json({ feeds: [] });
    giteWhere = { giteId: gite.id };
  }

  const feeds = await prisma.icalFeed.findMany({
    where: giteWhere,
    orderBy: { createdAt: 'asc' },
    select: { id: true, platform: true, label: true, url: true, syncedAt: true },
  });
  return NextResponse.json({ feeds });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  let resolvedGiteId: string;

  if (body.giteId) {
    const [ctx, err] = await requireGiteById(body.giteId);
    if (err) return err;
    resolvedGiteId = ctx.giteId;
  } else {
    const [ctx, err] = await requireAuth();
    if (err) return err;
    const gite = await prisma.gite.findFirst({ where: { userId: ctx.userId, deletedAt: null } });
    if (!gite) return NextResponse.json({ error: "Gîte introuvable" }, { status: 404 });
    resolvedGiteId = gite.id;
  }

  const { platform, label, url } = body;
  if (!platform || !label || !url) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol))
      return NextResponse.json({ error: "URL invalide (http/https uniquement)" }, { status: 400 });
    const h = parsed.hostname;
    if (/^(localhost|127\.|0\.0\.0\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h))
      return NextResponse.json({ error: "URL non autorisée" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "URL invalide" }, { status: 400 });
  }

  let blockedDates: unknown[] = [];
  let syncedAt: Date | null = null;
  try {
    const events = await fetchAndParseIcal(url);
    blockedDates = events;
    syncedAt = new Date();
  } catch { /* Save the feed even if initial sync fails */ }

  const feed = await prisma.icalFeed.create({
    data: { giteId: resolvedGiteId, platform, label, url, blockedDates, syncedAt },
    select: { id: true, platform: true, label: true, url: true, syncedAt: true },
  });
  return NextResponse.json({ feed });
}
