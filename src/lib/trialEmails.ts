import { Resend } from "resend";
import { buildEmailHtml, ctaButton, divider, muted } from "./emailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

function appBaseUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export type ReminderDay = 7 | 3 | 1 | 0;

interface SendTrialReminderOptions {
  to: string;
  name: string | null;
  daysLeft: ReminderDay;
}

export async function sendTrialReminder({ to, name, daysLeft }: SendTrialReminderOptions) {
  const upgradeUrl = `${appBaseUrl()}/upgrade`;
  const greeting = name?.split(" ")[0] ?? undefined;

  const configs: Record<ReminderDay, { subject: string; preheader: string; body: string }> = {
    7: {
      subject: "Il vous reste 7 jours d'essai — Prysme",
      preheader: "Votre essai Prysme se termine dans 7 jours.",
      body: `
        <p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#71716E;margin:0 0 16px;">
          Votre essai gratuit se termine dans <strong style="color:#2C2C2A;">7 jours</strong>.
          Vous avez encore le temps d'explorer toutes les fonctionnalités de Prysme.
        </p>
        <p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#71716E;margin:0 0 24px;">
          Pour continuer à gérer vos contrats de location sans interruption,
          souscrivez à l'abonnement mensuel à <strong style="color:#2C2C2A;">9,99 € HT/mois</strong>.
        </p>
        ${ctaButton("Souscrire à Prysme", upgradeUrl)}
        ${divider()}
        ${muted("Sans engagement · Résiliable à tout moment")}
      `,
    },
    3: {
      subject: "Plus que 3 jours d'essai — Prysme",
      preheader: "Votre essai Prysme se termine dans 3 jours.",
      body: `
        <p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#71716E;margin:0 0 16px;">
          Votre essai gratuit se termine dans <strong style="color:#2C2C2A;">3 jours</strong>.
        </p>
        <p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#71716E;margin:0 0 24px;">
          Pour ne pas perdre l'accès à vos réservations et contrats,
          abonnez-vous dès maintenant. Toutes vos données sont conservées.
        </p>
        ${ctaButton("Continuer avec Prysme", upgradeUrl)}
        ${divider()}
        ${muted("Sans engagement · Résiliable à tout moment · 9,99 € HT/mois")}
      `,
    },
    1: {
      subject: "Dernier jour d'essai — Prysme",
      preheader: "Votre essai Prysme se termine demain.",
      body: `
        <p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#71716E;margin:0 0 16px;">
          Votre essai gratuit se termine <strong style="color:#2C2C2A;">demain</strong>.
        </p>
        <p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#71716E;margin:0 0 24px;">
          Pour conserver l'accès à Prysme et continuer à gérer vos contrats,
          souscrivez avant demain. Vos données restent intactes.
        </p>
        ${ctaButton("S'abonner maintenant", upgradeUrl)}
        ${divider()}
        ${muted("Sans engagement · Résiliable à tout moment · 9,99 € HT/mois")}
      `,
    },
    0: {
      subject: "Votre essai Prysme est terminé",
      preheader: "Votre essai gratuit a expiré. Retrouvez vos données en vous abonnant.",
      body: `
        <p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#71716E;margin:0 0 16px;">
          Votre essai gratuit a expiré aujourd'hui.
        </p>
        <p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#71716E;margin:0 0 24px;">
          Vos réservations et contrats sont conservés pendant <strong style="color:#2C2C2A;">30 jours</strong>.
          Abonnez-vous pour retrouver immédiatement l'accès à toutes vos données.
        </p>
        ${ctaButton("Réactiver mon compte", upgradeUrl)}
        ${divider()}
        ${muted("Vos données sont conservées 30 jours · 9,99 € HT/mois · Sans engagement")}
      `,
    },
  };

  const { subject, preheader, body } = configs[daysLeft];

  const html = buildEmailHtml({
    giteName: "Prysme",
    docLabel: "Essai gratuit",
    preheader,
    greeting,
    body,
  });

  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Prysme <onboarding@resend.dev>",
    to,
    subject,
    html,
  });
}
