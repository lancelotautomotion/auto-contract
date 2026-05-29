"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RoomsManager from "../../RoomsManager";

interface Room { id: string; name: string; capacity: number; basePrice: number; active: boolean; }

interface GuesthouseData {
  id: string;
  name: string;
  address: string;
  city: string;
  zipCode: string;
  email: string;
  phone: string;
  capacity: number;
  touristTax: number;
  contractTemplateGeneral: string;
  contractTemplateHouseRules: string;
  logoUrl: string;
}

const TABS = ["Informations", "Chambres", "Contrat", "Logo", "Options"] as const;
type Tab = typeof TABS[number];

const CONTRACT_VARS: { group: string; vars: { code: string; desc: string }[] }[] = [
  {
    group: "Client",
    vars: [
      { code: "{{nom_client}}", desc: "Nom complet du client" },
      { code: "{{email_client}}", desc: "Email du client" },
      { code: "{{adresse_client}}", desc: "Adresse postale du client" },
    ],
  },
  {
    group: "Séjour",
    vars: [
      { code: "{{date_arrivee}}", desc: "Date d'arrivée" },
      { code: "{{date_depart}}", desc: "Date de départ" },
      { code: "{{nb_nuits}}", desc: "Nombre de nuits" },
      { code: "{{nb_adultes}}", desc: "Nombre d'adultes" },
      { code: "{{chambres}}", desc: "Chambre(s) réservée(s)" },
    ],
  },
  {
    group: "Montants",
    vars: [
      { code: "{{loyer}}", desc: "Loyer total (nuitées + restauration)" },
      { code: "{{acompte}}", desc: "Acompte versé" },
      { code: "{{taxe_sejour}}", desc: "Taxe de séjour totale" },
      { code: "{{options}}", desc: "Détail de la restauration (lignes ventilées)" },
    ],
  },
  {
    group: "Établissement",
    vars: [
      { code: "{{nom_etablissement}}", desc: "Nom de la maison d'hôtes" },
      { code: "{{adresse_etablissement}}", desc: "Adresse complète" },
    ],
  },
];

export default function GuesthouseSettingsTabs({ initial, rooms }: { initial: GuesthouseData; rooms: Room[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("Informations");
  const [form, setForm] = useState({
    name: initial.name,
    address: initial.address,
    city: initial.city,
    zipCode: initial.zipCode,
    email: initial.email,
    phone: initial.phone,
    capacity: String(initial.capacity),
    touristTax: String(initial.touristTax),
  });
  const [contractGeneral, setContractGeneral] = useState(initial.contractTemplateGeneral);
  const [contractHouseRules, setContractHouseRules] = useState(initial.contractTemplateHouseRules);
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl);
  const [logoUploading, setLogoUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  // Chambres : initiales chargées côté serveur — on les récupère via API au mount du tab ? Simple : on prend initialRooms en prop séparée
  // Géré dans un wrapper plus bas

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ kind: "err", text: data.error ?? "Échec de l'upload." });
        return;
      }
      setLogoUrl(data.url);
    } catch {
      setMessage({ kind: "err", text: "Impossible de contacter le serveur." });
    } finally {
      setLogoUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/guesthouse/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          address: form.address,
          city: form.city,
          zipCode: form.zipCode,
          email: form.email,
          phone: form.phone,
          capacity: form.capacity,
          touristTax: form.touristTax,
          contractTemplateGeneral: contractGeneral,
          contractTemplateHouseRules: contractHouseRules,
          logoUrl,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage({ kind: "err", text: data.error ?? "Erreur lors de l'enregistrement." });
        return;
      }
      setMessage({ kind: "ok", text: "Modifications enregistrées." });
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="tabs" style={{ display: "flex", gap: "4px", borderBottom: "1px solid #EFEDE8", marginBottom: "20px", overflowX: "auto" }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`tab${activeTab === tab ? " active" : ""}`}
            style={{
              padding: "10px 18px",
              fontSize: "13px",
              fontWeight: 600,
              border: "none",
              borderBottom: activeTab === tab ? "2px solid #5B52B5" : "2px solid transparent",
              background: "transparent",
              color: activeTab === tab ? "#5B52B5" : "var(--ink-lighter)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Informations" && (
        <div className="form-card">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nom de l&apos;établissement <span className="req">*</span></label>
              <input className="form-input" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Capacité max (personnes)</label>
              <input type="number" min="1" max="15" className="form-input" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Adresse</label>
            <input className="form-input" value={form.address} onChange={(e) => set("address", e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Code postal</label>
              <input className="form-input" value={form.zipCode} onChange={(e) => set("zipCode", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Ville</label>
              <input className="form-input" value={form.city} onChange={(e) => set("city", e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email de contact</label>
              <input type="email" className="form-input" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Téléphone</label>
              <input type="tel" className="form-input" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
          </div>
          <SaveBar saving={saving} message={message} onSave={save} />
        </div>
      )}

      {activeTab === "Chambres" && (
        <RoomsManager guesthouseId={initial.id} initialRooms={rooms} />
      )}

      {activeTab === "Contrat" && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 240px", gap: "20px" }}>
          <div className="form-card" style={{ minWidth: 0 }}>
            <div className="form-group">
              <label className="form-label">Conditions générales du contrat</label>
              <textarea
                className="form-textarea"
                style={{ minHeight: "260px", fontFamily: "ui-monospace, monospace", fontSize: "12.5px" }}
                value={contractGeneral}
                onChange={(e) => setContractGeneral(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Règlement intérieur</label>
              <textarea
                className="form-textarea"
                style={{ minHeight: "200px", fontFamily: "ui-monospace, monospace", fontSize: "12.5px" }}
                value={contractHouseRules}
                onChange={(e) => setContractHouseRules(e.target.value)}
              />
            </div>
            <SaveBar saving={saving} message={message} onSave={save} />
          </div>

          <aside className="form-card" style={{ background: "#F8F6F1", height: "fit-content", position: "sticky", top: "20px" }}>
            <div className="form-card-title" style={{ fontSize: "12px" }}>Variables disponibles</div>
            <p style={{ fontSize: "11px", color: "var(--ink-lighter)", marginTop: 0, marginBottom: "12px" }}>
              Cliquez pour copier. Remplacées automatiquement à la génération du PDF.
            </p>
            {CONTRACT_VARS.map((g) => (
              <div key={g.group} style={{ marginBottom: "12px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#5B52B5", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>{g.group}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {g.vars.map((v) => (
                    <button
                      key={v.code}
                      type="button"
                      onClick={() => navigator.clipboard?.writeText(v.code)}
                      title={v.desc}
                      style={{ fontSize: "11px", fontFamily: "ui-monospace, monospace", padding: "2px 8px", background: "#FFF", border: "1px solid #EFEDE8", borderRadius: "6px", cursor: "pointer", color: "var(--ink)" }}
                    >
                      {v.code}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </aside>
        </div>
      )}

      {activeTab === "Logo" && (
        <div className="form-card">
          <div className="form-group">
            <label className="form-label">Logo de l&apos;établissement</label>
            <p style={{ fontSize: "12px", color: "var(--ink-lighter)", margin: "0 0 12px" }}>
              Affiché en haut des contrats PDF et des emails envoyés au client. PNG ou JPG, max 5 Mo.
            </p>
            {logoUrl && (
              <div style={{ marginBottom: "12px", padding: "16px", background: "#F8F6F1", borderRadius: "10px", display: "inline-block" }}>
                <img src={logoUrl} alt="Logo" style={{ maxHeight: "80px", maxWidth: "200px" }} />
              </div>
            )}
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <label className="btn btn-outline" style={{ cursor: "pointer" }}>
                {logoUploading ? "Envoi…" : logoUrl ? "Changer le logo" : "Choisir un fichier"}
                <input type="file" accept="image/*" onChange={handleLogo} style={{ display: "none" }} disabled={logoUploading} />
              </label>
              {logoUrl && (
                <button type="button" className="btn btn-outline" onClick={() => setLogoUrl("")}>Supprimer</button>
              )}
            </div>
          </div>
          <SaveBar saving={saving} message={message} onSave={save} />
        </div>
      )}

      {activeTab === "Options" && (
        <div className="form-card">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Taxe de séjour (€ / adulte / nuit)</label>
              <input type="number" step="0.01" min="0" className="form-input" value={form.touristTax} onChange={(e) => set("touristTax", e.target.value)} />
              <p style={{ fontSize: "11px", color: "var(--ink-lighter)", margin: "4px 0 0" }}>
                Appliquée à chaque adulte pour chaque nuit du séjour. Valeur en vigueur dans votre commune.
              </p>
            </div>
            <div className="form-group">
              <label className="form-label">Email de notification</label>
              <input type="email" className="form-input" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="contact@..." />
              <p style={{ fontSize: "11px", color: "var(--ink-lighter)", margin: "4px 0 0" }}>
                Adresse qui reçoit les nouvelles réservations et les contrats signés. (Identique à l&apos;email de contact pour l&apos;instant.)
              </p>
            </div>
          </div>
          <SaveBar saving={saving} message={message} onSave={save} />
        </div>
      )}
    </div>
  );
}

function SaveBar({ saving, message, onSave }: { saving: boolean; message: { kind: "ok" | "err"; text: string } | null; onSave: () => void }) {
  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "16px", borderTop: "1px solid #EFEDE8", paddingTop: "16px", flexWrap: "wrap" }}>
      <button type="button" className="btn btn-green" onClick={onSave} disabled={saving}>
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>
      {message && (
        <span style={{ fontSize: "12px", color: message.kind === "ok" ? "#3E7A48" : "#b91c1c" }}>{message.text}</span>
      )}
    </div>
  );
}

