import ora from 'ora';

/**
 * A spinner that reports on stdout.
 *
 * ora defaults to stderr. For a spinner that redraws over itself while a pipe
 * consumes stdout, that default is right. It is wrong for this CLI: these lines
 * are progress reporting for a human, they sit between lines the CLI already
 * prints on stdout, and in a non-TTY ora emits each one exactly once, so there
 * is nothing to redraw and nothing to isolate.
 *
 * On Windows PowerShell 5.1 the default is worse than untidy. Any stderr output
 * from a native command is wrapped in a `NativeCommandError`, so a successful
 * `uds update` surfaced as an error — including the line that said it had
 * succeeded. Measured on a clean run before this change: 9 lines on stdout, 2 on
 * stderr, both of them the spinner, one of them `✔ 已重新產生 2 個整合檔案`.
 *
 * A caller that genuinely wants stderr can still ask for it; the default is the
 * only thing that changes.
 *
 * @param {string|Object} options - Spinner text, or an ora options object
 * @returns {import('ora').Ora}
 */
export function createSpinner(options) {
  if (typeof options === 'string') {
    return ora({ text: options, stream: process.stdout });
  }
  return ora({ stream: process.stdout, ...options });
}

export default createSpinner;
