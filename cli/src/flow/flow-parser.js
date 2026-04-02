/**
 * Flow YAML Parser — SPEC-FLOW-001
 *
 * 解析 .flow.yaml 內容為 Flow 物件，包含 schema 驗證和預設值填充。
 */

import yaml from 'js-yaml';

const DEFAULT_CONFIG = {
  enforcement: 'suggest',
  allow_skip_optional: true,
  state_persistence: true,
  gate_timeout: 30
};

const MAX_GATE_TIMEOUT = 600;

/**
 * 解析 Flow YAML 字串為 Flow 物件。
 * @param {string} yamlContent - Flow YAML 內容
 * @returns {object} 解析後的 Flow 物件
 * @throws {Error} YAML 語法錯誤或必填欄位缺失
 */
export function parseFlow(yamlContent) {
  let raw;
  try {
    raw = yaml.load(yamlContent);
  } catch (err) {
    throw new Error(`Flow YAML 語法錯誤: ${err.message}`);
  }

  if (!raw || typeof raw !== 'object') {
    throw new Error('Flow YAML 內容無效：必須為物件');
  }

  // 必填：id
  if (!raw.id) {
    throw new Error('Flow YAML 缺少必填欄位: id');
  }

  // 必填：stages（除非有 extends）
  if (!raw.stages && !raw.extends) {
    throw new Error('Flow YAML 缺少必填欄位: stages（或使用 extends 繼承）');
  }

  // 驗證 stages 結構
  if (raw.stages) {
    validateStages(raw.stages);
  }

  // 填充預設值
  const config = { ...DEFAULT_CONFIG, ...(raw.config || {}) };
  if (config.gate_timeout > MAX_GATE_TIMEOUT) {
    config.gate_timeout = MAX_GATE_TIMEOUT;
  }

  if (raw.stages) {
    raw.stages = raw.stages.map(stage => ({
      ...stage,
      steps: stage.steps.map(step => ({
        required: true,
        ...step
      }))
    }));
  }

  return {
    ...raw,
    config
  };
}

/**
 * 驗證 stages 陣列結構。
 * @param {Array} stages
 * @throws {Error} 結構不合法
 */
function validateStages(stages) {
  if (!Array.isArray(stages) || stages.length === 0) {
    throw new Error('Flow YAML stages 必須為非空陣列');
  }

  const seenIds = new Set();

  for (const stage of stages) {
    // stage.id 唯一性
    if (seenIds.has(stage.id)) {
      throw new Error(`Flow YAML stages 有重複的 stage id: duplicate "${stage.id}"`);
    }
    seenIds.add(stage.id);

    // steps 必填
    if (!stage.steps || !Array.isArray(stage.steps) || stage.steps.length === 0) {
      throw new Error(`Stage "${stage.id}" 缺少必填欄位: steps（至少一個 step）`);
    }

    // 每個 step 必須有 command
    for (const step of stage.steps) {
      if (!step.command) {
        throw new Error(`Stage "${stage.id}" 的 step 缺少必填欄位: command`);
      }
    }
  }
}
