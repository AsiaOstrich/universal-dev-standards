---
source: ../../../core/test-governance.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-10-11
source_hash: 45e889042c57
status: current
---

# 測試治理標準

> **語言**: [English](../../../core/test-governance.md) | 繁體中文

**版本**: 1.2.0
**最後更新**: 2026-08-14
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
| QO-1 | 功能正確性 | 測試通過率 >= 95% |
| QO-2 | 防止回歸 | CI 中零回歸失敗 |
| QO-3 | 程式碼品質 | 零 lint/型別錯誤，靜態分析通過 |

### 層級權責

| 層級 | 負責人 | 環境 | 金字塔比例 |
|------|--------|------|------------|
| 單元測試 (UT) | 開發者 | local | 70% |
| 整合測試 (IT) | 開發者 | local / ci | 20% |
| 系統測試 (ST) | QA / 開發者 | ci / sit | 7% |
| 端對端測試 (E2E) | QA | staging | 3% |

### 靜態分析

在執行測試前先執行靜態分析工具：

- `ruff check .`（Python）
- `eslint .`（TypeScript/JavaScript）
- `mypy .`（Python 型別檢查）

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

---

## 完成準則

測試完成準則定義測試活動何時可視為完成。
- **ISO 29119** 稱之為「測試完成準則」(Test Completion Criteria) 或「測試退出準則」(Test Exit Criteria)
- **Agile/Scrum** 稱之為「完成定義」(Definition of Done, DoD)

### 任務層級

每個任務的完成準則（於每個任務完成後檢查）：

| 檢查項 | 必要 | 說明 |
|--------|------|------|
| verify_command_passed | 是 | 任務的驗證指令或各測試層級全部通過 |
| no_lint_errors | 是 | 變更的檔案中沒有 lint 錯誤 |
| type_check_passed | 是 | 型別檢查通過 |

### 功能層級

每個功能的完成準則（於功能邊界檢查）：

| 檢查項 | 必要 | 說明 |
|--------|------|------|
| all_tasks_passed | 是 | 該功能中的所有任務皆已成功完成 |
| acceptance_criteria_met | 是 | 所有驗收條件皆已驗證 |
| no_regression | 是 | 沒有破壞任何既有測試 |

### 發布層級

發布的完成準則（於發布前檢查）：

| 檢查項 | 必要 | 說明 |
|--------|------|------|
| all_features_complete | 是 | 所有規劃的功能皆已完成 |
| e2e_pass | 是 | 完整 E2E 測試套件通過 |
| static_analysis_clean | 是 | 靜態分析回報零問題 |
| documentation_updated | 否 | 文件反映了變更內容 |

---

## 環境管理

| 環境 | 說明 | 用途 | Mock 策略 |
|------|------|------|-----------|
| local | 開發者工作站 | 單元測試、快速整合測試 | 記憶體內的 Mock 與 Stub |
| ci | CI/CD 管線 | 完整測試套件、lint、型別檢查、靜態分析 | 容器化相依性（testcontainers） |
| sit | 系統整合測試 | 與真實服務互動的系統測試 | 外部 API 使用 Stub，內部服務使用真實服務 |
| staging | 預備正式環境 | E2E 測試、煙霧測試 | 不使用 Mock，使用真實外部服務 |

> **注意**：SIT = 系統整合測試 (System Integration Testing)，對齊 ISO 12207 驗證流程 + 整合流程。

---

## 規則

| ID | 觸發時機 | 指令 | 優先度 |
|----|---------|------|--------|
| enforce-completion-criteria | 完成任務或功能時 | 在將任務/功能標記為完成前，驗證所有必要的完成準則已達成 | 必須 |
| pyramid-compliance | 規劃測試策略時 | 以 70/20/7/3 金字塔比例為指引。可接受偏差，但需有文件記錄的正當理由 | 必須 |
| sit-isolation | 執行系統測試時 | 系統測試應對外部相依性使用 Stub，但使用真實的內部服務。使用 SIT 環境進行系統層級的驗證 | 建議 |
| test-execution-continuity | 新增或完成測試案例時 | 測試案例必須連接到自動化執行觸發器（CI gate、build hook 或排程執行）。存在但從未執行的測試提供假信心，比沒有測試更糟。在將測試覆蓋率標記為完成前，請確認執行歷程存在。 | 必須 |
| fail-closed-threshold-gate | 設定或審查任何 coverage/lint/mutation 或其他門檻檢查時 | 該檢查必須使用工具自己的 fail-under（或等價）強制旗標，使其在未達門檻時以非 0 退出。只印出數字、永遠 exit 0 的腳本是報告，不是閘門，不滿足本條 | 必須 |

---

## 範本

- [測試計劃範本](../../../templates/test-plan-template.md) — 參考 ISO 29119-3
- [測試案例範本](../../../templates/test-case-template.md) — 參考 ISO 29119-3

---

## 相關標準

- [測試標準](testing-standards.md) — 測試金字塔與覆蓋比例
- [測試完整度維度](test-completeness-dimensions.md) — 8 維度測試覆蓋
- [提交規範](checkin-standards.md) — 提交前品質關卡
- [驗證證據標準](verification-evidence.md) — 證據有效性規範的是產出 exit code 之後如何**解讀**它；`fail-closed-threshold-gate` 規範的是閘門必須如何被**建造**，讓 exit code 一開始就帶有真實資訊

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-03-11 | 初始版本 — 測試政策、完成準則、環境管理 |
| 1.2.0 | 2026-08-14 | 新增 `fail-closed-threshold-gate` — coverage/lint/mutation 門檻檢查在未達門檻時必須以非 0 退出，而不只是印出數字 |
