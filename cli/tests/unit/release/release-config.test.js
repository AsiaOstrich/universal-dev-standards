/**
 * Tests for SPEC-RELEASE-01: Release Config Utilities
 * AC Coverage: AC-1 (Release Mode Config), AC-7 (Backward Compat), AC-8 (Default)
 * [Source: docs/specs/system/SPEC-RELEASE-01-manual-deployment-mode.md]
 */

import { describe, it, expect } from 'vitest';
import {
  parseReleaseConfig,
  getDefaultConfig,
  generateReleaseConfig,
  resolveReleaseWorkflow,
  VALID_MODES,
} from '../../../src/utils/release-config.js';

describe('release-config', () => {
  // ============================================================
  // AC-1: Release Mode Configuration
  // ============================================================

  describe('parseReleaseConfig', () => {
    it('should parse manual mode config', () => {
      // Arrange
      const raw = {
        release: {
          mode: 'manual',
          versioning: 'semver',
          pre_release_tag: 'rc',
        },
      };

      // Act
      const config = parseReleaseConfig(raw);

      // Assert
      expect(config.mode).toBe('manual');
      expect(config.preReleaseTag).toBe('rc');
      expect(config.versioning).toBe('semver');
    });

    it('should accept all three valid modes', () => {
      // Arrange & Act & Assert
      for (const mode of ['ci-cd', 'manual', 'hybrid']) {
        expect(() => parseReleaseConfig({ release: { mode } })).not.toThrow();
      }
    });

    it('should throw for invalid mode', () => {
      // Arrange & Act & Assert
      expect(() => parseReleaseConfig({ release: { mode: 'invalid' } })).toThrow();
    });

    it('should use default pre_release_tag rc for manual mode', () => {
      // Arrange
      const raw = { release: { mode: 'manual' } };

      // Act
      const config = parseReleaseConfig(raw);

      // Assert
      expect(config.preReleaseTag).toBe('rc');
    });

    it('should parse environments list', () => {
      // Arrange
      const raw = {
        release: {
          mode: 'manual',
          environments: [
            { name: 'staging', type: 'testing' },
            { name: 'production', type: 'production', requires_staging_pass: true },
          ],
        },
      };

      // Act
      const config = parseReleaseConfig(raw);

      // Assert
      expect(config.environments).toHaveLength(2);
      expect(config.environments[1].requires_staging_pass).toBe(true);
    });
  });

  // ============================================================
  // AC-8: Non-interactive Default
  // ============================================================

  describe('getDefaultConfig', () => {
    it('should default to ci-cd mode', () => {
      // Act
      const config = getDefaultConfig();

      // Assert
      expect(config.mode).toBe('ci-cd');
    });

    it('should default versioning to semver', () => {
      // Act
      const config = getDefaultConfig();

      // Assert
      expect(config.versioning).toBe('semver');
    });
  });

  describe('generateReleaseConfig', () => {
    it('should generate YAML-compatible object for manual mode', () => {
      // Act
      const config = generateReleaseConfig('manual');

      // Assert
      expect(config.release.mode).toBe('manual');
      expect(config.release.pre_release_tag).toBe('rc');
    });

    it('should generate YAML-compatible object for ci-cd mode', () => {
      // Act
      const config = generateReleaseConfig('ci-cd');

      // Assert
      expect(config.release.mode).toBe('ci-cd');
    });

    it('should include manual-specific fields only for manual/hybrid', () => {
      // Act
      const manual = generateReleaseConfig('manual');
      const cicd = generateReleaseConfig('ci-cd');

      // Assert
      expect(manual.release).toHaveProperty('manual');
      expect(manual.release).toHaveProperty('environments');
      expect(cicd.release).not.toHaveProperty('manual');
      expect(cicd.release).not.toHaveProperty('environments');
    });
  });

  // ============================================================
  // AC-7: Backward Compatibility — resolveReleaseWorkflow
  // ============================================================

  describe('resolveReleaseWorkflow', () => {
    it('should resolve ci-cd workflow when mode is ci-cd', () => {
      // Arrange
      const config = { release: { mode: 'ci-cd' } };

      // Act
      const workflow = resolveReleaseWorkflow(config);

      // Assert
      expect(workflow.type).toBe('ci-cd');
      expect(workflow.hasPromote).toBe(false);
      expect(workflow.hasDeploy).toBe(false);
      expect(workflow.hasManifest).toBe(false);
    });

    it('should default to ci-cd when config is null', () => {
      // Act
      const workflow = resolveReleaseWorkflow(null);

      // Assert
      expect(workflow.type).toBe('ci-cd');
    });

    it('should default to ci-cd when config is undefined', () => {
      // Act
      const workflow = resolveReleaseWorkflow(undefined);

      // Assert
      expect(workflow.type).toBe('ci-cd');
    });

    it('should enable manual subcommands when mode is manual', () => {
      // Arrange
      const config = { release: { mode: 'manual' } };

      // Act
      const workflow = resolveReleaseWorkflow(config);

      // Assert
      expect(workflow.type).toBe('manual');
      expect(workflow.hasPromote).toBe(true);
      expect(workflow.hasDeploy).toBe(true);
      expect(workflow.hasManifest).toBe(true);
    });

    it('should enable manual subcommands when mode is hybrid', () => {
      // Arrange
      const config = { release: { mode: 'hybrid' } };

      // Act
      const workflow = resolveReleaseWorkflow(config);

      // Assert
      expect(workflow.type).toBe('hybrid');
      expect(workflow.hasPromote).toBe(true);
      expect(workflow.hasDeploy).toBe(true);
    });
  });

  describe('VALID_MODES', () => {
    it('should export exactly three valid modes', () => {
      expect(VALID_MODES).toEqual(['ci-cd', 'manual', 'hybrid']);
    });
  });
});
