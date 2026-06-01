"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useTheme } from "@/providers/ThemeProvider";
import { Bell, Check, Moon, User, AlertTriangle, ChevronRight } from "lucide-react";

interface Props {
  giteId?: string;
  notificationEmail: string;
  notifNewReservation: boolean;
  notifContractSigned: boolean;
  notifPrysmNews: boolean;
}

export default function SettingsForm({ giteId, notificationEmail, notifNewReservation, notifContractSigned, notifPrysmNews }: Props) {
  const { dark, toggle } = useTheme();
  const [notifEmail, setNotifEmail] = useState(notificationEmail);
  const [newRes, setNewRes] = useState(notifNewReservation);
  const [contractSigned, setContractSigned] = useState(notifContractSigned);
  const [prysmNews, setPrysmNews] = useState(notifPrysmNews);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const deleteInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (deleteModal) {
      setDeleteInput('');
      setDeleteError('');
      setTimeout(() => deleteInputRef.current?.focus(), 50);
    }
  }, [deleteModal]);

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'SUPPRIMER') return;
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error ?? 'Une erreur est survenue.');
        setDeleting(false);
        return;
      }
      window.location.href = '/';
    } catch {
      setDeleteError('Impossible de contacter le serveur.');
      setDeleting(false);
    }
  };

  const handleSaveNotif = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giteId,
          notificationEmail: notifEmail,
          notifNewReservation: newRes,
          notifContractSigned: contractSigned,
          notifPrysmNews: prysmNews,
        }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* NOTIFICATIONS */}
      <div className="form-section" style={{ marginBottom: 0 }}>
        <div className="fs-title">
          <Bell size={14} strokeWidth={1.4} />
          Notifications
        </div>
        <div className="fs-divider" />
        <form onSubmit={handleSaveNotif}>
          <div className="form-card">
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Email de notification</label>
              <input
                type="email"
                className="form-input"
                value={notifEmail}
                onChange={e => { setNotifEmail(e.target.value); setSaved(false); }}
                placeholder="votre@email.com"
              />
              <p style={{ fontSize: '12px', color: 'var(--ink-lighter)', margin: '6px 0 0', lineHeight: 1.5 }}>
                Adresse qui recevra les notifications ci-dessous.
              </p>
            </div>

            <div style={{ marginBottom: '4px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-soft)', marginBottom: '10px' }}>
                Choisissez ce que vous souhaitez recevoir
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', border: `1.5px solid ${newRes ? 'var(--violet)' : 'var(--line)'}`, borderRadius: '10px', background: newRes ? 'var(--violet-light)' : 'var(--white)', cursor: 'pointer', transition: 'all .2s', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={newRes}
                    onChange={e => { setNewRes(e.target.checked); setSaved(false); }}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--violet)', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}>Nouvelle demande de réservation</div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '2px' }}>Quand un client remplit le formulaire public</div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', border: `1.5px solid ${contractSigned ? 'var(--violet)' : 'var(--line)'}`, borderRadius: '10px', background: contractSigned ? 'var(--violet-light)' : 'var(--white)', cursor: 'pointer', transition: 'all .2s', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={contractSigned}
                    onChange={e => { setContractSigned(e.target.checked); setSaved(false); }}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--violet)', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}>Contrat signé par le locataire</div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '2px' }}>Dès que la signature électronique est enregistrée</div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', border: `1.5px solid ${prysmNews ? 'var(--violet)' : 'var(--line)'}`, borderRadius: '10px', background: prysmNews ? 'var(--violet-light)' : 'var(--white)', cursor: 'pointer', transition: 'all .2s', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={prysmNews}
                    onChange={e => { setPrysmNews(e.target.checked); setSaved(false); }}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--violet)', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}>Actualités et nouveautés Kordia</div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '2px' }}>Nouvelles fonctionnalités, conseils et offres</div>
                  </div>
                </label>

              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '20px' }}>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-green"
                style={{ fontSize: '13px', padding: '10px 20px', borderRadius: '10px' }}
              >
                {loading ? 'Enregistrement…' : 'Sauvegarder'}
                {!loading && (
                  <Check size={14} strokeWidth={1.5} color="#fff" />
                )}
              </button>
              {saved && (
                <span style={{ fontSize: '12px', color: 'var(--green-dark)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={12} strokeWidth={1.5} />
                  Sauvegardé
                </span>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* APPARENCE */}
      <div className="form-section" style={{ marginBottom: 0 }}>
        <div className="fs-title">
          <Moon size={14} strokeWidth={1.4} />
          Apparence
        </div>
        <div className="fs-divider" />
        <div className="form-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '18px 24px' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginBottom: '2px' }}>Mode nuit</div>
            <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
              {dark ? 'Activé — interface sombre' : 'Désactivé — interface claire'}
            </div>
          </div>
          <button
            type="button"
            onClick={toggle}
            aria-label="Basculer le mode nuit"
            aria-pressed={dark}
            style={{
              width: '48px', height: '26px',
              borderRadius: '13px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: dark ? 'var(--violet)' : 'var(--line)',
              position: 'relative',
              transition: 'background-color 0.2s ease',
              flexShrink: 0,
            }}
          >
            <span style={{
              position: 'absolute',
              top: '3px',
              left: dark ? '25px' : '3px',
              width: '20px', height: '20px',
              borderRadius: '50%',
              backgroundColor: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,.15)',
              transition: 'left 0.2s ease',
              display: 'block',
            }} />
          </button>
        </div>
      </div>

      {/* COMPTE LINK */}
      <div className="form-section" style={{ marginBottom: 0 }}>
        <div className="fs-title">
          <User size={14} strokeWidth={1.4} />
          Compte & Facturation
        </div>
        <div className="fs-divider" />
        <Link
          href="/dashboard/compte"
          className="form-card"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 24px', gap: '16px', textDecoration: 'none', color: 'inherit',
            transition: 'border-color .2s',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginBottom: '2px' }}>Gérer votre compte et votre abonnement</div>
            <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>Profil, plan, portail de facturation Stripe</div>
          </div>
          <ChevronRight size={16} strokeWidth={1.5} style={{ color: 'var(--violet)', flexShrink: 0 }} />
        </Link>
      </div>

      {/* ZONE DE DANGER */}
      <div className="form-section" style={{ marginBottom: 0 }}>
        <div className="fs-title" style={{ color: '#b91c1c' }}>
          <AlertTriangle size={14} strokeWidth={1.4} />
          Zone de danger
        </div>
        <div className="fs-divider" style={{ background: '#FCA5A5' }} />
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '14px', padding: '22px' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#7f1d1d', marginBottom: '4px' }}>Supprimer mon compte</div>
            <div style={{ fontSize: '13px', color: '#b91c1c', lineHeight: 1.6 }}>
              Cette action est <strong>irréversible</strong>. Toutes vos données (gîte, réservations, contrats) seront définitivement supprimées et votre abonnement Stripe sera résilié immédiatement.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDeleteModal(true)}
            style={{
              fontFamily: 'var(--ff)', fontSize: '13px', fontWeight: 600,
              padding: '9px 18px', borderRadius: '10px', cursor: 'pointer',
              border: '1.5px solid #FCA5A5', background: '#fff',
              color: '#b91c1c', transition: 'all .2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FEE2E2'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}
          >
            Supprimer mon compte
          </button>
        </div>
      </div>

    </div>

    {/* MODAL CONFIRMATION SUPPRESSION */}
    {deleteModal && createPortal(
      <div
        onClick={e => { if (e.target === e.currentTarget) setDeleteModal(false); }}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(2px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div style={{
          background: '#ffffff', borderRadius: '16px', padding: '32px',
          width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,.2)',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FEF2F2', border: '1px solid #FCA5A5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <AlertTriangle size={22} strokeWidth={1.5} color="#b91c1c" />
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#2C2C2A', letterSpacing: '-0.02em', marginBottom: '8px', fontFamily: 'inherit' }}>
            Supprimer votre compte ?
          </h2>
          <p style={{ fontSize: '13px', color: '#71716E', lineHeight: 1.6, marginBottom: '20px', margin: '0 0 20px' }}>
            Toutes vos données seront supprimées définitivement — gîte, réservations, contrats, documents. Cette action est <strong style={{ color: '#2C2C2A' }}>irréversible</strong>.
          </p>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#71716E', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '8px' }}>
              Tapez <strong style={{ color: '#b91c1c', fontFamily: 'monospace', letterSpacing: '.05em' }}>SUPPRIMER</strong> pour confirmer
            </label>
            <input
              ref={deleteInputRef}
              type="text"
              value={deleteInput}
              onChange={e => { setDeleteInput(e.target.value); setDeleteError(''); }}
              onKeyDown={e => { if (e.key === 'Enter' && deleteInput === 'SUPPRIMER') handleDeleteAccount(); }}
              placeholder="SUPPRIMER"
              style={{
                width: '100%', boxSizing: 'border-box',
                fontFamily: 'monospace', fontSize: '15px', fontWeight: 600,
                padding: '11px 13px', borderRadius: '10px', outline: 'none',
                border: `1.5px solid ${deleteInput === 'SUPPRIMER' ? '#b91c1c' : '#E8E6E1'}`,
                color: '#b91c1c', background: '#ffffff',
                transition: 'border-color .2s',
              }}
            />
            {deleteError && (
              <p style={{ fontSize: '12px', color: '#b91c1c', marginTop: '6px' }}>{deleteError}</p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setDeleteModal(false)}
              style={{
                flex: 1, fontFamily: 'inherit', fontSize: '14px', fontWeight: 600,
                padding: '11px', borderRadius: '10px', cursor: 'pointer',
                border: '1.5px solid #E8E6E1', background: '#ffffff', color: '#2C2C2A',
                transition: 'border-color .2s',
              }}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleteInput !== 'SUPPRIMER' || deleting}
              style={{
                flex: 1, fontFamily: 'inherit', fontSize: '14px', fontWeight: 700,
                padding: '11px', borderRadius: '10px', cursor: deleteInput === 'SUPPRIMER' && !deleting ? 'pointer' : 'not-allowed',
                border: 'none',
                background: deleteInput === 'SUPPRIMER' && !deleting ? '#b91c1c' : '#FCA5A5',
                color: '#ffffff', transition: 'background .2s',
              }}
            >
              {deleting ? 'Suppression…' : 'Supprimer définitivement'}
            </button>
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  );
}
