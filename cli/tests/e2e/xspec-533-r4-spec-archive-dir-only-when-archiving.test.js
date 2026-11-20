/**
 * E2E: `uds spec create` and `uds spec split` do not leave an empty `specs/archive/` behind; the folder appears
 * when a spec is archived (dev-platform XSPEC-533 R4).
 *
 * Found on a real Windows machine (6.16.0-beta.2): a clean project that only created and split a micro-spec
 * ended up with an empty specs/archive/, because every MicroSpec method that touches the specs folder also made
 * the archive folder.
 *
 * Every test spawns the real CLI in a throwaway project that has no specs/ folder and reads back the folders and
 * files on disk (and the archive index, for the archiving step).
 *
 * Wires that make these red when cut (one line of CLI source each):
 *   cli/src/vibe/micro-spec.js   (ensureDirectories) the specs folder only: the archive folder is made in ensureArchiveDirectory()
 *   cli/src/vibe/micro-spec.js   this.ensureArchiveDirectory(); // wire:archive-dir-made-when-archiving
 */

import { it, expect, afterAll } from 'vitest';
import { readdirSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec533-r4');
afterAll(() => h.cleanup());

const specFiles = (dir) => readdirSync(join(dir, 'specs')).filter((f) => /^SPEC-\d+.*\.md$/.test(f)).sort();

/** Answers the two questions of `uds spec split`: toggle the first criterion, submit, then confirm. */
const splitAnswers = (screen) => {
  if (/Select ACs to move/.test(screen)) return ' \r';
  if (/Split SPEC-.*\?/.test(screen.replace(/\s+/g, ' '))) return 'y\r';
  return null;
};

it('uds spec create and uds spec split in a clean project leave specs/archive absent, and uds spec archive then makes it with the archived spec and its index (XSPEC-533 R4)', async () => {
  const dir = h.makeDir('clean');
  expect(existsSync(join(dir, 'specs'))).toBe(false); // control: it really starts clean

  // create
  const create = await h.runCli(['spec', 'create', 'Add a login page with email and password', '--yes'], dir);
  expect(create.code, create.stdout + create.stderr).toBe(0);
  const [id] = specFiles(dir).map((f) => f.replace(/\.md$/, ''));
  expect(id, create.stdout).toBeTruthy();
  expect(existsSync(join(dir, 'specs', 'archive'))).toBe(false);

  // The generated criteria carry no AC-n labels, and split moves labelled ones: the person edits the spec.
  const specPath = join(dir, 'specs', `${id}.md`);
  writeFileSync(specPath, readFileSync(specPath, 'utf-8').replace('**Confirmed**', '- [ ] AC-1: Login form validates the email\n- [ ] AC-2: Wrong password is refused\n\n**Confirmed**'));

  // split (real prompts, answered through the terminal)
  const split = await h.runCli(['spec', 'split', id], dir, { drive: splitAnswers, idleMs: 900 });
  expect(split.code, split.stdout + split.stderr).toBe(0);
  expect(specFiles(dir).length, split.stdout).toBe(2); // the split really happened: a second spec file exists
  expect(existsSync(join(dir, 'specs', 'archive'))).toBe(false);

  // list and confirm do not make it either
  const list = await h.runCli(['spec', 'list'], dir);
  expect(list.code, list.stdout + list.stderr).toBe(0);
  expect(existsSync(join(dir, 'specs', 'archive'))).toBe(false);

  // archive makes it, with the spec in it and an index that names it
  const archive = await h.runCli(['spec', 'archive', id], dir);
  expect(archive.code, archive.stdout + archive.stderr).toBe(0);
  expect(existsSync(join(dir, 'specs', 'archive', `${id}.md`))).toBe(true);
  const index = JSON.parse(readFileSync(join(dir, 'specs', 'archive', 'index.json'), 'utf-8'));
  expect(index.map((e) => e.id)).toEqual([id]);
  expect(specFiles(dir)).not.toContain(`${id}.md`);
}, 240000);

it('uds spec archive of a spec that does not exist does not make specs/archive (XSPEC-533 R4)', async () => {
  const dir = h.makeDir('none');
  mkdirSync(join(dir, 'specs'), { recursive: true });
  const run = await h.runCli(['spec', 'archive', 'SPEC-999-nothing'], dir);
  expect(existsSync(join(dir, 'specs', 'archive'))).toBe(false);
  expect(run.stdout + run.stderr).toMatch(/not found|Failed|Error/i);
}, 120000);
