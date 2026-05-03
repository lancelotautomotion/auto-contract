import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const now = new Date();
  const startOfToday    = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 86400_000);
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
    contractsToday,
    planGroups,
    emailsToday,
    emailsYesterday,
    emailsLast7,
    signedContracts,
    signedToday,
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
    prisma.contract.count({ where: { createdAt: { gte: startOfToday } } }),
    // Business
    prisma.user.groupBy({ by: ["planStatus"], _count: { id: true } }),
    // Emails Resend
    prisma.contract.count({ where: { emailSentAt: { gte: startOfToday } } }),
    prisma.contract.count({ where: { emailSentAt: { gte: startOfYesterday, lt: startOfToday } } }),
    prisma.contract.count({ where: { emailSentAt: { gte: minus7 } } }),
    // Signatures
    prisma.contract.count({ where: { status: "SIGNED" } }),
    prisma.contract.count({ where: { status: "SIGNED", signedAt: { gte: startOfToday } } }),
    // Tableau
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { gites: { select: { id: true } } },
    }),
  ]);

  const delta7  = usersPrev7  > 0 ? Math.round(((usersLast7  - usersPrev7)  / usersPrev7)  * 100) : null;
  const delta30 = usersPrev30 > 0 ? Math.round(((usersLast30 - usersPrev30) / usersPrev30) * 100) : null;
  const emailDelta = emailsYesterday > 0 ? Math.round(((emailsToday - emailsYesterday) / emailsYesterday) * 100) : null;
  const signatureRate = totalContracts > 0 ? Math.round((signedContracts / totalContracts) * 100) : 0;
  const activationRate = totalUsers > 0 ? Math.round((totalGites / totalUsers) * 100) : 0;

  const planCount = (status: string) =>
    planGroups.find(g => g.planStatus === status)?._count.id ?? 0;
  const trialCount   = planCount("TRIAL");
  const activeCount  = planCount("ACTIVE");
  const expiredCount = planCount("EXPIRED");

  const fmtDate = (d: Date) => d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  const fmtDelta = (d: number | null) => d === null ? null : (d >= 0 ? `+${d}%` : `${d}%`);

  return (
    <div className="admin-page">

      <div className="admin-page-header">
        <h1 className="admin-page-title">Vue d&apos;ensemble</h1>
        <p className="admin-page-sub">
          Mis à jour en temps réel · {now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* BENTO GRID */}
      <div className="admin-bento">

        {/* Acquisition */}
        <div className="admin-card">
          <div className="ac-label">Acquisition</div>
          <div className="ac-big">{totalUsers.toLocaleString("fr-FR")}</div>
          <div className="ac-desc">utilisateurs inscrits au total</div>
          <div className="ac-chips">
            <div className="ac-chip">
              <div className="ac-chip-top">
                <span className="ac-chip-num">{usersLast7}</span>
                {fmtDelta(delta7) && (
                  <span className={`ac-chip-delta ${delta7! >= 0 ? "pos" : "neg"}`}>{fmtDelta(delta7)}</span>
                )}
              </div>
              <span className="ac-chip-lbl">7 derniers jours</span>
            </div>
            <div className="ac-chip">
              <div className="ac-chip-top">
                <span className="ac-chip-num">{usersLast30}</span>
                {fmtDelta(delta30) && (
                  <span className={`ac-chip-delta ${delta30! >= 0 ? "pos" : "neg"}`}>{fmtDelta(delta30)}</span>
                )}
              </div>
              <span className="ac-chip-lbl">30 derniers jours</span>
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

        {/* Usage — Contrats */}
        <div className="admin-card admin-card-violet">
          <div className="ac-label" style={{ color: "rgba(255,255,255,.6)" }}>Usage — Core Value</div>
          <div className="ac-big" style={{ color: "#fff" }}>{totalContracts.toLocaleString("fr-FR")}</div>
          <div className="ac-desc" style={{ color: "rgba(255,255,255,.7)" }}>contrats générés au total</div>
          <div className="ac-chips" style={{ marginTop: 16 }}>
            <div className="ac-chip ac-chip-dark">
              <div className="ac-chip-top">
                <span className="ac-chip-num">{contractsToday}</span>
              </div>
              <span className="ac-chip-lbl">aujourd&apos;hui</span>
            </div>
            <div className="ac-chip ac-chip-dark">
              <div className="ac-chip-top">
                <span className="ac-chip-num">{contractsLast30}</span>
              </div>
              <span className="ac-chip-lbl">30 derniers jours</span>
            </div>
            <div className="ac-chip ac-chip-dark">
              <div className="ac-chip-top">
                <span className="ac-chip-num">{signatureRate}<span style={{ fontSize: 13 }}>%</span></span>
                {signedToday > 0 && <span className="ac-chip-delta pos">+{signedToday} auj.</span>}
              </div>
              <span className="ac-chip-lbl">taux de signature</span>
            </div>
          </div>
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

        {/* Resend — emails du jour */}
        <div className="admin-card admin-card-full">
          <div className="ac-label">Resend — Emails transactionnels</div>
          <div className="ac-email-row">
            <div className="ac-email-stat">
              <div className="ac-email-num">{emailsToday}</div>
              <div className="ac-email-lbl">envoyés aujourd&apos;hui</div>
              {emailDelta !== null && (
                <span className={`ac-chip-delta ${emailDelta >= 0 ? "pos" : "neg"}`} style={{ marginTop: 4 }}>
                  {fmtDelta(emailDelta)} vs hier
                </span>
              )}
            </div>
            <div className="ac-email-divider" />
            <div className="ac-email-stat">
              <div className="ac-email-num">{emailsYesterday}</div>
              <div className="ac-email-lbl">hier</div>
            </div>
            <div className="ac-email-divider" />
            <div className="ac-email-stat">
              <div className="ac-email-num">{emailsLast7}</div>
              <div className="ac-email-lbl">7 derniers jours</div>
            </div>
            <div className="ac-email-divider" />
            <div className="ac-email-stat ac-email-stat-muted">
              <div className="ac-email-sublbl">Plan Resend gratuit</div>
              <div className="ac-email-quota">
                <div className="ac-email-quota-bar-wrap">
                  <div className="ac-email-quota-bar" style={{ width: `${Math.min((emailsToday / 100) * 100, 100)}%` }} />
                </div>
                <span>{emailsToday}/100 aujourd&apos;hui</span>
              </div>
            </div>
          </div>
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
