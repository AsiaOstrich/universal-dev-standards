#!/usr/bin/env node
/**
 * UDS Hook: Turn Completion Integrity — Codex adapter
 *
 * Runs at turn end. Blocks when the agent's final message states a first-person
 * commitment to a next action that the turn then ended without taking.
 *
 * Contract (Codex Stop hook — https://developers.openai.com/codex/hooks,
 * fetched 2026-09-25, cross-checked against the same content served at
 * https://learn.chatgpt.com/docs/hooks):
 *   config  — <repo>/.codex/hooks.json (or ~/.codex/hooks.json), a dedicated
 *             file, NOT config.toml's [hooks] table. Codex runs matching
 *             hooks from every location that defines them, so this adapter
 *             deliberately touches only hooks.json.
 *   stdin   — JSON with session_id, transcript_path (string|null), cwd,
 *             hook_event_name, turn_id, stop_hook_active, permission_mode,
 *             and last_assistant_message (string|null) — the agent's final
 *             text for this turn, given directly, no transcript parse needed.
 *   output  — "Stop expects JSON on stdout when it exits 0. Plain text output
 *             is invalid for this event." Block: {"decision":"block","reason":
 *             "..."}. Allow: any other JSON (this adapter always writes "{}"
 *             so stdout is valid JSON on every path, including R5 failures).
 *
 * R9 (exempt a human-directed stop) is best-effort here. Codex's Stop payload
 * gives the assistant's last message directly but not the human's; this
 * adapter reads transcript_path for it (rollout.jsonl), tolerantly. The real
 * record shape has been confirmed against a codex-cli 0.156.1 install
 * (2026-09-26; see extractMessage() below) — 6.13.0-beta.1 tried two guessed
 * shapes that never matched it, so R9 never actually exempted a Codex turn.
 * If the read still fails, or an unrecognized record type is seen, the user
 * side is treated as empty — which means R9 cannot exempt that turn, not
 * that the check goes silent (last_assistant_message still drives
 * detection). See core/turn-completion-integrity.md's Codex section.
 *
 * Judgement (packs, cooldown, rolling window, self-echo) lives in
 * turn-completion/engine.mjs and is shared with every other adapter; this
 * file only reads Codex's stdin shape and writes Codex's output shape.
 *
 * Usage: node check-turn-completion-codex.mjs  (reads stdin)
 *        node check-turn-completion-codex.mjs --self-test
 *        node check-turn-completion-codex.mjs --languages
 *
 * @see core/turn-completion-integrity.md
 */
import { readFileSync } from 'node:fs';
import { decide, isSelfEcho, runSelfTest, printLanguages } from './turn-completion/engine.mjs';

/**
 * A user-message record's `{ role, content }` payload, whichever of the
 * plausible JSONL shapes `ev` turns out to be.
 *
 * 🔴 2026-09-26: verified against a real codex-cli 0.156.1
 * `~/.codex/sessions/**\/*.jsonl` transcript. The actual shape is
 * `{"type":"response_item","payload":{"type":"message","role":"user",
 * "content":[{"type":"input_text","text":"…"}]}}` — the message lives under
 * `ev.payload`, not `ev.message` and not `ev` itself. The two fallback shapes
 * below were this file's original best-effort guesses (Claude-Code-style
 * nested `message`, and a flat record); neither matches what Codex actually
 * writes, so `bestEffortLastUserMessage` always returned '' and R9 (exempting
 * a human-directed stop) never fired on Codex. They stay as fallbacks in case
 * a different Codex version or record type uses one of them, but `ev.payload`
 * is tried first since it is the confirmed real shape.
 *
 * Other record types seen in a real rollout (`event_msg`, `token_usage_record`,
 * `session_meta`, `world_state`, and `response_item` payloads of type
 * `reasoning`/`custom_tool_call`/…) do not have `role: "user"` on the object
 * this function returns, so they fall through untouched. A `role: "developer"`
 * message is deliberately NOT treated as a user message — only
 * `payload.type === "message" && payload.role === "user"` counts.
 */
function extractMessage(ev) {
  if (ev && ev.payload && ev.payload.type === 'message') return ev.payload;
  if (ev && ev.message && typeof ev.message === 'object') return ev.message;
  return ev;
}

/**
 * Best-effort extraction of the human's last message from a Codex transcript.
 * Tolerant of several plausible JSONL shapes; any failure returns '', which
 * is the same as "cannot tell" (R5) — it does not stop last_assistant_message
 * from still being checked.
 */
function bestEffortLastUserMessage(transcriptPath) {
  if (typeof transcriptPath !== 'string' || !transcriptPath) return '';
  try {
    let user = '';
    for (const line of readFileSync(transcriptPath, 'utf8').split('\n')) {
      if (!line.trim()) continue;
      let ev;
      try { ev = JSON.parse(line); } catch { continue; }
      const msg = extractMessage(ev);
      if (!msg || msg.role !== 'user') continue;
      const c = msg.content;
      const text = typeof c === 'string'
        ? c
        : Array.isArray(c)
          ? c.filter((p) => p && (p.type === 'text' || p.type === 'input_text' || typeof p.text === 'string')).map((p) => p.text || '').join('\n')
          : '';
      if (text && text.trim() && !isSelfEcho(text)) user = text;
    }
    return user;
  } catch {
    return '';
  }
}

async function main() {
  let out = {};
  try {
    const raw = readFileSync(0, 'utf8');
    const data = JSON.parse(raw);
    if (data && typeof data === 'object' && data.stop_hook_active !== true) {
      const assistantText = typeof data.last_assistant_message === 'string' ? data.last_assistant_message : '';
      const userText = bestEffortLastUserMessage(data.transcript_path);
      const verdict = await decide({
        sessionId: data.session_id,
        assistantText,
        userText,
      });
      if (verdict.fire) out = { decision: 'block', reason: verdict.reason };
    }
  } catch {
    /* R5: fail open — stdout stays valid JSON, turn ends */
  }
  process.stdout.write(JSON.stringify(out));
}

const arg = process.argv[2];
if (arg === '--self-test') {
  process.exit((await runSelfTest('turn-completion-codex')) ? 0 : 1);
} else if (arg === '--languages') {
  await printLanguages();
} else {
  try {
    await main();
  } catch {
    // R5, belt and braces: main() already guards its own body, but a Codex
    // Stop hook must exit 0 with valid JSON on stdout no matter what, and an
    // uncaught throw here would instead crash with a non-zero exit and a
    // stack trace on stderr.
    process.stdout.write('{}');
  }
}
