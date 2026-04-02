/**
 * Flow Bundler — SPEC-FLOW-001
 *
 * Export/Import flow bundles：打包 flow + gates 為可分享的單一檔案。
 */

/**
 * 匯出 flow 為 bundle。
 * @param {object} flow - Flow 物件
 * @param {Record<string, object>} allGates - 所有可用 gate 定義
 * @param {object} [options]
 * @param {string} [options.projectName] - 專案名稱
 * @returns {object} Bundle 物件
 */
export function exportBundle(flow, allGates = {}, options = {}) {
  // 收集 flow 引用的 gate refs
  const referencedGateIds = new Set();
  for (const stage of (flow.stages || [])) {
    for (const gate of (stage.gates || [])) {
      if (gate.ref) {
        referencedGateIds.add(gate.ref);
      }
    }
  }

  const gates = [...referencedGateIds]
    .map(id => allGates[id])
    .filter(Boolean);

  return {
    bundle_version: '1.0',
    exported_at: new Date().toISOString(),
    exported_from: options.projectName || '',
    flow,
    gates
  };
}

/**
 * 匯入 bundle，解壓為 flow 和 gates。
 * @param {object} bundle - Bundle 物件
 * @param {object} [options]
 * @param {string[]} [options.existingFlowIds] - 已存在的 flow IDs（用於衝突偵測）
 * @returns {{flow: object, gates: object[], conflicts: string[]}}
 */
export function importBundle(bundle, options = {}) {
  const { existingFlowIds = [] } = options;

  const conflicts = [];
  if (existingFlowIds.includes(bundle.flow.id)) {
    conflicts.push(bundle.flow.id);
  }

  return {
    flow: bundle.flow,
    gates: bundle.gates || [],
    conflicts
  };
}

/**
 * 驗證 bundle 的完整性。
 * @param {object} bundle - Bundle 物件
 * @param {object} [options]
 * @param {string[]} [options.availableBaseFlows] - 可用的 base flow IDs
 * @returns {Array<{type: string, message: string}>}
 */
export function validateBundle(bundle, options = {}) {
  const errors = [];
  const { availableBaseFlows = [] } = options;

  if (bundle.flow.extends && !availableBaseFlows.includes(bundle.flow.extends)) {
    errors.push({
      type: 'missing_base_flow',
      message: `Base flow "${bundle.flow.extends}" 不存在，請先安裝`
    });
  }

  return errors;
}
