import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend, getFromEmail } from "@/lib/resend";
import { buildEmailHtml, recapCard, ctaButton, divider, infoBox, muted, signOff } from "@/lib/emailTemplate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
const MAX_REMINDERS = 3;

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const cutoff = new Date(now.getTime() - TWO_DAYS_MS);
  const results = { sent: 0, skipped: 0, errors: 0 };

  const contracts = await prisma.contract.findMany({
    where: {
      signedAt: null,
      status: "GENERATED",
      emailStatus: "SENT",
      emailSentAt: { not: null, lt: cutoff },
      reminderCount: { lt: MAX_REMINDERS },
      signatureTokenExpiresAt: { gt: now },
      OR: [
        { lastReminderAt: null },
        { lastReminderAt: { lt: cutoff } },
      ],
      reservation: {
        status: { notIn: ["REFUSED", "CANCELLED"] },
      },
    },
    include: {
      reservation: {
        include: { gite: { include: { documents: true } } },
      },
    },
  });

  for (const contract of contracts) {
    const { reservation } = contract;
    const { gite } = reservation;

    if (!contract.signatureToken) { results.skipped++; continue; }

    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const signUrl = `${appUrl}/sign/${contract.signatureToken}`;
      const fmt = (d: Date) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
      const dateEntree = fmt(reservation.checkIn);
      const dateSortie = fmt(reservation.checkOut);

      const rentFormatted = reservation.rent != null
        ? `${reservation.rent.toFixed(2).replace(".", ",")} €` : null;
      const depositFormatted = reservation.deposit != null
        ? `${reservation.deposit.toFixed(2).replace(".", ",")} €` : null;
      const hasRib = gite.documents.some((d) => /rib/i.test(d.label));

      const rightCol = [
        ...(rentFormatted ? [{ label: "Montant total", value: rentFormatted }] : []),
        ...(depositFormatted ? [{ label: "Acompte à régler", value: depositFormatted, valueColor: "#689D71" }] : []),
      ];

      const reminderNum = contract.reminderCount + 1;
      const body = `
        <p style="margin:0 0 16px;">Nous vous contactons car votre contrat de location pour le <strong style="color:#2C2C2A;">${gite.name}</strong> est toujours en attente de signature.</p>
        ${recapCard(
          [{ label: "Arrivée", value: dateEntree }, { label: "Départ", value: dateSortie }],
          rightCol.length > 0 ? rightCol : [{ label: "Séjour", value: `${dateEntree} → ${dateSortie}` }]
        )}
        <p style="margin:0 0 20px;">Pour finaliser votre réservation, merci de signer votre contrat dès que possible en cliquant sur le bouton ci-dessous.</p>
        ${ctaButton("Signer mon contrat", signUrl)}
        ${divider()}
        ${depositFormatted
          ? infoBox(`<strong style="color:#5B52B5;">Acompte de ${depositFormatted}</strong> à régler par virement bancaire${hasRib ? " sur le RIB joint à ce mail" : ""}. Votre exemplaire du contrat signé vous sera envoyé dès réception.`)
          : ""
        }
        ${muted("Ce lien est personnel et sécurisé. La signature est conforme au règlement eIDAS.")}
        ${signOff(gite.name)}
      `;

      const giteAddress = [gite.address, gite.zipCode, gite.city].filter(Boolean).join(", ") || undefined;

      const html = buildEmailHtml({
        giteName: gite.name,
        giteAddress,
        giteLogoUrl: gite.logoUrl,
        docLabel: "Contrat de location",
        preheader: `Rappel : votre contrat pour le séjour du ${dateEntree} au ${dateSortie} attend votre signature.`,
        greeting: reservation.clientFirstName,
        body,
      });

      const attachments = (await Promise.all(
        gite.documents.map(async (doc) => {
          try {
            const res = await fetch(doc.fileUrl);
            if (!res.ok) return null;
            const buffer = Buffer.from(await res.arrayBuffer());
            return { filename: doc.fileName, content: buffer.toString("base64") };
          } catch { return null; }
        })
      )).filter(Boolean) as { filename: string; content: string }[];

      const { error } = await resend.emails.send({
        from: getFromEmail(),
        to: reservation.clientEmail,
        subject: `Rappel${reminderNum > 1 ? ` (${reminderNum})` : ""} : votre contrat de location attend votre signature — ${gite.name}`,
        html,
        attachments,
      });

      if (error) throw new Error(error.message);

      await prisma.contract.update({
        where: { id: contract.id },
        data: {
          reminderCount: { increment: 1 },
          lastReminderAt: now,
        },
      });

      results.sent++;
    } catch (err) {
      console.error("[contract-reminders] error for contract", contract.id, err);
      results.errors++;
    }
  }

  return NextResponse.json({ ok: true, ...results });
}
