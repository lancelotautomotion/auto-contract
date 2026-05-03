import { resend, getFromEmail } from "@/lib/resend";
import { buildEmailHtml, ctaButton, divider, muted } from "./emailTemplate";

function appBaseUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export type ReminderDay = 15 | 5 | 1 | 0;

interface SendTrialReminderOptions {
  to: string;
  name: string | null;
  daysLeft: ReminderDay;
}

export async function sendTrialReminder({ to, name, daysLeft }: SendTrialReminderOptions) {
  const upgradeUrl = `${appBaseUrl()}/upgrade`;
  const greeting = name?.split(" ")[0] ?? undefined;

  const configs: Record<ReminderDay, { subject: string; preheader: string; body: string }> = {
    15: {
      subject: "Il vous reste 15 jours d'essai — Kordia",
      preheader: "Votre essai Kordia se termine dans 15 jours.",
      body: `
        <p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#71716E;margin:0 0 16px;">
          Votre essai gratuit se termine dans <strong style="color:#2C2C2A;">15 jours</strong>.
          Vous avez encore le temps d'explorer toutes les fonctionnalités de Kordia.
        </p>
        <p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#71716E;margin:0 0 24px;">
          Pour continuer à gérer vos contrats de location sans interruption,
          souscrivez à l'abonnement mensuel à <strong style="color:#2C2C2A;">9,99 € HT/mois</strong>.
        </p>
        ${ctaButton("Souscrire à Kordia", upgradeUrl)}
        ${divider()}
        ${muted("Sans engagement · Résiliable à tout moment")}
      `,
    },
    5: {
      subject: "Plus que 5 jours d'essai — Kordia",
      preheader: "Votre essai Kordia se termine dans 5 jours.",
      body: `
        <p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#71716E;margin:0 0 16px;">
          Votre essai gratuit se termine dans <strong style="color:#2C2C2A;">5 jours</strong>.
        </p>
        <p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#71716E;margin:0 0 24px;">
          Pour ne pas perdre l'accès aux fonctionnalités, abonnez-vous dès maintenant.
          Vos réservations et contrats restent intacts.
        </p>
        ${ctaButton("Continuer avec Kordia", upgradeUrl)}
        ${divider()}
        ${muted("Sans engagement · Résiliable à tout moment · 9,99 € HT/mois")}
      `,
    },
    1: {
      subject: "Dernier jour d'essai — Kordia",
      preheader: "Votre essai Kordia se termine demain.",
      body: `
        <p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#71716E;margin:0 0 16px;">
          Votre essai gratuit se termine <strong style="color:#2C2C2A;">demain</strong>.
        </p>
        <p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#71716E;margin:0 0 24px;">
          Après demain, les fonctionnalités seront désactivées — vos données restent accessibles.
          Souscrivez avant demain pour continuer à gérer vos contrats sans interruption.
        </p>
        ${ctaButton("S'abonner maintenant", upgradeUrl)}
        ${divider()}
        ${muted("Sans engagement · Résiliable à tout moment · 9,99 € HT/mois")}
      `,
    },
    0: {
      subject: "Votre essai Kordia est terminé",
      preheader: "Votre essai a expiré. Vos données sont conservées — abonnez-vous pour retrouver les fonctionnalités.",
      body: `
        <p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#71716E;margin:0 0 16px;">
          Votre essai gratuit a expiré aujourd'hui.
        </p>
        <p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#71716E;margin:0 0 24px;">
          Vos réservations et contrats sont <strong style="color:#2C2C2A;">conservés pendant 30 jours</strong>.
          Pour retrouver l'accès aux fonctionnalités et reprendre vos contrats, souscrivez à tout moment.
        </p>
        ${ctaButton("Réactiver mon compte", upgradeUrl)}
        ${divider()}
        ${muted("Vos données sont conservées 30 jours · 9,99 € HT/mois · Sans engagement")}
      `,
    },
  };

  const { subject, preheader, body } = configs[daysLeft];

  const html = buildEmailHtml({
    giteName: "Kordia",
    docLabel: "Essai gratuit",
    preheader,
    greeting,
    body,
  });

  return resend.emails.send({
    from: getFromEmail(),
    to,
    subject,
    html,
  });
}
