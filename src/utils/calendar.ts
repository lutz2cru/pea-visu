/**
 * Génère et déclenche le téléchargement d'un fichier .ics (iCalendar)
 * pour configurer un rappel récurrent mensuel sur n'importe quel smartphone (iPhone/Android)
 */
export function downloadDcaCalendarReminder(): void {
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PEA Visu//Rappel DCA WPEA Fortuneo//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:dca-wpea-fortuneo-reminder-' + Date.now() + '@pea-visu',
    'DTSTAMP:20261007T120000Z',
    'DTSTART;TZID=Europe/Paris:20261102T090000',
    'RRULE:FREQ=MONTHLY;BYMONTHDAY=2',
    'SUMMARY:🚀 Investir 100 € sur PEA Fortuneo (WPEA)',
    'DESCRIPTION:Rappel DCA Mensuel PEA Fortuneo :\\n- Actif : iShares MSCI World Swap PEA (WPEA)\\n- Code ISIN : IE0002XZSHO1\\n- Montant cible : ~100 € (environ 17 parts)\\n- Frais de courtage : 0 € (Offre Starter Fortuneo, 1er ordre < 500 € gratuit)\\n\\nOuvrez votre application Fortuneo pour passer votre ordre au marché.',
    'LOCATION:Application Fortuneo',
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT0M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Investir 100 € sur WPEA (PEA Fortuneo)',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'rappel_dca_pea_fortuneo.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
