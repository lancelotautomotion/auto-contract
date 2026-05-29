import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TopbarSignOut from "@/app/dashboard/TopbarSignOut";
import GuesthouseSettingsTabs from "./GuesthouseSettingsTabs";

export const dynamic = "force-dynamic";

export default async function GuesthouseHebergementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/onboarding");

  const guesthouse = await prisma.guesthouse.findFirst({
    where: { id, userId: dbUser.id, deletedAt: null },
    include: { rooms: { orderBy: [{ position: "asc" }, { createdAt: "asc" }] } },
  });
  if (!guesthouse) notFound();

  const rooms = guesthouse.rooms.map((r) => ({
    id: r.id, name: r.name, capacity: r.capacity, basePrice: r.basePrice, active: r.active,
  }));

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-breadcrumb">Kordia / {guesthouse.name} / <span>Mon hébergement</span></div>
        </div>
        <div className="topbar-right"><TopbarSignOut /></div>
      </div>

      <div className="content" style={{ maxWidth: "1200px", width: "100%" }}>
        <div className="dash-header">
          <div>
            <div className="dash-greeting">Mon hébergement</div>
            <div className="dash-date">Configurez votre établissement, vos chambres et votre contrat</div>
          </div>
        </div>

        <GuesthouseSettingsTabs
          initial={{
            id: guesthouse.id,
            name: guesthouse.name,
            address: guesthouse.address ?? "",
            city: guesthouse.city ?? "",
            zipCode: guesthouse.zipCode ?? "",
            email: guesthouse.email ?? "",
            phone: guesthouse.phone ?? "",
            capacity: guesthouse.capacity,
            touristTax: guesthouse.touristTax,
            contractTemplateGeneral: guesthouse.contractTemplateGeneral ?? "",
            contractTemplateHouseRules: guesthouse.contractTemplateHouseRules ?? "",
            logoUrl: guesthouse.logoUrl ?? "",
          }}
          rooms={rooms}
        />
      </div>
    </>
  );
}
