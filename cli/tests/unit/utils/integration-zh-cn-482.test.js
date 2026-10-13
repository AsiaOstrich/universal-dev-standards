/**
 * Simplified Chinese content in the integration block, and the values --output-lang accepts (XSPEC-482 R13).
 */
import { describe, it, expect } from 'vitest';
import {
  generateIndexDisclosure, generateMinimalStandardsReference, generateStandardsIndex, generateIntegrationContent, resolveIntegrationLanguage
} from '../../../src/utils/integration-generator.js';
import { supportedOutputLanguages } from '../../../src/commands/init.js';

const TRADITIONAL_ONLY = /[這區塊標準規範檔選項專案讀內實請執錄對應務並與為個條說會讓]/;
const standards = ['anti-hallucination', 'ai/options/commit-message/english.ai.yaml'];

describe('Simplified Chinese content language', () => {
  it('the index disclosure, the minimal reference and the index body have no Traditional-only character', () => {
    const text = [
      generateIndexDisclosure('markdown', 'zh-cn'),
      generateMinimalStandardsReference(standards, 'markdown', 'zh-cn'),
      generateStandardsIndex(standards, 'markdown', 'zh-cn')
    ].join('\n');
    expect(text).toContain('这个区块是索引，不是标准本文');
    expect(text).toContain('规范文档参考');
    expect(text).not.toMatch(TRADITIONAL_ONLY);
  });

  it('Traditional stays Traditional and English stays English (control)', () => {
    expect(generateIndexDisclosure('markdown', 'zh-tw')).toContain('這個區塊是索引');
    expect(generateIndexDisclosure('markdown', 'en')).toContain('This block is an index');
  });

  it('bilingual commits in a Simplified Chinese project are announced as English + 简体中文', () => {
    const block = generateIntegrationContent({ tool: 'claude-code', categories: [], language: 'zh-cn', outputLanguage: 'bilingual', installedStandards: standards, contentMode: 'minimal' });
    expect(block).toContain('英文 + 简体中文');
    expect(block).not.toContain('繁體中文');
  });

  it('the language of the block follows display_language zh-cn instead of the commit language', () => {
    expect(resolveIntegrationLanguage({ options: { display_language: 'zh-cn', output_language: 'bilingual' } })).toBe('zh-cn');
    expect(resolveIntegrationLanguage({ options: { display_language: 'zh-tw', output_language: 'english' } })).toBe('zh-tw');
    expect(resolveIntegrationLanguage({ options: { output_language: 'bilingual' } })).toBe('bilingual');
  });
});

describe('supportedOutputLanguages', () => {
  it('is the ids of the commit-message option files UDS ships, and has no simplified-chinese', () => {
    expect(supportedOutputLanguages()).toEqual(['english', 'traditional-chinese', 'bilingual']);
  });
});
