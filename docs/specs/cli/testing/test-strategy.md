# [TEST-00] CLI Test Strategy Specification / CLI 測試策略規格

**Version**: 1.0.0
**Last Updated**: 2026-01-25
**Status**: Approved
**Spec ID**: TEST-00

---

## Summary

This specification defines the testing architecture, execution strategy, and coverage requirements for the UDS CLI. The system follows the testing pyramid principle with optimized test suites for different development scenarios.

本規格定義 UDS CLI 的測試架構、執行策略和覆蓋率要求。該系統遵循測試金字塔原則，並針對不同開發場景提供優化的測試套件。

---

## Motivation

### Problem Statement / 問題陳述

1. Full test suite takes ~6 minutes, too slow for rapid development
2. No clear distinction between unit, integration, and E2E tests
3. AI agents need guidance on which tests to run for different scenarios
4. Cross-platform testing requirements are not documented

### Solution / 解決方案

A comprehensive test strategy that:
- Defines testing pyramid with 70/20/10 ratio
- Provides quick test suite (<6 seconds) for rapid feedback
- Documents test discovery and execution patterns
- Ensures cross-platform compatibility (macOS, Linux, Windows)

---

## Detailed Design

### Source Directories

| Directory | Purpose |
|-----------|---------|
| `cli/tests/unit/` | Unit tests (~700 tests) |
| `cli/tests/commands/` | Integration tests (~150 tests) |
| `cli/tests/e2e/` | End-to-end tests (~50 tests) |

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CLI Test Architecture                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  TESTING PYRAMID                                                    │
│                                                                     │
│            /\            <- E2E (10%, ~50 tests)                   │
│           /  \              Spawn CLI subprocess                   │
│          /    \             Full workflow validation               │
│         /------\         <- Integration (20%, ~150 tests)          │
│        /        \           Command handler tests                  │
│       /----------\          Multi-module interactions              │
│      /            \      <- Unit (70%, ~700 tests)                 │
│     /--------------\        Single function/class                  │
│    /________________\       Isolated, mocked deps                  │
│                                                                     │
│  TEST SUITES                                                        │
│  ├── Quick (test:quick)     - Unit only, <6 seconds                │
│  ├── Fast (test:fast)       - Unit + Integration, <10 seconds      │
│  ├── Unit (test:unit)       - Unit tests only                      │
│  └── Full (test)            - All tests, ~6 minutes                │
│                                                                     │
│  FRAMEWORK                                                          │
│  └── Vitest 4.x                                                    │
│       ├── describe/it/expect API                                   │
│       ├── vi.mock() for mocking                                    │
│       └── --reporter=dot for CI                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Test Categories

#### Unit Tests (`cli/tests/unit/`)

| Subdirectory | Purpose | Test Count |
|--------------|---------|------------|
| `core/` | Error handling, manifest, paths | ~80 |
| `utils/` | Copier, detector, hasher, registry | ~200 |
| `config/` | AI agent paths, configuration | ~50 |
| `i18n/` | Message system | ~40 |

**Characteristics:**
- Isolated, no external dependencies
- Mock file system, network calls
- Fast execution (<1ms per test)
- Test single function behavior

#### Integration Tests (`cli/tests/commands/`)

| File | Purpose | Test Count |
|------|---------|------------|
| `init.test.js` | Init command flow | ~40 |
| `check.test.js` | Check command flow | ~35 |
| `update.test.js` | Update command flow | ~30 |
| `configure.test.js` | Configure command flow | ~25 |
| `list.test.js` | List command flow | ~15 |

**Characteristics:**
- Test command handler logic
- Mock CLI output, prompts
- Medium execution time (~10ms per test)
- Test multi-module interactions

#### E2E Tests (`cli/tests/e2e/`)

| File | Purpose | Test Count |
|------|---------|------------|
| `cli-lifecycle.test.js` | Full init→update→check flow | ~20 |
| `skills-installation.test.js` | Skills installation flow | ~15 |
| `cross-platform.test.js` | Platform-specific paths | ~15 |

**Characteristics:**
- Spawn actual CLI subprocess
- Use real temp directories
- Slow execution (~5s per test)
- Validate complete user workflows

### npm Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest watch",
    "test:quick": "vitest run tests/unit/",
    "test:unit": "vitest run --exclude tests/e2e/",
    "test:fast": "vitest run --exclude tests/e2e/",
    "test:discover": "node scripts/test-discovery.mjs",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Test Execution Times

| Suite | Command | Tests | Time |
|-------|---------|-------|------|
| Quick | `npm run test:quick` | ~700 | <6s |
| Unit | `npm run test:unit` | ~850 | <10s |
| Full | `npm test` | ~1000 | ~6min |
| Watch | `npm run test:watch` | - | - |

### Mock Strategy

```javascript
// File system mocking
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn()
  };
});

// Network mocking
vi.mock('node-fetch', () => ({
  default: vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({})
  })
}));

// Prompt mocking
vi.mock('@inquirer/prompts', () => ({
  select: vi.fn().mockResolvedValue('default'),
  confirm: vi.fn().mockResolvedValue(true)
}));
```

### CI/CD Integration

```yaml
# .github/workflows/test.yml
jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        node: [18, 20, 22]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
      - run: cd cli && npm ci
      - run: cd cli && npm test
```

### Pre-commit Hook

```bash
#!/bin/bash
# cli/.husky/pre-commit

cd cli

# Run unit tests only (fast)
npm run test:unit

# Lint with auto-fix
npx lint-staged
```

---

## Acceptance Criteria

### AC-1: Testing Pyramid Ratio Maintained

**Given** the CLI test suite
**When** test counts are analyzed
**Then**
  - Unit tests comprise ~70% of total tests
  - Integration tests comprise ~20% of total tests
  - E2E tests comprise ~10% of total tests
  - Total test count exceeds 900

### AC-2: Quick Test Suite Under 6 Seconds

**Given** the quick test suite (`npm run test:quick`)
**When** executed on standard hardware
**Then**
  - Execution completes in under 6 seconds
  - All unit tests are included
  - E2E tests are excluded
  - Exit code 0 on all tests passing

### AC-3: New Features Have Corresponding Tests

**Given** a new feature or bug fix is implemented
**When** the change is committed
**Then**
  - New unit tests exist for new functions
  - Integration tests exist for new command flows
  - Pre-commit hook validates tests pass
  - Coverage does not decrease

### AC-4: Cross-platform Tests Pass

**Given** the full test suite
**When** executed on macOS, Linux, and Windows
**Then**
  - All tests pass on all platforms
  - Path handling is platform-agnostic
  - File operations work correctly
  - CI matrix validates all combinations

---

## Dependencies

| Dependency | Purpose | Version |
|------------|---------|---------|
| Vitest | Test framework | ^4.0.16 |
| @vitest/coverage-v8 | Coverage reporting | ^4.0.16 |
| lint-staged | Pre-commit linting | ^15.2.0 |
| husky | Git hooks | ^9.0.11 |

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| E2E test flakiness | Medium | Low | Retry logic, isolated temp dirs |
| Slow test drift | Medium | Medium | CI time monitoring, alerts |
| Platform-specific failures | Low | Medium | CI matrix testing |
| Mock drift from reality | Medium | Medium | Periodic real-world validation |

---

## Related Specifications

- [SHARED-09 Error Handling](../shared/error-handling.md) - Error types for testing
- [Testing Standards](../../../../core/testing-standards.md) - Project testing principles

---

## Implementation Notes

### Test Discovery Tool

```javascript
// cli/scripts/test-discovery.mjs
import { glob } from 'glob';

const testFiles = await glob('tests/**/*.test.js');
console.log(`Found ${testFiles.length} test files`);

// Output test commands for different scenarios
console.log('\nQuick development:');
console.log('  npm run test:quick');

console.log('\nBefore commit:');
console.log('  npm run test:unit');

console.log('\nFull validation:');
console.log('  npm test');
```

### AAA Pattern Example

```javascript
describe('SPEC-XXX: Feature Name', () => {
  describe('AC-1: Specific Behavior', () => {
    it('should do X when Y', () => {
      // Arrange
      const input = { /* setup */ };

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toEqual(expected);
    });
  });
});
```

### Coverage Configuration

```javascript
// vitest.config.js
export default {
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.js'],
      exclude: ['src/**/*.d.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    }
  }
};
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-25 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
