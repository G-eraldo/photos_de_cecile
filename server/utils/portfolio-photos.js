export function deduplicatePortfolioPhotos(photos) {
  const ids = new Set()
  const urls = new Set()
  const signatures = new Set()

  return photos.filter((photo) => {
    const id = photo.id ?? null

    const normalizedUrl = String(photo.url || '')
      .split('?')[0]
      .split('#')[0]

    const signature =
      photo.name &&
      photo.width &&
      photo.height &&
      photo.size
        ? JSON.stringify([
            String(photo.name).toLowerCase(),
            Number(photo.width),
            Number(photo.height),
            Number(photo.size),
          ])
        : null

    const duplicate =
      (id !== null && ids.has(id)) ||
      (normalizedUrl && urls.has(normalizedUrl)) ||
      (signature && signatures.has(signature))

    if (id !== null) {
      ids.add(id)
    }

    if (normalizedUrl) {
      urls.add(normalizedUrl)
    }

    if (signature) {
      signatures.add(signature)
    }

    return !duplicate
  })
}

const giftCardFilenames = new Set([
  'DSC_01434_746f713442.jpg',
  'DSC_01434_3ae18f4bf0.jpeg',
])

const getFilename = (photo) =>
  String(photo.url || '')
    .split(/[?#]/)[0]
    .split('/')
    .pop()

export function isCloudinaryPhoto(photo) {
  try {
    return /(^|\.)cloudinary\.com$/i.test(new URL(photo.url).hostname)
  }
  catch {
    return false
  }
}

const hasPortfolioLabel = (photo) => {
  const labels = [
    photo.alternativeText,
    photo.caption,
  ]
    .filter(Boolean)
    .join(' ')

  return /#portfolio(?:-une(?:-\d+)?)?\b/i.test(labels)
}

const isInPortfolioFolder = (photo) => {
  const folder = [
    photo.folderPath,
    photo.folder?.path,
    photo.folder?.name,
  ]
    .filter(Boolean)
    .join(' ')

  return /(?:^|[\/\s_-])portfolio(?:$|[\/\s_-])/i.test(folder)
}

export function isPortfolioPhoto(photo, portfolioFolderIds = null) {
  if (!photo) return false
  if (!photo.url) return false
  if (!photo.mime?.startsWith('image/')) return false

  const filename = getFilename(photo)

  if (!filename) return false
  if (giftCardFilenames.has(filename)) return false

  const folderId =
    photo.folder?.id ??
    photo.folder?.data?.id ??
    photo.folderId ??
    (typeof photo.folder === 'number' || typeof photo.folder === 'string'
      ? photo.folder
      : null) ??
    null
  const isInPortfolioTree =
    portfolioFolderIds?.has(String(folderId)) === true

  return hasPortfolioLabel(photo) || isInPortfolioFolder(photo) || isInPortfolioTree
}
