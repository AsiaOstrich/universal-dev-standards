/**
 * XSPEC-486 R1: the skills-location question lists a user-level choice only for a tool whose path table has a
 * user-level folder, and pre-ticks the project-level choice of every tool. (The end-to-end version, typed into the
 * real CLI, is tests/e2e/xspec-486-antigravity-init-no-user-skills.test.js.)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockCheckbox } = vi.hoisted(() => ({ mockCheckbox: vi.fn() }));
vi.mock('@inquirer/prompts', () => ({
  select: vi.fn(), checkbox: mockCheckbox, confirm: vi.fn(), input: vi.fn(), Separator: class Separator {}
}));

import { promptSkillsInstallLocation } from '../../../src/prompts/init.js';
import { AI_AGENT_PATHS } from '../../../src/config/ai-agent-paths.js';

const skillTools = Object.entries(AI_AGENT_PATHS).filter(([, c]) => c.supportsSkills && c.skills).map(([name]) => name);

beforeEach(() => {
  mockCheckbox.mockReset();
  mockCheckbox.mockResolvedValue([]);
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

describe('promptSkillsInstallLocation choices (XSPEC-486)', () => {
  it.each(skillTools)('%s: offers a project-level choice, pre-ticked, and a user-level choice only if the table has a user folder', async (tool) => {
    await promptSkillsInstallLocation([tool]);
    const { choices } = mockCheckbox.mock.calls[0][0];
    const values = choices.map((c) => c.value);
    expect(values).toContain(`${tool}:project`);
    expect(choices.find((c) => c.value === `${tool}:project`).checked).toBe(true);
    expect(values.includes(`${tool}:user`)).toBe(Boolean(AI_AGENT_PATHS[tool].skills.user));
  });

  it('Claude Code and Antigravity together: three choices, Antigravity only at the project level', async () => {
    await promptSkillsInstallLocation(['claude-code', 'antigravity']);
    const values = mockCheckbox.mock.calls[0][0].choices.map((c) => c.value);
    expect(values).toEqual(['claude-code:user', 'claude-code:project', 'antigravity:project']);
  });

  it('returns what was ticked, as agent and level', async () => {
    mockCheckbox.mockResolvedValue(['claude-code:project', 'antigravity:project']);
    const result = await promptSkillsInstallLocation(['claude-code', 'antigravity']);
    expect(result).toEqual([{ agent: 'claude-code', level: 'project' }, { agent: 'antigravity', level: 'project' }]);
  });
});
