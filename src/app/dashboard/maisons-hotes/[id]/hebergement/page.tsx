import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TopbarSignOut from "@/app/dashboard/TopbarSignOut";
import EtablissementForm from "@/app/dashboard/etablissement/EtablissementForm";

export const dynamic = "force-dynamic";

export default async function GuesthouseHebergementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/onboarding");

  const guesthouse = await prisma.guesthouse.findFirst({
    where: { id, userId: dbUser.id, deletedAt: null },
    include: {
      rooms: { orderBy: [{ position: "asc" }, { createdAt: "asc" }] },
      documents: { orderBy: { createdAt: "asc" }, select: { id: true, label: true, fileName: true, mimeType: true, createdAt: true } },
    },
  });
  if (!guesthouse) notFound();

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-breadcrumb">Kordia / <span>Mon hébergement</span></div>
        </div>
        <div className="topbar-right"><TopbarSignOut /></div>
      </div>

      <div className="content">
        <div className="page-title">
          <h1>{guesthouse.name} <span className="v">.</span></h1>
          <div className="sub">Gérez les informations de votre maison d&apos;hôtes</div>
        </div>

        <EtablissementForm guesthouse={{
          id: guesthouse.id,
          slug: guesthouse.slug ?? null,
          name: guesthouse.name,
          email: guesthouse.email ?? '',
          phone: guesthouse.phone ?? '',
          address: guesthouse.address ?? '',
          city: guesthouse.city ?? '',
          zipCode: guesthouse.zipCode ?? '',
          capacity: guesthouse.capacity,
          touristTax: guesthouse.touristTax,
          contractTemplateGeneral: guesthouse.contractTemplateGeneral ?? '',
          contractTemplateHouseRules: guesthouse.contractTemplateHouseRules ?? '',
          logoUrl: guesthouse.logoUrl ?? '',
          rooms: guesthouse.rooms.map(r => ({ id: r.id, name: r.name, slug: r.slug ?? null, capacity: r.capacity, basePrice: r.basePrice, specificClauses: r.specificClauses ?? null, active: r.active })),
          documents: guesthouse.documents.map(d => ({ id: d.id, label: d.label, fileName: d.fileName, mimeType: d.mimeType, createdAt: d.createdAt.toISOString() })),
        }} />
      </div>
    </>
  );
}
