/**
 * Tests for SPEC-RELEASE-01: Build Manifest Utilities
 * AC Coverage: AC-4 (Build Manifest)
 * [Source: docs/specs/system/SPEC-RELEASE-01-manual-deployment-mode.md]
 */

import { describe, it, expect } from 'vitest';
import { createManifest, verifyManifest } from '../../../src/utils/build-manifest.js';

describe('build-manifest', () => {
  // ============================================================
  // AC-4: Build Manifest
  // ============================================================

  describe('createManifest', () => {
    it('should include all required fields', () => {
      // Arrange
      const input = { version: '1.2.0-rc.1', commit: 'a1b2c3d', builder: 'albert' };

      // Act
      const manifest = createManifest(input);

      // Assert
      expect(manifest).toHaveProperty('version', '1.2.0-rc.1');
      expect(manifest).toHaveProperty('commit', 'a1b2c3d');
      expect(manifest).toHaveProperty('build_date');
      expect(manifest).toHaveProperty('builder', 'albert');
      expect(manifest).toHaveProperty('checksum');
    });

    it('should generate ISO 8601 build_date', () => {
      // Arrange
      const input = { version: '1.2.0-rc.1', commit: 'abc123' };

      // Act
      const manifest = createManifest(input);

      // Assert
      expect(() => new Date(manifest.build_date)).not.toThrow();
      expect(new Date(manifest.build_date).toISOString()).toBe(manifest.build_date);
    });

    it('should include promotion fields initialized to null', () => {
      // Arrange
      const input = { version: '1.2.0-rc.1', commit: 'abc123' };

      // Act
      const manifest = createManifest(input);

      // Assert
      expect(manifest.promotion).toEqual({
        promoted_from: null,
        tested_on: null,
        test_result: null,
        test_date: null,
      });
    });

    it('should accept optional checksum', () => {
      // Arrange
      const input = { version: '1.0.0', commit: 'abc', checksum: 'sha256:custom' };

      // Act
      const manifest = createManifest(input);

      // Assert
      expect(manifest.checksum.package).toBe('sha256:custom');
    });

    it('should default checksum to null when not provided', () => {
      // Arrange
      const input = { version: '1.0.0', commit: 'abc' };

      // Act
      const manifest = createManifest(input);

      // Assert
      expect(manifest.checksum.package).toBeNull();
    });
  });

  describe('verifyManifest', () => {
    it('should pass when commit matches git tag', () => {
      // Arrange
      const manifest = { version: '1.2.0', commit: 'a1b2c3d' };
      const gitTagCommit = 'a1b2c3d';

      // Act
      const result = verifyManifest(manifest, gitTagCommit);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when commit does not match', () => {
      // Arrange
      const manifest = { version: '1.2.0', commit: 'a1b2c3d' };
      const gitTagCommit = 'x9y8z7w';

      // Act
      const result = verifyManifest(manifest, gitTagCommit);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.stringContaining('commit mismatch')
      );
    });

    it('should fail when manifest has no commit field', () => {
      // Arrange
      const manifest = { version: '1.2.0' };
      const gitTagCommit = 'a1b2c3d';

      // Act
      const result = verifyManifest(manifest, gitTagCommit);

      // Assert
      expect(result.valid).toBe(false);
    });
  });
});
