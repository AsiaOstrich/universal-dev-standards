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
// The fixtures are byte-for-byte what the releases wrote (.gitattributes: -text), so LF. Normalised here anyway so these
// tests never depend on how a checkout treats line endings; the CRLF cases below are built from this LF text.
const fixture = (name) => readFileSync(join(FIXTURES, name), 'utf-8').replace(/\r\n/g, '\n');

describe('classifyNativePreCommitHook', () => {
  it('knows the hook universal-dev-standards@6.11.0 wrote, byte for byte', () => {
    expect(classifyNativePreCommitHook(fixture('native-6.11.0.pre-commit'))).toBe('legacy-6.11');
    expect(readFileSync(join(FIXTURES, 'native-6.11.0.pre-commit'), 'utf-8'), 'the file as checked out, untouched by git').toBe(LEGACY_NATIVE_HOOK_6_11);
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
    const crlf = fixture('native-6.11.0.pre-commit').replace(/\n/g, '\r\n');
    expect(crlf).toContain('\r\n');
    expect(crlf).not.toContain('\r\r');
    expect(classifyNativePreCommitHook(crlf)).toBe('legacy-6.11');
    expect(classifyNativePreCommitHook(fixture('native-6.14.0-beta.12.pre-commit').replace(/\n/g, '\r\n'))).toBe('without-ci');
    expect(classifyNativePreCommitHook(buildNativePreCommitHook().replace(/\n/g, '\r\n'))).toBe('current');
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
