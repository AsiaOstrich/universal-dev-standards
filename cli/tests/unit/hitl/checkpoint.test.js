import { describe, it, expect } from 'vitest';
import { Checkpoint } from '../../../src/hitl/checkpoint.js';

describe('Checkpoint', () => {
  const checkpoint = new Checkpoint();
  const defaultConfig = {
    threshold: 2,
    overrides: [],
    'always-prompt': [],
    'never-prompt': []
  };

  it('should approve when risk < threshold', () => {
    // Risk 1 (Standard) < Threshold 2 (Elevated) -> Approve
    expect(checkpoint.evaluate(1, defaultConfig, 'write file')).toBe('approve');
  });

  it('should prompt when risk >= threshold', () => {
    // Risk 2 (Elevated) >= Threshold 2 -> Prompt
    expect(checkpoint.evaluate(2, defaultConfig, 'npm install')).toBe('prompt');
    // Risk 3 (Critical) >= Threshold 2 -> Prompt
    expect(checkpoint.evaluate(3, defaultConfig, 'delete file')).toBe('prompt');
  });

  it('should always prompt for restricted operations (Level 4)', () => {
    // Even if threshold is 5 (impossible), Level 4 should prompt/deny
    const looseConfig = { threshold: 5 }; 
    expect(checkpoint.evaluate(4, looseConfig, 'rm -rf')).toBe('prompt');
  });

  it('should respect always-prompt list', () => {
    const config = {
      ...defaultConfig,
      'always-prompt': ['deploy']
    };
    // Risk 1 normally approves, but 'deploy' is in always-prompt
    expect(checkpoint.evaluate(1, config, 'deploy to dev')).toBe('prompt');
  });

  it('should respect never-prompt list', () => {
    const config = {
      threshold: 1, // Strict
      'never-prompt': ['log']
    };
    // Risk 1 >= Threshold 1 normally prompts, but 'log' is in never-prompt
    expect(checkpoint.evaluate(1, config, 'write log')).toBe('approve');
  });

  it('should apply overrides', () => {
    const config = {
      threshold: 2,
      overrides: [
        { pattern: 'test', threshold: 0 } // Very Strict for tests
      ]
    };
    // Risk 1 < Threshold 2 (Global) -> Approve
    // But pattern 'test' matches -> Threshold becomes 0
    // Risk 1 >= Threshold 0 -> Prompt
    expect(checkpoint.evaluate(1, config, 'run test')).toBe('prompt');
  });
});
