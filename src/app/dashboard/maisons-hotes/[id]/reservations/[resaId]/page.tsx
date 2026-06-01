import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TopbarSignOut from "@/app/dashboard/TopbarSignOut";
import ContractActions from "@/app/dashboard/reservations/[id]/ContractActions";
import { computeTouristTax, nightsBetween } from "@/lib/billing";
import { ChevronLeft, Info, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GuesthouseReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string; resaId: string }>;
}) {
  const { id, resaId } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/dashboard");

  const reservation = await prisma.reservation.findFirst({
    where: { id: resaId, guesthouseId: id, guesthouse: { userId: dbUser.id } },
    include: {
      contract: true,
      guesthouse: true,
      reservationRooms: true,
      meals: true,
    },
  });
  if (!reservation || !reservation.guesthouse) notFound();

  const fmt = (d: Date) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  const fmtMoney = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

  const nights = nightsBetween(reservation.checkIn, reservation.checkOut);
  const adults = reservation.adultsCount ?? 0;
  const mealsTotal = reservation.meals.reduce((s, m) => s + m.unitPrice * m.quantity, 0);
  const roomsTotal = reservation.reservationRooms.reduce((s, r) => s + r.price * nights, 0);
  const touristTaxTotal = computeTouristTax(adults, nights, reservation.touristTax ?? 0);

  const clientName = `${reservation.clientFirstName} ${reservation.clientLastName}`;
  const contractStatus = reservation.contract?.status ?? null;
  const pillLabel =
    reservation.status === "PENDING_REVIEW" ? "En attente" :
    contractStatus === "GENERATED" ? "Contrat généré" :
    contractStatus === "SIGNED" ? "Signé" : "En attente";
  const pillClass =
    reservation.status === "PENDING_REVIEW" ? "pill pill-a pill-lg" :
    contractStatus === "GENERATED" ? "pill pill-v pill-lg" :
    contractStatus === "SIGNED" ? "pill pill-g pill-lg" : "pill pill-a pill-lg";

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-breadcrumb">Kordia / {reservation.guesthouse.name} / Planning & Réservations / <span>{clientName}</span></div>
        </div>
        <div className="topbar-right"><TopbarSignOut /></div>
      </div>

      <div className="content" style={{ maxWidth: "900px" }}>
        <Link href={`/dashboard/maisons-hotes/${id}/reservations`} className="back-link">
          <ChevronLeft size={16} strokeWidth={1.5} />
          Retour aux réservations
        </Link>

        <div className="detail-header">
          <div className="dh-left">
            <h1>{reservation.clientFirstName} <span className="v">{reservation.clientLastName}</span></h1>
            <div className="dh-contact">
              <a href={`mailto:${reservation.clientEmail}`}>{reservation.clientEmail}</a>
              <span>·</span>
              <span>{reservation.clientPhone}</span>
            </div>
          </div>
          <div className="dh-right">
            <span className={pillClass}>{pillLabel}</span>
          </div>
        </div>

        {/* Bandeau PENDING_REVIEW */}
        {reservation.status === "PENDING_REVIEW" && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px",
            background: "#FEF3CD", border: "1px solid #F5C842", borderRadius: "10px",
            padding: "14px 16px", marginBottom: "20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Info size={18} strokeWidth={1.4} style={{ flexShrink: 0, color: "#B7791F" }} />
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#7B4F0A" }}>
                Cette demande est en attente de traitement.
              </div>
            </div>
            <Link
              href={`/dashboard/maisons-hotes/${id}/reservations/${resaId}/complete`}
              className="btn btn-violet"
              style={{ fontSize: "12px", padding: "8px 16px" }}
            >
              Traiter la demande →
            </Link>
          </div>
        )}

        {/* Allergies — badge rouge visible */}
        {reservation.dietaryNotes?.trim() && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", background: "#FDECEC", border: "1px solid #F5B5B5", borderRadius: "10px", padding: "14px 16px", marginBottom: "20px" }}>
            <AlertTriangle size={18} strokeWidth={1.4} style={{ flexShrink: 0, color: "#B91C1C", marginTop: "1px" }} />
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#B91C1C", marginBottom: "4px" }}>Allergies / Régimes spécifiques</div>
              <div style={{ fontSize: "13px", color: "#7F1D1D", lineHeight: 1.5 }}>{reservation.dietaryNotes}</div>
            </div>
          </div>
        )}

        <div className="detail-grid">
          {/* Séjour */}
          <div className="detail-block">
            <div className="db-title">Séjour</div>
            <div className="db-row">
              <div className="db-item"><div className="db-label">Arrivée</div><div className="db-value">{fmt(reservation.checkIn)}</div></div>
              <div className="db-item"><div className="db-label">Départ</div><div className="db-value">{fmt(reservation.checkOut)}</div></div>
              <div className="db-item"><div className="db-label">Nuits</div><div className="db-value">{nights}</div></div>
              <div className="db-item"><div className="db-label">Adultes</div><div className="db-value">{adults || "—"}</div></div>
            </div>
          </div>

          {/* Chambres */}
          <div className="detail-block">
            <div className="db-title">Chambre(s)</div>
            {reservation.reservationRooms.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--ink-lighter)", fontStyle: "italic" }}>Aucune chambre</p>
            ) : (
              <div className="opt-list">
                {reservation.reservationRooms.map((r) => (
                  <div key={r.id} className="opt-item">
                    <div className="opt-name"><span className="opt-dot" />{r.roomName}</div>
                    {r.price > 0 && <span className="opt-price">{fmtMoney(r.price)}/nuit</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Restauration */}
          <div className="detail-block">
            <div className="db-title">Restauration</div>
            {reservation.meals.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--ink-lighter)", fontStyle: "italic" }}>Aucun repas</p>
            ) : (
              <div className="opt-list">
                {reservation.meals.map((m) => (
                  <div key={m.id} className="opt-item">
                    <div className="opt-name"><span className="opt-dot" />{m.label}{m.quantity > 1 ? ` (x${m.quantity})` : ""}</div>
                    {m.unitPrice > 0 && <span className="opt-price">{fmtMoney(m.unitPrice * m.quantity)}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Facturation ventilée */}
          <div className="detail-block">
            <div className="db-title">Facturation</div>
            <div className="db-row">
              <div className="db-item"><div className="db-label">Nuitées</div><div className="db-value">{fmtMoney(roomsTotal)}</div></div>
              <div className="db-item"><div className="db-label">Restauration</div><div className="db-value">{fmtMoney(mealsTotal)}</div></div>
              <div className="db-item"><div className="db-label">Taxe de séjour</div><div className="db-value">{fmtMoney(touristTaxTotal)}</div></div>
              <div className="db-item"><div className="db-label">Loyer (total)</div><div className="db-value big">{reservation.rent != null ? fmtMoney(reservation.rent) : "—"}</div></div>
              <div className="db-item"><div className="db-label">Acompte</div><div className="db-value big">{reservation.deposit != null ? fmtMoney(reservation.deposit) : "—"}</div></div>
            </div>
          </div>
        </div>

        <ContractActions
          reservationId={reservation.id}
          contractStatus={reservation.contract?.status ?? null}
          emailStatus={reservation.contract?.emailStatus ?? null}
          driveFileUrl={reservation.contract?.driveFileUrl ?? null}
          signedAt={reservation.contract?.signedAt ?? null}
          signedByName={reservation.contract?.signedByName ?? null}
          depositReceived={reservation.contract?.depositReceived ?? false}
          createdAt={reservation.createdAt.toISOString()}
          reminderCount={reservation.contract?.reminderCount ?? 0}
          lastReminderAt={reservation.contract?.lastReminderAt ?? null}
        />

        {reservation.notes && (
          <div className="notes-card">
            <div className="notes-title">Notes</div>
            <div className="notes-text">{reservation.notes}</div>
          </div>
        )}
      </div>
    </>
  );
}
