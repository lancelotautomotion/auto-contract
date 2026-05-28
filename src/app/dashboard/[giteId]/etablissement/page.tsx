import { auth } from "@clerk/nextjs/server";
import TopbarSignOut from "@/app/dashboard/TopbarSignOut";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EtablissementForm from "@/app/dashboard/etablissement/EtablissementForm";
import DeleteGiteButton from "./DeleteGiteButton";

export default async function EtablissementPage({ params }: { params: Promise<{ giteId: string }> }) {
  const { giteId } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/onboarding");

  const gite = await prisma.gite.findFirst({
    where: { id: giteId, userId: dbUser.id, deletedAt: null },
    include: {
      options: { orderBy: { position: 'asc' } },
      documents: { orderBy: { createdAt: 'asc' }, select: { id: true, label: true, fileName: true, mimeType: true, createdAt: true } },
    },
  });
  if (!gite) redirect("/dashboard");

  const [activeGiteCount, upcomingReservations] = await Promise.all([
    prisma.gite.count({ where: { userId: dbUser.id, deletedAt: null } }),
    prisma.reservation.count({ where: { giteId, checkOut: { gte: new Date() } } }),
  ]);

  return (
    <>
      <div className="topbar">
        <div className="topbar-left"><div className="topbar-breadcrumb">Kordia / <span>Mon hébergement</span></div></div>
        <div className="topbar-right"><TopbarSignOut /></div>
      </div>

      <div className="content">
        <div className="page-title">
          <h1>{gite.name} <span className="v">.</span></h1>
          <div className="sub">Gérez les informations de votre hébergement</div>
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
          contractTemplateGeneral: gite.contractTemplateGeneral ?? '',
          contractTemplateHouseRules: gite.contractTemplateHouseRules ?? '',
          logoUrl: gite.logoUrl ?? '',
          options: gite.options.map(o => ({ id: o.id, label: o.label, price: o.price })),
          documents: gite.documents.map(d => ({ id: d.id, label: d.label, fileName: d.fileName, mimeType: d.mimeType, createdAt: d.createdAt.toISOString() })),
        }} />

        <DeleteGiteButton
          giteId={gite.id}
          giteName={gite.name}
          isLastGite={activeGiteCount <= 1}
          upcomingReservations={upcomingReservations}
        />
      </div>
    </>
  );
}
