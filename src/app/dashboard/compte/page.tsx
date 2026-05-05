import { auth, currentUser } from "@clerk/nextjs/server";
import TopbarSignOut from "@/app/dashboard/TopbarSignOut";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTrialInfo } from "@/lib/trial";
import CompteClient from "./CompteClient";

export default async function ComptePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/onboarding");

  const userEmail = user?.emailAddresses[0]?.emailAddress ?? dbUser.email ?? '';
  const firstName = user?.firstName ?? '';
  const lastName = user?.lastName ?? '';
  const fullName = `${firstName} ${lastName}`.trim() || dbUser.name || 'Utilisateur';
  const initials = (firstName[0] ?? '').toUpperCase() + (lastName[0] ?? '').toUpperCase() || '?';

  let trialInfo = null;
  try { trialInfo = getTrialInfo(dbUser); } catch (e) { console.error('[compte] getTrialInfo error:', e); }

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-breadcrumb">Kordia / <span>Mon compte</span></div>
        </div>
        <div className="topbar-right">
          <TopbarSignOut />
        </div>
      </div>

      <div className="content" style={{ maxWidth: '900px', width: '100%' }}>
        <div className="page-title">
          <h1>Mon <span className="v">compte</span></h1>
          <div className="sub">Profil, abonnement et facturation</div>
        </div>

        <CompteClient
          fullName={fullName}
          email={userEmail}
          initials={initials}
          planStatus={trialInfo?.planStatus ?? 'TRIAL'}
          daysLeft={trialInfo?.daysLeft ?? null}
          trialEndsAt={trialInfo?.trialEndsAt?.toISOString() ?? null}
          hasStripeCustomer={Boolean(dbUser.stripeCustomerId)}
        />
      </div>
    </>
  );
}
