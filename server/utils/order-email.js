import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Resend } from "resend";

import { sendCecilePaymentNotification } from "./cecile-notification-email.js";
import { generateGiftVoucherPdf } from "./generate-gift-voucher-pdf.js";
import { generateOrderInvoicePdf } from "./generate-order-invoice-pdf.js";

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
const formatPrice = (value) =>
  `${Number(value).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

export async function sendOrderConfirmation({ reference, details, total }) {
  if (!process.env.RESEND_API_KEY) {
    console.error(
      "RESEND_API_KEY est absente : la facture de commande ne peut pas être envoyée.",
    );
    return { customerEmailSent: false, cecileEmailSent: false };
  }

  const isGift = details.type === "bon_cadeau";
  const isCourierGift =
    isGift && details.options?.réception?.startsWith("Par courrier");
  let customerEmailSent = true;
  try {
    const invoice = await generateOrderInvoicePdf({
      reference,
      details,
      total,
    });
    const voucher =
      isGift && !isCourierGift
        ? await generateGiftVoucherPdf({ details })
        : null;
    const resend = new Resend(process.env.RESEND_API_KEY);
    const logoBuffer = await readFile(
      resolve(process.cwd(), "public/images/logo-email.png"),
    );
    const options = Object.entries(details.options || {})
      .map(([name, value]) => `${escapeHtml(name)} : ${escapeHtml(value)}`)
      .join(" · ");

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: details.email,
      subject: isGift
        ? "Confirmation de votre bon cadeau — Les Photos de Cécile"
        : "Confirmation de votre commande — Les Photos de Cécile",
      html: `
        <div style="margin:0;padding:40px 20px;background:#E6DFDD;font-family:Arial,sans-serif;color:#676463;">
          <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;">
            <div style="padding:35px 30px 25px;text-align:center;background:#ffffff;">
              <img src="cid:logo-cecile" alt="Les Photos de Cécile" width="160" style="display:block;width:160px;max-width:100%;height:auto;margin:0 auto 18px;border:0;" />
              <div style="width:60px;height:1px;background:#D9D2CF;margin:0 auto;"></div>
            </div>
            <div style="padding:10px 35px 40px;">
              <h1 style="font-family:Georgia,serif;font-size:25px;font-weight:normal;color:#5A3419;margin:0 0 25px;">${isGift ? "Votre bon cadeau est confirmé" : "Votre commande est confirmée"}</h1>
              <p style="font-size:15px;line-height:1.7;">Bonjour ${escapeHtml(details.nom)},</p>
              <p style="font-size:15px;line-height:1.7;">Nous vous confirmons la bonne réception de votre ${isGift ? "bon cadeau" : "commande"} de <strong style="color:#5A3419;">${escapeHtml(details.produit)}</strong>. Votre paiement a bien été validé.</p>
              <div style="margin:30px 0;padding:20px;background:#FAF8F7;border-radius:10px;">
                <p style="margin:0 0 10px;"><strong style="color:#5A3419;">Référence :</strong> ${escapeHtml(reference)}</p>
                <p style="margin:0 0 10px;"><strong style="color:#5A3419;">Format :</strong> ${escapeHtml(details.format)}</p>
                ${options ? `<p style="margin:0 0 10px;"><strong style="color:#5A3419;">Options :</strong> ${options}</p>` : ""}
                <p style="margin:0 0 10px;"><strong style="color:#5A3419;">Quantité :</strong> ${escapeHtml(details.quantite)}</p>
                <p style="margin:0;"><strong style="color:#5A3419;">Total payé :</strong> ${formatPrice(total)}</p>
              </div>
              <p style="font-size:15px;line-height:1.7;">${isGift ? (isCourierGift ? "Cécile préparera votre bon cadeau personnalisé et vous l’enverra par courrier à l’adresse indiquée." : "Votre bon cadeau personnalisé est joint à cet e-mail. Il est valable un an à compter d’aujourd’hui.") : "Votre tirage va maintenant être préparé avec soin, puis expédié à l’adresse indiquée lors de votre commande."}</p>
              <div style="margin:30px 0;padding:24px;background:#F8F4F1;border:1px solid #E4D8D2;border-radius:12px;">
                <p style="margin:0 0 10px;font-family:Georgia,serif;font-size:20px;color:#5A3419;">Votre facture</p>
                <p style="margin:0;font-size:14px;line-height:1.7;color:#676463;">Vous trouverez votre <strong style="color:#5A3419;">facture acquittée</strong> en pièce jointe de cet e-mail.</p>
              </div>
              <p style="margin:25px 0 0;font-size:14px;line-height:1.7;color:#8F8C85;">📎 <strong>Pièces jointes :</strong><br>${isGift && !isCourierGift ? "Votre bon cadeau personnalisé et la facture acquittée" : "Facture acquittée"}</p>
              <p style="margin:30px 0 0;font-size:15px;line-height:1.7;">À très bientôt,<br><strong style="color:#5A3419;">Cécile</strong><br>Les Photos de Cécile</p>
            </div>
          </div>
        </div>`,
      attachments: [
        {
          filename: "logo-email.png",
          content: logoBuffer,
          contentId: "logo-cecile",
          contentType: "image/png",
        },
        {
          filename: `Facture_${reference}.pdf`,
          content: invoice,
          contentType: "application/pdf",
        },
        ...(voucher
          ? [
              {
                filename: `Bon_cadeau_${reference}.pdf`,
                content: voucher,
                contentType: "application/pdf",
              },
            ]
          : []),
      ],
    });
    if (error)
      throw new Error(
        `Resend a refusé la confirmation de commande : ${error.message}`,
      );
  } catch (error) {
    console.error("Impossible d’envoyer la confirmation de commande.", error);
    customerEmailSent = false;
  }

  const cecileEmailSent = await sendCecilePaymentNotification({
    type: "commande",
    reference,
    details,
    total,
  });

  return { customerEmailSent, cecileEmailSent };
}
