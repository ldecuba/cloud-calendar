import assert from 'node:assert/strict';
import test from 'node:test';
import {
  eventsForDisplayWeek,
  extractCards,
  extractSocialImage,
  imagePathForUrl,
  localDateTimeToIso,
  mapCard,
  mergeEvents,
  selectCards,
} from './update-events.mjs';

const reactorCard = {
  Title: 'Azure agents with GitHub Copilot',
  URL: 'https://developer.microsoft.com/reactor/events/12345',
  StartDateTime: '2026-10-13T10:00:00',
  EndDateTime: '2026-10-13T11:00:00',
  EventTopics: ['Agents'],
  Location: 'Redmond',
  Formats: ['Livestream', 'On demand'],
  Languages: ['English'],
  MappedLanguages: ['English'],
  Description: 'Build an Azure agent. [eventID:12345]',
};

test('extracts the embedded Microsoft cards array', () => {
  const cardWithDelimiter = { ...reactorCard, Description: 'Example text containing ]; safely.' };
  assert.deepEqual(
    extractCards(`<script>var cards = ${JSON.stringify([cardWithDelimiter])};</script>`),
    [cardWithDelimiter],
  );
});

test('converts source-local timestamps through daylight saving time', () => {
  assert.equal(localDateTimeToIso('2026-10-13T10:00:00', 'America/Los_Angeles'), '2026-10-13T17:00:00.000Z');
});

test('extracts and resolves an Open Graph event image', () => {
  const html = '<meta property="og:image" content="/images/event-card.png?x=1&amp;y=2">';
  assert.equal(
    extractSocialImage(html, 'https://events.example.com/session/42'),
    'https://events.example.com/images/event-card.png?x=1&y=2',
  );
});

test('creates a stable local path for downloaded event images', () => {
  assert.equal(
    imagePathForUrl('https://example.com/event.png', 'image/png'),
    imagePathForUrl('https://example.com/event.png', 'image/png'),
  );
  assert.match(imagePathForUrl('https://example.com/event.png', 'image/png'), /^event-images\/[a-f0-9]{20}\.png$/);
});

test('uses the current week or falls forward to the next week with events', () => {
  const events = [
    { start: '2026-09-29T10:00:00.000Z', end: '2026-09-29T11:00:00.000Z' },
    { start: '2026-10-06T10:00:00.000Z', end: '2026-10-06T11:00:00.000Z' },
  ];
  const display = eventsForDisplayWeek(events, new Date('2026-09-25T12:00:00.000Z'));
  assert.equal(display.weekStart.toISOString(), '2026-09-28T00:00:00.000Z');
  assert.equal(display.events.length, 1);
});

test('selects English Reactor livestreams and Netherlands in-person events', () => {
  const netherlandsCard = {
    ...reactorCard,
    Title: 'Dutch community day',
    URL: 'https://www.communitydays.org/event/dutch-community-day',
    Location: 'Utrecht Netherlands',
    Formats: ['In Person'],
  };
  const outsideCard = { ...netherlandsCard, Title: 'Berlin event', Location: 'Berlin Germany' };
  const selected = selectCards([reactorCard, netherlandsCard, outsideCard], new Date('2026-09-25T00:00:00Z'));
  assert.deepEqual(selected.map(({ Title }) => Title), ['Dutch community day', 'Azure agents with GitHub Copilot']);
});

test('prioritizes Microsoft AI events before the general online cap', () => {
  const generalCards = Array.from({ length: 20 }, (_, index) => ({
    ...reactorCard,
    Title: `General developer event ${index}`,
    URL: `https://developer.microsoft.com/reactor/events/${20000 + index}`,
    StartDateTime: `2026-10-${String(index + 1).padStart(2, '0')}T10:00:00`,
    EndDateTime: `2026-10-${String(index + 1).padStart(2, '0')}T11:00:00`,
    EventTopics: ['Developer Tools'],
    Description: 'General developer tooling session.',
  }));
  const lateFoundryEvent = {
    ...reactorCard,
    Title: 'Microsoft Foundry agents in production',
    URL: 'https://developer.microsoft.com/reactor/events/29999',
    StartDateTime: '2026-12-01T10:00:00',
    EndDateTime: '2026-12-01T11:00:00',
  };
  const selected = selectCards([...generalCards, lateFoundryEvent], new Date('2026-09-25T00:00:00Z'));
  assert(selected.some(({ Title }) => Title === lateFoundryEvent.Title));
});

test('maps cards and retains curated events when refreshing', () => {
  const automatic = mapCard(reactorCard, '2026-09-25');
  assert(automatic.topics.includes('Microsoft AI'));
  assert(automatic.topics.includes('Copilot'));
  const curated = {
    id: 'curated-event',
    title: 'Curated event',
    start: '2026-10-20',
    end: '2026-10-20',
    url: 'https://example.com/event',
  };
  const staleAutomatic = { ...automatic, title: 'Old title' };
  const merged = mergeEvents(
    [curated, staleAutomatic],
    [automatic],
    new Date('2026-09-25T00:00:00Z'),
    new Date('2026-12-26T00:00:00Z'),
  );
  assert.deepEqual(merged.map(({ title }) => title), ['Azure agents with GitHub Copilot', 'Curated event']);
});
