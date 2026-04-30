export interface IcalEvent {
  start: string; // "YYYY-MM-DD"
  end: string;   // "YYYY-MM-DD"
  summary?: string;
}

function parseIcalDate(raw: string): string {
  // Handles: 20260501, 20260501T120000Z, 20260501T120000
  const digits = raw.replace(/T.*$/, '').trim();
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

function unfoldLines(text: string): string[] {
  // iCal line folding: lines starting with space/tab are continuations
  return text
    .split(/\r?\n/)
    .reduce<string[]>((acc, line) => {
      if ((line.startsWith(' ') || line.startsWith('\t')) && acc.length > 0) {
        acc[acc.length - 1] += line.slice(1);
      } else {
        acc.push(line);
      }
      return acc;
    }, []);
}

export async function fetchAndParseIcal(url: string): Promise<IcalEvent[]> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`iCal fetch failed: ${res.status}`);
  const text = await res.text();
  const lines = unfoldLines(text);

  const events: IcalEvent[] = [];
  let inEvent = false;
  let start = '';
  let end = '';
  let summary = '';

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      inEvent = true; start = ''; end = ''; summary = '';
    } else if (line === 'END:VEVENT') {
      if (inEvent && start && end) events.push({ start, end, summary: summary || undefined });
      inEvent = false;
    } else if (inEvent) {
      const colon = line.indexOf(':');
      if (colon === -1) continue;
      const key = line.slice(0, colon).toUpperCase().split(';')[0];
      const val = line.slice(colon + 1).trim();
      if (key === 'DTSTART') start = parseIcalDate(val);
      else if (key === 'DTEND')   end   = parseIcalDate(val);
      else if (key === 'SUMMARY') summary = val;
    }
  }
  return events;
}

export function overlaps(
  aStart: string, aEnd: string,
  bStart: string, bEnd: string,
): boolean {
  return aStart < bEnd && aEnd > bStart;
}
