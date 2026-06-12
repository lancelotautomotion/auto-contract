import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildEmailHtml, divider, infoBox, muted, signOff } from "@/lib/emailTemplate";
import { resend, getFromEmail } from "@/lib/resend";
import { requireAuth } from "@/lib/auth";
import { resolveReservationProperty, managerReplyTo } from "@/lib/reservationProperty";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ctx, err] = await requireAuth();
  if (err) return err;

  try {
    const reservation = await prisma.reservation.findFirst({
      where: { id, OR: [{ gite: { userId: ctx.userId } }, { guesthouse: { userId: ctx.userId } }] },
      include: { gite: { include: { documents: true } }, guesthouse: true, contract: true },
    });

    if (!reservation) return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
    if (!reservation.contract) return NextResponse.json({ error: "Aucun contrat" }, { status: 400 });
    if (reservation.contract.status !== "SIGNED") return NextResponse.json({ error: "Contrat non signé" }, { status: 400 });
    if (reservation.contract.depositReceived) return NextResponse.json({ error: "Acompte déjà reçu" }, { status: 400 });

    const property = resolveReservationProperty(reservation);
    if (!property) return NextResponse.json({ error: "Hébergement introuvable" }, { status: 404 });
    const documents = reservation.gite?.documents ?? [];

    const fromEmail = getFromEmail();
    const fmt = (d: Date) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
    const dateEntree = fmt(reservation.checkIn);
    const dateSortie = fmt(reservation.checkOut);
    const depositFormatted = reservation.deposit != null
      ? `${reservation.deposit.toFixed(2).replace(".", ",")} €`
      : null;
    const hasRib = documents.some((d) => /rib/i.test(d.label));
    const giteAddress = [property.address, property.zipCode, property.city]
      .filter(Boolean).join(', ') || undefined;

    const body = `
      <p style="margin:0 0 20px;">Nous vous rappelons que vous avez signé votre contrat de location pour le séjour du <strong style="color:#2C2C2A;">${dateEntree}</strong> au <strong style="color:#2C2C2A;">${dateSortie}</strong> au <strong style="color:#2C2C2A;">${property.name}</strong>.</p>
      <p style="margin:0 0 20px;">Afin de finaliser votre réservation et de recevoir votre exemplaire du contrat signé, merci de procéder au règlement de l'acompte.</p>
      ${depositFormatted
        ? infoBox(`<strong style="color:#5B52B5;">Acompte de ${depositFormatted}</strong> à régler par virement bancaire${hasRib ? " sur le RIB joint à ce mail" : ""}. Votre exemplaire du contrat signé vous sera envoyé dès réception de celui-ci.`)
        : `<p style="margin:0 0 20px;">L'acompte est à régler par virement bancaire${hasRib ? " sur le RIB joint à ce mail" : ""}.</p>`
      }
      ${divider()}
      ${muted("Pour toute question, contactez directement votre hébergeur.")}
      ${signOff(property.name)}
    `;

    const attachments = await Promise.all(
      documents.map(async (doc) => {
        const res = await fetch(doc.fileUrl);
        const buffer = Buffer.from(await res.arrayBuffer());
        return { filename: doc.fileName, content: buffer.toString("base64") };
      })
    );

    await resend.emails.send({
      from: fromEmail,
      to: reservation.clientEmail,
      replyTo: managerReplyTo(property),
      subject: `Rappel acompte — ${property.name}`,
      html: buildEmailHtml({
        giteName: property.name,
        giteAddress,
        giteLogoUrl: property.logoUrl,
        docLabel: 'Rappel acompte',
        preheader: `Rappel : votre acompte${depositFormatted ? ` de ${depositFormatted}` : ""} est en attente pour finaliser votre réservation.`,
        greeting: reservation.clientFirstName,
        body,
      }),
      attachments,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[remind-deposit]", err);
    return NextResponse.json({ error: "Erreur lors de l'envoi du rappel" }, { status: 500 });
  }
}
