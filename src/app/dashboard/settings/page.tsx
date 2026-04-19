import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTrialInfo } from "@/lib/trial";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/onboarding");

  const gite = await prisma.gite.findFirst({ where: { userId: dbUser.id } });
  if (!gite) redirect("/onboarding");

  const userEmail = user?.emailAddresses[0]?.emailAddress ?? '';

  let trialInfo = null;
  try { trialInfo = getTrialInfo(dbUser); } catch {}
  const hasCustomer = Boolean(dbUser.stripeCustomerId);

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-breadcrumb">Prysme / <span>Paramètres</span></div>
        </div>
        <div className="topbar-right">
          <button className="topbar-btn">
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </button>
          <button className="topbar-btn">
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
              <path d="M4 6a4 4 0 018 0v3l1.5 2H2.5L4 9V6z" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M6.5 13a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.3"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="content" style={{ maxWidth: '700px', width: '100%' }}>
        <div className="page-title">
          <h1>Paramètres<span className="v">.</span></h1>
          <div className="sub">Gérez vos préférences et votre compte</div>
        </div>

        <SettingsForm
          notificationEmail={gite.notificationEmail ?? ''}
          userEmail={userEmail}
          planStatus={trialInfo?.planStatus ?? 'TRIAL'}
          daysLeft={trialInfo?.daysLeft ?? null}
          hasStripeCustomer={hasCustomer}
        />
      </div>
    </>
  );
}
