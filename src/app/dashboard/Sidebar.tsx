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

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <>
      <style>{`
        .nav-item {
          position: relative;
          display: flex;
          align-items: center;
          padding: 20px 28px;
          text-decoration: none;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border);
          transition: color 0.2s ease;
          overflow: hidden;
        }
        .nav-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--text);
          transform: scaleY(0);
          transform-origin: bottom;
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nav-item.active {
          color: var(--text);
          font-weight: 400;
        }
        .nav-item.active::before {
          transform: scaleY(1);
        }
        .nav-item:not(.active):hover {
          color: var(--text);
        }
      `}</style>

      <aside style={{
        width: '200px',
        flexShrink: 0,
        backgroundColor: 'var(--bg-card)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        position: 'sticky',
        top: 0,
        height: '100vh',
        borderRight: '1px solid var(--border)',
      }}>

        {/* Brand */}
        <div style={{
          padding: '32px 28px 28px',
          borderBottom: '1px solid var(--border)',
        }}>
          <span style={{
            fontSize: '9px',
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
        <nav style={{ flex: 1 }}>
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item${isActive(item.href) ? ' active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

      </aside>
    </>
  );
}
