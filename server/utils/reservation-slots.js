import { RESERVATION_DURATION_MS } from "../../shared/utils/reservation-duration.js";
import { isAvailabilityEvent } from "./google-calendar.js";

const toInterval = (item) => ({
  start: new Date(item.start?.dateTime || item.start?.date || item.start),
  end: new Date(item.end?.dateTime || item.end?.date || item.end),
});

const isValidInterval = (item) =>
  item?.start instanceof Date &&
  item?.end instanceof Date &&
  !Number.isNaN(item.start.getTime()) &&
  !Number.isNaN(item.end.getTime()) &&
  item.start < item.end;

export const buildAvailabilitySlots = ({ events, now, holds = [] }) => {
  const blockedIntervals = [
    ...(events || [])
      .filter(
        (item) => item?.status !== "cancelled" && !isAvailabilityEvent(item),
      )
      .map(toInterval),
    ...holds,
  ].filter(isValidInterval);

  return (events || []).filter(isAvailabilityEvent).flatMap((item) => {
    const interval = toInterval(item);
    if (!isValidInterval(interval)) return [];

    const slots = [];
    for (
      const start = new Date(interval.start);
      start.getTime() + RESERVATION_DURATION_MS <= interval.end.getTime();
      start.setTime(start.getTime() + RESERVATION_DURATION_MS)
    ) {
      if (start < now) continue;
      const end = new Date(start.getTime() + RESERVATION_DURATION_MS);
      const blocked = blockedIntervals.some(
        (other) => start < other.end && end > other.start,
      );
      if (!blocked)
        slots.push({ start: start.toISOString(), end: end.toISOString() });
    }
    return slots;
  });
};

export const isOfferedSlot = (slots, start) =>
  (slots || []).some((slot) => Date.parse(slot.start) === start.getTime());
