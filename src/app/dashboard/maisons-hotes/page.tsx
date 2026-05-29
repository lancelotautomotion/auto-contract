import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Un compte Maison d'hôtes possède un seul établissement : cette entrée
// redirige simplement vers son tableau de bord. Plus de liste / création multiple.
export default async function MaisonsHotesIndexPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/onboarding");

  const guesthouse = await prisma.guesthouse.findFirst({
    where: { userId: dbUser.id, deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!guesthouse) redirect("/onboarding");

  redirect(`/dashboard/maisons-hotes/${guesthouse.id}`);
}
