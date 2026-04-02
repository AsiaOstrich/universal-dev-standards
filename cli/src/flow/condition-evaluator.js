/**
 * Condition Evaluator — SPEC-FLOW-001
 *
 * 評估 Flow step 的 `when` 條件。
 * 支援兩級語法：命名條件（字串）和屬性比對（物件）。
 */

import { minimatch } from 'minimatch';

/**
 * 內建命名條件的評估器。
 * @type {Record<string, (context: object) => boolean>}
 */
const NAMED_CONDITIONS = {
  scope_includes_api: (ctx) => Array.isArray(ctx.scope) && ctx.scope.includes('api'),
  scope_includes_database: (ctx) => Array.isArray(ctx.scope) && ctx.scope.includes('database'),
  scope_includes_frontend: (ctx) => Array.isArray(ctx.scope) && ctx.scope.includes('frontend'),
  has_spec: (ctx) => !!ctx.has_spec,
  has_tests: (ctx) => !!ctx.has_tests,
  is_hotfix: (ctx) => !!ctx.is_hotfix
};

/**
 * 評估條件是否滿足。
 * @param {string|object} condition - 命名條件（字串）或屬性比對（物件）
 * @param {object} context - 當前執行環境
 * @returns {boolean} 條件是否滿足
 */
export function evaluateCondition(condition, context) {
  // Level 1：命名條件
  if (typeof condition === 'string') {
    const evaluator = NAMED_CONDITIONS[condition];
    return evaluator ? evaluator(context) : false;
  }

  // Level 2：屬性比對（AND 語義）
  if (typeof condition === 'object' && condition !== null) {
    return Object.entries(condition).every(([key, expr]) => {
      return evaluateExpression(key, expr, context);
    });
  }

  return false;
}

/**
 * 評估單一屬性比對表達式。
 * @param {string} key - 屬性名稱
 * @param {string} expr - 表達式（如 "includes api"、"equals feature"、"matches **\/*.js"）
 * @param {object} context - 當前環境
 * @returns {boolean}
 */
function evaluateExpression(key, expr, context) {
  const spaceIndex = expr.indexOf(' ');
  if (spaceIndex === -1) return false;

  const operator = expr.substring(0, spaceIndex);
  const value = expr.substring(spaceIndex + 1);
  const contextValue = context[key];

  switch (operator) {
    case 'includes':
      if (Array.isArray(contextValue)) {
        return contextValue.includes(value);
      }
      if (typeof contextValue === 'string') {
        return contextValue.includes(value);
      }
      return false;

    case 'equals':
      return contextValue === value;

    case 'matches':
      if (Array.isArray(contextValue)) {
        return contextValue.some(item => minimatch(item, value));
      }
      if (typeof contextValue === 'string') {
        return minimatch(contextValue, value);
      }
      return false;

    default:
      return false;
  }
}
