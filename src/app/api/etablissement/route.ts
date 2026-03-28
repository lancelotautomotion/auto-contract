import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();

  const giteData = {
    name: body.giteName,
    email: body.email,
    phone: body.phone ?? "",
    address: body.address ?? "",
    city: body.city ?? "",
    zipCode: body.zipCode ?? "",
    slug: body.slug ? body.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-') : undefined,
    contractTemplate: body.contractTemplate ?? undefined,
    logoDataUrl: body.logoDataUrl ?? null,
    capacity: parseInt(body.capacity ?? "12"),
    cleaningFee: parseFloat(body.cleaningFee ?? "90"),
    touristTax: parseFloat(body.touristTax ?? "1.32"),
  };

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  let gite = await prisma.gite.findFirst({ where: { userId: user.id } });
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
