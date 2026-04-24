import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } }).catch(() => null);
  if (dbUser) {
    const gite = await prisma.gite.findFirst({ where: { userId: dbUser.id } }).catch(() => null);
    if (gite?.name && gite.name !== "Mon Gîte") redirect("/dashboard");
  }

  return (
    <>
      <header className="ob-header">
        <span className="ob-header-brand">Prysme</span>
        <span className="ob-header-label">Configuration initiale</span>
      </header>

      <main className="ob-main">
        <div className="ob-greeting">
          <h1>
            Bienvenue{user?.firstName ? `, ${user.firstName}` : ''}<span className="v">.</span>
          </h1>
          <p>Configurez votre hébergement en 2 minutes. Vous pourrez modifier ces informations à tout moment dans vos paramètres.</p>
        </div>

        <div className="ob-trial">
          <span className="ob-trial-emoji">🎉</span>
          <p>Votre période d&apos;essai de <strong>30 jours</strong> commence maintenant — accès complet, sans engagement.</p>
        </div>

        <div className="ob-card">
          <div className="ob-card-bar"/>
          <div className="ob-card-inner">
            <OnboardingForm defaultEmail={user?.emailAddresses[0]?.emailAddress ?? ""} />
          </div>
        </div>
      </main>
    </>
  );
}
