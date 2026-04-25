"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/providers/ThemeProvider";

interface Props {
  notificationEmail: string;
  notifNewReservation: boolean;
  notifContractSigned: boolean;
  notifPrysmNews: boolean;
}

export default function SettingsForm({ notificationEmail, notifNewReservation, notifContractSigned, notifPrysmNews }: Props) {
  const { dark, toggle } = useTheme();
  const [notifEmail, setNotifEmail] = useState(notificationEmail);
  const [newRes, setNewRes] = useState(notifNewReservation);
  const [contractSigned, setContractSigned] = useState(notifContractSigned);
  const [prysmNews, setPrysmNews] = useState(notifPrysmNews);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveNotif = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* NOTIFICATIONS */}
      <div className="form-section" style={{ marginBottom: 0 }}>
        <div className="fs-title">
          <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
            <path d="M3.5 5.5a3.5 3.5 0 117 0v2.2l1 1.3H2.5l1-1.3V5.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            <path d="M5.5 11.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
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
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}>Actualités et nouveautés Prysme</div>
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
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                    <path d="M3 7l3 3 5-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
              {saved && (
                <span style={{ fontSize: '12px', color: 'var(--green-dark)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
                    <path d="M3 6l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
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
          <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
            <path d="M11 7.5a4.5 4.5 0 01-5.5-5.5A5 5 0 107 12.5c0 0 .7-.04 1.4-.19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
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
          <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
            <circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M2 13c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
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
          <svg width="16" height="16" fill="none" viewBox="0 0 16 16" style={{ color: 'var(--violet)', flexShrink: 0 }}>
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>

    </div>
  );
}
