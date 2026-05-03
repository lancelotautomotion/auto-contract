import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const now = new Date();
  const minus7  = new Date(now.getTime() - 7  * 86400_000);
  const minus30 = new Date(now.getTime() - 30 * 86400_000);

  const [
    totalUsers,
    usersLast7,
    usersLast30,
    usersPrev7,
    usersPrev30,
    totalGites,
    totalContracts,
    contractsLast30,
    planGroups,
    latestUsers,
  ] = await Promise.all([
    // Acquisition
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: minus7 } } }),
    prisma.user.count({ where: { createdAt: { gte: minus30 } } }),
    prisma.user.count({ where: { createdAt: { gte: new Date(now.getTime() - 14 * 86400_000), lt: minus7 } } }),
    prisma.user.count({ where: { createdAt: { gte: new Date(now.getTime() - 60 * 86400_000), lt: minus30 } } }),

    // Activation
    prisma.gite.count(),
    // Usage
    prisma.contract.count(),
    prisma.contract.count({ where: { createdAt: { gte: minus30 } } }),

    // Business — répartition plans
    prisma.user.groupBy({ by: ["planStatus"], _count: { id: true } }),

    // Tableau derniers inscrits
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { gites: { select: { id: true } } },
    }),
  ]);

  // Calcul des deltas
  const delta7  = usersPrev7  > 0 ? Math.round(((usersLast7  - usersPrev7)  / usersPrev7)  * 100) : null;
  const delta30 = usersPrev30 > 0 ? Math.round(((usersLast30 - usersPrev30) / usersPrev30) * 100) : null;
  const activationRate = totalUsers > 0 ? Math.round((totalGites / totalUsers) * 100) : 0;

  const planCount = (status: string) =>
    planGroups.find(g => g.planStatus === status)?._count.id ?? 0;

  const trialCount  = planCount("TRIAL");
  const activeCount = planCount("ACTIVE");
  const expiredCount = planCount("EXPIRED");

  const fmtDate = (d: Date) => d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  const fmtDelta = (d: number | null) => {
    if (d === null) return null;
    return d >= 0 ? `+${d}%` : `${d}%`;
  };

  return (
    <div className="admin-page">

      {/* En-tête page */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Vue d&apos;ensemble</h1>
        <p className="admin-page-sub">
          Mis à jour en temps réel · {now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* BENTO GRID — KPIs */}
      <div className="admin-bento">

        {/* Acquisition */}
        <div className="admin-card admin-card-lg">
          <div className="ac-label">Acquisition</div>
          <div className="ac-big">{totalUsers.toLocaleString("fr-FR")}</div>
          <div className="ac-desc">utilisateurs inscrits au total</div>
          <div className="ac-chips">
            <div className="ac-chip">
              <span className="ac-chip-num">{usersLast7}</span>
              <span className="ac-chip-lbl">7 derniers jours</span>
              {fmtDelta(delta7) && (
                <span className={`ac-chip-delta ${delta7! >= 0 ? "pos" : "neg"}`}>{fmtDelta(delta7)}</span>
              )}
            </div>
            <div className="ac-chip">
              <span className="ac-chip-num">{usersLast30}</span>
              <span className="ac-chip-lbl">30 derniers jours</span>
              {fmtDelta(delta30) && (
                <span className={`ac-chip-delta ${delta30! >= 0 ? "pos" : "neg"}`}>{fmtDelta(delta30)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Activation */}
        <div className="admin-card">
          <div className="ac-label">Activation</div>
          <div className="ac-big">{activationRate}<span style={{ fontSize: 28, fontWeight: 600 }}>%</span></div>
          <div className="ac-desc">taux d&apos;onboarding</div>
          <div className="ac-sub">{totalGites} gîtes créés · {totalUsers} comptes</div>
          <div className="ac-bar-wrap">
            <div className="ac-bar" style={{ width: `${Math.min(activationRate, 100)}%` }} />
          </div>
        </div>

        {/* Usage */}
        <div className="admin-card admin-card-violet">
          <div className="ac-label" style={{ color: "rgba(255,255,255,.6)" }}>Usage — Core Value</div>
          <div className="ac-big" style={{ color: "#fff" }}>{totalContracts.toLocaleString("fr-FR")}</div>
          <div className="ac-desc" style={{ color: "rgba(255,255,255,.7)" }}>contrats générés au total</div>
          <div className="ac-sub" style={{ color: "rgba(255,255,255,.5)" }}>{contractsLast30} sur les 30 derniers jours</div>
        </div>

        {/* Business — plans */}
        <div className="admin-card">
          <div className="ac-label">Business</div>
          <div className="ac-desc" style={{ marginBottom: 16 }}>Répartition des abonnements</div>
          <div className="ac-plans">
            <div className="ac-plan">
              <div className="ac-plan-dot trial" />
              <div className="ac-plan-info">
                <span className="ac-plan-name">Essai gratuit</span>
                <span className="ac-plan-count">{trialCount}</span>
              </div>
              <div className="ac-plan-bar-wrap">
                <div className="ac-plan-bar trial" style={{ width: totalUsers ? `${(trialCount / totalUsers) * 100}%` : "0%" }} />
              </div>
            </div>
            <div className="ac-plan">
              <div className="ac-plan-dot active" />
              <div className="ac-plan-info">
                <span className="ac-plan-name">Abonnés actifs</span>
                <span className="ac-plan-count ac-plan-count-active">{activeCount}</span>
              </div>
              <div className="ac-plan-bar-wrap">
                <div className="ac-plan-bar active" style={{ width: totalUsers ? `${(activeCount / totalUsers) * 100}%` : "0%" }} />
              </div>
            </div>
            <div className="ac-plan">
              <div className="ac-plan-dot expired" />
              <div className="ac-plan-info">
                <span className="ac-plan-name">Expirés</span>
                <span className="ac-plan-count">{expiredCount}</span>
              </div>
              <div className="ac-plan-bar-wrap">
                <div className="ac-plan-bar expired" style={{ width: totalUsers ? `${(expiredCount / totalUsers) * 100}%` : "0%" }} />
              </div>
            </div>
          </div>
          {activeCount > 0 && (
            <div className="ac-mrr">
              MRR estimé <strong>{(activeCount * 9.99).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</strong>
            </div>
          )}
        </div>

      </div>

      {/* Tableau derniers inscrits */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Derniers inscrits</h2>
          <span className="admin-section-count">{totalUsers} comptes au total</span>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Gîtes</th>
                <th>Inscription</th>
              </tr>
            </thead>
            <tbody>
              {latestUsers.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="at-user">
                      <div className="at-av">{(u.name ?? u.email).slice(0, 2).toUpperCase()}</div>
                      <span>{u.name ?? "—"}</span>
                    </div>
                  </td>
                  <td className="at-email">{u.email}</td>
                  <td>
                    <span className={`at-badge at-badge-${u.planStatus.toLowerCase()}`}>
                      {u.planStatus === "TRIAL" ? "Essai" : u.planStatus === "ACTIVE" ? "Actif" : "Expiré"}
                    </span>
                  </td>
                  <td className="at-center">{u.gites.length}</td>
                  <td className="at-date">{fmtDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
