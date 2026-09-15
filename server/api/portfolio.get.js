import { enforceRateLimit } from '../utils/request-security.js'
import {
  deduplicatePortfolioPhotos,
  isPortfolioPhoto,
} from '../utils/portfolio-photos.js'

const getStrapiConfig = () => {
  const strapiUrl = process.env.STRAPI_URL
  const strapiToken = process.env.STRAPI_API_TOKEN

  if (!strapiUrl || !strapiToken) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Le portfolio est momentanément indisponible.',
    })
  }

  return {
    strapiUrl: strapiUrl.replace(/\/$/, ''),
    strapiToken,
  }
}

const getImageDeliveryOrigin = () => {
  const origin = process.env.PORTFOLIO_IMAGE_ORIGIN?.replace(/\/$/, '')

  if (!origin) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Le service de diffusion des images est indisponible.',
    })
  }

  return origin
}

const getImagePath = (url) => {
  if (!url) return null

  try {
    const parsedUrl = new URL(url)
    return parsedUrl.pathname || null
  }
  catch {
    return url.startsWith('/')
      ? url.split('?')[0].split('#')[0]
      : null
  }
}

const getOptimizedUrl = (
  sourceUrl,
  width,
  imageDeliveryOrigin,
) => {
  const imagePath = getImagePath(sourceUrl)

  if (!imagePath) {
    return null
  }

  return `${imageDeliveryOrigin}${imagePath}?w=${width}`
}

const getResponsiveSrcset = (
  sourceUrl,
  widths,
  imageDeliveryOrigin,
) =>
  widths
    .map((width) => {
      const url = getOptimizedUrl(
        sourceUrl,
        width,
        imageDeliveryOrigin,
      )

      return url
        ? `${url} ${width}w`
        : null
    })
    .filter(Boolean)
    .join(', ')

const hashName = (name) => {
  let hash = 0

  for (const character of name || '') {
    hash =
      ((hash << 5) -
        hash +
        character.charCodeAt(0)) |
      0
  }

  return hash >>> 0
}

const mixPhotos = (photos) =>
  [...photos].sort(
    (first, second) =>
      hashName(first.name) -
      hashName(second.name),
  )

const isFeaturedPhoto = (file) =>
  /#portfolio-une(?:-\d+)?\b/i.test(
    `${file.alternativeText || ''} ${file.caption || ''}`,
  )

const getFeaturedPosition = (file) => {
  const match =
    `${file.alternativeText || ''} ${file.caption || ''}`.match(
      /#portfolio-une-(\d+)\b/i,
    )

  return match
    ? Number(match[1])
    : Number.MAX_SAFE_INTEGER
}

const prioritizeFeaturedPhotos = (photos) => {
  const mixedPhotos = mixPhotos(photos)

  const featuredPhotos = mixedPhotos
    .filter(isFeaturedPhoto)
    .sort(
      (first, second) =>
        getFeaturedPosition(first) -
        getFeaturedPosition(second),
    )

  return [
    ...featuredPhotos,
    ...mixedPhotos.filter(
      (photo) => !isFeaturedPhoto(photo),
    ),
  ]
}

const getAltText = (file) =>
  `${file.alternativeText || ''} ${file.caption || ''}`
    .replace(
      /#portfolio-une(?:-\d+)?\b/gi,
      '',
    )
    .replace(/#portfolio\b/gi, '')
    .trim() || 'Photo du portfolio de Cécile'

const toPublicPhoto = (
  file,
  imageDeliveryOrigin,
) => {
  const featuredUrl = getOptimizedUrl(
    file.url,
    1200,
    imageDeliveryOrigin,
  )

  const thumbnailUrl = getOptimizedUrl(
    file.url,
    800,
    imageDeliveryOrigin,
  )

  if (!featuredUrl || !thumbnailUrl) {
    return null
  }

  return {
    id: file.id,
    alt: getAltText(file),
    height: file.height,
    name: file.name,
    featuredSrcset: getResponsiveSrcset(
      file.url,
      [800, 1200, 1600],
      imageDeliveryOrigin,
    ),
    featuredUrl,
    thumbnailSrcset: getResponsiveSrcset(
      file.url,
      [480, 800, 1200],
      imageDeliveryOrigin,
    ),
    thumbnailUrl,
    url: featuredUrl,
    width: file.width,
  }
}

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, {
    scope: 'portfolio',
    limit: 60,
    windowMs: 15 * 60 * 1000,
  })

  const page = Number(
    getQuery(event).page || 1,
  )

  if (
    !Number.isSafeInteger(page) ||
    page < 1
  ) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Page du portfolio introuvable',
    })
  }

  const {
    strapiUrl,
    strapiToken,
  } = getStrapiConfig()

  const imageDeliveryOrigin =
    getImageDeliveryOrigin()

  const response = await $fetch(
    `${strapiUrl}/api/upload/files`,
    {
      headers: {
        Authorization: `Bearer ${strapiToken}`,
      },
    },
  )

  const files = Array.isArray(response)
    ? response
    : response?.data || []

  const portfolioFiles = files.filter(
    (file) =>
      file?.mime?.startsWith('image/') &&
      file?.url &&
      isPortfolioPhoto(file),
  )

  const uniqueFiles =
    deduplicatePortfolioPhotos(
      prioritizeFeaturedPhotos(
        portfolioFiles,
      ),
    )

  const photos = uniqueFiles
    .map((file) =>
      toPublicPhoto(
        file,
        imageDeliveryOrigin,
      ),
    )
    .filter(Boolean)

  const featured = photos.slice(0, 6)
  const album = photos.slice(6)

  const initialAlbumCount = 20
  const albumBatchSize = 12

  const pageCount = Math.max(
    1,
    1 +
      Math.ceil(
        Math.max(
          0,
          album.length - initialAlbumCount,
        ) / albumBatchSize,
      ),
  )

  if (page > pageCount) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Page du portfolio introuvable',
    })
  }

  const start =
    page === 1
      ? 0
      : initialAlbumCount +
        (page - 2) * albumBatchSize

  const limit =
    page === 1
      ? initialAlbumCount
      : albumBatchSize

  return {
    featured:
      page === 1 ? featured : [],
    photos: album.slice(
      start,
      start + limit,
    ),
    page,
    pageCount,
    total: photos.length,
  }
})