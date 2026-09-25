/**
 * Shared decision engine for the turn-completion-integrity check.
 *
 * Every harness adapter (Claude Code, Codex, Gemini CLI, ...) reduces its own
 * stdin contract down to { sessionId, assistantText, userText } and hands it
 * to decide() here. This file owns judgement — pack loading, cooldown, the
 * rolling-window cap, the self-echo marker — so that three (or more) copies
 * of that logic cannot drift out of sync with each other. An adapter's only
 * remaining job is reading its tool's input and writing its tool's output
 * shape for a block; neither of those touches this file.
 *
 * @see core/turn-completion-integrity.md
 */
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectCommitment, userAskedToStop } from './detect.mjs';

export const VERSION = '1.2.0';

const COOLDOWN_SEC = 120;
// A cap counted per session with no reset is an off switch on a delay: it
// disarms silently in exactly the long session where the rule matters most.
// A rolling window bounds runaway loops just as well and recovers by itself.
const MAX_BLOCKS_PER_WINDOW = 6;
const WINDOW_SEC = 3600;

// Overridable so tests (and anything else that must not touch the
// developer's real state) can point this at a throwaway directory instead of
// mocking fs. Read once per call, not once at import time, so a test can set
// it per-case without re-importing the module.
function stateDir() {
  return process.env.UDS_TURN_COMPLETION_STATE_DIR || join(homedir(), '.uds', 'turn-completion');
}

const HERE = dirname(fileURLToPath(import.meta.url));

/** Locales this hook ships. The self-test fails if any of them will not load. */
export const SHIPPED_LOCALES = ['en', 'zh-TW'];

/**
 * Load every shipped locale pack.
 *
 * At runtime a pack that fails to load is skipped (R5: a broken pack must not
 * stop the turn from ending). 🔴 But that swallow is also how a shipping
 * mistake hides: with zero packs loaded the hook runs, exits 0, and can never
 * fire — the same shape as good behaviour. So `failed` is returned rather than
 * discarded, and the self-test treats a non-empty `failed` as a failure.
 */
export async function loadPacks() {
  const packs = [];
  const failed = [];
  for (const id of SHIPPED_LOCALES) {
    try {
      packs.push(await import(join(HERE, 'locales', `${id}.mjs`)));
    } catch (e) {
      failed.push({ id, why: String((e && e.message) || e) });
    }
  }
  return { packs, failed };
}

/**
 * 🔴 This hook's own block message can re-enter a transcript as a human turn
 * (measured on Claude Code — the block reason is written back as the next
 * "user" message). On the next run it would therefore be read as "the human's
 * last message", hiding the real one ("pause, I'm going home") and silently
 * voiding the R9 exemption. Every adapter that reads a transcript for the
 * human's last message MUST strip a message containing this marker before
 * treating it as the human's words; stripSelfEcho() below does that.
 */
export const SELF_ECHO = 'UDS standard turn-completion-integrity (R1)';

/** True if this text is (or contains) the hook's own prior block message. */
export function isSelfEcho(text) {
  return typeof text === 'string' && text.includes(SELF_ECHO);
}

function readState(path) {
  try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return {}; }
}

export function reason(packId, sentence) {
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

/**
 * Decide whether this turn should block, and own the per-session cooldown and
 * rolling-window state shared by every adapter.
 *
 * @param {object} input
 * @param {string} input.sessionId
 * @param {string} input.assistantText - the agent's final message for this turn
 * @param {string} input.userText - the human's most recent message. The
 *   caller is responsible for excluding this hook's own SELF_ECHO from it
 *   where that tool's transcript can carry it (see isSelfEcho/stripSelfEcho).
 * @returns {Promise<{ fire: boolean, reason?: string, packId?: string, sentence?: string }>}
 */
export async function decide({ sessionId, assistantText, userText }) {
  if (!assistantText || !assistantText.trim()) return { fire: false };

  const statePath = join(stateDir(), `${String(sessionId || 'unknown')}.json`);
  const st = readState(statePath);
  const now = Date.now() / 1000;

  const stamps = (Array.isArray(st.stamps) ? st.stamps : [])
    .filter((t) => typeof t === 'number' && now - t < WINDOW_SEC);
  if (stamps.length >= MAX_BLOCKS_PER_WINDOW) return { fire: false };
  if (now - (st.last || 0) < COOLDOWN_SEC) return { fire: false };

  const { packs } = await loadPacks();
  if (packs.length === 0) return { fire: false };

  // The human asked for the turn to end. That is a legitimate ending, and the
  // agent's own words cannot distinguish it from an abandoned commitment.
  if (userAskedToStop(userText, packs)) return { fire: false };

  const hit = detectCommitment(assistantText, packs);
  if (!hit.fired) return { fire: false };

  stamps.push(now);
  try {
    mkdirSync(stateDir(), { recursive: true });
    writeFileSync(statePath, JSON.stringify({ stamps, last: now }));
  } catch {
    /* state is an optimisation; failing to write it must not change the verdict */
  }

  return { fire: true, reason: reason(hit.packId, hit.sentence), packId: hit.packId, sentence: hit.sentence };
}

/**
 * Run every locale pack's corpus and print the result. Shared by every
 * adapter's `--self-test` so the corpus can only be correct or wrong once,
 * not once per tool.
 *
 * @param {string} label - printed in the header, e.g. "turn-completion-codex"
 * @returns {Promise<boolean>} true if every corpus case and the self-echo
 *   marker check passed
 */
export async function runSelfTest(label = 'turn-completion') {
  const { packs, failed } = await loadPacks();
  let ok = failed.length === 0 && packs.length === SHIPPED_LOCALES.length;
  console.log(`[${label}] v${VERSION} — packs: ${packs.map((p) => p.id).join(', ')}`
    + ` (${packs.length}/${SHIPPED_LOCALES.length} shipped locales)`);
  for (const f of failed) console.log(`  x   locale ${f.id} failed to load — ${f.why}`);

  for (const pack of packs) {
    for (const [want, caseLabel, text] of pack.corpus) {
      // Run against ALL packs, which is the shipped configuration. A pack that
      // is correct alone and wrong beside another is not correct.
      const got = detectCommitment(text, packs).fired;
      const good = got === want;
      ok &&= good;
      console.log(`  ${good ? 'OK ' : 'x  '} [${pack.id}] ${want ? 'must block' : 'must pass'} — ${caseLabel}`
        + (good ? '' : `   (got: ${got ? 'block' : 'pass'})`));
    }
    for (const [want, caseLabel, text] of pack.stopCorpus || []) {
      const got = userAskedToStop(text, packs);
      const good = got === want;
      ok &&= good;
      console.log(`  ${good ? 'OK ' : 'x  '} [${pack.id}] user ${want ? 'IS' : 'is NOT'} asking to stop — ${caseLabel}`
        + (good ? '' : `   (got: ${got ? 'exempt' : 'not exempt'})`));
    }
  }
  // The block message must contain the marker, or a transcript-reading adapter
  // cannot tell its own output from the human's next instruction.
  const selfRecognised = reason('en', 'x').includes(SELF_ECHO);
  ok &&= selfRecognised;
  console.log(`  ${selfRecognised ? 'OK ' : 'x  '} block message carries the self-echo marker`);

  console.log(`[${label}] self-test ${ok ? 'passed' : 'FAILED'}`);
  return ok;
}

/**
 * Print the languages this hook ships, and the R8 disclosure. Shared by every
 * adapter's `--languages` so the installer's probeLanguageLimits() gets the
 * same answer regardless of which tool's script it runs.
 */
export async function printLanguages() {
  const { packs } = await loadPacks();
  console.log(packs.map((p) => `${p.id} (${p.label})`).join('\n'));
  console.log('\nThis check reads prose. If you work in a language not listed above,'
    + '\nit is installed and running but cannot fire. See turn-completion-integrity R8.');
}

/** True if the given path exists — re-exported so adapters don't add their own fs import just for this. */
export function pathExists(p) {
  return !!p && existsSync(p);
}
