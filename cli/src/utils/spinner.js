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
  const base = typeof options === 'string' ? { text: options } : options;
  return ora({ stream: process.stdout, ...base, ...disabledWhenNoWidth(process.stdout) });
}

/**
 * ora's clear step divides the length of the line by the stream's width to know how many lines to erase. A terminal that
 * reports a width of 0 (a pty opened with no window size, which is what `expect` and some CI runners give a child) makes
 * that Infinity, and the spinner sat in the erase loop at full CPU, so the command never finished (XSPEC-482 R14f).
 * With no usable width there is nothing to animate: the spinner is switched off and prints its plain lines instead.
 * @param {{isTTY?: boolean, columns?: number}} stream
 * @returns {{isEnabled?: boolean}}
 */
export function disabledWhenNoWidth(stream) {
  return stream && stream.isTTY && !(stream.columns > 0) ? { isEnabled: false } : {}; // wire:spinner-off-without-width
}

export default createSpinner;
