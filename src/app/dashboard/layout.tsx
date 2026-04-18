import { auth } from "@clerk/nextjs/server";
import { Plus_Jakarta_Sans } from 'next/font/google';
import Sidebar from "./Sidebar";
import { prisma } from "@/lib/prisma";
import '@/styles/dashboard.css';

const font = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let pendingCount = 0;
  try {
    const { userId } = await auth();
    if (userId) {
      const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
      if (dbUser) {
        pendingCount = await prisma.reservation.count({
          where: { gite: { userId: dbUser.id }, status: 'PENDING_REVIEW' },
        });
      }
    }
  } catch { /* ignore */ }

  return (
    <div className={`${font.className} app`}>
      <Sidebar pendingCount={pendingCount} />
      <div className="main">
        {children}
      </div>
    </div>
  );
}
