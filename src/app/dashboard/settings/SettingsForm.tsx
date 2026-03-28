"use client";

import { useState } from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { useClerk } from "@clerk/nextjs";

const lbl = { fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' };
const inp = { width: '100%', padding: '10px 14px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-white)', fontSize: '14px', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' as const, borderRadius: '8px' };
const secTitle = { fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' };

interface Props {
  notificationEmail: string;
  userEmail: string;
}

export default function SettingsForm({ notificationEmail, userEmail }: Props) {
  const { dark, toggle } = useTheme();
  const { signOut } = useClerk();
  const [notifEmail, setNotifEmail] = useState(notificationEmail);
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
        body: JSON.stringify({ notificationEmail: notifEmail }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

      {/* Notifications */}
      <section>
        <p style={secTitle}>Notifications</p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
          Recevez un email lorsqu&apos;un client soumet une nouvelle demande de réservation.
        </p>
        <form onSubmit={handleSaveNotif}>
          <div style={{ marginBottom: '16px' }}>
            <label style={lbl}>Email de notification</label>
            <input
              type="email"
              style={inp}
              value={notifEmail}
              onChange={e => { setNotifEmail(e.target.value); setSaved(false); }}
              placeholder="votre@email.com"
            />
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button
              type="submit"
              disabled={loading}
              style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '12px 24px', backgroundColor: loading ? 'var(--text-muted)' : 'var(--text)', color: 'var(--bg)', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', borderRadius: '8px' }}
            >
              {loading ? 'Enregistrement...' : 'Sauvegarder →'}
            </button>
            {saved && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>✓ Sauvegardé</span>}
          </div>
        </form>
      </section>

      {/* Apparence */}
      <section>
        <p style={secTitle}>Apparence</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', backgroundColor: 'var(--bg-white)', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text)', margin: '0 0 4px' }}>Mode nuit</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              {dark ? 'Activé — interface sombre' : 'Désactivé — interface claire'}
            </p>
          </div>
          <button
            type="button"
            onClick={toggle}
            style={{
              width: '48px', height: '26px',
              borderRadius: '13px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: dark ? '#1C1C1A' : 'var(--border)',
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
              backgroundColor: dark ? '#EDE8E1' : '#F7F4F0',
              border: '1px solid rgba(0,0,0,0.1)',
              transition: 'left 0.2s ease',
              display: 'block',
            }} />
          </button>
        </div>
      </section>

      {/* Compte */}
      <section>
        <p style={secTitle}>Compte</p>
        <div style={{ padding: '16px 20px', backgroundColor: 'var(--bg-white)', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Email</p>
            <p style={{ fontSize: '13px', color: 'var(--text)', margin: 0 }}>{userEmail}</p>
          </div>
          <button
            type="button"
            onClick={() => signOut({ redirectUrl: '/' })}
            style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '8px 16px', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: '8px' }}
          >
            Déconnexion
          </button>
        </div>
      </section>

    </div>
  );
}
