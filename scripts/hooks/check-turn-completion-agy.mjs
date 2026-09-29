#!/usr/bin/env node
/**
 * UDS Hook: Turn Completion Integrity — Antigravity CLI (agy) adapter
 *
 * Runs when the agent is about to stop. Blocks when the agent's final message
 * states a first-person commitment to a next action that the turn then ended
 * without taking.
 *
 * Contract (Antigravity CLI Stop hook — https://antigravity.google/docs/hooks/,
 * fetched 2026-09-29, and OBSERVED against a real session the same day: agy
 * 1.2.12 on PC15, `agy -p`, evidence kept in dev-platform
 * cross-project/ops/evidence/agy-stop-hook-2026-09-29/):
 *   config  — <repo>/.agents/hooks.json (or ~/.gemini/config/hooks.json). The
 *             file maps a hook NAME to its events:
 *               {"<name>": {"Stop": [{"type":"command","command":"...","timeout":N}]}}
 *             There is no `hooks` wrapper key and no `hooks[]` nesting around the
 *             handler, unlike Claude Code / Codex. `timeout` is in seconds.
 *   stdin   — JSON with artifactDirectoryPath, conversationId, error,
 *             executionNum (from 0), fullyIdle, modelName, terminationReason,
 *             transcriptPath, workspacePaths. 🔴 It carries NEITHER the final
 *             message NOR the human's message: both come from the transcript.
 *   transcript — JSONL, one record per line with source / type / content:
 *             the human's message   = source USER_EXPLICIT, type USER_INPUT,
 *                                     content wrapped in <USER_REQUEST>…</USER_REQUEST>
 *                                     and followed by <ADDITIONAL_METADATA> etc.
 *             the model's reply     = source MODEL, type PLANNER_RESPONSE
 *             a `continue` reason   = source SYSTEM, type SYSTEM_MESSAGE
 *   output  — {"decision":"continue","reason":"..."} restarts the loop (the
 *             reason reaches the model); anything else lets it stop. This
 *             adapter writes "{}" on every allow path so stdout is always
 *             valid JSON.
 *
 * 🔴 The human's last message is taken from USER_EXPLICIT/USER_INPUT ONLY.
 * This hook's own `continue` reason is written back into the transcript as a
 * SYSTEM_MESSAGE; reading "any non-MODEL record" as the human would take the
 * hook's own text for the human's words (R11, same family as the Claude Code
 * block-message echo). Filtering by `source` is the guard; the SELF_ECHO check
 * below is a second, weaker one.
 *
 * 🔴 agy runs the hook with the working directory set to `.agents/`, not the
 * project root (measured 2026-09-29, agy 1.2.12), and silently lets a hook that
 * fails to start through — hence the installed command `node ../scripts/hooks/...`.
 * Nothing here or in the engine reads process.cwd(): packs load relative to the
 * module, state lives under ~/.uds (or UDS_TURN_COMPLETION_STATE_DIR), and the
 * transcript path from stdin is absolute. Tests run the adapter from `.agents/`.
 *
 * At the moment the hook runs, the transcript ALREADY holds the model's final
 * reply (observed, single turn, no tool calls). This is the opposite of Claude
 * Code, where it does not (see check-turn-completion.mjs). Not verified: multi-
 * turn, turns with tool calls, fullyIdle:false, a non-empty `error`, interactive
 * mode. If the final reply is not yet in the transcript in one of those cases,
 * this adapter would judge the previous reply — see the standard's Supported
 * harnesses section.
 *
 * No `executionNum > 0` loop guard is used (unlike stop_hook_active on the
 * other adapters): whether executionNum resets between turns in a long
 * interactive session is unverified, and a guard that never resets is a delayed
 * off switch. The engine's cooldown and rolling window (R6) bound the loop.
 *
 * Judgement (packs, cooldown, rolling window, self-echo) lives in
 * turn-completion/engine.mjs and is shared with every other adapter.
 *
 * Usage: node check-turn-completion-agy.mjs  (reads stdin)
 *        node check-turn-completion-agy.mjs --self-test
 *        node check-turn-completion-agy.mjs --languages
 *
 * @see core/turn-completion-integrity.md
 */
import { readFileSync } from 'node:fs';
import { decide, isSelfEcho, runSelfTest, printLanguages } from './turn-completion/engine.mjs';

/**
 * The human's words inside a USER_INPUT record: the text between
 * <USER_REQUEST> and </USER_REQUEST>. Everything after the closing tag
 * (<ADDITIONAL_METADATA>, <USER_SETTINGS_CHANGE>, ...) is system-added and is
 * dropped. A record with no tag is taken whole (defensive: a different agy
 * version may not wrap it).
 */
export function unwrapUserRequest(content) {
  if (typeof content !== 'string') return '';
  const m = content.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);
  if (m) return m[1].trim();
  const open = content.indexOf('<USER_REQUEST>');
  if (open !== -1) {
    // opening tag without a close: take what follows, up to the next system block
    const rest = content.slice(open + '<USER_REQUEST>'.length);
    const next = rest.search(/<(ADDITIONAL_METADATA|USER_SETTINGS_CHANGE|SYSTEM_MESSAGE)>/);
    return (next === -1 ? rest : rest.slice(0, next)).trim();
  }
  return content.trim();
}

/**
 * Last model reply and last human message in an agy transcript_full.jsonl.
 * Unparseable lines are skipped; a read failure throws to the caller.
 */
export function lastMessages(transcriptPath) {
  let assistant = '';
  let user = '';
  for (const line of readFileSync(transcriptPath, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    let ev;
    try { ev = JSON.parse(line); } catch { continue; }
    if (!ev || typeof ev.content !== 'string') continue;
    if (ev.source === 'MODEL' && ev.type === 'PLANNER_RESPONSE') {
      if (ev.content.trim()) assistant = ev.content;
    } else if (ev.source === 'USER_EXPLICIT' && ev.type === 'USER_INPUT') {
      const text = unwrapUserRequest(ev.content);
      if (text && !isSelfEcho(text)) user = text;
    }
  }
  return { assistant, user };
}

async function main() {
  let out = {};
  try {
    const raw = readFileSync(0, 'utf8');
    const data = JSON.parse(raw);
    if (data && typeof data === 'object' && typeof data.transcriptPath === 'string' && data.transcriptPath) {
      const { assistant, user } = lastMessages(data.transcriptPath);
      const verdict = await decide({
        sessionId: data.conversationId,
        assistantText: assistant,
        userText: user,
      });
      if (verdict.fire) out = { decision: 'continue', reason: verdict.reason };
    }
  } catch {
    /* R5: fail open — stdout stays valid JSON, the agent stops */
  }
  process.stdout.write(JSON.stringify(out));
}

const arg = process.argv[2];
if (arg === '--self-test') {
  process.exit((await runSelfTest('turn-completion-agy')) ? 0 : 1);
} else if (arg === '--languages') {
  await printLanguages();
} else {
  try {
    await main();
  } catch {
    // R5, belt and braces — see check-turn-completion-codex.mjs.
    process.stdout.write('{}');
  }
}
