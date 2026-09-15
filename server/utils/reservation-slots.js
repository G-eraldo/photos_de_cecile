import { getReservationDurationMs } from "../../shared/utils/reservation-duration.js";
import {
  getAvailabilitySessionType,
  isReservationAvailabilityEvent,
} from "./google-calendar.js";

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
        (item) => item?.status !== "cancelled" && !isReservationAvailabilityEvent(item),
      )
      .map(toInterval),
    ...holds,
  ].filter(isValidInterval);

  return (events || []).filter(isReservationAvailabilityEvent).flatMap((item) => {
    const interval = toInterval(item);
    if (!isValidInterval(interval)) return [];

    const sessionType = getAvailabilitySessionType(item);
    const durationMs = getReservationDurationMs(sessionType);

    const slots = [];
    for (
      const start = new Date(interval.start);
      start.getTime() + durationMs <= interval.end.getTime();
      start.setTime(start.getTime() + durationMs)
    ) {
      if (start < now) continue;
      const end = new Date(start.getTime() + durationMs);
      const blocked = blockedIntervals.some(
        (other) => start < other.end && end > other.start,
      );
      if (!blocked)
        slots.push({ start: start.toISOString(), end: end.toISOString(), sessionType });
    }
    return slots;
  });
};

export const isOfferedSlot = (slots, start, sessionType) =>
  (slots || []).some(
    (slot) =>
      Date.parse(slot.start) === start.getTime() &&
      slot.sessionType === sessionType,
  );
