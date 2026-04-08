---
project_name: Prysme
user_name: Lancelot
date: '2026-04-08'
sections_completed:
  - technology_stack
  - language_rules
  - framework_rules
  - storage_email_pdf
  - code_quality
  - workflow
status: complete
rule_count: 42
optimized_for_llm: true
---

# Project Context for AI Agents

_Ce fichier contient les règles critiques que les agents IA doivent suivre lors de l'implémentation de code dans Prysme. Il se concentre sur les détails non évidents que les agents pourraient manquer._

---

## Technology Stack & Versions

- **Next.js** 16.2.1 — App Router (pas Pages Router). Turbopack en dev.
- **React** 19.2.4
- **TypeScript** 5.x — strict mode activé
- **Prisma** 7.5.0 + **@prisma/adapter-pg** 7.5.0 (driver PostgreSQL natif)
- **PostgreSQL** — Neon/Supabase pooler (connexion via `DATABASE_URL`)
- **Clerk** 7.0.7 — authentification
- **Resend** 6.9.4 — emails transactionnels
- **@vercel/blob** 2.3.3 — stockage fichiers (logos, documents, PDFs signés)
- **@react-pdf/renderer** 4.3.2 — génération PDF côté serveur
- **Zod** 4.3.6 — validation des données
- **react-hook-form** 7.72.0
- **Tailwind CSS** 4.x — installé mais **NON UTILISÉ** (conflit Codespace)

---

## Critical Implementation Rules

### Language-Specific Rules

- `strict: true` activé — pas de `any` implicite, null checks obligatoires
- `ignoreBuildErrors: true` dans `next.config.ts` — les erreurs TS ne bloquent pas le build (ne pas en abuser : corriger les vrais types)
- Alias `@/*` → `./src/*` — toujours utiliser `@/` pour les imports internes, jamais de chemins relatifs multi-niveaux
- Pattern `params: Promise<{ id: string }>` pour les routes dynamiques Next.js 15 — params est une **Promise**, toujours `await params`
- Retourner `NextResponse.json({ error: '...' }, { status: NNN })` pour toutes les erreurs API — jamais de réponse vide (cause des "Unexpected end of JSON" côté client)
- Les routes critiques wrappent leur corps dans un `try/catch`
- Clerk : ne **jamais** importer `auth` depuis `@clerk/nextjs/server` directement dans les routes API — toujours passer par `@/lib/auth`

### Framework-Specific Rules

**Next.js App Router**
- Toutes les pages sont des Server Components par défaut — ajouter `"use client"` uniquement quand nécessaire (hooks, événements, état local)
- Routes API dans `src/app/api/` — pattern : `export async function GET/POST/PATCH/DELETE`
- `strategy="beforeInteractive"` n'est **pas** supporté en App Router — ne jamais utiliser `<Script>` avec cette stratégie

**Authentification (pattern obligatoire dans les routes API)**
```ts
const [ctx, err] = await requireGite();
if (err) return err;
// ctx.userId (DB user id), ctx.giteId
```
- `requireAuth()` → `ctx.userId`
- `requireGite()` → `ctx.userId` + `ctx.giteId`
- Toutes les requêtes Prisma filtrent par `gite: { userId: ctx.userId }` ou `giteId: ctx.giteId`
- Exceptions légitimes pour `auth()` Clerk direct : `src/middleware.ts` et les pages dashboard (server components pour redirects)

**Prisma (règles critiques)**
- Utiliser `PrismaPg` adapter — **pas** le client Prisma standard
- Pour filtrer sur une relation 1-to-1 optionnelle (`contract Contract?`) : `{ is: { status: 'SIGNED' } }` — **pas** `{ status: 'SIGNED' }` directement
- `prisma db push` nécessite `DATABASE_URL` dans `.env.local` (chargé via `require("dotenv").config({ path: ".env.local" })` dans `prisma.config.ts`)
- Après chaque `prisma db push` : toujours lancer `npx prisma generate`

**Styling — règle absolue**
- ⛔ **AUCUNE classe Tailwind** — installé mais non utilisé
- ✅ Uniquement CSS inline : `style={{ ... }}`
- ✅ Variables CSS globales : `var(--text)`, `var(--text-muted)`, `var(--bg)`, `var(--bg-white)`, `var(--bg-card)`, `var(--border)`
- Polices : Cormorant Garamond (titres `fontFamily: 'Cormorant Garamond, Georgia, serif'`), Inter (corps)

### Storage, Email & PDF Rules

**Vercel Blob**
- Tous les fichiers binaires → Vercel Blob — **jamais** de base64 en DB
- Upload via `POST /api/upload` (authentifié) → retourne `{ url: string }`
- Suppression : appeler `del(url)` depuis `@vercel/blob` avant de supprimer le record DB
- Store doit être en accès **Public** (les stores Private bloquent `put()` avec `access: "public"`)
- Env requis : `BLOB_READ_WRITE_TOKEN`

**Logos & Documents**
- Logo stocké dans `Gite.logoUrl` (Blob URL) — passer comme `logoPublicUrl` à `buildEmailHtml()`
- Documents gérant : modèle `GiteDocument { id, label, fileName, mimeType, fileUrl, giteId }`
- Pour email attachments : `fetch(doc.fileUrl)` → `Buffer.from(await res.arrayBuffer())` → `{ filename, content: buffer.toString("base64") }`
- Ne jamais exposer `fileUrl` directement au locataire

**PDFs**
- Générés à la volée avec `@react-pdf/renderer` — jamais stockés en DB
- Exception : `Contract.signedPdfUrl` — PDF signé uploadé dans Blob lors de `mark-deposit`
- `download-signed-contract` : redirect Blob si `signedPdfUrl` existe, sinon régénère (fallback rétrocompat)
- `ContractData.logoUrl` attend une URL Blob (pas base64)

**Emails (Resend)**
- Template partagé : `buildEmailHtml({ giteName, logoPublicUrl, preheader, body })`
- Pièces jointes : `{ filename: string, content: string }` (content = base64)
- Env requis : `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NEXT_PUBLIC_APP_URL`

### Code Quality & Style Rules

**Organisation des fichiers**
- Pages : `src/app/[route]/page.tsx` (Server Components)
- Composants client : `src/app/[route]/NomComposant.tsx` (`"use client"` en haut)
- Routes API : `src/app/api/[route]/route.ts`
- Libs partagées : `src/lib/` (auth, prisma, emailTemplate, contractPdf, defaultContractTemplate)
- Providers : `src/providers/`

**Nommage**
- Fichiers composants : PascalCase (`ContractActions.tsx`)
- Fichiers routes/pages : kebab-case ou brackets (`route.ts`, `[id]/`)
- Fonctions/variables : camelCase

**Règles de design**
- Ne pas ajouter de gestion d'erreurs pour des scénarios impossibles
- Ne pas créer de helpers pour des opérations one-shot
- Pas de commentaires sauf si la logique n'est pas évidente
- Ne pas ajouter de fonctionnalités non demandées
- Pas de tests automatisés en place actuellement

### Development Workflow Rules

**Environnement**
- Dev : GitHub Codespace (`/workspaces/auto-contract`)
- Variables d'env dans `.env.local` (jamais committées)
- Redémarrer le serveur si changement dans `src/lib/` ou `prisma/`

**Variables d'environnement requises**
```env
DATABASE_URL=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
NEXT_PUBLIC_APP_URL=
BLOB_READ_WRITE_TOKEN=
```

**Git**
- Branche principale : `main`, push direct
- Commits en anglais : `type: description courte`
- Types : `feat`, `fix`, `refactor`, `chore`

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge

**For Humans:**
- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

_Last Updated: 2026-04-08_
</content>
</invoke>