import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EtablissementForm from "./EtablissementForm";

export default async function EtablissementPage() {
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
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 40px' }}>
      <div style={{ marginBottom: '40px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>— Mon établissement</p>
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '44px', fontWeight: 300, color: 'var(--text)', margin: 0 }}>
          {gite.name}
        </h1>
      </div>

      <EtablissementForm gite={{
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
        slug: gite.slug ?? '',
        contractTemplate: gite.contractTemplate ?? '',
        logoDataUrl: gite.logoDataUrl ?? '',
        options: gite.options.map(o => ({ id: o.id, label: o.label, price: o.price })),
      }} />
    </main>
  );
}
