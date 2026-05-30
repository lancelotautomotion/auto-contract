import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireGuesthouseById } from "@/lib/auth";
import type { MealService } from "@prisma/client";

const VALID_SERVICES: MealService[] = ["BREAKFAST", "LUNCH", "DINNER", "OTHER"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; mealId: string }> }) {
  const { id, mealId } = await params;
  const [ctx, err] = await requireGuesthouseById(id);
  if (err) return err;

  const meal = await prisma.guesthouseMeal.findFirst({ where: { id: mealId, guesthouseId: ctx.guesthouseId } });
  if (!meal) return NextResponse.json({ error: "Menu introuvable" }, { status: 404 });

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if ("name" in body) {
    const name = String(body.name ?? "").trim();
    if (!name) return NextResponse.json({ error: "Le nom du menu est requis" }, { status: 400 });
    data.name = name;
  }
  if ("description" in body) data.description = body.description ? String(body.description).trim() : null;
  if ("price" in body) data.price = parseFloat(body.price) || 0;
  if ("service" in body) {
    const s = String(body.service) as MealService;
    if (!VALID_SERVICES.includes(s)) return NextResponse.json({ error: "Service invalide" }, { status: 400 });
    data.service = s;
  }
  if ("active" in body) data.active = !!body.active;
  if ("position" in body) data.position = parseInt(body.position) || 0;
  if ("tags" in body) {
    data.tags = Array.isArray(body.tags)
      ? body.tags.filter((t: unknown): t is string => typeof t === "string").map((t: string) => t.trim()).filter(Boolean)
      : [];
  }

  const updated = await prisma.guesthouseMeal.update({ where: { id: mealId }, data });
  return NextResponse.json({ meal: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; mealId: string }> }) {
  const { id, mealId } = await params;
  const [ctx, err] = await requireGuesthouseById(id);
  if (err) return err;

  const meal = await prisma.guesthouseMeal.findFirst({ where: { id: mealId, guesthouseId: ctx.guesthouseId } });
  if (!meal) return NextResponse.json({ error: "Menu introuvable" }, { status: 404 });

  await prisma.guesthouseMeal.delete({ where: { id: mealId } });
  return NextResponse.json({ success: true });
}
