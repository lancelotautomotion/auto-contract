import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireGuesthouseById } from "@/lib/auth";
import type { MealService } from "@prisma/client";

const VALID_SERVICES: MealService[] = ["BREAKFAST", "LUNCH", "DINNER", "OTHER"];

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ctx, err] = await requireGuesthouseById(id);
  if (err) return err;

  const meals = await prisma.guesthouseMeal.findMany({
    where: { guesthouseId: ctx.guesthouseId },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ meals });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ctx, err] = await requireGuesthouseById(id);
  if (err) return err;

  const body = await req.json();
  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Le nom du menu est requis" }, { status: 400 });

  const rawService = String(body.service ?? "DINNER") as MealService;
  const service: MealService = VALID_SERVICES.includes(rawService) ? rawService : "DINNER";
  const price = parseFloat(body.price) || 0;
  const description = body.description ? String(body.description).trim() : null;

  const existingCount = await prisma.guesthouseMeal.count({ where: { guesthouseId: ctx.guesthouseId } });

  const meal = await prisma.guesthouseMeal.create({
    data: {
      guesthouseId: ctx.guesthouseId,
      name,
      description,
      price,
      service,
      active: body.active === false ? false : true,
      position: existingCount,
    },
  });

  return NextResponse.json({ meal }, { status: 201 });
}
