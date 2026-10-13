/**
 * judgeBatchAction: one skill or command action judged on its own after the batch installer ran (XSPEC-482 R10).
 */
import { describe, it, expect } from 'vitest';
import { judgeBatchAction } from '../../../src/reconciler/plan-executor.js';

const action = (name, agent = 'claude-code') => ({
  type: 'create', category: 'skill', path: `.claude/skills/${name}`, details: { metadata: { skillName: name, agent } }
});

describe('judgeBatchAction', () => {
  it('a clean batch: success, no error', () => {
    expect(judgeBatchAction(action('a'), { success: true, installations: [] }, 'skill')).toEqual({ action: action('a'), success: true });
  });

  it('a failed batch: only the skill the installer named fails, with its path and the cause; the others are not charged', () => {
    const result = { success: false, installations: [{ agent: 'claude-code', installed: ['b'], errors: [{ skill: 'a', error: "EACCES: permission denied, open '/p/a/SKILL.md'" }] }] };
    const a = judgeBatchAction(action('a'), result, 'skill');
    expect(a.success).toBe(false);
    expect(a.error).toBe(".claude/skills/a: EACCES: permission denied, open '/p/a/SKILL.md'");
    expect(judgeBatchAction(action('b'), result, 'skill').success).toBe(true);
  });

  it('an installation-level error fails every action of that agent, and only that agent', () => {
    const result = { success: false, installations: [{ agent: 'codex', installed: [], errors: [], error: 'Could not determine target directory for codex at project level' }] };
    expect(judgeBatchAction(action('a', 'codex'), result, 'skill').error).toContain('Could not determine target directory');
    expect(judgeBatchAction(action('a', 'claude-code'), { ...result, success: false }, 'skill').error).toContain('gave no reason');
  });

  it('a failure with no explanation still carries the path and says no reason was given, never "Unknown error"', () => {
    const r = judgeBatchAction(action('a'), { success: false, installations: [] }, 'skill');
    expect(r.success).toBe(false);
    expect(r.error).toBe('.claude/skills/a: the installer did not install skill "a" and gave no reason');
  });

  it('commands read their errors by the `command` key', () => {
    const cmd = { type: 'create', category: 'command', path: '.gemini/commands/audit.toml', details: { metadata: { commandName: 'audit', agent: 'gemini-cli' } } };
    const result = { success: false, installations: [{ agent: 'gemini-cli', installed: [], errors: [{ command: 'audit', error: 'EACCES' }] }] };
    expect(judgeBatchAction(cmd, result, 'command').error).toBe('.gemini/commands/audit.toml: EACCES');
  });
});
