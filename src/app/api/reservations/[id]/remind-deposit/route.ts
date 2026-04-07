import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildEmailHtml, divider, muted } from "@/lib/emailTemplate";
import { Resend } from "resend";
import { requireAuth } from "@/lib/auth";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ctx, err] = await requireAuth();
  if (err) return err;

  try {
    const reservation = await prisma.reservation.findFirst({
      where: { id, gite: { userId: ctx.userId } },
      include: { gite: { include: { documents: true } }, contract: true },
    });

    if (!reservation) return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
    if (!reservation.contract) return NextResponse.json({ error: "Aucun contrat" }, { status: 400 });
    if (reservation.contract.status !== "SIGNED") return NextResponse.json({ error: "Contrat non signé" }, { status: 400 });
    if (reservation.contract.depositReceived) return NextResponse.json({ error: "Acompte déjà reçu" }, { status: 400 });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
    const logoPublicUrl = reservation.gite.logoUrl ?? null;
    const fmt = (d: Date) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
    const dateEntree = fmt(reservation.checkIn);
    const dateSortie = fmt(reservation.checkOut);
    const montantAcompte = reservation.deposit != null
      ? `${reservation.deposit.toFixed(2).replace(".", ",")} €`
      : null;
    const hasRib = reservation.gite.documents.some((d) => /rib/i.test(d.label));

    const body = `
      <p style="margin:0 0 16px;">Bonjour <strong>${reservation.clientFirstName}</strong>,</p>
      <p style="margin:0 0 16px;">Nous vous rappelons que vous avez signé votre contrat de location pour le séjour du <strong>${dateEntree}</strong> au <strong>${dateSortie}</strong> au <strong>${reservation.gite.name}</strong>.</p>
      ${montantAcompte
        ? `<p style="margin:0 0 16px;">Afin de finaliser votre réservation et de recevoir votre exemplaire du contrat signé, nous vous invitons à procéder au règlement de l'acompte de <strong>${montantAcompte}</strong> par virement bancaire${hasRib ? " sur le RIB joint à ce mail" : ""}.</p>`
        : `<p style="margin:0 0 16px;">Afin de finaliser votre réservation, nous vous invitons à procéder au règlement de l'acompte par virement bancaire${hasRib ? " sur le RIB joint à ce mail" : ""}.</p>`
      }
      <p style="margin:0 0 16px;">Pour toute question, n'hésitez pas à nous contacter directement.</p>
      ${divider()}
      ${muted(`Séjour du ${dateEntree} au ${dateSortie} · ${reservation.gite.name}`)}
      <p style="margin:24px 0 0; font-size:14px; color:#1C1C1A;">Cordialement,<br/><strong>${reservation.gite.name}</strong></p>
    `;

    // Fetch document files from Blob and attach them
    const attachments = await Promise.all(
      reservation.gite.documents.map(async (doc) => {
        const res = await fetch(doc.fileUrl);
        const buffer = Buffer.from(await res.arrayBuffer());
        return { filename: doc.fileName, content: buffer.toString("base64") };
      })
    );

    await resend.emails.send({
      from: fromEmail,
      to: reservation.clientEmail,
      subject: `Rappel acompte — ${reservation.gite.name}`,
      html: buildEmailHtml({
        giteName: reservation.gite.name,
        logoPublicUrl,
        preheader: `Rappel : votre acompte${montantAcompte ? ` de ${montantAcompte}` : ""} est en attente pour finaliser votre réservation.`,
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
