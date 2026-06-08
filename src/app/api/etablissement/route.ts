import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireGiteById } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [ctx, err] = await requireGiteById(body.giteId);
  if (err) return err;

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
    mediatorInfo: typeof body.mediatorInfo === "string"
      ? (body.mediatorInfo.trim() ? body.mediatorInfo.trim() : null)
      : undefined,
  };

  let gite = await prisma.gite.update({ where: { id: ctx.giteId }, data: giteData });

  if (Array.isArray(body.options)) {
    await prisma.giteOption.deleteMany({ where: { giteId: ctx.giteId } });
    if (body.options.length > 0) {
      await prisma.giteOption.createMany({
        data: body.options.map((opt: { label: string; price: number }, i: number) => ({
          giteId: ctx.giteId,
          label: opt.label,
          price: parseFloat(String(opt.price ?? 0)),
          position: i,
        })),
      });
    }
  }

  return NextResponse.json(gite, { status: 200 });
}
