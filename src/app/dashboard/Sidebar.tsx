"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: '/dashboard', label: 'Tableau de bord' },
  { href: '/dashboard/archives', label: 'Archives' },
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
          padding: 11px 0 11px 16px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          font-weight: 300;
          color: var(--text-muted);
          text-decoration: none;
          opacity: 0.4;
          transform: translateX(-5px);
          border-left: 1.5px solid var(--border);
          transition:
            opacity 0.35s ease,
            transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94),
            color 0.35s ease,
            border-color 0.35s ease;
          position: relative;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          left: -1.5px;
          top: 50%;
          transform: translateY(-50%) scaleY(0);
          width: 1.5px;
          height: 60%;
          background-color: var(--text);
          transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          transform-origin: center;
        }
        .nav-link.active {
          color: var(--text);
          opacity: 1;
          transform: translateX(0);
          font-style: italic;
          border-color: transparent;
        }
        .nav-link.active::after {
          transform: translateY(-50%) scaleY(1);
        }
        .nav-link:hover:not(.active) {
          opacity: 0.65;
          transform: translateX(-2px);
        }
      `}</style>

      <nav style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
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
