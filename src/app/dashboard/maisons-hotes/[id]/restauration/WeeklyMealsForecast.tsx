"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
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

export default function WeeklyMealsForecast({ reservations, tableDhotesCapacity = 0 }: { reservations: ReservationLike[]; tableDhotesCapacity?: number }) {
  const [weekOffset, setWeekOffset] = useState(0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() + weekOffset * 7);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    days.push(d);
  }

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
        if (note && r.meals.length > 0) {
          if (!slot.alerts.some((a) => a.client === clientName)) {
            slot.alerts.push({ client: clientName, note: truncate(note) });
          }
        }
      }
    }
  }

  const ordered: DailyForecast[] = days.map((d) => grid.get(dayKey(d))!);

  const fmtWeekRange = () => {
    const start = days[0];
    const end = days[6];
    const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
    return `${start.toLocaleDateString("fr-FR", opts)} – ${end.toLocaleDateString("fr-FR", opts)}`;
  };

  const navButtons = (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
      {weekOffset !== 0 && (
        <button
          type="button"
          onClick={() => setWeekOffset(0)}
          className="btn btn-outline"
          style={{ fontSize: "12px", padding: "5px 12px", borderRadius: "20px" }}
        >
          Aujourd&apos;hui
        </button>
      )}
      <button
        type="button"
        onClick={() => setWeekOffset((o) => o - 1)}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: "8px", border: "1px solid var(--line)", background: "var(--dash-white)", cursor: "pointer", flexShrink: 0 }}
      >
        <ChevronLeft size={15} strokeWidth={1.7} />
      </button>
      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--ink)", minWidth: 140, textAlign: "center" }}>
        {weekOffset === 0 ? "Cette semaine" : weekOffset === 1 ? "Semaine prochaine" : fmtWeekRange()}
      </span>
      <button
        type="button"
        onClick={() => setWeekOffset((o) => o + 1)}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: "8px", border: "1px solid var(--line)", background: "var(--dash-white)", cursor: "pointer", flexShrink: 0 }}
      >
        <ChevronRight size={15} strokeWidth={1.7} />
      </button>
    </div>
  );

  return (
    <div className="form-card" style={{ marginBottom: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
        <div className="form-card-title" style={{ marginBottom: 0 }}>
          <CalendarDays size={14} strokeWidth={1.7} />
          Assistant cuisine — 7 prochains jours
        </div>
        {navButtons}
      </div>
      <p style={{ fontSize: "13px", color: "var(--ink-lighter)", margin: "0 0 16px" }}>
        Vue d&apos;ensemble des repas à préparer et des régimes spécifiques signalés par vos clients.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
        {ordered.map((day) => (
          <DailyForecastCard key={dayKey(day.date)} day={day} today={today} tableDhotesCapacity={tableDhotesCapacity} />
        ))}
      </div>
    </div>
  );
}
