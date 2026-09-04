import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const safe = (value) => String(value || "").trim() || "Non renseigné";
const euros = (value) => `${Number(value).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

export async function generateOrderInvoicePdf({ reference, details, total }) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const brown = rgb(0.35, 0.2, 0.1);
  const text = rgb(0.25, 0.24, 0.23);
  let y = 780;

  const line = (content, { font = regular, size = 10, color = text, gap = 18 } = {}) => {
    page.drawText(content, { x: 55, y, size, font, color });
    y -= gap;
  };

  line(details.type === "bon_cadeau" ? "FACTURE — BON CADEAU" : "FACTURE — TIRAGE PHOTO", { font: bold, size: 22, color: brown, gap: 32 });
  line("Les Photos de Cécile", { font: bold, size: 12, color: brown, gap: 20 });
  line("DELLENBACH Cécile — Entrepreneur individuel", { gap: 15 });
  line("8 allée sablée, 80000 Amiens — SIRET : 93211664300010", { gap: 34 });
  line(`Référence : ${safe(reference)}`, { font: bold, size: 11 });
  line(`Émise le : ${new Intl.DateTimeFormat("fr-FR").format(new Date())}`, { gap: 30 });
  line("FACTURÉ À", { font: bold, size: 11, color: brown, gap: 20 });
  line(`${safe(details.prenom)} ${safe(details.nom)}`);
  line(safe(details.email));
  if (details.adresse) safe(details.adresse).split(/\r?\n/).forEach((addressLine) => line(addressLine));
  y -= 18;
  line("DÉTAIL DE LA COMMANDE", { font: bold, size: 11, color: brown, gap: 22 });
  line(`${safe(details.produit)} — ${safe(details.format)}`);
  if (Object.keys(details.options || {}).length) {
    line(`Options : ${Object.entries(details.options).map(([name, value]) => `${name} : ${value}`).join(" · ")}`);
  }
  line(`Quantité : ${details.quantite}`);
  line(`Prix unitaire : ${euros(details.prixUnitaire)}`, { gap: 30 });
  page.drawLine({ start: { x: 55, y }, end: { x: 540, y }, thickness: 1, color: brown });
  y -= 26;
  line(`TOTAL PAYÉ : ${euros(total)}`, { font: bold, size: 14, color: brown, gap: 30 });
  line("Paiement confirmé via Mollie.", { size: 9, color: rgb(0.45, 0.43, 0.41) });

  return Buffer.from(await pdf.save());
}
