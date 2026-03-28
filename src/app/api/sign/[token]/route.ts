import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSignedContractPdf, ContractData } from "@/lib/contractPdf";
import { DEFAULT_CONTRACT_TEMPLATE } from "@/lib/defaultContractTemplate";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { name } = await req.json();

  if (!name?.trim()) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });

  const contract = await prisma.contract.findUnique({
    where: { signatureToken: token },
    include: {
      reservation: {
        include: { gite: true, reservationOptions: true },
      },
    },
  });

  if (!contract || !contract.reservation) return NextResponse.json({ error: 'Lien invalide' }, { status: 404 });
  if (contract.status === 'SIGNED') return NextResponse.json({ error: 'Déjà signé' }, { status: 400 });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? 'inconnue';
  const signedAt = new Date();
  const { reservation } = contract;

  // Mettre à jour le contrat
  await prisma.contract.update({
    where: { id: contract.id },
    data: { status: 'SIGNED', signedAt, signedByName: name.trim(), signedByIp: ip },
  });

  // Générer le PDF signé
  const fmt = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const solde = Math.max(0, (reservation.rent ?? 0) - (reservation.deposit ?? 0));
  const optionsText = reservation.reservationOptions.length === 0
    ? 'Aucune option sélectionnée'
    : reservation.reservationOptions.map(o => o.price > 0 ? `- ${o.label} : ${o.price.toFixed(2).replace('.', ',')} €` : `- ${o.label} : inclus`).join('\n');

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
  void solde; void optionsText;

  const pdfBuffer = await generateSignedContractPdf(data, {
    signedByName: name.trim(),
    signedAt,
    signedByIp: ip,
    reservationId: reservation.id,
  });

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
  const filename = `contrat-signe-${reservation.clientLastName}-${reservation.clientFirstName}.pdf`;
  const dateEntree = fmt(reservation.checkIn);
  const dateSortie = fmt(reservation.checkOut);

  // Email au client
  await resend.emails.send({
    from: fromEmail,
    to: reservation.clientEmail,
    subject: `Contrat signé — ${reservation.gite.name}`,
    html: `
      <p>Bonjour ${reservation.clientFirstName},</p>
      <p>Votre contrat de location pour le séjour du <strong>${dateEntree}</strong> au <strong>${dateSortie}</strong> au ${reservation.gite.name} a bien été signé électroniquement.</p>
      <p>Veuillez trouver ci-joint votre exemplaire signé.</p>
      <p>Cordialement,<br/>${reservation.gite.name}</p>
    `,
    attachments: [{ filename, content: pdfBuffer.toString('base64') }],
  });

  // Email au gérant
  if (reservation.gite.email) {
    await resend.emails.send({
      from: fromEmail,
      to: reservation.gite.email,
      subject: `Contrat signé par ${reservation.clientFirstName} ${reservation.clientLastName}`,
      html: `
        <p>Le contrat de ${reservation.clientFirstName} ${reservation.clientLastName} pour le séjour du <strong>${dateEntree}</strong> au <strong>${dateSortie}</strong> vient d'être signé électroniquement.</p>
        <p>Le contrat signé est en pièce jointe.</p>
      `,
      attachments: [{ filename, content: pdfBuffer.toString('base64') }],
    });
  }

  return NextResponse.json({ success: true });
}
