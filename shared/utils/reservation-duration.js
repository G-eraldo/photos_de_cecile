export const RESERVATION_DURATION_HOURS = 1;
export const RESERVATION_DURATION_MS = RESERVATION_DURATION_HOURS * 60 * 60 * 1000;
export const THEMED_RESERVATION_DURATION_MINUTES = 30;
export const THEMED_RESERVATION_DURATION_MS = THEMED_RESERVATION_DURATION_MINUTES * 60 * 1000;

export const SESSION_TYPES = {
  STANDARD: "standard",
  THEMED: "themed",
};

export const THEMED_SESSION_NAME = "Séance à thème";

const normalizeSessionName = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

export const isThemedSession = (value) => {
  const name = normalizeSessionName(value);

  return name === normalizeSessionName(THEMED_SESSION_NAME) || /^seances? a themes?(?:\s*[-–—:]|$)/.test(name);
};

export const getReservationSessionType = (forfait) =>
  isThemedSession(forfait) ? SESSION_TYPES.THEMED : SESSION_TYPES.STANDARD;

export const getReservationDurationMs = (sessionType) =>
  sessionType === SESSION_TYPES.THEMED
    ? THEMED_RESERVATION_DURATION_MS
    : RESERVATION_DURATION_MS;
