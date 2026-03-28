import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();

  // Si déjà configuré, aller au dashboard
  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (dbUser) {
    const gite = await prisma.gite.findFirst({ where: { userId: dbUser.id } });
    if (gite?.name && gite.name !== "Mon Gîte") redirect("/dashboard");
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#EDE8E1', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ padding: '20px 40px', borderBottom: '1px solid #CEC8BF' }}>
        <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7A7570' }}>ContratGîte</span>
      </header>

      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '60px 40px' }}>
        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7A7570', marginBottom: '10px' }}>— Bienvenue</p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '44px', fontWeight: 300, color: '#1C1C1A', margin: '0 0 12px' }}>
            Configurons votre gîte.
          </h1>
          <p style={{ fontSize: '14px', color: '#7A7570', lineHeight: 1.7, margin: 0 }}>
            Ces informations seront utilisées pour générer vos contrats et envoyer vos emails. Vous pourrez les modifier à tout moment.
          </p>
        </div>

        <OnboardingForm defaultEmail={user?.emailAddresses[0]?.emailAddress ?? ""} />
      </main>
    </div>
  );
}
