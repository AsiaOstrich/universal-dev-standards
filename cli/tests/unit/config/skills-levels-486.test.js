/**
 * XSPEC-486 R2: a tool can have no user-level skills folder (antigravity, on purpose). The path table answers
 * "no such place" as `null`, never as `undefined`, and `hasSkillsLevel` agrees with it for every tool of the table.
 */
import { describe, it, expect } from 'vitest';
import { AI_AGENT_PATHS, getSkillsDirForAgent, hasSkillsLevel } from '../../../src/config/ai-agent-paths.js';

const skillTools = Object.entries(AI_AGENT_PATHS).filter(([, c]) => c.supportsSkills && c.skills).map(([name]) => name);

describe('skills folders by level (XSPEC-486)', () => {
  it('the table has tools with and without a user-level folder (control for the cases below)', () => {
    expect(skillTools.some((t) => AI_AGENT_PATHS[t].skills.user)).toBe(true);
    expect(skillTools.some((t) => !AI_AGENT_PATHS[t].skills.user)).toBe(true);
  });

  it.each(skillTools)('%s: the user-level folder is a string when the table has one and null (not undefined) when it has none', (tool) => {
    const dir = getSkillsDirForAgent(tool, 'user');
    if (AI_AGENT_PATHS[tool].skills.user) {
      expect(typeof dir).toBe('string');
      expect(dir.length).toBeGreaterThan(0);
    } else {
      expect(dir).toBeNull();
    }
    expect(hasSkillsLevel(tool, 'user')).toBe(typeof dir === 'string');
  });

  it.each(skillTools)('%s: has a project-level folder, resolved against the project', (tool) => {
    expect(hasSkillsLevel(tool, 'project')).toBe(true);
    expect(getSkillsDirForAgent(tool, 'project', '/p')).toContain('p');
  });

  it('a tool that is not in the table has no level at all', () => {
    expect(hasSkillsLevel('no-such-tool', 'user')).toBe(false);
    expect(hasSkillsLevel('no-such-tool', 'project')).toBe(false);
    expect(getSkillsDirForAgent('no-such-tool', 'user')).toBeNull();
  });
});
