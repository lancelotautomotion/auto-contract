import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TRIAL_DAYS } from "@/lib/trial";

async function uniqueSlug(base: string, excludeGiteId?: string): Promise<string> {
  const candidate = base || "gite";
  const existing = await prisma.gite.findFirst({
    where: { slug: candidate, ...(excludeGiteId ? { id: { not: excludeGiteId } } : {}) },
  });
  if (!existing) return candidate;
  return `${candidate}-${Math.random().toString(36).slice(2, 6)}`;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const body = await req.json();

    let user = await prisma.user.findUnique({ where: { clerkId: userId } }).catch(() => null);
    if (!user) {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);
      try {
        user = await prisma.user.create({
          data: { clerkId: userId, email: body.email, name: body.giteName, trialEndsAt },
        });
      } catch {
        user = await prisma.user.create({
          data: { clerkId: userId, email: body.email, name: body.giteName },
        });
      }
    }

    const existingGite = await prisma.gite.findFirst({ where: { userId: user.id } });

    const rawSlug = body.slug ? body.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-') : undefined;
    const slug = rawSlug ? await uniqueSlug(rawSlug, existingGite?.id) : undefined;

    const giteData = {
      name: body.giteName,
      email: body.email,
      phone: body.phone ?? "",
      address: body.address ?? "",
      city: body.city ?? "",
      zipCode: body.zipCode ?? "",
      slug,
      contractTemplateGeneral: body.contractTemplateGeneral ?? undefined,
      contractTemplateHouseRules: body.contractTemplateHouseRules ?? undefined,
      capacity: parseInt(body.capacity ?? "12"),
      cleaningFee: parseFloat(body.cleaningFee ?? "90"),
      touristTax: parseFloat(body.touristTax ?? "1.32"),
    };

    let gite;
    if (existingGite) {
      gite = await prisma.gite.update({ where: { id: existingGite.id }, data: giteData });
    } else {
      gite = await prisma.gite.create({
        data: { userId: user.id, ...giteData, notificationEmail: body.email || null },
      });
    }

    if (Array.isArray(body.options)) {
      await prisma.giteOption.deleteMany({ where: { giteId: gite.id } });
      if (body.options.length > 0) {
        await prisma.giteOption.createMany({
          data: body.options.map((opt: { label: string; price: number }, i: number) => ({
            giteId: gite.id,
            label: opt.label,
            price: parseFloat(String(opt.price ?? 0)),
            position: i,
          })),
        });
      }
    }

    return NextResponse.json(gite, { status: 200 });
  } catch (err) {
    console.error("[onboarding] POST error:", err);
    return NextResponse.json({ error: "Erreur serveur. Veuillez réessayer." }, { status: 500 });
  }
}
