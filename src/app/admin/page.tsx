import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const now = new Date();
  const startOfToday     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 86400_000);
  const minus7  = new Date(now.getTime() - 7  * 86400_000);
  const minus30 = new Date(now.getTime() - 30 * 86400_000);

  const [
    // Acquisition
    totalUsers, usersLast7, usersLast30, usersPrev7, usersPrev30,
    // Activation / funnel
    totalGites, gitesWithRealName,
    // Usage
    totalContracts, contractsLast30, contractsToday,
    emailedContracts, signedContracts, signedToday,
    // Business
    planGroups,
    // Emails Resend
    emailsToday, emailsYesterday, emailsLast7,
    // Engagement
    activeUsers7,
    churnWeekly,
    // Acomptes en attente
    depositsPending,
    // Top gîtes
    topGites,
    // Derniers inscrits
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
    prisma.gite.count({ where: { name: { not: "Mon Gîte" }, AND: [{ name: { not: "" } }] } }),

    // Usage
    prisma.contract.count(),
    prisma.contract.count({ where: { createdAt: { gte: minus30 } } }),
    prisma.contract.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.contract.count({ where: { emailStatus: "SENT" } }),
    prisma.contract.count({ where: { status: "SIGNED" } }),
    prisma.contract.count({ where: { status: "SIGNED", signedAt: { gte: startOfToday } } }),

    // Business
    prisma.user.groupBy({ by: ["planStatus"], _count: { id: true } }),

    // Emails
    prisma.contract.count({ where: { emailSentAt: { gte: startOfToday } } }),
    prisma.contract.count({ where: { emailSentAt: { gte: startOfYesterday, lt: startOfToday } } }),
    prisma.contract.count({ where: { emailSentAt: { gte: minus7 } } }),

    // Utilisateurs actifs 7j (au moins 1 réservation créée)
    prisma.user.count({
      where: { gites: { some: { reservations: { some: { createdAt: { gte: minus7 } } } } } },
    }),

    // Churn hebdo (essais expirés cette semaine)
    prisma.user.count({ where: { planStatus: "EXPIRED", updatedAt: { gte: minus7 } } }),

    // Acomptes en attente > 7j après signature
    prisma.contract.findMany({
      where: { status: "SIGNED", depositReceived: false, signedAt: { lt: minus7, not: null } },
      take: 8,
      orderBy: { signedAt: "asc" },
      select: {
        signedAt: true,
        reservation: {
          select: {
            clientFirstName: true, clientLastName: true, deposit: true,
            gite: { select: { name: true } },
          },
        },
      },
    }),

    // Top 5 gîtes par nombre de réservations
    prisma.gite.findMany({
      take: 5,
      select: {
        name: true, city: true,
        user: { select: { email: true } },
        _count: { select: { reservations: true } },
        reservations: { select: { contract: { select: { status: true } } } },
      },
      orderBy: { reservations: { _count: "desc" } },
    }),

    // Derniers inscrits
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { gites: { select: { id: true } } },
    }),
  ]);

  // Time-to-value : délai moyen (heures) entre inscription et 1er email contrat
  const ttvResult = await prisma.$queryRaw<[{ avg_hours: number | null }]>`
    SELECT AVG(
      EXTRACT(EPOCH FROM (c."emailSentAt" - u."createdAt")) / 3600.0
    )::float AS avg_hours
    FROM "User" u
    JOIN "Gite" g ON g."userId" = u.id
    JOIN "Reservation" r ON r."giteId" = g.id
    JOIN "Contract" c ON c."reservationId" = r.id
    WHERE c."emailSentAt" IS NOT NULL
  `;
  const avgTtvHours = ttvResult[0]?.avg_hours ?? null;

  // Délai moyen de signature (heures entre envoi et signature)
  const sigDelayResult = await prisma.$queryRaw<[{ avg_hours: number | null }]>`
    SELECT AVG(
      EXTRACT(EPOCH FROM ("signedAt" - "emailSentAt")) / 3600.0
    )::float AS avg_hours
    FROM "Contract"
    WHERE "signedAt" IS NOT NULL AND "emailSentAt" IS NOT NULL
  `;
  const avgSigDelayHours = sigDelayResult[0]?.avg_hours ?? null;

  // ── Calculs dérivés ────────────────────────────────────────────────────────
  const delta7    = usersPrev7  > 0 ? Math.round(((usersLast7  - usersPrev7)  / usersPrev7)  * 100) : null;
  const delta30   = usersPrev30 > 0 ? Math.round(((usersLast30 - usersPrev30) / usersPrev30) * 100) : null;
  const emailDelta = emailsYesterday > 0 ? Math.round(((emailsToday - emailsYesterday) / emailsYesterday) * 100) : null;

  const onboardingRate  = totalUsers > 0 ? Math.round((gitesWithRealName / totalUsers) * 100) : 0;
  const emailRate       = totalContracts > 0 ? Math.round((emailedContracts / totalContracts) * 100) : 0;
  const signatureRate   = emailedContracts > 0 ? Math.round((signedContracts / emailedContracts) * 100) : 0;
  const engagementRate  = totalUsers > 0 ? Math.round((activeUsers7 / totalUsers) * 100) : 0;

  const planCount = (s: string) => planGroups.find(g => g.planStatus === s)?._count.id ?? 0;
  const trialCount   = planCount("TRIAL");
  const activeCount  = planCount("ACTIVE");
  const expiredCount = planCount("EXPIRED");

  const fmtDate  = (d: Date) => d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  const fmtDelta = (d: number | null) => d === null ? null : (d >= 0 ? `+${d}%` : `${d}%`);

  const fmtDuration = (hours: number | null) => {
    if (hours === null) return "—";
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    if (hours < 24) return `${Math.round(hours)} h`;
    return `${Math.round(hours / 24)} j`;
  };

  const daysSince = (d: Date | null) => {
    if (!d) return null;
    return Math.floor((now.getTime() - new Date(d).getTime()) / 86400_000);
  };

  return (
    <div className="admin-page">

      {/* En-tête */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Vue d&apos;ensemble</h1>
        <p className="admin-page-sub">
          Mis à jour en temps réel · {now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* ── BENTO PRINCIPAL ─────────────────────────────────────────────── */}
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
                {fmtDelta(delta7) && <span className={`ac-chip-delta ${delta7! >= 0 ? "pos" : "neg"}`}>{fmtDelta(delta7)}</span>}
              </div>
              <span className="ac-chip-lbl">7 derniers jours</span>
            </div>
            <div className="ac-chip">
              <div className="ac-chip-top">
                <span className="ac-chip-num">{usersLast30}</span>
                {fmtDelta(delta30) && <span className={`ac-chip-delta ${delta30! >= 0 ? "pos" : "neg"}`}>{fmtDelta(delta30)}</span>}
              </div>
              <span className="ac-chip-lbl">30 derniers jours</span>
            </div>
          </div>
        </div>

        {/* Business */}
        <div className="admin-card">
          <div className="ac-label">Business</div>
          <div className="ac-desc" style={{ marginBottom: 16 }}>Répartition des abonnements</div>
          <div className="ac-plans">
            <div className="ac-plan">
              <div className="ac-plan-dot trial" />
              <div className="ac-plan-info"><span className="ac-plan-name">Essai gratuit</span><span className="ac-plan-count">{trialCount}</span></div>
              <div className="ac-plan-bar-wrap"><div className="ac-plan-bar trial" style={{ width: totalUsers ? `${(trialCount / totalUsers) * 100}%` : "0%" }} /></div>
            </div>
            <div className="ac-plan">
              <div className="ac-plan-dot active" />
              <div className="ac-plan-info"><span className="ac-plan-name">Abonnés actifs</span><span className="ac-plan-count ac-plan-count-active">{activeCount}</span></div>
              <div className="ac-plan-bar-wrap"><div className="ac-plan-bar active" style={{ width: totalUsers ? `${(activeCount / totalUsers) * 100}%` : "0%" }} /></div>
            </div>
            <div className="ac-plan">
              <div className="ac-plan-dot expired" />
              <div className="ac-plan-info"><span className="ac-plan-name">Expirés</span><span className="ac-plan-count">{expiredCount}</span></div>
              <div className="ac-plan-bar-wrap"><div className="ac-plan-bar expired" style={{ width: totalUsers ? `${(expiredCount / totalUsers) * 100}%` : "0%" }} /></div>
            </div>
          </div>
          {activeCount > 0 && (
            <div className="ac-mrr">MRR estimé <strong>{(activeCount * 9.99).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</strong></div>
          )}
        </div>

        {/* Usage */}
        <div className="admin-card admin-card-violet">
          <div className="ac-label" style={{ color: "rgba(255,255,255,.6)" }}>Usage — Core Value</div>
          <div className="ac-big" style={{ color: "#fff" }}>{totalContracts.toLocaleString("fr-FR")}</div>
          <div className="ac-desc" style={{ color: "rgba(255,255,255,.7)" }}>contrats générés au total</div>
          <div className="ac-chips" style={{ marginTop: 16 }}>
            <div className="ac-chip ac-chip-dark">
              <div className="ac-chip-top"><span className="ac-chip-num">{contractsToday}</span></div>
              <span className="ac-chip-lbl">aujourd&apos;hui</span>
            </div>
            <div className="ac-chip ac-chip-dark">
              <div className="ac-chip-top"><span className="ac-chip-num">{contractsLast30}</span></div>
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

        {/* Activation */}
        <div className="admin-card">
          <div className="ac-label">Activation</div>
          <div className="ac-big">{onboardingRate}<span style={{ fontSize: 28, fontWeight: 600 }}>%</span></div>
          <div className="ac-desc">taux d&apos;onboarding</div>
          <div className="ac-sub">{gitesWithRealName} gîtes configurés · {totalUsers} comptes</div>
          <div className="ac-bar-wrap"><div className="ac-bar" style={{ width: `${Math.min(onboardingRate, 100)}%` }} /></div>
        </div>

        {/* Resend — pleine largeur */}
        <div className="admin-card admin-card-full">
          <div className="ac-label">Resend — Emails transactionnels</div>
          <div className="ac-email-row">
            <div className="ac-email-stat">
              <div className="ac-email-num">{emailsToday}</div>
              <div className="ac-email-lbl">envoyés aujourd&apos;hui</div>
              {emailDelta !== null && (
                <span className={`ac-chip-delta ${emailDelta >= 0 ? "pos" : "neg"}`} style={{ marginTop: 4 }}>{fmtDelta(emailDelta)} vs hier</span>
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
              <div className="ac-email-sublbl">Quota Resend gratuit</div>
              <div className="ac-email-quota">
                <div className="ac-email-quota-bar-wrap">
                  <div className="ac-email-quota-bar" style={{ width: `${Math.min((emailsToday / 100) * 100, 100)}%`, background: emailsToday > 80 ? "#EF4444" : emailsToday > 60 ? "#F59E0B" : "var(--violet)" }} />
                </div>
                <span>{emailsToday}/100 aujourd&apos;hui</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── STATS SECONDAIRES ────────────────────────────────────────────── */}
      <div className="admin-section-header" style={{ marginBottom: 16 }}>
        <h2 className="admin-section-title">Qualité du produit</h2>
      </div>
      <div className="admin-stats-row">

        <div className="admin-stat-card">
          <div className="asc-icon asc-icon-violet">
            <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
              <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M9 5.5v4l2.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="asc-value">{fmtDuration(avgTtvHours)}</div>
          <div className="asc-label">Time-to-value</div>
          <div className="asc-sub">délai inscription → 1er contrat envoyé</div>
        </div>

        <div className="admin-stat-card">
          <div className="asc-icon asc-icon-green">
            <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
              <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M6 9l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="asc-value">{activeUsers7}<span className="asc-unit"> / {totalUsers}</span></div>
          <div className="asc-label">Utilisateurs actifs 7j</div>
          <div className="asc-sub">{engagementRate}% de la base — au moins 1 réservation</div>
        </div>

        <div className="admin-stat-card">
          <div className={`asc-icon ${churnWeekly > 3 ? "asc-icon-red" : "asc-icon-amber"}`}>
            <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
              <path d="M9 3v6l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M5.5 14.5A7 7 0 1 0 3 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <div className={`asc-value ${churnWeekly > 3 ? "asc-value-red" : ""}`}>{churnWeekly}</div>
          <div className="asc-label">Churn cette semaine</div>
          <div className="asc-sub">essais passés en statut Expiré</div>
        </div>

        <div className="admin-stat-card">
          <div className="asc-icon asc-icon-violet">
            <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
              <path d="M3 9h12M9 3l6 6-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="asc-value">{fmtDuration(avgSigDelayHours)}</div>
          <div className="asc-label">Délai moyen de signature</div>
          <div className="asc-sub">entre envoi du contrat et signature locataire</div>
        </div>

      </div>

      {/* ── FUNNEL ──────────────────────────────────────────────────────── */}
      <div className="admin-section-header" style={{ margin: "32px 0 16px" }}>
        <h2 className="admin-section-title">Funnel de conversion</h2>
        <span className="admin-section-count">{totalUsers} inscrits au départ</span>
      </div>
      <div className="admin-card admin-card-funnel" style={{ marginBottom: 32 }}>
        {[
          { label: "Inscrits", count: totalUsers, pct: 100, color: "var(--violet)" },
          { label: "Gîte configuré", count: gitesWithRealName, pct: totalUsers ? Math.round((gitesWithRealName / totalUsers) * 100) : 0, color: "var(--violet)" },
          { label: "Contrat envoyé", count: emailedContracts, pct: totalUsers ? Math.round((emailedContracts / totalUsers) * 100) : 0, color: "var(--green)" },
          { label: "Contrat signé", count: signedContracts, pct: totalUsers ? Math.round((signedContracts / totalUsers) * 100) : 0, color: "var(--green)" },
        ].map((step, i) => (
          <div key={i} className="funnel-step">
            <div className="funnel-step-header">
              <span className="funnel-step-label">{step.label}</span>
              <span className="funnel-step-count">{step.count.toLocaleString("fr-FR")}</span>
              <span className="funnel-step-pct">{step.pct}%</span>
            </div>
            <div className="funnel-bar-wrap">
              <div className="funnel-bar" style={{ width: `${step.pct}%`, background: step.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── TOP GÎTES + ACOMPTES ────────────────────────────────────────── */}
      <div className="admin-two-col" style={{ marginBottom: 32 }}>

        {/* Top gîtes */}
        <div>
          <div className="admin-section-header" style={{ marginBottom: 16 }}>
            <h2 className="admin-section-title">Top gîtes</h2>
            <span className="admin-section-count">par nombre de réservations</span>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Gîte</th>
                  <th>Réservations</th>
                  <th>Contrats signés</th>
                </tr>
              </thead>
              <tbody>
                {topGites.map((g, i) => {
                  const signed = g.reservations.filter(r => r.contract?.status === "SIGNED").length;
                  const total  = g._count.reservations;
                  return (
                    <tr key={i}>
                      <td style={{ color: "var(--ink-light)", width: 32 }}>#{i + 1}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--ink)" }}>{g.name}</div>
                        {g.city && <div style={{ fontSize: 11, color: "var(--ink-light)" }}>{g.city}</div>}
                      </td>
                      <td className="at-center">{total}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontWeight: 600, color: "var(--green-dark)" }}>{signed}</span>
                          <div style={{ flex: 1, height: 4, background: "var(--line-light)", borderRadius: 2, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: total ? `${(signed / total) * 100}%` : "0%", background: "var(--green)", borderRadius: 2 }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {topGites.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--ink-light)", padding: "24px" }}>Aucune donnée</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Acomptes en attente */}
        <div>
          <div className="admin-section-header" style={{ marginBottom: 16 }}>
            <h2 className="admin-section-title">Acomptes en attente</h2>
            <span className="admin-section-count">signés depuis &gt; 7 jours</span>
          </div>
          <div className="admin-table-wrap">
            {depositsPending.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", fontSize: 13, color: "var(--green-dark)", background: "var(--green-light)" }}>
                ✓ Aucun acompte en retard
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Locataire</th>
                    <th>Gîte</th>
                    <th>Acompte</th>
                    <th>Signé il y a</th>
                  </tr>
                </thead>
                <tbody>
                  {depositsPending.map((c, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: "var(--ink)" }}>
                        {c.reservation.clientFirstName} {c.reservation.clientLastName}
                      </td>
                      <td style={{ fontSize: 12, color: "var(--ink-soft)" }}>{c.reservation.gite.name}</td>
                      <td style={{ fontWeight: 600, color: "var(--violet-dark)" }}>
                        {c.reservation.deposit ? `${c.reservation.deposit.toLocaleString("fr-FR")} €` : "—"}
                      </td>
                      <td>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6,
                          background: (daysSince(c.signedAt) ?? 0) > 14 ? "#FEE2E2" : "#FEF3CD",
                          color: (daysSince(c.signedAt) ?? 0) > 14 ? "#B91C1C" : "#92610E",
                        }}>
                          {daysSince(c.signedAt)}j
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

      {/* ── DERNIERS INSCRITS ────────────────────────────────────────────── */}
      <div className="admin-section-header" style={{ marginBottom: 16 }}>
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
  );
}
