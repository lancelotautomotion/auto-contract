"use client";

import { useState } from "react";
import Link from "next/link";

interface Reservation {
  id: string;
  clientFirstName: string;
  clientLastName: string;
  checkIn: string;
  checkOut: string;
  status: string;
  contractStatus: string | null;
  rent: number | null;
}

interface IcalBlock {
  start: string;
  end: string;
  platform: string;
  label: string;
}

export interface GiteCalendarData {
  id: string;
  name: string;
  color: string;
  reservations: Reservation[];
  icalBlocked: IcalBlock[];
}

const SIGNED_BG   = '#D1EDD4'; const SIGNED_TEXT   = '#2D6A31';
const SENT_BG     = '#DAD7F0'; const SENT_TEXT     = '#5B52B5';
const WAITING_BG  = '#FCE3B0'; const WAITING_TEXT  = '#8C6A00';
const ICAL_BG     = '#E4E2DE'; const ICAL_TEXT     = '#71716E';

const PLATFORM_COLORS: Record<string, string> = {
  airbnb: "#FF385C", abritel: "#1B6BCD", booking: "#003580",
  leboncoin: "#F56B2A", gites_de_france: "#5A8A3B", autre: "#7F77DD",
};
const PLATFORM_LABELS: Record<string, string> = {
  airbnb: "Airbnb", abritel: "Abritel / VRBO", booking: "Booking.com",
  leboncoin: "Leboncoin", gites_de_france: "Gîtes de France", autre: "Autre",
};

function getContractColor(r: Reservation) {
  if (r.contractStatus === 'SIGNED')    return { bg: SIGNED_BG,  text: SIGNED_TEXT };
  if (r.contractStatus === 'GENERATED') return { bg: SENT_BG,    text: SENT_TEXT };
  return                                       { bg: WAITING_BG, text: WAITING_TEXT };
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}
function nightsBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtShort(iso: string) {
  const d = new Date(iso.length === 10 ? iso + 'T12:00:00' : iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}
function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAYS   = ['Lu','Ma','Me','Je','Ve','Sa','Di'];

const STATUS_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  SIGNED:    { label: 'Signé',       bg: SIGNED_BG,  color: SIGNED_TEXT },
  GENERATED: { label: 'Envoyé',      bg: SENT_BG,    color: SENT_TEXT },
  default:   { label: 'En attente',  bg: WAITING_BG, color: WAITING_TEXT },
};

type UnifiedEntry = { gite: GiteCalendarData; reservation?: Reservation; ical?: IcalBlock };

type TooltipData =
  | { kind: 'reservation'; reservation: Reservation; rect: DOMRect }
  | { kind: 'ical'; block: IcalBlock; rect: DOMRect }
  | { kind: 'unified'; entries: UnifiedEntry[]; rect: DOMRect; dateLabel: string };

function tooltipPosition(rect: DOMRect, width: number) {
  const gap = 8;
  let left = rect.left + rect.width / 2 - width / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
  return { left, top: rect.top - gap };
}

function ReservationTooltip({ reservation: r, rect }: { reservation: Reservation; rect: DOMRect }) {
  const nights = nightsBetween(r.checkIn, r.checkOut);
  const initials = `${r.clientFirstName[0]}${r.clientLastName[0]}`.toUpperCase();
  const color = getContractColor(r);
  const statusStyle = STATUS_LABELS[r.contractStatus ?? 'default'] ?? STATUS_LABELS.default;
  const { left, top } = tooltipPosition(rect, 220);
  return (
    <div style={{
      position: 'fixed', top, left, transform: 'translateY(-100%)',
      width: '220px', background: '#fff', border: '1px solid #E8E6E1',
      borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      padding: '14px', zIndex: 9999, pointerEvents: 'none',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    }}>
      <div style={{ position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', width: '10px', height: '10px', background: '#fff', border: '1px solid #E8E6E1', borderTop: 'none', borderLeft: 'none', rotate: '45deg' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: color.bg, color: color.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>{initials}</div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#2C2C2A', lineHeight: 1.2 }}>{r.clientFirstName} {r.clientLastName}</div>
          <div style={{ display: 'inline-flex', marginTop: '3px', background: statusStyle.bg, color: statusStyle.color, fontSize: '10px', fontWeight: 600, borderRadius: '20px', padding: '2px 8px' }}>{statusStyle.label}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
        <div style={{ flex: 1, background: '#F7F4F0', borderRadius: '8px', padding: '7px 10px' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, color: '#A3A3A0', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>Arrivée</div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#2C2C2A' }}>{fmtDate(r.checkIn)}</div>
        </div>
        <div style={{ flex: 1, background: '#F7F4F0', borderRadius: '8px', padding: '7px 10px' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, color: '#A3A3A0', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>Départ</div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#2C2C2A' }}>{fmtDate(r.checkOut)}</div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: '#71716E' }}>{nights} nuit{nights > 1 ? 's' : ''}</span>
        {r.rent != null && <span style={{ fontSize: '13px', fontWeight: 700, color: '#2C2C2A' }}>{r.rent.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>}
      </div>
    </div>
  );
}

function IcalTooltip({ block: b, rect }: { block: IcalBlock; rect: DOMRect }) {
  const nights = nightsBetween(b.start, b.end);
  const platformColor = PLATFORM_COLORS[b.platform] ?? '#7F77DD';
  const platformName  = PLATFORM_LABELS[b.platform]  ?? b.label;
  const { left, top } = tooltipPosition(rect, 200);
  return (
    <div style={{
      position: 'fixed', top, left, transform: 'translateY(-100%)',
      width: '200px', background: '#fff', border: '1px solid #E8E6E1',
      borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      padding: '14px', zIndex: 9999, pointerEvents: 'none',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    }}>
      <div style={{ position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', width: '10px', height: '10px', background: '#fff', border: '1px solid #E8E6E1', borderTop: 'none', borderLeft: 'none', rotate: '45deg' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: platformColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
            <rect x="1" y="1.5" width="10" height="9" rx="1.5" stroke="#fff" strokeWidth="1.1"/>
            <path d="M1 4.5h10" stroke="#fff" strokeWidth="1.1"/>
            <path d="M3.5 1v1.5M8.5 1v1.5" stroke="#fff" strokeWidth="1.1" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#2C2C2A' }}>{platformName}</div>
          <div style={{ fontSize: '10px', color: '#71716E' }}>Déjà réservé</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
        <div style={{ flex: 1, background: '#F7F4F0', borderRadius: '8px', padding: '6px 8px' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, color: '#A3A3A0', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>Du</div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#2C2C2A' }}>{fmtDate(b.start)}</div>
        </div>
        <div style={{ flex: 1, background: '#F7F4F0', borderRadius: '8px', padding: '6px 8px' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, color: '#A3A3A0', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>Au</div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#2C2C2A' }}>{fmtDate(b.end)}</div>
        </div>
      </div>
      <div style={{ fontSize: '11px', color: '#71716E' }}>{nights} nuit{nights > 1 ? 's' : ''}</div>
    </div>
  );
}

function UnifiedTooltip({ entries, rect, dateLabel }: { entries: UnifiedEntry[]; rect: DOMRect; dateLabel: string }) {
  const { left, top } = tooltipPosition(rect, 260);
  return (
    <div style={{
      position: 'fixed', top, left, transform: 'translateY(-100%)',
      width: '260px', background: '#fff', border: '1px solid #E8E6E1',
      borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      padding: '12px 14px', zIndex: 9999, pointerEvents: 'none',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    }}>
      <div style={{ position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', width: '10px', height: '10px', background: '#fff', border: '1px solid #E8E6E1', borderTop: 'none', borderLeft: 'none', rotate: '45deg' }} />
      <div style={{ fontSize: '10px', fontWeight: 700, color: '#A3A3A0', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '10px' }}>{dateLabel}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {entries.map((e, i) => (
          <div key={e.gite.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', paddingTop: i > 0 ? '10px' : 0, borderTop: i > 0 ? '1px solid #F0EDE8' : 'none' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: e.gite.color, flexShrink: 0, marginTop: '3px' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: e.gite.color, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '.04em' }}>{e.gite.name}</div>
              {e.reservation ? (
                <>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#2C2C2A' }}>
                    {e.reservation.clientFirstName} {e.reservation.clientLastName}
                  </div>
                  <div style={{ fontSize: '11px', color: '#71716E', marginTop: '2px' }}>
                    {fmtShort(e.reservation.checkIn)} → {fmtShort(e.reservation.checkOut)}
                    {' · '}{nightsBetween(e.reservation.checkIn, e.reservation.checkOut)} nuits
                  </div>
                </>
              ) : e.ical ? (
                <>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#71716E' }}>
                    {PLATFORM_LABELS[e.ical.platform] ?? e.ical.label}
                  </div>
                  <div style={{ fontSize: '11px', color: '#A3A3A0', marginTop: '2px' }}>
                    {fmtShort(e.ical.start)} → {fmtShort(e.ical.end)}
                  </div>
                </>
              ) : null}
            </div>
            {e.reservation && (
              <div style={{
                flexShrink: 0,
                background: (STATUS_LABELS[e.reservation.contractStatus ?? 'default'] ?? STATUS_LABELS.default).bg,
                color: (STATUS_LABELS[e.reservation.contractStatus ?? 'default'] ?? STATUS_LABELS.default).color,
                fontSize: '10px', fontWeight: 600, borderRadius: '20px', padding: '2px 7px',
              }}>
                {(STATUS_LABELS[e.reservation.contractStatus ?? 'default'] ?? STATUS_LABELS.default).label}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CalendarView({
  reservations,
  icalBlocked = [],
  multiGites,
  currentGiteId,
  activeView: controlledView,
  onActiveViewChange,
  allLabel = 'Tous les hébergements',
  reservationHrefBase,
}: {
  reservations: Reservation[];
  icalBlocked?: IcalBlock[];
  multiGites?: GiteCalendarData[];
  currentGiteId?: string;
  activeView?: string;
  onActiveViewChange?: (view: string) => void;
  allLabel?: string;
  reservationHrefBase?: string;
}) {
  const today = new Date();
  const [baseMonth, setBaseMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const showMultiToggle = multiGites && multiGites.length > 1;
  const [internalView, setInternalView] = useState<'all' | string>(showMultiToggle ? 'all' : (currentGiteId ?? 'all'));

  const activeView = controlledView !== undefined ? controlledView : internalView;
  const setActiveView = (v: string) => {
    if (onActiveViewChange) onActiveViewChange(v);
    else setInternalView(v);
  };

  const isUnified = showMultiToggle && activeView === 'all';

  // Data for current view
  const activeGiteData = showMultiToggle && activeView !== 'all'
    ? multiGites!.find(g => g.id === activeView)
    : null;

  const displayReservations = activeGiteData ? activeGiteData.reservations : reservations;
  const displayIcal = activeGiteData ? activeGiteData.icalBlocked : icalBlocked;

  function getReservationForDay(year: number, month: number, day: number): Reservation | null {
    const date = new Date(year, month, day); date.setHours(12, 0, 0, 0);
    for (const r of displayReservations) {
      const ci = new Date(r.checkIn);  ci.setHours(0, 0, 0, 0);
      const co = new Date(r.checkOut); co.setHours(23, 59, 59, 999);
      if (date >= ci && date <= co) return r;
    }
    return null;
  }

  function getIcalForDay(year: number, month: number, day: number): IcalBlock | null {
    const ds = toDateStr(year, month, day);
    for (const b of displayIcal) {
      if (ds >= b.start && ds < b.end) return b;
    }
    return null;
  }

  function getUnifiedEntriesForDay(year: number, month: number, day: number): UnifiedEntry[] {
    const date = new Date(year, month, day); date.setHours(12, 0, 0, 0);
    const ds = toDateStr(year, month, day);
    const entries: UnifiedEntry[] = [];
    for (const g of multiGites!) {
      let reservation: Reservation | undefined;
      let ical: IcalBlock | undefined;
      for (const r of g.reservations) {
        const ci = new Date(r.checkIn);  ci.setHours(0, 0, 0, 0);
        const co = new Date(r.checkOut); co.setHours(23, 59, 59, 999);
        if (date >= ci && date <= co) { reservation = r; break; }
      }
      if (!reservation) {
        for (const b of g.icalBlocked) {
          if (ds >= b.start && ds < b.end) { ical = b; break; }
        }
      }
      if (reservation || ical) entries.push({ gite: g, reservation, ical });
    }
    return entries;
  }

  const daysInMonth = getDaysInMonth(baseMonth.year, baseMonth.month);
  const firstDay    = getFirstDayOfWeek(baseMonth.year, baseMonth.month);

  return (
    <div>
      {/* Multi-gîte toggle */}
      {showMultiToggle && (
        <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveView('all')}
            style={{
              padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
              border: activeView === 'all' ? '1.5px solid #2C2C2A' : '1.5px solid #E8E6E1',
              background: activeView === 'all' ? '#2C2C2A' : '#fff',
              color: activeView === 'all' ? '#fff' : '#71716E',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
            }}
          >
            {allLabel}
          </button>
          {multiGites!.map(g => (
            <button
              key={g.id}
              onClick={() => setActiveView(g.id)}
              style={{
                padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                border: activeView === g.id ? `1.5px solid ${g.color}` : '1.5px solid #E8E6E1',
                background: activeView === g.id ? g.color : '#fff',
                color: activeView === g.id ? '#fff' : '#71716E',
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: activeView === g.id ? '#fff' : g.color,
                flexShrink: 0,
              }} />
              {g.name}
            </button>
          ))}
        </div>
      )}

      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <button
          onClick={() => setBaseMonth(b => ({ year: b.month === 0 ? b.year - 1 : b.year, month: b.month === 0 ? 11 : b.month - 1 }))}
          style={{ padding: '6px 14px', border: '1px solid #CEC8BF', backgroundColor: 'transparent', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#1C1C1A' }}
        >←</button>
        <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1C1C1A' }}>
          {MONTHS[baseMonth.month]} {baseMonth.year}
        </div>
        <button
          onClick={() => setBaseMonth(b => ({ year: b.month === 11 ? b.year + 1 : b.year, month: (b.month + 1) % 12 }))}
          style={{ padding: '6px 14px', border: '1px solid #CEC8BF', backgroundColor: 'transparent', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#1C1C1A' }}
        >→</button>
      </div>

      {/* Grid */}
      <div style={{ backgroundColor: '#F7F4F0', border: '1px solid #CEC8BF', borderRadius: '10px', padding: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
          {DAYS.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '9px', letterSpacing: '0.1em', color: '#7A7570', paddingBottom: '4px', textTransform: 'uppercase' }}>{d}</div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday = baseMonth.year === today.getFullYear() && baseMonth.month === today.getMonth() && day === today.getDate();

            if (isUnified) {
              const entries = getUnifiedEntriesForDay(baseMonth.year, baseMonth.month, day);
              const hasEntries = entries.length > 0;
              const dateLabel = new Date(baseMonth.year, baseMonth.month, day).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
              return (
                <div
                  key={day}
                  onMouseEnter={hasEntries ? (e) => setTooltip({ kind: 'unified', entries, rect: (e.currentTarget as HTMLElement).getBoundingClientRect(), dateLabel }) : undefined}
                  onMouseLeave={hasEntries ? () => setTooltip(null) : undefined}
                  style={{
                    borderRadius: '6px',
                    background: '#fff',
                    border: isToday ? '1.5px solid #2C2C2A' : '1.5px solid transparent',
                    cursor: hasEntries ? 'pointer' : 'default',
                    padding: '4px 4px 6px',
                    minHeight: '46px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    gap: '2px',
                  }}
                >
                  <div style={{
                    textAlign: 'center', fontSize: '11px',
                    color: isToday ? '#1C1C1A' : '#7A7570',
                    fontWeight: isToday ? 700 : 400,
                    marginBottom: entries.length > 0 ? '3px' : 0,
                  }}>{day}</div>
                  {entries.map(entry => (
                    <div
                      key={entry.gite.id}
                      style={{
                        height: '9px',
                        borderRadius: '4px',
                        background: entry.reservation ? entry.gite.color : ICAL_BG,
                        opacity: entry.ical ? 0.7 : 1,
                        flexShrink: 0,
                      }}
                    />
                  ))}
                </div>
              );
            }

            // Single-gîte mode (original behavior)
            const reservation = getReservationForDay(baseMonth.year, baseMonth.month, day);
            const icalBlock   = !reservation ? getIcalForDay(baseMonth.year, baseMonth.month, day) : null;
            const color       = reservation ? getContractColor(reservation) : icalBlock ? { bg: ICAL_BG, text: ICAL_TEXT } : null;

            const cell = (
              <div
                onMouseEnter={reservation
                  ? (e) => setTooltip({ kind: 'reservation', reservation, rect: (e.currentTarget as HTMLElement).getBoundingClientRect() })
                  : icalBlock
                  ? (e) => setTooltip({ kind: 'ical', block: icalBlock, rect: (e.currentTarget as HTMLElement).getBoundingClientRect() })
                  : undefined}
                onMouseLeave={(reservation || icalBlock) ? () => setTooltip(null) : undefined}
                style={{
                  textAlign: 'center', fontSize: '12px', padding: '4px',
                  borderRadius: '6px', minHeight: '46px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: color?.bg ?? 'transparent',
                  color: color?.text ?? (isToday ? '#1C1C1A' : '#7A7570'),
                  fontWeight: isToday ? 700 : 400,
                  cursor: reservation ? 'pointer' : 'default',
                  border: isToday && !color ? '1.5px solid #1C1C1A' : '1.5px solid transparent',
                  opacity: icalBlock ? 0.8 : 1,
                }}
              >{day}</div>
            );

            const giteId = activeGiteData?.id ?? currentGiteId ?? '';
            const href = reservation
              ? (reservationHrefBase ? `${reservationHrefBase}/${reservation.id}` : `/dashboard/${giteId}/reservations/${reservation.id}`)
              : '';
            return reservation ? (
              <Link key={day} href={href} style={{ textDecoration: 'none' }}>
                {cell}
              </Link>
            ) : (
              <div key={day}>{cell}</div>
            );
          })}
        </div>
      </div>

      {tooltip?.kind === 'reservation' && <ReservationTooltip reservation={tooltip.reservation} rect={tooltip.rect} />}
      {tooltip?.kind === 'ical'         && <IcalTooltip block={tooltip.block} rect={tooltip.rect} />}
      {tooltip?.kind === 'unified'      && <UnifiedTooltip entries={tooltip.entries} rect={tooltip.rect} dateLabel={tooltip.dateLabel} />}
    </div>
  );
}
