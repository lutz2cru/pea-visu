const pad = (n: number) => String(n).padStart(2, '0');

/** Format iCalendar local : AAAAMMJJTHHMMSS */
function icsLocal(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

/** Format iCalendar UTC : AAAAMMJJTHHMMSSZ */
function icsUtc(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

/** Prochaine occurrence du jour `day` du mois à 9 h (ce mois-ci si elle n'est pas passée, sinon le mois suivant). */
function nextMonthlyOccurrence(day: number, from: Date = new Date()): Date {
  const candidate = new Date(from.getFullYear(), from.getMonth(), day, 9, 0, 0);
  if (candidate > from) return candidate;
  return new Date(from.getFullYear(), from.getMonth() + 1, day, 9, 0, 0);
}

/**
 * Génère et télécharge un fichier .ics (iCalendar) avec un rappel mensuel de versement,
 * importable dans l'agenda d'un smartphone (iPhone / Android) ou d'un ordinateur.
 */
export function downloadDcaCalendarReminder(amount: number, dayOfMonth: number = 2): void {
  const start = nextMonthlyOccurrence(dayOfMonth);
  const amountLabel = `${amount.toLocaleString('fr-FR')} €`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PEA Visu//Rappel versement//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:pea-versement-${Date.now()}@pea-visu`,
    `DTSTAMP:${icsUtc(new Date())}`,
    `DTSTART;TZID=Europe/Paris:${icsLocal(start)}`,
    `RRULE:FREQ=MONTHLY;BYMONTHDAY=${dayOfMonth}`,
    `SUMMARY:Versement mensuel PEA (${amountLabel})`,
    `DESCRIPTION:Rappel : versement de ${amountLabel} sur ton PEA.\\nOuvre PEA Visualiseur (Où placer mon prochain versement ?) pour voir quelles parts acheter.`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT0M',
    'ACTION:DISPLAY',
    `DESCRIPTION:Versement mensuel PEA (${amountLabel})`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'rappel_versement_pea.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
