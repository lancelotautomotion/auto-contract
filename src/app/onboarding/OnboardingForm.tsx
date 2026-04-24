"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const OPTIONS = [
  { key: 'offerNordicBath', priceKey: 'nordicBathPrice', label: 'Bain nordique' },
  { key: 'offerSheet160',   priceKey: 'sheet160Price',   label: 'Draps 160×200' },
  { key: 'offerSheet90',    priceKey: 'sheet90Price',    label: 'Draps 90×190' },
  { key: 'offerTowels',     priceKey: 'towelsPrice',     label: 'Linge de toilette' },
];

export default function OnboardingForm({ defaultEmail }: { defaultEmail: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    giteName: '', email: defaultEmail, phone: '',
    address: '', city: '', zipCode: '',
    capacity: '12', cleaningFee: '90', touristTax: '1.32',
    offerNordicBath: false, nordicBathPrice: '120',
    offerSheet160: false,   sheet160Price: '0',
    offerSheet90: false,    sheet90Price: '0',
    offerTowels: false,     towelsPrice: '0',
  });
  const [cguAccepted, setCguAccepted] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const toggle = (k: string) => setForm(f => ({ ...f, [k]: !f[k as keyof typeof f] }));

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

    const options = OPTIONS
      .filter(opt => form[opt.key as keyof typeof form])
      .map(opt => ({
        label: opt.label,
        price: parseFloat(String(form[opt.priceKey as keyof typeof form] ?? '0')) || 0,
      }));

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, slug, options }),
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

      {/* Section 2 — Tarifs */}
      <div className="ob-section">
        <p className="ob-section-title">Tarifs par défaut</p>
        <div className="ob-row-3">
          <div className="ob-field">
            <label className="ob-label">Capacité (pers.)</label>
            <input className="ob-input" type="number" min="1"
              value={form.capacity} onChange={e => set('capacity', e.target.value)}/>
          </div>
          <div className="ob-field">
            <label className="ob-label">Frais de ménage (€)</label>
            <input className="ob-input" type="number" step="0.01" min="0"
              value={form.cleaningFee} onChange={e => set('cleaningFee', e.target.value)}/>
          </div>
          <div className="ob-field">
            <label className="ob-label">Taxe de séjour (€/nuit)</label>
            <input className="ob-input" type="number" step="0.01" min="0"
              value={form.touristTax} onChange={e => set('touristTax', e.target.value)}/>
          </div>
        </div>
      </div>

      {/* Section 3 — Options */}
      <div className="ob-section">
        <p className="ob-section-title">
          Options proposées
          <span className="ob-section-note">— facultatif, modifiable plus tard</span>
        </p>
        <div className="ob-opts">
          {OPTIONS.map(opt => (
            <label key={opt.key} className="ob-opt">
              <input
                type="checkbox"
                checked={form[opt.key as keyof typeof form] as boolean}
                onChange={() => toggle(opt.key)}
              />
              <span className="ob-opt-name">{opt.label}</span>
              {form[opt.key as keyof typeof form] && (
                <div className="ob-opt-price" onClick={e => e.preventDefault()}>
                  <input
                    type="number" step="0.01" min="0"
                    className="ob-price-input"
                    value={form[opt.priceKey as keyof typeof form] as string}
                    onChange={e => set(opt.priceKey, e.target.value)}
                    onClick={e => e.stopPropagation()}
                  />
                  <span className="ob-price-unit">€</span>
                </div>
              )}
            </label>
          ))}
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
        Vous pourrez compléter et modifier toutes ces informations dans vos paramètres.
      </p>

    </form>
  );
}
