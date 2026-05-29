import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TopbarSignOut from "@/app/dashboard/TopbarSignOut";
import GuesthouseReservationForm from "../../../GuesthouseReservationForm";

export const dynamic = "force-dynamic";

export default async function NewGuesthouseReservationPage({ params }: { params: Promise<{ id: string }> }) {
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
          <div className="topbar-breadcrumb">Kordia / {guesthouse.name} / <span>Nouvelle réservation</span></div>
        </div>
        <div className="topbar-right"><TopbarSignOut /></div>
      </div>

      <div className="content" style={{ maxWidth: "1100px", width: "100%" }}>
        <Link href={`/dashboard/maisons-hotes/${id}`} className="back-link">
          <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Retour
        </Link>

        <div className="page-title">
          <h1>Nouvelle <span className="v">réservation</span></h1>
          <div className="sub">Sélectionnez les chambres, la restauration et les informations du client</div>
        </div>

        <GuesthouseReservationForm guesthouseId={id} rooms={rooms} touristTaxRate={guesthouse.touristTax} />
      </div>
    </>
  );
}
