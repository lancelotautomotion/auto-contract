import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TRIAL_DAYS } from "@/lib/trial";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

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

    const ip = getClientIp(req);
    const rl = checkRateLimit(`onboarding:${userId}:${ip}`, 5, 600_000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Trop de tentatives. Veuillez réessayer dans quelques minutes." },
        { status: 429, headers: { "Retry-After": "600" } }
      );
    }

    const body = await req.json();

    // L'offre Essentiel couvre désormais jusqu'à 5 hébergements
    // (1 = 10 € HT/mois, 2 à 5 = 20 € HT/mois). C'est le seul
    // plan souscriptible à l'onboarding.
    const planTier = "essential";

    let user = await prisma.user.findUnique({ where: { clerkId: userId } }).catch(() => null);
    if (!user) {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);
      try {
        user = await prisma.user.create({
          data: { clerkId: userId, email: body.email, name: body.giteName, trialEndsAt, planTier },
        });
      } catch {
        user = await prisma.user.create({
          data: { clerkId: userId, email: body.email, name: body.giteName, planTier },
        });
      }
    }

    // ─── Offre Maison d'hôtes ───────────────────────────────────────────────
    if (body.offerType === "guesthouse") {
      if (user.offerType !== "guesthouse") {
        await prisma.user.update({ where: { id: user.id }, data: { offerType: "guesthouse" } });
      }
      const ghData = {
        name: body.giteName || "Ma maison d'hôtes",
        email: body.email || null,
        phone: body.phone ?? "",
        address: body.address ?? "",
        city: body.city ?? "",
        zipCode: body.zipCode ?? "",
        touristTax: parseFloat(body.touristTax ?? "1") || 1,
      };
      let guesthouse = await prisma.guesthouse.findFirst({ where: { userId: user.id, deletedAt: null } });
      if (guesthouse) {
        guesthouse = await prisma.guesthouse.update({ where: { id: guesthouse.id }, data: ghData });
      } else {
        guesthouse = await prisma.guesthouse.create({ data: { userId: user.id, ...ghData } });
      }
      return NextResponse.json({ ...guesthouse, guesthouseId: guesthouse.id }, { status: 200 });
    }

    const existingGite = await prisma.gite.findFirst({ where: { userId: user.id, deletedAt: null } });

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

    // Create additional gîtes for multi plan
    if (Array.isArray(body.extraGites) && body.extraGites.length > 0) {
      for (const extra of body.extraGites as { name: string; capacity?: number; cleaningFee?: number; touristTax?: number }[]) {
        const trimmed = (extra.name ?? "").trim();
        if (!trimmed) continue;
        const extraSlug = await uniqueSlug(
          trimmed.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
        );
        await prisma.gite.create({
          data: {
            userId: user.id,
            name: trimmed,
            email: body.email || null,
            slug: extraSlug,
            capacity: extra.capacity ?? 0,
            cleaningFee: extra.cleaningFee ?? 0,
            touristTax: extra.touristTax ?? 0,
            notificationEmail: body.email || null,
          },
        });
      }
    }

    return NextResponse.json(gite, { status: 200 });
  } catch (err) {
    console.error("[onboarding] POST error:", err);
    return NextResponse.json({ error: "Erreur serveur. Veuillez réessayer." }, { status: 500 });
  }
}
