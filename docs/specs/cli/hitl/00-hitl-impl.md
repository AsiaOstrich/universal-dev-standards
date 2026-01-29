# [SPEC-HITL-IMPL] HITL System Implementation / HITL 系統實作規格

**Status**: Draft
**Target Component**: CLI Core HITL Module

---

## 1. Class Structure / 類別結構

### RiskClassifier (`cli/src/hitl/classifier.js`)
負責將操作字串分類為風險等級。
- `classify(operation: string, context?: object): number`
- 內建 Regex 規則庫 (可擴充)。

### Checkpoint (`cli/src/hitl/checkpoint.js`)
負責決策邏輯。
- `check(level: number, configThreshold: number): 'approve' | 'prompt' | 'deny'`
- 處理 `overrides` 和 `always-prompt` 配置。

### HitlManager (`cli/src/hitl/manager.js`)
高階介面，整合 Config 與 User Prompt。
- `enforce(operation: string): Promise<boolean>`
- 自動調用 `ConfigManager` 獲取閾值。
- 自動調用 `Inquirer` 進行使用者確認。

---

## 2. Risk Levels / 風險等級

| Level | Name | Default Regex |
|-------|------|---------------|
| 4 | Restricted | `rm -rf`, `drop table`, `git push --force` |
| 3 | Critical | `delete`, `remove`, `deploy`, `secrets` |
| 2 | Elevated | `install`, `npm`, `config set` |
| 1 | Standard | `write`, `edit`, `touch` |
| 0 | Routine | `read`, `cat`, `ls`, `grep` |

---

## 3. CLI Integration

- `uds hitl check --op <operation>`: 用於 Agent 調用的指令。
- 整合至 `WorkflowExecutor`: 在執行每個 step 前自動檢查。

---

## 4. Test Cases / 測試案例

- [ ] 高風險操作 (rm -rf) 應返回 Level 4。
- [ ] 低風險操作 (read) 應返回 Level 0。
- [ ] 閾值設定為 3 時，Level 2 操作應自動通過。
- [ ] 閾值設定為 1 時，Level 2 操作應觸發 Prompt。
