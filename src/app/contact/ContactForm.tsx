"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type FormState = {
  prenom: string;
  nom: string;
  email: string;
  sujet: string;
  message: string;
  consent: boolean;
};

const INITIAL: FormState = {
  prenom: "",
  nom: "",
  email: "",
  sujet: "",
  message: "",
  consent: false,
};

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const sujet = searchParams.get('sujet');
    if (sujet) setForm(prev => ({ ...prev, sujet }));
  }, [searchParams]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value, type } = e.target;
    setError(null);
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue. Réessayez.");
        setLoading(false);
        return;
      }
      setSent(true);
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion et réessayez.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="ct-form-wrap">
        <div className="ct-success">
          <div className="ct-success-icon">
            <svg width="28" height="28" fill="none" viewBox="0 0 28 28">
              <path d="M6 14l5 5L22 9" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3>Message envoyé&nbsp;!</h3>
          <p>
            Merci, nous avons bien reçu votre demande.
            Nous revenons vers vous sous <strong>24h ouvrées</strong>.
          </p>
          <button
            type="button"
            className="btn btn-outline ct-success-btn"
            onClick={() => { setSent(false); setForm(INITIAL); }}
          >
            Envoyer un autre message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ct-form-wrap">
      <div className="ct-form-head">
        <h2>Envoyez-nous un message</h2>
        <p>Remplissez le formulaire, on revient vers vous en moins de 24h.</p>
      </div>

      <form onSubmit={handleSubmit} className="ct-form" noValidate>
        <div className="ct-row-2">
          <div className="ct-group">
            <label htmlFor="ct-prenom">Prénom <span className="req">*</span></label>
            <input
              id="ct-prenom" name="prenom" type="text" required
              placeholder="Votre prénom"
              value={form.prenom} onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div className="ct-group">
            <label htmlFor="ct-nom">Nom <span className="req">*</span></label>
            <input
              id="ct-nom" name="nom" type="text" required
              placeholder="Votre nom"
              value={form.nom} onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <div className="ct-group">
          <label htmlFor="ct-email">Email <span className="req">*</span></label>
          <input
            id="ct-email" name="email" type="email" required
            placeholder="vous@exemple.com"
            value={form.email} onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="ct-group">
          <label htmlFor="ct-sujet">Sujet <span className="req">*</span></label>
          <select
            id="ct-sujet" name="sujet" required
            value={form.sujet} onChange={handleChange}
            disabled={loading}
          >
            <option value="" disabled>Choisissez un sujet</option>
            <option>Question sur les tarifs</option>
            <option>Demande de démo</option>
            <option>Support technique</option>
            <option>Signaler un bug</option>
            <option>Partenariat / Presse</option>
            <option>Autre</option>
          </select>
        </div>

        <div className="ct-group">
          <label htmlFor="ct-message">Message <span className="req">*</span></label>
          <textarea
            id="ct-message" name="message" required
            placeholder="Décrivez votre demande en quelques mots…"
            value={form.message} onChange={handleChange}
            disabled={loading}
            rows={5}
          />
        </div>

        <label className="ct-check">
          <input
            type="checkbox" name="consent" required
            checked={form.consent} onChange={handleChange}
            disabled={loading}
          />
          <span>
            J&apos;accepte que mes données soient traitées conformément à la{" "}
            <Link href="/legal/confidentialite">politique de confidentialité</Link> de Kordia.
          </span>
        </label>

        {error && (
          <div className="ct-error">
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M8 5v3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx="8" cy="11" r="0.9" fill="currentColor" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <button type="submit" className="btn btn-violet btn-lg ct-submit" disabled={loading}>
          {loading ? "Envoi en cours…" : "Envoyer le message"}
          {!loading && (
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
              <path d="M2 8l12-5-4 13-3-6-5-2z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <div className="ct-note">
          <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
            <rect x="2.5" y="5" width="9" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
            <path d="M4 5V3.5a3 3 0 016 0V5" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          Vos données ne sont jamais partagées avec des tiers.
        </div>
      </form>
    </div>
  );
}
