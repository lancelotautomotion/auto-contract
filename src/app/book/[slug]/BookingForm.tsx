"use client";

import { useState } from "react";

interface GiteOption { id: string; label: string; price: number; }

interface Props {
  giteSlug: string;
  giteName: string;
  options: GiteOption[];
}

export default function BookingForm({ giteSlug, giteName, options }: Props) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', zipCode: '',
    checkIn: '', checkOut: '',
    notes: '',
    gdprConsent: false,
  });

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const toggleOption = (id: string) => setSelectedOptions(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.gdprConsent) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/book/${giteSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, selectedOptionIds: Array.from(selectedOptions) }),
      });
      if (res.ok) setStep('success');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="book-form-wrap">

      {step === 'success' ? (
        <div className="book-success">
          <div className="book-success-icon">
            <svg width="28" height="28" fill="none" viewBox="0 0 28 28">
              <path d="M7 14l5 5L21 9" stroke="#4A7353" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2>Demande <span className="g">envoyée</span></h2>
          <p>Merci pour votre demande. Le gérant de {giteName} vous contactera très prochainement pour confirmer votre séjour et vous transmettre le contrat.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>

          {/* Informations */}
          <div className="book-fs">
            <div className="book-fs-title">
              <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                <circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M2 13c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Vos informations
            </div>
            <div className="book-fs-divider"/>
            <div className="book-card">
              <div className="book-row book-group">
                <div className="book-group">
                  <label className="book-label">Prénom <span className="req">*</span></label>
                  <input className="book-input" type="text" placeholder="Votre prénom" required value={form.firstName} onChange={e => set('firstName', e.target.value)}/>
                </div>
                <div className="book-group">
                  <label className="book-label">Nom <span className="req">*</span></label>
                  <input className="book-input" type="text" placeholder="Votre nom" required value={form.lastName} onChange={e => set('lastName', e.target.value)}/>
                </div>
              </div>
              <div className="book-row book-group">
                <div className="book-group">
                  <label className="book-label">Email <span className="req">*</span></label>
                  <input className="book-input" type="email" placeholder="vous@exemple.com" required value={form.email} onChange={e => set('email', e.target.value)}/>
                </div>
                <div className="book-group">
                  <label className="book-label">Téléphone <span className="req">*</span></label>
                  <input className="book-input" type="tel" placeholder="06 12 34 56 78" required value={form.phone} onChange={e => set('phone', e.target.value)}/>
                </div>
              </div>
              <div className="book-group">
                <label className="book-label">Adresse <span className="req">*</span></label>
                <input className="book-input" type="text" placeholder="Votre adresse postale" required value={form.address} onChange={e => set('address', e.target.value)}/>
              </div>
              <div className="book-row">
                <div className="book-group">
                  <label className="book-label">Ville <span className="req">*</span></label>
                  <input className="book-input" type="text" placeholder="Ville" required value={form.city} onChange={e => set('city', e.target.value)}/>
                </div>
                <div className="book-group">
                  <label className="book-label">Code postal <span className="req">*</span></label>
                  <input className="book-input" type="text" placeholder="Code postal" required value={form.zipCode} onChange={e => set('zipCode', e.target.value)}/>
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="book-fs">
            <div className="book-fs-title">
              <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                <rect x="1.5" y="3" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M1.5 6h11" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M4.5 1.5v3M9.5 1.5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Dates souhaitées
            </div>
            <div className="book-fs-divider"/>
            <div className="book-card">
              <div className="book-row">
                <div className="book-group">
                  <label className="book-label">Date d&apos;arrivée <span className="req">*</span></label>
                  <input className="book-date" type="date" required value={form.checkIn} onChange={e => set('checkIn', e.target.value)}/>
                </div>
                <div className="book-group">
                  <label className="book-label">Date de départ <span className="req">*</span></label>
                  <input className="book-date" type="date" required value={form.checkOut} onChange={e => set('checkOut', e.target.value)}/>
                </div>
              </div>
            </div>
          </div>

          {/* Options */}
          {options.length > 0 && (
            <div className="book-fs">
              <div className="book-fs-title">
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                  <rect x="1.5" y="3" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M5 7l1.5 1.5L10 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Options souhaitées
              </div>
              <div className="book-fs-divider"/>
              <div className="book-opts">
                {options.map(opt => {
                  const checked = selectedOptions.has(opt.id);
                  return (
                    <div
                      key={opt.id}
                      className={`book-opt${checked ? ' checked' : ''}`}
                      onClick={() => toggleOption(opt.id)}
                      role="checkbox"
                      aria-checked={checked}
                    >
                      <div className="book-opt-box">
                        {checked && (
                          <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
                            <path d="M2.5 6l2.5 2.5L9.5 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span className="book-opt-name">{opt.label}</span>
                      {opt.price > 0 && (
                        <span className="book-opt-price">
                          {opt.price.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Message */}
          <div className="book-fs">
            <div className="book-fs-title">
              <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                <path d="M7 1.5c-3 0-5.5 2-5.5 4.5 0 1.5.9 2.8 2.3 3.6L3 13l2.5-1.3c.5.1 1 .2 1.5.2 3 0 5.5-2 5.5-4.5S10 1.5 7 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Message (optionnel)
            </div>
            <div className="book-fs-divider"/>
            <div className="book-card">
              <textarea
                className="book-textarea"
                placeholder="Nombre de personnes, demandes particulières, heure d'arrivée estimée..."
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
              />
            </div>
          </div>

          {/* Consent */}
          <div className="book-consent">
            <input
              type="checkbox"
              id="rgpd"
              required
              checked={form.gdprConsent}
              onChange={e => set('gdprConsent', e.target.checked)}
            />
            <label htmlFor="rgpd">
              J&apos;accepte que mes données personnelles soient utilisées pour le traitement de ma demande de réservation. <span className="req">*</span>
            </label>
          </div>

          {/* Submit */}
          <div className="book-submit-wrap">
            <button className="btn-book-submit" type="submit" disabled={loading || !form.gdprConsent}>
              {loading ? 'Envoi en cours...' : 'Envoyer ma demande'}
              {!loading && (
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <path d="M3 8h10m-4-4l4 4-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
            <div className="book-submit-note">
              <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                <path d="M7 1.5L2 4v4c0 3.3 2.1 5.5 5 6.5 2.9-1 5-3.2 5-6.5V4L7 1.5z" stroke="#A3A3A0" strokeWidth="1"/>
                <path d="M5 7l1.5 1.5L9 5.5" stroke="#A3A3A0" strokeWidth="1" strokeLinecap="round"/>
              </svg>
              Aucun paiement requis à cette étape.
            </div>
          </div>

        </form>
      )}

      {/* Trust bar */}
      <div className="book-trust">
        <div className="book-trust-item">
          <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
            <path d="M6 1L2 3.5v3c0 2.8 1.8 4.6 4 5.5 2.2-.9 4-2.7 4-5.5v-3L6 1z" stroke="#A3A3A0" strokeWidth="1"/>
          </svg>
          Données sécurisées
        </div>
        <div className="book-trust-item">
          <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
            <rect x="1.5" y="2.5" width="9" height="7" rx="1" stroke="#A3A3A0" strokeWidth="1"/>
            <path d="M4 6l1.5 1.5L8 5" stroke="#A3A3A0" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          Signature conforme eIDAS
        </div>
        <div className="book-trust-item">
          <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
            <circle cx="6" cy="6" r="4.5" stroke="#A3A3A0" strokeWidth="1"/>
            <path d="M6 3.5v2.5l1.5 1" stroke="#A3A3A0" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          Réponse sous 24h
        </div>
      </div>

    </div>
  );
}
