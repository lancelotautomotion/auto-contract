import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/onboarding");

  const gite = await prisma.gite.findFirst({
    where: { userId: dbUser.id },
    include: { options: { orderBy: { position: 'asc' } } },
  });
  if (!gite) redirect("/onboarding");

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#EDE8E1', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #CEC8BF' }}>
        <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7A7570' }}>ContratGîte</span>
        <a href="/dashboard" style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7A7570', textDecoration: 'none' }}>← Tableau de bord</a>
      </header>

      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 40px' }}>
        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7A7570', marginBottom: '10px' }}>— Paramètres</p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '44px', fontWeight: 300, color: '#1C1C1A', margin: 0 }}>
            {gite.name}
          </h1>
        </div>

        <SettingsForm gite={{
          id: gite.id,
          name: gite.name,
          email: gite.email ?? '',
          phone: gite.phone ?? '',
          address: gite.address ?? '',
          city: gite.city ?? '',
          zipCode: gite.zipCode ?? '',
          capacity: gite.capacity,
          cleaningFee: gite.cleaningFee,
          touristTax: gite.touristTax,
          n8nWebhookUrl: gite.n8nWebhookUrl ?? '',
          driveTemplateFolderId: gite.driveTemplateFolderId ?? '',
          driveOutputFolderId: gite.driveOutputFolderId ?? '',
          slug: gite.slug ?? '',
          options: gite.options.map(o => ({ id: o.id, label: o.label, price: o.price })),
        }} />
      </main>
    </div>
  );
}
