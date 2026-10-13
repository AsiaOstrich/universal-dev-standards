/**
 * The three texts the native `.git/hooks/pre-commit` has had, and how `classifyNativePreCommitHook` tells them
 * apart (XSPEC-482 R3, R5). The older two are the files the published packages wrote
 * (tests/fixtures/older-uds-hooks/); the current one is what `buildNativePreCommitHook` returns.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join, resolve } from 'path';
import { classifyNativePreCommitHook, buildNativePreCommitHook, LEGACY_NATIVE_HOOK_6_11 } from '../../../src/utils/git-hooks.js';

const FIXTURES = resolve(import.meta.dirname, '../../fixtures/older-uds-hooks');
const fixture = (name) => readFileSync(join(FIXTURES, name), 'utf-8');

describe('classifyNativePreCommitHook', () => {
  it('knows the hook universal-dev-standards@6.11.0 wrote, byte for byte', () => {
    expect(classifyNativePreCommitHook(fixture('native-6.11.0.pre-commit'))).toBe('legacy-6.11');
    expect(fixture('native-6.11.0.pre-commit')).toBe(LEGACY_NATIVE_HOOK_6_11);
  });

  it('knows the hook universal-dev-standards@6.14.0-beta.12 wrote, byte for byte', () => {
    expect(classifyNativePreCommitHook(fixture('native-6.14.0-beta.12.pre-commit'))).toBe('without-ci');
  });

  it('knows the hook the current CLI writes, and that one runs the check with --ci', () => {
    const current = buildNativePreCommitHook();
    expect(classifyNativePreCommitHook(current)).toBe('current');
    expect(current).toContain('universal-dev-standards check --ci');
    expect(current).not.toContain('|| true');
  });

  it('reads a hook saved with CRLF line endings as the same text', () => {
    expect(classifyNativePreCommitHook(fixture('native-6.11.0.pre-commit').replace(/\n/g, '\r\n'))).toBe('legacy-6.11');
  });

  it('answers null for a hook that differs by a single line, an empty file, and a non-string', () => {
    expect(classifyNativePreCommitHook(fixture('native-6.11.0.pre-commit') + 'make lint\n')).toBeNull();
    expect(classifyNativePreCommitHook('')).toBeNull();
    expect(classifyNativePreCommitHook(undefined)).toBeNull();
    expect(classifyNativePreCommitHook('#!/bin/sh\nnpm test\n')).toBeNull();
  });

  it('the without-ci rebuild is only for recognition: it differs from the current text exactly in the check command', () => {
    const oldText = buildNativePreCommitHook({ ci: false });
    const now = buildNativePreCommitHook();
    expect(oldText).not.toBe(now);
    expect(oldText).toContain('    universal-dev-standards check\n    exit $?');
    expect(now).toContain('    universal-dev-standards check --ci\n    status=$?');
  });
});
