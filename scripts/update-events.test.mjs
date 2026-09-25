import assert from 'node:assert/strict';
import test from 'node:test';
import {
  extractCards,
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

test('maps cards and retains curated events when refreshing', () => {
  const automatic = mapCard(reactorCard, '2026-09-25');
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
