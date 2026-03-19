---
source: ../../../../skills/commands/reverse-tdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
description: [UDS] Analyze BDD-TDD coverage gaps
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

## 參考

- 上層指令：[/reverse](../reverse-engineer/SKILL.md)
- 核心規範：[reverse-engineering-standards.md](../../core/reverse-engineering-standards.md)
