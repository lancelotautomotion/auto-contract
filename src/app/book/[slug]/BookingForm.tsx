"use client";

import { useState, useMemo } from "react";
import Image from "next/image";

interface GiteOption { id: string; label: string; price: number; }

interface Props {
  giteSlug: string;
  giteName: string;
  giteCity?: string | null;
  giteLogoUrl?: string | null;
  options: GiteOption[];
}

function countNights(a: string, b: string) {
  if (!a || !b) return 0;
  const diff = Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
  return diff > 0 ? diff : 0;
}

function fmtDate(d: string) {
  if (!d) return '—';
  return new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BookingForm({ giteSlug, giteName, giteCity, giteLogoUrl, options }: Props) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', zipCode: '',
    checkIn: '', checkOut: '',
    guestCount: '',
    notes: '',
    gdprConsent: false,
  });

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));
  const today = new Date().toISOString().split('T')[0];
  const nights = useMemo(() => countNights(form.checkIn, form.checkOut), [form.checkIn, form.checkOut]);
  const selectedOpts = options.filter(o => selectedOptions.has(o.id));

  const toggleOption = (id: string) => setSelectedOptions(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.gdprConsent) return;
    if (nights <= 0) { setError("La date de départ doit être postérieure à la date d'arrivée."); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/book/${giteSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, selectedOptionIds: Array.from(selectedOptions) }),
      });
      if (res.ok) setStep('success');
      else setError('Une erreur est survenue. Veuillez réessayer.');
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="book-success">
        <div className="book-success-check">
          <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
            <path d="M8 16l5.5 5.5L24 10" stroke="#4A7353" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2>Demande <span className="g">envoyée !</span></h2>
        <p className="book-success-lead">Votre demande a bien été reçue par le gérant de <strong>{giteName}</strong>.</p>
        {form.checkIn && form.checkOut && nights > 0 && (
          <div className="book-success-dates">
            <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
              <rect x="1.5" y="3" width="11" height="9" rx="1.5" stroke="#7F77DD" strokeWidth="1.2"/>
              <path d="M1.5 6h11" stroke="#7F77DD" strokeWidth="1.2"/>
            </svg>
            {fmtDate(form.checkIn)} → {fmtDate(form.checkOut)}
            <span className="book-success-nights">· {nights} nuit{nights > 1 ? 's' : ''}</span>
          </div>
        )}
        <div className="book-success-steps">
          <div className="book-success-step">
            <div className="bss-num v">1</div>
            <div className="bss-body">
              <strong>Confirmation par le gérant</strong>
              <span>Il examine votre demande et vous contacte sous 24h.</span>
            </div>
          </div>
          <div className="book-success-step">
            <div className="bss-num">2</div>
            <div className="bss-body">
              <strong>Signature du contrat</strong>
              <span>Vous recevez le contrat par email pour signature électronique eIDAS.</span>
            </div>
          </div>
          <div className="book-success-step">
            <div className="bss-num">3</div>
            <div className="bss-body">
              <strong>Séjour confirmé</strong>
              <span>Après signature et réception de l'acompte, vos dates sont bloquées.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="book-layout">

        {/* ── COLONNE FORMULAIRE ── */}
        <div className="book-form-col">

          {/* Informations personnelles */}
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
              <div className="book-row">
                <div className="book-group">
                  <label className="book-label">Prénom <span className="req">*</span></label>
                  <input className="book-input" type="text" placeholder="Votre prénom" required value={form.firstName} onChange={e => set('firstName', e.target.value)}/>
                </div>
                <div className="book-group">
                  <label className="book-label">Nom <span className="req">*</span></label>
                  <input className="book-input" type="text" placeholder="Votre nom" required value={form.lastName} onChange={e => set('lastName', e.target.value)}/>
                </div>
              </div>
              <div className="book-row">
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
                <input className="book-input" type="text" placeholder="Numéro et nom de rue" required value={form.address} onChange={e => set('address', e.target.value)}/>
              </div>
              <div className="book-row">
                <div className="book-group">
                  <label className="book-label">Ville <span className="req">*</span></label>
                  <input className="book-input" type="text" placeholder="Ville" required value={form.city} onChange={e => set('city', e.target.value)}/>
                </div>
                <div className="book-group">
                  <label className="book-label">Code postal <span className="req">*</span></label>
                  <input className="book-input" type="text" placeholder="75001" required value={form.zipCode} onChange={e => set('zipCode', e.target.value)}/>
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
                  <label className="book-label">Arrivée <span className="req">*</span></label>
                  <input
                    className="book-date" type="date" required
                    min={today} value={form.checkIn}
                    onChange={e => {
                      set('checkIn', e.target.value);
                      if (form.checkOut && e.target.value >= form.checkOut) set('checkOut', '');
                    }}
                  />
                </div>
                <div className="book-group">
                  <label className="book-label">Départ <span className="req">*</span></label>
                  <input
                    className="book-date" type="date" required
                    min={form.checkIn || today} value={form.checkOut}
                    onChange={e => set('checkOut', e.target.value)}
                  />
                </div>
              </div>
              {nights > 0 && (
                <div className="book-nights-badge">
                  <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
                    <path d="M9.5 7A5 5 0 0 1 5 1.5 4 4 0 1 0 9.5 7z" stroke="#7F77DD" strokeWidth="1.1"/>
                  </svg>
                  {nights} nuit{nights > 1 ? 's' : ''}
                </div>
              )}
              <div className="book-group" style={{ marginTop: '14px' }}>
                <label className="book-label">Nombre de personnes <span className="req">*</span></label>
                <input
                  className="book-input" type="number" min="1" max="50" required
                  placeholder="2"
                  value={form.guestCount}
                  onChange={e => set('guestCount', e.target.value)}
                />
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
                      tabIndex={0}
                      onKeyDown={e => e.key === ' ' && (e.preventDefault(), toggleOption(opt.id))}
                    >
                      <div className="book-opt-box">
                        {checked && (
                          <svg width="10" height="10" fill="none" viewBox="0 0 10 10">
                            <path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span className="book-opt-name">{opt.label}</span>
                      {opt.price > 0 && (
                        <span className="book-opt-price">+{opt.price.toLocaleString('fr-FR')} €</span>
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
              <p style={{ fontSize: '13px', color: 'var(--ink-lighter, #71716E)', margin: '0 0 10px', lineHeight: 1.5 }}>
                Précisez la composition de votre groupe (couple, famille avec enfants, adultes…), votre heure d&apos;arrivée estimée ou toute demande particulière.
              </p>
              <textarea
                className="book-textarea"
                placeholder="Ex. Couple avec 2 enfants (4 et 7 ans), arrivée prévue vers 17h."
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── COLONNE RÉCAP ── */}
        <aside className="book-recap-col">
          <div className="book-recap-card">
            {giteLogoUrl ? (
              <div className="book-recap-logo">
                <Image src={giteLogoUrl} alt={giteName} width={200} height={56} style={{ height: 32, width: 'auto', objectFit: 'contain' }} unoptimized/>
              </div>
            ) : (
              <div className="book-recap-gite-name">{giteName}</div>
            )}
            {giteCity && <div className="book-recap-gite-city">{giteCity}</div>}

            <div className="book-recap-sep"/>

            <div className="book-recap-row">
              <span className="book-recap-label">Arrivée</span>
              <span className="book-recap-val">{form.checkIn ? fmtDate(form.checkIn) : '—'}</span>
            </div>
            <div className="book-recap-row">
              <span className="book-recap-label">Départ</span>
              <span className="book-recap-val">{form.checkOut ? fmtDate(form.checkOut) : '—'}</span>
            </div>
            {nights > 0 && (
              <div className="book-recap-nights">
                <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
                  <path d="M9.5 7A5 5 0 0 1 5 1.5 4 4 0 1 0 9.5 7z" stroke="#7F77DD" strokeWidth="1.1"/>
                </svg>
                {nights} nuit{nights > 1 ? 's' : ''}
              </div>
            )}

            {selectedOpts.length > 0 && (
              <>
                <div className="book-recap-sep"/>
                <div className="book-recap-sublabel">Options</div>
                {selectedOpts.map(o => (
                  <div key={o.id} className="book-recap-row">
                    <span className="book-recap-label">{o.label}</span>
                    {o.price > 0 && <span className="book-recap-val">+{o.price.toLocaleString('fr-FR')} €</span>}
                  </div>
                ))}
              </>
            )}

            <div className="book-recap-sep"/>
            <div className="book-recap-notice">
              <svg width="13" height="13" fill="none" viewBox="0 0 13 13">
                <circle cx="6.5" cy="6.5" r="5" stroke="#7F77DD" strokeWidth="1.1"/>
                <path d="M6.5 5.5v4" stroke="#7F77DD" strokeWidth="1.1" strokeLinecap="round"/>
                <circle cx="6.5" cy="4" r=".65" fill="#7F77DD"/>
              </svg>
              Les tarifs sont confirmés par le gérant.
            </div>

            <div className="book-recap-trust">
              <div className="book-trust-item">
                <svg width="11" height="11" fill="none" viewBox="0 0 11 11">
                  <path d="M5.5 1L2 3v3c0 2.5 1.5 4 3.5 5 2-1 3.5-2.5 3.5-5V3L5.5 1z" stroke="#A3A3A0" strokeWidth="1"/>
                </svg>
                Données sécurisées
              </div>
              <div className="book-trust-item">
                <svg width="11" height="11" fill="none" viewBox="0 0 11 11">
                  <rect x="1" y="1.5" width="9" height="8" rx="1.2" stroke="#A3A3A0" strokeWidth="1"/>
                  <path d="M3.5 5.5l1.5 1.5L8 4.5" stroke="#A3A3A0" strokeWidth="1" strokeLinecap="round"/>
                </svg>
                Signature eIDAS
              </div>
              <div className="book-trust-item">
                <svg width="11" height="11" fill="none" viewBox="0 0 11 11">
                  <circle cx="5.5" cy="5.5" r="4" stroke="#A3A3A0" strokeWidth="1"/>
                  <path d="M5.5 3v2.5l1.5 1" stroke="#A3A3A0" strokeWidth="1" strokeLinecap="round"/>
                </svg>
                Réponse sous 24h
              </div>
            </div>
          </div>
        </aside>

        {/* ── COLONNE FINALE — consent + submit ── */}
        <div className="book-final-col">
          <div className="book-consent">
            <input type="checkbox" id="rgpd" required checked={form.gdprConsent} onChange={e => set('gdprConsent', e.target.checked)}/>
            <label htmlFor="rgpd">
              J&apos;accepte que mes données personnelles soient utilisées pour le traitement de ma demande conformément à la politique de confidentialité. <span className="req">*</span>
            </label>
          </div>

          {error && <div className="book-error">{error}</div>}

          <button className="btn-book-submit" type="submit" disabled={loading || !form.gdprConsent}>
            {loading ? (
              <span className="book-spinner"/>
            ) : (
              <>
                Envoyer ma demande
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <path d="M3 8h10m-4-4l4 4-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
          <div className="book-submit-note">
            <svg width="13" height="13" fill="none" viewBox="0 0 13 13">
              <path d="M6.5 1.5L2 4v3.5c0 3 2 5 4.5 6 2.5-1 4.5-3 4.5-6V4L6.5 1.5z" stroke="#A3A3A0" strokeWidth="1" strokeLinecap="round"/>
              <path d="M4.5 6.5l1.5 1.5L9 5" stroke="#A3A3A0" strokeWidth="1" strokeLinecap="round"/>
            </svg>
            Aucun paiement requis à cette étape.
          </div>
        </div>

      </div>
    </form>
  );
}
