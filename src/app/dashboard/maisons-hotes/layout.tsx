import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTrialInfo } from "@/lib/trial";
import DashboardShell from "@/app/dashboard/DashboardShell";
import TrialBanner from "@/app/dashboard/TrialBanner";

export const dynamic = "force-dynamic";

export default async function MaisonsHotesLayout({ children }: { children: React.ReactNode }) {
  const { userId: clerkId, sessionClaims } = await auth();
  if (!clerkId) redirect("/sign-in");

  const isAdmin = (sessionClaims?.metadata as Record<string, unknown> | undefined)?.role === "admin";

  let trialInfo = null;
  let planActive = false;

  try {
    const dbUser = await prisma.user.findUnique({ where: { clerkId } });
    if (!dbUser) redirect("/onboarding");
    // Offre réservée : un compte Essentiel (offerType "gite") n'y a pas accès.
    if (!isAdmin && dbUser.offerType !== "guesthouse") redirect("/dashboard");
    planActive = dbUser.planStatus === "ACTIVE";
    try {
      trialInfo = getTrialInfo(dbUser);
    } catch (trialErr) {
      if ((trialErr as { digest?: string })?.digest?.startsWith("NEXT_")) throw trialErr;
    }
  } catch (err) {
    if ((err as { digest?: string })?.digest?.startsWith("NEXT_")) throw err;
  }

  return (
    <DashboardShell pendingCount={0} trialInfo={trialInfo} gites={[]} isAdmin={isAdmin} planActive={planActive} showGuesthouse={true}>
      {trialInfo?.isTrial && !trialInfo.isExpired && trialInfo.daysLeft <= 15 && (
        <TrialBanner daysLeft={trialInfo.daysLeft} />
      )}
      {children}
    </DashboardShell>
  );
}
