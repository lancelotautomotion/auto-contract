interface MealEntry {
  service: string;
  label: string;
  quantity: number;
}

interface ReservationLike {
  checkIn: Date | string;
  checkOut: Date | string;
  meals: MealEntry[];
}

const SERVICE_LABEL: Record<string, string> = {
  BREAKFAST: "Petit-déj",
  LUNCH: "Déjeuner",
  DINNER: "Dîner",
  OTHER: "Autre",
};
const SERVICE_ORDER = ["BREAKFAST", "LUNCH", "DINNER", "OTHER"];

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

export default function WeeklyMealsForecast({ reservations }: { reservations: ReservationLike[] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }

  // Map<dayKey, Map<service, { count, labels: Set<string> }>>
  const grid = new Map<string, Map<string, { count: number; labels: Set<string> }>>();
  for (const d of days) grid.set(dayKey(d), new Map());

  for (const r of reservations) {
    const ci = new Date(r.checkIn); ci.setHours(0, 0, 0, 0);
    const co = new Date(r.checkOut); co.setHours(0, 0, 0, 0);
    for (const d of days) {
      if (d >= ci && d < co) {
        const dayMap = grid.get(dayKey(d))!;
        for (const m of r.meals) {
          const prev = dayMap.get(m.service) ?? { count: 0, labels: new Set<string>() };
          prev.count += m.quantity;
          prev.labels.add(m.label);
          dayMap.set(m.service, prev);
        }
      }
    }
  }

  const usedServices = new Set<string>();
  for (const dayMap of grid.values()) {
    for (const service of dayMap.keys()) usedServices.add(service);
  }
  const services = SERVICE_ORDER.filter((s) => usedServices.has(s));

  const dayFmt = (d: Date) =>
    d.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "2-digit" });

  if (services.length === 0) {
    return (
      <p style={{ fontSize: "13px", color: "var(--ink-lighter)", fontStyle: "italic", margin: 0 }}>
        Aucun repas prévu sur les 7 prochains jours.
      </p>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", minWidth: "640px", borderCollapse: "separate", borderSpacing: 0, fontSize: "12.5px" }}>
        <thead>
          <tr>
            <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "11px", color: "#A3A3A0", textTransform: "uppercase", letterSpacing: "0.5px" }}>Jour</th>
            {services.map((s) => (
              <th key={s} style={{ padding: "10px 12px", textAlign: "center", fontSize: "11px", color: "#5B52B5", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {SERVICE_LABEL[s] ?? s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((d, idx) => {
            const dayMap = grid.get(dayKey(d))!;
            const isToday = idx === 0;
            return (
              <tr key={dayKey(d)} style={{ background: isToday ? "#F8F6F1" : "transparent" }}>
                <td style={{ padding: "10px 12px", fontWeight: isToday ? 700 : 600, color: "var(--ink)", borderTop: "1px solid #EFEDE8" }}>
                  {dayFmt(d)} {isToday && <span style={{ fontSize: "10px", fontWeight: 700, color: "#689D71", marginLeft: "4px" }}>· Aujourd&apos;hui</span>}
                </td>
                {services.map((s) => {
                  const entry = dayMap.get(s);
                  return (
                    <td key={s} style={{ padding: "10px 12px", textAlign: "center", borderTop: "1px solid #EFEDE8" }}>
                      {entry ? (
                        <div>
                          <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--ink)" }}>{entry.count}</div>
                          <div style={{ fontSize: "11px", color: "var(--ink-lighter)" }}>{Array.from(entry.labels).join(" · ")}</div>
                        </div>
                      ) : (
                        <span style={{ color: "#D1D0CC" }}>—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
