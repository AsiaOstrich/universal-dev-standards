/**
 * Tests for hitl command --op input validation (XSPEC-292 §9, T12).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('chalk', () => ({
  default: { red: (s) => s, green: (s) => s },
}));

const { enforce } = vi.hoisted(() => ({ enforce: vi.fn(() => Promise.resolve(true)) }));
vi.mock('../../src/hitl/manager.js', () => ({ hitl: { enforce } }));

import { hitlCommand } from '../../src/commands/hitl.js';

describe('hitlCommand --op validation (T12)', () => {
  let errors;
  beforeEach(() => {
    vi.clearAllMocks();
    errors = [];
    vi.spyOn(console, 'error').mockImplementation((...a) => errors.push(a.join(' ')));
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation(() => {});
  });

  it('rejects missing --op without calling enforce', async () => {
    await hitlCommand({});
    expect(errors.join('\n')).toContain('required');
    expect(enforce).not.toHaveBeenCalled();
  });

  it('rejects empty/whitespace --op', async () => {
    await hitlCommand({ op: '   ' });
    expect(errors.join('\n')).toContain('empty');
    expect(enforce).not.toHaveBeenCalled();
  });

  it('rejects over-long --op', async () => {
    await hitlCommand({ op: 'x'.repeat(501) });
    expect(errors.join('\n')).toMatch(/≤ 500/);
    expect(enforce).not.toHaveBeenCalled();
  });

  it('trims and forwards a valid --op to enforce', async () => {
    await hitlCommand({ op: '  deploy service  ' });
    expect(enforce).toHaveBeenCalledWith('deploy service', expect.any(Object));
  });
});
