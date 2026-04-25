import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildEmailHtml, divider, muted, signOff } from "@/lib/emailTemplate";
import { Resend } from "resend";
import { requireAuth } from "@/lib/auth";

const REASON_LABELS: Record<string, string> = {
  dates_taken:    "les dates demandées sont malheureusement déjà réservées",
  rules_breach:   "votre demande ne correspond pas à notre règlement intérieur (animaux, fêtes, etc.)",
  duration:       "la durée de séjour demandée n'est pas compatible avec nos disponibilités",
  unavailable:    "l'hébergement est temporairement indisponible (travaux ou fermeture)",
  other:          "des raisons indépendantes de notre volonté ne nous permettent pas de donner suite",
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ctx, err] = await requireAuth();
  if (err) return err;

  const body = await req.json();
  const reason: string = body.reason ?? "other";
  const note: string = body.note?.trim() ?? "";

  try {
    const reservation = await prisma.reservation.findFirst({
      where: { id, gite: { userId: ctx.userId } },
      include: { gite: true },
    });

    if (!reservation) return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
    if (reservation.status === "REFUSED") return NextResponse.json({ error: "Déjà refusée" }, { status: 400 });

    await prisma.reservation.update({
      where: { id },
      data: { status: "REFUSED", refusalReason: reason, refusalNote: note || null },
    });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
    const giteAddress = [reservation.gite.address, reservation.gite.zipCode, reservation.gite.city]
      .filter(Boolean).join(", ") || undefined;

    const fmt = (d: Date) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
    const dateEntree = fmt(reservation.checkIn);
    const dateSortie = fmt(reservation.checkOut);

    const reasonLabel = REASON_LABELS[reason] ?? REASON_LABELS["other"];
    const noteHtml = (reason === "other" && note)
      ? `<p style="margin:0 0 20px;">${note}</p>`
      : "";

    const body_html = `
      <p style="margin:0 0 20px;">Nous vous remercions sincèrement de l'intérêt que vous portez à <strong style="color:#2C2C2A;">${reservation.gite.name}</strong> et de la confiance que vous nous témoignez.</p>
      <p style="margin:0 0 20px;">Après examen de votre demande de réservation du <strong style="color:#2C2C2A;">${dateEntree}</strong> au <strong style="color:#2C2C2A;">${dateSortie}</strong>, nous avons le regret de vous informer que nous ne sommes pas en mesure d'y donner suite, ${reasonLabel}.</p>
      ${noteHtml}
      <p style="margin:0 0 20px;">Nous espérons avoir l'occasion de vous accueillir lors d'une prochaine occasion et vous souhaitons de trouver rapidement un hébergement qui correspond à vos attentes.</p>
      ${divider()}
      ${muted("Ce message est envoyé automatiquement suite à l'examen de votre demande de réservation.")}
      ${signOff(reservation.gite.name)}
    `;

    await resend.emails.send({
      from: fromEmail,
      to: reservation.clientEmail,
      subject: `Suite à votre demande — ${reservation.gite.name}`,
      html: buildEmailHtml({
        giteName: reservation.gite.name,
        giteAddress,
        docLabel: "Réponse à votre demande",
        preheader: `Réponse à votre demande de réservation du ${dateEntree} au ${dateSortie}.`,
        greeting: reservation.clientFirstName,
        body: body_html,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[refuse]", message);
    return NextResponse.json({ error: "Erreur interne", detail: message }, { status: 500 });
  }
}
