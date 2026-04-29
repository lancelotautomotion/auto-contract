import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import NewReservationForm from "./NewReservationForm";

export default async function NewReservationPage() {
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
    <>
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-breadcrumb">Kordia / Réservations / <span>Nouvelle</span></div>
        </div>
        <div className="topbar-right">
          <button className="topbar-btn">
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="content" style={{ maxWidth: '1100px', width: '100%' }}>

        <Link href="/dashboard" className="back-link">
          <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
            <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Retour aux réservations
        </Link>

        <div className="page-title">
          <h1>Ajouter un <span className="v">séjour</span></h1>
          <div className="sub">Saisissez les informations du client et les détails de la réservation</div>
        </div>

        <NewReservationForm
          defaultCleaningFee={gite.cleaningFee.toString()}
          defaultTouristTax={gite.touristTax.toString()}
          availableOptions={gite.options.map(o => ({ id: o.id, label: o.label, price: o.price }))}
        />
      </div>
    </>
  );
}
