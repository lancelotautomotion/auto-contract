"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import { Check, CalendarDays, User, Home, Utensils, MessageSquare, Moon, AlertTriangle, Info, ArrowRight, Shield, Lock, Clock } from "lucide-react";

type MealService = "BREAKFAST" | "LUNCH" | "DINNER" | "OTHER";
interface MealOption { id: string; name: string; description: string | null; price: number; service: MealService; }
interface IcalBlock { start: string; end: string; platform: string; label: string; }

interface Props {
  guesthouseSlug: string;
  roomSlug: string;
  guesthouseName: string;
  guesthouseCity?: string | null;
  guesthouseLogoUrl?: string | null;
  roomName: string;
  roomCapacity: number;
  roomPrice: number;
  meals: MealOption[];
  icalBlocked?: IcalBlock[];
}

function countNights(a: string, b: string) {
  if (!a || !b) return 0;
  const diff = Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
  return diff > 0 ? diff : 0;
}
function fmtDate(d: string) {
  if (!d) return "—";
  return new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}
const fmtMoney = (n: number) => `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

// Services soumis à la capacité table d'hôtes
const CAPACITY_SERVICES = new Set<MealService>(["BREAKFAST", "LUNCH", "DINNER"]);

export default function GuesthouseRoomBookingForm({
  guesthouseSlug, roomSlug, guesthouseName, guesthouseCity, guesthouseLogoUrl,
  roomName, roomCapacity, roomPrice, meals, icalBlocked = [],
}: Props) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Petit-dejeuner obligatoire (D.324-13 du Code du tourisme) : on pre-coche le
  // premier petit-dejeuner configure si l'hote en a au moins un. Le client peut
  // basculer vers une autre formule mais ne peut pas tout deselectionner.
  const breakfastMeals = useMemo(() => meals.filter((m) => m.service === "BREAKFAST"), [meals]);
  const defaultBreakfastId = breakfastMeals[0]?.id ?? null;
  const [selectedMeals, setSelectedMeals] = useState<Set<string>>(
    () => new Set(defaultBreakfastId ? [defaultBreakfastId] : []),
  );
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", zipCode: "",
    checkIn: "", checkOut: "",
    guestCount: "",
    allergies: "",
    notes: "",
    gdprConsent: false,
    website: "",
  });

  // Capacité table d'hôtes — fetché quand les dates changent
  const [mealCapacity, setMealCapacity] = useState<{ capacity: number; booked: Record<string, number> } | null>(null);
  const fetchRef = useRef<AbortController | null>(null);

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  const today = new Date().toISOString().split("T")[0];
  const nights = useMemo(() => countNights(form.checkIn, form.checkOut), [form.checkIn, form.checkOut]);
  const guests = parseInt(form.guestCount) || 0;

  // Fetch meal availability whenever dates are valid
  useEffect(() => {
    if (!form.checkIn || !form.checkOut || form.checkIn >= form.checkOut) {
      setMealCapacity(null);
      return;
    }
    fetchRef.current?.abort();
    const ctrl = new AbortController();
    fetchRef.current = ctrl;
    fetch(`/api/book/${guesthouseSlug}/meal-availability?checkIn=${form.checkIn}&checkOut=${form.checkOut}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => setMealCapacity(data))
      .catch(() => { /* ignore abort */ });
    return () => ctrl.abort();
  }, [form.checkIn, form.checkOut, guesthouseSlug]);

  const icalConflicts = useMemo(() => {
    if (!form.checkIn || !form.checkOut) return [];
    return icalBlocked.filter((b) => b.start < form.checkOut && b.end > form.checkIn);
  }, [form.checkIn, form.checkOut, icalBlocked]);

  // Per meal: is it disabled due to capacity?
  const mealDisabled = useMemo((): Record<string, { disabled: boolean; reason: string }> => {
    const result: Record<string, { disabled: boolean; reason: string }> = {};
    if (!mealCapacity || mealCapacity.capacity <= 0 || guests <= 0) return result;
    for (const m of meals) {
      if (!CAPACITY_SERVICES.has(m.service)) continue;
      const alreadyBooked = mealCapacity.booked[m.service] ?? 0;
      const remaining = mealCapacity.capacity - alreadyBooked;
      if (remaining < guests) {
        result[m.id] = {
          disabled: true,
          reason: remaining <= 0
            ? "Table d'hôtes complète pour ces dates"
            : `Capacité insuffisante pour ${guests} personne${guests > 1 ? "s" : ""} (${remaining} couvert${remaining > 1 ? "s" : ""} restant${remaining > 1 ? "s" : ""})`,
        };
      }
    }
    return result;
  }, [mealCapacity, guests, meals]);

  const toggleMeal = (id: string) => {
    if (mealDisabled[id]?.disabled) return;
    const meal = meals.find((m) => m.id === id);
    if (!meal) return;
    setSelectedMeals((prev) => {
      const next = new Set(prev);
      // Petit-dejeuner : comportement radio. Cliquer sur un PDJ deja selectionne
      // ne le decoche pas (obligatoire) ; cliquer sur un autre PDJ remplace la
      // selection courante.
      if (meal.service === "BREAKFAST") {
        if (next.has(id)) return prev; // pas de decochage
        for (const other of breakfastMeals) next.delete(other.id);
        next.add(id);
        return next;
      }
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Uncheck meals that became disabled when guest count or dates change.
  // Pour le petit-dejeuner, si l'option pre-selectionnee devient indisponible
  // (capacite table d'hote saturee), on bascule automatiquement sur la premiere
  // autre formule petit-dejeuner disponible plutot que de tout decocher.
  useEffect(() => {
    const toRemove = Array.from(selectedMeals).filter((id) => mealDisabled[id]?.disabled);
    if (toRemove.length === 0) return;
    setSelectedMeals((prev) => {
      const next = new Set(prev);
      toRemove.forEach((id) => next.delete(id));
      const hasBreakfast = Array.from(next).some((id) => meals.find((m) => m.id === id)?.service === "BREAKFAST");
      if (!hasBreakfast) {
        const fallback = breakfastMeals.find((m) => !mealDisabled[m.id]?.disabled);
        if (fallback) next.add(fallback.id);
      }
      return next;
    });
  }, [mealDisabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const chosenMeals = meals.filter((m) => selectedMeals.has(m.id));
  // Quantite par repas : un petit-dejeuner est servi a chaque personne et a
  // chaque nuit du sejour ; les autres formules restent factu rees par personne.
  const qtyForMeal = (service: MealService): number => {
    const g = guests > 0 ? guests : 0;
    if (service === "BREAKFAST") return g * Math.max(0, nights);
    return g;
  };
  const lodging = roomPrice * nights;
  const mealsTotal = chosenMeals.reduce((s, m) => s + m.price * Math.max(1, qtyForMeal(m.service)), 0);
  const total = lodging + mealsTotal;
  const overCapacity = guests > 0 && guests > roomCapacity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.gdprConsent) return;
    if (nights <= 0) { setError("La date de départ doit être postérieure à la date d'arrivée."); return; }
    if (overCapacity) { setError(`Cette chambre accueille au maximum ${roomCapacity} personne${roomCapacity > 1 ? "s" : ""}.`); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/book/${guesthouseSlug}/${roomSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, selectedMealIds: Array.from(selectedMeals), allergies: form.allergies }),
      });
      if (res.ok) setStep("success");
      else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Une erreur est survenue. Veuillez réessayer.");
      }
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "success") {
    return (
      <div className="book-success">
        <div className="book-success-check">
          <Check size={32} strokeWidth={2.5} color="#4A7353" />
        </div>
        <h2>Demande <span className="g">envoyée !</span></h2>
        <p className="book-success-lead">
          Votre demande pour la chambre <strong>{roomName}</strong> à <strong>{guesthouseName}</strong> a bien été reçue.
        </p>
        {form.checkIn && form.checkOut && nights > 0 && (
          <div className="book-success-dates">
            <CalendarDays size={14} strokeWidth={1.4} color="#7F77DD" />
            {fmtDate(form.checkIn)} → {fmtDate(form.checkOut)}
            <span className="book-success-nights">· {nights} nuit{nights > 1 ? "s" : ""}</span>
          </div>
        )}
        <div className="book-success-steps">
          <div className="book-success-step">
            <div className="bss-num v">1</div>
            <div className="bss-body">
              <strong>Confirmation par le gérant</strong>
              <span>Il examine votre demande et vous contacte sous 24h.</span>
            </div>
          </div>
          <div className="book-success-step">
            <div className="bss-num">2</div>
            <div className="bss-body">
              <strong>Signature du contrat</strong>
              <span>Vous recevez le contrat par email pour signature électronique eIDAS.</span>
            </div>
          </div>
          <div className="book-success-step">
            <div className="bss-num">3</div>
            <div className="bss-body">
              <strong>Séjour confirmé</strong>
              <span>Après signature et réception de l&apos;acompte, votre chambre est réservée.</span>
            </div>
          </div>
        </div>
        <button type="button" onClick={() => setStep("form")} className="book-reset-btn">
          Faire une autre demande
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Honeypot anti-spam */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}>
        <label htmlFor="website">Site web</label>
        <input id="website" type="text" name="website" value={form.website} onChange={(e) => set("website", e.target.value)} tabIndex={-1} autoComplete="off"/>
      </div>

      <div className="book-layout">
        <div className="book-form-col">

          {/* Chambre */}
          <div className="book-fs">
            <div className="book-fs-title">
              <Home size={14} strokeWidth={1.4} />
              Votre chambre
            </div>
            <div className="book-fs-divider"/>
            <div className="book-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--ink)" }}>{roomName}</div>
                  <div style={{ fontSize: "13px", color: "var(--violet)", marginTop: "2px" }}>
                    Chambre entière · jusqu&apos;à {roomCapacity} personne{roomCapacity > 1 ? "s" : ""}
                  </div>
                </div>
                {roomPrice > 0 && (
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--green)", flexShrink: 0 }}>
                    {roomPrice} € <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--ink-lighter)" }}>/ nuit</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Informations personnelles */}
          <div className="book-fs">
            <div className="book-fs-title">
              <User size={14} strokeWidth={1.4} />
              Vos informations
            </div>
            <div className="book-fs-divider"/>
            <div className="book-card">
              <div className="book-row">
                <div className="book-group">
                  <label className="book-label">Prénom <span className="req">*</span></label>
                  <input className="book-input" type="text" placeholder="Votre prénom" required value={form.firstName} onChange={(e) => set("firstName", e.target.value)}/>
                </div>
                <div className="book-group">
                  <label className="book-label">Nom <span className="req">*</span></label>
                  <input className="book-input" type="text" placeholder="Votre nom" required value={form.lastName} onChange={(e) => set("lastName", e.target.value)}/>
                </div>
              </div>
              <div className="book-row">
                <div className="book-group">
                  <label className="book-label">Email <span className="req">*</span></label>
                  <input className="book-input" type="email" placeholder="vous@exemple.com" required value={form.email} onChange={(e) => set("email", e.target.value)}/>
                </div>
                <div className="book-group">
                  <label className="book-label">Téléphone <span className="req">*</span></label>
                  <input className="book-input" type="tel" placeholder="06 12 34 56 78" required value={form.phone} onChange={(e) => set("phone", e.target.value)}/>
                </div>
              </div>
              <div className="book-group">
                <label className="book-label">Adresse <span className="req">*</span></label>
                <input className="book-input" type="text" placeholder="Numéro et nom de rue" required value={form.address} onChange={(e) => set("address", e.target.value)}/>
              </div>
              <div className="book-row">
                <div className="book-group">
                  <label className="book-label">Ville <span className="req">*</span></label>
                  <input className="book-input" type="text" placeholder="Ville" required value={form.city} onChange={(e) => set("city", e.target.value)}/>
                </div>
                <div className="book-group">
                  <label className="book-label">Code postal <span className="req">*</span></label>
                  <input className="book-input" type="text" placeholder="75001" required value={form.zipCode} onChange={(e) => set("zipCode", e.target.value)}/>
                </div>
              </div>
            </div>
          </div>

          {/* Dates + nombre de personnes */}
          <div className="book-fs">
            <div className="book-fs-title">
              <CalendarDays size={14} strokeWidth={1.4} />
              Dates souhaitées
            </div>
            <div className="book-fs-divider"/>
            <div className="book-card">
              <div className="book-row">
                <div className="book-group">
                  <label className="book-label">Arrivée <span className="req">*</span></label>
                  <input
                    className="book-date" type="date" required min={today} value={form.checkIn}
                    onChange={(e) => { set("checkIn", e.target.value); if (form.checkOut && e.target.value >= form.checkOut) set("checkOut", ""); }}
                  />
                </div>
                <div className="book-group">
                  <label className="book-label">Départ <span className="req">*</span></label>
                  <input
                    className="book-date" type="date" required
                    min={form.checkIn ? new Date(new Date(form.checkIn).getTime() + 86400000).toISOString().slice(0, 10) : today}
                    value={form.checkOut}
                    onChange={(e) => set("checkOut", e.target.value)}
                  />
                </div>
              </div>
              {nights > 0 && (
                <div className="book-nights-badge">
                  <Moon size={12} strokeWidth={1.4} color="#7F77DD" />
                  {nights} nuit{nights > 1 ? "s" : ""}
                </div>
              )}
              {icalConflicts.length > 0 && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", background: "#FEF3CD", border: "1px solid #F5C842", borderRadius: "10px", padding: "12px 14px", marginTop: "10px" }}>
                  <AlertTriangle size={16} strokeWidth={1.4} style={{ flexShrink: 0, color: "#B7791F", marginTop: "1px" }} />
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#7B4F0A", marginBottom: "2px" }}>Ces dates sont peut-être déjà prises</div>
                    <div style={{ fontSize: "11.5px", color: "#92610E", lineHeight: 1.5 }}>
                      Le gérant a des réservations sur cette période via une autre plateforme. Vous pouvez tout de même envoyer votre demande — il vous confirmera la disponibilité.
                    </div>
                  </div>
                </div>
              )}
              <div className="book-group" style={{ marginTop: "14px" }}>
                <label className="book-label">Nombre de personnes <span className="req">*</span></label>
                <input
                  className="book-input" type="number" min="1" max={roomCapacity} required placeholder="2"
                  value={form.guestCount}
                  onChange={(e) => set("guestCount", e.target.value)}
                />
                {overCapacity && (
                  <p style={{ fontSize: "12px", color: "#B7791F", margin: "6px 0 0" }}>
                    Cette chambre accueille au maximum {roomCapacity} personne{roomCapacity > 1 ? "s" : ""}.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Restauration */}
          {meals.length > 0 && (
            <div className="book-fs">
              <div className="book-fs-title">
                <Utensils size={14} strokeWidth={1.7} />
                Restauration
              </div>
              <div className="book-fs-divider"/>
              {breakfastMeals.length > 0 && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", background: "#EFEDFC", border: "1px solid #DAD7F0", borderRadius: "10px", padding: "10px 12px", marginBottom: "12px" }}>
                  <Info size={14} strokeWidth={1.5} color="#5B52B5" style={{ flexShrink: 0, marginTop: "1px" }} />
                  <div style={{ fontSize: "12px", color: "#3F3A8C", lineHeight: 1.5 }}>
                    Le petit-déjeuner est inclus dans la prestation chambres d&apos;hôtes et servi tous les matins du séjour. Vous pouvez choisir la formule qui vous convient.
                  </div>
                </div>
              )}
              <div className="book-opts">
                {meals.map((m) => {
                  const checked = selectedMeals.has(m.id);
                  const cap = mealDisabled[m.id];
                  const isDisabled = cap?.disabled ?? false;
                  const isBreakfast = m.service === "BREAKFAST";
                  // Petit-dejeuner deja coche : verrouille (radio obligatoire)
                  const isLocked = isBreakfast && checked;
                  return (
                    <div
                      key={m.id}
                      className={`book-opt${checked ? " checked" : ""}${isDisabled ? " disabled" : ""}`}
                      onClick={() => toggleMeal(m.id)}
                      role={isBreakfast ? "radio" : "checkbox"}
                      aria-checked={checked}
                      aria-disabled={isDisabled}
                      tabIndex={isDisabled ? -1 : 0}
                      onKeyDown={(e) => !isDisabled && e.key === " " && (e.preventDefault(), toggleMeal(m.id))}
                      style={isDisabled ? { opacity: 0.55, cursor: "not-allowed", pointerEvents: "none" } : undefined}
                    >
                      <div className="book-opt-box" style={isDisabled ? { borderColor: "#D0CEC8", background: "#F3F2EE" } : undefined}>
                        {checked && !isDisabled && (
                          <Check size={10} strokeWidth={1.5} color="#fff" />
                        )}
                      </div>
                      <span className="book-opt-name">
                        {m.name}
                        {isBreakfast && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", marginLeft: "8px", fontSize: "10px", fontWeight: 700, color: "#5B52B5", background: "#EFEDFC", padding: "1px 7px", borderRadius: "20px", verticalAlign: "middle" }}>
                            {isLocked && <Lock size={9} strokeWidth={1.7} />}
                            Obligatoire
                          </span>
                        )}
                        {m.description && (
                          <span style={{ display: "block", fontSize: "11.5px", fontWeight: 400, color: "var(--ink-lighter)", marginTop: "2px" }}>
                            {m.description}
                          </span>
                        )}
                        {isDisabled && (
                          <span style={{ display: "block", fontSize: "11px", fontWeight: 500, color: "#B7791F", marginTop: "3px" }}>
                            {cap.reason}
                          </span>
                        )}
                      </span>
                      {m.price > 0
                        ? <span className="book-opt-price">+{m.price} € <span style={{ fontWeight: 400, fontSize: "10px" }}>/ pers.{isBreakfast ? " / nuit" : ""}</span></span>
                        : <span className="book-opt-price">Inclus</span>
                      }
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Allergies */}
          <div className="book-fs">
            <div className="book-fs-title">
              <AlertTriangle size={14} strokeWidth={1.4} />
              Allergies / régimes alimentaires (optionnel)
            </div>
            <div className="book-fs-divider"/>
            <div className="book-card">
              <p style={{ fontSize: "13px", color: "var(--ink-lighter)", margin: "0 0 10px", lineHeight: 1.5 }}>
                Indiquez ici toute allergie ou intolérance alimentaire. Ces informations seront transmises au gérant.
              </p>
              <textarea
                className="book-textarea"
                placeholder="Ex. Allergie aux fruits de mer, intolérance au lactose, végétarien…"
                value={form.allergies}
                onChange={(e) => set("allergies", e.target.value)}
              />
            </div>
          </div>

          {/* Message général */}
          <div className="book-fs">
            <div className="book-fs-title">
              <MessageSquare size={14} strokeWidth={1.4} />
              Message (optionnel)
            </div>
            <div className="book-fs-divider"/>
            <div className="book-card">
              <p style={{ fontSize: "13px", color: "var(--ink-lighter)", margin: "0 0 10px", lineHeight: 1.5 }}>
                Heure d&apos;arrivée estimée ou toute autre demande particulière.
              </p>
              <textarea
                className="book-textarea"
                placeholder="Ex. Arrivée prévue vers 17h…"
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </div>
          </div>

        </div>

        {/* ── COLONNE RÉCAP ── */}
        <aside className="book-recap-col">
          <div className="book-recap-card">
            {guesthouseLogoUrl ? (
              <div className="book-recap-logo">
                <Image src={guesthouseLogoUrl} alt={guesthouseName} width={200} height={56} style={{ height: 32, width: "auto", objectFit: "contain" }} unoptimized/>
              </div>
            ) : (
              <div className="book-recap-gite-name">{guesthouseName}</div>
            )}
            {guesthouseCity && <div className="book-recap-gite-city">{guesthouseCity}</div>}

            <div style={{ marginTop: "12px", padding: "12px 14px", background: "var(--line-light)", borderRadius: "10px", border: "1px solid var(--line)" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)", marginBottom: "4px" }}>
                Chambre {roomName}
              </div>
              <div style={{ fontSize: "12px", color: "var(--ink-soft)" }}>
                Jusqu&apos;à {roomCapacity} personne{roomCapacity > 1 ? "s" : ""}
                {roomPrice > 0 && <> · {roomPrice} € / nuit</>}
              </div>
            </div>

            <div className="book-recap-sep"/>

            <div className="book-recap-row">
              <span className="book-recap-label">Arrivée</span>
              <span className="book-recap-val">{form.checkIn ? fmtDate(form.checkIn) : "—"}</span>
            </div>
            <div className="book-recap-row">
              <span className="book-recap-label">Départ</span>
              <span className="book-recap-val">{form.checkOut ? fmtDate(form.checkOut) : "—"}</span>
            </div>
            <div className="book-recap-row">
              <span className="book-recap-label">Voyageurs</span>
              <span className="book-recap-val">{form.guestCount || "—"}</span>
            </div>
            {nights > 0 && (
              <div className="book-recap-nights">
                <Moon size={12} strokeWidth={1.4} color="#7F77DD" />
                {nights} nuit{nights > 1 ? "s" : ""}
              </div>
            )}

            {(nights > 0 || chosenMeals.length > 0) && (
              <>
                <div className="book-recap-sep"/>
                {nights > 0 && roomPrice > 0 && (
                  <div className="book-recap-row">
                    <span className="book-recap-label">Nuitées ({nights})</span>
                    <span className="book-recap-val">{fmtMoney(lodging)}</span>
                  </div>
                )}
                {chosenMeals.map((m) => {
                  const qty = Math.max(1, qtyForMeal(m.service));
                  const lineTotal = m.price * qty;
                  const isBreakfast = m.service === "BREAKFAST";
                  const detail = isBreakfast
                    ? (guests > 0 && nights > 0 ? ` × ${nights} nuit${nights > 1 ? "s" : ""} × ${guests} pers.` : "")
                    : (guests > 0 ? ` × ${guests} pers.` : "");
                  return (
                    <div className="book-recap-row" key={m.id}>
                      <span className="book-recap-label">
                        {m.name}
                        {detail && (
                          <span style={{ fontSize: "11px", color: "var(--ink-lighter)", fontWeight: 400 }}>{detail}</span>
                        )}
                      </span>
                      <span className="book-recap-val">{m.price > 0 ? `+${fmtMoney(lineTotal)}` : "Inclus"}</span>
                    </div>
                  );
                })}
                {total > 0 && (
                  <div className="book-recap-row" style={{ fontWeight: 700, marginTop: "4px" }}>
                    <span className="book-recap-label" style={{ fontWeight: 700, color: "var(--ink)" }}>Estimation</span>
                    <span className="book-recap-val" style={{ color: "var(--green)" }}>{fmtMoney(total)}</span>
                  </div>
                )}
              </>
            )}

            <div className="book-recap-sep"/>
            <div className="book-recap-notice">
              <Info size={13} strokeWidth={1.4} color="#7F77DD" />
              Les tarifs sont confirmés par le gérant.
            </div>

            <div className="book-recap-trust">
              <div className="book-trust-item">
                <Shield size={11} strokeWidth={1.4} color="#A3A3A0" />
                Données sécurisées
              </div>
              <div className="book-trust-item">
                <Check size={11} strokeWidth={1.4} color="#A3A3A0" />
                Signature eIDAS
              </div>
              <div className="book-trust-item">
                <Clock size={11} strokeWidth={1.4} color="#A3A3A0" />
                Réponse sous 24h
              </div>
            </div>
          </div>
        </aside>

        {/* ── COLONNE FINALE — consentement + bouton ── */}
        <div className="book-final-col">
          <div className="book-consent">
            <input type="checkbox" id="rgpd" required checked={form.gdprConsent} onChange={(e) => set("gdprConsent", e.target.checked)}/>
            <label htmlFor="rgpd">
              J&apos;accepte que mes données personnelles soient utilisées pour le traitement de ma demande conformément à la politique de confidentialité. <span className="req">*</span>
            </label>
          </div>

          {error && <div className="book-error">{error}</div>}

          <button className="btn-book-submit" type="submit" disabled={loading || !form.gdprConsent}>
            {loading ? (
              <span className="book-spinner"/>
            ) : (
              <>
                Envoyer ma demande
                <ArrowRight size={16} strokeWidth={1.5} color="#fff" />
              </>
            )}
          </button>
          <div className="book-submit-note">
            <Lock size={13} strokeWidth={1.4} color="#A3A3A0" />
            Aucun paiement requis à cette étape.
          </div>
        </div>

      </div>
    </form>
  );
}
