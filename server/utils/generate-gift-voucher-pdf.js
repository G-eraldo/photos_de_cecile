import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

// Pages du PDF fourni, indexées à partir de zéro. Chaque page porte son forfait.
const templatePages = {
  Animaux: { 5: 0, 10: 1, 15: 2 },
  'Famille, couple, grossesse, portrait ou boudoir': { 10: 3, 15: 4 },
  Naissance: { 10: 5, 15: 6 },
}

const formatDate = (date) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(date)
// Les polices PDF standards ne couvrent pas les emojis. Les retirer du seul
// fichier PDF évite qu'un petit mot personnalisé empêche tout l'e-mail de partir.
const clampText = (value, maximum) => String(value || '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^\x20-\x7E\xA0-\xFF]/g, '')
  .trim()
  .slice(0, maximum)

function wrapText(text, font, size, maximumWidth) {
  const lines = []
  let line = ''
  for (const word of text.split(/\s+/)) {
    if (font.widthOfTextAtSize(word, size) > maximumWidth) {
      if (line) lines.push(line)
      line = ''
      for (const character of word) {
        if (font.widthOfTextAtSize(line + character, size) > maximumWidth) {
          lines.push(line)
          line = ''
        }
        line += character
      }
      continue
    }
    const next = line ? `${line} ${word}` : word
    if (font.widthOfTextAtSize(next, size) <= maximumWidth) line = next
    else if (line) {
      lines.push(line)
      line = word
    } else lines.push(word)
  }
  if (line) lines.push(line)
  return lines
}

export async function generateGiftVoucherPdf({ details }) {
  const photos = Number(String(details.format || '').match(/\d+/)?.[0])
  const templatePage = templatePages[details.prestation]?.[photos]
  if (templatePage === undefined) throw new Error('Le modèle de bon cadeau est introuvable.')

  const template = await readFile(resolve(process.cwd(), 'public/images/bons-cadeaux/modeles-bons-cadeaux.pdf'))
  const issuedAt = new Date(details.paiementConfirmeLe || Date.now())
  const pdf = await PDFDocument.create()
  pdf.setCreationDate(issuedAt)
  pdf.setModificationDate(issuedAt)
  const source = await PDFDocument.load(template)
  const sourcePage = source.getPage(templatePage)
  const { x, y, width: sourceWidth, height: sourceHeight } = sourcePage.getMediaBox()
  const voucher = await pdf.embedPage(sourcePage, {
    left: x, bottom: y, right: x + sourceWidth, top: y + sourceHeight,
  })
  const width = 842
  const height = width * voucher.height / voucher.width
  const page = pdf.addPage([width, height])
  const regular = await pdf.embedFont(StandardFonts.Helvetica)
  const ink = rgb(0.31, 0.27, 0.25)
  // Coordonnées repérées sur le gabarit affiché à 1100 px de largeur.
  const scaleX = width / 1100
  const scaleY = scaleX
  const toPdfY = (top) => height - top * scaleY
  const validUntil = new Date(issuedAt)
  validUntil.setFullYear(validUntil.getFullYear() + 1)

  page.drawPage(voucher, { x: 0, y: 0, width, height })
  const drawField = (text, left, top, maximumWidth, font = regular) => {
    const size = Math.min(12, maximumWidth * scaleX / Math.max(font.widthOfTextAtSize(text, 1), 1))
    page.drawText(text, { x: left * scaleX, y: toPdfY(top), size, font, color: ink })
  }
  drawField(clampText(`${details.prenom} ${details.nom}`, 90), 225, 302, 263)
  drawField(formatDate(validUntil), 250, 354, 238)

  const message = clampText(details.message, 250) || clampText(`Une séance ${details.prestation} et un forfait ${details.format}.`, 250)
  let messageSize = 12
  let lines = wrapText(message, regular, messageSize, 415 * scaleX)
  while (lines.length > 5 && messageSize > 6) {
    messageSize -= 0.5
    lines = wrapText(message, regular, messageSize, 415 * scaleX)
  }
  lines.forEach((line, index) => {
    page.drawText(line, { x: 73 * scaleX, y: toPdfY(435 + index * 32), size: messageSize, font: regular, color: ink })
  })
  return Buffer.from(await pdf.save())
}
