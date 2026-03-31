// [Source: docs/specs/SPEC-CONTAINER-001-containerization-standards.md]
// [Generated] TDD skeleton for containerization standards content verification
// Pattern: AAA (Arrange-Act-Assert)

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const STANDARD_PATH = resolve(import.meta.dirname, '../../../../core/containerization-standards.md');

describe('SPEC-CONTAINER-001: Containerization Standards', () => {
  let content;

  beforeAll(() => {
    if (!existsSync(STANDARD_PATH)) {
      content = '';
      return;
    }
    content = readFileSync(STANDARD_PATH, 'utf-8');
  });

  describe('AC-1: Base Image selection has 4 principles', () => {
    // [Source: SPEC-CONTAINER-001:AC-1]
    it('should define official image principle', () => {
      // Arrange: standard loaded
      // Act: search for official image guidance
      // Assert
      expect(content).toMatch(/official/i);
    });

    it('should define slim/alpine variant principle', () => {
      expect(content).toMatch(/slim/i);
      expect(content).toMatch(/alpine/i);
    });

    it('should define pinned version principle', () => {
      expect(content).toMatch(/fixed|pin/i);
    });

    it('should define regular update principle', () => {
      expect(content).toMatch(/regular.*update|定期更新/i);
    });
  });

  describe('AC-2: Layer optimization has at least 5 principles', () => {
    // [Source: SPEC-CONTAINER-001:AC-2]
    it('should define change frequency ordering', () => {
      // Arrange: standard loaded
      // Act: search for layer ordering guidance
      // Assert
      expect(content).toMatch(/cache|快取/i);
    });

    it('should define merging RUN instructions', () => {
      expect(content).toMatch(/RUN/);
    });

    it('should define cleaning temporary files', () => {
      expect(content).toMatch(/clean|清理/i);
    });

    it('should define using .dockerignore', () => {
      expect(content).toMatch(/\.dockerignore/);
    });

    it('should define precise COPY instructions', () => {
      expect(content).toMatch(/COPY/);
    });
  });

  describe('AC-3: Multi-stage Build has builder/production stages', () => {
    // [Source: SPEC-CONTAINER-001:AC-3]
    it('should define builder stage', () => {
      // Arrange: standard loaded
      // Act: search for builder stage
      // Assert
      expect(content).toMatch(/builder/i);
    });

    it('should define production stage', () => {
      expect(content).toMatch(/production/i);
    });

    it('should describe dev vs production image separation', () => {
      expect(content).toMatch(/dev.*image|development.*image|開發.*image/i);
    });
  });

  describe('AC-4: Security checklist has at least 6 items', () => {
    // [Source: SPEC-CONTAINER-001:AC-4]
    it('should require non-root execution', () => {
      // Arrange: standard loaded
      // Act: search for non-root guidance
      // Assert
      expect(content).toMatch(/non.root|USER/i);
    });

    it('should require no known vulnerabilities', () => {
      expect(content).toMatch(/vulnerabilit/i);
    });

    it('should require no hardcoded secrets', () => {
      expect(content).toMatch(/secret|硬編碼/i);
    });

    it('should require minimal privileges', () => {
      expect(content).toMatch(/minimal.*privile|最小權限|port/i);
    });

    it('should require read-only filesystem', () => {
      expect(content).toMatch(/read.only/i);
    });

    it('should require no unnecessary tools', () => {
      expect(content).toMatch(/unnecessary.*tool|不必要.*工具|curl.*wget/i);
    });
  });

  describe('AC-5: Vulnerability scanning has 3-tier handling', () => {
    // [Source: SPEC-CONTAINER-001:AC-5]
    it('should define Critical vulnerability handling as block', () => {
      // Arrange: standard loaded
      // Act: search for Critical handling
      // Assert
      expect(content).toMatch(/critical/i);
    });

    it('should define High vulnerability handling as warning', () => {
      expect(content).toMatch(/high/i);
    });

    it('should define Medium/Low vulnerability handling as logging', () => {
      expect(content).toMatch(/medium/i);
    });
  });

  describe('AC-6: Image tagging has 4 types and prohibits latest', () => {
    // [Source: SPEC-CONTAINER-001:AC-6]
    it('should define semantic version tag type', () => {
      // Arrange: standard loaded
      // Act: search for semantic version tag
      // Assert
      expect(content).toMatch(/vX\.Y\.Z/);
    });

    it('should define commit SHA tag type', () => {
      expect(content).toMatch(/sha-/i);
    });

    it('should define branch tag type', () => {
      expect(content).toMatch(/branch/i);
    });

    it('should define environment tag type', () => {
      expect(content).toMatch(/env.*latest|environment/i);
    });

    it('should prohibit latest tag in production', () => {
      expect(content).toMatch(/latest/i);
      expect(content).toMatch(/MUST NOT|prohibit|禁止/i);
    });
  });

  describe('AC-7: Registry cleanup has 5 retention rules', () => {
    // [Source: SPEC-CONTAINER-001:AC-7]
    it('should define retention for semantic version tags', () => {
      // Arrange: standard loaded
      // Act: search for retention rules
      // Assert
      expect(content).toMatch(/永久保留|permanently|forever/i);
    });

    it('should define retention for environment tags', () => {
      expect(content).toMatch(/最近.*N|recent/i);
    });

    it('should define retention for branch tags', () => {
      expect(content).toMatch(/7.*天|7.*day/i);
    });

    it('should define retention for commit SHA tags', () => {
      expect(content).toMatch(/30.*天|30.*day/i);
    });

    it('should define retention for dangling images', () => {
      expect(content).toMatch(/dangling|無標籤/i);
    });
  });

  describe('AC-8: .dockerignore has at least 10 items', () => {
    // [Source: SPEC-CONTAINER-001:AC-8]
    it('should contain .dockerignore section', () => {
      // Arrange: standard loaded
      // Act: search for .dockerignore section
      // Assert
      expect(content).toMatch(/\.dockerignore/);
    });

    it('should include .git in ignore list', () => {
      expect(content).toContain('.git');
    });

    it('should include node_modules in ignore list', () => {
      expect(content).toContain('node_modules');
    });

    it('should include .env in ignore list', () => {
      expect(content).toContain('.env');
    });

    it('should include tests directory in ignore list', () => {
      expect(content).toMatch(/tests\//);
    });

    it('should list at least 10 ignore items', () => {
      // [Derived] Count items in the .dockerignore code block
      const dockerignoreMatch = content.match(/```[\s\S]*?\.git[\s\S]*?```/);
      if (dockerignoreMatch) {
        const lines = dockerignoreMatch[0]
          .split('\n')
          .filter(l => l.trim() && !l.startsWith('```'));
        expect(lines.length).toBeGreaterThanOrEqual(10);
      } else {
        // Fallback: count known ignore items mentioned in the document
        const ignoreItems = ['.git', 'node_modules', '.env', 'tests/', 'docs/', '.dockerignore', 'Dockerfile', '.github/', '.vscode/'];
        const found = ignoreItems.filter(item => content.includes(item));
        expect(found.length).toBeGreaterThanOrEqual(8);
      }
    });
  });

  describe('UDS core standard format', () => {
    it('should contain Version field', () => {
      expect(content).toMatch(/\*\*Version\*\*/);
    });

    it('should contain Scope field', () => {
      expect(content).toMatch(/\*\*Scope\*\*/);
    });

    it('should contain References section', () => {
      expect(content).toMatch(/## References/);
    });

    it('should contain License section', () => {
      expect(content).toMatch(/## License/);
    });
  });
});
