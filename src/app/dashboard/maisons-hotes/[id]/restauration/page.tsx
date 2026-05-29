import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TopbarSignOut from "@/app/dashboard/TopbarSignOut";
import MealsManager from "../../MealsManager";
import WeeklyMealsForecast from "./WeeklyMealsForecast";

export const dynamic = "force-dynamic";

export default async function GuesthouseRestaurationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/onboarding");

  const guesthouse = await prisma.guesthouse.findFirst({
    where: { id, userId: dbUser.id, deletedAt: null },
    include: {
      meals: { orderBy: [{ position: "asc" }, { createdAt: "asc" }] },
      reservations: {
        where: { status: { notIn: ["REFUSED", "CANCELLED"] } },
        include: { meals: true },
      },
    },
  });
  if (!guesthouse) notFound();

  const meals = guesthouse.meals.map((m) => ({
    id: m.id, name: m.name, description: m.description, price: m.price, service: m.service, active: m.active,
  }));

  const forecastReservations = guesthouse.reservations.map((r) => ({
    checkIn: r.checkIn,
    checkOut: r.checkOut,
    meals: r.meals.map((m) => ({ service: m.service, label: m.label, quantity: m.quantity })),
  }));

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-breadcrumb">Kordia / {guesthouse.name} / <span>Restauration</span></div>
        </div>
        <div className="topbar-right"><TopbarSignOut /></div>
      </div>

      <div className="content" style={{ maxWidth: "1200px", width: "100%" }}>
        <div className="dash-header">
          <div>
            <div className="dash-greeting">Restauration</div>
            <div className="dash-date">Configurez vos menus et anticipez vos préparations</div>
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <MealsManager guesthouseId={id} initialMeals={meals} />
        </div>

        <div className="form-card">
          <div className="form-card-title">
            <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><rect x="2" y="3" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M2 6h10" stroke="currentColor" strokeWidth="1.2"/></svg>
            Prévisionnel — 7 prochains jours
          </div>
          <WeeklyMealsForecast reservations={forecastReservations} />
        </div>
      </div>
    </>
  );
}
