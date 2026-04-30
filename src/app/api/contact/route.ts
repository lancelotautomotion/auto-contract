import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";

const INBOX = "contact@kordia.fr";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function nl2br(value: string) {
  return escapeHtml(value).replace(/\n/g, "<br />");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prenom = String(body.prenom ?? "").trim();
    const nom = String(body.nom ?? "").trim();
    const email = String(body.email ?? "").trim();
    const sujet = String(body.sujet ?? "").trim();
    const message = String(body.message ?? "").trim();
    const consent = Boolean(body.consent);

    if (!prenom || !nom || !email || !sujet || !message) {
      return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email invalide." }, { status: 400 });
    }
    if (!consent) {
      return NextResponse.json({ error: "Consentement RGPD requis." }, { status: 400 });
    }
    if (message.length > 4000) {
      return NextResponse.json({ error: "Message trop long." }, { status: 400 });
    }

    const fullName = `${prenom} ${nom}`;
    const subject = `[Contact Kordia] ${sujet} — ${fullName}`;

    const html = `
      <div style="font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;background:#F3F2EE;padding:32px;">
        <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #E8E6E1;border-radius:14px;overflow:hidden;">
          <div style="padding:18px 24px;background:#2C2C2A;color:#fff;font-size:13px;font-weight:700;letter-spacing:.04em;">
            Nouveau message — Contact Kordia
          </div>
          <div style="padding:24px;">
            <table style="width:100%;border-collapse:collapse;font-size:13px;color:#2C2C2A;">
              <tr><td style="padding:6px 0;color:#71716E;width:120px;">Nom</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(fullName)}</td></tr>
              <tr><td style="padding:6px 0;color:#71716E;">Email</td><td style="padding:6px 0;"><a style="color:#7F77DD;text-decoration:none;" href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
              <tr><td style="padding:6px 0;color:#71716E;">Sujet</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(sujet)}</td></tr>
            </table>
            <hr style="border:none;border-top:1px solid #E8E6E1;margin:20px 0;" />
            <div style="font-size:14px;line-height:1.7;color:#2C2C2A;">${nl2br(message)}</div>
          </div>
        </div>
      </div>
    `;

    const text = `Nouveau message Contact Kordia\n\nNom: ${fullName}\nEmail: ${email}\nSujet: ${sujet}\n\n${message}`;

    const { error: resendError } = await resend.emails.send({
      from: "Kordia <noreply@kordia.fr>",
      to: INBOX,
      replyTo: email,
      subject,
      html,
      text,
    });

    if (resendError) {
      console.error("[api/contact] Resend error:", resendError);
      return NextResponse.json({ error: `Erreur d'envoi : ${resendError.message}` }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/contact]", err);
    return NextResponse.json({ error: "Une erreur est survenue. Réessayez plus tard." }, { status: 500 });
  }
}
