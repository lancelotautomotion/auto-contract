interface MealAgg { count: number; labels: Set<string> }
interface Alert { client: string; note: string }

const SERVICE_LABEL: Record<string, string> = {
  BREAKFAST: "Petit-déj",
  LUNCH: "Déjeuner",
  DINNER: "Dîner",
  OTHER: "Autre",
};

const SERVICE_ICON: Record<string, React.ReactNode> = {
  BREAKFAST: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  ),
  LUNCH: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 7v5l3 2"/>
    </svg>
  ),
  DINNER: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11h18M5 11a7 7 0 0114 0M4 15h16M2 19h20"/>
    </svg>
  ),
  OTHER: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M8 12h8"/>
    </svg>
  ),
};

const SERVICE_ORDER = ["BREAKFAST", "LUNCH", "DINNER", "OTHER"];

function relativeLabel(d: Date, today: Date): string | null {
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Demain";
  return null;
}

export interface DailyForecast {
  date: Date;
  services: Map<string, MealAgg>;
  alerts: Alert[];
}

export default function DailyForecastCard({ day, today }: { day: DailyForecast; today: Date }) {
  const rel = relativeLabel(day.date, today);
  const dateFmt = day.date.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" });
  const services = SERVICE_ORDER.filter((s) => day.services.has(s));
  const empty = services.length === 0 && day.alerts.length === 0;
  const isToday = rel === "Aujourd'hui";

  return (
    <div
      style={{
        border: isToday ? "1.5px solid #5B52B5" : "1px solid #EFEDE8",
        borderRadius: "12px",
        background: isToday ? "#FBFAFF" : "#FFFFFF",
        padding: "14px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        minHeight: "140px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
        <div>
          {rel && (
            <div style={{ fontSize: "10.5px", fontWeight: 700, color: isToday ? "#5B52B5" : "#689D71", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {rel}
            </div>
          )}
          <div style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--ink)", textTransform: "capitalize" }}>
            {dateFmt}
          </div>
        </div>
      </div>

      {empty ? (
        <div style={{ fontSize: "12px", color: "var(--ink-lighter)", fontStyle: "italic", margin: "auto 0" }}>
          Aucun repas prévu.
        </div>
      ) : (
        <>
          {services.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {services.map((s) => {
                const agg = day.services.get(s)!;
                return (
                  <div key={s} style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "8px 10px", background: "#F8F6F1", borderRadius: "8px",
                  }}>
                    <span style={{ color: "#5B52B5", flexShrink: 0, display: "inline-flex" }}>{SERVICE_ICON[s]}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--ink-lighter)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {SERVICE_LABEL[s] ?? s}
                      </div>
                      {agg.labels.size > 0 && (
                        <div style={{ fontSize: "11.5px", color: "var(--ink-lighter)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {Array.from(agg.labels).join(" · ")}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--ink)", lineHeight: 1 }}>
                      {agg.count}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {day.alerts.length > 0 && (
            <div style={{
              background: "#FDECEC", border: "1px solid #F5B5B5",
              borderRadius: "8px", padding: "8px 10px",
              display: "flex", flexDirection: "column", gap: "6px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#B91C1C", fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                Alertes
              </div>
              {day.alerts.map((a, i) => (
                <div key={i} style={{ fontSize: "12px", color: "#7A1F1F", lineHeight: 1.35 }}>
                  <strong style={{ color: "#B91C1C" }}>{a.client}</strong>
                  <span style={{ color: "#7A1F1F" }}> · {a.note}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export { SERVICE_ORDER };
