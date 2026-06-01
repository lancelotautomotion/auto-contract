import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TopbarSignOut from "@/app/dashboard/TopbarSignOut";
import MealsManager from "../../MealsManager";
import WeeklyMealsForecast from "./WeeklyMealsForecast";
import TableDhotesCapacitySettings from "./TableDhotesCapacitySettings";
import type { MealTag } from "./MealFormModal";
import { CalendarDays } from "lucide-react";

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
    id: m.id,
    name: m.name,
    description: m.description,
    price: m.price,
    service: m.service,
    tags: (m.tags ?? []) as MealTag[],
    active: m.active,
  }));

  const forecastReservations = guesthouse.reservations.map((r) => ({
    checkIn: r.checkIn,
    checkOut: r.checkOut,
    clientFirstName: r.clientFirstName,
    clientLastName: r.clientLastName,
    dietaryNotes: r.dietaryNotes,
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

        <div style={{ marginBottom: "20px" }}>
          <TableDhotesCapacitySettings
            guesthouseId={id}
            initialCapacity={guesthouse.tableDhotesCapacity ?? 0}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <MealsManager guesthouseId={id} initialMeals={meals} />
        </div>

        <div className="form-card">
          <div className="form-card-title">
            <CalendarDays size={14} strokeWidth={1.7} />
            Assistant cuisine — 7 prochains jours
          </div>
          <p style={{ fontSize: "13px", color: "var(--ink-lighter)", margin: "0 0 16px" }}>
            Vue d&apos;ensemble des repas à préparer et des régimes spécifiques signalés par vos clients.
          </p>
          <WeeklyMealsForecast reservations={forecastReservations} />
        </div>
      </div>
    </>
  );
}
