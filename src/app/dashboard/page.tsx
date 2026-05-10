import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardIndexPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/sign-in');

  const dbUser = await prisma.user.findUnique({ where: { clerkId } }).catch(() => null);
  if (!dbUser) redirect('/onboarding');

  const gite = await prisma.gite.findFirst({
    where: { userId: dbUser.id },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  }).catch(() => null);
  if (!gite) redirect('/onboarding');

  redirect(`/dashboard/${gite.id}`);
}
