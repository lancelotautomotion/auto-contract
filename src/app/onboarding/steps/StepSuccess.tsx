import { Check, ArrowRight } from "lucide-react";

export default function StepSuccess({
  giteName,
  giteCount,
  giteNames,
  isMulti,
  onDashboard,
}: {
  giteName: string;
  giteCount?: number;
  giteNames?: string[];
  isMulti?: boolean;
  onDashboard: () => void;
}) {
  const count = giteCount ?? 1;

  return (
    <div className="ob-success">
      <div className="ob-success-icon">
        <Check size={28} strokeWidth={2.5} color="#689D71" />
      </div>

      <h2 className="ob-success-title">Votre espace est prêt&nbsp;!</h2>

      {isMulti ? (
        <>
          <p className="ob-success-text">
            {count === 1 ? (
              <>
                <strong style={{ color: "#689D71" }}>{giteName}</strong> a bien été configuré.
              </>
            ) : (
              <>
                Vos{" "}
                <strong style={{ color: "#689D71" }}>{count} hébergements</strong>{" "}
                ont bien été configurés.
              </>
            )}
          </p>

          <div style={{
            marginTop: "14px",
            padding: "14px 16px",
            borderRadius: "12px",
            background: "rgba(104,157,113,.06)",
            border: "1px solid rgba(104,157,113,.2)",
            textAlign: "left",
          }}>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#689D71", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: ".05em" }}>
              Pour aller plus loin
            </p>
            <p style={{ fontSize: "13px", color: "#2C2C2A", margin: "0 0 10px", lineHeight: 1.55 }}>
              Rendez-vous dans la section <strong>Hébergements</strong>{" "}pour personnaliser chaque bien&nbsp;:
            </p>
            <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: "5px" }}>
              {[
                "Ajouter un logo — visible sur les contrats et dans les emails envoyés aux locataires",
                "Configurer les options proposées (jacuzzi, linge de lit, ménage de fin de séjour…)",
                "Personnaliser les modèles de contrat",
                "Joindre des documents aux emails (règlement intérieur, guide d'accueil…)",
              ].map((item) => (
                <li key={item} style={{ fontSize: "13px", color: "#2C2C2A", lineHeight: 1.5 }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <p className="ob-success-text">
          <strong style={{ color: "#689D71" }}>{giteName}</strong>{" "}est configuré. Pour finaliser votre profil
          et envoyer vos premiers contrats, n&apos;oubliez pas d&apos;ajouter
          votre logo et vos documents dans les paramètres.
        </p>
      )}

      <button type="button" className="ob-submit" onClick={onDashboard} style={{ marginTop: isMulti ? "16px" : undefined }}>
        Accéder au tableau de bord
        <ArrowRight size={16} strokeWidth={1.5} color="#fff" />
      </button>
    </div>
  );
}
