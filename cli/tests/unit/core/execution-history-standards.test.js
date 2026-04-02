// [Source: specs/execution-history-spec.md]
// [Generated] TDD skeleton for execution-history standards content verification
// Pattern: AAA (Arrange-Act-Assert)

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { load as yamlLoad } from 'js-yaml';

const ROOT = resolve(import.meta.dirname, '../../../..');
const YAML_PATH = resolve(ROOT, 'ai/standards/execution-history.ai.yaml');
const CORE_MD_PATH = resolve(ROOT, 'core/execution-history.md');
const REGISTRY_PATH = resolve(ROOT, 'cli/standards-registry.json');
const SCHEMA_DIR = resolve(ROOT, 'specs/schemas');

describe('execution-history-spec: Execution History Repository Standard', () => {
  // ──────────────────────────────────────────────────────────────────
  // AC-1: AI 標準 YAML 可載入
  // [Source: specs/execution-history-spec.md:AC-1]
  // ──────────────────────────────────────────────────────────────────
  describe('AC-1: AI 標準 YAML 可載入', () => {
    let yamlContent;
    let parsed;

    beforeAll(() => {
      // Arrange
      if (!existsSync(YAML_PATH)) {
        yamlContent = '';
        parsed = null;
        return;
      }
      yamlContent = readFileSync(YAML_PATH, 'utf-8');
      parsed = yamlLoad(yamlContent);
    });

    it('should_exist_when_standard_is_implemented', () => {
      // Assert: YAML 檔案存在
      expect(existsSync(YAML_PATH)).toBe(true);
    });

    it('should_parse_without_errors_when_loaded', () => {
      // Act: yamlLoad 在 beforeAll 已執行
      // Assert: 解析成功
      expect(parsed).not.toBeNull();
      expect(parsed).toHaveProperty('standard');
    });

    it('should_have_correct_id_when_parsed', () => {
      // Assert: standard.id 為 "execution-history"
      expect(parsed.standard.id).toBe('execution-history');
    });

    it('should_have_correct_name_when_parsed', () => {
      // Assert
      expect(parsed.standard.name).toBe('Execution History Repository Standards');
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // AC-2: YAML Schema 包含完整 definitions
  // [Source: specs/execution-history-spec.md:AC-2]
  // ──────────────────────────────────────────────────────────────────
  describe('AC-2: YAML Schema 包含完整 definitions', () => {
    let parsed;

    beforeAll(() => {
      if (!existsSync(YAML_PATH)) { parsed = null; return; }
      parsed = yamlLoad(readFileSync(YAML_PATH, 'utf-8'));
    });

    it('should_contain_test_results_definition_when_parsed', () => {
      // Assert
      expect(parsed.standard.definitions).toHaveProperty('test-results');
    });

    it('should_contain_log_entry_definition_when_parsed', () => {
      expect(parsed.standard.definitions).toHaveProperty('log-entry');
    });

    it('should_contain_token_usage_definition_when_parsed', () => {
      expect(parsed.standard.definitions).toHaveProperty('token-usage');
    });

    it('should_contain_final_status_definition_when_parsed', () => {
      expect(parsed.standard.definitions).toHaveProperty('final-status');
    });

    it('should_have_exactly_4_definitions_when_parsed', () => {
      // Assert: 4 個 schema 定義
      const keys = Object.keys(parsed.standard.definitions);
      expect(keys).toHaveLength(4);
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // AC-3: Core Markdown 參考文件完整
  // [Source: specs/execution-history-spec.md:AC-3]
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

    // 規格定義的 10 個章節
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
        // Assert: 章節存在（以標題形式）
        expect(content).toContain(section);
      });
    }
  });

  // ──────────────────────────────────────────────────────────────────
  // AC-4: Registry 註冊成功
  // [Source: specs/execution-history-spec.md:AC-4]
  // ──────────────────────────────────────────────────────────────────
  describe('AC-4: Registry 註冊成功', () => {
    let registry;
    let entry;

    beforeAll(() => {
      // Arrange
      const raw = readFileSync(REGISTRY_PATH, 'utf-8');
      registry = JSON.parse(raw);
      // Act: 搜尋 execution-history entry
      const standards = registry.standards || [];
      entry = standards.find(s => s.id === 'execution-history');
    });

    it('should_be_registered_in_standards_registry_when_checked', () => {
      // Assert
      expect(entry).toBeDefined();
    });

    it('should_have_category_reference_when_registered', () => {
      expect(entry?.category).toBe('reference');
    });

    it('should_have_null_skillName_when_registered', () => {
      expect(entry?.skillName).toBeNull();
    });

    it('should_have_correct_source_paths_when_registered', () => {
      expect(entry?.source?.human).toBe('core/execution-history.md');
      expect(entry?.source?.ai).toBe('ai/standards/execution-history.ai.yaml');
    });

    it('should_have_nameZh_when_registered', () => {
      expect(entry?.nameZh).toBeTruthy();
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // AC-5: JSON Schema 檔案可驗證
  // [Source: specs/execution-history-spec.md:AC-5]
  // ──────────────────────────────────────────────────────────────────
  describe('AC-5: JSON Schema 檔案可驗證', () => {
    const schemaFiles = [
      'execution-history-index.schema.json',
      'execution-history-manifest.schema.json',
      'execution-history-test-results.schema.json',
      'execution-history-log-entry.schema.json',
      'execution-history-token-usage.schema.json',
      'execution-history-final-status.schema.json',
    ];

    for (const file of schemaFiles) {
      const filePath = resolve(SCHEMA_DIR, file);

      it(`should_exist_${file}_when_implemented`, () => {
        expect(existsSync(filePath)).toBe(true);
      });

      it(`should_parse_as_valid_json_${file}_when_loaded`, () => {
        // Arrange
        if (!existsSync(filePath)) return;
        const raw = readFileSync(filePath, 'utf-8');
        // Act & Assert: JSON 解析成功
        expect(() => JSON.parse(raw)).not.toThrow();
      });
    }

    it('should_have_consistent_version_across_all_schemas_when_checked', () => {
      // Arrange: 取得 YAML meta.version
      if (!existsSync(YAML_PATH)) return;
      const yamlParsed = yamlLoad(readFileSync(YAML_PATH, 'utf-8'));
      const expectedVersion = yamlParsed.standard.meta.version;

      // Act & Assert: 每個 schema 的 version 一致
      for (const file of schemaFiles) {
        const filePath = resolve(SCHEMA_DIR, file);
        if (!existsSync(filePath)) continue;
        const schema = JSON.parse(readFileSync(filePath, 'utf-8'));
        expect(schema.version).toBe(expectedVersion);
      }
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // AC-6: 與同類標準架構對齊
  // [Source: specs/execution-history-spec.md:AC-6]
  // ──────────────────────────────────────────────────────────────────
  describe('AC-6: 與同類標準架構對齊', () => {
    let registry;
    let execHistoryEntry;
    let devMemoryEntry;

    beforeAll(() => {
      const raw = readFileSync(REGISTRY_PATH, 'utf-8');
      registry = JSON.parse(raw);
      const standards = registry.standards || [];
      execHistoryEntry = standards.find(s => s.id === 'execution-history');
      devMemoryEntry = standards.find(s => s.id === 'developer-memory');
    });

    it('should_match_developer_memory_category_when_compared', () => {
      // Assert: 與 developer-memory 的 category 一致
      expect(execHistoryEntry?.category).toBe(devMemoryEntry?.category);
    });

    it('should_match_developer_memory_skillName_when_compared', () => {
      // Assert: 與 developer-memory 的 skillName 一致
      expect(execHistoryEntry?.skillName).toBe(devMemoryEntry?.skillName);
    });

    it('should_have_source_format_matching_developer_memory_when_compared', () => {
      // Assert: source 結構一致（有 human 和 ai）
      expect(execHistoryEntry?.source).toHaveProperty('human');
      expect(execHistoryEntry?.source).toHaveProperty('ai');
    });

    it('should_have_always_on_protocol_classification_when_yaml_checked', () => {
      // Arrange
      if (!existsSync(YAML_PATH)) return;
      const parsed = yamlLoad(readFileSync(YAML_PATH, 'utf-8'));
      // Assert
      expect(parsed.standard.architecture.classification).toBe('always-on-protocol');
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // AC-7: 同步檢查通過
  // [Source: specs/execution-history-spec.md:AC-7]
  // NOTE: AC-7 requires running ./scripts/check-standards-sync.sh
  //       This is an integration-level check, tested via pre-release-check.sh
  // ──────────────────────────────────────────────────────────────────
  describe('AC-7: 同步檢查通過', () => {
    it('should_have_matching_yaml_and_core_md_files_when_checked', () => {
      // Assert: 兩個檔案都存在（同步的前提條件）
      expect(existsSync(YAML_PATH)).toBe(true);
      expect(existsSync(CORE_MD_PATH)).toBe(true);
    });

    it('should_have_yaml_source_pointing_to_core_md_when_checked', () => {
      // Arrange
      if (!existsSync(YAML_PATH)) return;
      const parsed = yamlLoad(readFileSync(YAML_PATH, 'utf-8'));
      // Assert: YAML 的 source 指向 core markdown
      expect(parsed.standard.meta.source).toBe('core/execution-history.md');
    });
  });
});
