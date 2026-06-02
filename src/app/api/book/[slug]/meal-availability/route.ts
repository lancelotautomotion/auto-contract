import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/book/[slug]/meal-availability?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD
// Returns, for each MealService, the maximum already-booked count on any single day
// within the requested stay. The client compares this against tableDhotesCapacity.
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");

  if (!checkIn || !checkOut || checkIn >= checkOut) {
    return NextResponse.json({ capacity: 0, booked: {} });
  }

  const guesthouse = await prisma.guesthouse.findFirst({
    where: { slug, deletedAt: null },
    select: { id: true, tableDhotesCapacity: true },
  });
  if (!guesthouse) return NextResponse.json({ capacity: 0, booked: {} });

  // Load all active reservations that overlap the requested dates
  const reservations = await prisma.reservation.findMany({
    where: {
      guesthouseId: guesthouse.id,
      status: { notIn: ["REFUSED", "CANCELLED"] },
      checkIn: { lt: new Date(checkOut) },
      checkOut: { gt: new Date(checkIn) },
    },
    include: { meals: true },
  });

  // Build per-day per-service totals
  const ci = new Date(checkIn); ci.setHours(0, 0, 0, 0);
  const co = new Date(checkOut); co.setHours(0, 0, 0, 0);
  const days: Date[] = [];
  for (let d = new Date(ci); d < co; d = new Date(d.getTime() + 86_400_000)) {
    days.push(new Date(d));
  }
  const dayKey = (d: Date) => d.toISOString().slice(0, 10);

  // service → dayKey → count
  const grid = new Map<string, Map<string, number>>();

  for (const r of reservations) {
    const rCI = new Date(r.checkIn); rCI.setHours(0, 0, 0, 0);
    const rCO = new Date(r.checkOut); rCO.setHours(0, 0, 0, 0);
    for (const meal of r.meals) {
      if (!grid.has(meal.service)) grid.set(meal.service, new Map());
      const svcMap = grid.get(meal.service)!;
      for (const day of days) {
        if (day >= rCI && day < rCO) {
          const k = dayKey(day);
          svcMap.set(k, (svcMap.get(k) ?? 0) + meal.quantity);
        }
      }
    }
  }

  // For each service, return the PEAK day count (worst case)
  const booked: Record<string, number> = {};
  for (const [svc, dayMap] of grid.entries()) {
    booked[svc] = Math.max(...Array.from(dayMap.values()));
  }

  return NextResponse.json({ capacity: guesthouse.tableDhotesCapacity, booked });
}
