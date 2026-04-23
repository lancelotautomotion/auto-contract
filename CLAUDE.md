# Prysme — CLAUDE.md

Contexte projet et roadmap pour les sessions Claude Code.

## Vue d'ensemble

**Prysme** est un SaaS destiné aux gérants de gîtes de location saisonnière. Il automatise la génération de contrats de location, la signature électronique eIDAS, l'envoi des documents par email et le suivi des acomptes.

- **Production** : https://prysme.app
- **Repo** : `lancelotautomotion/auto-contract`
- **Branche de dev principale** : `main` (Vercel auto-deploy)
- **Branche assistant** : `claude/project-assessment-mxfzy`

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
├── layout.tsx                   # ClerkProvider + frFR localization
├── not-found.tsx                # 404 avec force-dynamic
├── a-propos, comment-ca-marche, contact, legal/   # Pages publiques
├── sign-in/[[...sign-in]]       # Auth Clerk avec tabs custom
├── sign-up/[[...sign-up]]       # Auth Clerk avec tabs custom
├── onboarding                   # Config initiale gîte (nom, adresse, etc.)
├── dashboard/
│   ├── Sidebar.tsx              # Navigation + widget d'essai
│   ├── TrialBanner.tsx          # Bandeau haut si essai actif
│   ├── CalendarView.tsx         # Planning réservations
│   ├── reservations, archives, settings, etablissement
│   └── page.tsx                 # Tableau de bord
├── book/[slug]                  # Page publique formulaire de réservation
├── sign/[token]                 # Page signature eIDAS locataire
├── upgrade                      # Page d'abonnement Stripe
└── api/
    ├── stripe (checkout, webhook, portal)
    ├── reservations, gite, onboarding, sign, book
    ├── upload                   # Upload documents Supabase Storage
    ├── cron                     # Tâches planifiées (rappels acompte, etc.)
    └── n8n                      # Webhook automatisation
```

## Points de configuration importants

### Clerk
- Instance **Production** (pas Development) : clés `pk_live_*` / `sk_live_*`
- Custom domain `clerk.prysme.app` (Frontend API) + `accounts.prysme.app` (Account Portal)
- DNS géré par Vercel : CNAMEs vers `frontend-api.clerk.services` / `accounts.clerk.services`
- SSL certs émis par Clerk
- **Pas de `proxyUrl`** dans `ClerkProvider` — connexion directe (supprimé car inutile depuis que le SSL est émis)
- Connexions sociales : Google OAuth activé (credentials custom dans Google Cloud Console)
- Connexion : email + mot de passe + Google

### Stripe
- 3 événements webhook : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- `STRIPE_WEBHOOK_SECRET` dans Vercel env vars
- Price IDs : `STRIPE_PRICE_ID` (plan actuel unique)

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

## 1. UX & Navigation (interface)

### Compte & Facturation
- **Mon Compte / Facturation** : section dédiée dans la sidebar pour gérer profil, intégrer le **Stripe Customer Portal** (changer CB, télécharger factures, gérer abonnement).

### Support
- **Aide & Support** : bouton d'accès rapide (FAQ, mail, chat) dans la sidebar — indispensable au lancement pour capter les retours.

### Refonte graphique
- **Modifier la réservation** : aligner sur la charte graphique.
- **Paramètres** : aligner sur la charte.
- **Upgrade** : afficher toutes les offres
  - Gratuit / période d'essai (barré si expirée)
  - Essentiel : 9,99 € HT
  - Multi-hébergement (jusqu'à 3) : 15 € HT

### Fonctionnalités
- **Export Comptable** : page dédiée pour télécharger un Excel/CSV des réservations du mois (pour le comptable).
- **Responsivité** : compatibilité multi-device (landing + pages publiques + interne SaaS).

### Système de Refus de Réservation (réversible)

**Objectif** : permettre au gérant de décliner une demande proprement, avec possibilité de la réactiver.

1. **Frontend** :
   - Remplacer le bouton "Supprimer" par "Refuser" (rouge secondaire / outline).
   - Modale au clic avec menu déroulant des motifs :
     - Dates déjà réservées
     - Non-respect du règlement (animaux, fêtes, etc.)
     - Durée de séjour incompatible
     - Établissement indisponible (travaux/fermeture)
     - Autre (champ texte conditionnel qui apparaît si "Autre")
   - Bouton "Confirmer le refus et envoyer l'email".

2. **Backend** :
   - Envoi automatique via Resend d'un email poli (remerciement + motif + formule de politesse).
   - Statut BDD → `REFUSÉE`.

3. **État "Refusé" (droit à l'erreur)** :
   - Réservation reste visible avec badge gris/barré.
   - Bouton "Repasser en attente" / "Restaurer" pour réactiver.

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

Prérequis déjà en place : page "Documents" pour uploader RIB, instructions de paiement (joints à l'email automatique).

**Côté locataire** (page Succès après signature) :
- Texte : "Pour bloquer définitivement vos dates, merci de procéder au règlement (coordonnées en PJ de l'email)."
- Bouton 1 : 📎 "Joindre ma preuve de virement (image ou PDF)"
- Bouton 2 : ✉️ "Je confirme avoir posté mon chèque"

**Côté gérant** :
- Email Resend auto : "X a transmis une preuve de paiement".
- Encadré jaune de la réservation mis à jour avec la PJ ou mention chèque.
- Bouton vert "Acompte reçu" reste **100 % manuel** (validation quand l'argent est sur le compte).

**Vigilance Supabase Storage** :
- Limite 5 Mo/fichier côté gérant (déjà en place).
- Côté locataire : compresser impérativement les captures smartphone (ex. `browser-image-compression`, cible 500 Ko max).

## 4. Stratégie & argumentaire

- **Onboarding "Waouh effect"** : s'assurer que l'utilisateur génère et s'envoie **au moins un contrat test** pendant les 30 jours gratuits — c'est la démo qui convertit en abonné.

## 5. Check-list "Go-Live" infra

Avant d'accepter les premiers paiements :

- **Vercel → Pro (20 $/mois)** : indispensable pour éviter l'erreur **504 Timeout** sur la génération PDF (Hobby coupe à 10s). ⚠️ Désactiver **Speed Insights** pour ne pas payer 10 $ de plus.
- **Resend** : plan gratuit limite à 100 emails/jour. Passer au Pro (20 $/mois) dès ~10 clients actifs.
- **Supabase** : 1 Go gratuit ≈ 4000 contrats PDF. Surveiller la métrique storage au fil des mois.

## 6. Onboarding / Inscription

- Finition graphique (padding, margin) notamment sur le **formulaire Clerk** dont l'affichage semble bugger par moments.

---

## Notes utiles pour Claude Code

- **Toujours push sur `main`** (Vercel auto-deploy). La branche `claude/project-assessment-mxfzy` est tolérée mais Vercel surveille `main`.
- **Pas d'emoji** dans le code ni les commits (sauf demande explicite).
- **Pas de commentaires inutiles** — ne documenter que le "why" non évident.
- **Next.js 16 rewrites** : syntaxe `:path*` / `:path*`, pas `(.*)` / `$1`.
- **Prisma 7** : `url` et `directUrl` vont dans `prisma.config.ts`, pas dans `schema.prisma`.
- **Débuggage UI** : toujours tester en navigateur après changement visuel — les tests unitaires ne vérifient pas le rendu.
- **Quand l'utilisateur débute**, guider pas à pas, screenshots attendus. L'utilisateur utilise souvent la navigation privée Chrome pour tester en prod.
