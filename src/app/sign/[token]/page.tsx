import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateContractPdf, ContractData } from "@/lib/contractPdf";
import { DEFAULT_CONTRACT_TEMPLATE, mergeTemplates } from "@/lib/defaultContractTemplate";
import SigningForm from "./SigningForm";
import ContractPdfViewer from "./ContractPdfViewer";

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
  const fmtLong  = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  // Generate PDF server-side — avoids any client-side API route routing issues
  const data: ContractData = {
    template: mergeTemplates(reservation.gite.contractTemplateGeneral ?? DEFAULT_CONTRACT_TEMPLATE, reservation.gite.contractTemplateHouseRules),
    nom_client: reservation.clientLastName,
    prenom_client: reservation.clientFirstName,
    email_client: reservation.clientEmail,
    telephone_client: reservation.clientPhone,
    adresse_client: reservation.clientAddress,
    ville_client: reservation.clientCity,
    code_postal_client: reservation.clientZipCode,
    date_entree: fmtShort(reservation.checkIn),
    date_sortie: fmtShort(reservation.checkOut),
    loyer: reservation.rent ?? 0,
    acompte: reservation.deposit ?? 0,
    menage: reservation.cleaningFee ?? 0,
    taxe_sejour: reservation.touristTax ?? 0,
    options: reservation.reservationOptions.map(o => ({ label: o.label, price: o.price })),
    nom_gite: reservation.gite.name,
    adresse_gite: reservation.gite.address,
    ville_gite: reservation.gite.city,
    code_postal_gite: reservation.gite.zipCode,
    email_gite: reservation.gite.email,
    telephone_gite: reservation.gite.phone,
    logoUrl: reservation.gite.logoUrl,
  };
  const pdfBuffer = await generateContractPdf(data);
  const pdfBase64 = pdfBuffer.toString('base64');

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

          {/* PDF du contrat */}
          <div className="sign-contract-wrap">
            <p className="sign-contract-label">Contrat à signer</p>
            <ContractPdfViewer pdfBase64={pdfBase64} />
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
          <p className="sign-footer-brand">Kordia</p>
        </div>
      </main>
    </>
  );
}
