import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TopbarSignOut from "@/app/dashboard/TopbarSignOut";
import { nightsBetween } from "@/lib/billing";
import MonthSelector from "./MonthSelector";

export const dynamic = "force-dynamic";

const SERVICE_LABEL: Record<string, string> = {
  BREAKFAST: "Petit-déjeuner",
  LUNCH: "Déjeuner",
  DINNER: "Dîner / Table d'hôtes",
  OTHER: "Autre",
};

// Nuits d'une réservation tombant dans [mStart, mEnd) — borne inférieure incluse, supérieure exclue
function nightsOverlap(checkIn: Date, checkOut: Date, mStart: Date, mEnd: Date): number {
  const start = Math.max(checkIn.getTime(), mStart.getTime());
  const end   = Math.min(checkOut.getTime(), mEnd.getTime());
  if (end <= start) return 0;
  return Math.round((end - start) / 86_400_000);
}

export default async function GuesthouseDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ month?: string }>;
}) {
  const { id } = await params;
  const { month: monthParam } = await searchParams;

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

  // ── Mois sélectionné ─────────────────────────────────────────────────────
  let selYear  = now.getFullYear();
  let selMonth = now.getMonth(); // 0-indexed
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [y, m] = monthParam.split("-").map(Number);
    selYear  = y;
    selMonth = m - 1;
  }
  const monthStart    = new Date(selYear, selMonth, 1);
  const monthEnd      = new Date(selYear, selMonth + 1, 1); // exclusive
  const daysInMonth   = Math.round((monthEnd.getTime() - monthStart.getTime()) / 86_400_000);

  // ── Calculs stats mensuels ────────────────────────────────────────────────
  const activeRooms        = guesthouse.rooms.filter((r) => r.active).length;
  const availableRoomNights = daysInMonth * activeRooms; // nuits-chambre disponibles

  // Réservations qui chevauchent le mois (au moins 1 nuit dans le mois)
  const relevantResas = guesthouse.reservations.filter((r) => {
    const ci = new Date(r.checkIn);
    const co = new Date(r.checkOut);
    return co > monthStart && ci < monthEnd;
  });

  // Chambre-nuits occupées : chaque réservation × nombre de chambres × nuits dans le mois
  let occupiedRoomNights = 0;
  for (const r of relevantResas) {
    const nights    = nightsOverlap(new Date(r.checkIn), new Date(r.checkOut), monthStart, monthEnd);
    const roomCount = r.reservationRooms.length > 0 ? r.reservationRooms.length : 1;
    occupiedRoomNights += nights * roomCount;
  }
  const occupancyRate = availableRoomNights > 0
    ? Math.round((occupiedRoomNights / availableRoomNights) * 100)
    : 0;

  // CA mensuel proraté : loyer × (nuits dans le mois / durée totale)
  let revenueMonth = 0;
  for (const r of relevantResas) {
    if (r.rent == null || r.rent === 0) continue;
    const totalNights = nightsBetween(r.checkIn, r.checkOut);
    if (totalNights === 0) continue;
    const nights = nightsOverlap(new Date(r.checkIn), new Date(r.checkOut), monthStart, monthEnd);
    revenueMonth += (r.rent * nights) / totalNights;
  }
  revenueMonth = Math.round(revenueMonth * 100) / 100;

  // RevPAR = CA / nuits-chambre disponibles
  const revpar = availableRoomNights > 0
    ? Math.round((revenueMonth / availableRoomNights) * 100) / 100
    : 0;

  // Réservations dont le checkIn tombe dans le mois (pour durée moy. + comptage)
  const resasCheckInMonth = relevantResas.filter((r) => {
    const ci = new Date(r.checkIn);
    return ci >= monthStart && ci < monthEnd;
  });
  const avgStay = resasCheckInMonth.length > 0
    ? Math.round(
        (resasCheckInMonth.reduce((s, r) => s + nightsBetween(r.checkIn, r.checkOut), 0) /
          resasCheckInMonth.length) * 10
      ) / 10
    : 0;

  // Repas du mois : somme des quantités pour toutes les réservations actives dans le mois
  const mealsMonth = relevantResas.reduce(
    (s, r) => s + r.meals.reduce((ms, m) => ms + m.quantity, 0),
    0
  );

  // ── Prochaines arrivées ───────────────────────────────────────────────────
  const upcoming = guesthouse.reservations
    .filter((r) => new Date(r.checkIn) >= today)
    .slice(0, 5);

  // ── Aujourd'hui en cuisine ────────────────────────────────────────────────
  const todayResas = guesthouse.reservations.filter((r) => {
    const ci = new Date(r.checkIn); ci.setHours(0, 0, 0, 0);
    const co = new Date(r.checkOut); co.setHours(0, 0, 0, 0);
    return today >= ci && today < co;
  });
  const kitchenToday = new Map<string, { service: string; count: number; labels: string[] }>();
  for (const r of todayResas) {
    for (const m of r.meals) {
      const key  = m.service;
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

  const fmt      = (d: Date) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  const fmtMoney = (n: number) => `${n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €`;

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

        {/* STATS MENSUELLES */}
        <div style={{ marginBottom: "20px" }}>

          {/* Sélecteur mois/année */}
          <MonthSelector selYear={selYear} selMonth={selMonth} />

          {/* Ligne 1 : 3 stats principales */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "12px" }}>

            {/* Taux d'occupation */}
            <div className={`stat-card ${occupancyRate >= 70 ? "green" : occupancyRate >= 40 ? "amber" : "ink"}`}>
              <div className="sc-top">
                <span className="sc-label">Taux d&apos;occupation</span>
                <span className={`sc-icon ${occupancyRate >= 70 ? "g" : occupancyRate >= 40 ? "a" : "i"}`}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M2 11a5 5 0 0110 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M7 6V3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                </span>
              </div>
              <div className="sc-num" style={{ color: occupancyRate >= 70 ? "var(--green)" : occupancyRate >= 40 ? "var(--amber)" : "var(--ink)" }}>
                {occupancyRate}<span style={{ fontSize: "18px", fontWeight: 600, color: "var(--ink-soft)" }}>%</span>
              </div>
              {/* Barre de progression */}
              <div style={{ marginTop: "10px", height: "4px", background: "var(--line)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(occupancyRate, 100)}%`, background: occupancyRate >= 70 ? "var(--green)" : occupancyRate >= 40 ? "var(--amber)" : "var(--ink-soft)", borderRadius: "4px", transition: "width .4s" }} />
              </div>
              <div className="sc-change" style={{ color: "var(--ink-lighter)", fontWeight: 400 }}>
                {occupiedRoomNights} / {availableRoomNights} nuits-chambre
              </div>
            </div>

            {/* CA mensuel */}
            <div className="stat-card green">
              <div className="sc-top">
                <span className="sc-label">Chiffre d&apos;affaires</span>
                <span className="sc-icon g">
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.2"/><path d="M7 4v6M5 5.5h3a1.5 1.5 0 010 3H5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                </span>
              </div>
              <div className="sc-num" style={{ color: "var(--green)", fontSize: revenueMonth >= 10000 ? "24px" : "32px" }}>{fmtMoney(revenueMonth)}</div>
              <div className="sc-change" style={{ color: "var(--ink-lighter)", fontWeight: 400 }}>loyers proratés sur le mois</div>
            </div>

            {/* RevPAR */}
            <div className="stat-card violet">
              <div className="sc-top">
                <span className="sc-label">RevPAR</span>
                <span className="sc-icon v">
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><rect x="1.5" y="3.5" width="11" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5 7h4M7 5.5V8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                </span>
              </div>
              <div className="sc-num" style={{ color: "var(--violet)" }}>{fmtMoney(revpar)}</div>
              <div className="sc-change" style={{ color: "var(--ink-lighter)", fontWeight: 400 }}>CA / nuit-chambre disponible</div>
            </div>
          </div>

          {/* Ligne 2 : 2 stats secondaires + les deux blocs opérationnels */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>

            {/* Durée moy. séjour */}
            <div className="stat-card violet">
              <div className="sc-top">
                <span className="sc-label">Durée moy.</span>
                <span className="sc-icon v">
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><rect x="1" y="2.5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1 6h12M4.5 1v3M9.5 1v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                </span>
              </div>
              <div className="sc-num" style={{ color: "var(--violet)" }}>{avgStay > 0 ? avgStay : "—"}<span style={{ fontSize: "14px", fontWeight: 500, color: "var(--ink-soft)" }}>{avgStay > 0 ? " n." : ""}</span></div>
              <div className="sc-change" style={{ color: "var(--ink-lighter)", fontWeight: 400 }}>{resasCheckInMonth.length} arrivée{resasCheckInMonth.length > 1 ? "s" : ""} dans le mois</div>
            </div>

            {/* Repas servis */}
            <div className="stat-card green">
              <div className="sc-top">
                <span className="sc-label">Repas servis</span>
                <span className="sc-icon g">
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M2 12h10M3.5 12V6.5a3.5 3.5 0 017 0V12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                </span>
              </div>
              <div className="sc-num" style={{ color: "var(--green)" }}>{mealsMonth}</div>
              <div className="sc-change" style={{ color: "var(--ink-lighter)", fontWeight: 400 }}>toutes formules</div>
            </div>

            {/* Prochaines arrivées */}
            <div className="form-card" style={{ gridColumn: "span 2" }}>
              <div className="form-card-title">
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M2 6h10M7 2v8M5 12h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                Prochaines arrivées
              </div>
              {upcoming.length === 0 ? (
                <p style={{ fontSize: "13px", color: "var(--ink-lighter)", fontStyle: "italic" }}>Aucune arrivée prévue.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {upcoming.slice(0, 3).map((r) => {
                    const hasMeals     = r.meals.length > 0;
                    const hasAllergies = (r.dietaryNotes ?? "").trim().length > 0;
                    return (
                      <Link
                        key={r.id}
                        href={`/dashboard/maisons-hotes/${id}/reservations/${r.id}`}
                        style={{ display: "flex", gap: "8px", padding: "8px 10px", border: "1px solid #EFEDE8", borderRadius: "10px", textDecoration: "none", color: "inherit", alignItems: "center" }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)" }}>{r.clientFirstName} {r.clientLastName}</div>
                          <div style={{ fontSize: "11px", color: "var(--ink-lighter)" }}>{fmt(r.checkIn)} → {fmt(r.checkOut)} · {r.reservationRooms.map((rr) => rr.roomName).join(", ") || "—"}</div>
                        </div>
                        <div style={{ display: "flex", gap: "4px" }}>
                          {hasMeals && <span style={{ fontSize: "10px", fontWeight: 700, background: "#E6F0E8", color: "#3E7A48", padding: "2px 7px", borderRadius: "20px" }}>Repas</span>}
                          {hasAllergies && <span style={{ fontSize: "10px", fontWeight: 700, background: "#FDECEC", color: "#B91C1C", padding: "2px 7px", borderRadius: "20px" }}>Allergies</span>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
              {kitchenRows.map((row) => (
                <div key={row.service} style={{ padding: "12px 14px", background: "#F8F6F1", borderRadius: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#5B52B5", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {SERVICE_LABEL[row.service] ?? row.service}
                    </span>
                    <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--ink)" }}>{row.count}</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--ink-lighter)" }}>{row.labels.join(" · ")}</div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}
