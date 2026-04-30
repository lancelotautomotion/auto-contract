"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface GiteOption {
  id: string;
  label: string;
  price: number;
}

interface Props {
  defaultCleaningFee: string;
  defaultTouristTax: string;
  availableOptions: GiteOption[];
}

export default function NewReservationForm({ defaultCleaningFee, defaultTouristTax, availableOptions }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    clientFirstName: '', clientLastName: '', clientEmail: '', clientPhone: '',
    clientAddress: '', clientCity: '', clientZipCode: '',
    checkIn: '', checkOut: '',
    rent: '', deposit: '',
    cleaningFee: defaultCleaningFee,
    touristTax: defaultTouristTax,
    notes: '',
  });
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const toggleOption = (id: string) => setSelectedOptions(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, selectedOptionIds: Array.from(selectedOptions) }),
      });
      if (res.ok) router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loyer = parseFloat(form.rent) || 0;
  const acompte = parseFloat(form.deposit) || 0;
  const menage = parseFloat(form.cleaningFee) || 0;
  const fmtMoney = (n: number) => n ? `${n.toLocaleString('fr-FR')}\u00a0€` : `—\u00a0€`;

  return (
    <form onSubmit={handleSubmit}>
    <div className="form-layout">
    <div className="form-main">

      {/* CLIENT */}
      <div className="form-section">
        <div className="fs-title">
          <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
            <circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M2 13c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          Informations client
        </div>
        <div className="fs-divider" />
        <div className="form-card">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Prénom <span className="req">*</span></label>
              <input required className="form-input" type="text" placeholder="Prénom du client" value={form.clientFirstName} onChange={e => set('clientFirstName', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Nom <span className="req">*</span></label>
              <input required className="form-input" type="text" placeholder="Nom du client" value={form.clientLastName} onChange={e => set('clientLastName', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email <span className="req">*</span></label>
              <input required className="form-input" type="email" placeholder="client@exemple.com" value={form.clientEmail} onChange={e => set('clientEmail', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Téléphone <span className="req">*</span></label>
              <input required className="form-input" type="tel" placeholder="06 12 34 56 78" value={form.clientPhone} onChange={e => set('clientPhone', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Adresse</label>
            <input className="form-input" type="text" placeholder="Adresse postale du client" value={form.clientAddress} onChange={e => set('clientAddress', e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Ville</label>
              <input className="form-input" type="text" placeholder="Ville" value={form.clientCity} onChange={e => set('clientCity', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Code postal</label>
              <input className="form-input" type="text" placeholder="Code postal" value={form.clientZipCode} onChange={e => set('clientZipCode', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* DATES */}
      <div className="form-section">
        <div className="fs-title">
          <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
            <rect x="1.5" y="3" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M1.5 6h11" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M4.5 1.5v3M9.5 1.5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          Dates du séjour
        </div>
        <div className="fs-divider" />
        <div className="form-card">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date d&apos;arrivée <span className="req">*</span></label>
              <input required className="form-date" type="date" value={form.checkIn} onChange={e => set('checkIn', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Date de départ <span className="req">*</span></label>
              <input required className="form-date" type="date" value={form.checkOut} onChange={e => set('checkOut', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* TARIFS */}
      <div className="form-section">
        <div className="fs-title">
          <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M7 3.5v7M5 5.5h3.5a1.5 1.5 0 010 3H5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          Tarifs
        </div>
        <div className="fs-divider" />
        <div className="form-card">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Loyer (€) <span className="req">*</span></label>
              <input required className="form-input" type="number" step="0.01" placeholder="0,00" value={form.rent} onChange={e => set('rent', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Acompte (€) <span className="req">*</span></label>
              <input required className="form-input" type="number" step="0.01" placeholder="0,00" value={form.deposit} onChange={e => set('deposit', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Frais de ménage (€)</label>
              <input className="form-input" type="number" step="0.01" value={form.cleaningFee} onChange={e => set('cleaningFee', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Taxe de séjour (€/nuit/pers.)</label>
              <input className="form-input" type="number" step="0.01" value={form.touristTax} onChange={e => set('touristTax', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* OPTIONS */}
      <div className="form-section">
        <div className="fs-title">
          <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
            <rect x="1.5" y="3" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M5 7l1.5 1.5L10 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Options
        </div>
        <div className="fs-divider" />
        {availableOptions.length > 0 ? (
          <div className="options-grid">
            {availableOptions.map(opt => {
              const checked = selectedOptions.has(opt.id);
              return (
                <div key={opt.id} className={`option-check${checked ? ' checked' : ''}`} onClick={() => toggleOption(opt.id)} role="checkbox" aria-checked={checked}>
                  <div className="oc-box">
                    {checked && (
                      <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
                        <path d="M2.5 6l2.5 2.5L9.5 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="oc-name">{opt.label}</span>
                  {opt.price > 0 && <span className="oc-price">{opt.price} €</span>}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="form-card">
            <p style={{ fontSize: '13px', color: 'var(--ink-lighter)', margin: 0 }}>
              Aucune option configurée.{' '}
              <Link href="/dashboard/etablissement" style={{ color: 'var(--violet)' }}>Configurer les options →</Link>
            </p>
          </div>
        )}
      </div>

    </div>{/* end form-main */}

    {/* RIGHT ASIDE */}
    <div className="form-aside">

      {/* NOTES */}
      <div className="form-section">
        <div className="fs-title">
          <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
            <rect x="2" y="2" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M5 5h4M5 7.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          Notes internes
        </div>
        <div className="fs-divider" />
        <div className="form-card">
          <div className="form-group">
            <textarea
              className="form-textarea"
              placeholder="Informations complémentaires, demandes spéciales du client..."
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="summary-card">
        <div className="summary-top">
          <div className="summary-title">
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
              <path d="M4 8l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Récapitulatif
          </div>
        </div>
        <div className="summary-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="sg-item">
            <div className="sg-label">Loyer</div>
            <div className="sg-value">{fmtMoney(loyer)}</div>
          </div>
          <div className="sg-item">
            <div className="sg-label">Acompte</div>
            <div className="sg-value">{fmtMoney(acompte)}</div>
          </div>
          <div className="sg-item">
            <div className="sg-label">Ménage</div>
            <div className="sg-value">{menage.toLocaleString('fr-FR')}&nbsp;€</div>
          </div>
          <div className="sg-item">
            <div className="sg-label">Solde restant</div>
            <div className={`sg-value${loyer ? ' green' : ''}`}>{loyer ? fmtMoney(loyer - acompte) : '—\u00a0€'}</div>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-green"
          style={{ width: '100%', fontSize: '14px', padding: '12px 24px', borderRadius: '10px' }}
        >
          {loading ? 'Enregistrement...' : 'Enregistrer la réservation'}
          {!loading && (
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
              <path d="M3 8h10m-4-4l4 4-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>

    </div>{/* end form-aside */}
    </div>{/* end form-layout */}
    </form>
  );
}
