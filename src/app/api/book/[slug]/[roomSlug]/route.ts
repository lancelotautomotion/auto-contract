import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { buildEmailHtml, divider, ctaButton, muted } from "@/lib/emailTemplate";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { isHoneypotTriggered } from "@/lib/honeypot";
import { computeLodgingTotal, computeMealsTotal, nightsBetween } from "@/lib/billing";
import type { MealType, MealService } from "@prisma/client";

function serviceToMealType(s: MealService): MealType {
  if (s === "BREAKFAST") return "BREAKFAST";
  if (s === "DINNER") return "TABLE_HOTES";
  return "HALF_BOARD";
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; roomSlug: string }> },
) {
  const { slug, roomSlug } = await params;

  const ip = getClientIp(req);
  const rl = checkRateLimit(`book:${ip}`, 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Trop de demandes. Veuillez réessayer dans quelques instants." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  const guesthouse = await prisma.guesthouse.findFirst({
    where: { slug, deletedAt: null },
    include: {
      rooms: { where: { slug: roomSlug } },
      meals: { where: { active: true } },
      user: true,
    },
  });
  if (!guesthouse) return NextResponse.json({ error: "Maison d'hôtes introuvable" }, { status: 404 });

  const room = guesthouse.rooms[0];
  if (!room || !room.active) return NextResponse.json({ error: "Chambre introuvable" }, { status: 404 });

  const body = await req.json();

  if (isHoneypotTriggered(body)) {
    return NextResponse.json({ id: "ok" }, { status: 201 });
  }

  if (!body.firstName || !body.lastName || !body.email || !body.phone || !body.checkIn || !body.checkOut) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(body.email))
    return NextResponse.json({ error: "Adresse email invalide" }, { status: 400 });

  const checkIn = new Date(body.checkIn);
  const checkOut = new Date(body.checkOut);
  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()))
    return NextResponse.json({ error: "Dates invalides" }, { status: 400 });
  if (checkOut <= checkIn)
    return NextResponse.json({ error: "La date de départ doit être après l'arrivée" }, { status: 400 });

  if ((body.address?.length ?? 0) > 500 || (body.city?.length ?? 0) > 200 || (body.notes?.length ?? 0) > 2000)
    return NextResponse.json({ error: "Données trop longues" }, { status: 400 });

  const guestCount = parseInt(String(body.guestCount ?? ""), 10) || 1;
  if (guestCount > room.capacity)
    return NextResponse.json({ error: `Cette chambre accueille au maximum ${room.capacity} personnes.` }, { status: 400 });

  const nights = nightsBetween(checkIn, checkOut);
  const qty = Math.max(1, guestCount);

  const selectedMealIds: string[] = Array.isArray(body.selectedMealIds) ? body.selectedMealIds : [];
  const chosenMeals = guesthouse.meals.filter((m) => selectedMealIds.includes(m.id));

  const lodging = computeLodgingTotal([{ price: room.basePrice }], nights);
  const mealsTotal = computeMealsTotal(chosenMeals.map((m) => ({ unitPrice: m.price, quantity: qty })));
  const rent = lodging + mealsTotal;

  const reservation = await prisma.reservation.create({
    data: {
      guesthouseId: guesthouse.id,
      status: "PENDING_REVIEW",
      clientFirstName: body.firstName,
      clientLastName: body.lastName,
      clientEmail: body.email,
      clientPhone: body.phone,
      clientAddress: body.address ?? "",
      clientCity: body.city ?? "",
      clientZipCode: body.zipCode ?? "",
      checkIn,
      checkOut,
      guestCount,
      adultsCount: guestCount,
      rent,
      deposit: 0,
      cleaningFee: 0,
      touristTax: guesthouse.touristTax,
      dietaryNotes: body.notes ? String(body.notes) : null,
      notes: body.notes ?? "",
      reservationRooms: {
        create: [{ roomId: room.id, roomName: room.name, price: room.basePrice }],
      },
      meals: {
        create: chosenMeals.map((m) => ({
          guesthouseMealId: m.id,
          mealType: serviceToMealType(m.service),
          service: m.service,
          label: m.name,
          unitPrice: m.price,
          quantity: qty,
        })),
      },
    },
  });

  const notifTo = guesthouse.email || guesthouse.user.email;
  if (notifTo && process.env.RESEND_API_KEY) {
    try {
      const ci = new Date(body.checkIn + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
      const co = new Date(body.checkOut + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

      const mealsHtml = chosenMeals.length > 0
        ? `<p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:14px;color:#2C2C2A;margin:0 0 6px;"><strong>Restauration :</strong> ${chosenMeals.map((m) => `${m.name}${m.price > 0 ? ` (+${m.price} €/pers.)` : ""}`).join(", ")}</p>`
        : "";
      const notesHtml = body.notes
        ? `<p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:14px;color:#71716E;margin:8px 0 0;font-style:italic;">« ${body.notes} »</p>`
        : "";

      const emailBody = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F3F2EE;border-radius:12px;padding:20px;margin-bottom:24px;">
  <tr><td>
    <p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#A3A3A0;margin:0 0 12px;">Demandeur</p>
    <p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;color:#2C2C2A;margin:0 0 4px;">${body.firstName} ${body.lastName}</p>
    <p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:14px;color:#71716E;margin:0 0 2px;">${body.email}</p>
    <p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:14px;color:#71716E;margin:0;">${body.phone}</p>
  </td></tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EFEEF9;border-radius:12px;padding:20px;margin-bottom:24px;">
  <tr><td>
    <p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#A3A3A0;margin:0 0 12px;">Séjour demandé</p>
    <p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;color:#2C2C2A;margin:0 0 4px;">Chambre ${room.name}</p>
    <p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:15px;color:#2C2C2A;margin:0 0 4px;">${ci} → ${co}</p>
    <p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:14px;color:#7F77DD;font-weight:600;margin:0 0 8px;">${nights} nuit${nights > 1 ? "s" : ""} · ${guestCount} personne${guestCount > 1 ? "s" : ""}</p>
    ${mealsHtml}
    ${notesHtml}
  </td></tr>
</table>
${divider()}
${ctaButton("Voir la demande", `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/maisons-hotes/${guesthouse.id}/reservations`)}
${muted("Cette demande est en attente de votre confirmation dans Kordia.")}
`;

      await resend.emails.send({
        from: "Kordia <notifications@kordia.fr>",
        to: notifTo,
        subject: `Nouvelle demande — ${body.firstName} ${body.lastName} · ${room.name} (${guesthouse.name})`,
        html: buildEmailHtml({
          giteName: guesthouse.name,
          giteAddress: guesthouse.city ?? undefined,
          giteLogoUrl: guesthouse.logoUrl,
          docLabel: "Nouvelle demande",
          preheader: `${body.firstName} ${body.lastName} demande la chambre ${room.name} du ${ci} au ${co}.`,
          greeting: "Bonjour",
          body: emailBody,
        }),
      });
    } catch (emailErr) {
      console.error("[book guesthouse] Erreur envoi notification gérant:", emailErr);
    }
  }

  return NextResponse.json({ success: true, reservationId: reservation.id }, { status: 201 });
}
