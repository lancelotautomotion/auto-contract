# Prysme — Parcours Utilisateur Complet

## Document de référence UX

**Version** : 1.0 — Avril 2026
**Objectif** : Décrire l'intégralité du parcours utilisateur, de la découverte à l'abonnement payant, incluant les états bloqués, les règles métier et les flux transactionnels. Ce document sert de spécification pour une review complète de l'expérience utilisateur.

\---

## 1\. Vue d'ensemble du funnel

```
Visiteur → Landing Page → Inscription (essai gratuit 1 mois) → Onboarding → Usage → Fin d'essai → Paywall → Abonnement payant → Usage illimité
```

### Les 3 profils utilisateurs

|Profil|Description|Pages accessibles|
|-|-|-|
|**Visiteur** (non connecté)|Découvre Prysme via la landing page|Landing, À propos, Contact, CGU, Mentions légales, Confidentialité, Page connexion/inscription|
|**Utilisateur essai** (connecté, période d'essai active)|Accès complet pendant 1 mois|Toutes les pages app (Dashboard, Réservations, Archives, Mon établissement, Paramètres)|
|**Utilisateur payant** (abonné)|Accès complet permanent|Toutes les pages app|
|**Utilisateur expiré** (essai terminé, non converti)|Accès restreint|Pages en lecture seule + paywall|

### Le 4ème profil : le Locataire (client du gérant)

|Profil|Description|Pages accessibles|
|-|-|-|
|**Locataire**|Client du gérant, reçoit un lien|Formulaire de réservation, Page de signature du contrat|

\---

## 2\. Phase 1 — Découverte (Visiteur)

### 2.1 Points d'entrée

Le visiteur peut arriver sur Prysme depuis :

* Recherche Google ("logiciel gestion gîte", "contrat location saisonnière automatique")
* Bouche-à-oreille / lien direct
* Prospection email (campagne Prysme)
* Réseaux sociaux

### 2.2 Landing Page (`prysme-landing-v3.html`)

**Objectif** : Convaincre le visiteur de s'inscrire à l'essai gratuit.

**Parcours de lecture** :

1. **Hero** : accroche "Vos réservations, structurées. Vos contrats, signés." + CTA principal "Démarrer l'essai gratuit" + mockup dashboard
2. **Problèmes résolus** : 6 frictions identifiées (Word, signature papier, suivi, eIDAS, Airbnb, éparpillement)
3. **Features** : Contrats auto-générés (avec UI card contrat) + Calendrier/suivi (avec UI card calendrier)
4. **Avant vs Après** : comparaison visuelle + chiffres clés (3 min, 30 min économisées, 0 erreur)
5. **Pricing** : 3 plans (Découverte 0€, Essentiel 9,99€, Multi-gîtes 15€)
6. **Témoignages** : 3 avis clients
7. **CTA final** : "Louez l'esprit libre"

**CTAs présents** :

* Nav : "Se connecter" (→ page auth onglet login) + "Essai gratuit" (→ page auth onglet signup)
* Hero : "Démarrer l'essai gratuit" (→ page auth onglet signup) + "Voir comment ça marche" (→ ancre #fonctionnalites)
* Pricing : chaque plan a un CTA (→ page auth onglet signup)
* CTA final : "Démarrer l'essai gratuit" (→ page auth onglet signup)

### 2.3 Pages informatives

|Page|Objectif|Lien depuis|
|-|-|-|
|**À propos**|Crédibiliser (mission, valeurs, fondateur)|Nav footer|
|**Contact**|Formulaire de contact + email + démo|Nav footer|
|**CGU**|Obligations légales, conditions d'utilisation|Footer, page inscription|
|**Mentions légales**|Conformité LCEN|Footer|
|**Confidentialité**|Politique RGPD|Footer, page inscription|

\---

## 3\. Phase 2 — Inscription et Essai Gratuit

### 3.1 Page d'authentification (`prysme-auth.html`)

**Deux onglets** : Connexion / Créer un compte

#### Flux d'inscription (onglet "Créer un compte")

**Champs requis** :

* Prénom
* Nom
* Email
* Mot de passe (min 8 caractères)
* Nom de l'hébergement
* Checkbox CGU + Confidentialité (obligatoire)

**Méthodes d'inscription** :

* Email + mot de passe
* Google OAuth (bouton "S'inscrire avec Google")

**Après soumission** :

1. Email de vérification envoyé
2. Clic sur le lien de vérification
3. Redirection vers le Dashboard avec un état "onboarding"

#### Flux de connexion (onglet "Se connecter")

**Champs** :

* Email
* Mot de passe (toggle visibilité)
* "Se souvenir de moi" (checkbox)
* "Mot de passe oublié ?" (lien)

**Méthodes** :

* Email + mot de passe
* Google OAuth
* X OAuth

### 3.2 Onboarding (premier accès post-inscription)

> \*\*Page à créer\*\* — L'onboarding n'existe pas encore en tant que page dédiée. Recommandation :

**Étape 1 — Bienvenue** (modal ou page dédiée)

* Message de bienvenue personnalisé : "Bienvenue, \[Prénom] !"
* Rappel : "Votre essai gratuit est actif pendant 30 jours."
* CTA : "Configurer mon gîte"

**Étape 2 — Configuration de l'établissement** (redirige vers Mon établissement)

* Pré-remplir le nom du gîte (saisi à l'inscription)
* Guider vers : email, téléphone, adresse, slug
* Encourager à uploader le logo
* Configurer les tarifs par défaut (ménage, taxe de séjour)
* Configurer les options (bain nordique, etc.)

**Étape 3 — Configuration du contrat** (onglet Contrat dans Mon établissement)

* Le modèle de contrat par défaut est déjà prêt
* L'utilisateur peut le personnaliser (balises dynamiques)
* Aperçu en direct avec données d'exemple

**Étape 4 — Première réservation** (CTA vers Nouvelle réservation)

* Proposer de créer une réservation de test
* Ou de partager le lien de réservation client

### 3.3 Période d'essai — Règles métier

|Paramètre|Valeur|
|-|-|
|Durée|30 jours calendaires à compter de la date d'inscription|
|Carte bancaire requise|Non|
|Fonctionnalités accessibles|100% identiques au plan Essentiel|
|Nombre d'hébergements|1|
|Contrats illimités|Oui|
|Signature électronique|Oui, conforme eIDAS|
|Relances automatiques|Oui|
|Archivage PDF|Oui|
|Export CSV|Oui|

**Notifications liées à l'essai** :

* J-7 : email "Il vous reste 7 jours d'essai gratuit" + CTA "Souscrire maintenant"
* J-3 : email "Plus que 3 jours" + récap de ce qui sera bloqué
* J-1 : email "Dernier jour d'essai" + CTA urgent
* J0 : email "Votre essai est terminé" + CTA "Continuer avec Prysme"

**Bandeau in-app** :

* Afficher un bandeau discret en haut du Dashboard pendant toute la durée de l'essai : "Essai gratuit — X jours restants · \[Souscrire]"
* Le bandeau devient orange à J-7, rouge à J-3

\---

## 4\. Phase 3 — Usage quotidien (Essai ou Abonné)

### 4.1 Dashboard (`prysme-dashboard.html`)

**Contenu dynamique** :

* Greeting personnalisé : "Bonjour, \[Prénom]."
* Date du jour
* Bandeau "Nouvelles demandes à valider" (si des demandes clients en attente)
* 4 stat cards : Réservations, Contrats générés, Contrats signés, En attente
* Planning 3 mois (calendrier avec couleurs par statut)
* Prochaines arrivées (liste des prochains check-in)
* Table des réservations récentes

### 4.2 Réservations (`prysme-reservations.html`)

**Vue liste complète** avec :

* Bannière demandes en attente (si applicable)
* Stats résumées
* Tabs de filtrage : Toutes, À venir, En cours, Passées, En attente
* Recherche, tri, pagination
* Actions par ligne : voir détail, supprimer

**Sous-pages liées** :

* **Nouvelle réservation** (`prysme-nouvelle-reservation.html`) : formulaire complet côté gérant
* **Détail réservation** (`prysme-detail-reservation.html`) : vue complète d'une réservation avec timeline du contrat + actions (PDF, envoi signature)
* **Nouvelle demande client** (`prysme-demande-client.html`) : demande soumise par un locataire via le formulaire public, le gérant complète les tarifs et valide

### 4.3 Archives (`prysme-archives.html`)

**Contenu** :

* Stats : contrats archivés, loyer total, acomptes encaissés
* Table des contrats signés avec recherche, filtres par année, tri
* Bouton PDF par contrat
* Export CSV global

### 4.4 Mon établissement (`prysme-etablissement.html`)

**5 onglets** :

1. **Informations** : nom, email, tél, slug, adresse, tarifs par défaut
2. **Options** : liste éditable (nom + prix), ajout/suppression
3. **Contrat** : éditeur de modèle avec balises dynamiques + aperçu live
4. **Logo** : upload drag \& drop (PNG, JPG, WEBP)
5. **Documents** : pièces jointes automatiques aux emails (RIB, règlement intérieur)

### 4.5 Paramètres (`prysme-parametres.html`)

* Notifications : email de notification
* Apparence : mode nuit (toggle)
* Abonnement : plan actuel + lien vers upgrade
* Compte : email, déconnexion, suppression de compte

### 4.6 Flux côté Locataire (client du gérant)

#### Formulaire de réservation (`prysme-formulaire-reservation.html`)

**Accès** : URL publique partagée par le gérant (ex: `prysme.app/book/clos-du-marida`)
**Pas de connexion requise.**

**Contenu** :

* Informations personnelles (prénom, nom, email, tél, adresse, ville, CP)
* Dates souhaitées (arrivée, départ)
* Options souhaitées (checkboxes)
* Message libre
* Consentement RGPD
* Bouton "Envoyer ma demande"
* Écran de succès après soumission

**Résultat** : une notification est envoyée au gérant (email + badge dans l'app), la demande apparaît dans le Dashboard et la page Réservations.

#### Email de contrat (`prysme-email-contrat.html`)

**Envoyé au locataire après que le gérant a validé la réservation et généré le contrat.**

**Contenu** :

* Récap séjour (dates + montants)
* CTA "Lire et signer le contrat →"
* Info acompte (montant + RIB joint)
* Note sécurité eIDAS

#### Page de signature du contrat

> \*\*Page à créer\*\* — Le locataire clique sur le lien dans l'email et arrive sur une page dédiée pour :

1. Lire le contrat PDF intégré (viewer)
2. Signer électroniquement (case à cocher "J'ai lu et j'accepte" + champ signature)
3. Confirmation : "Contrat signé avec succès"
4. Téléchargement du PDF signé

\---

## 5\. Phase 4 — Fin de l'essai et Paywall

### 5.1 État "Essai expiré"

Quand les 30 jours sont écoulés et que l'utilisateur n'a pas souscrit :

#### Pages BLOQUÉES (accès interdit, redirection vers paywall)

|Page|Comportement|
|-|-|
|**Nouvelle réservation**|Bloqué — Redirection vers paywall|
|**Formulaire de réservation** (public)|Bloqué — Message "Ce formulaire est temporairement indisponible"|
|**Envoi de contrat** (bouton "Envoyer le lien de signature")|Bloqué — Tooltip "Souscrivez pour envoyer des contrats"|
|**Génération de contrat PDF**|Bloqué — Idem|
|**Mon établissement > Contrat** (édition du modèle)|Bloqué|
|**Mon établissement > Options** (modification)|Bloqué|
|**Mon établissement > Documents** (ajout)|Bloqué|
|**Mon établissement > Logo** (upload)|Bloqué|
|**Export CSV**|Bloqué|

#### Pages en LECTURE SEULE (accès maintenu, actions désactivées)

|Page|Comportement|
|-|-|
|**Dashboard**|Visible mais avec bandeau paywall permanent en haut|
|**Réservations** (liste)|Visible, consultation des réservations existantes, mais pas de création|
|**Détail réservation**|Visible en lecture seule, boutons d'action grisés|
|**Archives**|Visible, téléchargement PDF des contrats déjà signés autorisé|
|**Mon établissement > Informations**|Visible en lecture seule|
|**Paramètres**|Accessible (pour pouvoir souscrire ou se déconnecter)|

#### Raison de ce choix

L'utilisateur doit pouvoir :

* Consulter ses données existantes (réservations passées, contrats signés)
* Télécharger les PDFs des contrats déjà archivés (obligation légale)
* Accéder à ses paramètres pour souscrire ou supprimer son compte

L'utilisateur ne doit PAS pouvoir :

* Créer de nouvelles réservations
* Générer ou envoyer de nouveaux contrats
* Modifier la configuration de son établissement
* Accepter de nouvelles demandes clients

### 5.2 Page Paywall / Upgrade

> \*\*Page à créer\*\* — Modal ou page dédiée affichée quand l'utilisateur tente une action bloquée.

**Contenu** :

* Titre : "Votre essai gratuit est terminé"
* Sous-titre : "Continuez à gérer vos réservations comme un pro."
* Récap de ce que l'utilisateur a accompli pendant l'essai : "Vous avez créé X réservations et signé Y contrats"
* Les 3 plans tarifaires (identiques à la landing page)
* CTA principal : "Souscrire au plan Essentiel — 9,99€/mois"
* Note : "Sans engagement, résiliable à tout moment"

### 5.3 Flux de paiement (Checkout)

> \*\*Page à créer\*\* — Le flux de paiement doit être le plus court possible.

**Étape 1 — Choix du plan** (si pas déjà choisi via le paywall)

* 3 cards : Essentiel (9,99€), Multi-gîtes (15€)
* Le plan Découverte (gratuit) n'est plus disponible après l'essai

**Étape 2 — Paiement**

* Intégration Stripe (recommandé) ou autre PSP
* Champs : numéro de carte, date d'expiration, CVC
* Adresse de facturation
* Récap commande : "Plan Essentiel — 9,99€/mois"
* Bouton : "Confirmer et souscrire"

**Étape 3 — Confirmation**

* Écran de succès : "Bienvenue dans Prysme !"
* Email de confirmation avec facture
* Redirection automatique vers le Dashboard (toutes les fonctionnalités débloquées)

### 5.4 Gestion de l'abonnement (dans Paramètres)

**Informations affichées** :

* Plan actuel + prix
* Date du prochain renouvellement
* Moyen de paiement enregistré (les 4 derniers chiffres)
* Boutons : "Changer de plan", "Modifier le moyen de paiement", "Annuler l'abonnement"

**Changement de plan** :

* Essentiel → Multi-gîtes : upgrade immédiat, prorata facturé
* Multi-gîtes → Essentiel : downgrade effectif au prochain renouvellement (si l'utilisateur a plus d'1 hébergement, il doit en supprimer avant)

**Annulation** :

* L'abonnement reste actif jusqu'à la fin de la période payée
* Ensuite, passage en état "Essai expiré" (mêmes restrictions)
* Les données sont conservées 12 mois (cf. CGU art. 10)

\---

## 6\. Flux transversaux

### 6.1 Cycle de vie d'une réservation

```
Demande client (formulaire public)
    ↓
Notification au gérant (email + badge in-app)
    ↓
Gérant complète et valide (tarifs, dates, notes)
    ↓
Contrat auto-généré (PDF)
    ↓
Email envoyé au locataire (contrat + RIB)
    ↓
Locataire signe en ligne
    ↓
Contrat signé archivé (PDF horodaté)
    ↓
Gérant notifié (email + mise à jour statut)
```

**OU** (réservation manuelle) :

```
Gérant crée la réservation manuellement
    ↓
Contrat auto-généré
    ↓
(même flux à partir de l'envoi)
```

### 6.2 Statuts d'une réservation

|Statut|Couleur|Signification|
|-|-|-|
|**En attente**|Amber|Demande client reçue, pas encore validée par le gérant|
|**Envoyé**|Violet|Contrat généré et envoyé au locataire, en attente de signature|
|**Signé**|Vert|Contrat signé par le locataire, archivé|

### 6.3 Emails transactionnels envoyés par Prysme

|Email|Destinataire|Déclencheur|
|-|-|-|
|Vérification d'email|Gérant|Inscription|
|Nouvelle demande de réservation|Gérant|Locataire soumet le formulaire|
|Contrat à signer|Locataire|Gérant valide et envoie le contrat|
|Relance signature J+2|Locataire|Contrat non signé après 2 jours|
|Confirmation de signature|Gérant + Locataire|Locataire signe le contrat|
|Rappel acompte|Locataire|Si acompte non réglé à J+5 (optionnel)|
|Essai J-7|Gérant|7 jours avant fin d'essai|
|Essai J-3|Gérant|3 jours avant fin d'essai|
|Essai J-1|Gérant|Dernier jour d'essai|
|Essai terminé|Gérant|Fin de l'essai|
|Confirmation d'abonnement|Gérant|Paiement validé|
|Facture mensuelle|Gérant|Chaque renouvellement|
|Confirmation d'annulation|Gérant|Annulation de l'abonnement|

### 6.4 Notifications in-app

|Notification|Emplacement|Déclencheur|
|-|-|-|
|Badge "X" sur Réservations (sidebar)|Sidebar|Nouvelles demandes en attente|
|Dot violet sur icône cloche (topbar)|Topbar|Toute notification non lue|
|Bandeau essai gratuit|Haut du Dashboard|Pendant toute la durée de l'essai|
|Bandeau paywall|Haut du Dashboard|Après expiration de l'essai|
|Bannière "X nouvelles demandes"|Dashboard + page Réservations|Demandes clients en attente|

\---

## 7\. Pages manquantes à créer

|Page|Priorité|Description|
|-|-|-|
|**Onboarding**|Haute|Wizard post-inscription (3-4 étapes)|
|**Page de signature**|Haute|Vue locataire pour lire et signer le contrat|
|**Paywall / Upgrade**|Haute|Modal ou page quand l'essai expire|
|**Checkout / Paiement**|Haute|Intégration Stripe pour souscrire|
|**Mot de passe oublié**|Moyenne|Formulaire email → lien de reset|
|**Vérification email**|Moyenne|Page "Vérifiez votre boîte mail" + page de confirmation|
|**Factures**|Basse|Historique des factures dans Paramètres|
|**Statistiques**|Basse|Page dédiée (lien dans sidebar, pas encore construit)|
|**Page de signature réussie**|Moyenne|Confirmation côté locataire après signature|

\---

## 8\. Règles de sécurité et d'accès

### 8.1 Authentification

* Session basée sur JWT ou cookie sécurisé (httpOnly, secure, SameSite)
* Expiration de session : 7 jours (avec "Se souvenir de moi"), 24h sinon
* Rate limiting sur le login : 5 tentatives max, puis blocage 15 min
* Mot de passe : min 8 caractères (recommandé : exiger 1 majuscule + 1 chiffre)

### 8.2 Accès aux données

* Un gérant ne voit QUE ses propres réservations, contrats et données
* Le slug public (`/book/xxx`) ne donne accès qu'au formulaire de réservation, jamais aux données du gérant
* Les liens de signature sont uniques, horodatés, et expirent après signature
* Les PDFs archivés sont accessibles uniquement au gérant authentifié

### 8.3 RGPD

* Consentement explicite requis : inscription (CGU + confidentialité), formulaire public (checkbox RGPD)
* Droit à l'effacement : bouton "Supprimer mon compte" dans Paramètres
* Export des données : le gérant peut exporter ses données en CSV
* Durée de conservation : cf. Politique de confidentialité (art. 5)

\---

## 9\. Responsive et accessibilité

### 9.1 Breakpoints

|Breakpoint|Comportement|
|-|-|
|> 1024px|Layout complet (sidebar + contenu)|
|768px – 1024px|Sidebar cachée, contenu pleine largeur|
|< 768px|Mobile : colonnes empilées, formulaires sur 1 colonne|

### 9.2 Accessibilité

* Navigation au clavier (tab, enter, escape)
* Labels sur tous les inputs
* Contrastes conformes WCAG AA (vérifié avec la palette Prysme)
* Alt text sur les images
* Focus visible sur les éléments interactifs
* Aria labels sur les boutons icône-only

\---

## 10\. Stack technique recommandée

|Composant|Recommandation|
|-|-|
|Frontend|Next.js (App Router) ou Nuxt.js|
|Backend|API routes Next.js ou serveur Node.js séparé|
|Base de données|PostgreSQL (Supabase ou Neon)|
|Auth|NextAuth.js ou Supabase Auth|
|Paiement|Stripe (Checkout + Customer Portal)|
|Signature électronique|Resend (email) + crypto horodatage|
|Stockage fichiers|Supabase Storage ou S3|
|PDF|Puppeteer ou @react-pdf/renderer|
|Hébergement|Vercel|
|Email transactionnel|Resend|

\---

## 11\. Récapitulatif des fichiers livrés

### Pages publiques (site vitrine)

|Fichier|Page|
|-|-|
|`prysme-landing-v3.html`|Landing page|
|`prysme-contact.html`|Contact|
|`prysme-a-propos.html`|À propos|
|`prysme-cgu.html`|CGU|
|`prysme-mentions-legales.html`|Mentions légales|
|`prysme-confidentialite.html`|Confidentialité|
|`prysme-auth.html`|Connexion / Inscription|

### Pages app (après connexion)

|Fichier|Page|
|-|-|
|`prysme-dashboard.html`|Tableau de bord|
|`prysme-reservations.html`|Liste des réservations|
|`prysme-nouvelle-reservation.html`|Nouvelle réservation (manuelle)|
|`prysme-detail-reservation.html`|Détail d'une réservation|
|`prysme-demande-client.html`|Nouvelle demande client (à valider)|
|`prysme-archives.html`|Archives (contrats signés)|
|`prysme-etablissement.html`|Mon établissement (5 onglets)|
|`prysme-parametres.html`|Paramètres|

### Pages côté locataire

|Fichier|Page|
|-|-|
|`prysme-formulaire-reservation.html`|Formulaire de réservation public|

### Templates email

|Fichier|Email|
|-|-|
|`prysme-email-contrat.html`|Email d'envoi du contrat à signer|



