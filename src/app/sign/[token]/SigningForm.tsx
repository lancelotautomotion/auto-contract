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
      <div style={{ padding: '32px', backgroundColor: '#1C1C1A', borderRadius: '12px', textAlign: 'center' }}>
        <p style={{ fontSize: '20px', color: '#EDE8E1', fontFamily: 'Cormorant Garamond, Georgia, serif', marginBottom: '12px' }}>Contrat signé ✓</p>
        <p style={{ fontSize: '13px', color: '#7A7570', margin: 0 }}>
          Merci {name}. Vous allez recevoir une confirmation avec le contrat signé par email.
        </p>
      </div>
    );
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px', border: '1px solid #CEC8BF',
    backgroundColor: '#F7F4F0', fontSize: '14px', color: '#1C1C1A',
    outline: 'none', borderRadius: '8px', boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ backgroundColor: '#F7F4F0', border: '1px solid #CEC8BF', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ padding: '16px 32px', borderBottom: '1px solid #CEC8BF', backgroundColor: '#E5DED5' }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7A7570', margin: 0 }}>Signature électronique</p>
      </div>
      <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <p style={{ fontSize: '12px', color: '#7A7570', margin: '0 0 4px' }}>
            En signant ce contrat, vous confirmez avoir lu et accepté l'intégralité des conditions ci-dessus.
            Cette signature électronique a la même valeur légale qu'une signature manuscrite (règlement eIDAS).
          </p>
        </div>
        <div>
          <label style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7A7570', display: 'block', marginBottom: '6px' }}>
            Tapez votre nom complet pour signer *
          </label>
          <input
            type="text"
            placeholder={clientName}
            value={name}
            onChange={e => setName(e.target.value)}
            style={inputStyle}
          />
        </div>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={consent}
            onChange={e => setConsent(e.target.checked)}
            style={{ marginTop: '3px', flexShrink: 0, accentColor: '#1C1C1A' }}
          />
          <span style={{ fontSize: '12px', color: '#1C1C1A', lineHeight: 1.6 }}>
            J'ai lu et j'accepte les conditions du contrat de location. Je reconnais que cette signature électronique engage ma responsabilité au même titre qu'une signature manuscrite.
          </span>
        </label>

        {error && <p style={{ fontSize: '12px', color: '#c0392b', margin: 0 }}>{error}</p>}

        <button
          onClick={handleSign}
          disabled={!name.trim() || !consent || loading}
          style={{
            padding: '14px', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase',
            backgroundColor: (!name.trim() || !consent || loading) ? '#CEC8BF' : '#1C1C1A',
            color: '#EDE8E1', border: 'none', borderRadius: '8px',
            cursor: (!name.trim() || !consent || loading) ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Signature en cours...' : 'Signer le contrat →'}
        </button>
      </div>
    </div>
  );
}
