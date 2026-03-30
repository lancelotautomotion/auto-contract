/**
 * Template email partagé — ContratGîte
 * Compatible Gmail, Apple Mail, Outlook (table-based)
 */

interface EmailTemplateOptions {
  giteName: string;
  logoDataUrl?: string | null;
  preheader?: string;
  body: string;        // HTML du corps
  footer?: string;     // Texte de bas de page (optionnel)
}

export function buildEmailHtml(opts: EmailTemplateOptions): string {
  const { giteName, logoDataUrl, preheader, body, footer } = opts;

  const logoBlock = logoDataUrl
    ? `<img src="${logoDataUrl}" alt="${giteName}" style="max-height:48px; max-width:160px; object-fit:contain; display:block;" />`
    : `<span style="font-family:Georgia,serif; font-size:18px; font-weight:400; color:#1C1C1A; letter-spacing:0.02em;">${giteName}</span>`;

  const preheaderHtml = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;color:#F7F4F0;">${preheader}</div>`
    : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${giteName}</title>
</head>
<body style="margin:0;padding:0;background-color:#EDE8E1;font-family:Inter,'Helvetica Neue',Arial,sans-serif;">
  ${preheaderHtml}
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#EDE8E1;">
    <tr>
      <td align="center" style="padding:40px 16px 0;">

        <!-- Carte principale -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

          <!-- Header logo + nom gîte -->
          <tr>
            <td style="background-color:#F7F4F0; padding:28px 36px 24px; border-bottom:1px solid #CEC8BF;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle;">
                    ${logoBlock}
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="font-family:Inter,sans-serif; font-size:11px; letter-spacing:0.15em; text-transform:uppercase; color:#7A7570;">${giteName}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Corps -->
          <tr>
            <td style="background-color:#F7F4F0; padding:36px 36px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family:Inter,sans-serif; font-size:14px; line-height:1.75; color:#1C1C1A; font-weight:300;">
                    ${body}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#EDE8E1; padding:20px 36px; border-top:1px solid #CEC8BF;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family:Inter,sans-serif; font-size:11px; color:#7A7570; line-height:1.6;">
                    ${footer ?? `Cet email a été envoyé par <strong>${giteName}</strong> via ContratGîte.`}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- /carte -->

      </td>
    </tr>
    <tr>
      <td align="center" style="padding:20px 16px 40px;">
        <span style="font-size:10px; color:#7A7570; letter-spacing:0.1em; text-transform:uppercase;">ContratGîte</span>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Bouton CTA centré */
export function ctaButton(label: string, url: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding:28px 0 20px;">
          <a href="${url}"
             style="display:inline-block; background-color:#1C1C1A; color:#EDE8E1; padding:14px 36px; text-decoration:none; font-family:Inter,sans-serif; font-size:12px; letter-spacing:0.12em; text-transform:uppercase; border-radius:6px;">
            ${label} →
          </a>
        </td>
      </tr>
    </table>`;
}

/** Ligne de séparation légère */
export function divider(): string {
  return `<div style="border-top:1px solid #CEC8BF; margin:24px 0;"></div>`;
}

/** Texte en muted small */
export function muted(text: string): string {
  return `<p style="font-size:12px; color:#7A7570; line-height:1.6; margin:0;">${text}</p>`;
}
