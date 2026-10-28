// `npm start`: serve the city and keep this clone on the latest main, so a merged PR appears on screen by itself.
import { execFile } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { createServer } from 'vite';
import { parseLastMerge } from './last-merge.mjs';

const PULL_EVERY_MS = 5000;
const LAST_MERGE_FILE = new URL('../public/last-merge.json', import.meta.url);
const git = async (...args) => (await promisify(execFile)('git', args)).stdout.trim();

let paused = false;

async function writeLastMerge() {
  const [subject, ...body] = (await git('log', '-1', '--format=%s%n%b')).split('\n');
  const next = JSON.stringify(parseLastMerge(subject, body.join('\n')));
  const current = await readFile(LAST_MERGE_FILE, 'utf8').catch(() => '');
  if (next === current) return;
  await mkdir(new URL('.', LAST_MERGE_FILE), { recursive: true });
  await writeFile(LAST_MERGE_FILE, next);
}

async function pull() {
  try {
    const before = await git('rev-parse', 'HEAD');
    await git('pull', '--ff-only', '--quiet');
    const after = await git('rev-parse', 'HEAD');
    if (after !== before) console.log(`  pulled ${before.slice(0, 7)}..${after.slice(0, 7)}`);
    if (paused) console.log('  auto-pull resumed');
    paused = false;
  } catch (err) {
    if (!paused) console.warn(`  auto-pull paused: ${(err.stderr || err.message).trim()}`);
    paused = true;
  }
  await writeLastMerge().catch(() => {});
}

const server = await createServer();
await server.listen();
server.printUrls();
console.log(`  auto-pull every ${PULL_EVERY_MS / 1000}s from ${await git('rev-parse', '--abbrev-ref', '@{u}').catch(() => 'no upstream')}`);
await pull();
setInterval(pull, PULL_EVERY_MS);
