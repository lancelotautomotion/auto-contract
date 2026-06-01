import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TopbarSignOut from "@/app/dashboard/TopbarSignOut";
import GuesthouseReservationForm from "../../../GuesthouseReservationForm";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewGuesthouseReservationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/onboarding");

  const guesthouse = await prisma.guesthouse.findFirst({
    where: { id, userId: dbUser.id, deletedAt: null },
    include: {
      rooms: { orderBy: [{ position: "asc" }, { createdAt: "asc" }] },
      meals: { where: { active: true }, orderBy: [{ position: "asc" }, { createdAt: "asc" }] },
    },
  });
  if (!guesthouse) notFound();

  const rooms = guesthouse.rooms.map((r) => ({
    id: r.id, name: r.name, capacity: r.capacity, basePrice: r.basePrice, active: r.active,
  }));
  const meals = guesthouse.meals.map((m) => ({
    id: m.id, name: m.name, description: m.description, price: m.price, service: m.service,
  }));

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-breadcrumb">Kordia / {guesthouse.name} / Planning & Réservations / <span>Nouvelle</span></div>
        </div>
        <div className="topbar-right"><TopbarSignOut /></div>
      </div>

      <div className="content" style={{ maxWidth: "1100px", width: "100%" }}>
        <Link href={`/dashboard/maisons-hotes/${id}/reservations`} className="back-link">
          <ChevronLeft size={14} strokeWidth={1.4} />
          Retour
        </Link>

        <div className="page-title">
          <h1>Nouvelle <span className="v">réservation</span></h1>
          <div className="sub">Sélectionnez les chambres, la restauration et les informations du client</div>
        </div>

        <GuesthouseReservationForm guesthouseId={id} rooms={rooms} meals={meals} touristTaxRate={guesthouse.touristTax} />
      </div>
    </>
  );
}
