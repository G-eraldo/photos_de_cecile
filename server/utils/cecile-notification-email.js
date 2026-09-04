import { Resend } from "resend";

const escapeHtml = (value) =>
  String(value || "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character],
  );

const displayValue = (value, fallback = "Non renseigné") =>
  escapeHtml(value || fallback);

const formatPrice = (value) =>
  `${Number(value).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;

const detailRows = (rows) =>
  rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 0;color:#8F8C85;vertical-align:top;width:38%;">${escapeHtml(label)}</td>
          <td style="padding:8px 0;color:#503D30;font-weight:600;">${displayValue(value)}</td>
        </tr>`,
    )
    .join("");

export async function sendCecilePaymentNotification({
  type,
  reference,
  details,
  total,
}) {
  if (!process.env.RESEND_API_KEY) {
    console.error(
      "RESEND_API_KEY est absente : la notification à Cécile ne peut pas être envoyée.",
    );
    return false;
  }

  const isOrder = type === "commande";
  const recipient = process.env.RESEND_CECILE_NOTIFICATION_EMAIL;

  if (!process.env.RESEND_FROM_EMAIL) {
    console.error(
      "RESEND_FROM_EMAIL est absente : la notification à Cécile ne peut pas être envoyée.",
    );
    return false;
  }

  const subject = isOrder
    ? `Nouvelle commande payée — ${reference}`
    : `Nouvelle réservation payée — ${reference}`;
  const rows = isOrder
    ? [
        ["Cliente", `${details.prenom || ""} ${details.nom || ""}`.trim()],
        ["E-mail", details.email],
        ["Adresse", details.adresse],
        ["Produit", details.produit],
        ["Format", details.format],
        ["Options", Object.entries(details.options || {}).map(([name, value]) => `${name} : ${value}`).join(" · ")],
        ["Quantité", details.quantite],
        ["Montant payé", formatPrice(total)],
      ]
    : [
        ["Cliente", `${details.prenom || ""} ${details.nom || ""}`.trim()],
        ["E-mail", details.email],
        ["Téléphone", details.telephone],
        ["Prestation", details.prestation],
        ["Formule", details.forfait],
        ["Date et heure", `${details.date || ""} · ${details.heure || ""}`],
        ["Lieu", details.lieu],
      ];

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: recipient,
      replyTo: details.email,
      subject,
      html: `
        <div style="margin:0;padding:40px 20px;background:#E6DFDD;font-family:Arial,sans-serif;color:#676463;">
          <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;">
            <div style="padding:30px 35px;background:#503D30;color:#ffffff;">
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#E6D4C4;">Les Photos de Cécile</p>
              <h1 style="margin:0;font-family:Georgia,serif;font-size:27px;font-weight:normal;">${isOrder ? "Une commande est payée" : "Une réservation est payée"}</h1>
            </div>
            <div style="padding:30px 35px 36px;">
              <p style="margin:0 0 20px;font-size:15px;line-height:1.7;">Bonjour Cécile, le paiement vient d’être confirmé.</p>
              <div style="margin:0 0 24px;padding:14px 16px;background:#FAF8F7;border-radius:10px;">
                <strong style="color:#5A3419;">Référence : ${escapeHtml(reference)}</strong>
              </div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;line-height:1.45;">
                ${detailRows(rows)}
              </table>
              <p style="margin:26px 0 0;font-size:13px;line-height:1.6;color:#8F8C85;">Retrouve l’ensemble des informations dans Strapi. Cette notification est envoyée après confirmation du paiement par Mollie.</p>
            </div>
          </div>
        </div>`,
    });
    if (error)
      throw new Error(
        `Resend a refusé la notification à Cécile : ${error.message}`,
      );
    return true;
  } catch (error) {
    console.error(
      "Impossible d’envoyer la notification de paiement à Cécile.",
      error,
    );
    return false;
  }
}
