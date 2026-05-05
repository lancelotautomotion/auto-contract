import { auth } from "@clerk/nextjs/server";
import TopbarSignOut from "@/app/dashboard/TopbarSignOut";
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
          <div className="topbar-breadcrumb">Kordia / <span>Paramètres</span></div>
        </div>
        <div className="topbar-right">
          <TopbarSignOut />
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
