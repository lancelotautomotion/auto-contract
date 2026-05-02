function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface EmailTemplateOptions {
  giteName: string;
  giteAddress?: string | null;
  giteLogoUrl?: string | null;  // optional gite logo (PNG/JPG/SVG URL)
  docLabel?: string;    // Header right label, e.g. "Contrat de location"
  preheader?: string;
  greeting?: string;    // First name only → renders "Bonjour [greeting]."
  body: string;
}

export function buildEmailHtml(opts: EmailTemplateOptions): string {
  const { giteName, giteAddress, giteLogoUrl, preheader, greeting, body, docLabel = 'Kordia' } = opts;

  const safeGiteName   = escapeHtml(giteName);
  const safeGreeting   = greeting ? escapeHtml(greeting) : '';
  const safeAddress    = giteAddress ? escapeHtml(giteAddress) : '';
  const safeDocLabel   = escapeHtml(docLabel);

  const preheaderHtml = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;color:#F3F2EE;">${escapeHtml(preheader)}</div>`
    : '';

  const greetingHtml = safeGreeting ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td class="greeting" style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:22px;font-weight:800;color:#2C2C2A;letter-spacing:-0.03em;padding-bottom:20px;line-height:1.3;">
        Bonjour ${safeGreeting}<span style="color:#7F77DD">.</span>
      </td></tr>
    </table>` : '';

  const headerLeftHtml = giteLogoUrl
    ? `<img src="${giteLogoUrl}" alt="${safeGiteName}" height="40" style="display:block;height:40px;width:auto;max-width:160px;border:0;outline:none;text-decoration:none;"/>`
    : `<span style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:15px;font-weight:800;color:#2C2C2A;letter-spacing:-0.02em;">${safeGiteName}</span>`;

  const headerRightHtml = giteLogoUrl
    ? `<span style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:15px;font-weight:800;color:#2C2C2A;letter-spacing:-0.02em;">${safeGiteName}</span>`
    : `<span style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;color:#A3A3A0;text-transform:uppercase;letter-spacing:0.08em;">${safeDocLabel}</span>`;

  const footerAddress = safeAddress
    ? `<tr><td style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:11px;color:#A3A3A0;padding-bottom:4px;">${safeAddress}</td></tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${giteName}</title>
<style>
  body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
  table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}
  img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none}
  body{margin:0;padding:0;width:100%!important;background-color:#F3F2EE;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif}
  a{color:#7F77DD}
  @media only screen and (max-width:620px){
    .email-outer-pad{padding:20px 12px!important}
    .email-wrap{width:100%!important}
    .card{border-radius:12px!important}
    .inner{padding:28px 20px!important}
    .recap-col{display:block!important;width:100%!important;padding-bottom:16px!important;padding-right:0!important;padding-left:0!important;border-left:0!important;border-top:1px solid #E8E6E1!important;padding-top:16px!important}
    .recap-col-first{border-top:0!important;padding-top:0!important}
    .header-row td{font-size:13px!important}
    .cta-btn a{padding:13px 24px!important;font-size:14px!important}
    .greeting{font-size:20px!important}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#F3F2EE;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;">
${preheaderHtml}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F3F2EE;">
<tr><td align="center" class="email-outer-pad" style="padding:40px 20px;">

  <table role="presentation" class="email-wrap" width="560" cellpadding="0" cellspacing="0" border="0">

    <!-- HEADER BAR -->
    <tr><td style="padding:0 0 24px;">
      <table role="presentation" class="header-row" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td valign="middle">${headerLeftHtml}</td>
          <td valign="middle" align="right">${headerRightHtml}</td>
        </tr>
      </table>
    </td></tr>

    <!-- MAIN CARD -->
    <tr><td>
      <table role="presentation" class="card" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #E8E6E1;">

        <!-- VIOLET ACCENT LINE -->
        <tr><td style="height:4px;background-color:#7F77DD;font-size:1px;line-height:1px;">&nbsp;</td></tr>

        <!-- BODY -->
        <tr><td class="inner" style="padding:36px 36px 32px;">
          ${greetingHtml}
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#71716E;">
                ${body}
              </td>
            </tr>
          </table>
        </td></tr>

      </table>
    </td></tr>

    <!-- FOOTER -->
    <tr><td style="padding:24px 0 0;text-align:center;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:12px;color:#A3A3A0;line-height:1.6;padding-bottom:8px;">
          Cet email a été envoyé par <strong style="color:#71716E;">${safeGiteName}</strong> via Kordia.
        </td></tr>
        ${footerAddress}
        <tr><td style="padding-top:12px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
            <tr><td style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;color:#7F77DD;letter-spacing:0.02em;">
              Kordia
            </td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>

  </table>

</td></tr>
</table>
</body>
</html>`;
}

/** Carte récap 2 colonnes (dates | montants) */
interface RecapItem {
  label: string;
  value: string;
  valueColor?: string; // e.g. '#689D71' for green amounts
}

export function recapCard(left: RecapItem[], right: RecapItem[]): string {
  const col = (items: RecapItem[]) => items.map(({ label, value, valueColor }) => `
    <tr><td style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:10px;font-weight:700;color:#A3A3A0;text-transform:uppercase;letter-spacing:0.08em;padding-bottom:6px;">${label}</td></tr>
    <tr><td style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;color:${valueColor ?? '#2C2C2A'};padding-bottom:16px;">${value}</td></tr>
  `).join('');

  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FCFFF2;border:1px solid #E8E6E1;border-radius:12px;margin-bottom:28px;">
  <tr><td style="padding:20px 24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td class="recap-col recap-col-first" width="50%" valign="top" style="padding-right:16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${col(left)}
          </table>
        </td>
        <td class="recap-col" width="50%" valign="top" style="border-left:1px solid #E8E6E1;padding-left:24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${col(right)}
          </table>
        </td>
      </tr>
    </table>
  </td></tr>
</table>`;
}

/** Bouton CTA centré (vert) */
export function ctaButton(label: string, url: string): string {
  return `
<table role="presentation" class="cta-btn" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td align="center" style="padding:4px 0 32px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr><td align="center" style="background-color:#689D71;border-radius:11px;">
          <a href="${url}" target="_blank" style="display:inline-block;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;padding:14px 36px;letter-spacing:0.01em;">${label} →</a>
        </td></tr>
      </table>
    </td>
  </tr>
</table>`;
}

/** Boîte info violette (acompte, infos clés) */
export function infoBox(content: string): string {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#EFEEF9;border-radius:10px;margin-bottom:20px;">
  <tr><td style="padding:16px 20px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td width="32" valign="top" style="padding-right:12px;padding-top:2px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="width:28px;height:28px;background-color:rgba(127,119,221,0.15);border-radius:7px;text-align:center;line-height:28px;font-size:14px;color:#5B52B5;">€</td></tr>
          </table>
        </td>
        <td style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:13px;color:#5B52B5;line-height:1.7;">
          ${content}
        </td>
      </tr>
    </table>
  </td></tr>
</table>`;
}

/** Ligne de séparation */
export function divider(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 20px;"><tr><td style="border-top:1px solid #E8E6E1;font-size:1px;line-height:1px;">&nbsp;</td></tr></table>`;
}

/** Texte secondaire centré (petite police grise) */
export function muted(text: string): string {
  return `<p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:12px;color:#A3A3A0;line-height:1.6;text-align:center;margin:0 0 8px;">${text}</p>`;
}

/** Sign-off "Cordialement, [name]" */
export function signOff(name: string): string {
  return `<p style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:14px;color:#71716E;line-height:1.7;margin:24px 0 0;">Cordialement,<br/><strong style="color:#2C2C2A;">${name}</strong></p>`;
}
