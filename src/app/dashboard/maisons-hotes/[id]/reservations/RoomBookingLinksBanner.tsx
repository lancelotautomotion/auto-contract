"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Link2, ChevronDown, AlertTriangle, Check, Copy, ExternalLink } from "lucide-react";

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
  noMargin?: boolean;
}

const STORAGE_KEY = "kordia.bookingLinksBanner.collapsed";

export default function RoomBookingLinksBanner({ guesthouseId, guesthouseSlug, rooms, noMargin }: Props) {
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
    <div className="form-card" style={{ marginBottom: noMargin ? 0 : "20px", padding: "16px 18px" }}>
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
            <Link2 size={14} strokeWidth={1.4} />
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
        <ChevronDown size={16} strokeWidth={1.5} style={{ color: "var(--ink-lighter)", transition: "transform .15s", transform: collapsed ? "rotate(-90deg)" : "rotate(0)" }} />
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
              <AlertTriangle size={14} strokeWidth={1.5} style={{ flexShrink: 0, marginTop: "1px", color: "#B7791F" }} />
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
                            <Check size={13} strokeWidth={1.6} color="#fff" />
                            Copié !
                          </>
                        ) : (
                          <>
                            <Copy size={13} strokeWidth={1.4} color="#fff" />
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
                        <ExternalLink size={12} strokeWidth={1.4} />
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
