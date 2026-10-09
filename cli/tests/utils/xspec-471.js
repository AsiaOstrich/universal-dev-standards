/**
 * Shared pieces for the XSPEC-471 end-to-end tests (every command and option has an acceptance step; every step reads back an effect).
 *
 * - `makeFakeCli(dir)`: a small CLI built with the real commander (linked to this repository's cli/node_modules) that has what the
 *   real one has and a test needs to vary: a subcommand with options, an alias, a short flag, a hidden command, a hidden option.
 *   `check-cli-coverage.mjs --cli <dir>` reads it through the same dump program it uses on the real CLI.
 * - `FAKE_ITEMS`: every command and option of that CLI by name, written out by hand (not derived from the CLI).
 * - `stepRunning(id, args, expect)`: a step that runs the installed uds with those arguments.
 */

import { mkdirSync, symlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { REPO } from './xspec-469.js';

const FAKE_SOURCE = `
import { Option, program } from 'commander';
program.name('uds').version('1.0.0').option('--ui-lang <lang>', 'language');
program.command('foo').description('foo').option('--bar', 'bar').option('-b, --baz <v>', 'baz').action(() => {});
program.command('list').alias('ls').description('list').option('--all', 'all').action(() => {});
program.command('secret', { hidden: true }).description('hidden command').option('--quiet', 'quiet').action(() => {});
const grp = program.command('grp').description('group');
grp.command('sub').description('sub').option('--deep', 'deep').addOption(new Option('--hid', 'hidden option').hideHelp()).action(() => {});
program.parse();
`;

/** Every item of that CLI, by name: the commands, then the options (the names check-cli-coverage.mjs reports). */
export const FAKE_ITEMS = {
  commands: ['foo', 'list', 'secret', 'grp', 'grp sub'],
  options: ['uds --version', 'uds --ui-lang', 'foo --bar', 'foo --baz', 'list --all', 'secret --quiet', 'grp sub --deep', 'grp sub --hid'],
};

/** Lay the fake CLI out as `<dir>/bin/uds.js` with the real commander linked in as `<dir>/node_modules`. Returns dir. */
export function makeFakeCli(dir) {
  mkdirSync(join(dir, 'bin'), { recursive: true });
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'fake-uds', type: 'module' }));
  writeFileSync(join(dir, 'bin', 'uds.js'), FAKE_SOURCE);
  symlinkSync(join(REPO, 'cli', 'node_modules'), join(dir, 'node_modules'), 'junction');
  return dir;
}

/** A step that runs the installed uds with `args` and reads back `contains` (the effect a step must have). */
export const stepRunning = (id, args, expect = { contains: ['ok'] }) => ({ id, title: `step ${id}`, uds: args, expect });
