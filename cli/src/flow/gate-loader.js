/**
 * Gate Loader — SPEC-FLOW-001
 *
 * 載入和解析 .gate.yaml 閘門定義。
 */

import yaml from 'js-yaml';

/**
 * 從 YAML 字串載入 gate 定義。
 * @param {string} yamlContent - Gate YAML 內容
 * @returns {object} Gate 物件
 * @throws {Error} 必填欄位缺失
 */
export function loadGate(yamlContent) {
  const raw = yaml.load(yamlContent);

  if (!raw || typeof raw !== 'object') {
    throw new Error('Gate YAML 內容無效');
  }

  if (!raw.id) {
    throw new Error('Gate YAML 缺少必填欄位: id');
  }

  if (!raw.checks || !Array.isArray(raw.checks) || raw.checks.length === 0) {
    throw new Error(`Gate "${raw.id}" 缺少必填欄位: checks（至少一個 check）`);
  }

  return {
    removable: true,
    ...raw
  };
}

/**
 * 從行內定義建立 gate 物件。
 * @param {object} inlineDef - 行內閘門定義（type, run, expect）
 * @returns {object} Gate 物件
 */
export function loadInlineGate(inlineDef) {
  return {
    id: `inline-${Date.now()}`,
    name: 'Inline Gate',
    type: inlineDef.type || 'blocking',
    removable: true,
    checks: [{
      run: inlineDef.run,
      expect: inlineDef.expect
    }]
  };
}
