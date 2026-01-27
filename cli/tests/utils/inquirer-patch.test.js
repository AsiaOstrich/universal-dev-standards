/**
 * Tests for inquirer-patch.js
 *
 * Tests the monkey-patching of inquirer checkbox to support
 * the `instructions: false` option for hiding default English hints.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  patchCheckboxInstructions,
  isPatchApplied,
  resetPatchState
} from '../../src/utils/inquirer-patch.js';

describe('inquirer-patch', () => {
  beforeEach(() => {
    // Reset patch state before each test
    resetPatchState();
  });

  describe('patchCheckboxInstructions()', () => {
    it('should apply patch successfully', () => {
      // Arrange
      expect(isPatchApplied()).toBe(false);

      // Act
      patchCheckboxInstructions();

      // Assert
      expect(isPatchApplied()).toBe(true);
    });

    it('should be idempotent (multiple calls do not cause errors)', () => {
      // Arrange & Act
      patchCheckboxInstructions();
      patchCheckboxInstructions();
      patchCheckboxInstructions();

      // Assert - should still be true, no errors thrown
      expect(isPatchApplied()).toBe(true);
    });

    it('should only apply patch once', () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Act
      patchCheckboxInstructions();
      const firstState = isPatchApplied();
      patchCheckboxInstructions();
      const secondState = isPatchApplied();

      // Assert
      expect(firstState).toBe(true);
      expect(secondState).toBe(true);
      // No warning should be logged for subsequent calls (it silently skips)
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('isPatchApplied()', () => {
    it('should return false before patch is applied', () => {
      expect(isPatchApplied()).toBe(false);
    });

    it('should return true after patch is applied', () => {
      patchCheckboxInstructions();
      expect(isPatchApplied()).toBe(true);
    });
  });

  describe('resetPatchState()', () => {
    it('should reset the patch applied flag', () => {
      // Arrange
      patchCheckboxInstructions();
      expect(isPatchApplied()).toBe(true);

      // Act
      resetPatchState();

      // Assert
      expect(isPatchApplied()).toBe(false);
    });
  });

  describe('PatchedCheckboxPrompt behavior', () => {
    it('should properly extend checkbox prompt when patch is applied', async () => {
      // Arrange
      patchCheckboxInstructions();

      // Act - Import inquirer after patch
      const inquirer = await import('inquirer');

      // Assert - The checkbox prompt should be registered
      expect(inquirer.default.prompt.prompts.checkbox).toBeDefined();
    });
  });
});
