import { Sun, Clock, Utensils, Plus, AlertTriangle } from "lucide-react";

interface MealAgg { count: number; labels: Set<string> }
interface Alert { client: string; note: string }

const SERVICE_LABEL: Record<string, string> = {
  BREAKFAST: "Petit-déj",
  LUNCH: "Déjeuner",
  DINNER: "Dîner",
  OTHER: "Autre",
};

const SERVICE_ICON: Record<string, React.ReactNode> = {
  BREAKFAST: <Sun size={16} strokeWidth={1.7} />,
  LUNCH: <Clock size={16} strokeWidth={1.7} />,
  DINNER: <Utensils size={16} strokeWidth={1.7} />,
  OTHER: <Plus size={16} strokeWidth={1.7} />,
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
                <AlertTriangle size={13} strokeWidth={1.7} />
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
