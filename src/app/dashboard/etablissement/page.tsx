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
    include: {
      options: { orderBy: { position: 'asc' } },
      documents: { orderBy: { createdAt: 'asc' }, select: { id: true, label: true, fileName: true, mimeType: true, createdAt: true } },
    },
  });
  if (!gite) redirect("/onboarding");

  return (
    <main style={{ padding: '0 40px 48px' }}>
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
        logoUrl: gite.logoUrl ?? '',
        options: gite.options.map(o => ({ id: o.id, label: o.label, price: o.price })),
        documents: gite.documents.map(d => ({ id: d.id, label: d.label, fileName: d.fileName, mimeType: d.mimeType, createdAt: d.createdAt.toISOString() })),
      }} />
    </main>
  );
}
