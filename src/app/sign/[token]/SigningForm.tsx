"use client";

import { useState } from "react";

const sansSerif = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

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
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E8E6E1', overflow: 'hidden', fontFamily: sansSerif }}>
        <div style={{ height: '4px', backgroundColor: '#689D71' }} />
        <div style={{ padding: '40px 36px', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(104,157,113,0.15)', color: '#689D71', fontSize: '26px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            ✓
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#2C2C2A', letterSpacing: '-0.02em', margin: '0 0 10px', lineHeight: 1.3 }}>
            Contrat signé<span style={{ color: '#689D71' }}>.</span>
          </h2>
          <p style={{ fontSize: '14px', color: '#71716E', lineHeight: 1.6, margin: 0 }}>
            Merci <strong style={{ color: '#2C2C2A' }}>{name}</strong>. Une confirmation vient de vous être envoyée par email.
          </p>
        </div>
      </div>
    );
  }

  const disabled = !name.trim() || !consent || loading;

  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E8E6E1', overflow: 'hidden', fontFamily: sansSerif }}>
      {/* Violet accent bar */}
      <div style={{ height: '4px', backgroundColor: '#7F77DD' }} />

      <div style={{ padding: '32px 36px 36px' }}>
        <p style={{ fontSize: '10px', fontWeight: 700, color: '#A3A3A0', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
          Signature électronique
        </p>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#2C2C2A', letterSpacing: '-0.02em', margin: '0 0 14px', lineHeight: 1.3 }}>
          Signer le contrat<span style={{ color: '#7F77DD' }}>.</span>
        </h2>
        <p style={{ fontSize: '14px', color: '#71716E', lineHeight: 1.6, margin: '0 0 24px' }}>
          En signant ce contrat, vous confirmez avoir lu et accepté l'intégralité des conditions ci-dessus. Cette signature électronique a la même valeur légale qu'une signature manuscrite.
        </p>

        {/* Name input */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#A3A3A0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Tapez votre nom complet pour signer
          </label>
          <input
            type="text"
            placeholder={clientName}
            value={name}
            onChange={e => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '1px solid #E8E6E1',
              backgroundColor: '#FAFAF7',
              fontSize: '15px',
              fontFamily: sansSerif,
              color: '#2C2C2A',
              outline: 'none',
              borderRadius: '10px',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = '#7F77DD'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#E8E6E1'; }}
          />
        </div>

        {/* Consent checkbox */}
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', padding: '14px 16px', backgroundColor: '#FAFAF7', border: '1px solid #E8E6E1', borderRadius: '10px', marginBottom: '20px' }}>
          <input
            type="checkbox"
            checked={consent}
            onChange={e => setConsent(e.target.checked)}
            style={{ marginTop: '3px', flexShrink: 0, width: '16px', height: '16px', accentColor: '#7F77DD', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '13px', color: '#2C2C2A', lineHeight: 1.6 }}>
            J'ai lu et j'accepte les conditions du contrat de location. Je reconnais que cette signature électronique engage ma responsabilité au même titre qu'une signature manuscrite.
          </span>
        </label>

        {/* Error */}
        {error && (
          <div style={{ padding: '12px 16px', backgroundColor: '#FBECEC', border: '1px solid #F3D1D1', borderRadius: '10px', marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', color: '#B23A3A', margin: 0, lineHeight: 1.5 }}>{error}</p>
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSign}
          disabled={disabled}
          style={{
            width: '100%',
            padding: '16px',
            fontFamily: sansSerif,
            fontSize: '15px',
            fontWeight: 700,
            letterSpacing: '0.01em',
            backgroundColor: disabled ? '#C9D4CC' : '#689D71',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '11px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.15s',
          }}
        >
          {loading ? 'Signature en cours…' : 'Signer le contrat →'}
        </button>

        <p style={{ fontSize: '11px', color: '#A3A3A0', textAlign: 'center', lineHeight: 1.5, margin: '16px 0 0' }}>
          Votre IP et l'horodatage seront enregistrés pour garantir la validité légale de la signature.
        </p>
      </div>
    </div>
  );
}
