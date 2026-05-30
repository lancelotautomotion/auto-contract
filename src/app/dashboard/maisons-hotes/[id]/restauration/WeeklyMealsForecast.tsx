import DailyForecastCard, { type DailyForecast } from "./DailyForecastCard";

interface MealEntry {
  service: string;
  label: string;
  quantity: number;
}

interface ReservationLike {
  checkIn: Date | string;
  checkOut: Date | string;
  clientFirstName: string;
  clientLastName: string;
  dietaryNotes: string | null;
  meals: MealEntry[];
}

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

function truncate(s: string, max = 80) {
  const clean = s.replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max - 1) + "…" : clean;
}

export default function WeeklyMealsForecast({ reservations }: { reservations: ReservationLike[] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }

  // Map<dayKey, DailyForecast>
  const grid = new Map<string, DailyForecast>();
  for (const d of days) grid.set(dayKey(d), { date: d, services: new Map(), alerts: [] });

  for (const r of reservations) {
    const ci = new Date(r.checkIn); ci.setHours(0, 0, 0, 0);
    const co = new Date(r.checkOut); co.setHours(0, 0, 0, 0);
    const note = (r.dietaryNotes ?? "").trim();
    const clientName = `${r.clientFirstName} ${r.clientLastName}`.trim();

    for (const d of days) {
      if (d >= ci && d < co) {
        const slot = grid.get(dayKey(d))!;
        for (const m of r.meals) {
          const prev = slot.services.get(m.service) ?? { count: 0, labels: new Set<string>() };
          prev.count += m.quantity;
          prev.labels.add(m.label);
          slot.services.set(m.service, prev);
        }
        // Une alerte n'est pertinente que si le client est servi ce jour-là (a au moins un repas)
        if (note && r.meals.length > 0) {
          if (!slot.alerts.some((a) => a.client === clientName)) {
            slot.alerts.push({ client: clientName, note: truncate(note) });
          }
        }
      }
    }
  }

  const ordered: DailyForecast[] = days.map((d) => grid.get(dayKey(d))!);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "12px",
      }}
    >
      {ordered.map((day) => (
        <DailyForecastCard key={dayKey(day.date)} day={day} today={today} />
      ))}
    </div>
  );
}
