"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingForm({ defaultEmail }: { defaultEmail: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    giteName: '', email: defaultEmail, phone: '',
    address: '', city: '', zipCode: '',
  });
  const [cguAccepted, setCguAccepted] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.giteName.trim()) { setError("Le nom de l'hébergement est requis."); return; }
    if (!cguAccepted) { setError("Vous devez accepter les CGU pour continuer."); return; }
    setLoading(true);
    setError(null);

    const slug = form.giteName.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, slug }),
      });
      if (res.ok) {
        router.push('/dashboard');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Une erreur est survenue. Veuillez réessayer.");
      }
    } catch {
      setError("Impossible de contacter le serveur. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>

      {/* Section 1 — Hébergement */}
      <div className="ob-section">
        <p className="ob-section-title">Votre hébergement</p>
        <div className="ob-field">
          <label className="ob-label">Nom de l&apos;hébergement *</label>
          <input className="ob-input" placeholder="Le Clos du Marida" required
            value={form.giteName} onChange={e => set('giteName', e.target.value)}/>
        </div>
        <div className="ob-row">
          <div className="ob-field">
            <label className="ob-label">Email de contact *</label>
            <input className="ob-input" type="email" required
              value={form.email} onChange={e => set('email', e.target.value)}/>
          </div>
          <div className="ob-field">
            <label className="ob-label">Téléphone</label>
            <input className="ob-input" placeholder="06 12 34 56 78"
              value={form.phone} onChange={e => set('phone', e.target.value)}/>
          </div>
        </div>
        <div className="ob-field">
          <label className="ob-label">Adresse</label>
          <input className="ob-input" placeholder="12 chemin des Pins"
            value={form.address} onChange={e => set('address', e.target.value)}/>
        </div>
        <div className="ob-row">
          <div className="ob-field">
            <label className="ob-label">Ville</label>
            <input className="ob-input" placeholder="Bordeaux"
              value={form.city} onChange={e => set('city', e.target.value)}/>
          </div>
          <div className="ob-field">
            <label className="ob-label">Code postal</label>
            <input className="ob-input" placeholder="33000"
              value={form.zipCode} onChange={e => set('zipCode', e.target.value)}/>
          </div>
        </div>
      </div>

      {/* CGU */}
      <label className="ob-cgu">
        <input
          type="checkbox"
          checked={cguAccepted}
          onChange={e => setCguAccepted(e.target.checked)}
        />
        <span className="ob-cgu-text">
          J&apos;accepte les <a href="/legal/cgu" target="_blank">CGU</a> et la{' '}
          <a href="/legal/confidentialite" target="_blank">Politique de confidentialité</a> de Prysme.
        </span>
      </label>

      {error && (
        <div className="ob-error">
          <p>{error}</p>
        </div>
      )}

      <button type="submit" className="ob-submit" disabled={loading}>
        {loading ? (
          <span className="ob-spinner"/>
        ) : (
          <>
            Accéder au tableau de bord
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
              <path d="M3 8h10m-4-4l4 4-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </>
        )}
      </button>

      <p className="ob-note">
        Vous configurerez vos tarifs, options et documents depuis votre tableau de bord.
      </p>

    </form>
  );
}
