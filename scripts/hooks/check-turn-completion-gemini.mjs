#!/usr/bin/env node
/**
 * UDS Hook: Turn Completion Integrity — Gemini CLI adapter
 *
 * Runs once per turn, after the model's final response. Blocks when that
 * response states a first-person commitment to a next action that the turn
 * then ended without taking.
 *
 * Contract (Gemini CLI AfterAgent hook — https://geminicli.com/docs/hooks/reference/
 * and https://geminicli.com/docs/hooks/, fetched 2026-09-25):
 *   config  — .gemini/settings.json (project) / ~/.gemini/settings.json
 *             (user) / /etc/gemini-cli/settings.json (system), under a
 *             "hooks" key shared with the rest of Gemini CLI's settings.
 *             Project settings take precedence over user, which take
 *             precedence over system. AfterAgent does not use matchers
 *             (matchers apply only to Tool hooks).
 *   stdin   — JSON with session_id, transcript_path, cwd, hook_event_name,
 *             timestamp, prompt, prompt_response, stop_hook_active.
 *             `prompt` is the human message that started THIS turn and
 *             `prompt_response` is the agent's final text for it — both given
 *             directly, so R9 (exempt a human-directed stop) needs no
 *             transcript parsing here, unlike the Codex adapter.
 *   output  — exit codes are shared across every Gemini CLI hook type: "0:
 *             stdout is parsed as JSON. Preferred for all logic. 2: System
 *             Block, stderr is the rejection reason." AfterAgent's own JSON
 *             shape: {"decision":"deny","reason":"..."} rejects the response
 *             and forces a retry, with reason "sent to the agent as a new
 *             prompt". This adapter uses the preferred exit-0 + JSON path,
 *             not exit code 2, and always writes valid JSON on stdout
 *             (including on every R5 failure path) so exit 0 is never
 *             ambiguous with "nothing to say".
 *
 * Judgement (packs, cooldown, rolling window, self-echo) lives in
 * turn-completion/engine.mjs and is shared with every other adapter; this
 * file only reads Gemini CLI's stdin shape and writes Gemini CLI's output
 * shape.
 *
 * Usage: node check-turn-completion-gemini.mjs  (reads stdin)
 *        node check-turn-completion-gemini.mjs --self-test
 *        node check-turn-completion-gemini.mjs --languages
 *
 * @see core/turn-completion-integrity.md
 */
import { readFileSync } from 'node:fs';
import { decide, runSelfTest, printLanguages } from './turn-completion/engine.mjs';

async function main() {
  let out = {};
  try {
    const raw = readFileSync(0, 'utf8');
    const data = JSON.parse(raw);
    if (data && typeof data === 'object' && data.stop_hook_active !== true) {
      const assistantText = typeof data.prompt_response === 'string' ? data.prompt_response : '';
      const userText = typeof data.prompt === 'string' ? data.prompt : '';
      const verdict = await decide({
        sessionId: data.session_id,
        assistantText,
        userText,
      });
      if (verdict.fire) out = { decision: 'deny', reason: verdict.reason };
    }
  } catch {
    /* R5: fail open — stdout stays valid JSON, turn ends */
  }
  process.stdout.write(JSON.stringify(out));
}

const arg = process.argv[2];
if (arg === '--self-test') {
  process.exit((await runSelfTest('turn-completion-gemini')) ? 0 : 1);
} else if (arg === '--languages') {
  await printLanguages();
} else {
  try {
    await main();
  } catch {
    // R5, belt and braces — see check-turn-completion-codex.mjs for why this
    // outer guard exists alongside main()'s own.
    process.stdout.write('{}');
  }
}
