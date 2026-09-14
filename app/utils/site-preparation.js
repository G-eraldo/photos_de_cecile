/**
 * Écran public « site en cours de finalisation ».
 * Passer à `false` puis redéployer le frontend pour rétablir le site.
 */
export const SITE_PREPARATION = true

const ALLOWED_PATHS = [
  "/reservation/confirmation",
  "/tirage-photo/confirmation",
  "/offrir/confirmation",
  "/connexion-agenda",
]

export function isPreparationAllowedPath(path) {
  return ALLOWED_PATHS.includes(path)
}
