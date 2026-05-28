"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createPortal } from "react-dom";

interface Gite { id: string; name: string; }

interface Props {
  gites: Gite[];
  activeGiteId: string;
  isAdmin?: boolean;
  planActive?: boolean;
}

function ChevronDown() {
  return (
    <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
      <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="13" height="13" fill="none" viewBox="0 0 13 13">
      <path d="M6.5 2v9M2 6.5h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

export default function GiteSelector({ gites, activeGiteId, isAdmin = false, planActive = false }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showMaxReached, setShowMaxReached] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const activeGite = gites.find(g => g.id === activeGiteId) ?? gites[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Derive the current section from the pathname so switching gite stays on same section
  const derivedSection = (() => {
    const after = pathname.replace(`/dashboard/${activeGiteId}`, '') || '';
    const sub = after.split('/').filter(Boolean)[0] ?? '';
    return sub ? `/${sub}` : '';
  })();

  const switchGite = (giteId: string) => {
    setOpen(false);
    router.push(`/dashboard/${giteId}${derivedSection}`);
  };

  const handleAddClick = async () => {
    setOpen(false);
    // Check plan guard before showing modal
    try {
      const res = await fetch('/api/gite');
      const data = await res.json();
      const count: number = (data.gites ?? []).length;

      // Optimistic guard based on current count
      // The real check is server-side (Essentiel = jusqu'à 5 hébergements) ; this is just UX
      if (count >= 1 && count < 5) {
        // Encore de la place — laisser la modale gérer la création
      }
    } catch { /* fall through to show modal */ }

    setShowAddModal(true);
  };

  return (
    <>
      <div className="gite-selector" ref={dropRef}>
        <button
          className="gs-trigger"
          onClick={() => gites.length > 1 ? setOpen(o => !o) : handleAddClick()}
          aria-expanded={open}
          aria-haspopup="listbox"
          title={gites.length <= 1 ? "Ajouter un hébergement" : "Changer d'hébergement"}
        >
          <span className="gs-house-icon">
            <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
              <path d="M2 12V6.5L7 2l5 4.5V12a1 1 0 01-1 1H3a1 1 0 01-1-1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
              <path d="M5 13V9h4v4" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
          </span>
          <span className="gs-name">{activeGite?.name ?? '…'}</span>
          {gites.length > 1 && (
            <span className="gs-chevron"><ChevronDown /></span>
          )}
        </button>

        {open && (
          <div className="gs-dropdown" role="listbox">
            {gites.map(g => (
              <button
                key={g.id}
                role="option"
                aria-selected={g.id === activeGiteId}
                className={`gs-option${g.id === activeGiteId ? ' active' : ''}`}
                onClick={() => switchGite(g.id)}
              >
                <span className="gs-opt-dot" />
                <span className="gs-opt-name">{g.name}</span>
                {g.id === activeGiteId && (
                  <svg width="12" height="12" fill="none" viewBox="0 0 12 12" style={{ marginLeft: 'auto', color: 'var(--violet)', flexShrink: 0 }}>
                    <path d="M2.5 6l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            ))}
            <div className="gs-separator" />
            <button className="gs-add-btn" onClick={handleAddClick}>
              <PlusIcon />
              Ajouter un hébergement
            </button>
          </div>
        )}

        {gites.length <= 1 && (
          <button className="gs-add-inline" onClick={handleAddClick} title="Ajouter un hébergement">
            <PlusIcon />
          </button>
        )}
      </div>

      {/* Add Gite Modal */}
      {showAddModal && typeof window !== 'undefined' && createPortal(
        <AddGiteModal
          currentCount={gites.length}
          planActive={planActive}
          onClose={() => setShowAddModal(false)}
          onCreated={(newGiteId) => {
            setShowAddModal(false);
            router.push(`/dashboard/${newGiteId}/etablissement`);
          }}
          onUpgradeRequired={isAdmin ? () => {} : () => { setShowAddModal(false); setShowUpgrade(true); }}
          onMaxReached={isAdmin ? () => {} : () => { setShowAddModal(false); setShowMaxReached(true); }}
        />,
        document.body
      )}

      {/* Upsell Modal — plan Essentiel → Multi */}
      {showUpgrade && typeof window !== 'undefined' && createPortal(
        <UpgradeModal onClose={() => setShowUpgrade(false)} />,
        document.body
      )}

      {/* Max reached modal — 3 gîtes déjà */}
      {showMaxReached && typeof window !== 'undefined' && createPortal(
        <MaxReachedModal onClose={() => setShowMaxReached(false)} />,
        document.body
      )}
    </>
  );
}

/* ─── AddGiteModal ─────────────────────────────────────────────── */

function AddGiteModal({
  currentCount, planActive, onClose, onCreated, onUpgradeRequired, onMaxReached,
}: {
  currentCount: number;
  planActive: boolean;
  onClose: () => void;
  onCreated: (giteId: string) => void;
  onUpgradeRequired: () => void;
  onMaxReached: () => void;
}) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Le passage de 1 → 2 hébergements fait basculer la facturation du palier
  // 9,99 € au palier 19,99 €. Au-delà (2 → 5) le prix ne bouge plus.
  const willChangePrice = currentCount === 1;

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 50); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Le nom est requis.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/gite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), address: address.trim() || undefined }),
      });
      const data = await res.json();
      if (res.status === 402) {
        if (data.code === 'UPGRADE_REQUIRED') { onUpgradeRequired(); return; }
        if (data.code === 'MAX_REACHED') { onMaxReached(); return; }
      }
      if (!res.ok) { setError(data.error ?? 'Erreur lors de la création.'); return; }
      onCreated(data.gite.id);
    } catch {
      setError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(2px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      }}
    >
      <div style={{
        background: 'var(--white, #fff)', borderRadius: '16px', padding: '32px',
        width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,.2)',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#2C2C2A', letterSpacing: '-0.02em', marginBottom: '6px' }}>
          Ajouter un hébergement
        </h2>
        <p style={{ fontSize: '13px', color: '#71716E', lineHeight: 1.6, marginBottom: willChangePrice ? '16px' : '24px' }}>
          Vous pouvez configurer les contrats, les options et la page de réservation après la création.
        </p>

        {willChangePrice && (
          <div style={{
            padding: '14px 16px', marginBottom: '24px', borderRadius: '11px',
            background: 'rgba(127,119,221,.08)', border: '1.5px solid rgba(127,119,221,.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
                <circle cx="8" cy="8" r="6.5" stroke="#5B52B5" strokeWidth="1.3"/>
                <path d="M8 7.5v3M8 5h.01" stroke="#5B52B5" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#5B52B5' }}>
                Votre tarif évolue
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: '#5B52B5', lineHeight: 1.6, margin: 0 }}>
              En ajoutant un 2<sup>e</sup> hébergement, votre abonnement passe de{' '}
              <strong>9,99 €</strong> à <strong>19,99 € HT/mois</strong> (forfait 2 à 5 hébergements).
              {planActive
                ? ' Le montant sera ajusté au prorata et prélevé dès maintenant.'
                : ' Ce tarif s’appliquera à votre abonnement à la fin de l’essai.'}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#71716E', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '8px' }}>
              Nom de l&apos;hébergement *
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="Le Mas des Lavandes"
              style={{
                width: '100%', boxSizing: 'border-box',
                fontFamily: 'inherit', fontSize: '14px', fontWeight: 500,
                padding: '11px 13px', borderRadius: '10px', outline: 'none',
                border: '1.5px solid #E8E6E1', color: '#2C2C2A', background: '#fff',
                transition: 'border-color .2s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#7F77DD'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#E8E6E1'; }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#71716E', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '8px' }}>
              Adresse <span style={{ fontWeight: 400, textTransform: 'none' }}>(optionnel)</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="26 rue des Collines, 74000 Annecy"
              style={{
                width: '100%', boxSizing: 'border-box',
                fontFamily: 'inherit', fontSize: '14px', fontWeight: 500,
                padding: '11px 13px', borderRadius: '10px', outline: 'none',
                border: '1.5px solid #E8E6E1', color: '#2C2C2A', background: '#fff',
                transition: 'border-color .2s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#7F77DD'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#E8E6E1'; }}
            />
          </div>

          {error && (
            <p style={{ fontSize: '12px', color: '#b91c1c', marginBottom: '12px' }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, fontFamily: 'inherit', fontSize: '14px', fontWeight: 600,
                padding: '11px', borderRadius: '10px', cursor: 'pointer',
                border: '1.5px solid #E8E6E1', background: '#fff', color: '#2C2C2A',
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              style={{
                flex: 1, fontFamily: 'inherit', fontSize: '14px', fontWeight: 700,
                padding: '11px', borderRadius: '10px', cursor: loading ? 'wait' : 'pointer',
                border: 'none', background: '#7F77DD', color: '#fff',
                opacity: !name.trim() ? 0.6 : 1,
                transition: 'opacity .2s',
              }}
            >
              {loading ? 'Création…' : willChangePrice ? 'Confirmer et ajouter' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── UpgradeModal ─────────────────────────────────────────────── */

function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(2px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '32px',
        width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,.2)',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        textAlign: 'center',
      }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#F0EFFC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="28" height="28" fill="none" viewBox="0 0 28 28">
            <path d="M14 4l2.5 7.5H24l-6.5 4.5 2.5 7.5L14 19l-6 4.5 2.5-7.5L4 11.5h7.5L14 4z" stroke="#7F77DD" strokeWidth="1.6" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#2C2C2A', letterSpacing: '-0.02em', marginBottom: '10px' }}>
          Gérez jusqu&apos;à 5 hébergements
        </h2>
        <p style={{ fontSize: '14px', color: '#71716E', lineHeight: 1.7, marginBottom: '8px' }}>
          Votre plan <strong>Essentiel</strong> couvre jusqu&apos;à 5 hébergements entiers.
        </p>
        <p style={{ fontSize: '14px', color: '#71716E', lineHeight: 1.7, marginBottom: '28px' }}>
          La facturation passe à <strong style={{ color: '#7F77DD' }}>19,99&nbsp;€/mois</strong> dès le 2<sup>e</sup> hébergement (au lieu de 9,99&nbsp;€/mois pour 1 seul).
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, fontFamily: 'inherit', fontSize: '14px', fontWeight: 600,
              padding: '12px', borderRadius: '10px', cursor: 'pointer',
              border: '1.5px solid #E8E6E1', background: '#fff', color: '#2C2C2A',
            }}
          >
            Pas maintenant
          </button>
          <a
            href="/upgrade"
            style={{
              flex: 1, fontFamily: 'inherit', fontSize: '14px', fontWeight: 700,
              padding: '12px', borderRadius: '10px', cursor: 'pointer',
              border: 'none', background: '#7F77DD', color: '#fff',
              textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            Voir les offres →
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── MaxReachedModal ──────────────────────────────────────────── */

function MaxReachedModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(2px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '32px',
        width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,.2)',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        textAlign: 'center',
      }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="28" height="28" fill="none" viewBox="0 0 28 28">
            <path d="M14 3.5L3.5 22.5h21L14 3.5z" stroke="#689D71" strokeWidth="1.6" strokeLinejoin="round"/>
            <path d="M14 11v6M14 19.5h.01" stroke="#689D71" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#2C2C2A', letterSpacing: '-0.02em', marginBottom: '10px' }}>
          Limite de 5 hébergements atteinte
        </h2>
        <p style={{ fontSize: '14px', color: '#71716E', lineHeight: 1.7, marginBottom: '28px' }}>
          Votre plan <strong>Essentiel</strong> couvre jusqu&apos;à 5 hébergements. Un plan <strong>Kordia Étape</strong> sur-mesure pour les gestionnaires de plus grands parcs est en cours de développement. Contactez-nous pour en savoir plus.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, fontFamily: 'inherit', fontSize: '14px', fontWeight: 600,
              padding: '12px', borderRadius: '10px', cursor: 'pointer',
              border: '1.5px solid #E8E6E1', background: '#fff', color: '#2C2C2A',
            }}
          >
            Fermer
          </button>
          <a
            href="/contact?sujet=Plan+Étape"
            style={{
              flex: 1, fontFamily: 'inherit', fontSize: '14px', fontWeight: 700,
              padding: '12px', borderRadius: '10px', cursor: 'pointer',
              border: 'none', background: '#689D71', color: '#fff',
              textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            Nous contacter
          </a>
        </div>
      </div>
    </div>
  );
}
