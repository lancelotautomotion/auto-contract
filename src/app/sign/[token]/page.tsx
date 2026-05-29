import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateContractPdf } from "@/lib/contractPdf";
import { resolveReservationProperty, buildContractData } from "@/lib/reservationProperty";
import SigningForm from "./SigningForm";
import ContractPdfViewer from "./ContractPdfViewer";

export default async function SignPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const contract = await prisma.contract.findUnique({
    where: { signatureToken: token },
    include: {
      reservation: {
        include: { gite: true, guesthouse: true, reservationOptions: true, meals: true },
      },
    },
  });

  if (!contract || !contract.reservation) notFound();

  const { reservation } = contract;
  const property = resolveReservationProperty(reservation);
  if (!property) notFound();
  const fmtLong  = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  // Generate PDF server-side — avoids any client-side API route routing issues
  const data = buildContractData({ reservation, property });
  const pdfBuffer = await generateContractPdf(data);
  const pdfBase64 = pdfBuffer.toString('base64');

  const alreadySigned = contract.status === 'SIGNED';
  const rentFormatted = reservation.rent != null ? `${reservation.rent.toFixed(2).replace('.', ',')} €` : null;
  const depositFormatted = reservation.deposit != null ? `${reservation.deposit.toFixed(2).replace('.', ',')} €` : null;

  return (
    <>
      <header className="sign-header">
        <span className="sign-header-name">{property.name}</span>
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
                      <p className="sign-recap-val" style={{ marginBottom: 0 }}>{property.name}</p>
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
          <p>Signature conforme au règlement eIDAS · Envoyé par <strong>{property.name}</strong></p>
          <p className="sign-footer-brand">Kordia</p>
        </div>
      </main>
    </>
  );
}
