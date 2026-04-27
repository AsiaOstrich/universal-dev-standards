// [Source: specs/execution-history-spec.md]
// [Updated: XSPEC-086 Phase 2 - 2026-04-27]
// Standard migrated to DevAP per DEC-049. UDS now holds deprecated stub.
// Canonical location: dev-autopilot/standards/orchestration/execution-history.ai.yaml
// Tests updated to verify deprecated stub structure.

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { load as yamlLoad } from 'js-yaml';

const ROOT = resolve(import.meta.dirname, '../../../..');
const YAML_PATH = resolve(ROOT, 'ai/standards/execution-history.ai.yaml');
const CORE_MD_PATH = resolve(ROOT, 'core/execution-history.md');
const REGISTRY_PATH = resolve(ROOT, 'cli/standards-registry.json');

describe('execution-history-spec: Execution History Repository Standard (Deprecated Stub)', () => {
  // ──────────────────────────────────────────────────────────────────
  // AC-1: Deprecated stub 可載入，包含遷移後標記
  // ──────────────────────────────────────────────────────────────────
  describe('AC-1: Deprecated stub 可載入', () => {
    let parsed;

    beforeAll(() => {
      if (!existsSync(YAML_PATH)) { parsed = null; return; }
      parsed = yamlLoad(readFileSync(YAML_PATH, 'utf-8'));
    });

    it('should_exist_when_standard_is_implemented', () => {
      expect(existsSync(YAML_PATH)).toBe(true);
    });

    it('should_parse_without_errors_when_loaded', () => {
      expect(parsed).not.toBeNull();
      expect(parsed).toHaveProperty('standard');
    });

    it('should_have_correct_id_when_parsed', () => {
      expect(parsed.standard.id).toBe('execution-history');
    });

    it('should_be_marked_deprecated_when_parsed', () => {
      // Standard has moved to DevAP — stub must declare deprecated
      expect(parsed.standard.meta.deprecated).toBe(true);
    });

    it('should_point_to_devap_canonical_location_when_parsed', () => {
      expect(parsed.standard.meta.canonical_owner).toBe('devap');
      expect(parsed.standard.meta.canonical_path).toBe(
        'dev-autopilot/standards/orchestration/execution-history.ai.yaml'
      );
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // AC-3: Core Markdown 參考文件完整（仍留在 UDS）
  // ──────────────────────────────────────────────────────────────────
  describe('AC-3: Core Markdown 參考文件完整', () => {
    let content;

    beforeAll(() => {
      if (!existsSync(CORE_MD_PATH)) { content = ''; return; }
      content = readFileSync(CORE_MD_PATH, 'utf-8');
    });

    it('should_exist_when_standard_is_implemented', () => {
      expect(existsSync(CORE_MD_PATH)).toBe(true);
    });

    const expectedSections = [
      '概述',
      '動機',
      '核心概念',
      'Schema 定義',
      '儲存後端',
      '保留策略',
      '敏感資料',
      '跨專案存取',
      '使用範例',
      '相關標準',
    ];

    for (const section of expectedSections) {
      it(`should_contain_section_${section}_when_checked`, () => {
        expect(content).toContain(section);
      });
    }
  });

  // ──────────────────────────────────────────────────────────────────
  // AC-4: Registry 標記 deprecated
  // ──────────────────────────────────────────────────────────────────
  describe('AC-4: Registry 標記 deprecated', () => {
    let entry;

    beforeAll(() => {
      const raw = readFileSync(REGISTRY_PATH, 'utf-8');
      const registry = JSON.parse(raw);
      const standards = registry.standards || [];
      entry = standards.find(s => s.id === 'execution-history');
    });

    it('should_be_registered_in_standards_registry_when_checked', () => {
      expect(entry).toBeDefined();
    });

    it('should_be_marked_deprecated_in_registry_when_checked', () => {
      expect(entry?.deprecated).toBe(true);
    });

    it('should_have_devap_canonical_path_in_registry_when_checked', () => {
      expect(entry?.canonicalOwner).toBe('devap');
      expect(entry?.canonicalPath).toBe(
        'dev-autopilot/standards/orchestration/execution-history.ai.yaml'
      );
    });

    it('should_have_correct_source_paths_when_registered', () => {
      expect(entry?.source?.human).toBe('core/execution-history.md');
      expect(entry?.source?.ai).toBe('ai/standards/execution-history.ai.yaml');
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // AC-7: 同步檢查通過
  // ──────────────────────────────────────────────────────────────────
  describe('AC-7: 同步檢查通過', () => {
    it('should_have_matching_yaml_and_core_md_files_when_checked', () => {
      expect(existsSync(YAML_PATH)).toBe(true);
      expect(existsSync(CORE_MD_PATH)).toBe(true);
    });

    it('should_have_yaml_source_pointing_to_xspec003_when_checked', () => {
      if (!existsSync(YAML_PATH)) return;
      const parsed = yamlLoad(readFileSync(YAML_PATH, 'utf-8'));
      expect(parsed.standard.meta.source).toBe('cross-project/specs/XSPEC-003-execution-history-standard-sdd.md');
    });
  });
});
