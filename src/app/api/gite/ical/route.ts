import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { fetchAndParseIcal } from "@/lib/ical";

export async function GET() {
  const [ctx, err] = await requireAuth();
  if (err) return err;

  const gite = await prisma.gite.findFirst({ where: { userId: ctx.userId } });
  if (!gite) return NextResponse.json({ feeds: [] });

  const feeds = await prisma.icalFeed.findMany({
    where: { giteId: gite.id },
    orderBy: { createdAt: 'asc' },
    select: { id: true, platform: true, label: true, url: true, syncedAt: true },
  });
  return NextResponse.json({ feeds });
}

export async function POST(req: NextRequest) {
  const [ctx, err] = await requireAuth();
  if (err) return err;

  const gite = await prisma.gite.findFirst({ where: { userId: ctx.userId } });
  if (!gite) return NextResponse.json({ error: "Gîte introuvable" }, { status: 404 });

  const { platform, label, url } = await req.json();
  if (!platform || !label || !url) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }
  if (!url.startsWith('http')) {
    return NextResponse.json({ error: "URL invalide" }, { status: 400 });
  }

  let blockedDates: unknown[] = [];
  let syncedAt: Date | null = null;
  try {
    const events = await fetchAndParseIcal(url);
    blockedDates = events;
    syncedAt = new Date();
  } catch {
    // Save the feed even if initial sync fails — user can retry
  }

  const feed = await prisma.icalFeed.create({
    data: { giteId: gite.id, platform, label, url, blockedDates, syncedAt },
    select: { id: true, platform: true, label: true, url: true, syncedAt: true },
  });
  return NextResponse.json({ feed });
}
