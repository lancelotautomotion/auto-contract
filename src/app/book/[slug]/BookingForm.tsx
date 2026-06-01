"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Check, CalendarDays, User, CheckSquare, MessageSquare, Moon, AlertTriangle, Info, ArrowRight, Shield, Lock, Clock } from "lucide-react";

interface GiteOption { id: string; label: string; price: number; }
interface IcalBlock { start: string; end: string; platform: string; label: string; }

const PLATFORM_LABELS: Record<string, string> = {
  airbnb: "Airbnb", abritel: "Abritel / VRBO", booking: "Booking.com",
  gites_de_france: "Gîtes de France", autre: "Autre",
};

interface Props {
  giteSlug: string;
  giteName: string;
  giteCity?: string | null;
  giteLogoUrl?: string | null;
  giteCapacity?: number | null;
  propertyName?: string | null;
  options: GiteOption[];
  icalBlocked?: IcalBlock[];
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

export default function BookingForm({ giteSlug, giteName, giteCity, giteLogoUrl, giteCapacity, propertyName, options, icalBlocked = [] }: Props) {
  const isRoom = !!propertyName;
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
    website: '',
  });

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));
  const today = new Date().toISOString().split('T')[0];
  const nights = useMemo(() => countNights(form.checkIn, form.checkOut), [form.checkIn, form.checkOut]);
  const selectedOpts = options.filter(o => selectedOptions.has(o.id));
  const icalConflicts = useMemo(() => {
    if (!form.checkIn || !form.checkOut) return [];
    return icalBlocked.filter(b => b.start < form.checkOut && b.end > form.checkIn);
  }, [form.checkIn, form.checkOut, icalBlocked]);

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
          <Check size={32} strokeWidth={2.5} color="#4A7353" />
        </div>
        <h2>Demande <span className="g">envoyée !</span></h2>
        <p className="book-success-lead">Votre demande a bien été reçue par le gérant de <strong>{giteName}</strong>.</p>
        {form.checkIn && form.checkOut && nights > 0 && (
          <div className="book-success-dates">
            <CalendarDays size={14} strokeWidth={1.4} color="#7F77DD" />
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
        <button
          type="button"
          onClick={() => setStep('form')}
          className="book-reset-btn"
        >
          Faire une autre demande
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Honeypot — hidden from real users, visible to bots */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
        <label htmlFor="website">Site web</label>
        <input
          id="website"
          type="text"
          name="website"
          value={form.website}
          onChange={e => set('website', e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <div className="book-layout">

        {/* ── COLONNE FORMULAIRE ── */}
        <div className="book-form-col">

          {/* Informations personnelles */}
          <div className="book-fs">
            <div className="book-fs-title">
              <User size={14} strokeWidth={1.4} />
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
              <CalendarDays size={14} strokeWidth={1.4} />
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
                    min={form.checkIn ? new Date(new Date(form.checkIn).getTime() + 86400000).toISOString().slice(0, 10) : today} value={form.checkOut}
                    onChange={e => set('checkOut', e.target.value)}
                  />
                </div>
              </div>
              {nights > 0 && (
                <div className="book-nights-badge">
                  <Moon size={12} strokeWidth={1.4} color="#7F77DD" />
                  {nights} nuit{nights > 1 ? 's' : ''}
                </div>
              )}
              {icalConflicts.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#FEF3CD', border: '1px solid #F5C842', borderRadius: '10px', padding: '12px 14px', marginTop: '10px' }}>
                  <AlertTriangle size={16} strokeWidth={1.4} style={{ flexShrink: 0, color: '#B7791F', marginTop: '1px' }} />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#7B4F0A', marginBottom: '2px' }}>Ces dates sont peut-être déjà prises</div>
                    <div style={{ fontSize: '11.5px', color: '#92610E', lineHeight: 1.5 }}>
                      Le gérant a des réservations sur cette période via une autre plateforme. Vous pouvez tout de même envoyer votre demande — il vous confirmera la disponibilité.
                    </div>
                  </div>
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
                <CheckSquare size={14} strokeWidth={1.4} />
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
                          <Check size={10} strokeWidth={1.5} color="#fff" />
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
              <MessageSquare size={14} strokeWidth={1.4} />
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
              <div className="book-recap-gite-name">{isRoom ? propertyName : giteName}</div>
            )}
            {giteCity && <div className="book-recap-gite-city">{giteCity}</div>}

            {isRoom && (
              <div style={{ marginTop: '12px', padding: '12px 14px', background: 'var(--line-light)', borderRadius: '10px', border: '1px solid var(--line)' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>
                  Chambre {giteName}
                </div>
                {giteCapacity && (
                  <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                    Jusqu&apos;à {giteCapacity} personne{giteCapacity > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            )}

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
                <Moon size={12} strokeWidth={1.4} color="#7F77DD" />
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
              <Info size={13} strokeWidth={1.4} color="#7F77DD" />
              Les tarifs sont confirmés par le gérant.
            </div>

            <div className="book-recap-trust">
              <div className="book-trust-item">
                <Shield size={11} strokeWidth={1.4} color="#A3A3A0" />
                Données sécurisées
              </div>
              <div className="book-trust-item">
                <Check size={11} strokeWidth={1.4} color="#A3A3A0" />
                Signature eIDAS
              </div>
              <div className="book-trust-item">
                <Clock size={11} strokeWidth={1.4} color="#A3A3A0" />
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
                <ArrowRight size={16} strokeWidth={1.5} color="#fff" />
              </>
            )}
          </button>
          <div className="book-submit-note">
            <Lock size={13} strokeWidth={1.4} color="#A3A3A0" />
            Aucun paiement requis à cette étape.
          </div>
        </div>

      </div>
    </form>
  );
}
