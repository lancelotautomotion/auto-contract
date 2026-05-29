import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardIndexPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/sign-in');

  const dbUser = await prisma.user.findUnique({ where: { clerkId } }).catch(() => null);
  if (!dbUser) redirect('/onboarding');

  // Compte Maison d'hôtes : pas de gîte, on dirige vers sa section dédiée.
  if (dbUser.offerType === 'guesthouse') redirect('/dashboard/maisons-hotes');

  const gite = await prisma.gite.findFirst({
    where: { userId: dbUser.id, deletedAt: null },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  }).catch(() => null);
  if (!gite) redirect('/onboarding');

  redirect(`/dashboard/${gite.id}`);
}
