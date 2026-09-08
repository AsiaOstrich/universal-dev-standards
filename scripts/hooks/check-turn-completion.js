#!/usr/bin/env node
/**
 * UDS Hook: Turn Completion Integrity
 *
 * Runs at turn end. Blocks when the agent's final message states a first-person
 * commitment to a next action that the turn then ended without taking.
 *
 * Contract (Claude Code Stop hook):
 *   stdin  — JSON with session_id, transcript_path, stop_hook_active
 *   block  — print {"decision":"block","reason":"..."} on stdout, exit 0
 *   allow  — print nothing, exit 0
 *
 * Every failure path allows. See core/turn-completion-integrity.md R5: a hook
 * that can trap a session is worse than none, because the only recovery a human
 * has is to disable it, and they will disable it permanently.
 *
 * Usage: node check-turn-completion.js  (reads stdin)
 *        node check-turn-completion.js --self-test
 *        node check-turn-completion.js --languages
 *
 * @see docs/specs/SPEC-HOOKS-001-core-standard-hooks.md
 * @see core/turn-completion-integrity.md
 */
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectCommitment } from './turn-completion/detect.js';

export const VERSION = '1.0.0';

const COOLDOWN_SEC = 120;
// A cap counted per session with no reset is an off switch on a delay: it
// disarms silently in exactly the long session where the rule matters most.
// A rolling window bounds runaway loops just as well and recovers by itself.
const MAX_BLOCKS_PER_WINDOW = 6;
const WINDOW_SEC = 3600;

const STATE_DIR = join(homedir(), '.uds', 'turn-completion');
const HERE = dirname(fileURLToPath(import.meta.url));

/** Load every shipped locale pack. A pack that fails to load is skipped, not fatal. */
export async function loadPacks() {
  const packs = [];
  for (const id of ['en', 'zh-TW']) {
    try {
      packs.push(await import(join(HERE, 'turn-completion', 'locales', `${id}.js`)));
    } catch {
      /* R5: a broken pack must not stop the turn from ending */
    }
  }
  return packs;
}

/** Last assistant text block in a Claude Code JSONL transcript. */
export function lastAssistantText(transcriptPath) {
  let last = '';
  const lines = readFileSync(transcriptPath, 'utf8').split('\n');
  for (const line of lines) {
    if (!line.trim()) continue;
    let ev;
    try { ev = JSON.parse(line); } catch { continue; }
    const msg = ev && ev.message;
    if (!msg || msg.role !== 'assistant') continue;
    const c = msg.content;
    if (typeof c === 'string') { last = c; continue; }
    if (Array.isArray(c)) {
      const parts = c.filter((p) => p && p.type === 'text').map((p) => p.text || '');
      if (parts.some((p) => p.trim())) last = parts.join('\n');
    }
  }
  return last;
}

function readState(path) {
  try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return {}; }
}

function reason(packId, sentence) {
  return [
    'Your last message stated a next action, and then the turn ended without taking it.',
    '',
    `Detected by the ${packId} pack, in: "${sentence}"`,
    '',
    'UDS standard turn-completion-integrity (R1): a stated next action is not optional.',
    '',
    'Do one of these now:',
    '  (a) take the action you just said you would take;',
    '  (b) if it is actually blocked, say what blocks it and what you need, then do',
    '      the next item that is not blocked;',
    '  (c) if everything is done or blocked, list every remaining item WITH the',
    '      person or input it waits on. That itemized list is the only shape of',
    '      ending that R2 accepts — "the main parts are done" is not one.',
  ].join('\n');
}

async function main() {
  let raw = '';
  try {
    raw = readFileSync(0, 'utf8');
  } catch {
    return;
  }

  let data;
  try { data = JSON.parse(raw); } catch { return; }
  if (!data || typeof data !== 'object') return;
  if (data.stop_hook_active === true) return;

  const tp = data.transcript_path;
  if (!tp || !existsSync(tp)) return;   // cannot tell is not the same as should block

  const sid = String(data.session_id || 'unknown');
  const statePath = join(STATE_DIR, `${sid}.json`);
  const st = readState(statePath);
  const now = Date.now() / 1000;

  const stamps = (Array.isArray(st.stamps) ? st.stamps : [])
    .filter((t) => typeof t === 'number' && now - t < WINDOW_SEC);
  if (stamps.length >= MAX_BLOCKS_PER_WINDOW) return;
  if (now - (st.last || 0) < COOLDOWN_SEC) return;

  let text = '';
  try { text = lastAssistantText(tp); } catch { return; }
  if (!text.trim()) return;

  const packs = await loadPacks();
  if (packs.length === 0) return;

  const hit = detectCommitment(text, packs);
  if (!hit.fired) return;

  stamps.push(now);
  try {
    mkdirSync(STATE_DIR, { recursive: true });
    writeFileSync(statePath, JSON.stringify({ stamps, last: now }));
  } catch {
    /* state is an optimisation; failing to write it must not change the verdict */
  }

  process.stdout.write(JSON.stringify({
    decision: 'block',
    reason: reason(hit.packId, hit.sentence),
  }));
}

async function selfTest() {
  const packs = await loadPacks();
  let ok = true;
  console.log(`[turn-completion] v${VERSION} — packs: ${packs.map((p) => p.id).join(', ')}`);

  for (const pack of packs) {
    for (const [want, label, text] of pack.corpus) {
      // Run against ALL packs, which is the shipped configuration. A pack that
      // is correct alone and wrong beside another is not correct.
      const got = detectCommitment(text, packs).fired;
      const good = got === want;
      ok &&= good;
      console.log(`  ${good ? 'OK ' : 'x  '} [${pack.id}] ${want ? 'must block' : 'must pass'} — ${label}`
        + (good ? '' : `   (got: ${got ? 'block' : 'pass'})`));
    }
  }
  console.log(`[turn-completion] self-test ${ok ? 'passed' : 'FAILED'}`);
  process.exit(ok ? 0 : 1);
}

const arg = process.argv[2];
if (arg === '--self-test') {
  await selfTest();
} else if (arg === '--languages') {
  const packs = await loadPacks();
  console.log(packs.map((p) => `${p.id} (${p.label})`).join('\n'));
  console.log('\nThis check reads prose. If you work in a language not listed above,'
    + '\nit is installed and running but cannot fire. See turn-completion-integrity R8.');
} else {
  try { await main(); } catch { /* R5 */ }
}
