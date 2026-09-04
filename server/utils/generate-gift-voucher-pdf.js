import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const templateNames = {
  5: 'bon-cadeau-5-photos.jpg',
  10: 'bon-cadeau-10-photos.jpg',
  15: 'bon-cadeau-15-photos.jpg',
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
  const templateName = templateNames[photos]
  if (!templateName) throw new Error('Le modèle de bon cadeau est introuvable.')

  const image = await readFile(resolve(process.cwd(), 'public/images/bons-cadeaux', templateName))
  const pdf = await PDFDocument.create()
  const voucher = await pdf.embedJpg(image)
  const width = 842
  const height = width * voucher.height / voucher.width
  const page = pdf.addPage([width, height])
  const regular = await pdf.embedFont(StandardFonts.Helvetica)
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique)
  const ink = rgb(0.31, 0.27, 0.25)
  const scaleX = width / voucher.width
  const scaleY = height / voucher.height
  const toPdfY = (top) => height - top * scaleY
  const validUntil = new Date()
  validUntil.setFullYear(validUntil.getFullYear() + 1)

  page.drawImage(voucher, { x: 0, y: 0, width, height })
  page.drawText(`Pour ${clampText(details.beneficiaire, 80)}`, {
    x: 118 * scaleX, y: toPdfY(430), size: 18, font: italic, color: ink,
  })
  page.drawText(clampText(`${details.prenom} ${details.nom}`, 90), {
    x: 345 * scaleX, y: toPdfY(488), size: 15, font: regular, color: ink,
  })
  page.drawText(formatDate(validUntil), {
    x: 400 * scaleX, y: toPdfY(572), size: 15, font: regular, color: ink,
  })

  const message = clampText(details.message, 250) || `Une séance ${details.prestation} et un forfait ${details.format}.`
  const lines = wrapText(message, regular, 14, 650 * scaleX).slice(0, 5)
  lines.forEach((line, index) => {
    page.drawText(line, { x: 120 * scaleX, y: toPdfY(704 + index * 51), size: 14, font: regular, color: ink })
  })
  return Buffer.from(await pdf.save())
}
