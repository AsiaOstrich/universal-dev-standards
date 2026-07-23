import { describe, it, expect } from 'vitest';
import { homedir } from 'os';
import { join } from 'path';
import {
  AI_AGENT_PATHS,
  getAgentConfig,
  getSkillsDirForAgent,
  getCommandsDirForAgent,
  getSkillsSupportedAgents,
  getCommandsSupportedAgents,
  supportsMarketplace,
  getFallbackSkillsPath,
  getAgentDisplayName,
  AVAILABLE_COMMANDS
} from '../../../src/config/ai-agent-paths.js';

describe('AI Agent Paths Configuration', () => {
  describe('AI_AGENT_PATHS', () => {
    it('should contain all expected agents', () => {
      const expectedAgents = [
        'claude-code', 'opencode', 'cursor', 'cline', 'roo-code',
        'codex', 'copilot', 'windsurf', 'gemini-cli', 'antigravity'
      ];

      for (const agent of expectedAgents) {
        expect(AI_AGENT_PATHS[agent]).toBeDefined();
      }
    });

    it('should have valid skills paths for each agent with skills support', () => {
      for (const [agent, config] of Object.entries(AI_AGENT_PATHS)) {
        if (config.skills) {
          expect(config.skills.project).toBeDefined();
          expect(typeof config.skills.project).toBe('string');
          expect(config.skills.user).toBeDefined();
          expect(typeof config.skills.user).toBe('string');
        }
      }
    });

    // XSPEC-355 OQ6. This test previously asserted skills.project === '.agent/skills/',
    // which locked in an install path that was never verified against a real Antigravity
    // CLI — it came from a UDS spec written while Gemini CLI was still the product, and
    // Antigravity replaced it on 2026-06-18. A green test meant only that the code agreed
    // with the assumption, not that the path was right.
    //
    // The config now declines to install rather than write to an unverified location
    // (an unverified path fails silently: init succeeds, skills are never picked up).
    // When one candidate is confirmed, set skills and restore a positive assertion here.
    it('declines to install skills for Antigravity while the path is unverified', () => {
      const config = AI_AGENT_PATHS['antigravity'];

      expect(config.skills).toBeNull();
      // The tool does support skills; only our path for it is unknown.
      expect(config.supportsSkills).toBe(true);
    });

    it('should have valid commands paths for agents that support commands', () => {
      // Updated Jan 2026: Cursor v2.4 added commands support
      const agentsWithCommands = ['opencode', 'cursor', 'roo-code', 'copilot', 'gemini-cli'];

      for (const agent of agentsWithCommands) {
        expect(AI_AGENT_PATHS[agent].commands).toBeDefined();
        expect(AI_AGENT_PATHS[agent].commands.project).toBeDefined();
      }
    });
  });

  describe('getAgentConfig', () => {
    it('should return config for valid agent', () => {
      const config = getAgentConfig('claude-code');

      expect(config).toBeDefined();
      expect(config.name).toBe('Claude Code');
      expect(config.supportsMarketplace).toBe(true);
      expect(config.supportsSkills).toBe(true);
    });

    it('should return null for unknown agent', () => {
      const config = getAgentConfig('unknown-agent');
      expect(config).toBeNull();
    });

    it('should return complete config for OpenCode', () => {
      const config = getAgentConfig('opencode');

      expect(config.name).toBe('OpenCode');
      expect(config.skills.project).toBe('.opencode/skill/');
      expect(config.commands.project).toBe('.opencode/command/');
      expect(config.fallbackSkillsPath).toBe('.claude/skills/');
    });
  });

  describe('getSkillsDirForAgent', () => {
    it('should return user-level skills path', () => {
      const path = getSkillsDirForAgent('claude-code', 'user');
      expect(path).toBe(join(homedir(), '.claude', 'skills'));
    });

    it('should return project-level skills path when projectPath provided', () => {
      const path = getSkillsDirForAgent('claude-code', 'project', '/test/project');
      expect(path).toBe(join('/test/project', '.claude/skills/'));
    });

    it('should return null for unknown agent', () => {
      const path = getSkillsDirForAgent('unknown', 'user');
      expect(path).toBeNull();
    });

    it('should return null when project level without projectPath', () => {
      const path = getSkillsDirForAgent('claude-code', 'project');
      expect(path).toBeNull();
    });
  });

  describe('getCommandsDirForAgent', () => {
    it('should return commands path for supported agent at project level', () => {
      const path = getCommandsDirForAgent('opencode', 'project', '/test/project');
      expect(path).toBe(join('/test/project', '.opencode/command/'));
    });

    it('should return commands path for supported agent at user level', () => {
      const path = getCommandsDirForAgent('opencode', 'user');
      expect(path).toBe(join(homedir(), '.config', 'opencode', 'command'));
    });

    it('should return commands path for Cursor (added Jan 2026, v2.4)', () => {
      const path = getCommandsDirForAgent('cursor', 'project', '/test/project');
      expect(path).toBe(join('/test/project', '.cursor/commands/'));
    });

    it('should return null for unknown agent', () => {
      const path = getCommandsDirForAgent('unknown', 'project', '/test/project');
      expect(path).toBeNull();
    });

    it('should return correct path for Gemini CLI at project level', () => {
      const path = getCommandsDirForAgent('gemini-cli', 'project', '/test/project');
      expect(path).toBe(join('/test/project', '.gemini/commands/'));
    });

    it('should return null when project level without projectPath', () => {
      const path = getCommandsDirForAgent('opencode', 'project');
      expect(path).toBeNull();
    });
  });

  describe('getSkillsSupportedAgents', () => {
    it('should return array of agents that support skills', () => {
      const agents = getSkillsSupportedAgents();

      expect(Array.isArray(agents)).toBe(true);
      expect(agents).toContain('claude-code');
      expect(agents).toContain('opencode');
      expect(agents).toContain('cline');
      expect(agents).toContain('gemini-cli');
    });

    it('should include Cursor (added Jan 2026, v2.4)', () => {
      const agents = getSkillsSupportedAgents();

      // Cursor added SKILL.md support in v2.4 (Jan 22, 2026)
      expect(agents).toContain('cursor');
    });

    // XSPEC-355 OQ6. getSkillsSupportedAgents() filters on `supportsSkills && skills`,
    // i.e. "we can install for this agent", not "this agent supports skills". Antigravity
    // does support skills, but UDS has no verified path to install them to, so it is
    // correctly absent from the installable set. Restore it here once the path is confirmed.
    it('excludes Antigravity while its install path is unverified', () => {
      const agents = getSkillsSupportedAgents();

      expect(agents).not.toContain('antigravity');
      expect(AI_AGENT_PATHS['antigravity'].supportsSkills).toBe(true);
    });
  });

  describe('getCommandsSupportedAgents', () => {
    it('should return array of agents that support commands', () => {
      const agents = getCommandsSupportedAgents();

      expect(Array.isArray(agents)).toBe(true);
      expect(agents).toContain('opencode');
      expect(agents).toContain('roo-code');
      expect(agents).toContain('copilot');
      expect(agents).toContain('gemini-cli');
    });

    it('should include Cursor (added Jan 2026, v2.4)', () => {
      const agents = getCommandsSupportedAgents();

      // Cursor added commands support in v2.4 (Jan 22, 2026)
      expect(agents).toContain('cursor');
      // Cline still doesn't support file-based commands
      expect(agents).not.toContain('cline');
    });
  });

  describe('supportsMarketplace', () => {
    it('should return true for Claude Code', () => {
      expect(supportsMarketplace('claude-code')).toBe(true);
    });

    it('should return false for other agents', () => {
      expect(supportsMarketplace('opencode')).toBe(false);
      expect(supportsMarketplace('cursor')).toBe(false);
      expect(supportsMarketplace('cline')).toBe(false);
    });

    it('should return false for unknown agent', () => {
      expect(supportsMarketplace('unknown')).toBe(false);
    });
  });

  describe('getFallbackSkillsPath', () => {
    it('should return .claude/skills/ for compatible agents', () => {
      expect(getFallbackSkillsPath('opencode')).toBe('.claude/skills/');
      expect(getFallbackSkillsPath('cline')).toBe('.claude/skills/');
      expect(getFallbackSkillsPath('copilot')).toBe('.claude/skills/');
    });

    it('should return null for native implementation', () => {
      expect(getFallbackSkillsPath('claude-code')).toBeNull();
    });

    it('should return null for unknown agent', () => {
      expect(getFallbackSkillsPath('unknown')).toBeNull();
    });
  });

  describe('getAgentDisplayName', () => {
    it('should return display name for known agents', () => {
      expect(getAgentDisplayName('claude-code')).toBe('Claude Code');
      expect(getAgentDisplayName('opencode')).toBe('OpenCode');
      expect(getAgentDisplayName('gemini-cli')).toBe('Gemini CLI');
      expect(getAgentDisplayName('roo-code')).toBe('Roo Code');
    });

    it('should return agent identifier for unknown agent', () => {
      expect(getAgentDisplayName('unknown-agent')).toBe('unknown-agent');
    });
  });

  describe('AVAILABLE_COMMANDS', () => {
    it('should be an array of command objects', () => {
      expect(Array.isArray(AVAILABLE_COMMANDS)).toBe(true);
      expect(AVAILABLE_COMMANDS.length).toBeGreaterThan(0);
    });

    it('should have 51 commands (22 Action Skills + 12 Commands-only + 11 Operations + 4 SRE/Observability + 2 skill-only)', () => {
      // Updated May 2026 (v5.11.0): Added 4 SRE/Observability commands (XSPEC-208 release prep,
      // aligning AVAILABLE_COMMANDS with skills/commands/*.md files)
      // e2e, observability, runbook, slo
      // Updated Jun 2026: registered /journey-test and /skill-builder (created their
      // skills/commands/*.md files; they were listed in skills/README but unregistered)
      expect(AVAILABLE_COMMANDS.length).toBe(51);
    });

    it('should have name and description for each command', () => {
      for (const cmd of AVAILABLE_COMMANDS) {
        expect(cmd.name).toBeDefined();
        expect(typeof cmd.name).toBe('string');
        expect(cmd.description).toBeDefined();
        expect(typeof cmd.description).toBe('string');
      }
    });

    it('should contain essential Skills-based commands', () => {
      const names = AVAILABLE_COMMANDS.map(c => c.name);

      // Core development workflow
      expect(names).toContain('commit');
      expect(names).toContain('code-review');
      expect(names).toContain('release');
      expect(names).toContain('changelog');

      // Testing
      expect(names).toContain('tdd');
      expect(names).toContain('bdd');
      expect(names).toContain('atdd');
      expect(names).toContain('coverage');

      // Spec & requirements
      expect(names).toContain('sdd');
      expect(names).toContain('requirement');
      expect(names).toContain('derive');
      expect(names).toContain('reverse');

      // Discovery
      expect(names).toContain('discover');

      // Documentation
      expect(names).toContain('docs');
      expect(names).toContain('docgen');
      expect(names).toContain('guide');
    });

    it('should contain Commands-only commands (added Jan 2026)', () => {
      const names = AVAILABLE_COMMANDS.map(c => c.name);

      // CLI management commands
      expect(names).toContain('init');
      expect(names).toContain('update');
      expect(names).toContain('check');
      expect(names).toContain('config');

      // Derivation commands
      expect(names).toContain('derive-bdd');
      expect(names).toContain('derive-tdd');
      expect(names).toContain('derive-atdd');
      expect(names).toContain('derive-all');

      // Reverse engineering commands
      expect(names).toContain('reverse-sdd');
      expect(names).toContain('reverse-bdd');
      expect(names).toContain('reverse-tdd');
    });

    it('should have unique command names', () => {
      const names = AVAILABLE_COMMANDS.map(c => c.name);
      const uniqueNames = [...new Set(names)];
      expect(names.length).toBe(uniqueNames.length);
    });
  });
});
