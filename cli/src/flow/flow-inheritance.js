/**
 * Flow Inheritance — SPEC-FLOW-001
 *
 * 解析 extends/overrides/insert 語義，合併繼承鏈。
 */

const MAX_INHERITANCE_DEPTH = 5;

/**
 * 解析繼承鏈並合併為最終 Flow。
 * @param {object} flow - 子 flow
 * @param {Record<string, object>} flowRegistry - 所有可用 flow 的 id → flow 對映
 * @param {number} depth - 當前深度（內部用）
 * @returns {object} 合併後的 flow
 */
export function resolveInheritance(flow, flowRegistry, depth = 0) {
  if (!flow.extends) {
    return structuredClone(flow);
  }

  if (depth >= MAX_INHERITANCE_DEPTH) {
    throw new Error(`繼承深度超過 ${MAX_INHERITANCE_DEPTH} 層限制（flow: ${flow.id}）`);
  }

  const baseFlow = flowRegistry[flow.extends];
  if (!baseFlow) {
    throw new Error(`Base flow "${flow.extends}" 不存在（flow: ${flow.id}）`);
  }

  // 遞迴解析 base flow 的繼承
  const resolvedBase = resolveInheritance(baseFlow, flowRegistry, depth + 1);

  // 從 base 開始合併
  const merged = structuredClone(resolvedBase);
  merged.id = flow.id;
  merged.name = flow.name;
  merged.extends = flow.extends;

  // 處理 overrides
  if (flow.overrides) {
    for (const override of flow.overrides) {
      applyOverride(merged, override);
    }
  }

  // 處理 insert
  if (flow.insert) {
    for (const insertion of flow.insert) {
      applyInsert(merged, insertion);
    }
  }

  return merged;
}

/**
 * 套用 override 到 merged flow。
 * @param {object} merged - 合併中的 flow
 * @param {object} override - override 定義
 */
function applyOverride(merged, override) {
  const stage = merged.stages.find(s => s.id === override.stage);
  if (!stage) return;

  // add_steps
  if (override.add_steps) {
    stage.steps = [...stage.steps, ...override.add_steps];
  }

  // remove_steps
  if (override.remove_steps) {
    stage.steps = stage.steps.filter(
      step => !override.remove_steps.includes(step.command)
    );
  }

  // modify_gates
  if (override.modify_gates) {
    if (!stage.gates) stage.gates = [];
    for (const gateModification of override.modify_gates) {
      const existingGate = stage.gates.find(g => g.ref === gateModification.ref);
      if (existingGate) {
        Object.assign(existingGate, gateModification);
      } else {
        stage.gates.push(gateModification);
      }
    }
  }
}

/**
 * 在指定 stage 後插入新 stage。
 * @param {object} merged - 合併中的 flow
 * @param {object} insertion - insert 定義
 */
function applyInsert(merged, insertion) {
  const afterIdx = merged.stages.findIndex(s => s.id === insertion.after);
  if (afterIdx === -1) return;
  merged.stages.splice(afterIdx + 1, 0, structuredClone(insertion.stage));
}
