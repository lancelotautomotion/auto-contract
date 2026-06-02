import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActivePlan, requireActivePlanAny, requireGiteById, requireGuesthouseById } from "@/lib/auth";
import { computeLodgingTotal, computeMealsTotal, computeTouristTax, nightsBetween } from "@/lib/billing";
import { mealLabel } from "@/lib/reservationProperty";
import type { MealType, MealService } from "@prisma/client";

const VALID_SERVICES: MealService[] = ["BREAKFAST", "LUNCH", "DINNER", "OTHER"];

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Aiguillage : réservation Maison d'hôtes (par chambre) vs Gîte (entier).
  if (body.guesthouseId) {
    const [planCtx, planErr] = await requireActivePlanAny();
    if (planErr) return planErr;
    return createGuesthouseReservation(body, planCtx.userId);
  }

  // requireActivePlan checks trial expiry and requires a Gite
  const [planCtx, planErr] = await requireActivePlan();
  if (planErr) return planErr;

  const [ctx, giteErr] = await requireGiteById(body.giteId);
  if (giteErr) return giteErr;

  const gite = await prisma.gite.findFirst({
    where: { id: ctx.giteId, deletedAt: null },
    include: { options: true },
  });
  if (!gite) return NextResponse.json({ error: "Gîte introuvable" }, { status: 404 });

  // Verify same user — requireActivePlan and requireGiteById both validate auth independently
  if (planCtx.userId !== ctx.userId)
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const checkIn = new Date(body.checkIn);
  const checkOut = new Date(body.checkOut);
  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()))
    return NextResponse.json({ error: "Dates invalides" }, { status: 400 });
  if (checkOut <= checkIn)
    return NextResponse.json({ error: "La date de départ doit être après l'arrivée" }, { status: 400 });

  const rent = parseFloat(body.rent);
  const deposit = parseFloat(body.deposit);
  const cleaningFee = parseFloat(body.cleaningFee ?? 90);
  const touristTax = parseFloat(body.touristTax ?? 1.32);
  if (isNaN(rent) || rent < 0) return NextResponse.json({ error: "Loyer invalide" }, { status: 400 });
  if (isNaN(deposit) || deposit < 0) return NextResponse.json({ error: "Acompte invalide" }, { status: 400 });

  const selectedIds: string[] = Array.isArray(body.selectedOptionIds) ? body.selectedOptionIds : [];
  const selectedOptions = gite.options.filter((o) => selectedIds.includes(o.id));

  const reservation = await prisma.reservation.create({
    data: {
      giteId: ctx.giteId,
      clientFirstName: body.clientFirstName,
      clientLastName: body.clientLastName,
      clientEmail: body.clientEmail,
      clientPhone: body.clientPhone,
      clientAddress: body.clientAddress ?? "",
      clientCity: body.clientCity ?? "",
      clientZipCode: body.clientZipCode ?? "",
      checkIn,
      checkOut,
      rent,
      deposit,
      cleaningFee: isNaN(cleaningFee) ? 90 : cleaningFee,
      touristTax: isNaN(touristTax) ? 1.32 : touristTax,
      notes: body.notes ?? "",
      reservationOptions: {
        create: selectedOptions.map((o) => ({
          label: o.label,
          price: o.price,
          giteOptionId: o.id,
        })),
      },
    },
  });

  return NextResponse.json(reservation, { status: 201 });
}

interface MealInput {
  mealType: MealType;
  service?: MealService;
  unitPrice?: number;
  quantity?: number;
  guesthouseMealId?: string;
  label?: string;
}

async function createGuesthouseReservation(body: Record<string, unknown>, userId: string) {
  const [ctx, ghErr] = await requireGuesthouseById(String(body.guesthouseId ?? ""));
  if (ghErr) return ghErr;
  if (ctx.userId !== userId) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const guesthouse = await prisma.guesthouse.findFirst({
    where: { id: ctx.guesthouseId, deletedAt: null },
    include: { rooms: true, meals: true },
  });
  if (!guesthouse) return NextResponse.json({ error: "Maison d'hôtes introuvable" }, { status: 404 });

  const checkIn = new Date(String(body.checkIn));
  const checkOut = new Date(String(body.checkOut));
  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()))
    return NextResponse.json({ error: "Dates invalides" }, { status: 400 });
  if (checkOut <= checkIn)
    return NextResponse.json({ error: "La date de départ doit être après l'arrivée" }, { status: 400 });

  const roomIds: string[] = Array.isArray(body.roomIds) ? body.roomIds.map(String) : [];
  const selectedRooms = guesthouse.rooms.filter((r) => roomIds.includes(r.id));
  if (selectedRooms.length === 0)
    return NextResponse.json({ error: "Sélectionnez au moins une chambre" }, { status: 400 });

  const nights = nightsBetween(checkIn, checkOut);
  const adults = parseInt(String(body.adultsCount ?? "0")) || 0;

  // Ventilation : nuitées (chambres) et restauration (repas) séparées.
  const lodging = computeLodgingTotal(selectedRooms.map((r) => ({ price: r.basePrice })), nights);
  const mealsInput: MealInput[] = Array.isArray(body.meals) ? (body.meals as MealInput[]) : [];
  const mealsById = new Map(guesthouse.meals.map((m) => [m.id, m]));
  const meals = mealsInput
    .filter((m) => m && m.mealType)
    .map((m) => {
      const linked = m.guesthouseMealId ? mealsById.get(m.guesthouseMealId) : undefined;
      const label = (m.label && String(m.label).trim()) || linked?.name || mealLabel(m.mealType);
      const service: MealService = VALID_SERVICES.includes(m.service as MealService)
        ? (m.service as MealService)
        : linked?.service ?? "DINNER";
      return {
        mealType: m.mealType,
        service,
        label,
        unitPrice: Number(m.unitPrice) || 0,
        quantity: Math.max(1, parseInt(String(m.quantity ?? 1)) || 1),
        guesthouseMealId: linked ? linked.id : null,
      };
    });
  const mealsTotal = computeMealsTotal(meals);

  const touristTaxRate = guesthouse.touristTax;
  const touristTaxTotal = computeTouristTax(adults, nights, touristTaxRate);

  // rent = hébergement + restauration (la taxe de séjour reste à part).
  // Le gérant peut surcharger le loyer ; sinon on prend le calcul ventilé.
  const rent = body.rent != null && String(body.rent) !== "" ? parseFloat(String(body.rent)) : lodging + mealsTotal;
  const deposit = parseFloat(String(body.deposit ?? "0")) || 0;

  const reservation = await prisma.reservation.create({
    data: {
      guesthouseId: ctx.guesthouseId,
      clientFirstName: String(body.clientFirstName ?? ""),
      clientLastName: String(body.clientLastName ?? ""),
      clientEmail: String(body.clientEmail ?? ""),
      clientPhone: String(body.clientPhone ?? ""),
      clientAddress: String(body.clientAddress ?? ""),
      clientCity: String(body.clientCity ?? ""),
      clientZipCode: String(body.clientZipCode ?? ""),
      checkIn,
      checkOut,
      guestCount: adults,
      adultsCount: adults,
      dietaryNotes: body.dietaryNotes ? String(body.dietaryNotes) : null,
      rent,
      deposit,
      cleaningFee: 0,
      touristTax: touristTaxRate,
      notes: body.notes ? String(body.notes) : "",
      reservationRooms: {
        create: selectedRooms.map((r) => ({ roomId: r.id, roomName: r.name, price: r.basePrice })),
      },
      meals: { create: meals },
    },
  });

  return NextResponse.json({ ...reservation, breakdown: { lodging, meals: mealsTotal, touristTax: touristTaxTotal, nights } }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const [ctx, err] = await requireActivePlan();
  if (err) return err;

  const { searchParams } = req.nextUrl;
  const giteId = searchParams.get('giteId');
  const guesthouseId = searchParams.get('guesthouseId');

  const where = giteId
    ? { giteId, gite: { userId: ctx.userId } }
    : guesthouseId
    ? { guesthouseId, guesthouse: { userId: ctx.userId } }
    : { OR: [{ gite: { userId: ctx.userId } }, { guesthouse: { userId: ctx.userId } }] };

  const reservations = await prisma.reservation.findMany({
    where,
    include: { contract: true, reservationOptions: true, reservationRooms: true, meals: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reservations);
}
