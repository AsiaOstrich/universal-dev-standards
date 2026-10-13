/**
 * The commit hook reads its allowed types from the installed option files, as `uds simulate` does (XSPEC-482 R12).
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { allowedTypes, validateCommitMessage } from '../../../../scripts/hooks/validate-commit-msg.mjs';
import { allowedCommitTypes, FALLBACK_TYPES } from '../../../src/utils/commit-message-judge.js';

let root;
beforeEach(() => { root = mkdtempSync(join(tmpdir(), 'uds-test-hook-types-')); });
afterEach(() => rmSync(root, { recursive: true, force: true }));

const optionFile = (name, parent, types, dir = join(root, '.standards', 'options')) => {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${name}.ai.yaml`), [`id: ${name}`, 'meta:', `  parent: ${parent}`, '  version: "1.0.0"', '', 'types:', ...types.map((t) => `  - type: ${t}\n    description: x`), '', 'other:', '  - type: not-a-commit-type', ''].join('\n'));
};

describe('allowedTypes', () => {
  it('without option files: the Conventional Commits set that uds simulate falls back to', () => {
    expect(allowedTypes(root)).toEqual(FALLBACK_TYPES);
  });

  it('reads the types of a commit-message option file, flat or nested, and unions several files', () => {
    optionFile('english', 'commit-message', ['feat', 'security']);
    optionFile('team', 'commit-message', ['ship'], join(root, '.standards', 'options', 'commit-message'));
    expect(allowedTypes(root).sort()).toEqual(['feat', 'security', 'ship']);
  });

  it('ignores an option file of another standard and a "- type:" line outside the types: block', () => {
    optionFile('english', 'commit-message', ['feat']);
    optionFile('flow', 'git-workflow', ['hotfix']);
    expect(allowedTypes(root)).toEqual(['feat']);
  });

  it('is the same set uds simulate reads from the same folder', () => {
    optionFile('english', 'commit-message', ['feat', 'fix', 'security']);
    expect(allowedTypes(root).sort()).toEqual(allowedCommitTypes(join(root, '.standards')).types.sort());
  });
});

describe('validateCommitMessage with the project types', () => {
  it('accepts security(...) when the option file lists it and refuses it when it does not', () => {
    expect(validateCommitMessage('security(auth): rotate keys', ['feat', 'security'])).toBe(true);
    expect(validateCommitMessage('security(auth): rotate keys', ['feat'])).toBe(false);
  });

  it('accepts the breaking-change mark and a non-ASCII type, and refuses a type that merely starts like an allowed one', () => {
    expect(validateCommitMessage('feat!: drop it', ['feat'])).toBe(true);
    expect(validateCommitMessage('新增(認證): x', ['新增'])).toBe(true);
    expect(validateCommitMessage('feature: x', ['feat'])).toBe(false);
  });

  it('a type with a regular-expression character is matched literally', () => {
    expect(validateCommitMessage('a.b: x', ['a.b'])).toBe(true);
    expect(validateCommitMessage('axb: x', ['a.b'])).toBe(false);
  });
});
