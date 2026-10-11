---
source: ../../../../skills/commands/checkin.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: e46beebc25e2
status: current
---

---
name: checkin
description: "[UDS] Pre-commit quality gates verification"
---

# 簽入助手

> **Language**: [English](../../../../skills/commands/checkin.md) | 繁體中文

在提交程式碼前驗證品質關卡，確保程式碼庫的穩定性。

---

## 用法

```bash
/checkin
```

## 工作流程

1. **檢查 git 狀態** - 執行 `git status` 和 `git diff` 了解待處理的變更
2. **執行測試** - 執行 `npm test`（或專案測試指令）驗證所有測試通過
3. **執行程式碼檢查** - 執行 `npm run lint` 檢查程式碼風格合規
4. **驗證品質關卡** - 對照以下檢查清單逐項確認
5. **報告結果** - 呈現通過/失敗摘要並建議後續步驟

## 品質關卡

| 關卡 | Check | 檢查項目 |
|------|-------|---------|
| **Build** | Code compiles with zero errors | 編譯零錯誤 |
| **Tests** | All existing tests pass (100%) | 所有測試通過（100%）|
| **Coverage** | Test coverage not decreased | 覆蓋率未下降 |
| **AC Coverage** | AC-to-test coverage ≥ 80% ([`/ac-coverage`](./ac-coverage.md)) | AC 覆蓋率 ≥ 80%（[`/ac-coverage`](./ac-coverage.md)）|
| **Code Quality** | Follows coding standards, no code smells | 符合編碼規範，無 code smell |
| **Security** | No hardcoded secrets or vulnerabilities | 無硬編碼密鑰或漏洞 |
| **Documentation** | API docs and CHANGELOG updated if needed | 如有需要，API 文件和 CHANGELOG 已更新 |
| **Workflow** | Branch naming and commit message correct | 分支命名和 commit message 格式正確 |

## 禁止提交的情況

- 建置有錯誤
- 測試失敗
- 功能不完整會破壞現有功能
- 包含除錯程式碼（console.log、print）
- 包含被註解的程式碼區塊

## 後續步驟

驗證通過後，使用 `/commit` 建立 commit message。

## AI 代理行為

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### 進入路由

| 輸入 | AI 動作 |
|-------|-----------|
| `/checkin` | 自動執行所有品質關卡檢查 |

### 互動腳本

1. 執行 `git status` 確認有待提交的變更
2. 依序檢查每個品質關卡：
   - Build → Tests → Coverage → Code Quality → Security → Documentation → Workflow
3. 為每個關卡標記 ✅ PASS / ❌ FAIL
4. 生成摘要報告

**Decision: 測試指令偵測**
- IF 專案有 `package.json` → 使用 `npm test`
- IF 專案有 `pyproject.toml` → 使用 `pytest`
- IF 無法偵測 → 詢問使用者

**Decision: 檢查結果**
- IF 全部通過 → 建議執行 `/commit`
- IF 有 FAIL → 列出失敗項目和修復建議，不建議 commit

🛑 **STOP**: 報告展示後等待使用者決定（修復 or 強制 commit）

### 停止點

| 停止點 | 等待內容 |
|-----------|---------|
| 品質報告展示後 | 使用者決定修復或 commit |

### 錯誤處理

| 錯誤情況 | AI 動作 |
|-----------------|-----------|
| 無待提交變更 | 告知無變更可檢查 |
| 測試指令執行失敗 | 報告錯誤，建議檢查測試環境 |
| lint 工具未安裝 | 跳過該關卡，標記 ⚠️ SKIP |

## 參考

*   [Check-in Assistant Skill](../checkin-assistant/SKILL.md)
*   [Core Standard](../../core/checkin-standards.md)
*   [AC Coverage 命令](./ac-coverage.md) — AC 對測試的追溯分析
*   [AC 追溯標準](../../core/acceptance-criteria-traceability.md)
