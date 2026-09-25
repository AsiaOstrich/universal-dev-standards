#!/usr/bin/env node
/**
 * UDS Hook: Turn Completion Integrity — Claude Code adapter
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
 * This file is one of several per-harness adapters (see also
 * check-turn-completion-codex.mjs, check-turn-completion-gemini.mjs). Judgement
 * — packs, cooldown, the rolling window, the self-echo marker — lives in
 * turn-completion/engine.mjs and is shared by all of them; this file's only job
 * is reading Claude Code's stdin/transcript shape and writing Claude Code's
 * output shape.
 *
 * Usage: node check-turn-completion.mjs  (reads stdin)
 *        node check-turn-completion.mjs --self-test
 *        node check-turn-completion.mjs --languages
 *
 * @see docs/specs/SPEC-HOOKS-001-core-standard-hooks.md
 * @see core/turn-completion-integrity.md
 */
import { readFileSync, existsSync } from 'node:fs';
import {
  VERSION, SHIPPED_LOCALES, SELF_ECHO, decide, loadPacks, isSelfEcho,
  runSelfTest, printLanguages,
} from './turn-completion/engine.mjs';

export { VERSION, SHIPPED_LOCALES, SELF_ECHO, loadPacks };

/** Plain text of a transcript message, or '' if it carries none. */
function textOf(msg) {
  const c = msg && msg.content;
  if (typeof c === 'string') return c;
  if (!Array.isArray(c)) return '';
  // Tool results also arrive with role "user"; only text blocks are prose.
  const parts = c.filter((p) => p && p.type === 'text').map((p) => p.text || '');
  return parts.some((p) => p.trim()) ? parts.join('\n') : '';
}

/**
 * Last assistant message and last human message in a Claude Code JSONL
 * transcript. The human's message is needed because a turn that ends by their
 * instruction looks, from the agent's words alone, exactly like one that ends
 * on an abandoned commitment.
 */
export function lastMessages(transcriptPath) {
  let assistant = '';
  let user = '';
  for (const line of readFileSync(transcriptPath, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    let ev;
    try { ev = JSON.parse(line); } catch { continue; }
    const msg = ev && ev.message;
    if (!msg) continue;
    const t = textOf(msg);
    if (!t) continue;
    if (msg.role === 'assistant') assistant = t;
    else if (msg.role === 'user' && !isSelfEcho(t)) user = t;
  }
  return { assistant, user };
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

  let msgs;
  try { msgs = lastMessages(tp); } catch { return; }

  const verdict = await decide({
    sessionId: data.session_id,
    assistantText: msgs.assistant,
    userText: msgs.user,
  });
  if (!verdict.fire) return;

  process.stdout.write(JSON.stringify({ decision: 'block', reason: verdict.reason }));
}

const arg = process.argv[2];
if (arg === '--self-test') {
  process.exit((await runSelfTest('turn-completion')) ? 0 : 1);
} else if (arg === '--languages') {
  await printLanguages();
} else {
  try { await main(); } catch { /* R5 */ }
}
