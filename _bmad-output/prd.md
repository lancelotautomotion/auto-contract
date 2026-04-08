---
project: Prysme
version: 1.0
date: '2026-04-08'
author: Lancelot
status: draft
priority_order: [landing, stripe, design, legal, seo, ceo-dashboard, deployment]
out_of_scope: [multi-gites]
---

# PRD — Prysme v1.0

_Document de référence pour l'implémentation des fonctionnalités restantes avant lancement public._

---

## Contexte

Prysme est un SaaS B2B destiné aux propriétaires de gîtes. Il automatise la génération de contrats de location, la collecte d'acomptes et la communication avec les locataires. Le cœur fonctionnel (réservations, contrats PDF, emails, documents, stockage Blob) est opérationnel.

**Objectif v1.0 :** Rendre Prysme prêt pour les premiers utilisateurs payants — landing page qui convertit, souscription Stripe, zero bug critique, déploiement production.

---

## Epics & Stories

---

### EPIC 1 — Landing Page (Priorité absolue)

**Objectif :** Convaincre un propriétaire de gîte en 30 secondes. Réduire la friction à l'inscription.

#### US-1.1 — Hero Section
- En tant que visiteur, je veux comprendre immédiatement ce que fait Prysme et pourquoi c'est pour moi
- **Critères d'acceptation :**
  - Headline fort centré sur le bénéfice (ex : "Vos contrats de location, automatisés en 2 minutes")
  - Sous-titre explicitant le gain concret (temps, légalité, simplicité)
  - CTA principal "Essayer gratuitement 30 jours" → `/sign-up`
  - Visuel produit (screenshot dashboard ou mockup)
  - Aucune CB requise mentionné explicitement sous le CTA

#### US-1.2 — Social Proof / Réassurance
- En tant que visiteur sceptique, je veux être rassuré sur la fiabilité et légalité
- **Critères d'acceptation :**
  - Section "Comment ça marche" (3 étapes max : inscription → paramétrage → premier contrat)
  - 2-3 bénéfices clés avec icônes (contrats conformes, signature numérique, suivi acomptes)
  - Mention RGPD + données hébergées en Europe
  - Lien vers mentions légales dans footer

#### US-1.3 — Pricing Section
- En tant que visiteur intéressé, je veux connaître le prix avant de m'inscrire
- **Critères d'acceptation :**
  - Un seul plan : 9,99 € HT/mois
  - Mention "Sans engagement — résiliez à tout moment"
  - Badge "30 jours gratuits — sans CB"
  - Liste des fonctionnalités incluses (contrats illimités, emails automatiques, stockage documents, support)
  - CTA "Démarrer l'essai gratuit"

#### US-1.4 — Footer
- **Critères d'acceptation :**
  - Liens : Mentions légales · Politique de confidentialité · Contact
  - Copyright Prysme 2026
  - Logo Prysme

#### Notes techniques
- Page `/` (actuellement la page vitrine `/comment-ca-marche` sera fusionnée ou redirigée)
- Inline CSS uniquement (règle projet, aucun Tailwind)
- Optimisée SEO : `<title>`, `<meta description>`, OG tags, structured data (SoftwareApplication)
- Core Web Vitals : LCP < 2.5s, pas d'images non optimisées (utiliser `next/image`)

---

### EPIC 2 — Stripe — Abonnement SaaS

**Objectif :** Monétiser Prysme avec un essai 30 jours sans CB, puis abonnement mensuel 9,99 € HT.

#### US-2.1 — Essai gratuit 30 jours sans CB
- En tant que nouvel utilisateur, je veux essayer Prysme sans donner ma CB
- **Critères d'acceptation :**
  - À l'inscription (post-Clerk onboarding), l'utilisateur entre automatiquement en période d'essai
  - `User.trialEndsAt` = `createdAt + 30 jours`
  - Aucune interaction Stripe requise pendant l'essai
  - Bandeau dans le dashboard indiquant les jours restants : "Essai gratuit — X jours restants"
  - À J-7 : email de rappel envoyé via Resend ("Votre essai se termine dans 7 jours")
  - À J-1 : second email de rappel

#### US-2.2 — Souscription post-essai
- En tant qu'utilisateur dont l'essai expire, je veux pouvoir souscrire facilement
- **Critères d'acceptation :**
  - Page `/subscribe` avec bouton "S'abonner — 9,99 € HT/mois"
  - Bouton redirige vers Stripe Checkout (mode subscription)
  - Après paiement réussi : webhook Stripe → `User.subscriptionStatus = 'active'`
  - Email de confirmation d'abonnement envoyé
  - Redirection vers dashboard après succès

#### US-2.3 — Blocage accès à expiration
- En tant que système, je dois bloquer l'accès au dashboard si l'essai est expiré et non souscrit
- **Critères d'acceptation :**
  - Middleware Next.js vérifie sur toutes les routes `/dashboard/*` :
    - Si `subscriptionStatus === 'active'` → accès autorisé
    - Si `trialEndsAt > now` → accès autorisé (essai en cours)
    - Sinon → redirection vers `/subscribe` avec message "Votre essai a expiré"
  - La page `/subscribe` reste accessible sans restriction
  - Les routes API publiques (webhooks Stripe) ne sont pas protégées

#### US-2.4 — Gestion abonnement (portail client)
- En tant qu'abonné, je veux pouvoir gérer mon abonnement
- **Critères d'acceptation :**
  - Lien "Gérer mon abonnement" dans settings → ouvre Stripe Customer Portal
  - Permet : consulter factures, mettre à jour CB, résilier
  - À résiliation : `User.subscriptionStatus = 'canceled'`, accès maintenu jusqu'à fin de période payée

#### US-2.5 — Webhooks Stripe
- **Événements à gérer :**
  - `checkout.session.completed` → activer abonnement
  - `customer.subscription.updated` → sync statut
  - `customer.subscription.deleted` → désactiver accès
  - `invoice.payment_failed` → email avertissement utilisateur

#### Schéma Prisma à ajouter
```prisma
model User {
  // champs existants...
  stripeCustomerId     String?   @unique
  subscriptionId       String?   @unique
  subscriptionStatus   String?   // 'trialing' | 'active' | 'canceled' | 'past_due'
  trialEndsAt          DateTime?
  currentPeriodEndsAt  DateTime?
}
```

#### Variables d'environnement requises
```
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=          # ID du prix 9,99€/mois dans Stripe Dashboard
STRIPE_PORTAL_CONFIG_ID=  # ID config Customer Portal
```

#### Routes API à créer
- `POST /api/stripe/create-checkout` — crée session Checkout
- `POST /api/stripe/webhook` — reçoit événements Stripe (pas d'auth Clerk)
- `POST /api/stripe/create-portal` — crée session Customer Portal

---

### EPIC 3 — Charte Graphique & Logo Prysme

**Objectif :** Identité visuelle cohérente et professionnelle sur toute l'application.

#### US-3.1 — Logo Prysme
- En tant qu'utilisateur, je veux voir un logo professionnel dans la navbar et les emails
- **Critères d'acceptation :**
  - Logo fourni par Lancelot (SVG ou PNG haute résolution)
  - Intégré dans : navbar dashboard, emails Resend, page de connexion Clerk, landing page, favicon
  - Version light (fond clair) et dark (fond sombre) si nécessaire
  - Favicon `.ico` 32x32 + apple-touch-icon 180x180

#### US-3.2 — Refonte charte graphique SaaS
- En tant qu'utilisateur, je veux une interface cohérente et moderne
- **Critères d'acceptation :**
  - Palette de couleurs définie et appliquée via CSS variables dans `:root`
  - Variables à définir : `--primary`, `--primary-hover`, `--background`, `--surface`, `--text`, `--text-muted`, `--border`, `--success`, `--danger`
  - Typographie : police principale définie (ex: Inter via `next/font`)
  - Composants harmonisés : boutons, cards, inputs, badges, sidebar
  - Mode clair/sombre cohérent sur toutes les pages
  - Aucun Tailwind — inline CSS avec variables CSS uniquement

#### Notes techniques
- Partir des variables CSS existantes dans le projet
- Refonte globale : `src/app/globals.css` pour les variables + reset
- Chaque composant refactorisé garde son inline style, mis à jour avec nouvelles valeurs

---

### EPIC 4 — Page Mentions Légales & Politique de Confidentialité

#### US-4.1 — Mentions légales
- **Critères d'acceptation :**
  - Route : `/legal/mentions-legales`
  - Contenu : éditeur (nom, adresse, SIRET ou statut), hébergeur (Vercel), contact
  - Accessible sans authentification
  - Lien dans footer de la landing page et du dashboard

#### US-4.2 — Politique de confidentialité
- **Critères d'acceptation :**
  - Route : `/legal/confidentialite`
  - Contenu : données collectées (email Clerk, données gîte), finalité, durée conservation, droits utilisateurs (RGPD), DPO contact
  - Mention du sous-traitant Stripe pour les paiements
  - Accessible sans authentification

#### Notes techniques
- Pages statiques (`page.tsx` avec contenu hardcodé)
- Inline CSS, structure simple (titre H1, sections H2, paragraphes)

---

### EPIC 5 — SEO

**Objectif :** Apparaître sur Google pour les recherches liées à la gestion de gîtes.

#### US-5.1 — Metadata de base
- **Critères d'acceptation :**
  - `<title>` et `<meta description>` sur toutes les pages publiques
  - Landing page : title = "Prysme — Contrats de location pour gîtes, automatisés"
  - Description ≤ 155 caractères, centrée sur le bénéfice
  - OG tags : `og:title`, `og:description`, `og:image` (visuel landing)

#### US-5.2 — Structured Data
- **Critères d'acceptation :**
  - JSON-LD `SoftwareApplication` sur la landing page
  - Inclut : name, description, applicationCategory, offers (price 9.99, currency EUR)

#### US-5.3 — Sitemap & Robots
- **Critères d'acceptation :**
  - `/sitemap.xml` généré automatiquement (Next.js `sitemap.ts`)
  - Pages indexées : `/`, `/comment-ca-marche`, `/legal/*`, `/sign-in`, `/sign-up`
  - Pages exclues : `/dashboard/*`, `/api/*`
  - `/robots.txt` : allow landing + legal, disallow dashboard + api

#### US-5.4 — Performance
- **Critères d'acceptation :**
  - Score Lighthouse performance ≥ 90 sur la landing page
  - Toutes les images via `next/image` avec `width`, `height`, `alt`
  - Pas de layout shift (CLS < 0.1)

---

### EPIC 6 — Dashboard CEO

**Objectif :** Permettre à Lancelot de piloter la croissance de Prysme (métriques SaaS internes).

#### US-6.1 — Vue d'ensemble
- En tant que CEO (Lancelot), je veux voir les métriques clés de mon SaaS
- **Critères d'acceptation :**
  - Route protégée : `/admin` — accessible uniquement si `user.clerkId === ADMIN_CLERK_ID` (env var)
  - KPIs affichés :
    - Nombre total d'utilisateurs inscrits
    - Utilisateurs en essai actif (trialEndsAt > now)
    - Utilisateurs abonnés actifs
    - Utilisateurs dont l'essai a expiré sans souscription (churned trial)
    - MRR (Monthly Recurring Revenue) = abonnés actifs × 9,99 €
    - Nouveaux inscrits cette semaine / ce mois

#### US-6.2 — Liste utilisateurs
- **Critères d'acceptation :**
  - Tableau : email, date inscription, statut (essai / abonné / expiré), fin essai / fin période
  - Tri par date inscription (desc)
  - Pas de pagination pour v1 (< 100 utilisateurs attendus au lancement)

#### Notes techniques
- Variable d'environnement : `ADMIN_CLERK_ID=` (clerkId de Lancelot)
- Données serveur uniquement (Server Component, pas d'API exposée)
- Inline CSS, design sobre

---

### EPIC 7 — Déploiement Vercel Production

**Objectif :** Prysme accessible en production sur son nom de domaine.

#### US-7.1 — Configuration Vercel
- **Critères d'acceptation :**
  - Projet connecté au repo GitHub `lancelotautomotion/auto-contract`
  - Branche de déploiement : `main`
  - Toutes les variables d'environnement configurées dans Vercel Dashboard :
    - `DATABASE_URL`, `DIRECT_URL`
    - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
    - `CLERK_WEBHOOK_SECRET`
    - `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
    - `BLOB_READ_WRITE_TOKEN`
    - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`, `STRIPE_PORTAL_CONFIG_ID`
    - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
    - `NEXT_PUBLIC_APP_URL` = `https://prysme.fr` (ou le domaine choisi)
    - `ADMIN_CLERK_ID`

#### US-7.2 — Nom de domaine
- **Critères d'acceptation :**
  - Domaine configuré dans Vercel (DNS pointant vers Vercel)
  - HTTPS automatique (Let's Encrypt via Vercel)
  - Redirection `www.` → apex (ou inverse)
  - `NEXT_PUBLIC_APP_URL` mis à jour avec le domaine final

#### US-7.3 — Base de données production
- **Critères d'acceptation :**
  - `prisma migrate deploy` exécuté sur la base de données Neon production
  - Vérification que toutes les migrations sont appliquées
  - Seed initial si nécessaire (aucun pour v1)

#### US-7.4 — Checklist pré-lancement
- [ ] Clerk webhooks configurés avec l'URL de production
- [ ] Stripe webhooks configurés avec l'URL de production (`/api/stripe/webhook`)
- [ ] Test end-to-end : inscription → essai → souscription → génération contrat → email
- [ ] Lighthouse audit landing page ≥ 90
- [ ] Aucune erreur dans Vercel logs au démarrage

---

## Ordre d'implémentation recommandé

| # | Epic | Justification |
|---|------|---------------|
| 1 | Charte graphique + Logo | Socle visuel nécessaire avant la landing |
| 2 | Landing page | Priorité absolue — convertit les visiteurs |
| 3 | Responsivité | Appliquée en continu sur chaque écran développé |
| 4 | Mentions légales | Requis légalement avant tout lancement |
| 5 | Stripe | Monétisation — bloquer l'accès après essai |
| 6 | SEO | Optimiser pendant qu'on finalise le contenu |
| 7 | Dashboard CEO | Suivi interne pour le lancement |
| 8 | Déploiement Vercel | Étape finale |

---

## Hors périmètre v1.0

- **Multi-gîtes** : gérer plusieurs gîtes depuis un seul compte → v2.0
- **Portail locataire** : espace dédié aux locataires pour signer en ligne → v2.0
- **Statistiques avancées** : revenus par saison, taux d'occupation → v2.0
- **Abonnement annuel** : tarif réduit avec engagement 12 mois → v2.0

---

## Responsivité (contrainte transversale)

**Applicable à toutes les pages et composants.**

#### Breakpoints
- **Mobile** : `max-width: 768px` — navigation hamburger, colonnes empilées, touch-friendly (min 44px tap targets)
- **Tablette** : `769px – 1024px` — layout adapté, sidebar réduite ou collapsible
- **Desktop** : `> 1024px` — layout full, sidebar fixe

#### Critères d'acceptation globaux
- Aucun scroll horizontal sur aucun breakpoint
- Toutes les actions clés accessibles sur mobile (créer réservation, envoyer email, voir contrat)
- Sidebar dashboard : collapsible sur tablette, hamburger menu sur mobile
- Tableaux : scroll horizontal interne ou affichage en cards sur mobile
- Formulaires : inputs pleine largeur sur mobile
- Testé sur : Chrome DevTools (iPhone 14, iPad, 1440px desktop)

#### Implémentation
- Media queries inline via `style` + `@media` dans `<style>` tags de composants, **ou** via `globals.css` pour les patterns répétitifs
- Aucun framework CSS — responsive en CSS natif uniquement

---

## Contraintes techniques globales

- Inline CSS uniquement — aucun Tailwind, aucune classe CSS
- **Responsive obligatoire** sur tous les écrans (mobile / tablette / desktop)
- Auth via `requireAuth()` / `requireGite()` de `src/lib/auth.ts`
- Fichiers binaires → Vercel Blob uniquement (pas de base64 en DB)
- Prisma avec PrismaPg adapter (pas le client standard)
- Filtres sur relations optionnelles : `{ is: { ... } }` obligatoire
- Next.js App Router uniquement — pas de `pages/`
- Langue interface : français

---

_Last Updated: 2026-04-08_
