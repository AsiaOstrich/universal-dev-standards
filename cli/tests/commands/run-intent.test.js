/**
 * Tests for run-intent command intent format validation (XSPEC-292 §9, T12).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('chalk', () => ({
  default: { red: (s) => s, gray: (s) => s, yellow: (s) => s, cyan: (s) => s, bold: (s) => s, green: (s) => s },
}));

const { resolveCommand } = vi.hoisted(() => ({ resolveCommand: vi.fn(() => null) }));
vi.mock('../../src/core/command-router.js', () => ({ resolveCommand }));
vi.mock('child_process', () => ({ execSync: vi.fn() }));

import { runIntentCommand } from '../../src/commands/run-intent.js';

describe('runIntentCommand intent validation (T12)', () => {
  let errors;
  beforeEach(() => {
    vi.clearAllMocks();
    errors = [];
    vi.spyOn(console, 'error').mockImplementation((...a) => errors.push(a.join(' ')));
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation(() => {});
  });

  it('rejects malformed intent before resolving', async () => {
    await runIntentCommand('test; rm -rf /');
    expect(errors.join('\n')).toContain('格式無效');
    expect(resolveCommand).not.toHaveBeenCalled();
  });

  it('rejects intent with uppercase/spaces', async () => {
    await runIntentCommand('My Build');
    expect(errors.join('\n')).toContain('格式無效');
    expect(resolveCommand).not.toHaveBeenCalled();
  });

  it('allows a well-formed intent through to resolution', async () => {
    resolveCommand.mockReturnValue({ source: 'uds.project.yaml', command: 'echo ok' });
    await runIntentCommand('test', { dryRun: true });
    expect(resolveCommand).toHaveBeenCalledWith('test', expect.any(String));
  });
});
