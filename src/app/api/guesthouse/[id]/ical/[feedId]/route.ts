import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireGuesthouseById } from "@/lib/auth";
import { fetchAndParseIcal } from "@/lib/ical";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; feedId: string }> }) {
  const { id, feedId } = await params;
  const [ctx, err] = await requireGuesthouseById(id);
  if (err) return err;

  const feed = await prisma.guesthouseIcalFeed.findFirst({
    where: { id: feedId, room: { guesthouseId: ctx.guesthouseId } },
  });
  if (!feed) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  await prisma.guesthouseIcalFeed.delete({ where: { id: feedId } });
  return NextResponse.json({ success: true });
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string; feedId: string }> }) {
  const { id, feedId } = await params;
  const [ctx, err] = await requireGuesthouseById(id);
  if (err) return err;

  const feed = await prisma.guesthouseIcalFeed.findFirst({
    where: { id: feedId, room: { guesthouseId: ctx.guesthouseId } },
  });
  if (!feed) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  try {
    const events = await fetchAndParseIcal(feed.url);
    const updated = await prisma.guesthouseIcalFeed.update({
      where: { id: feedId },
      data: { blockedDates: events as never, syncedAt: new Date() },
      select: { id: true, syncedAt: true },
    });
    return NextResponse.json({ success: true, syncedAt: updated.syncedAt, count: events.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
