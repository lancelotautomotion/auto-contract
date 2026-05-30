// Validation et normalisation des slugs d'URL publique (Guesthouse, Room).
// kebab-case, ASCII, 3-50 caractères, pas de double tirets, ni en début/fin.

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MIN_LEN = 3;
const MAX_LEN = 50;

// Slugs réservés : risque de collision avec les routes existantes ou futures.
const RESERVED = new Set([
  "api", "app", "admin", "dashboard", "onboarding", "sign-in", "sign-up",
  "book", "sign", "contact", "legal", "upgrade", "a-propos", "comment-ca-marche",
  "compte", "settings", "archives", "etablissement", "maisons-hotes",
  "stripe", "n8n", "cron", "reservations", "gite", "guesthouse",
]);

export function isValidSlug(s: string): boolean {
  if (typeof s !== "string") return false;
  if (s.length < MIN_LEN || s.length > MAX_LEN) return false;
  if (!SLUG_RE.test(s)) return false;
  if (RESERVED.has(s)) return false;
  return true;
}

export function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, MAX_LEN);
}

export function suggestSlug(name: string): string {
  const s = normalizeSlug(name);
  return s.length >= MIN_LEN ? s : "";
}

export function slugError(s: string): string | null {
  if (!s || s.length === 0) return "L'identifiant est requis.";
  if (s.length < MIN_LEN) return `Au moins ${MIN_LEN} caractères.`;
  if (s.length > MAX_LEN) return `Au plus ${MAX_LEN} caractères.`;
  if (!SLUG_RE.test(s)) return "Lettres minuscules, chiffres et tirets uniquement.";
  if (RESERVED.has(s)) return "Cet identifiant est réservé.";
  return null;
}
