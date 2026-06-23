import type { Metadata } from 'next';
import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import { IcoChevronLeft, IcoPlus, IcoFileCheck, IcoCalendarDays, IcoClock } from '@/components/icons';

import { Plus_Jakarta_Sans } from 'next/font/google';

import '@/styles/pages.css';

export const metadata: Metadata = {
  title: 'Connexion',
  description: "Connectez-vous à votre espace Kordia pour gérer vos réservations, contrats de location et acomptes.",
};

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
    colorPrimary: '#7F77DD',
    colorDanger: '#c0392b',
    borderRadius: '10px',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    fontSize: '14px',
  },
  elements: {
    rootBox: { width: '100%', maxWidth: '100%', overflow: 'visible' },
    cardBox: { boxShadow: 'none', border: 'none', width: '100%', maxWidth: '100%', overflow: 'visible' },
    card: { boxShadow: 'none', border: 'none', padding: '0', borderRadius: '0', background: 'transparent', width: '100%', maxWidth: '100%', overflow: 'visible' },
    headerTitle: { fontSize: '26px', fontWeight: '800', letterSpacing: '-0.03em', color: '#2C2C2A' },
    headerSubtitle: { color: '#71716E', fontSize: '14px' },
    formFieldLabel: { color: '#2C2C2A', fontSize: '13px', fontWeight: '600' },
    formFieldInput: { border: '1.5px solid #E8E6E1', borderRadius: '10px', padding: '11px 14px', fontSize: '14px' },
    formButtonPrimary: { backgroundColor: '#7F77DD', borderRadius: '10px', fontSize: '15px', fontWeight: '600', padding: '13px 28px', textTransform: 'none' as const },
    footerActionLink: { color: '#7F77DD', fontWeight: '600' },
    dividerLine: { backgroundColor: '#E8E6E1' },
    dividerText: { color: '#A3A3A0', fontSize: '12px' },
    socialButtonsBlockButton: { border: '1.5px solid #E8E6E1', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#2C2C2A' },
    socialButtonsBlockButtonText: { fontWeight: '600' },
    formField: { width: '100%', maxWidth: '100%', minWidth: 0 },
    formFieldInputGroup: { width: '100%', maxWidth: '100%', minWidth: 0 },
    otpCodeField: { display: 'flex', gap: '10px', width: '100%', justifyContent: 'center' },
    otpCodeFieldInput: { width: '52px', minWidth: '52px', height: '56px', fontSize: '22px', fontWeight: '600', textAlign: 'center' as const, border: '1.5px solid #E8E6E1', borderRadius: '10px', flex: '1' },
    footer: { '& a[href*="sign-up"]': { display: 'none' } },
    logoBox: { display: 'none' },
  },
};

export default function SignInPage() {
  return (
    <div className={font.className}>
      <div className="auth-layout">

        <div className="auth-brand">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          <Link href="/" className="auth-back">
            <IcoChevronLeft size={14} strokeWidth={1.5} />
            Retour à l&apos;accueil
          </Link>
          <div className="ab-content">
            <div className="ab-mark">
              <img src="/KORDIA.svg" alt="Kordia" style={{ height: 44, width: 44, display: 'block' }} />
            </div>
            <div className="ab-headline">Gérez votre gîte<br /><span className="g">sans la paperasse.</span></div>
            <div className="ab-desc">Contrats auto-générés, signature en ligne, suivi centralisé. Tout ce qu&apos;il faut pour louer l&apos;esprit libre.</div>
            <div className="ab-pills">
              <div className="ab-pill"><div className="ab-pill-icon g"><IcoPlus size={14} strokeWidth={1.4} color="#689D71" /></div>Contrat généré en 3 minutes</div>
              <div className="ab-pill"><div className="ab-pill-icon v"><IcoFileCheck size={14} strokeWidth={1.4} color="#7F77DD" /></div>Signature électronique eIDAS</div>
              <div className="ab-pill"><div className="ab-pill-icon g"><IcoCalendarDays size={14} strokeWidth={1.4} color="#689D71" /></div>Calendrier et suivi en temps réel</div>
              <div className="ab-pill"><div className="ab-pill-icon v"><IcoClock size={14} strokeWidth={1.4} color="#7F77DD" /></div>Essai gratuit 1 mois, sans CB</div>
            </div>
          </div>
          <div className="ab-footer">© 2026 Kordia · Fait avec soin en France</div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-inner">
            <Link href="/" className="auth-back-mobile">
              <IcoChevronLeft size={13} strokeWidth={1.5} />
              Retour à l&apos;accueil
            </Link>
            <img src="/logotype_KORDIA.svg" alt="Kordia" className="auth-form-logo" style={{ height: 36, width: 'auto', display: 'block' }} />
            <div className="auth-tabs">
              <Link href="/sign-in" className="auth-tab auth-tab--active">Se connecter</Link>
              <Link href="/sign-up" className="auth-tab">Créer un compte</Link>
            </div>
            <SignIn appearance={clerkAppearance} />
          </div>
        </div>

      </div>
    </div>
  );
}
