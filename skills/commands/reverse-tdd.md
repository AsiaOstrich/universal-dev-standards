---
description: [UDS] Analyze BDD-TDD coverage gaps
allowed-tools: Read, Grep, Glob, Write
argument-hint: "[feature file or test directory | Feature 檔案或測試目錄]"
---

# /reverse-tdd — Analyze BDD-TDD Coverage Gaps | 分析 BDD-TDD 覆蓋差距

Analyze gaps between BDD scenarios and TDD test coverage.

分析 BDD 場景與 TDD 測試覆蓋之間的差距。

## Workflow | 工作流程

```
.feature + tests/ ──► Map Scenarios ──► Find Gaps ──► Report
```

1. **Parse** existing `.feature` files for scenarios
2. **Scan** test files for corresponding unit tests
3. **Map** BDD scenarios to TDD test coverage
4. **Identify** coverage gaps (scenarios without unit tests)
5. **Generate** gap report with recommendations

## Output Format | 輸出格式

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

## Usage | 使用方式

| Command | Purpose | 用途 |
|---------|---------|------|
| `/reverse-tdd features/` | Analyze all feature files | 分析所有 feature 檔案 |
| `/reverse-tdd features/auth.feature` | Analyze specific feature | 分析特定 feature |

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/reverse-tdd` | 詢問要分析的 feature 檔案或測試目錄 |
| `/reverse-tdd <path>` | 直接分析指定路徑 |

### Interaction Script | 互動腳本

1. 解析 `.feature` 檔案中的所有場景
2. 掃描測試目錄尋找對應的單元測試
3. 建立 BDD 場景 → TDD 測試的對應關係
4. 識別覆蓋差距（有場景無對應測試）
5. 生成差距報告

**Decision: 差距嚴重度**
- IF 覆蓋率 ≥ 80% → 標記為 ✅ Good，列出剩餘差距
- IF 覆蓋率 50-79% → 標記為 ⚠️ Needs Improvement，建議優先補測試的場景
- IF 覆蓋率 < 50% → 標記為 ❌ Critical，建議系統性補強

🛑 **STOP**: 展示差距報告後等待使用者決定下一步

### Stop Points | 停止點

| Stop Point | 等待內容 |
|-----------|---------|
| 差距報告展示後 | 使用者決定是否要 AI 協助補測試 |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| 無 `.feature` 檔案 | 引導到 `/derive-bdd` 或 `/reverse-bdd` 先生成 |
| 測試目錄為空 | 報告 0% 覆蓋率，建議從 `/derive-tdd` 生成骨架 |
| 場景與測試命名不一致無法自動對應 | 列出無法對應的項目，詢問使用者手動確認 |

## Reference | 參考

- Parent command: [/reverse](../reverse-engineer/SKILL.md)
- Core standard: [reverse-engineering-standards.md](../../core/reverse-engineering-standards.md)
