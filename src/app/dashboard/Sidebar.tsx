"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/providers/ThemeProvider";
import { useClerk } from "@clerk/nextjs";

const NAV = [
  { href: '/dashboard', label: 'Tableau de bord' },
  { href: '/dashboard/etablissement', label: 'Mon établissement' },
  { href: '/dashboard/settings', label: 'Paramètres' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { dark, toggle } = useTheme();
  const { signOut } = useClerk();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside style={{
      width: '220px',
      flexShrink: 0,
      backgroundColor: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      position: 'sticky',
      top: 0,
      height: '100vh',
      padding: '48px 0',
    }}>
      {/* Navigation */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px 0 40px' }}>
        {NAV.map(item => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'block',
                padding: '7px 0 7px 16px',
                marginBottom: '4px',
                textDecoration: 'none',
                fontSize: '13px',
                color: active ? 'var(--text)' : 'var(--text-muted)',
                fontWeight: active ? 500 : 400,
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '0.01em',
                borderLeft: active ? '2px solid var(--text)' : '2px solid transparent',
                transition: 'color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease',
                opacity: active ? 1 : 0.7,
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '0 24px 0 40px' }}>
        <button
          onClick={toggle}
          style={{
            display: 'block',
            width: '100%',
            padding: '0 0 10px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: '11px',
            fontFamily: "'Inter', sans-serif",
            letterSpacing: '0.04em',
            textAlign: 'left',
          }}
        >
          {dark ? '☾ Mode nuit' : '☀ Mode clair'}
        </button>

        <button
          onClick={() => signOut({ redirectUrl: '/' })}
          style={{
            display: 'block',
            width: '100%',
            padding: 0,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: '11px',
            fontFamily: "'Inter', sans-serif",
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            textAlign: 'left',
          }}
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
