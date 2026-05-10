import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { Plus_Jakarta_Sans } from 'next/font/google';
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import '@/styles/dashboard.css';

export const metadata: Metadata = { title: "Kordia" };
export const dynamic = 'force-dynamic';

const font = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/sign-in');

  try {
    const dbUser = await prisma.user.findUnique({ where: { clerkId } });
    if (!dbUser) redirect('/onboarding');

    const gite = await prisma.gite.findFirst({ where: { userId: dbUser.id } });
    if (!gite || !gite.name?.trim() || gite.name === 'Mon Gîte') redirect('/onboarding');
  } catch (err) {
    if ((err as { digest?: string })?.digest?.startsWith('NEXT_')) throw err;
  }

  return (
    <div className={font.className}>
      {children}
    </div>
  );
}
