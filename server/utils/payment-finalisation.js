const FINALISATION_TIMEOUT_MS = 2 * 60 * 1000;

export const isFinalisationStale = (details, now = Date.now()) => {
  const finalisation = details?.finalisation;
  if (finalisation?.statut !== "en_cours") return false;
  const startedAt = Date.parse(finalisation.demarreeLe);
  return !Number.isFinite(startedAt) || startedAt <= now - FINALISATION_TIMEOUT_MS;
};
