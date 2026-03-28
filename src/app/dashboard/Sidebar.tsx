"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: '/dashboard', label: 'Tableau de bord' },
  { href: '/dashboard/etablissement', label: 'Mon établissement' },
  { href: '/dashboard/settings', label: 'Paramètres' },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside style={{
      width: '420px',
      flexShrink: 0,
      backgroundColor: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      minHeight: '100vh',
      position: 'sticky',
      top: 0,
      height: '100vh',
    }}>
      <nav style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        {NAV.map(item => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'block',
                padding: '6px 0',
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
    </aside>
  );
}
