// [Source: docs/specs/SPEC-COMPILE-001-standards-as-hooks-compiler.md]
// TDD tests for base-compiler.js
// Pattern: AAA (Arrange-Act-Assert)

import { describe, it, expect } from 'vitest';
import { BaseCompiler } from '../../../src/compilers/base-compiler.js';

describe('SPEC-COMPILE-001 / REQ-1: 編譯器基類', () => {

  describe('AC-4: 編譯器介面', () => {
    it('should define a compile() method', () => {
      const compiler = new BaseCompiler();
      expect(typeof compiler.compile).toBe('function');
    });

    it('should throw when compile() is called on base class', () => {
      const compiler = new BaseCompiler();
      expect(() => compiler.compile([])).toThrow();
    });

    it('should define a filterEnforceable() method', () => {
      const compiler = new BaseCompiler();
      expect(typeof compiler.filterEnforceable).toBe('function');
    });

    it('should filter only standards with enforcement field', () => {
      const compiler = new BaseCompiler();
      const standards = [
        { id: 'commit-message', enforcement: { hook_script: 'a.js', trigger: 'PreToolUse', severity: 'error' } },
        { id: 'testing', /* no enforcement */ },
        { id: 'logging', enforcement: { hook_script: 'b.js', trigger: 'PostToolUse', severity: 'warning' } },
      ];

      const result = compiler.filterEnforceable(standards);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('commit-message');
      expect(result[1].id).toBe('logging');
    });

    it('should return empty array when no standards have enforcement', () => {
      const compiler = new BaseCompiler();
      const standards = [
        { id: 'testing' },
        { id: 'git-workflow' },
      ];

      const result = compiler.filterEnforceable(standards);
      expect(result).toHaveLength(0);
    });
  });

  describe('AC-4: 可擴展性', () => {
    it('should allow subclasses to override compile()', () => {
      class MockCompiler extends BaseCompiler {
        compile(standards) {
          return { target: 'mock', count: standards.length };
        }
      }

      const compiler = new MockCompiler();
      const result = compiler.compile([{ id: 'test' }]);

      expect(result.target).toBe('mock');
      expect(result.count).toBe(1);
    });
  });
});
