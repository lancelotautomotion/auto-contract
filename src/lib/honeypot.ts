// Field name used as honeypot — looks like a real field to bots
export const HONEYPOT_FIELD = "website";

export function isHoneypotTriggered(body: Record<string, unknown>): boolean {
  const val = body[HONEYPOT_FIELD];
  return typeof val === "string" && val.trim().length > 0;
}
