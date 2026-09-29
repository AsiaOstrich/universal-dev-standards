/**
 * `uds open-work` — the open-work-tracking reference checks (OWT-017 / 018 / 019)
 * as a command, so an adopter can run them from the npm package.
 *
 * This file holds no rules. The one body of them is
 * `../utils/open-work-tracking.mjs`; this only turns commander's parsed
 * arguments back into the argv that module's `main()` reads, so the command and
 * `node scripts/check-open-work-tracking.mjs` cannot disagree.
 *
 * Exit codes are the module's and are not translated: 0 no violation, 1
 * violation, 2 cannot decide (no structure found, git failed, or the checker's
 * own self-test arms failed). 2 is NOT a pass. `process.exitCode` is set rather
 * than calling `process.exit()`, so commander's post-action hook still runs.
 *
 * It is a reference decision procedure offered as evidence (OWT-015), not a
 * gate, and its coverage is unknown and uncalibrated (OWT-011, OWT-016); the
 * module prints both statements on every run.
 *
 * @module commands/open-work
 */

import { main } from '../utils/open-work-tracking.mjs';

/** Append `--name value` when the option was given. */
function withOption(argv, name, value) {
  if (value !== undefined && value !== null) argv.push(name, String(value));
  return argv;
}

function run(argv) {
  process.exitCode = main(argv);
}

/** uds open-work next-action [files...] [--root DIR] [--id-pattern RE] — OWT-019 */
export function openWorkNextActionCommand(files = [], options = {}) {
  const argv = ['next-action'];
  withOption(argv, '--root', options.root);
  withOption(argv, '--id-pattern', options.idPattern);
  run([...argv, ...files]);
}

/** uds open-work revision (--file PATH --base REV | --before FILE --after FILE) — OWT-018 */
export function openWorkRevisionCommand(options = {}) {
  const argv = ['revision'];
  withOption(argv, '--file', options.file);
  withOption(argv, '--base', options.base);
  withOption(argv, '--before', options.before);
  withOption(argv, '--after', options.after);
  run(argv);
}

/** uds open-work separation [files...] — OWT-017 */
export function openWorkSeparationCommand(files = []) {
  run(['separation', ...files]);
}

/** uds open-work self-test — run the checker's own arms and nothing else */
export function openWorkSelfTestCommand() {
  run(['--self-test']);
}
