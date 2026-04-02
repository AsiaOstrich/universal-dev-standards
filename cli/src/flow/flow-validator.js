/**
 * Flow Validator — SPEC-FLOW-001
 *
 * 驗證已解析的 Flow 物件的邏輯正確性（命令引用、stage 一致性等）。
 */

/**
 * 驗證 Flow 物件的邏輯正確性。
 * @param {object} flow - 已解析的 Flow 物件
 * @param {object} options - 驗證選項
 * @param {string[]} options.availableCommands - 可用的命令清單
 * @returns {Array<{type: string, message: string, suggestions?: string[]}>} 錯誤清單
 */
export function validateFlow(flow, options = {}) {
  const errors = [];
  const { availableCommands = [] } = options;

  if (!flow.stages) {
    return errors;
  }

  for (const stage of flow.stages) {
    if (!stage.steps) continue;

    for (const step of stage.steps) {
      if (availableCommands.length > 0 && !availableCommands.includes(step.command)) {
        errors.push({
          type: 'invalid_command',
          message: `命令 ${step.command} 不存在（stage: ${stage.id}）`,
          suggestions: availableCommands
        });
      }
    }
  }

  return errors;
}
