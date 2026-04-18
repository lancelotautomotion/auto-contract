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
    <>
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-breadcrumb">Prysme / <span>Mon hébergement</span></div>
        </div>
        <div className="topbar-right">
          <button className="topbar-btn">
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </button>
          <button className="topbar-btn">
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
              <path d="M4 6a4 4 0 018 0v3l1.5 2H2.5L4 9V6z" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M6.5 13a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.3"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="content" style={{ width: '100%' }}>
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
          contractTemplate: gite.contractTemplate ?? '',
          logoUrl: gite.logoUrl ?? '',
          options: gite.options.map(o => ({ id: o.id, label: o.label, price: o.price })),
          documents: gite.documents.map(d => ({ id: d.id, label: d.label, fileName: d.fileName, mimeType: d.mimeType, createdAt: d.createdAt.toISOString() })),
        }} />
      </div>
    </>
  );
}
