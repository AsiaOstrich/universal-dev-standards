---
source: ../../../../skills/commands/reverse-tdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-12
source_hash: 63db65495ddc
---

---
description: [UDS] 分析 BDD-TDD 覆蓋差距
allowed-tools: Read, Grep, Glob, Write
argument-hint: "[feature file or test directory | Feature 檔案或測試目錄]"
---

# /reverse-tdd — 分析 BDD-TDD 覆蓋差距

> **Language**: [English](../../../../skills/commands/reverse-tdd.md) | 繁體中文

分析 BDD 場景與 TDD 測試覆蓋之間的差距。

## 工作流程

```
.feature + tests/ ──► Map Scenarios ──► Find Gaps ──► Report
```

1. **解析**現有 `.feature` 檔案中的場景
2. **掃描**測試檔案中對應的單元測試
3. **對應** BDD 場景與 TDD 測試覆蓋
4. **識別**覆蓋差距（沒有單元測試的場景）
5. **產生**差距報告並附帶建議

## 輸出格式

```markdown
# BDD-TDD Coverage Gap Analysis

## Coverage Summary
- Total BDD Scenarios: 12
- Covered by TDD: 9 (75%)
- Gaps Found: 3

## Gaps
| Scenario | Feature File | Missing TDD |
|----------|-------------|-------------|
| Password reset | auth.feature:15 | No unit test for token validation |
```

## 使用方式

| 指令 | 用途 |
|------|------|
| `/reverse-tdd features/` | 分析所有 feature 檔案 |
| `/reverse-tdd features/auth.feature` | 分析特定 feature |

## AI 代理行為

> 遵循 [AI 命令行為標準](../../core/ai-command-behavior.md)

### 進入路由

| 輸入 | AI 動作 |
|------|---------|
| `/reverse-tdd` | 詢問要分析的 feature 檔案或測試目錄 |
| `/reverse-tdd <path>` | 直接分析指定路徑 |

### 互動腳本

1. 解析 `.feature` 檔案中的所有場景
2. 掃描測試目錄尋找對應的單元測試
3. 建立 BDD 場景 → TDD 測試的對應關係
4. 識別覆蓋差距（有場景無對應測試）
5. 產生差距報告

**決策：差距嚴重度**
- IF 覆蓋率 ≥ 80% → 標記為 ✅ Good，列出剩餘差距
- IF 覆蓋率 50-79% → 標記為 ⚠️ Needs Improvement，建議優先補測試的場景
- IF 覆蓋率 < 50% → 標記為 ❌ Critical，建議系統性補強

🛑 **STOP**: 展示差距報告後等待使用者決定下一步

### 停止點

| 停止點 | 等待內容 |
|--------|---------|
| 差距報告展示後 | 使用者決定是否要 AI 協助補測試 |

### 錯誤處理

| 錯誤條件 | AI 動作 |
|----------|---------|
| 無 `.feature` 檔案 | 引導到 `/derive-bdd` 或 `/reverse-bdd` 先產生 |
| 測試目錄為空 | 報告 0% 覆蓋率，建議從 `/derive-tdd` 產生骨架 |
| 場景與測試命名不一致無法自動對應 | 列出無法對應的項目，詢問使用者手動確認 |

## 參考

- 上層指令：[/reverse](../reverse-engineer/SKILL.md)
- 核心規範：[reverse-engineering-standards.md](../../core/reverse-engineering-standards.md)
