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

const MONTH_NAMES = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

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

  // Navigation prev/next
  const prevDate  = new Date(selYear, selMonth - 1, 1);
  const nextDate  = new Date(selYear, selMonth + 1, 1);
  const prevParam = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
  const nextParam = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;
  const isCurrentMonth = selYear === now.getFullYear() && selMonth === now.getMonth();

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
        <div className="form-card" style={{ padding: "20px", marginBottom: "20px" }}>

          {/* Navigation mois */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <Link
              href={`?month=${prevParam}`}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--dash-white)", color: "var(--ink-soft)", textDecoration: "none", fontSize: "16px", flexShrink: 0 }}
            >‹</Link>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--ink)" }}>
                {MONTH_NAMES[selMonth]} {selYear}
              </div>
              {isCurrentMonth && (
                <div style={{ fontSize: "11px", color: "var(--ink-lighter)", marginTop: "2px" }}>Mois en cours</div>
              )}
            </div>
            <Link
              href={`?month=${nextParam}`}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--dash-white)", color: "var(--ink-soft)", textDecoration: "none", fontSize: "16px", flexShrink: 0 }}
            >›</Link>
          </div>

          {/* Grille stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>

            {/* Taux d'occupation */}
            <div style={{ padding: "14px 16px", background: "var(--line-light)", borderRadius: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--ink-lighter)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Taux d&apos;occupation</div>
              <div style={{ fontSize: "28px", fontWeight: 700, color: occupancyRate >= 70 ? "#689D71" : occupancyRate >= 40 ? "#B8600A" : "var(--ink)", lineHeight: 1 }}>
                {occupancyRate}<span style={{ fontSize: "16px", fontWeight: 600 }}>%</span>
              </div>
              <div style={{ fontSize: "11px", color: "var(--ink-lighter)", marginTop: "4px" }}>
                {occupiedRoomNights} / {availableRoomNights} nuits-chambre
              </div>
            </div>

            {/* CA du mois */}
            <div style={{ padding: "14px 16px", background: "var(--line-light)", borderRadius: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--ink-lighter)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Chiffre d&apos;affaires</div>
              <div style={{ fontSize: "28px", fontWeight: 700, color: "#689D71", lineHeight: 1 }}>
                {fmtMoney(revenueMonth)}
              </div>
              <div style={{ fontSize: "11px", color: "var(--ink-lighter)", marginTop: "4px" }}>loyers proratés</div>
            </div>

            {/* RevPAR */}
            <div style={{ padding: "14px 16px", background: "var(--line-light)", borderRadius: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--ink-lighter)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>RevPAR</div>
              <div style={{ fontSize: "28px", fontWeight: 700, color: "#5B52B5", lineHeight: 1 }}>
                {fmtMoney(revpar)}
              </div>
              <div style={{ fontSize: "11px", color: "var(--ink-lighter)", marginTop: "4px" }}>CA / nuit-chambre dispo</div>
            </div>

            {/* Durée moy. séjour */}
            <div style={{ padding: "14px 16px", background: "var(--line-light)", borderRadius: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--ink-lighter)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Durée moy. séjour</div>
              <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--ink)", lineHeight: 1 }}>
                {avgStay > 0 ? avgStay : "—"}<span style={{ fontSize: "14px", fontWeight: 500, color: "var(--ink-soft)" }}>{avgStay > 0 ? " nuit" + (avgStay > 1 ? "s" : "") : ""}</span>
              </div>
              <div style={{ fontSize: "11px", color: "var(--ink-lighter)", marginTop: "4px" }}>
                {resasCheckInMonth.length} arrivée{resasCheckInMonth.length > 1 ? "s" : ""} dans le mois
              </div>
            </div>

            {/* Repas servis */}
            <div style={{ padding: "14px 16px", background: "var(--line-light)", borderRadius: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--ink-lighter)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Repas servis</div>
              <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--ink)", lineHeight: 1 }}>{mealsMonth}</div>
              <div style={{ fontSize: "11px", color: "var(--ink-lighter)", marginTop: "4px" }}>toutes formules</div>
            </div>

          </div>
        </div>

        {/* PROCHAINES ARRIVÉES + AUJOURD'HUI EN CUISINE */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
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
                  const hasMeals    = r.meals.length > 0;
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
