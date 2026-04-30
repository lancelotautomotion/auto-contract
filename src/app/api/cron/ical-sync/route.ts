import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchAndParseIcal } from "@/lib/ical";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const feeds = await prisma.icalFeed.findMany();
  const results = { synced: 0, errors: 0 };

  for (const feed of feeds) {
    try {
      const events = await fetchAndParseIcal(feed.url);
      await prisma.icalFeed.update({
        where: { id: feed.id },
        data: { blockedDates: events, syncedAt: new Date() },
      });
      results.synced++;
    } catch {
      results.errors++;
    }
  }

  return NextResponse.json(results);
}
