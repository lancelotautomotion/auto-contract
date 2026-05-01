export function mergeTemplates(general: string, houseRules: string | null | undefined): string {
  const rules = houseRules?.trim();
  if (!rules) return general;
  return `${general}\n\nRÈGLEMENT INTÉRIEUR\n\n${rules}`;
}

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
