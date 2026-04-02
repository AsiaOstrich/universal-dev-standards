/**
 * Flow Commands — SPEC-FLOW-001
 *
 * 核心邏輯函式，供 CLI 命令呼叫：list、validate、diff。
 */

import { validateFlow } from './flow-validator.js';

/**
 * 列出所有可用流程。
 * @param {object[]} flows - Flow 物件陣列（含 _source 標記）
 * @returns {Array<{id, name, label, stageCount, extends?}>}
 */
export function listFlows(flows) {
  return flows.map(flow => ({
    id: flow.id,
    name: flow.name,
    label: flow._source === 'built-in' ? 'built-in' : 'custom',
    stageCount: flow.stages?.length || 0,
    ...(flow.extends ? { extends: flow.extends } : {})
  }));
}

/**
 * 驗證指定 flow 的邏輯正確性。
 * @param {string} flowId - Flow ID
 * @param {Record<string, object>} flowRegistry - 所有 flow 的 id → flow 對映
 * @param {object} options
 * @param {string[]} options.availableCommands
 * @returns {{valid: boolean, errors: Array<{type: string, message: string}>}}
 */
export function validateFlowById(flowId, flowRegistry, options = {}) {
  const flow = flowRegistry[flowId];
  if (!flow) {
    return {
      valid: false,
      errors: [{ type: 'not_found', message: `流程 "${flowId}" 不存在` }]
    };
  }

  const errors = [];

  // 檢查 stage ID 唯一性
  if (flow.stages) {
    const seenIds = new Set();
    for (const stage of flow.stages) {
      if (seenIds.has(stage.id)) {
        errors.push({
          type: 'duplicate_stage',
          message: `重複的 stage ID: "${stage.id}"`
        });
      }
      seenIds.add(stage.id);
    }
  }

  // 委託 validateFlow 做命令引用檢查
  const validatorErrors = validateFlow(flow, options);
  errors.push(...validatorErrors);

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 比較兩個 flow 的差異。
 * @param {object} flowA - 基準 flow
 * @param {object} flowB - 比較 flow
 * @returns {{stages: {added: string[], removed: string[]}, steps: {modified: Array<{stageId, added, removed}>}}}
 */
export function diffFlows(flowA, flowB) {
  const stageIdsA = (flowA.stages || []).map(s => s.id);
  const stageIdsB = (flowB.stages || []).map(s => s.id);

  const added = stageIdsB.filter(id => !stageIdsA.includes(id));
  const removed = stageIdsA.filter(id => !stageIdsB.includes(id));

  // 比較共同 stages 的 steps 差異
  const commonStageIds = stageIdsA.filter(id => stageIdsB.includes(id));
  const modified = [];

  for (const stageId of commonStageIds) {
    const stageA = flowA.stages.find(s => s.id === stageId);
    const stageB = flowB.stages.find(s => s.id === stageId);

    const cmdsA = (stageA.steps || []).map(s => s.command);
    const cmdsB = (stageB.steps || []).map(s => s.command);

    const addedCmds = cmdsB.filter(c => !cmdsA.includes(c));
    const removedCmds = cmdsA.filter(c => !cmdsB.includes(c));

    if (addedCmds.length > 0 || removedCmds.length > 0) {
      modified.push({
        stageId,
        added: addedCmds,
        removed: removedCmds
      });
    }
  }

  return {
    stages: { added, removed },
    steps: { modified }
  };
}
