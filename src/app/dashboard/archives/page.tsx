import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ArchivesRedirectPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/onboarding");

  const gite = await prisma.gite.findFirst({
    where: { userId: dbUser.id, deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!gite) redirect("/onboarding");

  redirect(`/dashboard/${gite.id}/archives`);
}
