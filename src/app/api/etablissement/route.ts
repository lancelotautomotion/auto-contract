import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const [ctx, err] = await requireAuth();
  if (err) return err;

  const body = await req.json();

  const giteData = {
    name: body.giteName,
    email: body.email,
    phone: body.phone ?? "",
    address: body.address ?? "",
    city: body.city ?? "",
    zipCode: body.zipCode ?? "",
    slug: body.slug ? body.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-") : undefined,
    contractTemplateGeneral: body.contractTemplateGeneral ?? undefined,
    contractTemplateHouseRules: body.contractTemplateHouseRules ?? undefined,
    logoUrl: body.logoUrl ?? null,
    capacity: parseInt(body.capacity ?? "12"),
    cleaningFee: parseFloat(body.cleaningFee ?? "90"),
    touristTax: parseFloat(body.touristTax ?? "1.32"),
  };

  let gite = await prisma.gite.findFirst({ where: { userId: ctx.userId } });
  if (!gite) return NextResponse.json({ error: "Gîte introuvable" }, { status: 404 });

  gite = await prisma.gite.update({ where: { id: gite.id }, data: giteData });

  if (Array.isArray(body.options)) {
    await prisma.giteOption.deleteMany({ where: { giteId: gite.id } });
    if (body.options.length > 0) {
      await prisma.giteOption.createMany({
        data: body.options.map((opt: { label: string; price: number }, i: number) => ({
          giteId: gite!.id,
          label: opt.label,
          price: parseFloat(String(opt.price ?? 0)),
          position: i,
        })),
      });
    }
  }

  return NextResponse.json(gite, { status: 200 });
}
