import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DEFAULT_CONTRACT_TEMPLATE } from "@/lib/defaultContractTemplate";
import SigningForm from "./SigningForm";

function replaceVars(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce((t, [k, v]) => t.replaceAll(`{{${k}}}`, v), template);
}

export default async function SignPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const contract = await prisma.contract.findUnique({
    where: { signatureToken: token },
    include: {
      reservation: {
        include: { gite: true, reservationOptions: true },
      },
    },
  });

  if (!contract || !contract.reservation) notFound();

  const { reservation } = contract;
  const fmt = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const solde = Math.max(0, (reservation.rent ?? 0) - (reservation.deposit ?? 0));
  const optionsText = reservation.reservationOptions.length === 0
    ? 'Aucune option sélectionnée'
    : reservation.reservationOptions.map(o => o.price > 0 ? `- ${o.label} : ${o.price.toFixed(2).replace('.', ',')} €` : `- ${o.label} : inclus`).join('\n');

  const vars: Record<string, string> = {
    nom_client: reservation.clientLastName,
    prenom_client: reservation.clientFirstName,
    email_client: reservation.clientEmail,
    telephone_client: reservation.clientPhone,
    adresse_client: reservation.clientAddress ?? '',
    ville_client: reservation.clientCity ?? '',
    code_postal_client: reservation.clientZipCode ?? '',
    date_entree: fmt(reservation.checkIn),
    date_sortie: fmt(reservation.checkOut),
    loyer: (reservation.rent ?? 0).toFixed(2).replace('.', ','),
    acompte: (reservation.deposit ?? 0).toFixed(2).replace('.', ','),
    solde: solde.toFixed(2).replace('.', ','),
    menage: (reservation.cleaningFee ?? 0).toFixed(2).replace('.', ','),
    taxe_sejour: (reservation.touristTax ?? 0).toFixed(2).replace('.', ','),
    options: optionsText,
    nom_gite: reservation.gite.name,
    adresse_gite: reservation.gite.address ?? '',
    ville_gite: reservation.gite.city ?? '',
    email_gite: reservation.gite.email ?? '',
    telephone_gite: reservation.gite.phone ?? '',
    date_du_jour: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
  };

  const contractText = replaceVars(reservation.gite.contractTemplate ?? DEFAULT_CONTRACT_TEMPLATE, vars);
  const alreadySigned = contract.status === 'SIGNED';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#EDE8E1', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ padding: '20px 40px', borderBottom: '1px solid #CEC8BF', backgroundColor: '#EDE8E1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7A7570' }}>Prysme</span>
        <span style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7A7570' }}>{reservation.gite.name}</span>
      </header>

      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7A7570', marginBottom: '10px' }}>— Contrat de location</p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '40px', fontWeight: 300, color: '#1C1C1A', margin: '0 0 6px' }}>
            {reservation.clientFirstName} {reservation.clientLastName}
          </h1>
          <p style={{ fontSize: '13px', color: '#7A7570', margin: 0 }}>
            Séjour du {fmt(reservation.checkIn)} au {fmt(reservation.checkOut)} · {reservation.gite.name}
          </p>
        </div>

        {alreadySigned && (
          <div style={{ marginBottom: '24px', padding: '16px 20px', backgroundColor: '#1C1C1A', borderRadius: '10px' }}>
            <p style={{ fontSize: '12px', color: '#EDE8E1', margin: 0 }}>
              ✓ Ce contrat a été signé électroniquement le {contract.signedAt ? new Date(contract.signedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : ''} par {contract.signedByName}.
            </p>
          </div>
        )}

        {/* Contrat */}
        <div style={{ backgroundColor: '#F7F4F0', border: '1px solid #CEC8BF', borderRadius: '12px', padding: '40px', marginBottom: '32px' }}>
          <pre style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', lineHeight: '1.8', color: '#1C1C1A', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
            {contractText}
          </pre>
        </div>

        {!alreadySigned && <SigningForm token={token} clientName={`${reservation.clientFirstName} ${reservation.clientLastName}`} />}
      </main>
    </div>
  );
}
