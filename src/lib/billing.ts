// Moteur de prix & facturation — Maison d'hôtes.
// Pur (aucune dépendance Prisma) : réutilisable côté API et côté front.

// Limites légales d'une maison d'hôtes (code du tourisme).
export const MAX_ROOMS = 5;
export const MAX_GUESTHOUSE_CAPACITY = 15;

export function nightsBetween(checkIn: Date | string, checkOut: Date | string): number {
  const a = checkIn instanceof Date ? checkIn : new Date(checkIn);
  const b = checkOut instanceof Date ? checkOut : new Date(checkOut);
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86_400_000));
}

export interface RoomPrice {
  price: number; // prix par nuit de la chambre
}
export interface MealPrice {
  unitPrice: number;
  quantity: number;
}

// Sous-total hébergement (nuitées) = somme des prix/nuit des chambres × nombre de nuits.
export function computeLodgingTotal(rooms: RoomPrice[], nights: number): number {
  const perNight = rooms.reduce((sum, r) => sum + (r.price || 0), 0);
  return round2(perNight * nights);
}

// Sous-total restauration = somme (prix unitaire × quantité) des repas.
export function computeMealsTotal(meals: MealPrice[]): number {
  return round2(meals.reduce((sum, m) => sum + (m.unitPrice || 0) * (m.quantity || 0), 0));
}

// Taxe de séjour "au réel" = nombre d'adultes × nombre de nuits × taux applicable.
export function computeTouristTax(adults: number, nights: number, rate: number): number {
  return round2(Math.max(0, adults) * nights * Math.max(0, rate));
}

export interface ReservationTotals {
  nights: number;
  lodging: number;     // ventilation nuitées
  meals: number;       // ventilation restauration
  touristTax: number;  // taxe de séjour au réel
  total: number;       // total dû (hors acompte)
}

export function computeReservationTotals(input: {
  checkIn: Date | string;
  checkOut: Date | string;
  rooms: RoomPrice[];
  meals: MealPrice[];
  adults: number;
  touristTaxRate: number;
}): ReservationTotals {
  const nights = nightsBetween(input.checkIn, input.checkOut);
  const lodging = computeLodgingTotal(input.rooms, nights);
  const meals = computeMealsTotal(input.meals);
  const touristTax = computeTouristTax(input.adults, nights, input.touristTaxRate);
  return { nights, lodging, meals, touristTax, total: round2(lodging + meals + touristTax) };
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
