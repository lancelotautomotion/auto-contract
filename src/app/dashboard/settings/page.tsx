import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/onboarding");

  const gite = await prisma.gite.findFirst({ where: { userId: dbUser.id } });
  if (!gite) redirect("/onboarding");

  return (
    <main style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 40px' }}>
      <div style={{ marginBottom: '40px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>— Paramètres</p>
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '44px', fontWeight: 300, color: 'var(--text)', margin: 0 }}>
          Paramètres
        </h1>
      </div>

      <SettingsForm
        notificationEmail={gite.notificationEmail ?? ''}
        userEmail={user?.emailAddresses[0]?.emailAddress ?? ''}
      />
    </main>
  );
}
