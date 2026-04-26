import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSignedContractPdf, ContractData, buildSignedContractFilename } from "@/lib/contractPdf";
import { DEFAULT_CONTRACT_TEMPLATE } from "@/lib/defaultContractTemplate";
import { buildEmailHtml, divider, muted, signOff } from "@/lib/emailTemplate";
import { Resend } from "resend";
import { requireAuth } from "@/lib/auth";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ctx, err] = await requireAuth();
  if (err) return err;

  try {
    const reservation = await prisma.reservation.findFirst({
      where: { id, gite: { userId: ctx.userId } },
      include: { gite: { include: { user: true } }, reservationOptions: true, contract: true },
    });

    if (!reservation) return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
    if (!reservation.contract) return NextResponse.json({ error: "Aucun contrat trouvé" }, { status: 400 });
    if (reservation.contract.status !== "SIGNED") return NextResponse.json({ error: "Le contrat n'est pas encore signé" }, { status: 400 });
    if (reservation.contract.depositReceived) return NextResponse.json({ error: "Acompte déjà marqué comme reçu" }, { status: 400 });

    const fmt = (d: Date) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
    const dateEntree = fmt(reservation.checkIn);
    const dateSortie = fmt(reservation.checkOut);

    const data: ContractData = {
      template: reservation.gite.contractTemplate ?? DEFAULT_CONTRACT_TEMPLATE,
      nom_client: reservation.clientLastName,
      prenom_client: reservation.clientFirstName,
      email_client: reservation.clientEmail,
      telephone_client: reservation.clientPhone,
      adresse_client: reservation.clientAddress,
      ville_client: reservation.clientCity,
      code_postal_client: reservation.clientZipCode,
      date_entree: dateEntree,
      date_sortie: dateSortie,
      loyer: reservation.rent ?? 0,
      acompte: reservation.deposit ?? 0,
      menage: reservation.cleaningFee ?? 0,
      taxe_sejour: reservation.touristTax ?? 0,
      options: reservation.reservationOptions.map((o) => ({ label: o.label, price: o.price })),
      nom_gite: reservation.gite.name,
      adresse_gite: reservation.gite.address,
      ville_gite: reservation.gite.city,
      code_postal_gite: reservation.gite.zipCode,
      email_gite: reservation.gite.email,
      telephone_gite: reservation.gite.phone,
      logoUrl: reservation.gite.logoUrl,
    };

    const pdfBuffer = await generateSignedContractPdf(data, {
      signedByName: reservation.contract.signedByName ?? "",
      signedAt: reservation.contract.signedAt ?? new Date(),
      signedByIp: reservation.contract.signedByIp ?? "inconnue",
      reservationId: reservation.id,
    });

    await prisma.contract.update({
      where: { id: reservation.contract.id },
      data: { depositReceived: true, depositReceivedAt: new Date() },
    });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
    const filename = buildSignedContractFilename({
      clientLastName: reservation.clientLastName,
      clientFirstName: reservation.clientFirstName,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
    });
    const giteAddress = [reservation.gite.address, reservation.gite.zipCode, reservation.gite.city]
      .filter(Boolean).join(', ') || undefined;

    const clientBody = `
      <p style="margin:0 0 20px;">Suite à la réception de votre acompte, veuillez trouver ci-joint votre exemplaire du contrat de location signé pour le séjour du <strong style="color:#2C2C2A;">${dateEntree}</strong> au <strong style="color:#2C2C2A;">${dateSortie}</strong> au <strong style="color:#2C2C2A;">${reservation.gite.name}</strong>.</p>
      <p style="margin:0 0 20px;">Nous vous souhaitons un excellent séjour.</p>
      ${divider()}
      ${muted("Conservez ce document — il fait office de preuve de votre réservation.")}
      ${signOff(reservation.gite.name)}
    `;
    await resend.emails.send({
      from: fromEmail,
      to: reservation.clientEmail,
      subject: `Contrat signé — ${reservation.gite.name}`,
      html: buildEmailHtml({
        giteName: reservation.gite.name,
        giteAddress,
        giteLogoUrl: reservation.gite.logoUrl,
        docLabel: 'Contrat signé',
        preheader: "Votre contrat de location signé est disponible en pièce jointe.",
        greeting: reservation.clientFirstName,
        body: clientBody,
      }),
      attachments: [{ filename, content: pdfBuffer.toString("base64") }],
    });

    const notifEmail = reservation.gite.notificationEmail || reservation.gite.email || reservation.gite.user.email;
    if (notifEmail) {
      const managerBody = `
        <p style="margin:0 0 20px;">L'acompte de <strong style="color:#2C2C2A;">${reservation.clientFirstName} ${reservation.clientLastName}</strong> a été marqué comme reçu.</p>
        <p style="margin:0 0 20px;">Le contrat signé a été automatiquement envoyé au locataire. Une copie est jointe ci-dessous.</p>
        ${divider()}
        ${muted(`Séjour du ${dateEntree} au ${dateSortie} — ${reservation.gite.name}`)}
      `;
      await resend.emails.send({
        from: fromEmail,
        to: notifEmail,
        subject: `Acompte reçu — contrat envoyé à ${reservation.clientFirstName} ${reservation.clientLastName}`,
        html: buildEmailHtml({
          giteName: reservation.gite.name,
          giteAddress,
          giteLogoUrl: reservation.gite.logoUrl,
          docLabel: 'Acompte reçu',
          preheader: `Contrat envoyé à ${reservation.clientFirstName} ${reservation.clientLastName} suite à la réception de l'acompte.`,
          body: managerBody,
        }),
        attachments: [{ filename, content: pdfBuffer.toString("base64") }],
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[mark-deposit] Erreur:", message, err);
    return NextResponse.json({ error: "Erreur interne", detail: message }, { status: 500 });
  }
}
