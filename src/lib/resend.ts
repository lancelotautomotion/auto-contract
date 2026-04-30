import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

const VERIFIED_DOMAIN = "kordia.fr";
const DEFAULT_FROM = `Kordia <noreply@${VERIFIED_DOMAIN}>`;

export function getFromEmail(displayName = "Kordia"): string {
  const env = process.env.RESEND_FROM_EMAIL;
  if (env) {
    const match = env.match(/@([\w.-]+)>?$/);
    if (match && match[1] === VERIFIED_DOMAIN) return env;
  }
  return `${displayName} <noreply@${VERIFIED_DOMAIN}>`;
}

export { DEFAULT_FROM };
