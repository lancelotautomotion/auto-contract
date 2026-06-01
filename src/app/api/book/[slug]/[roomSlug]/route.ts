import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { buildEmailHtml, divider, ctaButton, muted } from "@/lib/emailTemplate";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { isHoneypotTriggered } from "@/lib/honeypot";

// Route pour les chambres d'une Maison d'Hôtes — slug composite : {parentSlug}/{roomSlug}
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; roomSlug: string }> },
) {
  const { slug, roomSlug } = await params;
  const fullSlug = `${slug}/${roomSlug}`;

  const ip = getClientIp(req);
  const rl = checkRateLimit(`book:${ip}`, 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Trop de demandes. Veuillez réessayer dans quelques instants." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  const gite = await prisma.gite.findFirst({
    where: { slug: fullSlug, deletedAt: null },
    include: { options: true, user: true },
  });

  if (!gite) return NextResponse.json({ error: "Chambre introuvable" }, { status: 404 });

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

  const selectedIds: string[] = Array.isArray(body.selectedOptionIds) ? body.selectedOptionIds : [];
  const selectedOptions = gite.options.filter(o => selectedIds.includes(o.id));

  const guestCountParsed = parseInt(String(body.guestCount ?? ''), 10);
  const guestCount = Number.isFinite(guestCountParsed) && guestCountParsed > 0 ? guestCountParsed : null;

  const reservation = await prisma.reservation.create({
    data: {
      giteId: gite.id,
      status: 'PENDING_REVIEW',
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
      notes: body.notes ?? "",
      rent: null,
      deposit: null,
      cleaningFee: null,
      touristTax: null,
      reservationOptions: {
        create: selectedOptions.map(o => ({
          label: o.label,
          price: o.price,
          giteOptionId: o.id,
        })),
      },
    },
  });

  const notifTo = gite.notificationEmail || gite.user.email;
  if (gite.notifNewReservation && notifTo && process.env.RESEND_API_KEY) {
    try {
      const checkInFmt = new Date(body.checkIn + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
      const checkOutFmt = new Date(body.checkOut + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
      const nights = Math.round((new Date(body.checkOut).getTime() - new Date(body.checkIn).getTime()) / 86400000);

      const optionsHtml = selectedOptions.length > 0
        ? `<p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:14px;color:#2C2C2A;margin:0 0 6px;"><strong>Options :</strong> ${selectedOptions.map(o => `${o.label}${o.price > 0 ? ` (+${o.price} €)` : ''}`).join(', ')}</p>`
        : '';
      const guestsHtml = guestCount
        ? `<p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:14px;color:#2C2C2A;margin:0 0 6px;"><strong>Personnes :</strong> ${guestCount}</p>`
        : '';
      const notesHtml = body.notes
        ? `<p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:14px;color:#71716E;margin:8px 0 0;font-style:italic;">« ${body.notes} »</p>`
        : '';

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
    <p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#A3A3A0;margin:0 0 12px;">Chambre · ${gite.name}</p>
    <p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;color:#2C2C2A;margin:0 0 4px;">${checkInFmt} → ${checkOutFmt}</p>
    <p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:14px;color:#7F77DD;font-weight:600;margin:0 0 8px;">${nights} nuit${nights > 1 ? 's' : ''}</p>
    ${guestsHtml}
    ${optionsHtml}
    ${notesHtml}
  </td></tr>
</table>
${divider()}
${ctaButton('Voir la demande', `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/${gite.id}/reservations`)}
${muted('Cette demande est en attente de votre confirmation dans Kordia.')}
`;

      await resend.emails.send({
        from: 'Kordia <notifications@kordia.fr>',
        to: notifTo,
        subject: `Nouvelle demande — ${body.firstName} ${body.lastName} · Chambre ${gite.name}`,
        html: buildEmailHtml({
          giteName: gite.name,
          giteAddress: gite.city ?? undefined,
          giteLogoUrl: gite.logoUrl,
          docLabel: 'Nouvelle demande',
          preheader: `${body.firstName} ${body.lastName} demande à séjourner du ${checkInFmt} au ${checkOutFmt}.`,
          greeting: 'Bonjour',
          body: emailBody,
        }),
      });
    } catch (emailErr) {
      console.error("[book/room] Erreur envoi notification gérant:", emailErr);
    }
  }

  return NextResponse.json(reservation, { status: 201 });
}
