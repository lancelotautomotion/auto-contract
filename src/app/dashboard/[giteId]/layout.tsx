import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTrialInfo } from "@/lib/trial";
import DashboardShell from "@/app/dashboard/DashboardShell";
import TrialBanner from "@/app/dashboard/TrialBanner";

export const dynamic = 'force-dynamic';

export default async function GiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ giteId: string }>;
}) {
  const { giteId } = await params;
  const { userId: clerkId, sessionClaims } = await auth();
  if (!clerkId) redirect('/sign-in');

  const isAdmin = (sessionClaims?.metadata as Record<string, unknown> | undefined)?.role === "admin";

  let pendingCount = 0;
  let trialInfo = null;
  let gites: Array<{ id: string; name: string }> = [];

  try {
    const dbUser = await prisma.user.findUnique({ where: { clerkId } });
    if (!dbUser) redirect('/onboarding');

    // Security: verify the requested giteId belongs to this user
    const activeGite = await prisma.gite.findFirst({
      where: { id: giteId, userId: dbUser.id },
    });
    if (!activeGite) redirect('/dashboard');

    gites = await prisma.gite.findMany({
      where: { userId: dbUser.id },
      select: { id: true, name: true },
      orderBy: { createdAt: 'asc' },
    });

    pendingCount = await prisma.reservation.count({
      where: { giteId, status: 'PENDING_REVIEW' },
    }).catch(() => 0);

    try {
      trialInfo = getTrialInfo(dbUser);
    } catch (trialErr) {
      if ((trialErr as { digest?: string })?.digest?.startsWith('NEXT_')) throw trialErr;
    }
  } catch (err) {
    if ((err as { digest?: string })?.digest?.startsWith('NEXT_')) throw err;
  }

  return (
    <DashboardShell
      pendingCount={pendingCount}
      trialInfo={trialInfo}
      gites={gites}
      activeGiteId={giteId}
      isAdmin={isAdmin}
    >
      {trialInfo?.isTrial && !trialInfo.isExpired && trialInfo.daysLeft <= 15 && (
        <TrialBanner daysLeft={trialInfo.daysLeft} />
      )}
      {children}
    </DashboardShell>
  );
}
