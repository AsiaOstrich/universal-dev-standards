---
name: journey-test
description: [UDS] Generate coherent user journey test plans (TESTPLAN) and E2E skeletons from a project description.
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[project description | --analyze | --archetype A1|A2|A3]"
status: stable
---

# /journey-test Command

The `/journey-test` command turns a project description into a coherent user
journey test plan (`TESTPLAN-NNN.md`) plus matching E2E skeletons, so a new
project has a complete, ordered test journey from day one.

It is backed by the `journey-test-assistant` skill
(`skills/journey-test-assistant/SKILL.md`).

## Usage

```bash
/journey-test [project description]
/journey-test --analyze
/journey-test --archetype A1|A2|A3
```

## What It Produces

| Output | Description |
|--------|-------------|
| `TESTPLAN-NNN.md` | Ordered journey steps (T-000 reset → T-001 login → T-010 core flows) with personas, environment, and a dependency graph |
| `*.journey.spec.ts` | E2E skeletons aligned to each TESTPLAN step |

## Difference from `/e2e`

- `/e2e` generates E2E skeletons from individual BDD scenarios.
- `/journey-test` plans a **connected, cross-feature journey** (a sequence of
  steps with ordering and dependencies) and then generates the skeletons.

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/journey-test` | 檢查 `test-plans/` 是否已有 TESTPLAN：有 → 詢問「更新既有」或「新建」；無 → 詢問專案描述後進入生成模式 |
| `/journey-test <project description>` | 直接進入生成模式，以該描述執行 Phase 1 |
| `/journey-test --analyze` | 進入分析模式，掃描旅程覆蓋缺口，不產生檔案 |
| `/journey-test --archetype A1\|A2\|A3` | 進入 Archetype 模式，以指定原型為骨架生成；未帶專案描述時先詢問 |

### Interaction Script | 互動腳本

先讀取 `skills/journey-test-assistant/SKILL.md`，取得 TESTPLAN 格式（T-NNN）、
Personas、Environment 與 archetype 規則，並遵守該 skill 的 `allowed-tools`。

#### Phase 1: 定義 Persona

1. 分析專案描述，識別所有使用者角色
2. 定義每個角色的 Actor / Role / Key Permissions

**Decision: 角色無法從描述判定**
- IF 描述中找不到任何角色 → 詢問使用者列舉角色，不得自行臆造
- IF 只識別出單一角色 → 明確告知並詢問是否確實為單角色系統

🛑 **STOP**: 展示 Persona 清單後等待使用者確認

#### Phase 2: 設計旅程地圖

1. 列出主要業務目標
2. 拆解為 T-NNN 步驟群組（T-000 環境重置為 optional）
3. 宣告步驟間的依賴鏈

🛑 **STOP**: 展示依賴圖後等待使用者確認順序

#### Phase 3: 生成 TESTPLAN

1. 依格式輸出 `test-plans/TESTPLAN-NNN.md`（含 Personas、步驟群組、執行順序依賴圖）

**Decision: 檔案已存在**
- IF `TESTPLAN-NNN.md` 已存在 → 詢問覆蓋或遞增編號，**不得逕行覆蓋**

#### Phase 4: 生成 E2E 骨架

1. 從 TESTPLAN 的 T-NNN 生成 `*.journey.spec.ts`（含 `describe.skipIf` 與共享 state）
2. 骨架僅含 `[TODO]` 標記，不生成臆測的斷言

🛑 **STOP**: 產物清單展示後等待使用者決定下一步

#### 分析模式（`--analyze`）

1. 讀取 `test-plans/TESTPLAN-NNN.md`（若存在）
2. 掃描 `src/e2e/` 下所有 `*.journey.spec.ts` 與 `*.journey.e2e.test.ts`
3. 比對 TESTPLAN 的 T-NNN 與測試中的 T-NNN 引用
4. 輸出 Coverage gap 報告，列出缺乏自動化對應的 T-NNN

### Stop Points | 停止點

| Stop Point | 等待內容 |
|-----------|---------|
| Persona 清單展示後 | 使用者確認角色定義正確 |
| 依賴圖展示後 | 使用者確認步驟順序 |
| TESTPLAN 檔案已存在時 | 使用者決定覆蓋或遞增編號 |
| 產物清單展示後 | 使用者決定是否補實測試內容 |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| 未提供專案描述且無既有 TESTPLAN | 詢問專案描述，不得自行假設領域 |
| 專案描述中無法識別任何角色 | 請使用者列舉角色，**不得臆造 persona** |
| `--archetype` 值不在 A1/A2/A3 | 列出三個原型的適用場景供選擇 |
| `--analyze` 但 `test-plans/` 不存在 | 告知無 TESTPLAN 可比對，建議先執行生成模式 |
| `--analyze` 但找不到任何 journey 測試 | 回報覆蓋率為 0 並列出全部 T-NNN，不視為錯誤 |

## References | 參考

- [Journey Test Assistant Skill](../journey-test-assistant/SKILL.md)
- Related: [/e2e](./e2e.md) (single-scenario E2E skeletons)
