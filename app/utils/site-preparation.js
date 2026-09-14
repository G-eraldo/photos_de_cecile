/**
 * Écran de maintenance sur l’accueil seulement.
 * Passer à `false` puis redéployer le frontend pour rétablir l’accueil.
 */
export const SITE_PREPARATION = false;

export function isHomePreparation(path) {
  if (!SITE_PREPARATION) return false;
  const normalized = (path || "/").replace(/\/+$/, "") || "/";
  return normalized === "/";
}
