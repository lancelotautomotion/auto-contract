export default function StepVisual({ step }: { step: string }) {
  if (step === '01') return <VisualConfig />;
  if (step === '02') return <VisualReservation />;
  if (step === '03') return <VisualEmail />;
  if (step === '04') return <VisualSignature />;
  if (step === '05') return <VisualArchive />;
  return null;
}

/* ─────────────────────────────────────────── 01 · Configuration ── */
function VisualConfig() {
  return (
    <div className="sv-card">
      <div className="sv-head">
        <div className="sv-crumb">Kordia / <strong>Mon hébergement</strong></div>
        <span className="sv-progress">1 / 3</span>
      </div>
      <div className="sv-body">
        <div className="sv-title-sm">Informations du gîte</div>
        <div className="sv-field">
          <label>Nom du gîte</label>
          <div className="sv-input">Le Mas des Oliviers</div>
        </div>
        <div className="sv-field">
          <label>Adresse</label>
          <div className="sv-input">12 chemin du Luberon, 84400 Apt</div>
        </div>
        <div className="sv-field">
          <label>Logo</label>
          <div className="sv-upload">
            <span className="sv-upload-ico">
              <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M3 7l3 3 5-6" stroke="#4A7353" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <span className="sv-upload-name">logo-mas-oliviers.png</span>
            <span className="sv-upload-meta">42 Ko</span>
          </div>
        </div>
        <div className="sv-field">
          <label>Pièces jointes</label>
          <div className="sv-chips">
            <span className="sv-chip">RIB.pdf</span>
            <span className="sv-chip">Règlement intérieur.pdf</span>
          </div>
        </div>
        <div className="sv-actions">
          <button className="sv-btn-violet">Continuer</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── 02 · Réservation ── */
function VisualReservation() {
  return (
    <div className="sv-card">
      <div className="sv-head">
        <div className="sv-crumb">Kordia / <strong>Nouvelle réservation</strong></div>
      </div>
      <div className="sv-body">
        <div className="sv-grid-2">
          <div className="sv-field">
            <label>Prénom</label>
            <div className="sv-input">Martin</div>
          </div>
          <div className="sv-field">
            <label>Nom</label>
            <div className="sv-input">Dupont</div>
          </div>
        </div>
        <div className="sv-field">
          <label>Email</label>
          <div className="sv-input">martin.dupont@email.fr</div>
        </div>
        <div className="sv-grid-2">
          <div className="sv-field">
            <label>Arrivée</label>
            <div className="sv-input">14 juillet 2025</div>
          </div>
          <div className="sv-field">
            <label>Départ</label>
            <div className="sv-input">21 juillet 2025</div>
          </div>
        </div>
        <div className="sv-grid-2">
          <div className="sv-field">
            <label>Loyer</label>
            <div className="sv-input">1 400 €</div>
          </div>
          <div className="sv-field">
            <label>Acompte</label>
            <div className="sv-input">400 €</div>
          </div>
        </div>
        <div className="sv-field">
          <label>Options</label>
          <div className="sv-opts">
            <span className="sv-opt checked">
              <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><path d="M3 6l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Ménage
            </span>
            <span className="sv-opt checked">
              <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><path d="M3 6l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Linge de toilette
            </span>
            <span className="sv-opt">Bain nordique</span>
          </div>
        </div>
        <div className="sv-actions">
          <button className="sv-btn-green">Générer le contrat</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── 03 · Email + contrat ── */
function VisualEmail() {
  return (
    <div className="sv-card sv-mail">
      <div className="sv-mail-head">
        <div className="sv-mail-dots">
          <span /><span /><span />
        </div>
        <div className="sv-mail-subject">Contrat de location — Le Mas des Oliviers</div>
      </div>
      <div className="sv-mail-body">
        <div className="sv-mail-meta">
          <div><span className="sv-mail-key">De</span><span>Le Mas des Oliviers &lt;hello@kordia.fr&gt;</span></div>
          <div><span className="sv-mail-key">À</span><span>martin.dupont@email.fr</span></div>
        </div>
        <p>Bonjour Martin,</p>
        <p>Veuillez trouver ci-joint votre contrat de location pour le séjour du <strong>14 au 21 juillet 2025</strong>. Cliquez sur le bouton ci-dessous pour le lire et le signer en ligne.</p>
        <div className="sv-mail-btn">
          Signer mon contrat
          <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M3 7h8m-3-3l3 3-3 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <div className="sv-mail-attach">
          <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
            <path d="M6 2h6l3 3v11a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="#7F77DD" strokeWidth="1.3" strokeLinejoin="round" />
            <path d="M12 2v3h3" stroke="#7F77DD" strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
          <div className="sv-mail-attach-right">
            <div>Contrat_MartinDupont.pdf</div>
            <div className="sv-mail-attach-sub">178 Ko · PDF</div>
          </div>
        </div>
        <div className="sv-mail-attach">
          <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
            <path d="M6 2h6l3 3v11a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="#7F77DD" strokeWidth="1.3" strokeLinejoin="round" />
            <path d="M12 2v3h3" stroke="#7F77DD" strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
          <div className="sv-mail-attach-right">
            <div>RIB.pdf · Règlement intérieur.pdf</div>
            <div className="sv-mail-attach-sub">Pièces jointes</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── 04 · Signature mobile ── */
function VisualSignature() {
  return (
    <div className="sv-phone-wrap">
      <div className="sv-phone">
        <div className="sv-phone-notch" />
        <div className="sv-phone-screen">
          <div className="sv-phone-head">kordia.fr/sign</div>
          <div className="sv-ctr-title">Contrat de location</div>
          <div className="sv-ctr-sub">Le Mas des Oliviers — Été 2025</div>
          <div className="sv-ctr-rows">
            <div><span>Locataire</span><strong>Martin Dupont</strong></div>
            <div><span>Séjour</span><strong>14 – 21 juil. 2025</strong></div>
            <div><span>Montant</span><strong>1 400 €</strong></div>
          </div>
          <div className="sv-sig-box">
            <div className="sv-sig-lbl">Signature électronique · eIDAS</div>
            <div className="sv-sig-name">Martin Dupont</div>
          </div>
          <button className="sv-phone-btn">
            <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M3 7l2.5 2.5L11 4.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Valider ma signature
          </button>
          <div className="sv-phone-meta">
            <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
              <rect x="2.5" y="5" width="7" height="5" rx="1" stroke="#A3A3A0" strokeWidth="1.2" />
              <path d="M4 5V3.5a2 2 0 014 0V5" stroke="#A3A3A0" strokeWidth="1.2" />
            </svg>
            Connexion sécurisée · horodatage + IP
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── 05 · Dashboard archivé ── */
function VisualArchive() {
  return (
    <div className="sv-card">
      <div className="sv-head">
        <div className="sv-crumb">Kordia / <strong>Réservations</strong></div>
        <span className="sv-progress green">Mis à jour</span>
      </div>
      <div className="sv-body sv-arch-body">
        <div className="sv-row">
          <div className="sv-row-av">MD</div>
          <div className="sv-row-main">
            <div className="sv-row-name">Martin Dupont</div>
            <div className="sv-row-dates">14 – 21 juil. 2025 · 1 400 €</div>
          </div>
          <span className="sv-pill signed">
            <svg width="10" height="10" fill="none" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke="#4A7353" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Signé
          </span>
        </div>

        <div className="sv-notif">
          <div className="sv-notif-ico">
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
              <path d="M8 2v8m0 0l-3-3m3 3l3-3" stroke="#4A7353" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 13h10" stroke="#4A7353" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="sv-notif-text">
            <div className="sv-notif-title">Contrat signé archivé</div>
            <div className="sv-notif-sub">Envoyé au locataire et à vous · PDF horodaté</div>
          </div>
          <div className="sv-notif-meta">il y a 2 min</div>
        </div>

        <div className="sv-files">
          <div className="sv-file">
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
              <path d="M5 2h5l3 3v9a1 1 0 01-1 1H5a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="#7F77DD" strokeWidth="1.3" strokeLinejoin="round" />
              <path d="M10 2v3h3" stroke="#7F77DD" strokeWidth="1.3" strokeLinejoin="round" />
            </svg>
            <span>Contrat_MartinDupont_signé.pdf</span>
            <span className="sv-file-size">214 Ko</span>
          </div>
        </div>
      </div>
    </div>
  );
}
