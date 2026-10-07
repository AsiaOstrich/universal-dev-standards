/**
 * `uds open-work` — the open-work-tracking reference checks (OWT-017 … OWT-028)
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
import { readOpenWorkDeclarations, rootArguments, wordArguments, commandArguments } from '../core/open-work-config.js';

/** Append `--name value` when the option was given. */
function withOption(argv, name, value) {
  if (value !== undefined && value !== null) argv.push(name, String(value));
  return argv;
}

function run(argv) {
  process.exitCode = main(argv);
}

/**
 * What uds.project.yaml declares for open-work, or null after saying why the command stops.
 * A file that cannot be read at all is a note and the command goes on without it (a project's
 * unrelated YAML problem must not stop a check that never needed the file); a readable file whose
 * open_work section is wrong stops it, because the check would otherwise run without what the
 * project meant to declare and look cleaner than it is.
 */
function declarationsOrStop() {
  const declared = readOpenWorkDeclarations(process.cwd()); // wire:declarations
  if (declared.note) console.error(`[owt] NOTE: ${declared.note}`);
  if (declared.error) {
    console.error(`[owt] CANNOT DECIDE: ${declared.error}. Exit 2 is not a pass.`);
    process.exitCode = 2;
    return null;
  }
  return declared;
}

/**
 * uds open-work next-action [files...] [--root DIR] [--id-pattern RE] [--next-action-word WORD ...] [--command-word WORD ...] [--now DATE] [--stale-after DAYS] — OWT-019
 * `--now` and `--stale-after` are what the fourth outcome (an asked-awaiting row, XSPEC-464) needs to show an age and to mark it old.
 */
export function openWorkNextActionCommand(files = [], options = {}) {
  const declared = declarationsOrStop();
  if (!declared) return;
  const argv = ['next-action'];
  withOption(argv, '--root', options.root);
  withOption(argv, '--id-pattern', options.idPattern);
  withOption(argv, '--now', options.now);
  withOption(argv, '--stale-after', options.staleAfter);
  const wordArgv = wordArguments(options.nextActionWord, declared.nextActionWords); // wire:next-action-words
  const commandArgv = commandArguments(options.commandWord, declared.commandWords); // wire:next-action-command-words
  process.exitCode = main([...argv, ...wordArgv, ...commandArgv, ...files]); // wire:next-action
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

/** uds open-work separation [files...] [--next-action-word WORD ...] — OWT-017 */
export function openWorkSeparationCommand(files = [], options = {}) {
  const declared = declarationsOrStop();
  if (!declared) return;
  const wordArgv = wordArguments(options.nextActionWord, declared.nextActionWords); // wire:separation-words
  process.exitCode = main(['separation', ...wordArgv, ...files]); // wire:separation
}

/**
 * uds open-work waiting [files...] [--root DIR] [--root NAME=DIR ...] [--id-pattern RE] [--now DATE] — OWT-020 to OWT-022, OWT-027/028.
 * Calls the imported `main` itself rather than the shared `run()`: the line that carries this
 * command into the checker is then its own, and cutting it silences exactly this command.
 * `--root` repeats: a plain DIR is what relative paths resolve against (as before), NAME=DIR says where
 * another project lives (and uds.project.yaml's open_work.projects says the same, without typing it).
 */
export function openWorkWaitingCommand(files = [], options = {}) {
  const declared = declarationsOrStop();
  if (!declared) return;
  const argv = ['waiting'];
  const rootArgv = rootArguments(options.root, declared.projects); // wire:roots
  argv.push(...rootArgv);
  withOption(argv, '--id-pattern', options.idPattern);
  withOption(argv, '--now', options.now);
  const commandArgv = commandArguments(options.commandWord, declared.commandWords); // wire:waiting-command-words
  argv.push(...commandArgv);
  process.exitCode = main([...argv, ...files]); // wire:waiting
}

/** uds open-work observations [files...] [--now DATE] [--stale-after DAYS] — OWT-023/024/025/026 (same reason as above) */
export function openWorkObservationsCommand(files = [], options = {}) {
  const argv = ['observations'];
  withOption(argv, '--now', options.now);
  withOption(argv, '--stale-after', options.staleAfter);
  process.exitCode = main([...argv, ...files]); // wire:observations
}

/** uds open-work self-test — run the checker's own arms and nothing else */
export function openWorkSelfTestCommand() {
  run(['--self-test']);
}
