#!/usr/bin/env node
/**
 * dump-cli-tree — print the command tree of the uds CLI as JSON, read from the commander program itself
 * (dev-platform XSPEC-471 R2). 把 uds 的指令樹從 commander 程式結構本身印成 JSON。
 *
 * Usage:  node scripts/beta-acceptance/dump-cli-tree.mjs [<cli directory>]      (default: ../../cli)
 *
 * How it reads the program, and why it cannot miss a command:
 *   `cli/bin/uds.js` builds the program and ends with `program.parse()`. This script loads that very file with
 *   `Command.prototype.parse` / `parseAsync` replaced by a function that only records the program it was called on.
 *   So the tree is the one the real binary builds, nothing is parsed from help text or source text, and the
 *   things `--help` leaves out (hidden commands, hidden options, aliases) are all present: commander keeps
 *   them in `command.commands` / `command.options` whether or not help prints them.
 *   If `parse` is never reached the script exits 2 ("could not measure"), never an empty tree.
 *
 * Needs `npm ci` in the cli directory (the binary imports its dependencies). It writes nothing and starts no
 * network request: the update check lives in a hook that only runs when a command runs.
 *
 * Output: { "name": "uds", "aliases": [], "hidden": false, "options": [ { "flags", "long", "short", "takesValue", "valueOptional", "hidden" } ], "commands": [ ...same shape ] }
 *
 * Exit 0 printed; 2 could not read the program.
 */

import { existsSync, realpathSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

function fail(message) {
  console.error(`[beta-acceptance] CANNOT MEASURE: ${message}`);
  process.exit(2);
}

const cliDir = realpathSync(resolve(process.argv[2] || join(HERE, '..', '..', 'cli')));
const bin = join(cliDir, 'bin', 'uds.js');
const commanderEntry = join(cliDir, 'node_modules', 'commander', 'index.js');
if (!existsSync(bin)) fail(`${bin} does not exist`);
if (!existsSync(commanderEntry)) fail(`${commanderEntry} does not exist; run "npm ci" in ${cliDir} first`);

const { Command } = await import(pathToFileURL(realpathSync(commanderEntry)).href);

let root = null;
const record = function record() {
  // the first program parse() is called on is the root; later calls (none today) are ignored
  if (!root) {
    let top = this;
    while (top.parent) top = top.parent;
    root = top;
  }
  return this;
};
Command.prototype.parse = record;
Command.prototype.parseAsync = async function recordAsync() { return record.call(this); };

try {
  await import(pathToFileURL(bin).href);
} catch (e) {
  fail(`loading ${bin} failed: ${e && e.message}`);
}
if (!root) fail(`${bin} finished without calling program.parse(): the command tree cannot be read from it`);

const describeOption = (o) => ({
  flags: o.flags,
  long: o.long || null,
  short: o.short || null,
  takesValue: Boolean(o.required || o.optional),
  valueOptional: Boolean(o.optional),
  hidden: Boolean(o.hidden),
});
const describe = (c) => ({
  name: c.name(),
  aliases: c.aliases(),
  hidden: Boolean(c._hidden),
  options: c.options.map(describeOption),
  commands: c.commands.map(describe),
});

// the binary may have left timers or handles behind: leave once the output has been flushed (a pipe can be slower than exit)
process.stdout.write(`${JSON.stringify(describe(root), null, 2)}\n`, () => process.exit(0));
