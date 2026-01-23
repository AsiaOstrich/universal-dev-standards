import { describe, it, expect } from 'vitest';
import {
  ExecutionMode,
  getExecutionMode,
  adaptAgentForTool,
  getAllToolsWithModes,
  checkAgentToolCompatibility
} from '../../../src/utils/agent-adapter.js';

describe('Agent Adapter', () => {
  describe('ExecutionMode', () => {
    it('should define all execution modes', () => {
      expect(ExecutionMode.TASK).toBe('task');
      expect(ExecutionMode.INLINE).toBe('inline');
      expect(ExecutionMode.MANUAL).toBe('manual');
    });
  });

  describe('getExecutionMode', () => {
    it('should return TASK for Claude Code', () => {
      expect(getExecutionMode('claude-code')).toBe(ExecutionMode.TASK);
    });

    it('should return TASK for OpenCode', () => {
      expect(getExecutionMode('opencode')).toBe(ExecutionMode.TASK);
    });

    it('should return TASK for Roo Code', () => {
      expect(getExecutionMode('roo-code')).toBe(ExecutionMode.TASK);
    });

    it('should return INLINE for Cline', () => {
      expect(getExecutionMode('cline')).toBe(ExecutionMode.INLINE);
    });

    it('should return INLINE for Copilot', () => {
      expect(getExecutionMode('copilot')).toBe(ExecutionMode.INLINE);
    });

    it('should return INLINE for Cursor (supports agents but not Task)', () => {
      expect(getExecutionMode('cursor')).toBe(ExecutionMode.INLINE);
    });

    it('should return MANUAL for Antigravity (no agents support)', () => {
      expect(getExecutionMode('antigravity')).toBe(ExecutionMode.MANUAL);
    });

    it('should return MANUAL for unknown tools', () => {
      expect(getExecutionMode('unknown-tool')).toBe(ExecutionMode.MANUAL);
    });
  });

  describe('adaptAgentForTool', () => {
    const sampleAgentConfig = {
      name: 'code-architect',
      description: 'Software architecture specialist',
      role: 'specialist',
      expertise: ['system-design', 'api-design'],
      'allowed-tools': ['Read', 'Glob', 'Grep'],
      'disallowed-tools': ['Write', 'Edit'],
      skills: ['spec-driven-dev'],
      model: 'sonnet',
      triggers: {
        keywords: ['architecture', 'design'],
        commands: ['/architect']
      }
    };

    describe('TASK mode (Claude Code, OpenCode)', () => {
      it('should return task mode configuration for Claude Code', () => {
        const result = adaptAgentForTool(sampleAgentConfig, 'claude-code');

        expect(result.mode).toBe(ExecutionMode.TASK);
        expect(result.aiTool).toBe('claude-code');
        expect(result.taskConfig).toBeDefined();
      });

      it('should include subagent_type in taskConfig', () => {
        const result = adaptAgentForTool(sampleAgentConfig, 'claude-code');

        expect(result.taskConfig.subagent_type).toBe('code-architect');
      });

      it('should truncate description for task config', () => {
        const longDescConfig = {
          ...sampleAgentConfig,
          description: 'This is a very long description that should be truncated to fit within the Task tool requirements for subagent descriptions'
        };

        const result = adaptAgentForTool(longDescConfig, 'claude-code');

        expect(result.taskConfig.description.length).toBeLessThanOrEqual(50);
      });

      it('should parse allowed tools', () => {
        const result = adaptAgentForTool(sampleAgentConfig, 'claude-code');

        expect(result.taskConfig.allowedTools).toEqual(['Read', 'Glob', 'Grep']);
      });

      it('should parse disallowed tools', () => {
        const result = adaptAgentForTool(sampleAgentConfig, 'claude-code');

        expect(result.taskConfig.disallowedTools).toEqual(['Write', 'Edit']);
      });

      it('should include skill dependencies', () => {
        const result = adaptAgentForTool(sampleAgentConfig, 'claude-code');

        expect(result.taskConfig.skillDependencies).toEqual(['spec-driven-dev']);
      });

      it('should include model preference', () => {
        const result = adaptAgentForTool(sampleAgentConfig, 'claude-code');

        expect(result.taskConfig.model).toBe('sonnet');
      });

      it('should include triggers', () => {
        const result = adaptAgentForTool(sampleAgentConfig, 'claude-code');

        expect(result.triggers).toEqual(sampleAgentConfig.triggers);
      });
    });

    describe('INLINE mode (Cline, Copilot)', () => {
      it('should return inline mode configuration for Cline', () => {
        const result = adaptAgentForTool(sampleAgentConfig, 'cline');

        expect(result.mode).toBe(ExecutionMode.INLINE);
        expect(result.aiTool).toBe('cline');
        expect(result.contextPrefix).toBeDefined();
      });

      it('should generate context prefix with agent name', () => {
        const result = adaptAgentForTool(sampleAgentConfig, 'cline');

        expect(result.contextPrefix).toContain('<!-- UDS Agent: code-architect -->');
        expect(result.contextPrefix).toContain('<!-- Role: specialist -->');
      });

      it('should include expertise in context prefix', () => {
        const result = adaptAgentForTool(sampleAgentConfig, 'cline');

        expect(result.contextPrefix).toContain('## Agent Expertise:');
        expect(result.contextPrefix).toContain('system-design');
      });

      it('should include description in context prefix', () => {
        const result = adaptAgentForTool(sampleAgentConfig, 'cline');

        expect(result.contextPrefix).toContain('## Agent Purpose');
        expect(result.contextPrefix).toContain('Software architecture specialist');
      });

      it('should include note about inline mode', () => {
        const result = adaptAgentForTool(sampleAgentConfig, 'cline');

        expect(result.note).toContain('does not support subagent execution');
      });
    });

    describe('MANUAL mode (Antigravity, unknown tools)', () => {
      it('should return manual mode configuration for Antigravity', () => {
        const result = adaptAgentForTool(sampleAgentConfig, 'antigravity');

        expect(result.mode).toBe(ExecutionMode.MANUAL);
        expect(result.aiTool).toBe('antigravity');
        expect(result.instructions).toBeDefined();
      });

      it('should generate instructions with agent info', () => {
        const result = adaptAgentForTool(sampleAgentConfig, 'antigravity');

        expect(result.instructions).toContain('# code-architect Agent Instructions');
        expect(result.instructions).toContain('**Name**: code-architect');
        expect(result.instructions).toContain('**Role**: specialist');
      });

      it('should include expertise in instructions', () => {
        const result = adaptAgentForTool(sampleAgentConfig, 'antigravity');

        expect(result.instructions).toContain('**Expertise**: system-design, api-design');
      });

      it('should include note about manual mode', () => {
        const result = adaptAgentForTool(sampleAgentConfig, 'antigravity');

        expect(result.note).toContain('does not support agents');
      });
    });

    describe('Edge cases', () => {
      it('should handle empty agent config', () => {
        const result = adaptAgentForTool({}, 'claude-code');

        expect(result.mode).toBe(ExecutionMode.TASK);
        expect(result.taskConfig.subagent_type).toBe('general-purpose');
      });

      it('should handle string tool lists', () => {
        const config = {
          ...sampleAgentConfig,
          'allowed-tools': '[Read, Write, Edit]'
        };

        const result = adaptAgentForTool(config, 'claude-code');

        expect(result.taskConfig.allowedTools).toEqual(['Read', 'Write', 'Edit']);
      });

      it('should handle missing triggers', () => {
        const config = { name: 'test', description: 'Test agent' };
        const result = adaptAgentForTool(config, 'claude-code');

        expect(result.triggers).toEqual({});
      });
    });
  });

  describe('getAllToolsWithModes', () => {
    it('should return array of tool info', () => {
      const tools = getAllToolsWithModes();

      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
    });

    it('should include Claude Code with TASK mode', () => {
      const tools = getAllToolsWithModes();
      const claudeCode = tools.find(t => t.id === 'claude-code');

      expect(claudeCode).toBeDefined();
      expect(claudeCode.mode).toBe(ExecutionMode.TASK);
      expect(claudeCode.supportsTask).toBe(true);
    });

    it('should include Cursor with INLINE mode', () => {
      const tools = getAllToolsWithModes();
      const cursor = tools.find(t => t.id === 'cursor');

      expect(cursor).toBeDefined();
      expect(cursor.mode).toBe(ExecutionMode.INLINE);
      expect(cursor.supportsTask).toBe(false);
      expect(cursor.supportsAgents).toBe(true);  // Cursor supports agents (inline mode)
    });

    it('should include all expected tools', () => {
      const tools = getAllToolsWithModes();
      const toolIds = tools.map(t => t.id);

      expect(toolIds).toContain('claude-code');
      expect(toolIds).toContain('opencode');
      expect(toolIds).toContain('cursor');
      expect(toolIds).toContain('cline');
      expect(toolIds).toContain('copilot');
    });
  });

  describe('checkAgentToolCompatibility', () => {
    const sampleAgentConfig = {
      name: 'test-agent',
      'allowed-tools': ['Read', 'Glob'],
      model: 'opus',
      skills: ['testing-guide']
    };

    it('should return compatible for TASK mode tools', () => {
      const result = checkAgentToolCompatibility(sampleAgentConfig, 'claude-code');

      expect(result.compatible).toBe(true);
      expect(result.mode).toBe(ExecutionMode.TASK);
      expect(result.warnings).toHaveLength(0);
    });

    it('should indicate TASK mode features', () => {
      const result = checkAgentToolCompatibility(sampleAgentConfig, 'claude-code');

      expect(result.features.taskExecution).toBe(true);
      expect(result.features.toolPermissions).toBe(true);
      expect(result.features.skillDependencies).toBe(true);
    });

    it('should warn about tool permissions in INLINE mode', () => {
      const result = checkAgentToolCompatibility(sampleAgentConfig, 'cline');

      expect(result.warnings).toContain('Tool permissions will be ignored (inline/manual mode)');
    });

    it('should warn about model preference in INLINE mode', () => {
      const result = checkAgentToolCompatibility(sampleAgentConfig, 'cline');

      expect(result.warnings).toContain('Model preference will be ignored (inline/manual mode)');
    });

    it('should warn about skill dependencies in INLINE mode', () => {
      const result = checkAgentToolCompatibility(sampleAgentConfig, 'cline');

      expect(result.warnings).toContain('Skill dependencies require manual loading (inline/manual mode)');
    });

    it('should indicate limited features in INLINE mode', () => {
      const result = checkAgentToolCompatibility(sampleAgentConfig, 'cline');

      expect(result.features.taskExecution).toBe(false);
      expect(result.features.toolPermissions).toBe(false);
      expect(result.features.skillDependencies).toBe(false);
    });

    it('should always support triggers', () => {
      const result = checkAgentToolCompatibility(sampleAgentConfig, 'cursor');

      expect(result.features.triggers).toBe(true);
    });

    it('should handle agent without advanced features', () => {
      const simpleConfig = {
        name: 'simple-agent',
        description: 'Simple agent'
      };

      const result = checkAgentToolCompatibility(simpleConfig, 'cline');

      expect(result.compatible).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });
});
