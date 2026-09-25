import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'dist', 'events.json');
const destination = resolve(root, 'dist', 'events-data.js');
const data = JSON.parse(await readFile(source, 'utf8'));

await writeFile(
  destination,
  `window.CLOUD_CALENDAR_EVENTS = ${JSON.stringify(data, null, 2)};\n`,
  'utf8',
);
