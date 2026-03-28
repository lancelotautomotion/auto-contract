"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: '/dashboard', label: 'Tableau de bord' },
  { href: '/dashboard/etablissement', label: 'Mon établissement' },
  { href: '/dashboard/settings', label: 'Paramètres' },
];

export default function Nav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <>
      <style>{`
        .nav-link {
          display: block;
          padding: 18px 0;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
          text-decoration: none;
          position: relative;
          transition: color 0.2s ease;
          border-bottom: 1px solid var(--border);
        }
        .nav-link:first-child {
          border-top: 1px solid var(--border);
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 0;
          height: 1px;
          background-color: var(--text);
          transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nav-link.active {
          color: var(--text);
          font-weight: 400;
        }
        .nav-link.active::after {
          width: 100%;
        }
        .nav-link:hover {
          color: var(--text);
        }
        .nav-link:hover::after {
          width: 100%;
        }
      `}</style>

      <nav style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'stretch',
        width: '180px',
      }}>
        {NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link${isActive(item.href) ? ' active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
