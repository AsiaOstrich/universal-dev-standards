/**
 * Flow Engine — SPEC-FLOW-001
 *
 * 流程執行引擎：狀態機 + 持久化 + 恢復。
 * 狀態格式與 workflow-state-protocol 相容。
 */

import { join } from 'path';

const STALE_DAYS_THRESHOLD = 7;

/**
 * Flow Engine — 管理流程的執行狀態和生命週期。
 */
export class FlowEngine {
  /**
   * @param {object} flow - 已解析的 Flow 物件
   * @param {object} options
   * @param {object} options.fs - 檔案系統操作（existsSync, readFileSync, writeFileSync, mkdirSync）
   * @param {string} options.stateDir - 狀態檔案目錄路徑
   */
  constructor(flow, options = {}) {
    this.flow = flow;
    this.fs = options.fs || defaultFs();
    this.stateDir = options.stateDir || '.workflow-state';
    this.statePath = join(this.stateDir, `flow-${flow.id}.json`);
    this.state = null;
  }

  /**
   * 啟動新的流程執行。
   * @returns {object} 初始狀態
   */
  start() {
    const firstStage = this.flow.stages[0];
    this.state = {
      workflow: this.flow.id,
      current_phase: firstStage.id,
      status: 'in-progress',
      updated: new Date().toISOString(),
      phases_completed: []
    };
    this._save();
    return this.state;
  }

  /**
   * 完成當前 stage，進入下一個。
   * @param {string} stageId - 完成的 stage ID
   */
  completeStage(stageId) {
    if (!this.state) return;

    this.state.phases_completed.push(stageId);
    this.state.updated = new Date().toISOString();

    const stageIds = this.flow.stages.map(s => s.id);
    const currentIdx = stageIds.indexOf(stageId);
    const nextIdx = currentIdx + 1;

    if (nextIdx >= stageIds.length) {
      this.state.status = 'completed';
      this.state.current_phase = stageId;
    } else {
      this.state.current_phase = stageIds[nextIdx];
    }

    this._save();
  }

  /**
   * 放棄流程。
   */
  abandon() {
    if (!this.state) return;
    this.state.status = 'abandoned';
    this.state.updated = new Date().toISOString();
    this._save();
  }

  /**
   * 檢查是否有可恢復的流程。
   * @returns {{resumable: boolean, currentPhase?: string, flowName?: string, stale?: boolean, staleDays?: number}}
   */
  checkResumable() {
    if (!this.fs.existsSync(this.statePath)) {
      return { resumable: false };
    }

    try {
      const content = this.fs.readFileSync(this.statePath, 'utf-8');
      const saved = JSON.parse(content);

      if (saved.status !== 'in-progress') {
        return { resumable: false };
      }

      const updatedDate = new Date(saved.updated);
      const now = new Date();
      const diffDays = Math.floor((now - updatedDate) / (1000 * 60 * 60 * 24));

      return {
        resumable: true,
        currentPhase: saved.current_phase,
        flowName: saved.workflow,
        stale: diffDays >= STALE_DAYS_THRESHOLD,
        staleDays: diffDays
      };
    } catch {
      return { resumable: false };
    }
  }

  /**
   * 從儲存的狀態恢復流程。
   * @returns {object} 恢復的狀態
   */
  resume() {
    const content = this.fs.readFileSync(this.statePath, 'utf-8');
    this.state = JSON.parse(content);
    return this.state;
  }

  /**
   * 儲存狀態到檔案。
   * @private
   */
  _save() {
    if (!this.state || !this.flow.config?.state_persistence) {
      // 如果 state_persistence 未定義，預設啟用
      if (this.flow.config && this.flow.config.state_persistence === false) {
        return;
      }
    }

    try {
      if (!this.fs.existsSync(this.stateDir)) {
        this.fs.mkdirSync(this.stateDir, { recursive: true });
      }
      this.fs.writeFileSync(this.statePath, JSON.stringify(this.state, null, 2));
    } catch {
      // 靜默失敗，不阻礙流程執行
    }
  }
}

function defaultFs() {
  return {
    existsSync: () => false,
    readFileSync: () => '',
    writeFileSync: () => {},
    mkdirSync: () => {}
  };
}
