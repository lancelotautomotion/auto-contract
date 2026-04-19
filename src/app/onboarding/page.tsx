import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Plus_Jakarta_Sans } from "next/font/google";
import OnboardingForm from "./OnboardingForm";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } }).catch(() => null);
  if (dbUser) {
    const gite = await prisma.gite.findFirst({ where: { userId: dbUser.id } }).catch(() => null);
    if (gite?.name && gite.name !== "Mon Gîte") redirect("/dashboard");
  }

  const sansSerif = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

  return (
    <div className={font.className} style={{ minHeight: '100vh', backgroundColor: '#F3F2EE', fontFamily: sansSerif }}>
      {/* Header */}
      <header style={{ padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E8E6E1', backgroundColor: '#FFFFFF' }}>
        <span style={{ fontSize: '15px', fontWeight: 800, color: '#2C2C2A', letterSpacing: '-0.02em' }}>Prysme</span>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#A3A3A0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Configuration initiale</span>
      </header>

      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 20px 60px' }}>
        {/* Greeting */}
        <div style={{ padding: '0 4px 32px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#2C2C2A', letterSpacing: '-0.03em', margin: '0 0 8px', lineHeight: 1.2 }}>
            Bienvenue{user?.firstName ? `, ${user.firstName}` : ''}<span style={{ color: '#7F77DD' }}>.</span>
          </h1>
          <p style={{ fontSize: '15px', color: '#71716E', lineHeight: 1.6, margin: 0 }}>
            Configurez votre hébergement en 2 minutes. Vous pourrez modifier ces informations à tout moment dans vos paramètres.
          </p>
        </div>

        {/* Trial callout */}
        <div style={{ backgroundColor: '#EFEEF9', border: '1px solid rgba(127,119,221,.2)', borderRadius: '12px', padding: '14px 18px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '18px' }}>🎉</span>
          <p style={{ fontSize: '13px', color: '#5B52B5', margin: 0, lineHeight: 1.5 }}>
            Votre période d'essai de <strong>14 jours</strong> commence maintenant — accès complet, sans engagement.
          </p>
        </div>

        {/* Form card */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E8E6E1', overflow: 'hidden' }}>
          <div style={{ height: '4px', backgroundColor: '#7F77DD' }} />
          <div style={{ padding: '32px 36px 36px' }}>
            <OnboardingForm defaultEmail={user?.emailAddresses[0]?.emailAddress ?? ""} />
          </div>
        </div>
      </main>
    </div>
  );
}
