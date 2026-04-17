'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', sujet: '', message: '', consent: false,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="contact-form-wrap reveal reveal-d1">
        <div className="cf-success">
          <div className="cf-success-icon">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" stroke="#4A7353" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>Message envoyé !</h3>
          <p>Nous vous répondrons sous 24h. Merci de nous avoir contactés.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-form-wrap reveal reveal-d1">
      <div className="cf-title">Envoyez-nous un message</div>
      <div className="cf-desc">Remplissez le formulaire et nous reviendrons vers vous rapidement.</div>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Prénom</label>
            <input className="form-input" type="text" name="prenom" placeholder="Votre prénom" value={form.prenom} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Nom</label>
            <input className="form-input" type="text" name="nom" placeholder="Votre nom" value={form.nom} onChange={handleChange} required />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" name="email" placeholder="vous@exemple.com" value={form.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label className="form-label">Sujet</label>
          <select className="form-select" name="sujet" value={form.sujet} onChange={handleChange} required>
            <option value="" disabled>Choisissez un sujet</option>
            <option>Question sur les tarifs</option>
            <option>Demande de démo</option>
            <option>Support technique</option>
            <option>Partenariat / Presse</option>
            <option>Autre</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Message</label>
          <textarea className="form-textarea" name="message" placeholder="Décrivez votre demande en quelques mots..." value={form.message} onChange={handleChange} required />
        </div>
        <div className="form-check">
          <input type="checkbox" id="consent" name="consent" checked={form.consent} onChange={handleChange} required />
          <label htmlFor="consent">
            J&apos;accepte que mes données soient traitées conformément à la{' '}
            <Link href="/legal/confidentialite">politique de confidentialité</Link> de Prysme.
          </label>
        </div>
        <button className="btn btn-violet btn-lg btn-full" type="submit">
          Envoyer le message
          <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
            <path d="M2 8l5 5L14 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </form>
      <div className="cf-note">
        <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
          <rect x="2" y="3" width="10" height="8" rx="1.5" stroke="#A3A3A0" strokeWidth="1"/>
          <path d="M5 7l1.5 1.5L9 5.5" stroke="#A3A3A0" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Vos données ne sont jamais partagées avec des tiers.
      </div>
    </div>
  );
}
