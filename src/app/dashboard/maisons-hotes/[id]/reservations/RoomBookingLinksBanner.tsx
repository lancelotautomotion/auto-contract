"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface RoomLink {
  id: string;
  name: string;
  slug: string | null;
  capacity: number;
  basePrice: number;
  color: string;
}

interface Props {
  guesthouseId: string;
  guesthouseSlug: string | null;
  rooms: RoomLink[];
}

const STORAGE_KEY = "kordia.bookingLinksBanner.collapsed";

export default function RoomBookingLinksBanner({ guesthouseId, guesthouseSlug, rooms }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [origin, setOrigin] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "1") setCollapsed(true);
    } catch { /* localStorage indisponible */ }
  }, []);

  const toggle = () => {
    setCollapsed((c) => {
      const next = !c;
      try { localStorage.setItem(STORAGE_KEY, next ? "1" : "0"); } catch { /* noop */ }
      return next;
    });
  };

  const baseOrigin = origin || "https://kordia.fr";
  const urlFor = (room: RoomLink) =>
    guesthouseSlug && room.slug ? `${baseOrigin}/book/${guesthouseSlug}/${room.slug}` : "";

  const copyUrl = async (room: RoomLink) => {
    const url = urlFor(room);
    if (!url) return;
    try {
      await navigator.clipboard?.writeText(url);
      setCopiedId(room.id);
      setTimeout(() => setCopiedId((c) => (c === room.id ? null : c)), 2000);
    } catch { /* clipboard indispo */ }
  };

  if (rooms.length === 0) return null;

  // État global : aucune chambre n'est réservable car le préfixe d'établissement manque
  const missingGuesthouseSlug = !guesthouseSlug;

  return (
    <div className="form-card" style={{ marginBottom: "20px", padding: "16px 18px" }}>
      <button
        type="button"
        onClick={toggle}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%", background: "transparent", border: "none", padding: 0,
          cursor: "pointer", fontFamily: "inherit", textAlign: "left",
        }}
        aria-expanded={!collapsed}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "28px", height: "28px", borderRadius: "8px",
            background: "#EFEDFC", color: "#5B52B5", flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5.5 8.5L4 10a2.5 2.5 0 11-3.5-3.5L2 5"/>
              <path d="M8.5 5.5L10 4a2.5 2.5 0 113.5 3.5L12 9"/>
              <path d="M5 9l4-4"/>
            </svg>
          </span>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)" }}>
              Liens de réservation
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--ink-lighter)", marginTop: "1px" }}>
              Copiez l&apos;URL d&apos;une chambre pour la transmettre à un client.
            </div>
          </div>
        </div>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ color: "var(--ink-lighter)", transition: "transform .15s", transform: collapsed ? "rotate(-90deg)" : "rotate(0)" }}
        >
          <path d="M4 6l4 4 4-4"/>
        </svg>
      </button>

      {!collapsed && (
        <div style={{ marginTop: "12px" }}>
          {missingGuesthouseSlug && (
            <div style={{
              fontSize: "12.5px", color: "#7B4F0A",
              background: "#FEF3CD", border: "1px solid #F5C842",
              borderRadius: "10px", padding: "10px 12px", marginBottom: "10px",
              display: "flex", gap: "10px", alignItems: "flex-start",
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#B7791F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "1px" }}>
                <path d="M7 1.5L13 12.5H1L7 1.5z"/>
                <path d="M7 6v3.5"/>
                <circle cx="7" cy="11" r="0.5" fill="#B7791F"/>
              </svg>
              <div>
                Définissez le préfixe d&apos;URL de votre établissement pour activer les liens de réservation.{" "}
                <Link href={`/dashboard/maisons-hotes/${guesthouseId}/hebergement`} style={{ color: "#5B52B5", fontWeight: 700, textDecoration: "none" }}>
                  Aller dans Mon hébergement →
                </Link>
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {rooms.map((room) => {
              const url = urlFor(room);
              const ready = !!url;
              const copied = copiedId === room.id;
              return (
                <div
                  key={room.id}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "10px 12px", borderRadius: "10px",
                    background: ready ? "#FFFFFF" : "#FAF9F6",
                    border: "1px solid #EFEDE8",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{
                    width: "10px", height: "10px", borderRadius: "50%",
                    background: room.color, flexShrink: 0,
                  }} aria-hidden="true"/>
                  <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)" }}>
                      {room.name}
                      <span style={{ fontWeight: 500, color: "var(--ink-lighter)", marginLeft: "6px" }}>
                        · {room.capacity} pers.{room.basePrice > 0 ? ` · ${room.basePrice} €/n` : ""}
                      </span>
                    </div>
                    {ready ? (
                      <div style={{
                        fontSize: "11.5px", color: "#5B52B5", marginTop: "2px",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {url}
                      </div>
                    ) : (
                      <div style={{ fontSize: "11.5px", color: "var(--ink-lighter)", marginTop: "2px", fontStyle: "italic" }}>
                        {missingGuesthouseSlug ? "En attente du préfixe d'établissement." : "Identifiant d'URL non défini."}
                      </div>
                    )}
                  </div>
                  {ready ? (
                    <>
                      <button
                        type="button"
                        onClick={() => copyUrl(room)}
                        className={`btn ${copied ? "btn-green" : "btn-violet"}`}
                        style={{ fontSize: "12px", padding: "7px 14px", flexShrink: 0 }}
                      >
                        {copied ? (
                          <>
                            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7l3 3 6-6"/></svg>
                            Copié !
                          </>
                        ) : (
                          <>
                            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="1.4"><rect x="1.5" y="4.5" width="8" height="8" rx="1.5"/><path d="M4.5 4.5V3A1.5 1.5 0 016 1.5h6A1.5 1.5 0 0113.5 3v6A1.5 1.5 0 0112 10.5h-1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            Copier
                          </>
                        )}
                      </button>
                      <a
                        href={url} target="_blank" rel="noreferrer"
                        className="btn btn-outline"
                        style={{ fontSize: "12px", padding: "7px 12px", flexShrink: 0 }}
                        title="Ouvrir dans un nouvel onglet"
                      >
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 3H3.5A1.5 1.5 0 002 4.5v6A1.5 1.5 0 003.5 12h6A1.5 1.5 0 0011 10.5V8"/>
                          <path d="M8.5 2H12v3.5"/>
                          <path d="M6 8l6-6"/>
                        </svg>
                        Ouvrir
                      </a>
                    </>
                  ) : (
                    <Link
                      href={`/dashboard/maisons-hotes/${guesthouseId}/hebergement`}
                      className="btn btn-outline"
                      style={{ fontSize: "12px", padding: "7px 14px", flexShrink: 0 }}
                    >
                      Configurer
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
