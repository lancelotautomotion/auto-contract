"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import CalendarView, { type GiteCalendarData } from "./CalendarView";

const PLATFORM_LABELS: Record<string, string> = {
  airbnb: "Airbnb", abritel: "Abritel / VRBO", booking: "Booking.com",
  gites_de_france: "Gîtes de France", autre: "Autre",
};

function fmtShort(s: string) {
  const d = new Date(s.length === 10 ? s + "T12:00:00" : s);
  return `${d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}/${d.getFullYear()}`;
}
function fmtDateStr(s: string) {
  return new Date(s + "T12:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }) + "/" + s.slice(0, 4);
}

interface Props {
  multiGites: GiteCalendarData[];
  currentGiteId: string;
}

export default function DashboardMain({ multiGites, currentGiteId }: Props) {
  const showMultiToggle = multiGites.length > 1;
  const [activeView, setActiveView] = useState<"all" | string>(
    showMultiToggle ? "all" : currentGiteId
  );

  const todayStr = new Date().toISOString().slice(0, 10);
  const hasIcal = multiGites.some((g) => g.icalBlocked.length > 0);

  const currentGiteData = multiGites.find((g) => g.id === currentGiteId);

  const activeGites = useMemo(
    () => (activeView === "all" ? multiGites : multiGites.filter((g) => g.id === activeView)),
    [activeView, multiGites]
  );

  const upcoming = useMemo(
    () =>
      activeGites
        .flatMap((g) =>
          g.reservations
            .filter(
              (r) =>
                r.status !== "PENDING_REVIEW" &&
                r.status !== "REFUSED" &&
                r.checkIn >= todayStr
            )
            .map((r) => ({ ...r, gite: g }))
        )
        .sort((a, b) => (a.checkIn < b.checkIn ? -1 : 1))
        .slice(0, 6),
    [activeGites, todayStr]
  );

  const upcomingIcal = useMemo(
    () =>
      activeGites
        .flatMap((g) =>
          g.icalBlocked
            .filter((b) => b.end > todayStr)
            .map((b) => ({ ...b, gite: g }))
        )
        .sort((a, b) => (a.start < b.start ? -1 : 1))
        .slice(0, 6),
    [activeGites, todayStr]
  );

  const activeGiteLabel = useMemo(() => {
    if (activeView === "all") return "Tous les hébergements";
    return multiGites.find((g) => g.id === activeView)?.name ?? "";
  }, [activeView, multiGites]);

  return (
    <div className="grid-2">
      {/* Planning */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
              <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="#7F77DD" strokeWidth="1.2"/>
              <path d="M2 6.5h12" stroke="#7F77DD" strokeWidth="1.2"/>
              <path d="M5.5 1.5v3M10.5 1.5v3" stroke="#7F77DD" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Planning
          </div>
          <div className="card-legend">
            <span><span className="legend-dot g" />Signé</span>
            <span><span className="legend-dot v" />Envoyé</span>
            <span><span className="legend-dot a" />En attente</span>
            {hasIcal && (
              <span>
                <span className="legend-dot" style={{ background: "#E4E2DE", border: "1px solid #CEC8BF" }} />
                Autres plateformes
              </span>
            )}
          </div>
        </div>
        <div style={{ padding: "16px 20px" }}>
          <CalendarView
            reservations={currentGiteData?.reservations ?? []}
            icalBlocked={currentGiteData?.icalBlocked ?? []}
            multiGites={showMultiToggle ? multiGites : undefined}
            currentGiteId={currentGiteId}
            activeView={activeView}
            onActiveViewChange={setActiveView}
          />
        </div>
      </div>

      {/* Prochaines arrivées */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="5.5" stroke="#7F77DD" strokeWidth="1.2"/>
              <path d="M8 5v3l2 1.5" stroke="#7F77DD" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Prochaines arrivées
          </div>
          {showMultiToggle && (
            <div style={{ fontSize: "11px", color: "var(--ink-lighter)", fontWeight: 500 }}>
              {activeGiteLabel}
            </div>
          )}
        </div>
        <div className="upcoming-list">
          {upcoming.length === 0 && upcomingIcal.length === 0 ? (
            <div style={{ padding: "24px 8px", textAlign: "center", fontSize: "13px", color: "var(--ink-lighter)" }}>
              Aucune arrivée à venir
            </div>
          ) : (
            <>
              {upcoming.map((r) => {
                const status = r.contractStatus;
                const barClass = status === "SIGNED" ? "g" : status === "GENERATED" ? "v" : "a";
                const pillClass = status === "SIGNED" ? "pill-g" : status === "GENERATED" ? "pill-v" : "pill-a";
                const pillLabel = status === "SIGNED" ? "Signé" : status === "GENERATED" ? "Envoyé" : "En attente";
                return (
                  <Link
                    key={r.id}
                    href={`/dashboard/${r.gite.id}/reservations/${r.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div className="upcoming-item">
                      <div className={`ui-bar ${barClass}`} />
                      <div className="ui-info">
                        <div className="ui-name">
                          {r.clientFirstName} {r.clientLastName}
                        </div>
                        <div className="ui-dates">
                          {fmtShort(r.checkIn)} → {fmtShort(r.checkOut)}
                          {showMultiToggle && activeView === "all" && (
                            <span style={{ marginLeft: "6px", color: r.gite.color, fontWeight: 600 }}>
                              · {r.gite.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`pill ${pillClass}`}>{pillLabel}</span>
                    </div>
                  </Link>
                );
              })}
              {upcomingIcal.map((b, i) => (
                <div key={`ical-${b.gite.id}-${i}`} className="upcoming-item" style={{ cursor: "default" }}>
                  <div className="ui-bar" style={{ background: "#CEC8BF" }} />
                  <div className="ui-info">
                    <div className="ui-name" style={{ color: "var(--ink-soft)" }}>
                      {PLATFORM_LABELS[b.platform] ?? b.label}
                    </div>
                    <div className="ui-dates">
                      {fmtDateStr(b.start)} → {fmtDateStr(b.end)}
                      {showMultiToggle && activeView === "all" && (
                        <span style={{ marginLeft: "6px", color: b.gite.color, fontWeight: 600 }}>
                          · {b.gite.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="pill" style={{ background: "#F0EDE8", color: "#71716E", border: "1px solid #E4E2DE" }}>
                    Externe
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
