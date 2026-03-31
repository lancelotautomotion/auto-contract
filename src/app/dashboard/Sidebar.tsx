"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";

const IconGrid = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
    <rect x="1" y="1" width="5.5" height="5.5" rx="1" />
    <rect x="8.5" y="1" width="5.5" height="5.5" rx="1" />
    <rect x="1" y="8.5" width="5.5" height="5.5" rx="1" />
    <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" />
  </svg>
);

const IconBuilding = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
    <path d="M7.5 1.5L1 5.5V14h4.5v-4h4v4H14V5.5L7.5 1.5z" />
  </svg>
);

const IconSettings = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M7.5 10a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm0-1.5a1 1 0 100-2 1 1 0 000 2z" />
    <path fillRule="evenodd" clipRule="evenodd" d="M6.2 1a.5.5 0 00-.49.4l-.24 1.3A5.5 5.5 0 004.22 3.4l-1.24-.5a.5.5 0 00-.6.19L1.18 4.9a.5.5 0 00.1.64l1.02.87A5.5 5.5 0 002.2 7.5c0 .37.04.73.1 1.08l-1.02.87a.5.5 0 00-.1.64l1.2 1.82c.13.2.38.27.6.18l1.24-.5c.39.28.8.52 1.25.71l.24 1.3a.5.5 0 00.49.4h2.4a.5.5 0 00.49-.4l.24-1.3c.44-.19.86-.43 1.25-.71l1.24.5c.22.09.47.02.6-.18l1.2-1.82a.5.5 0 00-.1-.64l-1.01-.87c.06-.35.1-.71.1-1.08s-.04-.73-.1-1.08l1.01-.87a.5.5 0 00.1-.64L12.38 3.1a.5.5 0 00-.6-.19l-1.24.5a5.5 5.5 0 00-1.25-.71l-.24-1.3A.5.5 0 008.6 1H6.2z" />
  </svg>
);

const IconHelp = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M7 1a6 6 0 100 12A6 6 0 007 1zm0 9.5a.75.75 0 110-1.5.75.75 0 010 1.5zm.75-3.25a.75.75 0 01-1.5 0V7a.75.75 0 01.56-.73C7.25 6.1 7.75 5.6 7.75 5a.75.75 0 00-1.5 0 .75.75 0 01-1.5 0 2.25 2.25 0 014.5 0c0 .98-.63 1.8-1.5 2.12v.13z" />
  </svg>
);

const IconLogout = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
    <path d="M5 2H2.5A1.5 1.5 0 001 3.5v7A1.5 1.5 0 002.5 12H5M9.5 9.5L13 7m0 0L9.5 4.5M13 7H5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NAV = [
  { href: '/dashboard', label: 'Tableau de bord', Icon: IconGrid },
  { href: '/dashboard/etablissement', label: 'Mon établissement', Icon: IconBuilding },
  { href: '/dashboard/settings', label: 'Paramètres', Icon: IconSettings },
];

export default function Nav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Brand */}
      <div style={{ padding: '28px 20px 24px' }}>
        <div style={{ fontSize: '17px', fontWeight: 700, color: '#1A1A14', letterSpacing: '-0.01em', fontFamily: 'Inter, sans-serif' }}>
          ContratGîte
        </div>
        <div style={{ fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#A8A49C', marginTop: '3px', fontFamily: 'Inter, sans-serif' }}>
          Gestion locative
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {NAV.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: active ? 500 : 400,
                fontFamily: 'Inter, sans-serif',
                backgroundColor: active ? '#1B2C1A' : 'transparent',
                color: active ? '#FFFFFF' : '#8A8878',
                transition: 'background-color 0.15s ease, color 0.15s ease',
              }}
            >
              <Icon />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '16px 12px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Link
          href="/dashboard/etablissement"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '11px 16px',
            borderRadius: '100px',
            backgroundColor: '#1B2C1A',
            color: '#FFFFFF',
            textDecoration: 'none',
            fontSize: '12px',
            fontWeight: 500,
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.02em',
          }}
        >
          + Mon établissement
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 4px 0' }}>
          <Link href="/comment-ca-marche" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A8A49C', textDecoration: 'none', fontFamily: 'Inter, sans-serif' }}>
            <IconHelp />
            Aide
          </Link>
          <SignOutButton redirectUrl="/">
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A8A49C', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', padding: 0 }}>
              <IconLogout />
              Déconnexion
            </button>
          </SignOutButton>
        </div>
      </div>

    </div>
  );
}
