import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { resolve } from 'node:path';

const rl = createInterface({ input: process.stdin, terminal: false });
const line = await new Promise(resolve => rl.once('line', resolve));
rl.close();
const input = JSON.parse(line);
const root = resolve(import.meta.dirname, '..');
function run(cmd, args, extraEnv = {}) {
  const result = spawnSync(cmd, args, { cwd: root, env: { ...process.env, ...extraEnv }, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${cmd} failed: ${result.stderr || result.stdout}`);
  return result.stdout.trim();
}

const git = 'C:\\Program Files\\Git\\cmd\\git.exe';
const tar = 'C:\\Windows\\System32\\tar.exe';
run(process.execPath, ['scripts/build-event-data.mjs']);
if (!existsSync(resolve(root, '.git'))) run(git, ['init', '-b', input.branch]);
run(git, ['config', 'user.name', 'Cloud Calendar NL']);
run(git, ['config', 'user.email', 'calendar@local.invalid']);
run(git, ['add', '.openai/hosting.json', 'dist/index.html', 'dist/events.json', 'dist/events-data.js', 'dist/event-images', 'dist/deliverits-logo.png']);
const pending = spawnSync(git, ['diff', '--cached', '--quiet'], { cwd: root });
if (pending.status !== 0) run(git, ['commit', '-m', 'Build Microsoft Cloud events calendar']);
const remotes = run(git, ['remote']).split(/\s+/).filter(Boolean);
if (remotes.includes('sites')) run(git, ['remote', 'set-url', 'sites', input.remote]);
else run(git, ['remote', 'add', 'sites', input.remote]);
const auth = `Authorization: Bearer ${input.token}`;
run(git, ['push', '--force', 'sites', `HEAD:${input.branch}`], {
  GIT_CONFIG_COUNT: '1',
  GIT_CONFIG_KEY_0: 'http.extraHeader',
  GIT_CONFIG_VALUE_0: auth
});
const sha = run(git, ['rev-parse', 'HEAD']);
const archive = resolve(root, 'site.tar.gz');
run(tar, ['-czf', archive, '.openai', 'dist', 'scripts']);
process.stdout.write(JSON.stringify({ sha, archive }));
