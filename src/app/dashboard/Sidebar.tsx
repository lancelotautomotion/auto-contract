"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: '/dashboard', label: 'Tableau de bord' },
  { href: '/dashboard/etablissement', label: 'Mon établissement' },
  { href: '/dashboard/settings', label: 'Paramètres' },
];

const ITEM_H = 38;
const ITEM_GAP = 2;

export default function Sidebar() {
  const pathname = usePathname();

  const activeIndex = NAV.findIndex(({ href }) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
  );

  return (
    <aside style={{
      width: '210px',
      flexShrink: 0,
      backgroundColor: 'var(--bg-card)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      position: 'sticky',
      top: 0,
      height: '100vh',
    }}>

      {/* Brand */}
      <div style={{ padding: '32px 20px 28px' }}>
        <span style={{
          fontSize: '10px',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
        }}>
          ContratGîte
        </span>
      </div>

      {/* Nav */}
      <nav style={{ padding: '0 10px', position: 'relative' }}>

        {/* Pill animé */}
        {activeIndex >= 0 && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: '10px',
              right: '10px',
              height: `${ITEM_H}px`,
              top: `${activeIndex * (ITEM_H + ITEM_GAP)}px`,
              backgroundColor: 'var(--bg-white)',
              borderRadius: '8px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
              transition: 'top 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        )}

        {NAV.map((item, i) => {
          const active = i === activeIndex;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                height: `${ITEM_H}px`,
                marginBottom: `${ITEM_GAP}px`,
                padding: '0 14px',
                textDecoration: 'none',
                fontSize: '12.5px',
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '0.01em',
                fontWeight: active ? 500 : 400,
                color: active ? 'var(--text)' : 'var(--text-muted)',
                position: 'relative',
                zIndex: 1,
                transition: 'color 0.2s ease',
                borderRadius: '8px',
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
