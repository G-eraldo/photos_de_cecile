import { Resend } from 'resend';
import { calendarEventsUrl, getGoogleAccessToken, isAvailabilityEvent } from '../../utils/google-calendar.js';

const hasOverlap = (start, end, otherStart, otherEnd) => start < otherEnd && end > otherStart;

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const body = await readBody(event);
  const { nom, prenom, email, prestation, date, heure, message } = body || {};

  if (![nom, prenom, email, prestation, date, heure].every((value) => typeof value === 'string' && value.trim())) {
    throw createError({ statusCode: 400, statusMessage: 'Informations de réservation incomplètes.' });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(heure)) {
    throw createError({ statusCode: 400, statusMessage: 'Date ou créneau invalide.' });
  }

  const start = new Date(`${date}T${heure}:00`);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  if (Number.isNaN(start.getTime()) || start <= new Date()) {
    throw createError({ statusCode: 400, statusMessage: 'Ce créneau n’est plus disponible.' });
  }

  const accessToken = await getGoogleAccessToken(config);
  const url = new URL(calendarEventsUrl(config.googleCalendarId));
  url.search = new URLSearchParams({ timeMin: start.toISOString(), timeMax: end.toISOString(), singleEvents: 'true' }).toString();

  const existing = await $fetch(url.toString(), { headers: { Authorization: `Bearer ${accessToken}` } });
  const events = existing.items || [];
  const inAvailability = events.some((item) => isAvailabilityEvent(item)
    && new Date(item.start?.dateTime || item.start?.date) <= start
    && new Date(item.end?.dateTime || item.end?.date) >= end);
  const alreadyReserved = events.some((item) => !isAvailabilityEvent(item)
    && hasOverlap(start, end, new Date(item.start?.dateTime || item.start?.date), new Date(item.end?.dateTime || item.end?.date)));

  if (!inAvailability || alreadyReserved) {
    throw createError({ statusCode: 409, statusMessage: 'Ce créneau vient d’être réservé. Merci d’en choisir un autre.' });
  }

  await $fetch(calendarEventsUrl(config.googleCalendarId), {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: {
      summary: `Réservation — ${prestation.trim()}`,
      description: `Client : ${prenom.trim()} ${nom.trim()}\nEmail : ${email.trim()}${message?.trim() ? `\nPrécisions : ${message.trim()}` : ''}`,
      start: { dateTime: `${date}T${heure}:00`, timeZone: 'Europe/Paris' },
      end: { dateTime: `${date}T${String(start.getHours() + 2).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}:00`, timeZone: 'Europe/Paris' },
    },
  });

  let emailSent = true;
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email.trim(),
      subject: 'Confirmation de votre réservation — Les Photos de Cécile',
      text: `Bonjour ${prenom.trim()},\n\nVotre séance « ${prestation.trim()} » est réservée le ${date} de ${heure} à ${String(start.getHours() + 2).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}.\n\nCécile vous recontactera si besoin.`,
    });
  } catch (error) {
    emailSent = false;
    console.error('Réservation créée, mais e-mail de confirmation non envoyé.', error);
  }

  return { success: true, emailSent };
});
