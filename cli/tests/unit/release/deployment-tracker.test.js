/**
 * Tests for SPEC-RELEASE-01: Deployment Tracker Utilities
 * AC Coverage: AC-5 (Deployment Tracking), AC-6 (Production Warning)
 * [Source: docs/specs/system/SPEC-RELEASE-01-manual-deployment-mode.md]
 */

import { describe, it, expect } from 'vitest';
import {
  recordDeployment,
  updateDeploymentResult,
  checkDeploymentReadiness,
} from '../../../src/utils/deployment-tracker.js';

describe('deployment-tracker', () => {
  // ============================================================
  // AC-5: Deployment Tracking
  // ============================================================

  describe('recordDeployment', () => {
    it('should create record with required fields', () => {
      // Arrange
      const input = {
        version: '1.2.0-rc.1',
        environment: 'staging',
        deployer: 'albert',
      };

      // Act
      const record = recordDeployment(input);

      // Assert
      expect(record.version).toBe('1.2.0-rc.1');
      expect(record.environment).toBe('staging');
      expect(record.deployer).toBe('albert');
      expect(record).toHaveProperty('date');
      expect(record.result).toBeNull();
    });

    it('should accept optional result at creation time', () => {
      // Arrange
      const input = {
        version: '1.2.0',
        environment: 'production',
        deployer: 'albert',
        result: 'deployed',
      };

      // Act
      const record = recordDeployment(input);

      // Assert
      expect(record.result).toBe('deployed');
    });

    it('should accept optional notes', () => {
      // Arrange
      const input = {
        version: '1.2.0-rc.1',
        environment: 'staging',
        deployer: 'albert',
        notes: '所有驗收測試通過',
      };

      // Act
      const record = recordDeployment(input);

      // Assert
      expect(record.notes).toBe('所有驗收測試通過');
    });

    it('should generate ISO 8601 date', () => {
      // Arrange
      const input = { version: '1.0.0', environment: 'staging', deployer: 'test' };

      // Act
      const record = recordDeployment(input);

      // Assert
      expect(new Date(record.date).toISOString()).toBe(record.date);
    });
  });

  describe('updateDeploymentResult', () => {
    it('should update result for matching version and environment', () => {
      // Arrange
      const deployments = [
        { version: '1.2.0-rc.1', environment: 'staging', result: null, date: '2026-03-25T10:00:00.000Z' },
      ];

      // Act
      const updated = updateDeploymentResult(deployments, {
        version: '1.2.0-rc.1',
        environment: 'staging',
        result: 'passed',
      });

      // Assert
      expect(updated[0].result).toBe('passed');
    });

    it('should not modify other deployments', () => {
      // Arrange
      const deployments = [
        { version: '1.1.0', environment: 'production', result: 'deployed', date: '2026-03-20T10:00:00.000Z' },
        { version: '1.2.0-rc.1', environment: 'staging', result: null, date: '2026-03-25T10:00:00.000Z' },
      ];

      // Act
      const updated = updateDeploymentResult(deployments, {
        version: '1.2.0-rc.1',
        environment: 'staging',
        result: 'passed',
      });

      // Assert
      expect(updated[0].result).toBe('deployed'); // unchanged
      expect(updated[1].result).toBe('passed');
    });

    it('should return deployments unchanged if no match found', () => {
      // Arrange
      const deployments = [
        { version: '1.0.0', environment: 'staging', result: null },
      ];

      // Act
      const updated = updateDeploymentResult(deployments, {
        version: '2.0.0',
        environment: 'staging',
        result: 'passed',
      });

      // Assert
      expect(updated[0].result).toBeNull();
    });
  });

  // ============================================================
  // AC-6: Production Deployment Warning
  // ============================================================

  describe('checkDeploymentReadiness', () => {
    it('should warn when no staging pass exists', () => {
      // Arrange
      const deployments = [
        { version: '1.2.0-rc.1', environment: 'staging', result: null },
      ];
      const target = { version: '1.2.0', environment: 'production' };

      // Act
      const warnings = checkDeploymentReadiness(deployments, target);

      // Assert
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings).toContainEqual(
        expect.stringContaining('staging verification is missing')
      );
    });

    it('should not warn when staging passed', () => {
      // Arrange
      const deployments = [
        { version: '1.2.0-rc.1', environment: 'staging', result: 'passed' },
      ];
      const target = { version: '1.2.0', environment: 'production' };

      // Act
      const warnings = checkDeploymentReadiness(deployments, target);

      // Assert
      expect(warnings).toHaveLength(0);
    });

    it('should not warn for non-production deployments', () => {
      // Arrange
      const deployments = [];
      const target = { version: '1.2.0-rc.1', environment: 'staging' };

      // Act
      const warnings = checkDeploymentReadiness(deployments, target);

      // Assert
      expect(warnings).toHaveLength(0);
    });

    it('should warn when staging result is failed', () => {
      // Arrange
      const deployments = [
        { version: '1.2.0-rc.1', environment: 'staging', result: 'failed' },
      ];
      const target = { version: '1.2.0', environment: 'production' };

      // Act
      const warnings = checkDeploymentReadiness(deployments, target);

      // Assert
      expect(warnings.length).toBeGreaterThan(0);
    });
  });
});
