# Prysme — CLAUDE.md

Contexte projet et roadmap pour les sessions Claude Code.

## Vue d'ensemble

**Prysme** est un SaaS destiné aux gérants de gîtes de location saisonnière. Il automatise la génération de contrats de location, la signature électronique eIDAS, l'envoi des documents par email et le suivi des acomptes.

- **Production** : https://prysme.app
- **Repo** : `lancelotautomotion/auto-contract`
- **Branche de dev principale** : `main` (Vercel auto-deploy)

## Stack technique

| Couche | Techno |
|---|---|
| Framework | Next.js 16 (App Router, Server Components) |
| Runtime | React 19 |
| DB | Supabase Postgres (pooler port 6543 en `DATABASE_URL`, direct 5432 en `DIRECT_URL`) |
| ORM | Prisma 7 (config dans `prisma.config.ts`, plus dans `schema.prisma`) |
| Auth | Clerk (instance production, custom domain `clerk.prysme.app`) |
| Paiement | Stripe (mode live, webhook configuré avec 3 événements) |
| Email | Resend (domaine `prysme.app` vérifié) |
| Storage | Supabase Storage (limite 5 Mo/fichier côté gérant, 1 Go total plan gratuit) |
| PDF | pdfkit |
| Déploiement | Vercel (plan Hobby actuellement) |
| Style | Tailwind 4 + CSS modules custom (`src/styles/*.css`) |

## Convention / style

- **Polices** : Plus Jakarta Sans (inscription, onboarding, auth)
- **Palette** :
  - Violet principal : `#7F77DD` (variations `#9B95E8`, `#5B52B5`)
  - Vert accent : `#689D71`
  - Fond clair : `#F3F2EE` / `#F4F3F0`
  - Texte : `#2C2C2A` (principal) / `#71716E` (secondaire) / `#A3A3A0` (tertiaire)
- **Rayons** : cartes 12–16px, inputs 10px, boutons 10px
- **Langue UI** : 100 % français (Clerk avec `frFR`)
- **Composants créés** : préférer éditer les CSS existants dans `src/styles/` plutôt que d'ajouter des fichiers

## Architecture

```
src/app/
├── page.tsx                     # Landing
├── layout.tsx                   # ClerkProvider + frFR + viewport-fit=cover
├── not-found.tsx                # 404 avec force-dynamic
├── a-propos, comment-ca-marche, contact, legal/   # Pages publiques
├── sign-in/[[...sign-in]]       # Auth Clerk avec tabs custom + bouton retour
├── sign-up/[[...sign-up]]       # Auth Clerk avec tabs custom + bouton retour
├── onboarding                   # Config initiale gîte (nom, adresse, etc.)
├── dashboard/
│   ├── DashboardShell.tsx       # Client component — gère l'état open/close sidebar mobile
│   ├── Sidebar.tsx              # Navigation + widget d'essai + drawer mobile
│   ├── CopyBookingUrlButton.tsx # Bouton copier lien public (vert) ou configurer
│   ├── TrialBanner.tsx          # Bandeau haut si essai actif
│   ├── CalendarView.tsx         # Planning réservations
│   ├── reservations, archives, settings, etablissement, compte
│   └── page.tsx                 # Tableau de bord
├── book/[slug]                  # Page publique formulaire de réservation (2 colonnes)
├── sign/[token]                 # Page signature eIDAS locataire
├── upgrade                      # Page d'abonnement Stripe (3 plans)
└── api/
    ├── stripe (checkout, webhook, portal)
    ├── reservations, gite, onboarding, sign, book
    ├── upload                   # Upload documents Supabase Storage
    ├── cron                     # Tâches planifiées (rappels acompte, etc.)
    └── n8n                      # Webhook automatisation

src/styles/
├── landing.css                  # Landing page (scoped avec :has(nav.nav) pour éviter leak)
├── dashboard.css                # Dashboard — design system complet + media queries 1024/640px
├── pages.css                    # Auth pages (sign-in, sign-up) avec .auth-layout
├── book.css                     # Page de réservation publique
├── sign.css                     # Page signature locataire
├── onboarding.css               # Onboarding
└── upgrade.css                  # Page upgrade — grille 3→1 col à 860px
```

## Points de configuration importants

### Clerk
- Instance **Production** (pas Development) : clés `pk_live_*` / `sk_live_*`
- Custom domain `clerk.prysme.app` (Frontend API) + `accounts.prysme.app` (Account Portal)
- DNS géré par Vercel : CNAMEs vers `frontend-api.clerk.services` / `accounts.clerk.services`
- SSL certs émis par Clerk
- **Pas de `proxyUrl`** dans `ClerkProvider` — connexion directe
- Connexions sociales : Google OAuth activé (credentials custom dans Google Cloud Console)
- Connexion : email + mot de passe + Google

### Stripe
- 3 événements webhook : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- `STRIPE_WEBHOOK_SECRET` dans Vercel env vars
- Price IDs : `STRIPE_PRICE_ID` (plan actuel unique)

### Storage — IMPORTANT
- **Ne pas utiliser `@vercel/blob`** : `BLOB_READ_WRITE_TOKEN` n'est pas configuré. Toute route utilisant `put()` de `@vercel/blob` retournera une erreur 500.
- La route `mark-deposit` a été corrigée : elle génère le PDF en mémoire pour l'email, sans upload Blob. Le téléchargement PDF se fait par régénération à la demande (`download-signed-contract`).
- Utiliser **Supabase Storage** pour tout nouveau besoin de stockage fichier.

### DNS (Vercel DNS pour `prysme.app`)
- ALIAS `*` → `cname.vercel-dns-017.com` (Vercel automatique)
- CNAME `clerk` → `frontend-api.clerk.services`
- CNAME `accounts` → `accounts.clerk.services`
- CNAME `clkmail`, `clk._domainkey`, `clk2._domainkey` → Clerk (email)
- TXT `resend._domainkey`, TXT `send` (SPF), MX `send` → Resend
- CAA : `pki.goog`, `sectigo.com`, `letsencrypt.org`

### Env vars critiques (Vercel)
- `DATABASE_URL` (pooler 6543), `DIRECT_URL` (5432)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL` = `https://prysme.app`

## Commandes

```bash
npm run dev         # Dev local
npm run build       # prisma generate && prisma migrate deploy && next build
npm run lint
```

Migrations : `npx prisma migrate dev --name <nom>` en local, `prisma migrate deploy` auto sur Vercel.

---

# Roadmap — prochaines étapes

## 1. UX & Navigation — à faire

### Fonctionnalités manquantes
- **Système de Refus de Réservation** (priorité haute) : remplacer "Supprimer" par "Refuser" avec modale + motifs + email Resend automatique + statut `REFUSÉE` en BDD + bouton "Restaurer".
- **Export Comptable** : page dédiée pour télécharger un CSV/Excel des réservations par période (pour le comptable).
- **Aide & Support** : bouton dans la sidebar (FAQ, mail, chat) — indispensable au lancement.

### Refonte graphique restante
- **Modifier la réservation** (`/dashboard/reservations/[id]/edit`) : aligner sur la charte graphique.
- **Paramètres** (`/dashboard/settings`) : aligner sur la charte.

## 2. Éditeur de contrat (sécurisation)

- **Alertes balises obligatoires** : avertissement visuel (rouge) si le gérant supprime `[Loyer €]`, `[Nom client]`, etc.
- **Séparer tronc légal / clauses libres** : bloc "Conditions Générales" (socle légal Prysme) + "Règlement intérieur" libre.
- **Nettoyeur de copier-coller** : purifier auto le HTML invisible venant de Word avant rendu PDF.

## 3. "Game Changers"

- **Synchronisation iCal** : import des liens iCal Airbnb/Booking, dates grisées sur le calendrier (anti-surbooking).
- **Mini-CRM** : annuaire des anciens locataires pour relances année suivante.
- **Checkbox RGPD** (formulaire public) : "J'accepte de recevoir des offres du gîte" (décochée par défaut) — conformité CNIL pour le CRM.

### Gestion des Preuves de Paiement

**Objectif** : rassurer le locataire pendant le délai bancaire, centraliser l'info pour le gérant.

**Côté locataire** (page Succès après signature) :
- Bouton "Joindre ma preuve de virement (image ou PDF)"
- Bouton "Je confirme avoir posté mon chèque"

**Côté gérant** :
- Email Resend auto à réception d'une preuve.
- Encadré jaune mis à jour avec la PJ ou mention chèque.
- Bouton vert "Acompte reçu" reste 100 % manuel.

**Note** : côté locataire, compresser les images smartphone (`browser-image-compression`, cible 500 Ko max).

## 4. Stratégie & argumentaire

- **Onboarding "Waouh effect"** : s'assurer que l'utilisateur génère et s'envoie au moins un contrat test pendant les 30 jours gratuits — c'est la démo qui convertit en abonné.

## 5. Check-list "Go-Live" infra

- **Vercel → Pro (20 $/mois)** : indispensable pour éviter l'erreur **504 Timeout** sur la génération PDF (Hobby coupe à 10s). Désactiver Speed Insights pour ne pas payer 10 $ de plus.
- **Resend** : plan gratuit limite à 100 emails/jour. Passer au Pro (20 $/mois) dès ~10 clients actifs.
- **Supabase** : 1 Go gratuit ≈ 4000 contrats PDF. Surveiller la métrique storage.

---

# Historique des sessions — travaux réalisés

## Session avril 2026

### Bugs corrigés
- **"Acompte reçu" → Erreur interne** : la route `mark-deposit` utilisait `@vercel/blob` (token non configuré). Supprimé l'upload Blob — le PDF est généré en mémoire pour l'email, le téléchargement se fait par régénération à la demande.
- **Scrollbar au milieu du dashboard** : `.app` était `position: fixed; inset: 0` + `.main { overflow-y: auto }`. Remplacé par layout naturel (`min-height: 100vh`) avec sidebar sticky (`position: sticky; height: 100dvh`).
- **Logo Prysme pixelisé en sidebar** : `filter: brightness(10)` créait des artefacts. Remplacé par `brightness(0) invert(1)` pour un blanc propre sans halation.
- **Barre blanche sur sign-in** : `landing.css` avait `body { padding-top: 68px }` qui leaked globalement. Scopé avec `body:has(nav.nav)`.

### Améliorations UI
- **Page `/upgrade`** : refonte 3 plans (Gratuit / Essentiel 9,99€ / Multi-hébergement 15€), cards égales hauteur, CTA alignés en bas, bouton retour visible, responsive grille 3→1 col à 860px.
- **Auth pages** : bouton "Retour à l'accueil" ajouté (desktop dans le panneau gauche, mobile dans le panneau formulaire).
- **Dashboard mobile** : sidebar drawer avec hamburger vert, overlay, `safe-area-inset-bottom`, `100dvh`.
- **Bouton "Lien de réservation"** : composant `CopyBookingUrlButton` sur le dashboard et la page réservations — vert (copie URL) si slug configuré, outline (lien vers config) sinon. Même ligne que "Nouvelle réservation", largeurs égales sur mobile.
- **Page de tarification landing** : CTAs alignés en bas sur les 3 cards (flex column + flex:1 sur `.pc-feat`).

### Responsivité — audit complet
Toutes les pages sont maintenant responsive :
- `viewport-fit=cover` dans `layout.tsx` pour les safe areas iOS
- `100dvh` sur les sidebars (desktop + mobile)
- `padding-bottom: max(env(safe-area-inset-bottom), Npx)` sur les drawers
- `.resa-table { min-width: 560px }` + `.table-card { overflow-x: auto }` pour le scroll horizontal
- `.a-table` wrappée dans un div `overflow-x: auto` dans archives
- Landing pricing : grille 3 colonnes se stack verticalement sur mobile

---

## Notes utiles pour Claude Code

- **Toujours push sur `main`** (Vercel auto-deploy).
- **Pas d'emoji** dans le code ni les commits (sauf demande explicite).
- **Pas de commentaires inutiles** — ne documenter que le "why" non évident.
- **Next.js 16 rewrites** : syntaxe `:path*`, pas `(.*)`.
- **Prisma 7** : `url` et `directUrl` vont dans `prisma.config.ts`, pas dans `schema.prisma`.
- **Ne pas utiliser `@vercel/blob`** : token non configuré, utiliser Supabase Storage.
- **CSS global leak** : dans Next.js App Router, tout CSS importé est global. Scoper avec `:has()` si nécessaire (ex: `body:has(nav.nav)`).
- **Clerk appearance API** : les styles JS créent des inline styles. Pour surcharger, utiliser `!important` en CSS.
- **Débuggage UI** : toujours tester en navigateur après changement visuel.
