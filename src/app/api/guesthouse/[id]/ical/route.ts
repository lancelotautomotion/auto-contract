import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireGuesthouseById } from "@/lib/auth";
import { fetchAndParseIcal } from "@/lib/ical";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ctx, err] = await requireGuesthouseById(id);
  if (err) return err;

  const feeds = await prisma.guesthouseIcalFeed.findMany({
    where: { room: { guesthouseId: ctx.guesthouseId } },
    orderBy: { createdAt: "asc" },
    select: { id: true, platform: true, label: true, url: true, syncedAt: true, roomId: true },
  });
  return NextResponse.json({ feeds });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ctx, err] = await requireGuesthouseById(id);
  if (err) return err;

  const body = await req.json();
  const { platform, label, url, roomId } = body;
  if (!platform || !label || !url || !roomId)
    return NextResponse.json({ error: "Champs manquants (chambre requise)" }, { status: 400 });

  const room = await prisma.room.findFirst({ where: { id: roomId, guesthouseId: ctx.guesthouseId } });
  if (!room) return NextResponse.json({ error: "Chambre introuvable" }, { status: 404 });

  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol))
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
  } catch { /* keep feed even if first sync fails */ }

  const feed = await prisma.guesthouseIcalFeed.create({
    data: { roomId, platform, label, url, blockedDates: blockedDates as never, syncedAt },
    select: { id: true, platform: true, label: true, url: true, syncedAt: true, roomId: true },
  });
  return NextResponse.json({ feed });
}
