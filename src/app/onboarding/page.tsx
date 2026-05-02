import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OnboardingContainer from "./OnboardingContainer";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } }).catch(() => null);
  if (dbUser) {
    const gite = await prisma.gite.findFirst({ where: { userId: dbUser.id } }).catch(() => null);
    if (gite) redirect("/dashboard");
  }

  return (
    <>
      <header className="ob-header">
        <img src="/logotype_KORDIA.svg" alt="Kordia" className="ob-header-logo" />
      </header>

      <main className="ob-main">
        <OnboardingContainer
          firstName={user?.firstName ?? ""}
          defaultEmail={user?.emailAddresses[0]?.emailAddress ?? ""}
        />
      </main>
    </>
  );
}
