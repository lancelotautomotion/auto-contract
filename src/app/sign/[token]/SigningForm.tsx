"use client";

import { useState } from "react";

export default function SigningForm({ token, clientName }: { token: string; clientName: string }) {
  const [name, setName] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSign = async () => {
    if (!name.trim() || !consent) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sign/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (res.ok) setDone(true);
      else setError(data.error ?? 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="sign-form-card">
        <div className="sign-card-bar g"/>
        <div className="sign-success-inner">
          <div className="sign-success-icon">
            <svg width="28" height="28" fill="none" viewBox="0 0 28 28">
              <path d="M7 14l5 5L21 9" stroke="#4A7353" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2>Contrat signé<span className="g">.</span></h2>
          <p>
            Merci <strong>{name}</strong>. Une confirmation vous a été envoyée par email.
          </p>
        </div>
      </div>
    );
  }

  const disabled = !name.trim() || !consent || loading;

  return (
    <div className="sign-form-card">
      <div className="sign-card-bar"/>
      <div className="sign-form-inner">
        <p className="sign-form-tag">Signature électronique</p>
        <h2 className="sign-form-title">Signer le contrat<span className="v">.</span></h2>
        <p className="sign-form-desc">
          En signant ce contrat, vous confirmez avoir lu et accepté l&apos;intégralité des conditions ci-dessus.
          Cette signature électronique a la même valeur légale qu&apos;une signature manuscrite.
        </p>

        <div className="sign-input-wrap">
          <label className="sign-field-label" htmlFor="sign-name">
            Tapez votre nom complet pour signer
          </label>
          <input
            id="sign-name"
            type="text"
            placeholder={clientName}
            value={name}
            onChange={e => setName(e.target.value)}
            className="sign-input"
            onKeyDown={e => e.key === 'Enter' && !disabled && handleSign()}
          />
        </div>

        <label className="sign-consent">
          <input
            type="checkbox"
            checked={consent}
            onChange={e => setConsent(e.target.checked)}
          />
          <span className="sign-consent-text">
            J&apos;ai lu et j&apos;accepte les conditions du contrat de location. Je reconnais que cette signature
            électronique engage ma responsabilité au même titre qu&apos;une signature manuscrite.
          </span>
        </label>

        {error && (
          <div className="sign-error">
            <p>{error}</p>
          </div>
        )}

        <button
          type="button"
          className="sign-btn"
          onClick={handleSign}
          disabled={disabled}
        >
          {loading ? (
            <span className="sign-spinner"/>
          ) : (
            <>
              Signer le contrat
              <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                <path d="M3 8h10m-4-4l4 4-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </>
          )}
        </button>

        <p className="sign-btn-note">
          Votre IP et l&apos;horodatage sont enregistrés pour garantir la validité légale de la signature.
        </p>
      </div>
    </div>
  );
}
