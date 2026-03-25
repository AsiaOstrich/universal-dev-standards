/**
 * Tests for SPEC-RELEASE-01: Manual Deployment Release Mode
 * Generated from: docs/specs/system/SPEC-RELEASE-01-manual-deployment-mode.md
 * Generated at: 2026-03-25T00:00:00Z
 * AC Coverage: AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8
 *
 * This file serves as the integration index for all AC tests.
 * Individual AC tests are in dedicated files:
 *   - version-promote.test.js  → AC-2, AC-3
 *   - release-config.test.js   → AC-1, AC-7, AC-8
 *   - build-manifest.test.js   → AC-4
 *   - deployment-tracker.test.js → AC-5, AC-6
 */

import { describe, it, expect } from 'vitest';
import { parseRCVersion, promoteVersion, formatGitTag, incrementRC, createPromotionRecord } from '../../../src/utils/version-promote.js';
import { parseReleaseConfig, getDefaultConfig, generateReleaseConfig, resolveReleaseWorkflow } from '../../../src/utils/release-config.js';
import { createManifest, verifyManifest } from '../../../src/utils/build-manifest.js';
import { recordDeployment, updateDeploymentResult, checkDeploymentReadiness } from '../../../src/utils/deployment-tracker.js';

describe('SPEC-RELEASE-01: Manual Deployment Release Mode (Integration)', () => {
  // AC-1: Release Mode Configuration
  describe('AC-1: Release Mode Configuration', () => {
    it('should parse manual mode config', () => {
      const config = parseReleaseConfig({ release: { mode: 'manual', pre_release_tag: 'rc' } });
      expect(config.mode).toBe('manual');
      expect(config.preReleaseTag).toBe('rc');
    });

    it('should validate three release modes', () => {
      for (const mode of ['ci-cd', 'manual', 'hybrid']) {
        expect(() => parseReleaseConfig({ release: { mode } })).not.toThrow();
      }
      expect(() => parseReleaseConfig({ release: { mode: 'invalid' } })).toThrow();
    });

    it('should generate config with manual-specific fields', () => {
      const config = generateReleaseConfig('manual');
      expect(config.release.mode).toBe('manual');
      expect(config.release.pre_release_tag).toBe('rc');
    });
  });

  // AC-8: Non-interactive Default
  describe('AC-8: Non-interactive Default to CI/CD', () => {
    it('should default to ci-cd mode', () => {
      const config = getDefaultConfig();
      expect(config.mode).toBe('ci-cd');
    });
  });

  // AC-2: RC Version Lifecycle
  describe('AC-2: RC Version Lifecycle', () => {
    it('should parse RC version', () => {
      const parsed = parseRCVersion('1.2.0-rc.1');
      expect(parsed.major).toBe(1);
      expect(parsed.preRelease).toBe('rc');
      expect(parsed.preReleaseNumber).toBe(1);
    });

    it('should increment RC', () => {
      expect(incrementRC('1.2.0-rc.1')).toBe('1.2.0-rc.2');
    });

    it('should format git tag', () => {
      expect(formatGitTag('1.2.0-rc.1')).toBe('v1.2.0-rc.1');
    });
  });

  // AC-3: RC Promotion to Stable
  describe('AC-3: RC Promotion to Stable', () => {
    it('should promote RC to stable', () => {
      expect(promoteVersion('1.2.0-rc.2')).toBe('1.2.0');
    });

    it('should record promotion source', () => {
      const record = createPromotionRecord('1.2.0-rc.2', '1.2.0');
      expect(record.promoted_from).toBe('1.2.0-rc.2');
      expect(record.version).toBe('1.2.0');
    });
  });

  // AC-4: Build Manifest
  describe('AC-4: Build Manifest', () => {
    it('should create manifest with required fields', () => {
      const manifest = createManifest({ version: '1.2.0-rc.1', commit: 'a1b2c3d' });
      expect(manifest.version).toBe('1.2.0-rc.1');
      expect(manifest.commit).toBe('a1b2c3d');
      expect(manifest).toHaveProperty('build_date');
    });

    it('should verify matching commit', () => {
      const result = verifyManifest({ version: '1.2.0', commit: 'abc' }, 'abc');
      expect(result.valid).toBe(true);
    });

    it('should fail on commit mismatch', () => {
      const result = verifyManifest({ version: '1.2.0', commit: 'abc' }, 'xyz');
      expect(result.valid).toBe(false);
    });
  });

  // AC-5: Deployment Tracking
  describe('AC-5: Deployment Tracking', () => {
    it('should record deployment', () => {
      const record = recordDeployment({ version: '1.2.0-rc.1', environment: 'staging', deployer: 'albert' });
      expect(record.version).toBe('1.2.0-rc.1');
      expect(record.environment).toBe('staging');
      expect(record).toHaveProperty('date');
    });

    it('should update test result', () => {
      const deployments = [{ version: '1.2.0-rc.1', environment: 'staging', result: null }];
      const updated = updateDeploymentResult(deployments, { version: '1.2.0-rc.1', environment: 'staging', result: 'passed' });
      expect(updated[0].result).toBe('passed');
    });
  });

  // AC-6: Production Deployment Warning
  describe('AC-6: Production Deployment Warning', () => {
    it('should warn without staging pass', () => {
      const warnings = checkDeploymentReadiness([], { version: '1.2.0', environment: 'production' });
      expect(warnings.length).toBeGreaterThan(0);
    });

    it('should not warn with staging pass', () => {
      const deployments = [{ version: '1.2.0-rc.1', environment: 'staging', result: 'passed' }];
      const warnings = checkDeploymentReadiness(deployments, { version: '1.2.0', environment: 'production' });
      expect(warnings).toHaveLength(0);
    });
  });

  // AC-7: CI/CD Mode Backward Compatibility
  describe('AC-7: CI/CD Mode Backward Compatibility', () => {
    it('should use ci-cd workflow for ci-cd mode', () => {
      const workflow = resolveReleaseWorkflow({ release: { mode: 'ci-cd' } });
      expect(workflow.type).toBe('ci-cd');
      expect(workflow.hasPromote).toBe(false);
    });

    it('should default to ci-cd when no config', () => {
      const workflow = resolveReleaseWorkflow(null);
      expect(workflow.type).toBe('ci-cd');
    });

    it('should enable manual features for manual mode', () => {
      const workflow = resolveReleaseWorkflow({ release: { mode: 'manual' } });
      expect(workflow.type).toBe('manual');
      expect(workflow.hasPromote).toBe(true);
      expect(workflow.hasDeploy).toBe(true);
      expect(workflow.hasManifest).toBe(true);
    });
  });
});
