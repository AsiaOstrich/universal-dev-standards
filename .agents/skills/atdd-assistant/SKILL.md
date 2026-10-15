---
name: atdd
source: ../../../../skills/atdd-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.1.0
last_synced: 2026-10-11
source_hash: 97eed4a329dc
status: current
scope: partial
description: |
  [UDS] 驗收測試驅動開發（ATDD）的參考資料：INVEST 準則、Gherkin 驗收條件格式與 Three Amigos 結構。
  Use when: 與 Product Owner 一起定義驗收條件、進行規格工作坊、用 INVEST 檢視使用者故事。
  Not for: 執行 ATDD 生命週期或強制 PO 簽核關卡——該部分已移至採用層（XSPEC-095）；撰寫單元測試——請用 /tdd。
  Keywords: ATDD, acceptance test, acceptance criteria, INVEST, specification workshop, Three Amigos, 驗收測試驅動開發, 驗收條件, 規格工作坊.
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[feature or spec | 功能或規格]"
---
<!-- DEPRECATION NOTICE (XSPEC-086 Phase 4, 2026-04-28):
  ATDD lifecycle orchestration (5-phase: WORKSHOP→DISTILLATION→DEVELOPMENT→DEMO→DONE,
  INVEST validation, AC→Gherkin conversion, RED/GREEN execution, PO sign-off gates) relocated to
  adoption layer (XSPEC-095, 2026-04-28). This Skill retains: INVEST criteria table, ATDD cycle
  diagram, Gherkin AC format, Three Amigos structure.
  For enforced lifecycle execution, use your adoption layer's toolchain.
-->

# ATDD 助手

> **語言**: [English](../../../../skills/atdd-assistant/SKILL.md) | 繁體中文

> ⚠️ **狀態：參考用（非可執行流程）** — 5 階段 ATDD 生命週期協調（WORKSHOP→DISTILLATION→DEVELOPMENT→DEMO→DONE、INVEST 驗證、AC→Gherkin 轉換、RED/GREEN 執行、PO sign-off gates）已於 2026-04-28 移至 **adoption layer（XSPEC-095）**。此處保留 INVEST 準則、ATDD 循環圖、Gherkin AC 格式、Three Amigos 結構供參考。
> 生命週期協調已移至 adoption layer（XSPEC-095）；本文件**僅供參考**。需要強制執行的流程請改用你的 adoption layer 工具鏈。

引導驗收測試驅動開發（ATDD）流程，用於定義和驗證使用者故事。

## ATDD 循環

```
WORKSHOP ──► DISTILLATION ──► DEVELOPMENT ──► DEMO ──► DONE
    ^                              │              │
    └──────────────────────────────┴──────────────┘
                  (Refinement needed)
```

## 工作流程

> 📖 以下為流程的**參考結構**，非可執行步驟；自動化／強制執行請用 adoption layer 工具鏈（XSPEC-095）。

### 1. WORKSHOP - 定義驗收條件
PO 提出使用者故事，團隊提出澄清問題，共同定義驗收條件。

### 2. DISTILLATION - 轉換為測試
將驗收條件轉換為可執行的測試格式，消除歧義，取得 PO 簽核。

### 3. DEVELOPMENT - 實作
執行驗收測試（初始應失敗），使用 BDD/TDD 進行實作，迭代直到全部通過。

### 4. DEMO - 向利害關係人展示
展示通過的驗收測試，示範可運作的功能，取得正式驗收。

### 5. DONE - 完成
PO 已驗收，程式碼已合併，故事已關閉。

## INVEST 準則

| 準則 | Description | 說明 |
|------|-------------|------|
| **I**ndependent | Can be developed separately | 可獨立開發 |
| **N**egotiable | Details can be discussed | 可協商細節 |
| **V**aluable | Delivers business value | 提供商業價值 |
| **E**stimable | Can estimate effort | 可估算工作量 |
| **S**mall | Fits in one sprint | 一個 Sprint 可完成 |
| **T**estable | Has clear acceptance criteria | 有明確驗收條件 |

## 使用者故事格式

```markdown
As a [role],
I want [feature],
So that [benefit].

### Acceptance Criteria
- Given [context], when [action], then [result]
```

## 使用方式

```
/atdd                              - 啟動互動式 ATDD 會話
/atdd "user can reset password"    - 針對特定功能
/atdd US-123                       - 處理現有使用者故事
```

## 下一步引導

`/atdd` 完成後，AI 助手應建議：

> **驗收測試已定義。建議下一步：**
> - 執行 `/sdd` 建立規格文件 ⭐ **推薦**
> - 執行 `/bdd` 將 AC 轉為 Gherkin 場景
> - 執行 `/tdd` 直接實作驗收測試

## 參考

- [驗收標準撰寫指南](./acceptance-criteria-guide.md) — 要撰寫或審查驗收標準時讀它。
- [ATDD 工作流程指南](./atdd-workflow.md) — 要完整跑一輪 ATDD 循環時讀它。
- 詳細指南：[guide.md](./guide.md)
- 核心規範：[acceptance-test-driven-development.md](../../../../core/acceptance-test-driven-development.md)

## AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/atdd`](../../../../skills/commands/atdd.md#ai-agent-behavior--ai-代理行為)
