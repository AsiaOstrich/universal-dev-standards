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

    it('should have valid commands paths for agents that support commands', () => {
      const agentsWithCommands = ['opencode', 'roo-code', 'copilot', 'gemini-cli'];

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

    it('should return null for agent without commands support', () => {
      const path = getCommandsDirForAgent('cursor', 'project', '/test/project');
      expect(path).toBeNull();
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

    it('should not include agents that do not support skills', () => {
      const agents = getSkillsSupportedAgents();

      // Cursor does not support SKILL.md
      expect(agents).not.toContain('cursor');
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

    it('should not include agents without commands support', () => {
      const agents = getCommandsSupportedAgents();

      // These agents don't support file-based commands
      expect(agents).not.toContain('cursor');
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

    it('should have name and description for each command', () => {
      for (const cmd of AVAILABLE_COMMANDS) {
        expect(cmd.name).toBeDefined();
        expect(typeof cmd.name).toBe('string');
        expect(cmd.description).toBeDefined();
        expect(typeof cmd.description).toBe('string');
      }
    });

    it('should contain essential commands', () => {
      const names = AVAILABLE_COMMANDS.map(c => c.name);

      expect(names).toContain('commit');
      expect(names).toContain('review');
      expect(names).toContain('tdd');
      expect(names).toContain('release');
    });
  });
});
