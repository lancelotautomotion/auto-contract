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
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 16px' }}>
        {NAV.map(item => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'block',
                padding: '10px 0',
                textDecoration: active ? 'underline' : 'none',
                textUnderlineOffset: '4px',
                textAlign: 'center',
                fontSize: '15px',
                color: active ? 'var(--text)' : 'var(--text-muted)',
                fontWeight: active ? 500 : 400,
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '0.01em',
                transition: 'color 0.2s ease, opacity 0.2s ease',
                opacity: active ? 1 : 0.65,
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '0 16px', textAlign: 'center' }}>
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
            textAlign: 'center',
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
            textAlign: 'center',
          }}
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
