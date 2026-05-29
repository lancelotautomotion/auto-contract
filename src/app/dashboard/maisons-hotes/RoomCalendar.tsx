"use client";

import { useState } from "react";

interface BookedRange { reservationId: string; clientName: string; checkIn: string; checkOut: string; status: string; }
interface RoomAvailability { roomId: string; roomName: string; booked: BookedRange[]; }

const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

// Une nuit est occupée pour [checkIn, checkOut[ (le jour de départ est libre).
function dayBooking(booked: BookedRange[], year: number, month: number, day: number): BookedRange | null {
  const d = new Date(year, month, day); d.setHours(12, 0, 0, 0);
  for (const b of booked) {
    const ci = new Date(b.checkIn); ci.setHours(0, 0, 0, 0);
    const co = new Date(b.checkOut); co.setHours(0, 0, 0, 0);
    if (d >= ci && d < co) return b;
  }
  return null;
}

export default function RoomCalendar({ availability }: { availability: RoomAvailability[] }) {
  const today = new Date();
  const [base, setBase] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const nDays = daysInMonth(base.year, base.month);
  const days = Array.from({ length: nDays }, (_, i) => i + 1);

  if (availability.length === 0) {
    return <p style={{ fontSize: "13px", color: "var(--ink-lighter)", fontStyle: "italic" }}>Aucune chambre à afficher. Ajoutez des chambres pour voir le planning.</p>;
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <button type="button" onClick={() => setBase((b) => ({ year: b.month === 0 ? b.year - 1 : b.year, month: b.month === 0 ? 11 : b.month - 1 }))} style={navBtn}>←</button>
        <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1C1C1A" }}>{MONTHS[base.month]} {base.year}</div>
        <button type="button" onClick={() => setBase((b) => ({ year: b.month === 11 ? b.year + 1 : b.year, month: (b.month + 1) % 12 }))} style={navBtn}>→</button>
      </div>

      <div style={{ overflowX: "auto", border: "1px solid #CEC8BF", borderRadius: "10px", background: "#F7F4F0" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: `${160 + nDays * 26}px` }}>
          <thead>
            <tr>
              <th style={{ ...cellBase, position: "sticky", left: 0, background: "#F0EDE8", textAlign: "left", minWidth: "150px", fontWeight: 700, color: "#7A7570", fontSize: "11px" }}>Chambre</th>
              {days.map((d) => {
                const isToday = base.year === today.getFullYear() && base.month === today.getMonth() && d === today.getDate();
                return <th key={d} style={{ ...cellBase, width: "26px", fontSize: "10px", color: isToday ? "#5B52B5" : "#A3A3A0", fontWeight: isToday ? 700 : 500 }}>{d}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {availability.map((room) => (
              <tr key={room.roomId}>
                <td style={{ ...cellBase, position: "sticky", left: 0, background: "#fff", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#2C2C2A" }}>{room.roomName}</td>
                {days.map((d) => {
                  const b = dayBooking(room.booked, base.year, base.month, d);
                  return (
                    <td
                      key={d}
                      title={b ? `${b.clientName} (${new Date(b.checkIn).toLocaleDateString("fr-FR")} → ${new Date(b.checkOut).toLocaleDateString("fr-FR")})` : undefined}
                      style={{ ...cellBase, background: b ? (b.status === "PENDING_REVIEW" ? "#FCE3B0" : "#DAD7F0") : "#fff", cursor: b ? "pointer" : "default" }}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", gap: "16px", marginTop: "10px", fontSize: "11px", color: "#71716E" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: 12, height: 12, borderRadius: 3, background: "#DAD7F0" }} /> Réservé</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: 12, height: 12, borderRadius: 3, background: "#FCE3B0" }} /> Demande à valider</span>
      </div>
    </div>
  );
}

const cellBase: React.CSSProperties = {
  border: "1px solid #E4E2DE",
  height: "30px",
  textAlign: "center",
  padding: 0,
};
const navBtn: React.CSSProperties = {
  padding: "6px 14px", border: "1px solid #CEC8BF", background: "transparent",
  borderRadius: "8px", cursor: "pointer", fontSize: "13px", color: "#1C1C1A",
};
