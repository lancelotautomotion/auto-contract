import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getTrialInfo } from "@/lib/trial";
import Image from "next/image";
import { Plus_Jakarta_Sans } from "next/font/google";
import SubscribeButton from "./SubscribeButton";
import "@/styles/upgrade.css";
import { IcoChevronLeft, IcoInfo } from "@/components/icons";

export const metadata: Metadata = {
  title: "Abonnement",
  description: "Choisissez votre formule Kordia : Essentiel ou Multi-hébergement. Contrats illimités, signature eIDAS, envoi automatisé.",
};

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
  let giteCount = 0;
  let offerType: string = "gite";
  if (clerkId) {
    const dbUser = await prisma.user.findUnique({ where: { clerkId } });
    if (dbUser) {
      trialInfo = getTrialInfo(dbUser);
      offerType = dbUser.offerType ?? "gite";
      giteCount = await prisma.gite.count({ where: { userId: dbUser.id, deletedAt: null } });
    }
  }
  const billedQuantity = Math.min(Math.max(giteCount, 1), 5);
  const monthlyPrice = billedQuantity <= 1 ? "10 €" : "20 €";
  const recommended: "essential" | "hote" = offerType === "guesthouse" ? "hote" : "essential";
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
      <header className="upgrade-header">
        <Image src="/logotype_KORDIA.svg" alt="Kordia" width={120} height={28} style={{ height: 22, width: 'auto', objectFit: 'contain' }}/>
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

      {/* Hero */}
      <section className="upgrade-hero">
        <div aria-hidden style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', top: '-100px', left: '-80px', background: 'radial-gradient(circle, rgba(127,119,221,.18) 0%, transparent 65%)', pointerEvents: 'none' }}/>
        <div aria-hidden style={{ position: 'absolute', width: '320px', height: '320px', borderRadius: '50%', bottom: '-120px', right: '-80px', background: 'radial-gradient(circle, rgba(104,157,113,.15) 0%, transparent 65%)', pointerEvents: 'none' }}/>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#5B52B5', marginBottom: '16px' }}>
            <span style={{ width: '16px', height: '2px', borderRadius: '1px', background: '#7F77DD' }}/>
            Tarifs
          </span>
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 800, color: '#2C2C2A', letterSpacing: '-0.03em', margin: '0 0 8px', lineHeight: 1.15 }}>
            Choisissez votre <span style={{ color: '#7F77DD' }}>formule</span>
          </h1>
          <p style={{ fontSize: '14px', color: '#71716E', margin: 0, lineHeight: 1.5 }}>
            Sans engagement. Annulable à tout moment.
          </p>
        </div>
      </section>

      <main className="upgrade-main">

        {/* Banners */}
        {isExpired && (
          <div style={{ maxWidth: '960px', margin: '0 auto 28px', padding: '14px 20px', backgroundColor: '#FEF3C7', border: '1.5px solid rgba(217,119,6,.3)', borderRadius: '12px' }}>
            <p style={{ fontSize: '14px', color: '#92400E', margin: 0, lineHeight: 1.6, fontWeight: 600 }}>
              Votre période d&apos;essai est terminée — souscrivez pour continuer à utiliser Kordia.
            </p>
          </div>
        )}
        {isTrial && (
          <div style={{ maxWidth: '960px', margin: '0 auto 28px', padding: '14px 20px', backgroundColor: 'rgba(127,119,221,.08)', border: '1.5px solid rgba(127,119,221,.25)', borderRadius: '12px' }}>
            <p style={{ fontSize: '14px', color: '#5B52B5', margin: 0, lineHeight: 1.6, fontWeight: 600 }}>
              Essai gratuit en cours — {trialInfo?.daysLeft ?? 0} jour{(trialInfo?.daysLeft ?? 0) > 1 ? 's' : ''} restant{(trialInfo?.daysLeft ?? 0) > 1 ? 's' : ''}. Aucun prélèvement avant la fin.
            </p>
          </div>
        )}
        {showCanceled && !isActive && (
          <div style={{ maxWidth: '960px', margin: '0 auto 24px', padding: '12px 20px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '10px' }}>
            <p style={{ fontSize: '13px', color: '#b91c1c', margin: 0, lineHeight: 1.5 }}>Paiement annulé. Vous pouvez réessayer quand vous voulez.</p>
          </div>
        )}
        {isActive && (
          <div style={{ maxWidth: '960px', margin: '0 auto 28px', padding: '14px 20px', backgroundColor: 'rgba(104,157,113,.1)', border: '1.5px solid rgba(104,157,113,.3)', borderRadius: '12px' }}>
            <p style={{ fontSize: '14px', color: '#3F6B4A', margin: 0, lineHeight: 1.6, fontWeight: 600 }}>
              ✓ Votre abonnement est actif. Gérez-le depuis{' '}
              <a href="/dashboard/compte" style={{ color: '#3F6B4A', fontWeight: 700 }}>Mon compte</a>.
            </p>
          </div>
        )}

        {/* Pricing grid */}
        <div className="upgrade-grid">

          {/* Plan Essentiel */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: recommended === 'essential' ? '2px solid #7F77DD' : '1.5px solid #ECEAE4', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '4px', backgroundColor: '#7F77DD', flexShrink: 0 }}/>
            {recommended === 'essential' && (
              <div style={{ position: 'absolute', top: '16px', right: '16px', background: '#7F77DD', color: '#fff', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', padding: '3px 10px', borderRadius: '20px' }}>
                Recommandé
              </div>
            )}
            <div style={{ padding: '24px 26px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div className="upgrade-card-top">
                <p style={{ fontSize: '15px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: '#7F77DD', margin: '0 0 8px' }}>Essentiel</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', color: '#71716E', fontWeight: 600, paddingBottom: '8px' }}>dès</span>
                  <span style={{ fontSize: '30px', fontWeight: 800, color: '#2C2C2A', letterSpacing: '-0.04em', lineHeight: 1 }}>10 €</span>
                  <span style={{ fontSize: '13px', color: '#A3A3A0', paddingBottom: '6px' }}>HT / mois</span>
                </div>
                <p style={{ fontSize: '13px', color: '#71716E', margin: 0, lineHeight: 1.5 }}>
                  Selon votre nombre d&apos;hébergements&nbsp;:
                </p>
                <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1, padding: '10px', textAlign: 'center', background: billedQuantity <= 1 ? 'rgba(127,119,221,.1)' : '#F7F6F2', border: `1.5px solid ${billedQuantity <= 1 ? 'rgba(127,119,221,.4)' : '#ECEAE4'}`, borderRadius: '10px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#2C2C2A' }}>10 €</div>
                    <div style={{ fontSize: '11px', color: '#71716E', marginTop: '2px' }}>1 hébergement</div>
                  </div>
                  <div style={{ flex: 1, padding: '10px', textAlign: 'center', background: billedQuantity > 1 ? 'rgba(127,119,221,.1)' : '#F7F6F2', border: `1.5px solid ${billedQuantity > 1 ? 'rgba(127,119,221,.4)' : '#ECEAE4'}`, borderRadius: '10px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#2C2C2A' }}>20 €</div>
                    <div style={{ fontSize: '11px', color: '#71716E', marginTop: '2px' }}>2 à 5 hébergements</div>
                  </div>
                </div>
                {giteCount > 0 && (
                  <p style={{ fontSize: '12.5px', color: '#5B52B5', margin: '10px 0 0', lineHeight: 1.5, fontWeight: 600, textAlign: 'center' }}>
                    Votre cas&nbsp;: {billedQuantity} hébergement{billedQuantity > 1 ? 's' : ''} = <strong>{monthlyPrice}/mois</strong>
                  </p>
                )}
              </div>
              <hr className="upgrade-card-divider" />
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {essentialFeatures.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#2C2C2A' }}>
                    <span style={{ width: '18px', height: '18px', borderRadius: '5px', backgroundColor: 'rgba(104,157,113,.15)', color: '#689D71', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <p style={{ fontSize: '11px', color: '#A3A3A0', textAlign: 'center', margin: '0 0 10px', lineHeight: 1.5 }}>
                Paiement sécurisé par Stripe.
              </p>
              <SubscribeButton disabled={isActive} plan="essential" />
            </div>
          </div>

          {/* Plan Maison d'Hôtes */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: recommended === 'hote' ? '2px solid #689D71' : '1.5px solid rgba(104,157,113,.3)', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '4px', backgroundColor: '#689D71', flexShrink: 0 }}/>
            {recommended === 'hote' && (
              <div style={{ position: 'absolute', top: '16px', right: '16px', background: '#689D71', color: '#fff', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', padding: '3px 10px', borderRadius: '20px' }}>
                Recommandé
              </div>
            )}
            <div style={{ padding: '24px 26px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div className="upgrade-card-top">
                <p style={{ fontSize: '15px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: '#689D71', margin: '0 0 8px' }}>Maison d&apos;Hôtes</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '30px', fontWeight: 800, color: '#2C2C2A', letterSpacing: '-0.04em', lineHeight: 1 }}>20 €</span>
                  <span style={{ fontSize: '13px', color: '#A3A3A0', paddingBottom: '6px' }}>HT / mois</span>
                </div>
                <p style={{ fontSize: '13px', color: '#71716E', margin: 0, lineHeight: 1.5 }}>
                  Jusqu&apos;à 5 chambres sur un même site.
                </p>
              </div>
              <hr className="upgrade-card-divider" />
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {['Tout le plan Essentiel', 'Réservation par chambre', 'Gestion de la demi-pension'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#2C2C2A' }}>
                    <span style={{ width: '18px', height: '18px', borderRadius: '5px', backgroundColor: 'rgba(104,157,113,.15)', color: '#689D71', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <p style={{ fontSize: '11px', color: '#A3A3A0', textAlign: 'center', margin: '0 0 10px', lineHeight: 1.5 }}>
                Paiement sécurisé par Stripe.
              </p>
              <SubscribeButton disabled={isActive} plan="hote" />
            </div>
          </div>

          {/* Plan Kordia Étape — Bientôt */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1.5px solid rgba(104,157,113,.3)', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', opacity: 0.85 }}>
            <div style={{ height: '4px', backgroundColor: '#689D71', flexShrink: 0 }}/>
            <div style={{ position: 'absolute', top: '16px', right: '16px', background: '#689D71', color: '#fff', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', padding: '3px 10px', borderRadius: '20px' }}>
              Bientôt
            </div>
            <div style={{ padding: '24px 26px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div className="upgrade-card-top">
                <p style={{ fontSize: '15px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: '#689D71', margin: '0 0 8px' }}>Kordia Étape</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '30px', fontWeight: 800, color: '#2C2C2A', letterSpacing: '-0.04em', lineHeight: 1 }}>25 €</span>
                  <span style={{ fontSize: '13px', color: '#A3A3A0', paddingBottom: '6px' }}>HT / mois</span>
                </div>
                <p style={{ fontSize: '13px', color: '#71716E', margin: 0, lineHeight: 1.5 }}>
                  Gîtes d&apos;étape, auberges &amp; dortoirs.
                </p>
              </div>
              <hr className="upgrade-card-divider" />
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {["Tout le plan Maison d'Hôtes", 'Réservation par lit / dortoir', 'Planification multi-espaces'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#71716E' }}>
                    <span style={{ width: '18px', height: '18px', borderRadius: '5px', backgroundColor: 'rgba(104,157,113,.1)', color: '#689D71', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div style={{ padding: '11px 16px', background: '#EEF5EF', border: '1px solid rgba(104,157,113,.25)', borderRadius: '10px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#4A7353' }}>
                Bientôt disponible
              </div>
            </div>
          </div>

        </div>

        {/* Back link */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <a
            href="/dashboard"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              fontSize: '14px', fontWeight: 600, color: '#5B52B5',
              textDecoration: 'none',
              padding: '10px 20px',
              border: '1.5px solid rgba(127,119,221,.35)',
              borderRadius: '10px',
              backgroundColor: 'rgba(127,119,221,.07)',
              transition: 'background .15s',
            }}
          >
            <IcoChevronLeft size={14} strokeWidth={1.5} />
            Retour au tableau de bord
          </a>
        </div>
      </main>
    </div>
  );
}
