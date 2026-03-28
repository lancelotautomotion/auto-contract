"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/providers/ThemeProvider";
import { useClerk, useUser } from "@clerk/nextjs";

const NAV = [
  { href: '/dashboard', label: 'Tableau de bord' },
  { href: '/dashboard/etablissement', label: 'Mon établissement' },
  { href: '/dashboard/settings', label: 'Paramètres' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { dark, toggle } = useTheme();
  const { signOut } = useClerk();
  const { user } = useUser();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside style={{
      width: '220px',
      flexShrink: 0,
      backgroundColor: '#1C1C1A',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      position: 'sticky',
      top: 0,
      height: '100vh',
    }}>
      {/* Brand */}
      <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8A857F' }}>
          ContratGîte
        </span>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '12px 0', flex: 1 }}>
        {NAV.map(item => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'block',
                padding: '10px 24px',
                textDecoration: 'none',
                fontSize: '12px',
                letterSpacing: '0.04em',
                color: active ? '#EDE8E1' : '#7A7570',
                backgroundColor: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                borderLeft: `2px solid ${active ? '#EDE8E1' : 'transparent'}`,
                transition: 'color 0.15s ease, background-color 0.15s ease',
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: dark mode + user */}
      <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <button
          onClick={toggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            padding: '8px 0',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#7A7570',
            fontSize: '12px',
            marginBottom: '14px',
            textAlign: 'left',
          }}
        >
          {dark ? '☀ Mode clair' : '☾ Mode nuit'}
        </button>

        {user && (
          <p style={{
            fontSize: '11px',
            color: '#555552',
            marginBottom: '10px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {user.emailAddresses[0]?.emailAddress}
          </p>
        )}

        <button
          onClick={() => signOut({ redirectUrl: '/' })}
          style={{
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#555552',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
