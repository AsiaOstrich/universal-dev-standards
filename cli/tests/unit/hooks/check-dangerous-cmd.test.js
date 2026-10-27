// [Source: docs/specs/SPEC-HOOKS-001-core-standard-hooks.md]
// [Generated] TDD skeleton for check-dangerous-cmd.mjs
// Pattern: AAA (Arrange-Act-Assert)

import { describe, it, expect } from 'vitest';

import { isDangerousCommand } from '../../../../scripts/hooks/check-dangerous-cmd.mjs';

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

    it('should detect "rm -rf" on the root and the home directory, in any flag order', () => {
      for (const cmd of ['rm -rf /', 'rm -fr /', 'rm -r -f /', 'rm -rf ~', 'rm -rf $HOME']) {
        expect(isDangerousCommand(cmd)).toBe(true);
      }
    });

    it('should not flag "rm -rf" on a path below the root (replay of 11,617 real shell calls: 25 of the 26 old matches were temp cleanups)', () => {
      // The old pattern `rm\s+-rf\s+\/` matched every absolute path. The rule now fires only when the
      // target is the root or the home directory itself. The end-to-end cases are in check-dangerous-cmd-entry.test.js.
      expect(isDangerousCommand('rm -rf /home')).toBe(false);
      expect(isDangerousCommand('rm -rf /tmp/x')).toBe(false);
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
