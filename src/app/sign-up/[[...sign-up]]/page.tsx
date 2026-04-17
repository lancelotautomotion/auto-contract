import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { Plus_Jakarta_Sans } from 'next/font/google';

import '@/styles/pages.css';

const font = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const clerkAppearance = {
  variables: {
    colorBackground: '#FFFFFF',
    colorInputBackground: '#FFFFFF',
    colorInputText: '#2C2C2A',
    colorText: '#2C2C2A',
    colorTextSecondary: '#71716E',
    colorPrimary: '#689D71',
    colorDanger: '#c0392b',
    borderRadius: '10px',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    fontSize: '14px',
  },
  elements: {
    rootBox: { width: '100%' },
    cardBox: { boxShadow: 'none', border: 'none', width: '100%' },
    card: { boxShadow: 'none', border: 'none', padding: '0', borderRadius: '0', background: 'transparent', width: '100%' },
    headerTitle: {
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      fontSize: '26px',
      fontWeight: '800',
      letterSpacing: '-0.03em',
      color: '#2C2C2A',
    },
    headerSubtitle: { color: '#71716E', fontSize: '14px' },
    formFieldLabel: { color: '#2C2C2A', fontSize: '13px', fontWeight: '600' },
    formFieldInput: {
      border: '1.5px solid #E8E6E1',
      borderRadius: '10px',
      padding: '11px 14px',
      fontSize: '14px',
      color: '#2C2C2A',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    },
    formButtonPrimary: {
      backgroundColor: '#689D71',
      borderRadius: '10px',
      fontSize: '15px',
      fontWeight: '600',
      padding: '13px 28px',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      letterSpacing: 'normal',
      textTransform: 'none' as const,
    },
    footerActionLink: { color: '#689D71', fontWeight: '600' },
    footerActionText: { color: '#71716E' },
    dividerLine: { backgroundColor: '#E8E6E1' },
    dividerText: { color: '#A3A3A0', fontSize: '12px' },
    identityPreviewText: { color: '#2C2C2A' },
    formResendCodeLink: { color: '#689D71' },
    socialButtonsBlockButton: {
      border: '1.5px solid #E8E6E1',
      borderRadius: '10px',
      fontSize: '13px',
      fontWeight: '600',
      color: '#2C2C2A',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    },
  },
};

export default function SignUpPage() {
  return (
    <div className={font.className}>
      <div className="auth-layout">

        {/* Left brand panel */}
        <div className="auth-brand">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          <div className="ab-content">
            <div className="ab-mark">
              <Image src="/logotype_prysme.png" alt="Prysme" width={44} height={44} style={{ objectFit: 'contain' }} />
            </div>
            <div className="ab-headline">
              Gérez votre gîte<br />
              <span className="g">sans la paperasse.</span>
            </div>
            <div className="ab-desc">Contrats auto-générés, signature en ligne, suivi centralisé. Tout ce qu&apos;il faut pour louer l&apos;esprit libre.</div>
            <div className="ab-pills">
              <div className="ab-pill">
                <div className="ab-pill-icon g">
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                    <path d="M4 7h6M7 4v6" stroke="#689D71" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                </div>
                Contrat généré en 3 minutes
              </div>
              <div className="ab-pill">
                <div className="ab-pill-icon v">
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                    <rect x="2.5" y="2" width="9" height="10" rx="1.5" stroke="#7F77DD" strokeWidth="1.2"/>
                    <path d="M5 6l1.5 1.5L10 4.5" stroke="#7F77DD" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                Signature électronique eIDAS
              </div>
              <div className="ab-pill">
                <div className="ab-pill-icon g">
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                    <rect x="1.5" y="3" width="11" height="9" rx="1.5" stroke="#689D71" strokeWidth="1.2"/>
                    <path d="M1.5 6h11" stroke="#689D71" strokeWidth="1.2"/>
                  </svg>
                </div>
                Calendrier et suivi en temps réel
              </div>
              <div className="ab-pill">
                <div className="ab-pill-icon v">
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                    <circle cx="7" cy="7" r="5" stroke="#7F77DD" strokeWidth="1.2"/>
                    <path d="M7 4.5v2.5l2 1.5" stroke="#7F77DD" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </div>
                Essai gratuit 1 mois, sans CB
              </div>
            </div>
          </div>
          <div className="ab-footer">© 2026 Prysme · Fait avec soin en France</div>
        </div>

        {/* Right form panel */}
        <div className="auth-form-panel">
          <div style={{ width: '100%', maxWidth: '420px' }}>
            <div className="mobile-logo">
              <Link href="/"><Image src="/logotype_prysme.png" alt="Prysme" width={96} height={24} /></Link>
            </div>
            <SignUp appearance={clerkAppearance} />
          </div>
        </div>

      </div>
    </div>
  );
}
