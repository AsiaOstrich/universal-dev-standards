/**
 * Tests for SPEC-FLOW-001: 自訂 SDLC 流程引擎 — Flow Parser & Validator
 * Generated from: docs/specs/SPEC-FLOW-001-custom-workflow-engine.md
 * AC Coverage: AC-1, AC-2
 */

import { describe, it, expect } from 'vitest';
import { parseFlow } from '../../../src/flow/flow-parser.js';
import { validateFlow } from '../../../src/flow/flow-validator.js';

describe('SPEC-FLOW-001: Flow Parser', () => {
  // ============================================================
  // AC-1: Flow YAML 能被解析和驗證（schema 正確性）
  // ============================================================
  describe('AC-1: Flow YAML 解析與驗證', () => {
    it('should parse valid Flow YAML with id and stages', () => {
      // Arrange
      const validYaml = `
id: my-flow
name: "我的流程"
stages:
  - id: plan
    name: "規劃"
    steps:
      - command: /brainstorm
        required: false
      - command: /requirement
        required: true
`;

      // Act
      const result = parseFlow(validYaml);

      // Assert
      expect(result.id).toBe('my-flow');
      expect(result.name).toBe('我的流程');
      expect(result.stages).toHaveLength(1);
      expect(result.stages[0].id).toBe('plan');
      expect(result.stages[0].steps).toHaveLength(2);
      expect(result.stages[0].steps[0].command).toBe('/brainstorm');
      expect(result.stages[0].steps[0].required).toBe(false);
      expect(result.stages[0].steps[1].required).toBe(true);
    });

    it('should apply default values for optional fields', () => {
      // Arrange
      const minimalYaml = `
id: minimal
name: "最小流程"
stages:
  - id: build
    name: "建置"
    steps:
      - command: /tdd
`;

      // Act
      const result = parseFlow(minimalYaml);

      // Assert — steps.required 預設 true
      expect(result.stages[0].steps[0].required).toBe(true);
      // Assert — config 預設值
      expect(result.config).toBeDefined();
      expect(result.config.enforcement).toBe('suggest');
      expect(result.config.allow_skip_optional).toBe(true);
      expect(result.config.state_persistence).toBe(true);
      expect(result.config.gate_timeout).toBe(30);
    });

    it('should parse flow with gates', () => {
      // Arrange
      const yamlWithGates = `
id: gated-flow
name: "有閘門的流程"
stages:
  - id: build
    name: "建置"
    steps:
      - command: /tdd
    gates:
      - type: blocking
        run: "npm test"
        expect: exit_code_0
      - type: warning
        ref: coverage-gate
        threshold: 80
`;

      // Act
      const result = parseFlow(yamlWithGates);

      // Assert
      expect(result.stages[0].gates).toHaveLength(2);
      expect(result.stages[0].gates[0].type).toBe('blocking');
      expect(result.stages[0].gates[0].run).toBe('npm test');
      expect(result.stages[0].gates[1].ref).toBe('coverage-gate');
      expect(result.stages[0].gates[1].threshold).toBe(80);
    });

    it('should parse flow with extends field', () => {
      // Arrange
      const yamlWithExtends = `
id: team-flow
name: "團隊流程"
extends: sdd
overrides:
  - stage: implement
    add_steps:
      - command: /security
        after: /tdd
`;

      // Act
      const result = parseFlow(yamlWithExtends);

      // Assert
      expect(result.extends).toBe('sdd');
      expect(result.overrides).toHaveLength(1);
      expect(result.overrides[0].stage).toBe('implement');
      expect(result.overrides[0].add_steps[0].command).toBe('/security');
    });

    it('should parse flow with when conditions (string)', () => {
      // Arrange
      const yamlWithWhen = `
id: conditional-flow
name: "條件流程"
stages:
  - id: design
    name: "設計"
    steps:
      - command: /api-design
        when: scope_includes_api
`;

      // Act
      const result = parseFlow(yamlWithWhen);

      // Assert
      expect(result.stages[0].steps[0].when).toBe('scope_includes_api');
    });

    it('should parse flow with when conditions (object)', () => {
      // Arrange
      const yamlWithWhenObject = `
id: conditional-flow-2
name: "條件流程 2"
stages:
  - id: design
    name: "設計"
    steps:
      - command: /database
        when:
          scope: "includes database"
          files_changed: "**/*.sql"
`;

      // Act
      const result = parseFlow(yamlWithWhenObject);

      // Assert
      expect(result.stages[0].steps[0].when).toEqual({
        scope: 'includes database',
        files_changed: '**/*.sql'
      });
    });

    it('should parse loop stage', () => {
      // Arrange
      const yamlWithLoop = `
id: tdd-flow
name: "TDD 流程"
stages:
  - id: red
    name: "Red"
    loop: true
    steps:
      - command: /tdd
`;

      // Act
      const result = parseFlow(yamlWithLoop);

      // Assert
      expect(result.stages[0].loop).toBe(true);
    });

    it('should parse config section with custom values', () => {
      // Arrange
      const yamlWithConfig = `
id: strict-flow
name: "嚴格流程"
stages:
  - id: build
    name: "建置"
    steps:
      - command: /tdd
config:
  enforcement: enforce
  allow_skip_optional: false
  state_persistence: true
  gate_timeout: 60
`;

      // Act
      const result = parseFlow(yamlWithConfig);

      // Assert
      expect(result.config.enforcement).toBe('enforce');
      expect(result.config.allow_skip_optional).toBe(false);
      expect(result.config.gate_timeout).toBe(60);
    });
  });

  // ============================================================
  // AC-1: 驗證失敗場景
  // ============================================================
  describe('AC-1: 驗證失敗場景', () => {
    it('should throw error when id is missing', () => {
      // Arrange
      const noIdYaml = `
name: "缺少 id"
stages:
  - id: plan
    name: "規劃"
    steps:
      - command: /brainstorm
`;

      // Act & Assert
      expect(() => parseFlow(noIdYaml)).toThrow(/id/i);
    });

    it('should throw error when stages is missing and no extends', () => {
      // Arrange
      const noStagesYaml = `
id: no-stages
name: "缺少 stages"
`;

      // Act & Assert
      expect(() => parseFlow(noStagesYaml)).toThrow(/stages/i);
    });

    it('should allow missing stages when extends is present', () => {
      // Arrange
      const extendsOnlyYaml = `
id: child-flow
name: "繼承流程"
extends: sdd
`;

      // Act
      const result = parseFlow(extendsOnlyYaml);

      // Assert
      expect(result.id).toBe('child-flow');
      expect(result.extends).toBe('sdd');
      expect(result.stages).toBeUndefined();
    });

    it('should throw error when stage has no steps', () => {
      // Arrange
      const noStepsYaml = `
id: empty-stage
name: "空 stage"
stages:
  - id: plan
    name: "規劃"
`;

      // Act & Assert
      expect(() => parseFlow(noStepsYaml)).toThrow(/steps/i);
    });

    it('should throw error when step has no command', () => {
      // Arrange
      const noCommandYaml = `
id: no-cmd
name: "缺少 command"
stages:
  - id: plan
    name: "規劃"
    steps:
      - required: true
`;

      // Act & Assert
      expect(() => parseFlow(noCommandYaml)).toThrow(/command/i);
    });

    it('should throw error for duplicate stage ids', () => {
      // Arrange
      const dupStageYaml = `
id: dup-stages
name: "重複 stage"
stages:
  - id: plan
    name: "規劃 1"
    steps:
      - command: /brainstorm
  - id: plan
    name: "規劃 2"
    steps:
      - command: /requirement
`;

      // Act & Assert
      expect(() => parseFlow(dupStageYaml)).toThrow(/duplicate.*plan/i);
    });

    it('should throw error for invalid YAML syntax', () => {
      // Arrange
      const badYaml = `
id: broken
  name: indentation error
    stages: wrong
`;

      // Act & Assert
      expect(() => parseFlow(badYaml)).toThrow();
    });

    it('should cap gate_timeout at 600 seconds', () => {
      // Arrange
      const overTimeoutYaml = `
id: over-timeout
name: "超時流程"
stages:
  - id: build
    name: "建置"
    steps:
      - command: /tdd
config:
  gate_timeout: 9999
`;

      // Act
      const result = parseFlow(overTimeoutYaml);

      // Assert
      expect(result.config.gate_timeout).toBe(600);
    });
  });

  // ============================================================
  // AC-2: 引用不存在的命令時回報錯誤
  // ============================================================
  describe('AC-2: 命令引用驗證', () => {
    it('should return error for non-existent command', () => {
      // Arrange
      const flow = {
        id: 'bad-flow',
        name: '引用錯誤命令',
        stages: [{
          id: 'plan',
          name: '規劃',
          steps: [{ command: '/nonexistent', required: true }]
        }]
      };
      const availableCommands = ['/sdd', '/tdd', '/bdd', '/brainstorm', '/requirement'];

      // Act
      const errors = validateFlow(flow, { availableCommands });

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(/\/nonexistent/);
      expect(errors[0].type).toBe('invalid_command');
      expect(errors[0].suggestions).toBeDefined();
    });

    it('should pass validation for existing commands', () => {
      // Arrange
      const flow = {
        id: 'good-flow',
        name: '正確命令',
        stages: [{
          id: 'plan',
          name: '規劃',
          steps: [
            { command: '/sdd', required: true },
            { command: '/tdd', required: true }
          ]
        }]
      };
      const availableCommands = ['/sdd', '/tdd', '/bdd'];

      // Act
      const errors = validateFlow(flow, { availableCommands });

      // Assert
      const cmdErrors = errors.filter(e => e.type === 'invalid_command');
      expect(cmdErrors).toHaveLength(0);
    });

    it('should report all invalid commands in one pass', () => {
      // Arrange
      const flow = {
        id: 'multi-bad',
        name: '多個錯誤命令',
        stages: [{
          id: 'plan',
          name: '規劃',
          steps: [
            { command: '/fake1', required: true },
            { command: '/sdd', required: true },
            { command: '/fake2', required: true }
          ]
        }]
      };
      const availableCommands = ['/sdd', '/tdd'];

      // Act
      const errors = validateFlow(flow, { availableCommands });

      // Assert
      const cmdErrors = errors.filter(e => e.type === 'invalid_command');
      expect(cmdErrors).toHaveLength(2);
      expect(cmdErrors[0].message).toMatch(/\/fake1/);
      expect(cmdErrors[1].message).toMatch(/\/fake2/);
    });
  });
});
