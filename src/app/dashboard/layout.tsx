import { auth } from "@clerk/nextjs/server";
import { Plus_Jakarta_Sans } from 'next/font/google';
import { redirect } from "next/navigation";
import Sidebar from "./Sidebar";
import TrialBanner from "./TrialBanner";
import { prisma } from "@/lib/prisma";
import { getTrialInfo } from "@/lib/trial";
import '@/styles/dashboard.css';

const font = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId: clerkId } = await auth();

  let pendingCount = 0;
  let trialInfo = null;

  if (clerkId) {
    try {
      const dbUser = await prisma.user.findUnique({ where: { clerkId } }).catch(() => null);
      if (dbUser) {
        pendingCount = await prisma.reservation.count({
          where: { gite: { userId: dbUser.id }, status: 'PENDING_REVIEW' },
        }).catch(() => 0);

        // planStatus may not exist if migration hasn't been applied yet
        try {
          trialInfo = getTrialInfo(dbUser);
          if (trialInfo.isExpired) redirect('/upgrade');
        } catch (trialErr) {
          if ((trialErr as { digest?: string })?.digest?.startsWith('NEXT_')) throw trialErr;
          // planStatus column missing — skip trial check
        }
      }
    } catch (err) {
      if ((err as { digest?: string })?.digest?.startsWith('NEXT_')) throw err;
    }
  }

  return (
    <div className={`${font.className} app`}>
      <Sidebar pendingCount={pendingCount} trialInfo={trialInfo} />
      <div className="main">
        {trialInfo?.isTrial && !trialInfo.isExpired && trialInfo.daysLeft <= 7 && (
          <TrialBanner daysLeft={trialInfo.daysLeft} />
        )}
        {children}
      </div>
    </div>
  );
}
