/**
 * Tests for SPEC-FLOW-001: Gate Loader & Checker
 * AC Coverage: AC-7, AC-8, AC-9
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadGate, loadInlineGate } from '../../../src/flow/gate-loader.js';
import { checkGate } from '../../../src/flow/gate-checker.js';
import { validateGateRemoval } from '../../../src/flow/gate-checker.js';

describe('SPEC-FLOW-001: Gate Loader', () => {
  // ============================================================
  // AC-7: 獨立閘門定義可被引用和執行
  // ============================================================
  describe('AC-7: 獨立閘門引用與載入', () => {
    it('should load gate definition from YAML content', () => {
      // Arrange
      const gateYaml = `
id: security-gate
name: "安全閘門"
type: blocking
checks:
  - run: "npm audit --audit-level=high"
    expect: exit_code_0
on_failure:
  message: "存在高危安全漏洞"
  suggest:
    - "/security"
    - "/scan"
`;

      // Act
      const gate = loadGate(gateYaml);

      // Assert
      expect(gate.id).toBe('security-gate');
      expect(gate.name).toBe('安全閘門');
      expect(gate.type).toBe('blocking');
      expect(gate.checks).toHaveLength(1);
      expect(gate.checks[0].run).toBe('npm audit --audit-level=high');
      expect(gate.checks[0].expect).toBe('exit_code_0');
      expect(gate.on_failure.message).toBe('存在高危安全漏洞');
      expect(gate.on_failure.suggest).toEqual(['/security', '/scan']);
    });

    it('should throw error when gate missing required fields', () => {
      const badGateYaml = `
name: "缺少 id"
type: blocking
`;

      expect(() => loadGate(badGateYaml)).toThrow(/id/i);
    });

    it('should throw error when gate has no checks', () => {
      const noChecksYaml = `
id: empty-gate
name: "無 checks"
type: blocking
`;

      expect(() => loadGate(noChecksYaml)).toThrow(/checks/i);
    });

    it('should load inline gate definition from object', () => {
      // Arrange
      const inlineGate = {
        type: 'warning',
        run: 'npm run lint',
        expect: 'exit_code_0'
      };

      // Act
      const gate = loadInlineGate(inlineGate);

      // Assert
      expect(gate.type).toBe('warning');
      expect(gate.checks).toHaveLength(1);
      expect(gate.checks[0].run).toBe('npm run lint');
    });

    it('should default removable to true', () => {
      const gateYaml = `
id: default-gate
name: "預設閘門"
type: blocking
checks:
  - run: "echo ok"
    expect: exit_code_0
`;

      const gate = loadGate(gateYaml);
      expect(gate.removable).toBe(true);
    });

    it('should preserve removable: false', () => {
      const gateYaml = `
id: mandatory-gate
name: "強制閘門"
type: blocking
removable: false
checks:
  - run: "npm test"
    expect: exit_code_0
`;

      const gate = loadGate(gateYaml);
      expect(gate.removable).toBe(false);
    });
  });
});

describe('SPEC-FLOW-001: Gate Checker', () => {
  // ============================================================
  // AC-8: Blocking/Warning 閘門行為正確
  // ============================================================
  describe('AC-8: 閘門檢查行為', () => {
    it('should return passed:true when check command succeeds', async () => {
      // Arrange
      const gate = {
        id: 'pass-gate',
        type: 'blocking',
        checks: [{ run: 'echo ok', expect: 'exit_code_0' }]
      };
      const executor = vi.fn().mockResolvedValue({ exitCode: 0, stdout: 'ok' });

      // Act
      const result = await checkGate(gate, { executor });

      // Assert
      expect(result.passed).toBe(true);
      expect(result.blocking).toBe(true);
    });

    it('should return passed:false and blocking:true when blocking gate fails', async () => {
      // Arrange
      const gate = {
        id: 'fail-gate',
        type: 'blocking',
        checks: [{ run: 'npm audit', expect: 'exit_code_0' }],
        on_failure: {
          message: '安全檢查未通過',
          suggest: ['/security']
        }
      };
      const executor = vi.fn().mockResolvedValue({ exitCode: 1, stdout: 'found vulnerabilities' });

      // Act
      const result = await checkGate(gate, { executor });

      // Assert
      expect(result.passed).toBe(false);
      expect(result.blocking).toBe(true);
      expect(result.message).toBe('安全檢查未通過');
      expect(result.suggest).toEqual(['/security']);
    });

    it('should return passed:false and blocking:false when warning gate fails', async () => {
      // Arrange
      const gate = {
        id: 'warn-gate',
        type: 'warning',
        checks: [{ run: 'npm run lint', expect: 'exit_code_0' }]
      };
      const executor = vi.fn().mockResolvedValue({ exitCode: 1, stdout: 'warnings found' });

      // Act
      const result = await checkGate(gate, { executor });

      // Assert
      expect(result.passed).toBe(false);
      expect(result.blocking).toBe(false);
    });

    it('should return passed:false with timeout error when check exceeds timeout', async () => {
      // Arrange
      const gate = {
        id: 'slow-gate',
        type: 'blocking',
        checks: [{ run: 'sleep 999', expect: 'exit_code_0', timeout: 1 }]
      };
      const executor = vi.fn().mockRejectedValue(new Error('TIMEOUT'));

      // Act
      const result = await checkGate(gate, { executor });

      // Assert
      expect(result.passed).toBe(false);
      expect(result.error).toMatch(/timeout/i);
    });

    it('should use default timeout of 30 seconds when not specified', async () => {
      // Arrange
      const gate = {
        id: 'default-timeout-gate',
        type: 'blocking',
        checks: [{ run: 'echo ok', expect: 'exit_code_0' }]
      };
      const executor = vi.fn().mockResolvedValue({ exitCode: 0 });

      // Act
      await checkGate(gate, { executor, defaultTimeout: 30 });

      // Assert
      expect(executor).toHaveBeenCalledWith('echo ok', expect.objectContaining({ timeout: 30 }));
    });

    it('should cap timeout at 600 seconds', async () => {
      // Arrange
      const gate = {
        id: 'over-timeout-gate',
        type: 'blocking',
        checks: [{ run: 'echo ok', expect: 'exit_code_0', timeout: 9999 }]
      };
      const executor = vi.fn().mockResolvedValue({ exitCode: 0 });

      // Act
      await checkGate(gate, { executor });

      // Assert
      expect(executor).toHaveBeenCalledWith('echo ok', expect.objectContaining({ timeout: 600 }));
    });

    it('should pass all checks in sequence', async () => {
      // Arrange
      const gate = {
        id: 'multi-check-gate',
        type: 'blocking',
        checks: [
          { run: 'npm test', expect: 'exit_code_0' },
          { run: 'npm run lint', expect: 'exit_code_0' }
        ]
      };
      const executor = vi.fn().mockResolvedValue({ exitCode: 0 });

      // Act
      const result = await checkGate(gate, { executor });

      // Assert
      expect(result.passed).toBe(true);
      expect(executor).toHaveBeenCalledTimes(2);
    });

    it('should stop on first failing check', async () => {
      // Arrange
      const gate = {
        id: 'fail-early-gate',
        type: 'blocking',
        checks: [
          { run: 'npm test', expect: 'exit_code_0' },
          { run: 'npm run lint', expect: 'exit_code_0' }
        ]
      };
      const executor = vi.fn().mockResolvedValueOnce({ exitCode: 1 });

      // Act
      const result = await checkGate(gate, { executor });

      // Assert
      expect(result.passed).toBe(false);
      expect(executor).toHaveBeenCalledTimes(1);
    });

    it('should handle info type gate (always pass)', async () => {
      const gate = {
        id: 'info-gate',
        type: 'info',
        checks: [{ run: 'echo stats', expect: 'exit_code_0' }]
      };
      const executor = vi.fn().mockResolvedValue({ exitCode: 1 });

      const result = await checkGate(gate, { executor });

      expect(result.passed).toBe(true);
      expect(result.blocking).toBe(false);
    });
  });

  // ============================================================
  // AC-9: 不可移除閘門保護
  // ============================================================
  describe('AC-9: 不可移除閘門', () => {
    it('should return error when trying to remove non-removable gate', () => {
      // Arrange
      const baseGates = [
        { id: 'mandatory-gate', type: 'blocking', removable: false, checks: [] },
        { id: 'optional-gate', type: 'warning', removable: true, checks: [] }
      ];
      const removedGateIds = ['mandatory-gate'];

      // Act
      const errors = validateGateRemoval(baseGates, removedGateIds);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(/mandatory-gate/);
      expect(errors[0].message).toMatch(/強制要求|不可移除/);
    });

    it('should allow removal of gate with removable: true', () => {
      const baseGates = [
        { id: 'optional-gate', type: 'warning', removable: true, checks: [] }
      ];
      const removedGateIds = ['optional-gate'];

      const errors = validateGateRemoval(baseGates, removedGateIds);

      expect(errors).toHaveLength(0);
    });

    it('should allow removal of gate with default removable (true)', () => {
      const baseGates = [
        { id: 'default-gate', type: 'warning', checks: [] }
      ];
      const removedGateIds = ['default-gate'];

      const errors = validateGateRemoval(baseGates, removedGateIds);

      expect(errors).toHaveLength(0);
    });
  });
});
