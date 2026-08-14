---
source: ../../../core/test-governance.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-08-14
status: current
---

# 測試治理標準

> **語言**: [English](../../../core/test-governance.md) | 繁體中文

**適用性**: 所有軟體專案
**範圍**: 通用 (Universal)

---

## 概述

測試治理標準定義測試活動的政策、完成準則和環境管理策略。本標準橋接 ISO/IEC/IEEE 29119 正式流程與 Agile/Scrum 實踐。

## 參考

| 標準/來源 | 內容 |
|-----------|------|
| ISO/IEC/IEEE 29119-2 | 測試流程 |
| ISO/IEC/IEEE 29119-3 | 測試文件（測試計劃/測試案例） |
| ISO/IEC/IEEE 12207 | 驗證流程 + 整合流程 |
| Agile/Scrum 指南 | 完成定義 (DoD) |
| ISTQB 基礎教學大綱 | 測試層級、測試類型 |
| Mike Cohn 測試金字塔 | 金字塔經驗比例（建議預設值） |

## 術語

| 術語 | 標準來源 | 說明 |
|------|----------|------|
| 完成定義 (DoD) | Agile/Scrum | 任務/功能完成的檢查清單 |
| 測試完成準則 | ISO 29119-2 | 測試活動的退出準則 |
| 系統整合測試 | ISO 12207 | 非正式 ISO 術語，但為業界標準 |
| 金字塔比例 70/20/7/3 | Mike Cohn（經驗值） | 建議預設值，非強制 |

---

## 測試政策

### 品質目標

| ID | 名稱 | 衡量指標 |
|----|------|----------|
| QO-1 | 缺陷密度 | < 1 缺陷/KLOC（正式發布） |
| QO-2 | 測試覆蓋率 | 依測試金字塔比例 |
| QO-3 | 回歸率 | < 5% 每次迭代 |

### 測試金字塔

| 層級 | 比例 | 執行時間 | 說明 |
|------|------|----------|------|
| 單元測試 (UT) | 70% | < 100ms/test | 測試個別函式/方法 |
| 整合測試 (IT) | 20% | < 1s/test | 測試元件互動 |
| 端對端測試 (E2E) | 7% | 數秒/test | 測試使用者工作流 |
| 效能/安全測試 | 3% | 分鐘級 | 非功能測試 |

### 完成定義 (DoD)

每個功能完成前必須滿足：

| 項目 | 說明 |
|------|------|
| 所有測試通過 | 100% 通過率 |
| 覆蓋率達標 | 符合金字塔比例 |
| 無已知缺陷 | P0/P1 缺陷為零 |
| 程式碼審查完成 | 至少一位審查者核准 |
| 文件更新 | API 文件和 CHANGELOG 已更新 |

### 門檻閘門必須 Fail Closed

一個印出百分比、卻無論有沒有達標都以 exit code `0` 結束的量測層，是一份報告，不是一道閘門。它會在自己印出的數字連續多次 commit 持續下滑時始終保持綠燈，而沒有東西擋下下一次合併。

任何有通過/失敗門檻的檢查（coverage、lint、mutation score，或任何有界的量測指標）都必須把「未達門檻」轉譯成非 0 的 exit code——透過工具自己的強制旗標，而不是透過事後重新解析輸出的包裝腳本：

| 工具 | Fail-closed 旗標 |
|------|-------------------|
| pytest-cov | `--cov-fail-under=<N>` |
| coverage.py | `coverage report --fail-under=<N>` |
| diff-cover | `diff-cover coverage.xml --fail-under=<N>` |
| nyc / Istanbul | `--check-coverage --lines <N>` |
| Stryker Mutator | `stryker.config.json` 中的 `thresholds.break` |
| ESLint | `--max-warnings 0` |

一個計算出數字、印出來、卻永遠 `exit 0` 的包裝腳本，既不滿足本條規則，也不滿足 `verification-evidence` 的證據有效性規則 1——工具的 exit code 不再帶有任何關於它量測對象的資訊。

## 測試環境管理

| 環境 | 用途 | 管理責任 |
|------|------|----------|
| 本地 (Local) | 開發者單元測試 | 開發者 |
| CI | 自動化測試 | CI/CD 管線 |
| Staging | 整合和 E2E 測試 | DevOps |
| Production | 煙霧測試和監控 | SRE |

## 規則

| ID | 觸發時機 | 指令 | 優先度 |
|----|---------|------|--------|
| enforce-completion-criteria | 完成任務或功能時 | 在將任務/功能標記為完成前，驗證所有必要的完成準則已達成 | 必須 |
| pyramid-compliance | 規劃測試策略時 | 以 70/20/7/3 金字塔比例為指引。可接受偏差，但需有文件記錄的正當理由 | 必須 |
| sit-isolation | 執行系統測試時 | 系統測試應對外部相依性使用 Stub，但使用真實的內部服務。使用 SIT 環境進行系統層級的驗證 | 建議 |
| test-execution-continuity | 新增或完成測試案例時 | 測試案例必須連接到自動化執行觸發器（CI gate、build hook 或排程執行）。存在但從未執行的測試提供假信心，比沒有測試更糟。在將測試覆蓋率標記為完成前，請確認執行歷程存在。| 必須 |
| fail-closed-threshold-gate | 設定或審查任何 coverage/lint/mutation 或其他門檻檢查時 | 該檢查必須使用工具自己的 fail-under（或等價）強制旗標，使其在未達門檻時以非 0 退出。只印出數字、永遠 exit 0 的腳本是報告，不是閘門，不滿足本條 | 必須 |

---

## 相關標準

- [測試標準](testing-standards.md)
- [提交規範](checkin-standards.md)
- [部署標準](deployment-standards.md)
- [驗證證據標準](verification-evidence.md) —— 證據有效性規範的是產出 exit code 之後如何**解讀**它；`fail-closed-threshold-gate` 規範的是閘門必須如何被**建造**，讓 exit code 一開始就帶有真實資訊
