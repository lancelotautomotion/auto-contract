import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getTrialInfo } from "@/lib/trial";
import Image from "next/image";
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
  const user = await currentUser();
  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || (user.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() ?? 'U')
    : 'U';

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
      <header style={{ padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E8E6E1', backgroundColor: '#FFFFFF' }}>
        <Image src="/logotype_prysme.png" alt="Prysme" width={120} height={28} style={{ height: 22, width: 'auto', objectFit: 'contain' }}/>
        <div
          aria-hidden="true"
          style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #7F77DD, #5B52B5)',
            color: '#fff', fontSize: '12px', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(127,119,221,.3)',
            userSelect: 'none', pointerEvents: 'none',
          }}
        >
          {initials}
        </div>
      </header>

      {/* Hero coloré violet → vert */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #EFEEF9 0%, #FCFFF2 50%, #EEF5EF 100%)',
        padding: '56px 20px 48px', textAlign: 'center',
        borderBottom: '1px solid #E8E6E1',
      }}>
        {/* Orbs décoratifs */}
        <div aria-hidden style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', top: '-100px', left: '-80px', background: 'radial-gradient(circle, rgba(127,119,221,.18) 0%, transparent 65%)', pointerEvents: 'none' }}/>
        <div aria-hidden style={{ position: 'absolute', width: '320px', height: '320px', borderRadius: '50%', bottom: '-120px', right: '-80px', background: 'radial-gradient(circle, rgba(104,157,113,.15) 0%, transparent 65%)', pointerEvents: 'none' }}/>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#5B52B5', marginBottom: '16px' }}>
            <span style={{ width: '16px', height: '2px', borderRadius: '1px', background: '#7F77DD' }}/>
            Tarifs
          </span>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, color: '#2C2C2A', letterSpacing: '-0.03em', margin: '0 0 12px', lineHeight: 1.15 }}>
            Choisissez votre <span style={{ color: '#7F77DD' }}>formule</span>
          </h1>
          <p style={{ fontSize: '15px', color: '#71716E', margin: 0, lineHeight: 1.6 }}>
            Sans engagement. Annulable à tout moment.
          </p>
        </div>
      </section>

      <main style={{ flex: 1, padding: '40px 20px 64px' }}>

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
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E8E6E1', overflow: 'hidden', opacity: isExpired ? 0.6 : 1 }}>
            <div style={{ height: '4px', background: 'linear-gradient(90deg, #689D71 0%, #9B95E8 100%)' }}/>
            <div style={{ padding: '28px 28px 32px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: '#689D71', margin: '0 0 6px' }}>Gratuit</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', marginBottom: '4px' }}>
                <span style={{ fontSize: '36px', fontWeight: 800, color: '#2C2C2A', letterSpacing: '-0.04em', lineHeight: 1 }}>0 €</span>
              </div>
              <p style={{ fontSize: '13px', color: '#71716E', margin: '0 0 24px', lineHeight: 1.5 }}>
                {isExpired ? 'Période d\'essai expirée.' : isTrial ? `${trialInfo?.daysLeft ?? 0} jour${(trialInfo?.daysLeft ?? 0) > 1 ? 's' : ''} restant${(trialInfo?.daysLeft ?? 0) > 1 ? 's' : ''} dans votre essai.` : 'Essai 30 jours inclus.'}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['1 hébergement', '3 contrats / mois', 'Signature eIDAS', 'Email automatique'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: isExpired ? '#A3A3A0' : '#2C2C2A' }}>
                    <span style={{ width: '18px', height: '18px', borderRadius: '5px', backgroundColor: 'rgba(104,157,113,.15)', color: '#689D71', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div style={{ padding: '11px 16px', background: isExpired ? '#FEF2F2' : 'rgba(104,157,113,.1)', border: `1px solid ${isExpired ? 'rgba(220,38,38,.2)' : 'rgba(104,157,113,.25)'}`, borderRadius: '10px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: isExpired ? '#b91c1c' : '#4A7353' }}>
                {isTrial ? '✓ Plan actuel' : isExpired ? 'Expiré' : 'Plan actuel'}
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
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1.5px solid rgba(104,157,113,.3)', overflow: 'hidden', position: 'relative' }}>
            <div style={{ height: '4px', backgroundColor: '#689D71' }}/>
            {/* Badge Bientôt */}
            <div style={{ position: 'absolute', top: '16px', right: '16px', background: '#689D71', color: '#fff', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', padding: '3px 10px', borderRadius: '20px' }}>
              Bientôt
            </div>
            <div style={{ padding: '28px 28px 32px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: '#689D71', margin: '0 0 6px' }}>Multi-hébergement</p>
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
                    <span style={{ width: '18px', height: '18px', borderRadius: '5px', backgroundColor: 'rgba(104,157,113,.18)', color: '#689D71', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div style={{ padding: '11px 16px', background: '#EEF5EF', border: '1px solid rgba(104,157,113,.25)', borderRadius: '10px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#4A7353' }}>
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
