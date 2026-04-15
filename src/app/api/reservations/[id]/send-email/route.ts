import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { randomBytes } from "crypto";
import { buildEmailHtml, ctaButton, divider, muted } from "@/lib/emailTemplate";
import { requireAuth } from "@/lib/auth";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ctx, err] = await requireAuth();
  if (err) return err;

  const reservation = await prisma.reservation.findFirst({
    where: { id, gite: { userId: ctx.userId } },
    include: { gite: { include: { documents: true } } },
  });
  if (!reservation) return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });

  if (!process.env.RESEND_API_KEY)
    return NextResponse.json({ error: "RESEND_API_KEY non configurée" }, { status: 500 });
  const resend = new Resend(process.env.RESEND_API_KEY);

  const existingContract = await prisma.contract.findUnique({ where: { reservationId: id } });
  const signatureToken = existingContract?.signatureToken ?? randomBytes(32).toString("hex");

  await prisma.contract.upsert({
    where: { reservationId: id },
    create: { reservationId: id, status: "GENERATED", signatureToken, emailStatus: "SENT", emailSentAt: new Date() },
    update: { signatureToken, emailStatus: "SENT", emailSentAt: new Date() },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const signUrl = `${appUrl}/sign/${signatureToken}`;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
  const fmt = (d: Date) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  const dateEntree = fmt(reservation.checkIn);
  const dateSortie = fmt(reservation.checkOut);
  const depositAmount = reservation.deposit != null
    ? `${reservation.deposit.toFixed(2).replace(".", ",")} €`
    : null;
  const hasRib = reservation.gite.documents.some((d) => /rib/i.test(d.label));

  const body = `
    <p style="margin:0 0 16px;">Bonjour <strong>${reservation.clientFirstName}</strong>,</p>
    <p style="margin:0 0 16px;">Votre contrat de location pour votre séjour du <strong>${dateEntree}</strong> au <strong>${dateSortie}</strong> au <strong>${reservation.gite.name}</strong> est prêt à être signé.</p>
    <p style="margin:0 0 16px;">Merci de le lire attentivement et de le signer en cliquant sur le bouton ci-dessous :</p>
    ${ctaButton("Lire et signer le contrat", signUrl)}
    ${divider()}
    ${depositAmount
      ? `<p style="margin:0 0 12px; font-size:14px; color:#1C1C1A;">Pour finaliser votre réservation, un acompte de <strong>${depositAmount}</strong> est à régler par virement bancaire${hasRib ? " sur le RIB joint à ce mail" : ""}. Votre exemplaire du contrat signé vous sera envoyé dès réception de celui-ci.</p>`
      : `<p style="margin:0 0 12px; font-size:14px; color:#1C1C1A;">Pour finaliser votre réservation, un acompte est à régler par virement bancaire${hasRib ? " sur le RIB joint à ce mail" : ""}. Votre exemplaire du contrat signé vous sera envoyé dès réception de celui-ci.</p>`
    }
    ${muted("Ce lien est personnel et sécurisé.")}
    <p style="margin:24px 0 0; font-size:14px; color:#1C1C1A;">Cordialement,<br/><strong>${reservation.gite.name}</strong></p>
  `;

  const logoPublicUrl = reservation.gite.logoUrl ?? null;

  const html = buildEmailHtml({
    giteName: reservation.gite.name,
    logoPublicUrl,
    preheader: `Votre contrat pour le séjour du ${dateEntree} au ${dateSortie} est prêt.`,
    body,
  });

  // Fetch document files from Blob and attach them
  const attachments = await Promise.all(
    reservation.gite.documents.map(async (doc) => {
      const res = await fetch(doc.fileUrl);
      const buffer = Buffer.from(await res.arrayBuffer());
      return { filename: doc.fileName, content: buffer.toString("base64") };
    })
  );

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: reservation.clientEmail,
    subject: `Votre contrat de location à signer — ${reservation.gite.name}`,
    html,
    attachments,
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: "Erreur lors de l'envoi de l'email" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
