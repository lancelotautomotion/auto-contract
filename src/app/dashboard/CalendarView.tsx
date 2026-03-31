"use client";

import { useState } from "react";
import Link from "next/link";

interface Reservation {
  id: string;
  clientFirstName: string;
  clientLastName: string;
  checkIn: string;
  checkOut: string;
  contractStatus: string | null;
}

const SIGNED_BG = '#D1EDD4';
const SIGNED_TEXT = '#2D6A31';
const PENDING_BG = '#FDECD0';
const PENDING_TEXT = '#C47822';

function getColor(status: string | null): { bg: string; text: string } | null {
  if (status === 'SIGNED') return { bg: SIGNED_BG, text: SIGNED_TEXT };
  if (status === 'GENERATED') return { bg: PENDING_BG, text: PENDING_TEXT };
  return null;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Lundi = 0
}

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAYS = ['Lu','Ma','Me','Je','Ve','Sa','Di'];

export default function CalendarView({ reservations, compact }: { reservations: Reservation[]; compact?: boolean }) {
  const today = new Date();
  const [baseMonth, setBaseMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const monthCount = compact ? 1 : 3;
  const months = Array.from({ length: monthCount }, (_, offset) => {
    const m = (baseMonth.month + offset) % 12;
    const y = baseMonth.year + Math.floor((baseMonth.month + offset) / 12);
    return { year: y, month: m };
  });

  function getReservationForDay(year: number, month: number, day: number): Reservation | null {
    const date = new Date(year, month, day);
    date.setHours(12, 0, 0, 0);
    for (const r of reservations) {
      const checkIn = new Date(r.checkIn);
      const checkOut = new Date(r.checkOut);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(23, 59, 59, 999);
      if (date >= checkIn && date <= checkOut) return r;
    }
    return null;
  }

  return (
    <div>
      {/* Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setBaseMonth(b => {
              const m = b.month === 0 ? 11 : b.month - 1;
              const y = b.month === 0 ? b.year - 1 : b.year;
              return { year: y, month: m };
            })}
            style={{ width: '28px', height: '28px', border: '1px solid #E5E0D8', backgroundColor: 'transparent', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#1A1A14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ←
          </button>
          <span style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1A1A14', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
            {MONTHS[baseMonth.month]} {baseMonth.year}
          </span>
          <button
            onClick={() => setBaseMonth(b => {
              const m = (b.month + 1) % 12;
              const y = b.month === 11 ? b.year + 1 : b.year;
              return { year: y, month: m };
            })}
            style={{ width: '28px', height: '28px', border: '1px solid #E5E0D8', backgroundColor: 'transparent', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#1A1A14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            →
          </button>
        </div>
        {!compact && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: SIGNED_TEXT }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: SIGNED_BG, border: `1px solid ${SIGNED_TEXT}`, display: 'inline-block' }} />
              Signé
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: PENDING_TEXT }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: PENDING_BG, border: `1px solid ${PENDING_TEXT}`, display: 'inline-block' }} />
              En attente
            </span>
          </div>
        )}
      </div>

      {/* Grille mois */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${monthCount}, 1fr)`, gap: '16px' }}>
        {months.map(({ year, month }) => {
          const daysInMonth = getDaysInMonth(year, month);
          const firstDay = getFirstDayOfWeek(year, month);

          return (
            <div key={`${year}-${month}`} style={{ backgroundColor: '#F7F4F0', border: '1px solid #CEC8BF', borderRadius: '10px', padding: '16px' }}>
              <p style={{ fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7A7570', marginBottom: '12px', textAlign: 'center' }}>
                {MONTHS[month]} {year}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                {DAYS.map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: '9px', letterSpacing: '0.1em', color: '#7A7570', paddingBottom: '4px', textTransform: 'uppercase' }}>{d}</div>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const reservation = getReservationForDay(year, month, day);
                  const color = reservation ? getColor(reservation.contractStatus) : null;
                  const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();

                  const cell = (
                    <div
                      title={reservation ? `${reservation.clientFirstName} ${reservation.clientLastName} (${new Date(reservation.checkIn).toLocaleDateString('fr-FR')} → ${new Date(reservation.checkOut).toLocaleDateString('fr-FR')})` : undefined}
                      style={{
                        textAlign: 'center', fontSize: '11px', padding: '4px 2px',
                        borderRadius: '4px',
                        backgroundColor: color?.bg ?? 'transparent',
                        color: color?.text ?? (isToday ? '#1C1C1A' : '#7A7570'),
                        fontWeight: isToday ? 700 : 400,
                        cursor: reservation ? 'pointer' : 'default',
                        border: isToday && !color ? '1px solid #1C1C1A' : '1px solid transparent',
                      }}
                    >
                      {day}
                    </div>
                  );

                  return reservation ? (
                    <Link key={day} href={`/dashboard/reservations/${reservation.id}`} style={{ textDecoration: 'none' }}>
                      {cell}
                    </Link>
                  ) : (
                    <div key={day}>{cell}</div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
