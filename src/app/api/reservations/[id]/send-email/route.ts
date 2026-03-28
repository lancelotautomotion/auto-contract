import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateContractPdf, ContractData } from "@/lib/contractPdf";
import { DEFAULT_CONTRACT_TEMPLATE } from "@/lib/defaultContractTemplate";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const reservation = await prisma.reservation.findFirst({
    where: { id, gite: { userId: dbUser.id } },
    include: { gite: true, reservationOptions: true },
  });
  if (!reservation) return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY non configurée dans les variables d'environnement" }, { status: 500 });
  }

  const fmt = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const data: ContractData = {
    template: reservation.gite.contractTemplate ?? DEFAULT_CONTRACT_TEMPLATE,
    nom_client: reservation.clientLastName,
    prenom_client: reservation.clientFirstName,
    email_client: reservation.clientEmail,
    telephone_client: reservation.clientPhone,
    adresse_client: reservation.clientAddress,
    ville_client: reservation.clientCity,
    code_postal_client: reservation.clientZipCode,
    date_entree: fmt(reservation.checkIn),
    date_sortie: fmt(reservation.checkOut),
    loyer: reservation.rent ?? 0,
    acompte: reservation.deposit ?? 0,
    menage: reservation.cleaningFee ?? 0,
    taxe_sejour: reservation.touristTax ?? 0,
    options: reservation.reservationOptions.map(o => ({ label: o.label, price: o.price })),
    nom_gite: reservation.gite.name,
    adresse_gite: reservation.gite.address,
    ville_gite: reservation.gite.city,
    email_gite: reservation.gite.email,
    telephone_gite: reservation.gite.phone,
  };

  const pdfBuffer = await generateContractPdf(data);

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
  const dateEntree = fmt(reservation.checkIn);
  const dateSortie = fmt(reservation.checkOut);

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: reservation.clientEmail,
    subject: `Votre contrat de location — ${reservation.gite.name}`,
    html: `
      <p>Bonjour ${reservation.clientFirstName},</p>
      <p>Veuillez trouver ci-joint votre contrat de location pour votre séjour du <strong>${dateEntree}</strong> au <strong>${dateSortie}</strong> au ${reservation.gite.name}.</p>
      <p>Merci de le lire attentivement et de nous le retourner signé.</p>
      <p>Cordialement,<br/>${reservation.gite.name}</p>
    `,
    attachments: [{
      filename: `contrat-${reservation.clientLastName}-${reservation.clientFirstName}.pdf`,
      content: pdfBuffer.toString('base64'),
    }],
  });

  if (error) {
    console.error('Resend error:', error);
    return NextResponse.json({ error: "Erreur lors de l'envoi de l'email" }, { status: 500 });
  }

  await prisma.contract.upsert({
    where: { reservationId: id },
    create: { reservationId: id, status: 'GENERATED', emailStatus: 'SENT', emailSentAt: new Date() },
    update: { status: 'GENERATED', emailStatus: 'SENT', emailSentAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
