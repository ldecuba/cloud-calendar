import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const eventsPath = resolve(root, 'dist', 'events.json');
const sourceUrl = 'https://developer.microsoft.com/en-us/events';
const managedBy = 'microsoft-developer-events';
const windowDays = 92;
const maxPriorityOnlineEvents = 45;
const maxOtherOnlineEvents = 15;

const locationTimeZones = [
  [/netherlands|nederland|amsterdam|utrecht|rotterdam|groningen|eindhoven/i, 'Europe/Amsterdam'],
  [/redmond|seattle|bellevue/i, 'America/Los_Angeles'],
  [/sydney|melbourne/i, 'Australia/Sydney'],
  [/shanghai|beijing/i, 'Asia/Shanghai'],
  [/sao paulo|são paulo/i, 'America/Sao_Paulo'],
  [/london/i, 'Europe/London'],
  [/new york/i, 'America/New_York'],
];

export function extractCards(html) {
  const marker = 'var cards = ';
  const start = html.indexOf(marker);
  if (start < 0) throw new Error('Microsoft event data marker was not found');

  const arrayStart = start + marker.length;
  let depth = 0;
  let inString = false;
  let escaped = false;
  let arrayEnd = -1;
  for (let index = arrayStart; index < html.length; index += 1) {
    const character = html[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') inString = true;
    else if (character === '[') depth += 1;
    else if (character === ']') {
      depth -= 1;
      if (depth === 0) {
        arrayEnd = index;
        break;
      }
    }
  }
  if (arrayEnd < 0) throw new Error('Microsoft event data was incomplete');

  const cards = JSON.parse(html.slice(arrayStart, arrayEnd + 1));
  if (!Array.isArray(cards) || cards.length === 0) {
    throw new Error('Microsoft event data did not contain any events');
  }
  return cards;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function hasExplicitOffset(value) {
  return /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
}

function timeZoneFor(location) {
  return locationTimeZones.find(([pattern]) => pattern.test(location || ''))?.[1];
}

function partsInTimeZone(date, timeZone) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  return Object.fromEntries(
    formatter.formatToParts(date)
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, Number(value)]),
  );
}

export function localDateTimeToIso(value, timeZone) {
  if (hasExplicitOffset(value)) return new Date(value).toISOString();
  if (!timeZone) throw new Error(`No timezone mapping for ${value}`);

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/);
  if (!match) throw new Error(`Unsupported date value: ${value}`);
  const [, year, month, day, hour, minute, second] = match.map(Number);
  const target = Date.UTC(year, month - 1, day, hour, minute, second);
  let guess = target;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const observed = partsInTimeZone(new Date(guess), timeZone);
    const observedUtc = Date.UTC(
      observed.year,
      observed.month - 1,
      observed.day,
      observed.hour,
      observed.minute,
      observed.second,
    );
    guess += target - observedUtc;
  }

  return new Date(guess).toISOString();
}

function isNetherlandsEvent(card) {
  return /netherlands|nederland/i.test(card.Location || '')
    && (card.Formats || []).some((format) => /in person|hybrid/i.test(format));
}

function isReactorOnlineEvent(card) {
  const isReactor = /developer\.microsoft\.com\/(?:[a-z-]+\/)?reactor\/events/i.test(card.URL || '');
  const isLiveOnline = (card.Formats || []).some((format) => /livestream|online|virtual|hybrid/i.test(format));
  const isEnglish = [...(card.MappedLanguages || []), ...(card.Languages || [])]
    .some((language) => /english/i.test(language));
  return isReactor && isLiveOnline && isEnglish;
}

function isMicrosoftAiEvent(card) {
  const text = `${card.Title} ${card.Description} ${(card.EventTopics || []).join(' ')}`;
  return /microsoft foundry|azure ai|copilot|microsoft 365|m365|workiq|agent 365|\bai\b|agents?/i.test(text);
}

export function selectCards(cards, now) {
  const windowEnd = addDays(now, windowDays);
  const inWindow = (card) => {
    const start = new Date(card.StartDateTime);
    return !Number.isNaN(start.valueOf()) && start >= now && start <= windowEnd;
  };
  const netherlands = cards.filter((card) => inWindow(card) && isNetherlandsEvent(card));
  const online = cards
    .filter((card) => inWindow(card) && isReactorOnlineEvent(card))
    .sort((left, right) => new Date(left.StartDateTime) - new Date(right.StartDateTime));
  const priorityOnline = online.filter(isMicrosoftAiEvent).slice(0, maxPriorityOnlineEvents);
  const priorityUrls = new Set(priorityOnline.map((card) => card.URL));
  const otherOnline = online
    .filter((card) => !priorityUrls.has(card.URL))
    .slice(0, maxOtherOnlineEvents);
  return [...netherlands, ...priorityOnline, ...otherOnline];
}

function cleanText(value) {
  return String(value || '')
    .replace(/\[eventID:\d+\]/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slug(value) {
  return value.toLowerCase().normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 70);
}

function inferredTopics(card) {
  const topics = (card.EventTopics || []).filter(Boolean);
  const text = `${card.Title} ${card.Description}`.toLowerCase();
  const candidates = [
    ['Microsoft AI', /microsoft foundry|azure ai|copilot|agent|\bai\b/],
    ['Microsoft Foundry', /microsoft foundry|foundry agent|\.net \+ foundry/],
    ['Microsoft 365', /microsoft 365|m365|workiq/],
    ['Azure', /azure/],
    ['Fabric', /fabric/],
    ['Power BI', /power bi/],
    ['Power Platform', /power platform|power apps|power automate/],
    ['Copilot', /copilot/],
    ['GitHub', /github/],
    ['AI', /\bai\b|agent|model/],
    ['Data', /\bdata\b|sql|cosmos/],
    ['Security', /security|governance|compliance/],
    ['.NET', /\.net/],
  ];
  for (const [topic, pattern] of candidates) {
    if (pattern.test(text) && !topics.includes(topic)) topics.push(topic);
  }
  return topics.length ? topics.slice(0, 6) : ['Microsoft Cloud'];
}

function sourceName(card) {
  if (/reactor\/events/i.test(card.URL || '')) return 'Microsoft Reactor';
  if (/communitydays\.org/i.test(card.URL || '')) return 'Microsoft Community Days';
  return 'Microsoft Developer Events';
}

function eventId(card, start) {
  const reactorId = card.URL?.match(/reactor\/events\/(\d+)/i)?.[1];
  if (reactorId) return `reactor-${reactorId}`;
  return `${slug(sourceName(card))}-${slug(card.Title)}-${start.slice(0, 10)}`;
}

export function mapCard(card, verified) {
  const timeZone = timeZoneFor(card.Location);
  const start = localDateTimeToIso(card.StartDateTime, timeZone);
  const end = localDateTimeToIso(card.EndDateTime || card.StartDateTime, timeZone);
  const online = isReactorOnlineEvent(card) && !isNetherlandsEvent(card);
  const source = sourceName(card);
  const description = cleanText(card.Description)
    || `${source} event. Check the event page for the latest agenda and registration details.`;

  return {
    id: eventId(card, start),
    title: cleanText(card.Title),
    start,
    end,
    format: online ? 'Online' : 'In person',
    location: online ? 'Worldwide livestream' : cleanText(card.Location),
    topics: inferredTopics(card),
    cost: source === 'Microsoft Reactor' ? 'Free' : 'See event page',
    language: (card.MappedLanguages || card.Languages || []).filter(Boolean).join(' / ') || 'English',
    organizer: source,
    url: card.URL,
    source,
    verified,
    description,
    managedBy,
  };
}

function normalizedHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function sameEvent(left, right) {
  if (left.id === right.id) return true;
  const sameUrl = left.url && right.url && left.url.replace(/\/$/, '') === right.url.replace(/\/$/, '');
  if (sameUrl && left.start.slice(0, 10) === right.start.slice(0, 10)) return true;
  const datesClose = Math.abs(new Date(left.start) - new Date(right.start)) <= 3 * 86400000;
  return datesClose
    && normalizedHost(left.url)
    && normalizedHost(left.url) === normalizedHost(right.url)
    && slug(left.title).includes(slug(right.title).split('-')[0]);
}

export function mergeEvents(existingEvents, automaticEvents, now, windowEnd) {
  const retainedManual = existingEvents.filter((event) => {
    if (event.managedBy === managedBy) return false;
    const eventEnd = new Date(event.end || event.start);
    const eventStart = new Date(event.start);
    return eventEnd >= now && eventStart <= windowEnd;
  });
  const merged = [...automaticEvents];
  for (const manualEvent of retainedManual) {
    if (!merged.some((automaticEvent) => sameEvent(automaticEvent, manualEvent))) {
      merged.push(manualEvent);
    }
  }
  return merged.sort((left, right) => new Date(left.start) - new Date(right.start));
}

export async function updateEvents({ now = new Date(), fetchImpl = fetch } = {}) {
  const response = await fetchImpl(sourceUrl, {
    headers: { 'user-agent': 'Cloud-Calendar-NL/1.0 (+https://github.com/ldecuba/cloud-calendar)' },
  });
  if (!response.ok) throw new Error(`Microsoft events request failed with HTTP ${response.status}`);

  const cards = extractCards(await response.text());
  const selected = selectCards(cards, now);
  const verified = now.toISOString().slice(0, 10);
  const automaticEvents = selected.flatMap((card) => {
    try {
      return [mapCard(card, verified)];
    } catch (error) {
      console.warn(`Skipping ${card.Title}: ${error.message}`);
      return [];
    }
  });
  if (automaticEvents.length === 0) throw new Error('No eligible automatic events were produced');

  const existing = JSON.parse(await readFile(eventsPath, 'utf8'));
  const windowEndDate = addDays(now, windowDays);
  const output = {
    lastUpdated: verified,
    windowStart: verified,
    windowEnd: windowEndDate.toISOString().slice(0, 10),
    sources: [
      { name: 'Microsoft Reactor', url: sourceUrl, selection: 'English online livestreams' },
      { name: 'Microsoft Developer Events', url: sourceUrl, selection: 'In-person events in the Netherlands' },
    ],
    events: mergeEvents(existing.events || [], automaticEvents, now, windowEndDate),
  };

  await writeFile(eventsPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(`Updated ${output.events.length} events (${automaticEvents.length} automatic, ${output.events.length - automaticEvents.length} curated).`);
  return output;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await updateEvents();
}
