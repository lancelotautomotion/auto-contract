// Adaptateur : une réservation est rattachée soit à un Gîte, soit à une Maison
// d'hôtes. Ce module normalise la "source" de la réservation pour les flux
// partagés (contrat PDF, emails, notifications) sans dupliquer le pipeline.
import type { Gite, Guesthouse, User, MealType } from "@prisma/client";
import { DEFAULT_CONTRACT_TEMPLATE, DEFAULT_GUESTHOUSE_CONTRACT_TEMPLATE, mergeTemplates } from "@/lib/defaultContractTemplate";
import type { ContractData } from "@/lib/contractPdf";

type GiteWithUser = Gite & { user?: User };
type GuesthouseWithUser = Guesthouse & { user?: User };

export interface ReservationProperty {
  kind: "gite" | "guesthouse";
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  zipCode: string | null;
  email: string | null;
  phone: string | null;
  logoUrl: string | null;
  contractTemplateGeneral: string | null;
  contractTemplateHouseRules: string | null;
  cleaningFee: number;           // gîte : frais de ménage ; maison d'hôtes : 0
  touristTax: number;            // gîte : €/nuit/pers ; maison d'hôtes : €/adulte/nuit
  notificationEmail: string | null;
  notifNewReservation: boolean;
  notifContractSigned: boolean;
  n8nWebhookUrl: string | null;
  slug: string | null;
  user?: User;
}

// Résout la propriété (gîte OU maison d'hôtes) d'une réservation.
// Renvoie null si la réservation n'est rattachée à aucune des deux.
export function resolveReservationProperty(reservation: {
  gite?: GiteWithUser | null;
  guesthouse?: GuesthouseWithUser | null;
}): ReservationProperty | null {
  const g = reservation.gite;
  if (g) {
    return {
      kind: "gite",
      id: g.id, name: g.name, address: g.address, city: g.city, zipCode: g.zipCode,
      email: g.email, phone: g.phone, logoUrl: g.logoUrl,
      contractTemplateGeneral: g.contractTemplateGeneral,
      contractTemplateHouseRules: g.contractTemplateHouseRules,
      cleaningFee: g.cleaningFee, touristTax: g.touristTax,
      notificationEmail: g.notificationEmail,
      notifNewReservation: g.notifNewReservation,
      notifContractSigned: g.notifContractSigned,
      n8nWebhookUrl: g.n8nWebhookUrl,
      slug: g.slug,
      user: g.user,
    };
  }
  const h = reservation.guesthouse;
  if (h) {
    return {
      kind: "guesthouse",
      id: h.id, name: h.name, address: h.address, city: h.city, zipCode: h.zipCode,
      email: h.email, phone: h.phone, logoUrl: h.logoUrl,
      contractTemplateGeneral: h.contractTemplateGeneral,
      contractTemplateHouseRules: h.contractTemplateHouseRules,
      cleaningFee: 0, touristTax: h.touristTax,
      notificationEmail: null,
      notifNewReservation: true,
      notifContractSigned: true,
      n8nWebhookUrl: null,
      slug: null,
      user: h.user,
    };
  }
  return null;
}

const MEAL_LABELS: Record<MealType, string> = {
  BREAKFAST: "Petit-déjeuner",
  HALF_BOARD: "Demi-pension",
  TABLE_HOTES: "Table d'hôtes",
};

export function mealLabel(type: MealType): string {
  return MEAL_LABELS[type];
}

// Construit les données du contrat PDF à partir d'une réservation et de sa
// propriété résolue. Les repas (maison d'hôtes) sont ventilés dans {{options}},
// distincts de la nuitée {{loyer}} — exigence TVA / comptabilité.
export function buildContractData(opts: {
  reservation: {
    clientLastName: string;
    clientFirstName: string;
    clientEmail: string;
    clientPhone: string;
    clientAddress: string | null;
    clientCity: string | null;
    clientZipCode: string | null;
    checkIn: Date;
    checkOut: Date;
    rent: number | null;
    deposit: number | null;
    cleaningFee: number | null;
    touristTax: number | null;
    reservationOptions: { label: string; price: number }[];
    meals?: { mealType: MealType; label: string; unitPrice: number; quantity: number }[];
    // Maison d'hôtes : snapshot + lien (optionnel) vers la chambre live pour ses clauses spécifiques.
    reservationRooms?: {
      roomName: string;
      price: number;
      room?: { capacity: number; basePrice: number; specificClauses: string | null } | null;
    }[];
  };
  property: ReservationProperty;
}): ContractData {
  const { reservation: r, property: p } = opts;
  // Une réservation maison d'hôtes porte sur UNE chambre entière — on lit la 1re.
  const primaryRoom = r.reservationRooms?.[0];
  const fmt = (d: Date) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

  const options = [
    ...r.reservationOptions.map((o) => ({ label: o.label, price: o.price })),
    ...(r.meals ?? []).map((m) => ({
      label: m.quantity > 1 ? `${m.label} (x${m.quantity})` : m.label,
      price: m.unitPrice * m.quantity,
    })),
  ];

  return {
    template: mergeTemplates(p.contractTemplateGeneral ?? (p.kind === 'guesthouse' ? DEFAULT_GUESTHOUSE_CONTRACT_TEMPLATE : DEFAULT_CONTRACT_TEMPLATE), p.contractTemplateHouseRules),
    nom_client: r.clientLastName,
    prenom_client: r.clientFirstName,
    email_client: r.clientEmail,
    telephone_client: r.clientPhone,
    adresse_client: r.clientAddress,
    ville_client: r.clientCity,
    code_postal_client: r.clientZipCode,
    date_entree: fmt(r.checkIn),
    date_sortie: fmt(r.checkOut),
    loyer: r.rent ?? 0,
    acompte: r.deposit ?? 0,
    menage: r.cleaningFee ?? 0,
    taxe_sejour: r.touristTax ?? 0,
    options,
    nom_gite: p.name,
    adresse_gite: p.address,
    ville_gite: p.city,
    code_postal_gite: p.zipCode,
    email_gite: p.email,
    telephone_gite: p.phone,
    nom_chambre: primaryRoom?.roomName ?? null,
    capacite_chambre: primaryRoom?.room?.capacity ?? null,
    prix_chambre_nuit: primaryRoom?.price ?? primaryRoom?.room?.basePrice ?? null,
    specificites_chambre: primaryRoom?.room?.specificClauses ?? null,
    logoUrl: p.logoUrl,
  };
}
