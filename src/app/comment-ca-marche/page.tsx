import Link from "next/link";
import '@/styles/landing.css';
import './comment-ca-marche.css';
import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";
import FaqAccordion from "./FaqAccordion";
import StepVisual from "./StepVisual";

const steps = [
  {
    n: '01',
    badge: '5 min · une seule fois',
    title: 'Configurez votre gîte',
    desc: "Créez votre compte, renseignez les informations de votre établissement, importez votre logo et vos documents. Votre template de contrat est prêt à l'emploi.",
    points: [
      'Nom, adresse et coordonnées du gîte',
      'Logo sur le contrat et dans les emails',
      'RIB et règlement intérieur joints automatiquement',
      'Options à la carte (ménage, bain nordique…)',
    ],
  },
  {
    n: '02',
    badge: '2 min · par réservation',
    title: 'Saisissez la réservation',
    desc: "Pour chaque séjour, renseignez les coordonnées du locataire, les dates, le loyer et les options. Tout est centralisé dans une seule fiche.",
    points: [
      'Prénom, nom, email, téléphone, adresse',
      "Dates d'arrivée et de départ",
      'Loyer, acompte, frais de ménage, taxe de séjour',
      'Options sélectionnables en un clic',
    ],
  },
  {
    n: '03',
    badge: '1 clic · automatique',
    title: 'Envoyez le contrat',
    desc: "Un clic génère le contrat PDF avec toutes les informations pré-remplies et envoie un email professionnel au locataire avec les pièces jointes.",
    points: [
      'Contrat PDF généré instantanément',
      'Email avec logo et identité de votre gîte',
      'RIB et règlement intérieur joints',
      'Suivi du statut en temps réel',
    ],
  },
  {
    n: '04',
    badge: 'Côté locataire · mobile',
    title: 'Le locataire signe en ligne',
    desc: "Votre locataire reçoit l'email, lit le contrat depuis son navigateur et le signe électroniquement. Aucune impression, aucun scan, aucun compte à créer.",
    points: [
      "Accessible depuis n'importe quel appareil",
      'Lecture intégrale du contrat avant signature',
      'Signature conforme eIDAS (UE n°910/2014)',
      'Horodatage et IP enregistrés automatiquement',
    ],
  },
  {
    n: '05',
    badge: 'Automatique · immédiat',
    title: 'Les deux parties reçoivent le PDF signé',
    desc: "Dès la signature, Prysme envoie le contrat signé en PDF au locataire et à vous. Le statut passe à « Signé » dans votre tableau de bord et la réservation est archivée.",
    points: [
      'PDF signé envoyé au locataire par email',
      'Copie automatique envoyée au gérant',
      'Statut mis à jour dans le dashboard',
      'Archivé et consultable à tout moment',
    ],
  },
];

export default function CommentCaMarche() {
  return (
    <>
      <Nav />

      <main className="ccm-main">

        {/* ── Hero ── */}
        <section className="ccm-hero">
          <div className="ccm-hero-inner">
            <div className="ccm-hero-grid">
              <div className="ccm-hero-text">
                <p className="ccm-eyebrow">Comment ça marche</p>
                <h1>
                  De la réservation<br />
                  au contrat <span className="v">signé</span>,<br />
                  en 3 minutes.
                </h1>
                <p className="ccm-hero-sub">
                  Prysme automatise tout ce qui suit une réservation. Voici exactement comment ça se passe, étape par étape.
                </p>
                <div className="ccm-hero-stats">
                  <div><strong>5 min</strong><span>config initiale</span></div>
                  <div><strong>2 min</strong><span>par réservation</span></div>
                  <div><strong>1 clic</strong><span>pour envoyer</span></div>
                </div>
              </div>

              <div className="ccm-flow">
                <div className="ccm-flow-item">
                  <div className="ccm-flow-dot">01</div>
                  <div className="ccm-flow-body">
                    <div className="ccm-flow-title">Réservation enregistrée</div>
                    <div className="ccm-flow-sub">Marie Dupont · 3 nuits · 14 juillet</div>
                  </div>
                </div>
                <div className="ccm-flow-line" />
                <div className="ccm-flow-item">
                  <div className="ccm-flow-dot">02</div>
                  <div className="ccm-flow-body">
                    <div className="ccm-flow-title">Contrat généré &amp; envoyé</div>
                    <div className="ccm-flow-sub">PDF + email pro avec pièces jointes</div>
                  </div>
                </div>
                <div className="ccm-flow-line" />
                <div className="ccm-flow-item done">
                  <div className="ccm-flow-dot">
                    <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                      <path d="M4 8l2.5 2.5L12 5.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="ccm-flow-body">
                    <div className="ccm-flow-title">Contrat signé</div>
                    <div className="ccm-flow-sub">Les deux parties reçoivent le PDF signé</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Étapes détaillées ── */}
        {steps.map((step, i) => (
          <section key={step.n} className={`ccm-step${i % 2 === 1 ? ' alt' : ''}`}>
            <div className="ccm-step-inner">
              <div className="ccm-step-grid">
                <div className="ccm-step-text" style={{ order: i % 2 === 0 ? 0 : 1 }}>
                  <div className="ccm-step-head">
                    <span className="ccm-step-num">{step.n}</span>
                    <span className="ccm-step-badge">{step.badge}</span>
                  </div>
                  <h2 className="ccm-step-title">{step.title}</h2>
                  <p className="ccm-step-desc">{step.desc}</p>
                  <ul className="ccm-step-points">
                    {step.points.map(pt => (
                      <li key={pt}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="8" fill="#EFEEF9" />
                          <path d="M5 8l2.5 2.5L11 5.5" stroke="#7F77DD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="ccm-step-visual" style={{ order: i % 2 === 0 ? 1 : 0 }}>
                  <StepVisual step={step.n} />
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* ── FAQ ── */}
        <section className="ccm-faq">
          <div className="ccm-faq-inner">
            <div className="ccm-faq-grid">
              <div>
                <p className="ccm-eyebrow">FAQ</p>
                <h2 className="ccm-faq-title">Vos questions,<br /><span className="v">nos réponses.</span></h2>
                <p className="ccm-faq-sub">
                  Une question absente&nbsp;?<br />
                  Écrivez-nous à <a href="mailto:contact@prysme.app">contact@prysme.app</a>
                </p>
              </div>
              <FaqAccordion />
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="ccm-cta">
          <div className="ccm-cta-inner">
            <h2>
              Prêt à gagner<br />
              <span className="g">30 min par réservation&nbsp;?</span>
            </h2>
            <p>Configuration en 5 minutes. 30 jours d&apos;essai gratuits. Aucune carte bancaire requise.</p>
            <Link href="/sign-up" className="btn btn-violet btn-lg">
              Créer mon compte gratuitement
              <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                <path d="M3 8h10m-4-4l4 4-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
