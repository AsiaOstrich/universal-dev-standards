/**
 * Gate Checker — SPEC-FLOW-001
 *
 * 執行閘門檢查並回傳結果。
 */

const MAX_TIMEOUT = 600;
const DEFAULT_TIMEOUT = 30;

/**
 * 執行閘門的所有 checks。
 * @param {object} gate - Gate 物件
 * @param {object} options
 * @param {Function} options.executor - 命令執行器 (run, opts) => Promise<{exitCode, stdout}>
 * @param {number} [options.defaultTimeout=30] - 預設 timeout 秒數
 * @returns {Promise<{passed: boolean, blocking: boolean, message?: string, suggest?: string[], error?: string}>}
 */
export async function checkGate(gate, options = {}) {
  const { executor, defaultTimeout = DEFAULT_TIMEOUT } = options;
  const isInfo = gate.type === 'info';
  const isBlocking = gate.type === 'blocking';

  for (const check of gate.checks) {
    let timeout = check.timeout || defaultTimeout;
    if (timeout > MAX_TIMEOUT) {
      timeout = MAX_TIMEOUT;
    }

    try {
      const result = await executor(check.run, { timeout });

      if (check.expect === 'exit_code_0' && result.exitCode !== 0) {
        if (isInfo) {
          return { passed: true, blocking: false };
        }
        return {
          passed: false,
          blocking: isBlocking,
          message: gate.on_failure?.message,
          suggest: gate.on_failure?.suggest
        };
      }
    } catch (err) {
      if (isInfo) {
        return { passed: true, blocking: false };
      }
      return {
        passed: false,
        blocking: isBlocking,
        error: err.message.includes('TIMEOUT')
          ? `Gate "${gate.id}" 執行超時（timeout: ${timeout}s）`
          : err.message,
        message: gate.on_failure?.message,
        suggest: gate.on_failure?.suggest
      };
    }
  }

  return { passed: true, blocking: isBlocking };
}

/**
 * 驗證閘門移除是否合法。
 * @param {object[]} baseGates - 基底 flow 的 gates
 * @param {string[]} removedGateIds - 要移除的 gate IDs
 * @returns {Array<{type: string, message: string}>} 錯誤清單
 */
export function validateGateRemoval(baseGates, removedGateIds) {
  const errors = [];

  for (const gateId of removedGateIds) {
    const baseGate = baseGates.find(g => g.id === gateId);
    if (baseGate && baseGate.removable === false) {
      errors.push({
        type: 'non_removable_gate',
        message: `閘門 "${gateId}" 為強制要求，不可移除（removable: false）`
      });
    }
  }

  return errors;
}
