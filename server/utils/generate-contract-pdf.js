import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const COLORS = {
  brown: rgb(0.35, 0.2, 0.1),
  text: rgb(0.25, 0.24, 0.23),
  light: rgb(0.92, 0.89, 0.87),
  grey: rgb(0.5, 0.48, 0.46),
};

const safe = (value) => {
  if (value === undefined || value === null || !String(value).trim()) {
    return "À compléter";
  }

  return String(value).trim();
};

const formatDate = (date) => {
  if (!date) return "À compléter";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
};

const formatSocialUsage = (socialUsage) => {
  if (socialUsage === "autorise") {
    return "☒ J’autorise l’utilisation des photos sur les réseaux sociaux";
  }

  if (socialUsage === "n_autorise_pas") {
    return "☒ Je n’autorise pas l’utilisation des photos sur les réseaux sociaux";
  }

  return [
    "☐ J’autorise l’utilisation des photos sur les réseaux sociaux",
    "☐ Je n’autorise pas l’utilisation des photos sur les réseaux sociaux",
  ].join("\n");
};

const wrapText = (text, font, size, maxWidth) => {
  const words = String(text).split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;

    if (font.widthOfTextAtSize(test, size) <= maxWidth) {
      current = test;
    } else {
      if (current) {
        lines.push(current);
      }

      current = word;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
};

export async function generateContractPdf({
  nom,
  prenom,
  adresse,
  telephone,
  email,
  prestation,
  date,
  lieu,
  heure,
  forfait,
  socialUsage,
}) {
  const pdfDoc = await PDFDocument.create();

  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const pageWidth = 595.28;
  const pageHeight = 841.89;

  const marginLeft = 55;
  const marginRight = 55;
  const maxWidth = pageWidth - marginLeft - marginRight;

  let page;
  let y;

  const addPage = () => {
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    y = pageHeight - 55;

    return page;
  };

  const ensureSpace = (height = 30) => {
    if (y - height < 55) {
      addPage();
    }
  };

  const drawText = (
    text,
    {
      size = 10,
      font = regularFont,
      color = COLORS.text,
      lineHeight = size * 1.45,
      indent = 0,
    } = {},
  ) => {
    const lines = wrapText(text, font, size, maxWidth - indent);

    for (const line of lines) {
      ensureSpace(lineHeight);

      page.drawText(line, {
        x: marginLeft + indent,
        y,
        size,
        font,
        color,
      });

      y -= lineHeight;
    }

    return lines.length * lineHeight;
  };

  const drawParagraph = (text, options = {}) => {
    drawText(text, {
      ...options,
      lineHeight: options.lineHeight || 15,
    });

    y -= 6;
  };

  const drawTitle = (text) => {
    ensureSpace(45);

    page.drawText(text, {
      x: marginLeft,
      y,
      size: 16,
      font: boldFont,
      color: COLORS.brown,
    });

    y -= 28;
  };

  const drawSectionTitle = (number, title) => {
    ensureSpace(45);

    page.drawText(`${number}. ${title}`, {
      x: marginLeft,
      y,
      size: 12,
      font: boldFont,
      color: COLORS.brown,
    });

    y -= 21;
  };

  const drawBullet = (text) => {
    ensureSpace(22);

    page.drawText("•", {
      x: marginLeft + 3,
      y,
      size: 10,
      font: boldFont,
      color: COLORS.brown,
    });

    drawText(text, {
      size: 10,
      indent: 15,
      lineHeight: 14,
    });

    y -= 2;
  };
  const drawCheckbox = (text, checked = false) => {
    ensureSpace(22);

    page.drawText(checked ? "[X]" : "[ ]", {
      x: marginLeft,
      y,
      size: 10,
      font: regularFont,
      color: COLORS.brown,
    });

    drawText(text, {
      size: 10,
      indent: 25,
      lineHeight: 14,
    });

    y -= 3;
  };
  addPage();

  // -------------------------------------------------------
  // EN-TÊTE
  // -------------------------------------------------------

  page.drawText("CONTRAT PHOTO", {
    x: marginLeft,
    y,
    size: 22,
    font: boldFont,
    color: COLORS.brown,
  });

  y -= 28;

  page.drawText("Les Photos de Cécile", {
    x: marginLeft,
    y,
    size: 12,
    font: italicFont,
    color: COLORS.grey,
  });

  y -= 28;

  page.drawLine({
    start: {
      x: marginLeft,
      y,
    },
    end: {
      x: pageWidth - marginRight,
      y,
    },
    thickness: 1,
    color: COLORS.light,
  });

  y -= 30;

  // -------------------------------------------------------
  // PHOTOGRAPHE
  // -------------------------------------------------------

  page.drawText("PHOTOGRAPHE", {
    x: marginLeft,
    y,
    size: 10,
    font: boldFont,
    color: COLORS.brown,
  });

  y -= 17;

  drawText("DELLENBACH Cécile", {
    size: 10,
    font: boldFont,
  });

  drawText("Entrepreneur individuel");
  drawText("8 allée sablée");
  drawText("80000 AMIENS");
  drawText("0771773859");
  drawText("lesphotosdececile80@gmail.com");
  drawText("SIRET : 93211664300010");

  y -= 12;

  // -------------------------------------------------------
  // CLIENT
  // -------------------------------------------------------

  page.drawText("À L’ATTENTION DE", {
    x: marginLeft,
    y,
    size: 10,
    font: boldFont,
    color: COLORS.brown,
  });

  y -= 18;

  drawText(`Nom / Prénom : ${safe(prenom)} ${safe(nom)}`);
  drawText(`Adresse : ${safe(adresse)}`);
  drawText(`Téléphone : ${safe(telephone)}`);
  drawText(`Email : ${safe(email)}`);

  y -= 15;

  // -------------------------------------------------------
  // 1. OBJET DU CONTRAT
  // -------------------------------------------------------

  drawSectionTitle(1, "OBJET DU CONTRAT");

  drawParagraph(
    "Le présent contrat a pour objet de définir les modalités de réalisation d’une prestation photographique entre le Photographe et le Client.",
  );

  drawText(`Type de prestation : ${safe(prestation)}`);
  drawText(`Date : ${formatDate(date)}`);
  drawText(`Lieu : ${safe(lieu)}`);
  drawText(`Horaires : ${safe(heure)}`);
  drawText(`Choix du forfait : ${safe(forfait || prestation)}`);

  y -= 6;

  drawParagraph(
    "Le Photographe s’engage à réaliser une prestation photographique conformément aux conditions définies dans le présent contrat.",
  );

  // -------------------------------------------------------
  // 2. STYLE ARTISTIQUE
  // -------------------------------------------------------

  drawSectionTitle(2, "STYLE ARTISTIQUE");

  drawParagraph(
    "Le Client reconnaît avoir pris connaissance du style photographique du Photographe (visible notamment sur son site internet lesphotosdececile.fr, portfolio ou réseaux sociaux) et déclare l’accepter.",
  );

  drawParagraph(
    "Les photographies livrées refléteront la vision artistique et le savoir-faire du Photographe. Aucun rendu spécifique ne peut être garanti au-delà du style habituel du Photographe.",
  );

  // -------------------------------------------------------
  // 3. RESERVATION & ACOMPTE
  // -------------------------------------------------------

  drawSectionTitle(3, "RESERVATION & ACOMPTE");

  drawParagraph(
    "La réservation de la prestation est effective uniquement après :",
  );

  drawBullet("La signature du présent contrat");
  drawBullet("Le versement d’un acompte de 30% du montant total");

  drawParagraph(
    "Le solde devra être réglé au plus tard le jour de la prestation, sauf accord écrit différent entre les parties.",
  );

  drawParagraph(
    "L’acompte versé ne sera pas remboursé en cas d’annulation par le Client.",
  );

  drawParagraph(
    "L’acompte devra être réglé dans un délai de 7 jours à compter de la réception du contrat, passé ce délai la réservation ne pourra être garantie.",
  );

  // -------------------------------------------------------
  // 4. ANNULATION OU REPORT
  // -------------------------------------------------------

  drawSectionTitle(4, "ANNULATION OU REPORT");

  drawText("Annulation par le Client", {
    font: boldFont,
    color: COLORS.brown,
  });

  y -= 5;

  drawBullet(
    "En cas d’annulation par le Client : l’acompte versé reste acquis au Photographe.",
  );
  drawBullet(
    "Un report pourra être envisagé en fonction des disponibilités du Photographe.",
  );

  y -= 4;

  drawText("Annulation par le Photographe", {
    font: boldFont,
    color: COLORS.brown,
  });

  y -= 5;

  drawParagraph(
    "En cas de force majeure (maladie, accident, événement imprévu grave), le Photographe s’efforcera de proposer un autre photographe professionnel pour assurer la prestation.",
  );

  drawParagraph(
    "Si cela n’est pas possible, les sommes versées seront intégralement remboursées sans autre indemnité.",
  );

  // -------------------------------------------------------
  // 5. DEROULEMENT
  // -------------------------------------------------------

  drawSectionTitle(5, "DEROULEMENT DE LA PRESTATION");

  drawParagraph(
    "Le Client s’engage à faciliter le travail du Photographe pendant la prestation.",
  );

  drawParagraph("Le Photographe ne pourra être tenu responsable :");

  drawBullet("D’un manque de coopération des participants");
  drawBullet("De conditions météorologiques défavorables");
  drawBullet(
    "De contraintes imposées par le lieu où l’organisation de l’événement.",
  );

  drawParagraph(
    "Le Photographe se réserve le droit d’interrompre la prestation en cas de comportement inapproprié ou dangereux.",
  );

  // -------------------------------------------------------
  // 6. SELECTION
  // -------------------------------------------------------

  drawSectionTitle(6, "SELECTION DE PHOTOGRAPHIES");

  drawParagraph(
    "Le Photographe effectue une première sélection des images réalisées afin d’éliminer :",
  );

  drawBullet("Les doublons");
  drawBullet("Les images techniquement imparfaites");
  drawBullet("Les tests d’exposition");
  drawBullet(
    "Les photographies ne correspondant pas aux standards de qualité.",
  );

  drawParagraph(
    "Le Client accepte que toutes les photographies prises lors de la séance ne soient pas conservées ni livrées.",
  );

  drawParagraph(
    "Selon la formule choisie, le Client pourra sélectionner un nombre défini de photographies parmi une galerie de présélection.",
  );

  drawParagraph(
    "Les photographies supplémentaires pourront faire l’objet d’une facturation complémentaire.",
  );

  // -------------------------------------------------------
  // 7. POST-TRAITEMENT
  // -------------------------------------------------------

  drawSectionTitle(7, "POST-TRAITEMENT & LIVRAISON");

  drawParagraph(
    "Le travail de post-production fait partie intégrante du style du Photographe.",
  );

  drawParagraph("Les photographies livrées seront :");

  drawBullet("Sélectionnées");
  drawBullet("Retouchées");
  drawBullet("Optimisées (couleurs, contraste, luminosité)");

  drawParagraph(
    "Le délai de livraison est estimé à 8 semaines après le retour de sélection du client.",
  );

  drawParagraph(
    "Les photographies seront livrées sous format numérique via une galerie privée en ligne ou un lien de téléchargement.",
  );

  // -------------------------------------------------------
  // 8. RAW
  // -------------------------------------------------------

  drawSectionTitle(8, "NON-LIVRAISON DES FICHIERS BRUTS");

  drawParagraph(
    "Les fichiers bruts (RAW), fichiers non retouchés, et l’ensemble des images non sélectionnées ne sont pas livrés au Client.",
  );

  drawParagraph(
    "Seules les photographies finales sélectionnées et retouchées sont remises au Client.",
  );

  drawParagraph("Ces fichiers restent la propriété exclusive du Photographe.");

  // -------------------------------------------------------
  // 9. INTEGRITE
  // -------------------------------------------------------

  drawSectionTitle(9, "INTEGRITÉ DES PHOTOGRAPHIES");

  drawParagraph(
    "Les photographies livrées constituent des œuvres protégées par le droit d’auteur. Le Client s’engage à respecter l’intégrité des images fournies. Toute modification des photographies est interdite sans l’accord écrit préalable du Photographe.",
  );

  drawParagraph("Sont notamment interdits :");

  drawBullet("Filtres appliqués via des applications ou réseaux sociaux");
  drawBullet("Retouches ou modifications colorimétriques");
  drawBullet("Recadrages altérant l’image");
  drawBullet("Ajout de texte, logo ou graphisme.");

  drawParagraph(
    "Toute utilisation d’une image modifiée sans autorisation pourra être considérée comme une atteinte au droit moral du Photographe.",
  );

  // -------------------------------------------------------
  // 10. DROIT D'UTILISATION
  // -------------------------------------------------------

  drawSectionTitle(10, "DROIT D’UTILISATION PAR LE CLIENT");

  drawParagraph(
    "Le Client bénéficie d’un droit d’utilisation personnel des photographies livrées.",
  );

  drawParagraph("Les images peuvent être utilisées pour :");

  drawBullet("Un usage privé");
  drawBullet("Un partage sur les réseaux sociaux");
  drawBullet("Une impression personnelle.");

  drawParagraph(
    "Toute utilisation commerciale, publicitaire ou revente des images nécessite l’autorisation écrite du Photographe.",
  );

  // -------------------------------------------------------
  // 11. GALERIE
  // -------------------------------------------------------

  drawSectionTitle(11, "GALERIE EN LIGNE");

  drawParagraph(
    "Lorsque les images sont présentées dans une galerie de sélection en ligne :",
  );

  drawBullet("Le Client s’engage à ne pas effectuer de captures d’écran");
  drawBullet(
    "Seules les images finales téléchargeables sont destinées à être utilisées.",
  );

  drawParagraph(
    "La galerie peut rester accessible pour une durée limitée (2 semaines).",
  );

  // -------------------------------------------------------
  // 12. RESPONSABILITE
  // -------------------------------------------------------

  drawSectionTitle(12, "RESPONSABILITÉ & SAUVEGARDE");

  drawParagraph(
    "Le Photographe met en œuvre tous les moyens raisonnables pour assurer la sécurité des fichiers.",
  );

  drawParagraph(
    "En cas de perte ou détérioration des images pour des raisons indépendantes de sa volonté (panne technique, vol, corruption des fichiers), la responsabilité du Photographe est limitée au remboursement des sommes versées.",
  );

  // -------------------------------------------------------
  // 13. DROITS D'AUTEUR
  // -------------------------------------------------------

  drawSectionTitle(13, "CLAUSE DROITS D’AUTEUR ET MENTION DU PHOTOGRAPHE");

  drawParagraph(
    "Conformément aux dispositions des articles L.111-1, L.121-1 et L.122-4 du Code de la propriété intellectuelle, le Photographe demeure titulaire exclusif des droits d’auteur afférents aux photographies réalisées dans le cadre du présent contrat.",
  );

  drawParagraph(
    "Toute reproduction, représentation, diffusion ou exploitation desdites photographies, notamment sur les réseaux sociaux, sites internet, plateformes numériques ou tout autre support de communication, est autorisée sous réserve du respect du droit moral du Photographe, incluant notamment le droit au nom.",
  );

  drawParagraph(
    "À ce titre, le Client s’engage à faire figurer de manière lisible et non équivoque, lors de toute diffusion des photographies, la mention suivante : « © [Nom du photographe] » et/ou l’identification du compte professionnel du Photographe lorsque le support le permet.",
  );

  drawParagraph(
    "Cette mention ne pourra en aucun cas être supprimée, modifiée ou dissimulée sans l’accord écrit et préalable du Photographe.",
  );

  drawParagraph(
    "Tout manquement à cette obligation constituera une atteinte au droit moral de l’auteur et pourra donner lieu à des poursuites sur le fondement du Code de la propriété intellectuelle, sans préjudice de dommages et intérêts.",
  );

  // -------------------------------------------------------
  // 14. UTILISATION DES PHOTOS
  // -------------------------------------------------------

  drawSectionTitle(14, "UTILISATION DES PHOTOS");

  drawParagraph(
    "Cela permet de mettre en avant mon travail, c’est important pour moi.",
  );

  if (socialUsage === "autorise") {
    drawCheckbox(
      "J’autorise l’utilisation des photos sur les réseaux sociaux",
      true,
    );

    drawCheckbox(
      "Je n’autorise pas l’utilisation des photos sur les réseaux sociaux",
      false,
    );
  } else if (socialUsage === "n_autorise_pas") {
    drawCheckbox(
      "J’autorise l’utilisation des photos sur les réseaux sociaux",
      false,
    );

    drawCheckbox(
      "Je n’autorise pas l’utilisation des photos sur les réseaux sociaux",
      true,
    );
  } else {
    drawCheckbox(
      "J’autorise l’utilisation des photos sur les réseaux sociaux",
      false,
    );

    drawCheckbox(
      "Je n’autorise pas l’utilisation des photos sur les réseaux sociaux",
      false,
    );
  }

  y -= 10;

  drawParagraph(
    "Je soussigné(e) ____________________________ atteste avoir lu les informations stipulées dans le contrat et m’engage à les respecter.",
  );

  y -= 8;

  // -------------------------------------------------------
  // SIGNATURES
  // -------------------------------------------------------

  ensureSpace(120);

  page.drawText("Signature et date du client :", {
    x: marginLeft,
    y,
    size: 10,
    font: boldFont,
    color: COLORS.brown,
  });

  page.drawText("Signature et date du photographe :", {
    x: pageWidth / 2 + 10,
    y,
    size: 10,
    font: boldFont,
    color: COLORS.brown,
  });

  y -= 70;

  page.drawLine({
    start: {
      x: marginLeft,
      y,
    },
    end: {
      x: pageWidth / 2 - 20,
      y,
    },
    thickness: 1,
    color: COLORS.grey,
  });

  page.drawLine({
    start: {
      x: pageWidth / 2 + 10,
      y,
    },
    end: {
      x: pageWidth - marginRight,
      y,
    },
    thickness: 1,
    color: COLORS.grey,
  });

  y -= 25;

  page.drawText("Les Photos de Cécile", {
    x: marginLeft,
    y,
    size: 8,
    font: italicFont,
    color: COLORS.grey,
  });

  const pdfBytes = await pdfDoc.save();

  return Buffer.from(pdfBytes);
}
