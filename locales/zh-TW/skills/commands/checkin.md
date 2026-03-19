---
source: ../../../../skills/commands/checkin.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
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

| 關卡 | 檢查項目 |
|------|---------|
| **Build** | 編譯零錯誤 |
| **Tests** | 所有測試通過（100%）|
| **Coverage** | 覆蓋率未下降 |
| **AC Coverage** | AC 覆蓋率 ≥ 80%（[`/ac-coverage`](./ac-coverage.md)）|
| **Code Quality** | 符合編碼規範，無 code smell |
| **Security** | 無硬編碼密鑰或漏洞 |
| **Documentation** | 如有需要，API 文件和 CHANGELOG 已更新 |
| **Workflow** | 分支命名和 commit message 格式正確 |

## 禁止提交的情況

- 建置有錯誤
- 測試失敗
- 功能不完整會破壞現有功能
- 包含除錯程式碼（console.log、print）
- 包含被註解的程式碼區塊

## 後續步驟

驗證通過後，使用 `/commit` 建立 commit message。

## 參考

*   [Check-in Assistant Skill](../checkin-assistant/SKILL.md)
*   [Core Standard](../../core/checkin-standards.md)
*   [AC Coverage 命令](./ac-coverage.md) — AC 對測試的追溯分析
*   [AC 追溯標準](../../core/acceptance-criteria-traceability.md)
