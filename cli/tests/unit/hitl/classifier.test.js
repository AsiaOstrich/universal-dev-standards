import { describe, it, expect } from 'vitest';
import { RiskClassifier } from '../../../src/hitl/classifier.js';

describe('RiskClassifier', () => {
  const classifier = new RiskClassifier();

  it('should classify restricted operations (Level 4)', () => {
    expect(classifier.classify('rm -rf /')).toBe(4);
    expect(classifier.classify('DROP TABLE users')).toBe(4);
    expect(classifier.classify('git push origin main --force')).toBe(4);
  });

  it('should classify critical operations (Level 3)', () => {
    expect(classifier.classify('delete file src/main.js')).toBe(3);
    expect(classifier.classify('deploy to production')).toBe(3);
    expect(classifier.classify('update auth_token')).toBe(3);
    expect(classifier.classify('rm file.txt')).toBe(3);
  });

  it('should classify elevated operations (Level 2)', () => {
    expect(classifier.classify('npm install react')).toBe(2);
    expect(classifier.classify('config set hitl.threshold 0')).toBe(2);
    expect(classifier.classify('chmod +x script.sh')).toBe(2);
  });

  it('should classify standard operations (Level 1)', () => {
    expect(classifier.classify('write to README.md')).toBe(1);
    expect(classifier.classify('git commit -m "fix"')).toBe(1);
    expect(classifier.classify('mkdir new-dir')).toBe(1);
  });

  it('should classify routine operations (Level 0)', () => {
    expect(classifier.classify('read file.txt')).toBe(0);
    expect(classifier.classify('ls -la')).toBe(0);
    expect(classifier.classify('grep "TODO" .')).toBe(0);
  });

  it('should default to Level 1 for unknown operations', () => {
    expect(classifier.classify('dance on the table')).toBe(1);
    expect(classifier.classify('')).toBe(1);
  });
});
