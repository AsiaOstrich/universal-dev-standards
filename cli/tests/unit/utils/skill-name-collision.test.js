/**
 * skillCommandNames: which names a skill folder answers to (dev-platform XSPEC-465 R1). Helper-level cases the
 * end-to-end tests do not need to spell out; the behavior from the CLI entry is in
 * tests/e2e/xspec-465-r1-*.test.js.
 */

import { it, expect, afterAll } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, realpathSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { skillCommandNames } from '../../../src/utils/skill-name-collision.js';

const root = realpathSync(mkdtempSync(join(tmpdir(), 'uds-skillnames-')));
afterAll(() => rmSync(root, { recursive: true, force: true }));

function skill(folder, text) {
  const dir = join(root, folder);
  mkdirSync(dir, { recursive: true });
  if (text !== undefined) writeFileSync(join(dir, 'SKILL.md'), text);
  return dir;
}

it('skillCommandNames gives the folder name and the frontmatter name, once each (XSPEC-465 R1)', () => {
  expect(skillCommandNames(skill('commit-standards', '---\nname: commit\n---\n# x\n'))).toEqual(['commit-standards', 'commit']);
  expect(skillCommandNames(skill('plan', '---\nname: plan\n---\n# x\n'))).toEqual(['plan']);
  expect(skillCommandNames(skill('quoted', '---\nname: "short"\n---\n'))).toEqual(['quoted', 'short']);
});

it('skillCommandNames reads a file with a byte order mark and Windows line endings (XSPEC-465 R1)', () => {
  expect(skillCommandNames(skill('bom', '﻿---\r\nname: tidy\r\ndescription: x\r\n---\r\n# x\r\n'))).toEqual(['bom', 'tidy']);
});

it('skillCommandNames falls back to the folder name without frontmatter or without a name, and gives null for what it cannot read (XSPEC-465 R1)', () => {
  expect(skillCommandNames(skill('nofm', '# just text\n'))).toEqual(['nofm']);
  expect(skillCommandNames(skill('noname', '---\ndescription: x\n---\n'))).toEqual(['noname']);
  expect(skillCommandNames(skill('numname', '---\nname: 42\n---\n'))).toEqual(['numname']);
  expect(skillCommandNames(skill('nofile'))).toBeNull();
  expect(skillCommandNames(skill('badyaml', '---\nname: [unclosed\n---\n'))).toBeNull();
  expect(skillCommandNames(join(root, 'does-not-exist'))).toBeNull();
});
