import { mergeStored } from './contractFormat';

// Fusionne Conditions Générales + Règlement Intérieur en un template sérialisé
// (JSON). Gère aussi bien le nouveau format que les anciens templates en texte
// brut. Le résultat est consommé par contractPdf et l'aperçu.
export function mergeTemplates(general: string, houseRules: string | null | undefined): string {
  return mergeStored(general, houseRules);
}

export const DEFAULT_GUESTHOUSE_CONTRACT_TEMPLATE = `CONTRAT DE SÉJOUR EN MAISON D'HÔTES

Entre les soussignés :

HÔTE
{{nom_gite}}
{{adresse_gite}}
{{ville_gite}}
Email : {{email_gite}}
Téléphone : {{telephone_gite}}

CLIENT
{{prenom_client}} {{nom_client}}
{{adresse_client}}
{{code_postal_client}} {{ville_client}}
Email : {{email_client}}
Téléphone : {{telephone_client}}

Il a été convenu ce qui suit :

ARTICLE 1 — OBJET ET DESCRIPTION DE LA CHAMBRE

L'hôte met à disposition du client, dans le cadre de son activité de chambres d'hôtes, la chambre {{nom_chambre}} au sein de la maison d'hôtes {{nom_gite}}, située {{adresse_gite}}, {{ville_gite}}.

Capacité maximale : {{capacite_chambre}} personne(s).
Prix par nuit : {{prix_chambre_nuit}} €.

Le séjour débute le {{date_entree}} et se termine le {{date_sortie}}.

Horaires : l'arrivée s'effectue entre 17h00 et 20h00 le jour de début du séjour ; le départ doit être réalisé au plus tard à 11h00 le jour de fin de séjour.

Animaux de compagnie : les animaux de compagnie sont acceptés au sein de l'établissement, sous réserve qu'ils restent en permanence sous la responsabilité de leur propriétaire et qu'ils ne causent ni gêne ni dégradation aux lieux ou aux autres clients.

{{specificites_chambre}}

ARTICLE 2 — PRIX ET CONDITIONS DE PAIEMENT

Hébergement ({{nombre_nuits}} nuits) : {{hebergement}} €
Restauration : {{restauration}} €
Montant total du séjour : {{total_sejour}} €
Acompte à la réservation : {{acompte}} €
Solde à régler sur place : {{solde}} €
Frais de ménage : {{menage}} €
Taxe de séjour : {{taxe_sejour}} € par adulte et par nuit

L'acompte est calculé uniquement sur le montant de l'hébergement (hors repas).

ARTICLE 3 — PRESTATIONS ET RESTAURATION

Conformément à la réglementation des chambres d'hôtes (article D.324-13 du Code du tourisme), le prix de la nuitée inclut la fourniture du linge de maison ainsi que le petit-déjeuner.

Le détail des prestations de restauration sélectionnées par le client :
{{options}}

ARTICLE 4 — DÉPÔT DE GARANTIE

Un dépôt de garantie pourra être demandé à l'arrivée. Il sera restitué dans un délai de 10 jours suivant le départ, déduction faite des éventuels dommages constatés.

ARTICLE 5 — OBLIGATIONS DU CLIENT

Le client s'engage à :
- Occuper les lieux raisonnablement et les restituer en parfait état
- Ne pas dépasser la capacité d'accueil maximale de la chambre
- Respecter le règlement intérieur de la maison d'hôtes
- Ne pas introduire de personnes extérieures dans les parties réservées aux hôtes sans accord préalable
- Attester être couvert par une assurance responsabilité civile (garantie villégiature) couvrant la durée du séjour

ARTICLE 6 — ANNULATION

En cas d'annulation par le client plus de 30 jours avant la date d'arrivée, l'acompte versé reste acquis à l'hôte à titre de dédommagement. En cas d'annulation à moins de 30 jours, ou de non-présentation du client, la totalité du séjour est due. En cas d'annulation par l'hôte, l'intégralité des sommes déjà versées est remboursée au client, sauf cas de force majeure.

ARTICLE 7 — MÉDIATION DE LA CONSOMMATION

{{mediateur}}

Fait à {{ville_gite}}, le {{date_du_jour}}

L'HÔTE | LE CLIENT

___________________________ | ___________________________

{{nom_gite}} | {{prenom_client}} {{nom_client}}`;

export const DEFAULT_CONTRACT_TEMPLATE = `CONTRAT DE LOCATION SAISONNIÈRE

Entre les soussignés :

BAILLEUR
{{nom_gite}}
{{adresse_gite}}
{{ville_gite}}
Email : {{email_gite}}
Téléphone : {{telephone_gite}}

LOCATAIRE
{{prenom_client}} {{nom_client}}
{{adresse_client}}
{{code_postal_client}} {{ville_client}}
Email : {{email_client}}
Téléphone : {{telephone_client}}

Il a été convenu ce qui suit :

ARTICLE 1 — OBJET ET DURÉE DE LA LOCATION

Le bailleur met à disposition du locataire, à titre saisonnier, le bien meublé situé à l'adresse indiquée ci-dessus.

La location prend effet le {{date_entree}} et se termine le {{date_sortie}}.

ARTICLE 2 — PRIX ET CONDITIONS DE PAIEMENT

Loyer total : {{loyer}} €
Acompte à la réservation : {{acompte}} €
Solde à régler à l'arrivée : {{solde}} €
Frais de ménage : {{menage}} €
Taxe de séjour : {{taxe_sejour}} € par nuit et par personne

ARTICLE 3 — OPTIONS SÉLECTIONNÉES

{{options}}

ARTICLE 4 — DÉPÔT DE GARANTIE

Un dépôt de garantie pourra être demandé à l'arrivée. Il sera restitué dans un délai de 10 jours suivant le départ, déduction faite des éventuels dommages constatés.

ARTICLE 5 — ÉTAT DES LIEUX

Un état des lieux contradictoire sera réalisé à l'entrée et à la sortie. Toute dégradation constatée lors de l'état des lieux de sortie pourra être retenue sur le dépôt de garantie.

ARTICLE 6 — OBLIGATIONS DU LOCATAIRE

Le locataire s'engage à :
- Utiliser les lieux en bon père de famille
- Restituer les lieux en parfait état de propreté
- Ne pas sous-louer le bien sans autorisation écrite du bailleur
- Respecter le règlement intérieur du gîte
- Ne pas dépasser la capacité d'accueil maximale

ARTICLE 7 — RÉSILIATION

En cas de résiliation par le locataire, l'acompte versé restera acquis au bailleur à titre de dédommagement. En cas de résiliation par le bailleur, celui-ci remboursera l'intégralité des sommes versées.

Fait à {{ville_gite}}, le {{date_du_jour}}

LE BAILLEUR | LE LOCATAIRE

___________________________ | ___________________________

{{nom_gite}} | {{prenom_client}} {{nom_client}}`;
