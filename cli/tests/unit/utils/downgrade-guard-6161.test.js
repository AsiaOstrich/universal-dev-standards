/**
 * Version order and the recording rule behind "an older uds must not write over a newer project" (dev-platform #308).
 * The end-to-end behaviour is in tests/e2e/update-refuses-older-cli-6161.test.js; this pins the order itself, with explicit
 * versions (not derived from the version this package happens to be), because the prerelease order is what a weakened comparison drops.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { isNewerThan, shouldRecordShipped, permitDowngrade, findNewerProject } from '../../../src/utils/downgrade-guard.js';
import { getRepositoryInfo } from '../../../src/utils/registry.js';

afterEach(() => permitDowngrade(false));

describe('isNewerThan: the order the guard refuses on', () => {
  it.each([
    ['6.16.1-beta.1', '6.16.0', true],
    ['6.16.1', '6.16.1-beta.1', true],
    ['6.16.1-beta.2', '6.16.1-beta.1', true],
    ['6.16.1-rc.1', '6.16.1-beta.9', true],
    ['6.17.0-beta.1', '6.16.9', true],
    ['7.0.0', '6.99.99', true],
    ['6.16.1', '6.16.1', false],
    ['6.16.1-beta.1', '6.16.1-beta.1', false],
    ['6.16.1-beta.1', '6.16.1', false],
    ['6.16.0', '6.16.1-beta.1', false],
    ['6.15.0', '6.16.1', false]
  ])('%s is newer than %s: %s', (recorded, shipped, expected) => {
    expect(isNewerThan(recorded, shipped)).toBe(expected);
  });

  it.each([null, undefined, '', 'unknown', '6.16', 42, {}])('a recorded version that is not a version (%j) is not a reason to refuse', (bad) => {
    expect(isNewerThan(bad, '6.16.1')).toBe(false);
    expect(isNewerThan('6.16.1', bad)).toBe(false);
  });
});

describe('shouldRecordShipped: forward or stay, never back', () => {
  it('records when the recorded version is older, equal, missing or unreadable', () => {
    expect(shouldRecordShipped('6.15.0', '6.16.1')).toBe(true);
    expect(shouldRecordShipped('6.16.1', '6.16.1')).toBe(true);
    expect(shouldRecordShipped(null, '6.16.1')).toBe(true);
    expect(shouldRecordShipped('unknown', '6.16.1')).toBe(true);
  });
  it('does not move a newer record back, unless --allow-downgrade was given', () => {
    expect(shouldRecordShipped('6.16.1', '6.16.1-beta.1')).toBe(false);
    expect(shouldRecordShipped('99.0.0', '6.16.1')).toBe(false);
    permitDowngrade(true);
    expect(shouldRecordShipped('99.0.0', '6.16.1')).toBe(true);
  });
});

describe('findNewerProject', () => {
  const shipped = getRepositoryInfo();
  it('names the standards record first, then the skills record, and nothing for a project at this version', () => {
    expect(findNewerProject({ upstream: { version: shipped.standards.version }, skills: { version: shipped.skills.version } })).toBeNull();
    expect(findNewerProject({ upstream: { version: '99.0.0' }, skills: { version: '99.0.0' } })).toMatchObject({ field: 'upstream.version', project: '99.0.0', cli: shipped.standards.version });
    expect(findNewerProject({ upstream: { version: shipped.standards.version }, skills: { version: '99.0.0' } })).toMatchObject({ field: 'skills.version', project: '99.0.0', cli: shipped.skills.version });
    expect(findNewerProject({})).toBeNull();
    expect(findNewerProject(null)).toBeNull();
  });
});
