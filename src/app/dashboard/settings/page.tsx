import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/onboarding");

  const gite = await prisma.gite.findFirst({ where: { userId: dbUser.id } });
  if (!gite) redirect("/onboarding");

  return (
    <>
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
        </div>
      </div>

      <div className="content" style={{ maxWidth: '900px', width: '100%' }}>
        <div className="page-title">
          <h1>Paramètres<span className="v">.</span></h1>
          <div className="sub">Préférences de notification et apparence</div>
        </div>

        <SettingsForm
          notificationEmail={gite.notificationEmail ?? ''}
          notifNewReservation={gite.notifNewReservation}
          notifContractSigned={gite.notifContractSigned}
          notifPrysmNews={gite.notifPrysmNews}
        />
      </div>
    </>
  );
}
