import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getTrialInfo } from "@/lib/trial";
import { UserButton } from "@clerk/nextjs";
import { Plus_Jakarta_Sans } from "next/font/google";
import SubscribeButton from "./SubscribeButton";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const essentialFeatures = [
  "Contrats de location illimités",
  "Signature électronique eIDAS",
  "Envoi automatisé par email",
  "Rappels d'acompte automatiques",
  "Archivage PDF des contrats signés",
  "Documents joints (RIB, règlement…)",
  "Tableau de bord et suivi",
  "Support prioritaire",
];

export default async function UpgradePage({ searchParams }: { searchParams: Promise<{ canceled?: string }> }) {
  const { userId: clerkId } = await auth();
  let trialInfo = null;
  if (clerkId) {
    const dbUser = await prisma.user.findUnique({ where: { clerkId } });
    if (dbUser) trialInfo = getTrialInfo(dbUser);
  }

  const isExpired = trialInfo?.isExpired ?? false;
  const isActive = trialInfo?.isActive ?? false;
  const isTrial = trialInfo && !trialInfo.isExpired && !isActive;
  const { canceled } = await searchParams;
  const showCanceled = canceled === "1";

  return (
    <div className={font.className} style={{
      minHeight: '100vh', backgroundColor: '#F3F2EE', display: 'flex', flexDirection: 'column',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", WebkitFontSmoothing: 'antialiased',
    }}>
      {/* Header */}
      <header style={{ padding: '18px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E8E6E1', backgroundColor: '#FFFFFF' }}>
        <span style={{ fontSize: '15px', fontWeight: 800, color: '#2C2C2A', letterSpacing: '-0.02em' }}>Prysme</span>
        <UserButton />
      </header>

      <main style={{ flex: 1, padding: '48px 20px 64px' }}>

        {/* Page title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#A3A3A0', margin: '0 0 10px' }}>Tarifs</p>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 800, color: '#2C2C2A', letterSpacing: '-0.03em', margin: '0 0 10px', lineHeight: 1.2 }}>
            Choisissez votre formule
          </h1>
          <p style={{ fontSize: '15px', color: '#71716E', margin: 0, lineHeight: 1.6 }}>
            Sans engagement. Annulable à tout moment.
          </p>
        </div>

        {/* Banners */}
        {isExpired && (
          <div style={{ maxWidth: '860px', margin: '0 auto 28px', padding: '14px 20px', backgroundColor: '#FEF3C7', border: '1.5px solid rgba(217,119,6,.3)', borderRadius: '12px' }}>
            <p style={{ fontSize: '14px', color: '#92400E', margin: 0, lineHeight: 1.6, fontWeight: 600 }}>
              Votre période d&apos;essai est terminée — souscrivez pour continuer à utiliser Prysme.
            </p>
          </div>
        )}
        {showCanceled && !isActive && (
          <div style={{ maxWidth: '860px', margin: '0 auto 24px', padding: '12px 20px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '10px' }}>
            <p style={{ fontSize: '13px', color: '#b91c1c', margin: 0, lineHeight: 1.5 }}>Paiement annulé. Vous pouvez réessayer quand vous voulez.</p>
          </div>
        )}
        {isActive && (
          <div style={{ maxWidth: '860px', margin: '0 auto 28px', padding: '14px 20px', backgroundColor: 'rgba(104,157,113,.1)', border: '1.5px solid rgba(104,157,113,.3)', borderRadius: '12px' }}>
            <p style={{ fontSize: '14px', color: '#3F6B4A', margin: 0, lineHeight: 1.6, fontWeight: 600 }}>
              ✓ Votre abonnement est actif. Gérez-le depuis{' '}
              <a href="/dashboard/compte" style={{ color: '#3F6B4A', fontWeight: 700 }}>Mon compte</a>.
            </p>
          </div>
        )}

        {/* Pricing grid */}
        <div style={{ maxWidth: '860px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', alignItems: 'start' }}>

          {/* Plan Gratuit */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E8E6E1', overflow: 'hidden', opacity: isExpired ? 0.55 : 1 }}>
            <div style={{ height: '4px', backgroundColor: '#E8E6E1' }}/>
            <div style={{ padding: '28px 28px 32px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: '#A3A3A0', margin: '0 0 6px' }}>Gratuit</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', marginBottom: '4px' }}>
                <span style={{ fontSize: '36px', fontWeight: 800, color: '#2C2C2A', letterSpacing: '-0.04em', lineHeight: 1 }}>0 €</span>
              </div>
              <p style={{ fontSize: '13px', color: '#71716E', margin: '0 0 24px', lineHeight: 1.5 }}>
                {isExpired ? 'Période d\'essai expirée.' : isTrial ? `${trialInfo?.daysLeft ?? 0} jour${(trialInfo?.daysLeft ?? 0) > 1 ? 's' : ''} restant${(trialInfo?.daysLeft ?? 0) > 1 ? 's' : ''} dans votre essai.` : 'Essai 30 jours inclus.'}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['1 hébergement', '3 contrats / mois', 'Signature eIDAS', 'Email automatique'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: isExpired ? '#A3A3A0' : '#2C2C2A' }}>
                    <span style={{ width: '18px', height: '18px', borderRadius: '5px', backgroundColor: '#F3F2EE', color: '#A3A3A0', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div style={{ padding: '11px 16px', background: '#F3F2EE', borderRadius: '10px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#A3A3A0' }}>
                {isTrial ? 'Plan actuel' : isExpired ? 'Expiré' : 'Actuel'}
              </div>
            </div>
          </div>

          {/* Plan Essentiel — Recommandé */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '2px solid #7F77DD', overflow: 'hidden', position: 'relative' }}>
            <div style={{ height: '4px', backgroundColor: '#7F77DD' }}/>
            {/* Badge */}
            <div style={{ position: 'absolute', top: '16px', right: '16px', background: '#7F77DD', color: '#fff', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', padding: '3px 10px', borderRadius: '20px' }}>
              Recommandé
            </div>
            <div style={{ padding: '28px 28px 32px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: '#7F77DD', margin: '0 0 6px' }}>Essentiel</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', marginBottom: '4px' }}>
                <span style={{ fontSize: '36px', fontWeight: 800, color: '#2C2C2A', letterSpacing: '-0.04em', lineHeight: 1 }}>9,99 €</span>
                <span style={{ fontSize: '13px', color: '#A3A3A0', paddingBottom: '6px' }}>HT / mois</span>
              </div>
              <p style={{ fontSize: '13px', color: '#71716E', margin: '0 0 24px', lineHeight: 1.5 }}>
                Tout inclus. Sans engagement.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {essentialFeatures.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#2C2C2A' }}>
                    <span style={{ width: '18px', height: '18px', borderRadius: '5px', backgroundColor: 'rgba(104,157,113,.15)', color: '#689D71', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <SubscribeButton disabled={isActive} />
              <p style={{ fontSize: '11px', color: '#A3A3A0', textAlign: 'center', margin: '12px 0 0', lineHeight: 1.5 }}>
                Paiement sécurisé par Stripe.
              </p>
            </div>
          </div>

          {/* Plan Multi-hébergement — Coming soon */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E8E6E1', overflow: 'hidden', opacity: 0.7 }}>
            <div style={{ height: '4px', backgroundColor: '#689D71' }}/>
            <div style={{ padding: '28px 28px 32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: '#689D71', margin: 0 }}>Multi-hébergement</p>
                <span style={{ background: '#EEF5EF', color: '#689D71', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', padding: '2px 8px', borderRadius: '20px', flexShrink: 0 }}>Bientôt</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', marginBottom: '4px' }}>
                <span style={{ fontSize: '36px', fontWeight: 800, color: '#2C2C2A', letterSpacing: '-0.04em', lineHeight: 1 }}>15 €</span>
                <span style={{ fontSize: '13px', color: '#A3A3A0', paddingBottom: '6px' }}>HT / mois</span>
              </div>
              <p style={{ fontSize: '13px', color: '#71716E', margin: '0 0 24px', lineHeight: 1.5 }}>
                Jusqu&apos;à 3 hébergements. Tout inclus.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Jusqu\'à 3 hébergements', 'Contrats illimités', 'Tout ce qu\'inclut Essentiel', 'Tableau de bord unifié'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#2C2C2A' }}>
                    <span style={{ width: '18px', height: '18px', borderRadius: '5px', backgroundColor: 'rgba(104,157,113,.12)', color: '#689D71', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div style={{ padding: '11px 16px', background: '#EEF5EF', borderRadius: '10px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#689D71' }}>
                Disponible prochainement
              </div>
            </div>
          </div>

        </div>

        {/* Back link */}
        {!isExpired && (
          <div style={{ textAlign: 'center', marginTop: '28px' }}>
            <a href="/dashboard" style={{ fontSize: '13px', color: '#A3A3A0', textDecoration: 'none' }}>
              ← Retour au tableau de bord
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
