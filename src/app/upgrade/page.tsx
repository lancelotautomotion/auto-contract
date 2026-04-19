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

const features = [
  "Contrats de location illimités",
  "Signature électronique eIDAS",
  "Envoi automatisé des emails",
  "Rappels d'acompte",
  "Archivage des contrats signés (PDF)",
  "Documents joints (RIB, règlement intérieur…)",
  "Tableau de bord et statistiques",
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
  const { canceled } = await searchParams;
  const showCanceled = canceled === "1";

  return (
    <div className={`${font.className}`} style={{ minHeight: '100vh', backgroundColor: '#F3F2EE', display: 'flex', flexDirection: 'column' }}>
      {/* Minimal header */}
      <header style={{ padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E8E6E1', backgroundColor: '#FFFFFF' }}>
        <span style={{ fontSize: '15px', fontWeight: 800, color: '#2C2C2A', letterSpacing: '-0.02em' }}>Prysme</span>
        <UserButton />
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        {/* Expired notice */}
        {isExpired && (
          <div style={{ marginBottom: '32px', padding: '16px 24px', backgroundColor: '#FEF3C7', border: '1.5px solid rgba(217,119,6,.3)', borderRadius: '12px', maxWidth: '520px', width: '100%' }}>
            <p style={{ fontSize: '14px', color: '#92400E', margin: 0, lineHeight: 1.6, fontWeight: 600 }}>
              Votre période d'essai est terminée.
            </p>
            <p style={{ fontSize: '13px', color: '#92400E', margin: '4px 0 0', lineHeight: 1.6, opacity: 0.8 }}>
              Pour continuer à utiliser Prysme et accéder à vos données, souscrivez à un abonnement.
            </p>
          </div>
        )}

        {showCanceled && !isActive && (
          <div style={{ marginBottom: '24px', padding: '12px 20px', backgroundColor: '#FBECEC', border: '1px solid #F3D1D1', borderRadius: '10px', maxWidth: '520px', width: '100%' }}>
            <p style={{ fontSize: '13px', color: '#B23A3A', margin: 0, lineHeight: 1.5 }}>
              Paiement annulé. Vous pouvez réessayer quand vous voulez.
            </p>
          </div>
        )}

        {isActive && (
          <div style={{ marginBottom: '32px', padding: '16px 24px', backgroundColor: 'rgba(104,157,113,.12)', border: '1.5px solid rgba(104,157,113,.35)', borderRadius: '12px', maxWidth: '520px', width: '100%' }}>
            <p style={{ fontSize: '14px', color: '#3F6B4A', margin: 0, lineHeight: 1.6, fontWeight: 600 }}>
              ✓ Votre abonnement est actif.
            </p>
            <p style={{ fontSize: '13px', color: '#3F6B4A', margin: '4px 0 0', lineHeight: 1.6, opacity: 0.85 }}>
              Gérez votre abonnement depuis vos <a href="/dashboard/settings" style={{ color: '#3F6B4A', fontWeight: 600 }}>paramètres</a>.
            </p>
          </div>
        )}

        {/* Pricing card */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E8E6E1', overflow: 'hidden', maxWidth: '480px', width: '100%' }}>
          {/* Violet accent */}
          <div style={{ height: '4px', backgroundColor: '#7F77DD' }} />

          <div style={{ padding: '36px 40px 40px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#A3A3A0', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
              Plan Essentiel
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', marginBottom: '6px' }}>
              <span style={{ fontSize: '44px', fontWeight: 800, color: '#2C2C2A', letterSpacing: '-0.04em', lineHeight: 1 }}>29 €</span>
              <span style={{ fontSize: '13px', color: '#A3A3A0', paddingBottom: '8px' }}>/mois</span>
            </div>
            <p style={{ fontSize: '13px', color: '#71716E', margin: '0 0 28px', lineHeight: 1.5 }}>
              Tout inclus. Sans engagement. Annulable à tout moment.
            </p>

            {/* Features */}
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {features.map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#2C2C2A', lineHeight: 1.5 }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '6px', backgroundColor: 'rgba(104,157,113,0.15)', color: '#689D71', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <SubscribeButton disabled={isActive} />

            <p style={{ fontSize: '11px', color: '#A3A3A0', textAlign: 'center', margin: '14px 0 0', lineHeight: 1.5 }}>
              Paiement sécurisé par Stripe. TVA incluse. Vous recevrez une facture par email.
            </p>
          </div>
        </div>

        {/* Back link (only if trial not expired) */}
        {!isExpired && (
          <a href="/dashboard" style={{ marginTop: '20px', fontSize: '13px', color: '#A3A3A0', textDecoration: 'none' }}>
            ← Retour au tableau de bord
          </a>
        )}
      </main>
    </div>
  );
}
