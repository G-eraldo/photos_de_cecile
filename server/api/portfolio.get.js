import { enforceRateLimit } from '../utils/request-security.js'
import {
  deduplicatePortfolioPhotos,
  isCloudinaryPhoto,
  isPortfolioPhoto,
} from '../utils/portfolio-photos.js'

const STRAPI_PAGE_SIZE = 100
const FEATURED_COUNT = 6
const INITIAL_ALBUM_COUNT = 6
const ALBUM_BATCH_SIZE = 6

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

  const fullUrl = getOptimizedUrl(
    file.url,
    2000,
    imageDeliveryOrigin,
  )

  if (
    !featuredUrl ||
    !thumbnailUrl ||
    !fullUrl
  ) {
    return null
  }

  return {
    id: file.id,
    alt: getAltText(file),
    height: file.height,
    name: file.name,
    size: file.size,

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
    fullUrl,
    width: file.width,
  }
}

const extractFiles = (response) => {
  if (Array.isArray(response)) {
    return response
  }

  if (Array.isArray(response?.data)) {
    return response.data
  }

  if (Array.isArray(response?.results)) {
    return response.results
  }

  return []
}

const getStrapiPageCount = (response, batchLength) => {
  const pagination =
    response?.meta?.pagination ||
    response?.pagination ||
    null

  if (pagination?.pageCount) {
    return Number(pagination.pageCount)
  }

  if (pagination?.total && pagination?.pageSize) {
    return Math.ceil(
      Number(pagination.total) / Number(pagination.pageSize),
    )
  }

  return batchLength < STRAPI_PAGE_SIZE ? 1 : null
}

const fetchUploadPage = async (
  strapiUrl,
  strapiToken,
  query,
) =>
  $fetch(
    `${strapiUrl}/api/upload/files`,
    {
      headers: {
        Authorization: `Bearer ${strapiToken}`,
      },
      ...(query ? { query } : {}),
    },
  )

const fetchAllUploadFiles = async (strapiUrl, strapiToken) => {
  try {
    const files = []
    let page = 1
    let pageCount = null

    while (pageCount === null || page <= pageCount) {
      const response = await fetchUploadPage(
        strapiUrl,
        strapiToken,
        {
          'pagination[page]': page,
          'pagination[pageSize]': STRAPI_PAGE_SIZE,
        },
      )

      const batch = extractFiles(response)
      files.push(...batch)

      const detectedPageCount = getStrapiPageCount(
        response,
        batch.length,
      )

      if (detectedPageCount !== null) {
        pageCount = detectedPageCount
      }
      else if (batch.length < STRAPI_PAGE_SIZE) {
        break
      }

      if (!batch.length) {
        break
      }

      page += 1

      if (page > 50) {
        break
      }
    }

    if (files.length) {
      return files
    }
  }
  catch (error) {
    console.error(
      'Pagination Strapi indisponible, fallback sans query :',
      error?.data?.error || error?.message || error,
    )
  }

  const fallbackResponse = await fetchUploadPage(
    strapiUrl,
    strapiToken,
  )

  return extractFiles(fallbackResponse)
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

  const files = await fetchAllUploadFiles(
    strapiUrl,
    strapiToken,
  )

  const portfolioFiles = files.filter(
    (file) =>
      file?.mime?.startsWith('image/') &&
      file?.url &&
      !isCloudinaryPhoto(file) &&
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

  const featured = photos.slice(0, FEATURED_COUNT)
  const album = photos.slice(FEATURED_COUNT)

  const pageCount = Math.max(
    1,
    1 +
      Math.ceil(
        Math.max(
          0,
          album.length - INITIAL_ALBUM_COUNT,
        ) / ALBUM_BATCH_SIZE,
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
      : INITIAL_ALBUM_COUNT +
        (page - 2) * ALBUM_BATCH_SIZE

  const limit =
    page === 1
      ? INITIAL_ALBUM_COUNT
      : ALBUM_BATCH_SIZE

  const pagePhotos = album.slice(
    start,
    start + limit,
  )

  const hasMore = page < pageCount

  return {
    featured:
      page === 1 ? featured : [],
    photos: pagePhotos,
    page,
    pageCount,
    hasMore,
    nextPage: hasMore ? page + 1 : null,
    total: photos.length,
    albumTotal: album.length,
  }
})
