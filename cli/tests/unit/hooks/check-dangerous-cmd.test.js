// [Source: docs/specs/SPEC-HOOKS-001-core-standard-hooks.md]
// [Generated] TDD skeleton for check-dangerous-cmd.js
// Pattern: AAA (Arrange-Act-Assert)

import { describe, it, expect } from 'vitest';

import { isDangerousCommand } from '../../../../scripts/hooks/check-dangerous-cmd.js';

describe('SPEC-HOOKS-001 / REQ-2: 危險命令偵測 Hook', () => {
  // [Source: SPEC-HOOKS-001:AC-3]

  describe('AC-3: 偵測危險命令', () => {
    it('should detect "rm -rf /"', () => {
      // Arrange
      const cmd = 'rm -rf /';
      // Act
      const result = isDangerousCommand(cmd);
      // Assert
      expect(result).toBe(true);
    });

    it('should detect "rm -rf /home"', () => {
      expect(isDangerousCommand('rm -rf /home')).toBe(true);
    });

    it('should detect mkfs commands', () => {
      expect(isDangerousCommand('mkfs.ext4 /dev/sda1')).toBe(true);
    });

    it('should detect dd to device', () => {
      expect(isDangerousCommand('dd if=/dev/zero of=/dev/sda')).toBe(true);
    });

    it('should detect chmod 777 on root', () => {
      expect(isDangerousCommand('chmod -R 777 /')).toBe(true);
    });
  });

  describe('AC-3: 安全命令通過', () => {
    it('should allow "ls -la"', () => {
      // Arrange
      const cmd = 'ls -la';
      // Act
      const result = isDangerousCommand(cmd);
      // Assert
      expect(result).toBe(false);
    });

    it('should allow "npm test"', () => {
      expect(isDangerousCommand('npm test')).toBe(false);
    });

    it('should allow "git status"', () => {
      expect(isDangerousCommand('git status')).toBe(false);
    });

    it('should allow "cat file.txt"', () => {
      expect(isDangerousCommand('cat file.txt')).toBe(false);
    });

    it('should allow "rm -rf node_modules"', () => {
      // [Derived] rm -rf on non-root paths should be safe
      expect(isDangerousCommand('rm -rf node_modules')).toBe(false);
    });
  });
});
