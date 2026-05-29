import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TopbarSignOut from "@/app/dashboard/TopbarSignOut";
import { nightsBetween } from "@/lib/billing";

export const dynamic = "force-dynamic";

const SERVICE_LABEL: Record<string, string> = {
  BREAKFAST: "Petit-déjeuner",
  LUNCH: "Déjeuner",
  DINNER: "Dîner / Table d'hôtes",
  OTHER: "Autre",
};

export default async function GuesthouseDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/onboarding");

  const guesthouse = await prisma.guesthouse.findFirst({
    where: { id, userId: dbUser.id, deletedAt: null },
    include: {
      rooms: true,
      reservations: {
        where: { status: { notIn: ["REFUSED", "CANCELLED"] } },
        include: { reservationRooms: true, meals: true },
        orderBy: { checkIn: "asc" },
      },
    },
  });
  if (!guesthouse) notFound();

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const reservationsThisYear = guesthouse.reservations.filter((r) => new Date(r.checkOut) >= yearStart);
  const revenueYear = reservationsThisYear.reduce((s, r) => s + (r.rent ?? 0), 0);
  const nightsYear = reservationsThisYear.reduce((s, r) => s + nightsBetween(r.checkIn, r.checkOut), 0);

  const upcoming = guesthouse.reservations
    .filter((r) => new Date(r.checkIn) >= today)
    .slice(0, 5);

  // Aujourd'hui en cuisine : pour chaque résa active aujourd'hui (today dans [checkIn, checkOut[),
  // agréger les repas par service.
  const todayResas = guesthouse.reservations.filter((r) => {
    const ci = new Date(r.checkIn); ci.setHours(0, 0, 0, 0);
    const co = new Date(r.checkOut); co.setHours(0, 0, 0, 0);
    return today >= ci && today < co;
  });
  const kitchenToday = new Map<string, { service: string; count: number; labels: string[] }>();
  for (const r of todayResas) {
    for (const m of r.meals) {
      const key = m.service;
      const prev = kitchenToday.get(key) ?? { service: key, count: 0, labels: [] };
      prev.count += m.quantity;
      if (!prev.labels.includes(m.label)) prev.labels.push(m.label);
      kitchenToday.set(key, prev);
    }
  }
  const kitchenRows = Array.from(kitchenToday.values()).sort((a, b) => {
    const order = ["BREAKFAST", "LUNCH", "DINNER", "OTHER"];
    return order.indexOf(a.service) - order.indexOf(b.service);
  });

  const fmt = (d: Date) =>
    new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  const fmtMoney = (n: number) => `${n.toLocaleString("fr-FR")} €`;

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-breadcrumb">Kordia / <span>Tableau de bord</span></div>
        </div>
        <div className="topbar-right"><TopbarSignOut /></div>
      </div>

      <div className="content" style={{ maxWidth: "1200px", width: "100%" }}>
        <div className="dash-header">
          <div>
            <div className="dash-greeting">{guesthouse.name}</div>
            <div className="dash-date">
              {guesthouse.rooms.length} chambre{guesthouse.rooms.length > 1 ? "s" : ""} · {now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            </div>
          </div>
        </div>

        {/* WIDGETS STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", marginBottom: "20px" }}>
          <div className="form-card" style={{ padding: "16px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--ink-lighter)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Chiffre d&apos;affaires {now.getFullYear()}</div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#689D71", marginTop: "6px" }}>{fmtMoney(revenueYear)}</div>
          </div>
          <div className="form-card" style={{ padding: "16px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--ink-lighter)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Nuits occupées {now.getFullYear()}</div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#5B52B5", marginTop: "6px" }}>{nightsYear}</div>
          </div>
          <div className="form-card" style={{ padding: "16px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--ink-lighter)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Réservations actives</div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "var(--ink)", marginTop: "6px" }}>{guesthouse.reservations.length}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* PROCHAINES ARRIVÉES */}
          <div className="form-card">
            <div className="form-card-title">
              <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M2 6h10M7 2v8M5 12h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
              Prochaines arrivées
            </div>
            {upcoming.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--ink-lighter)", fontStyle: "italic" }}>Aucune arrivée prévue.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {upcoming.map((r) => {
                  const hasMeals = r.meals.length > 0;
                  const hasAllergies = (r.dietaryNotes ?? "").trim().length > 0;
                  return (
                    <Link
                      key={r.id}
                      href={`/dashboard/maisons-hotes/${id}/reservations/${r.id}`}
                      style={{ display: "flex", gap: "10px", padding: "10px 12px", border: "1px solid #EFEDE8", borderRadius: "10px", textDecoration: "none", color: "inherit", alignItems: "flex-start", flexWrap: "wrap" }}
                    >
                      <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)" }}>{r.clientFirstName} {r.clientLastName}</div>
                        <div style={{ fontSize: "12px", color: "var(--ink-lighter)" }}>{fmt(r.checkIn)} → {fmt(r.checkOut)}</div>
                        <div style={{ fontSize: "12px", color: "var(--ink-lighter)" }}>{r.reservationRooms.map((rr) => rr.roomName).join(", ") || "—"}</div>
                      </div>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {hasMeals && (
                          <span style={{ fontSize: "10px", fontWeight: 700, background: "#E6F0E8", color: "#3E7A48", padding: "2px 8px", borderRadius: "20px" }}>Repas</span>
                        )}
                        {hasAllergies && (
                          <span style={{ fontSize: "10px", fontWeight: 700, background: "#FDECEC", color: "#B91C1C", padding: "2px 8px", borderRadius: "20px" }}>Allergies</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* AUJOURD'HUI EN CUISINE */}
          <div className="form-card">
            <div className="form-card-title">
              <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M2 12h10M3.5 12V6.5a3.5 3.5 0 017 0V12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
              Aujourd&apos;hui en cuisine
            </div>
            {kitchenRows.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--ink-lighter)", fontStyle: "italic" }}>Aucun repas à préparer aujourd&apos;hui.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {kitchenRows.map((row) => (
                  <div key={row.service} style={{ padding: "10px 12px", background: "#F8F6F1", borderRadius: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#5B52B5", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        {SERVICE_LABEL[row.service] ?? row.service}
                      </span>
                      <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--ink)" }}>{row.count}</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--ink-lighter)" }}>{row.labels.join(" · ")}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
