const PARIS_TIME_ZONE = "Europe/Paris";

const parisDateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: PARIS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

const partsInParis = (date) => Object.fromEntries(
  parisDateTimeFormatter
    .formatToParts(date)
    .filter(({ type }) => type !== "literal")
    .map(({ type, value }) => [type, Number(value)]),
);

export const dateTimeInParis = (date, time) => {
  const [year, month, day] = String(date).split("-").map(Number);
  const [hour, minute] = String(time).split(":").map(Number);
  const targetAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0);

  if (![year, month, day, hour, minute, targetAsUtc].every(Number.isFinite)) {
    return new Date(Number.NaN);
  }

  let timestamp = targetAsUtc;
  for (let iteration = 0; iteration < 3; iteration += 1) {
    const rendered = partsInParis(new Date(timestamp));
    const renderedAsUtc = Date.UTC(
      rendered.year,
      rendered.month - 1,
      rendered.day,
      rendered.hour,
      rendered.minute,
      rendered.second,
    );
    const correction = targetAsUtc - renderedAsUtc;
    timestamp += correction;
    if (correction === 0) break;
  }

  const result = new Date(timestamp);
  const rendered = partsInParis(result);
  if (
    rendered.year !== year
    || rendered.month !== month
    || rendered.day !== day
    || rendered.hour !== hour
    || rendered.minute !== minute
  ) {
    return new Date(Number.NaN);
  }

  return result;
};

export const formatParisTime = (date) => new Intl.DateTimeFormat("fr-FR", {
  timeZone: PARIS_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
}).format(date);
