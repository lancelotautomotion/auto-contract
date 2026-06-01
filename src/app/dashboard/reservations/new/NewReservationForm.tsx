"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, CalendarDays, Euro, CheckCircle, FileText, Check, AlertTriangle, ArrowRight } from "lucide-react";

interface GiteOption { id: string; label: string; price: number; }
interface IcalBlock { start: string; end: string; platform: string; label: string; }

const PLATFORM_LABELS: Record<string, string> = {
  airbnb: "Airbnb", abritel: "Abritel / VRBO", booking: "Booking.com",
  gites_de_france: "Gîtes de France", autre: "Autre",
};

interface Props {
  giteId?: string;
  defaultCleaningFee: string;
  defaultTouristTax: string;
  availableOptions: GiteOption[];
  icalBlocked?: IcalBlock[];
}

export default function NewReservationForm({ giteId, defaultCleaningFee, defaultTouristTax, availableOptions, icalBlocked = [] }: Props) {
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
    setLoading(true);
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, giteId, selectedOptionIds: Array.from(selectedOptions) }),
      });
      if (res.ok) router.push(giteId ? `/dashboard/${giteId}/reservations` : '/dashboard');
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
          <User size={14} strokeWidth={1.4} />
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
          <CalendarDays size={14} strokeWidth={1.4} />
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
        {icalConflicts.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: '#FEF3CD', border: '1px solid #F5C842', borderRadius: '10px', padding: '14px 16px', marginTop: '10px' }}>
            <AlertTriangle size={18} strokeWidth={1.4} style={{ flexShrink: 0, color: '#B7791F', marginTop: '1px' }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#7B4F0A', marginBottom: '4px' }}>Conflit détecté sur une autre plateforme</div>
              <div style={{ fontSize: '12px', color: '#92610E', lineHeight: 1.5 }}>
                {icalConflicts.map((c, i) => {
                  const fmtD = (s: string) => new Date(s + 'T12:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' });
                  return (
                    <span key={i}>{i > 0 && ' · '}<strong>{PLATFORM_LABELS[c.platform] ?? c.label}</strong> : du {fmtD(c.start)} au {fmtD(c.end)}</span>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TARIFS */}
      <div className="form-section">
        <div className="fs-title">
          <Euro size={14} strokeWidth={1.4} />
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
          <CheckCircle size={14} strokeWidth={1.4} />
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
                      <Check size={12} strokeWidth={1.5} color="#fff" />
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
          <FileText size={14} strokeWidth={1.4} />
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
            <Check size={16} strokeWidth={1.5} />
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
            <div className="sg-label">Solde restant <span style={{ fontWeight: 400, opacity: .65, fontSize: '11px' }}>(hors taxe de séjour et options)</span></div>
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
            <ArrowRight size={16} strokeWidth={1.5} />
          )}
        </button>
      </div>

    </div>{/* end form-aside */}
    </div>{/* end form-layout */}
    </form>
  );
}
