/**
 * Did a prompt end because nothing could answer it?
 * // implements XSPEC-471 R4 (the interactive commands found without an acceptance step)
 *
 * `@inquirer/prompts` rejects with `ExitPromptError` when stdin is not a terminal and ends (CI, a pipe, a process
 * started by another program) and when the person presses Ctrl+C. A command that does not catch it prints a Node
 * stack trace, and the process still ends with exit code 0: a run that did nothing looks like a success.
 * `uds update` and `uds uninstall` catch it for themselves; this is the same test for the other commands.
 *
 * Detect by what the prompt did, not by probing `process.stdin.isTTY`: isTTY is a proxy for "somebody can answer",
 * and a wrapped or mocked stdin answers fine with isTTY unset.
 *
 * @param {unknown} err
 * @returns {boolean}
 */
export function isPromptClosed(err) {
  return err?.name === 'ExitPromptError' || /force closed the prompt/i.test(err?.message || '');
}
