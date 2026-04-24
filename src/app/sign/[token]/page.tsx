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
  const fmtShort = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const fmtLong = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  const solde = Math.max(0, (reservation.rent ?? 0) - (reservation.deposit ?? 0));
  const optionsText = reservation.reservationOptions.length === 0
    ? 'Aucune option sélectionnée'
    : reservation.reservationOptions.map(o =>
        o.price > 0 ? `- ${o.label} : ${o.price.toFixed(2).replace('.', ',')} €` : `- ${o.label} : inclus`
      ).join('\n');

  const vars: Record<string, string> = {
    nom_client: reservation.clientLastName,
    prenom_client: reservation.clientFirstName,
    email_client: reservation.clientEmail,
    telephone_client: reservation.clientPhone,
    adresse_client: reservation.clientAddress ?? '',
    ville_client: reservation.clientCity ?? '',
    code_postal_client: reservation.clientZipCode ?? '',
    date_entree: fmtShort(reservation.checkIn),
    date_sortie: fmtShort(reservation.checkOut),
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
  const rentFormatted = reservation.rent != null ? `${reservation.rent.toFixed(2).replace('.', ',')} €` : null;
  const depositFormatted = reservation.deposit != null ? `${reservation.deposit.toFixed(2).replace('.', ',')} €` : null;

  return (
    <>
      <header className="sign-header">
        <span className="sign-header-name">{reservation.gite.name}</span>
        <span className="sign-header-label">Contrat de location</span>
      </header>

      <main className="sign-main">
        {/* Greeting */}
        <div className="sign-greeting">
          <h1>Bonjour {reservation.clientFirstName}<span className="v">.</span></h1>
          <p>Votre contrat de location est prêt. Relisez-le attentivement puis signez-le en bas de page.</p>
        </div>

        {/* Main card */}
        <div className="sign-card">
          <div className="sign-card-bar"/>

          {alreadySigned && (
            <div className="sign-signed-banner">
              <div className="sign-signed-icon">✓</div>
              <p className="sign-signed-text">
                Ce contrat a été signé électroniquement le{' '}
                <strong>{contract.signedAt ? fmtLong(contract.signedAt) : ''}</strong>{' '}
                par <strong>{contract.signedByName}</strong>.
              </p>
            </div>
          )}

          {/* Récap dates + montants */}
          <div className="sign-recap-wrap">
            <div className="sign-recap">
              <div className="sign-recap-grid">
                <div className="sign-recap-col">
                  <p className="sign-recap-key">Arrivée</p>
                  <p className="sign-recap-val">{fmtLong(reservation.checkIn)}</p>
                  <p className="sign-recap-key">Départ</p>
                  <p className="sign-recap-val" style={{ marginBottom: 0 }}>{fmtLong(reservation.checkOut)}</p>
                </div>
                <div className="sign-recap-col">
                  {rentFormatted ? (
                    <>
                      <p className="sign-recap-key">Montant total</p>
                      <p className="sign-recap-val">{rentFormatted}</p>
                    </>
                  ) : null}
                  {depositFormatted ? (
                    <>
                      <p className="sign-recap-key">Acompte à régler</p>
                      <p className="sign-recap-val g" style={{ marginBottom: 0 }}>{depositFormatted}</p>
                    </>
                  ) : null}
                  {!rentFormatted && !depositFormatted && (
                    <>
                      <p className="sign-recap-key">Logement</p>
                      <p className="sign-recap-val" style={{ marginBottom: 0 }}>{reservation.gite.name}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Texte du contrat */}
          <div className="sign-contract-wrap">
            <p className="sign-contract-label">Contrat à signer</p>
            <div className="sign-contract-box">
              <pre className="sign-contract-text">{contractText}</pre>
            </div>
          </div>
        </div>

        {/* Formulaire de signature */}
        {!alreadySigned && (
          <SigningForm
            token={token}
            clientName={`${reservation.clientFirstName} ${reservation.clientLastName}`}
          />
        )}

        {/* Footer */}
        <div className="sign-footer">
          <p>Signature conforme au règlement eIDAS · Envoyé par <strong>{reservation.gite.name}</strong></p>
          <p className="sign-footer-brand">Prysme</p>
        </div>
      </main>
    </>
  );
}
