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
  let activeGuesthouseId = "";
  let pendingCount = 0;

  try {
    const dbUser = await prisma.user.findUnique({ where: { clerkId } });
    if (!dbUser) redirect("/onboarding");
    if (!isAdmin && dbUser.offerType !== "guesthouse") redirect("/dashboard");
    planActive = dbUser.planStatus === "ACTIVE";
    try {
      trialInfo = getTrialInfo(dbUser);
    } catch (trialErr) {
      if ((trialErr as { digest?: string })?.digest?.startsWith("NEXT_")) throw trialErr;
    }
    const guesthouse = await prisma.guesthouse.findFirst({
      where: { userId: dbUser.id, deletedAt: null },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    if (guesthouse) {
      activeGuesthouseId = guesthouse.id;
      pendingCount = await prisma.reservation.count({
        where: { guesthouseId: guesthouse.id, status: "PENDING_REVIEW" },
      });
    }
  } catch (err) {
    if ((err as { digest?: string })?.digest?.startsWith("NEXT_")) throw err;
  }

  return (
    <DashboardShell
      pendingCount={pendingCount}
      trialInfo={trialInfo}
      gites={[]}
      isAdmin={isAdmin}
      planActive={planActive}
      guesthouseMode={true}
      activeGuesthouseId={activeGuesthouseId}
    >
      {trialInfo?.isTrial && !trialInfo.isExpired && trialInfo.daysLeft <= 15 && (
        <TrialBanner daysLeft={trialInfo.daysLeft} />
      )}
      {children}
    </DashboardShell>
  );
}
