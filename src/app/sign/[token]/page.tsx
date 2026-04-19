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
    : reservation.reservationOptions.map(o => o.price > 0 ? `- ${o.label} : ${o.price.toFixed(2).replace('.', ',')} €` : `- ${o.label} : inclus`).join('\n');

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

  const sansSerif = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F3F2EE', fontFamily: sansSerif, color: '#2C2C2A' }}>
      {/* HEADER */}
      <header style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '760px', margin: '0 auto' }}>
        <span style={{ fontSize: '15px', fontWeight: 800, color: '#2C2C2A', letterSpacing: '-0.02em' }}>
          {reservation.gite.name}
        </span>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#A3A3A0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Contrat de location
        </span>
      </header>

      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '8px 20px 48px' }}>
        {/* GREETING */}
        <div style={{ padding: '0 4px 24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#2C2C2A', letterSpacing: '-0.03em', margin: '0 0 6px', lineHeight: 1.2 }}>
            Bonjour {reservation.clientFirstName}<span style={{ color: '#7F77DD' }}>.</span>
          </h1>
          <p style={{ fontSize: '15px', color: '#71716E', lineHeight: 1.6, margin: 0 }}>
            Votre contrat de location est prêt. Relisez-le attentivement puis signez-le en bas de page.
          </p>
        </div>

        {/* MAIN CARD */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E8E6E1', overflow: 'hidden' }}>
          {/* Violet accent bar */}
          <div style={{ height: '4px', backgroundColor: '#7F77DD' }} />

          {/* Already signed banner */}
          {alreadySigned && (
            <div style={{ padding: '16px 32px', backgroundColor: '#EFEEF9', borderBottom: '1px solid #E8E6E1', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: 'rgba(127,119,221,0.18)', color: '#5B52B5', fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                ✓
              </div>
              <p style={{ fontSize: '13px', color: '#5B52B5', margin: 0, lineHeight: 1.5 }}>
                Ce contrat a été signé électroniquement le{' '}
                <strong style={{ color: '#5B52B5' }}>
                  {contract.signedAt ? fmtLong(contract.signedAt) : ''}
                </strong>{' '}
                par <strong style={{ color: '#5B52B5' }}>{contract.signedByName}</strong>.
              </p>
            </div>
          )}

          {/* RECAP CARD */}
          <div style={{ padding: '32px 36px 0' }}>
            <div style={{ backgroundColor: '#FCFFF2', border: '1px solid #E8E6E1', borderRadius: '12px', padding: '20px 24px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                <div style={{ flex: '1 1 160px', minWidth: '140px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: '#A3A3A0', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Arrivée</p>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: '#2C2C2A', margin: '0 0 14px' }}>{fmtLong(reservation.checkIn)}</p>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: '#A3A3A0', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Départ</p>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: '#2C2C2A', margin: 0 }}>{fmtLong(reservation.checkOut)}</p>
                </div>
                <div style={{ flex: '1 1 160px', minWidth: '140px', borderLeft: '1px solid #E8E6E1', paddingLeft: '24px' }}>
                  {rentFormatted && (
                    <>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: '#A3A3A0', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Montant total</p>
                      <p style={{ fontSize: '15px', fontWeight: 700, color: '#2C2C2A', margin: '0 0 14px' }}>{rentFormatted}</p>
                    </>
                  )}
                  {depositFormatted && (
                    <>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: '#A3A3A0', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Acompte à régler</p>
                      <p style={{ fontSize: '15px', fontWeight: 700, color: '#689D71', margin: 0 }}>{depositFormatted}</p>
                    </>
                  )}
                  {!rentFormatted && !depositFormatted && (
                    <>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: '#A3A3A0', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Logement</p>
                      <p style={{ fontSize: '15px', fontWeight: 700, color: '#2C2C2A', margin: 0 }}>{reservation.gite.name}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* CONTRACT TEXT */}
          <div style={{ padding: '28px 36px 36px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#A3A3A0', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 14px' }}>
              Contrat à signer
            </p>
            <div style={{ backgroundColor: '#FAFAF7', border: '1px solid #E8E6E1', borderRadius: '12px', padding: '28px 32px', maxHeight: '520px', overflowY: 'auto' }}>
              <pre style={{ fontFamily: sansSerif, fontSize: '13px', lineHeight: 1.7, color: '#2C2C2A', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                {contractText}
              </pre>
            </div>
          </div>
        </div>

        {/* SIGNING FORM */}
        {!alreadySigned && (
          <div style={{ marginTop: '24px' }}>
            <SigningForm token={token} clientName={`${reservation.clientFirstName} ${reservation.clientLastName}`} />
          </div>
        )}

        {/* FOOTER */}
        <div style={{ padding: '32px 0 0', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#A3A3A0', lineHeight: 1.6, margin: '0 0 4px' }}>
            Signature conforme au règlement eIDAS · Envoyé par <strong style={{ color: '#71716E' }}>{reservation.gite.name}</strong>
          </p>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#7F77DD', letterSpacing: '0.02em', margin: '8px 0 0' }}>
            Prysme
          </p>
        </div>
      </main>
    </div>
  );
}
