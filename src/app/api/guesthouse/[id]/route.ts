import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireGuesthouseById } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ctx, err] = await requireGuesthouseById(id);
  if (err) return err;

  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const field of ["name", "address", "city", "zipCode", "email", "phone", "contractTemplateGeneral", "contractTemplateHouseRules", "logoUrl"] as const) {
    if (field in body) data[field] = body[field];
  }
  if ("touristTax" in body) data.touristTax = parseFloat(body.touristTax) || 0;
  if ("capacity" in body) data.capacity = parseInt(body.capacity) || 0;
  if (typeof data.name === "string" && !data.name.trim())
    return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });

  const guesthouse = await prisma.guesthouse.update({
    where: { id: ctx.guesthouseId },
    data,
    select: { id: true, name: true },
  });

  return NextResponse.json({ guesthouse });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ctx, err] = await requireGuesthouseById(id);
  if (err) return err;

  // Soft delete : conserve les archives (réservations / contrats) comme pour le Gîte.
  await prisma.guesthouse.update({
    where: { id: ctx.guesthouseId },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
