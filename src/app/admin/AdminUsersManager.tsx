"use client";

import { useState, useTransition } from "react";
import { Trash2, AlertTriangle } from "lucide-react";

export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  planStatus: string;
  createdAt: string;
  gitesCount: number;
  hasStripe: boolean;
}

export default function AdminUsersManager({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("ALL");
  const [toDelete, setToDelete] = useState<AdminUser | null>(null);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = users.filter(u => {
    const matchPlan = planFilter === "ALL" || u.planStatus === planFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || u.email.toLowerCase().includes(q) || (u.name ?? "").toLowerCase().includes(q);
    return matchPlan && matchSearch;
  });

  const openModal = (u: AdminUser) => {
    setToDelete(u);
    setConfirmEmail("");
    setError(null);
  };

  const closeModal = () => {
    if (isPending) return;
    setToDelete(null);
    setConfirmEmail("");
    setError(null);
  };

  const handleDelete = () => {
    if (!toDelete) return;
    if (confirmEmail.trim().toLowerCase() !== toDelete.email.toLowerCase()) {
      setError("L'adresse email ne correspond pas.");
      return;
    }
    startTransition(async () => {
      const res = await fetch(`/api/admin/delete-user?userId=${toDelete.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erreur lors de la suppression.");
        return;
      }
      setUsers(prev => prev.filter(u => u.id !== toDelete.id));
      setToDelete(null);
    });
  };

  const planLabel = (s: string) => s === "TRIAL" ? "Essai" : s === "ACTIVE" ? "Actif" : "Expiré";
  const planClass = (s: string) => `at-badge at-badge-${s.toLowerCase()}`;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <>
      {/* Filtres */}
      <div className="mgmt-filters">
        <input
          type="text"
          className="mgmt-search"
          placeholder="Rechercher par nom ou email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="mgmt-plan-tabs">
          {["ALL", "TRIAL", "ACTIVE", "EXPIRED"].map(p => (
            <button
              key={p}
              className={`mgmt-tab ${planFilter === p ? "active" : ""}`}
              onClick={() => setPlanFilter(p)}
            >
              {p === "ALL" ? `Tous (${users.length})` :
               p === "TRIAL" ? `Essai (${users.filter(u => u.planStatus === "TRIAL").length})` :
               p === "ACTIVE" ? `Actifs (${users.filter(u => u.planStatus === "ACTIVE").length})` :
               `Expirés (${users.filter(u => u.planStatus === "EXPIRED").length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Email</th>
              <th>Plan</th>
              <th>Gîtes</th>
              <th>Inscription</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "24px", color: "var(--ink-light)", fontStyle: "italic" }}>
                  Aucun utilisateur trouvé
                </td>
              </tr>
            )}
            {filtered.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="at-user">
                    <div className="at-av">{(u.name ?? u.email).slice(0, 2).toUpperCase()}</div>
                    <span style={{ fontWeight: 600 }}>{u.name ?? "—"}</span>
                  </div>
                </td>
                <td className="at-email">{u.email}</td>
                <td><span className={planClass(u.planStatus)}>{planLabel(u.planStatus)}</span></td>
                <td className="at-center">{u.gitesCount}</td>
                <td className="at-date">{fmtDate(u.createdAt)}</td>
                <td>
                  <button className="mgmt-delete-btn" onClick={() => openModal(u)}>
                    <Trash2 size={14} strokeWidth={1.4} />
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal confirmation */}
      {toDelete && (
        <div className="mgmt-overlay" onClick={closeModal}>
          <div className="mgmt-modal" onClick={e => e.stopPropagation()}>
            <div className="mgmt-modal-icon">
              <AlertTriangle size={24} strokeWidth={2} color="#DC2626" />
            </div>
            <h2 className="mgmt-modal-title">Supprimer ce compte</h2>
            <p className="mgmt-modal-desc">
              Cette action est <strong>irréversible</strong>. Elle supprimera définitivement le compte de{" "}
              <strong>{toDelete.name ?? toDelete.email}</strong>, tous ses gîtes, réservations, contrats
              {toDelete.hasStripe ? ", son abonnement Stripe" : ""} et ses fichiers.
            </p>
            <div className="mgmt-modal-user-card">
              <div className="mgmt-modal-av">{(toDelete.name ?? toDelete.email).slice(0, 2).toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{toDelete.name ?? "—"}</div>
                <div style={{ fontSize: 12, color: "var(--ink-light)" }}>{toDelete.email}</div>
              </div>
              <span className={`at-badge at-badge-${toDelete.planStatus.toLowerCase()}`} style={{ marginLeft: "auto" }}>
                {planLabel(toDelete.planStatus)}
              </span>
            </div>
            <label className="mgmt-confirm-label">
              Tapez l&apos;adresse email pour confirmer
            </label>
            <input
              type="email"
              className="mgmt-confirm-input"
              placeholder={toDelete.email}
              value={confirmEmail}
              onChange={e => { setConfirmEmail(e.target.value); setError(null); }}
              disabled={isPending}
            />
            {error && <p className="mgmt-error">{error}</p>}
            <div className="mgmt-modal-actions">
              <button className="mgmt-cancel-btn" onClick={closeModal} disabled={isPending}>
                Annuler
              </button>
              <button
                className="mgmt-confirm-btn"
                onClick={handleDelete}
                disabled={isPending || confirmEmail.trim().toLowerCase() !== toDelete.email.toLowerCase()}
              >
                {isPending ? "Suppression…" : "Supprimer définitivement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
