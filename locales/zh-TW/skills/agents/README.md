---
source: ../../../../skills/agents/README.md
source_version: 1.1.0
translation_version: 1.0.0
last_synced: 2026-02-05
status: current
---

# UDS 代理

> **語言**: [English](../../../../skills/agents/README.md) | 繁體中文

**版本**: 1.1.0
**最後更新**: 2026-01-21
**狀態**: 穩定

---

## 概述

UDS 代理是專門的 AI 子代理，可以協調處理複雜的開發工作流程。與技能（提供上下文/知識）不同，代理是可以執行多步驟任務的自主實體。

## AGENT.md 格式規格

### Frontmatter 架構

```yaml
---
# === 必填欄位 ===
name: agent-name              # 唯一識別碼（kebab-case）
version: 1.0.0                # 語義版本
description: |                # 用於 AI 匹配的多行描述
  代理目的的簡要描述。
  關鍵字: keyword1, keyword2, keyword3.

# === 角色配置 ===
role: specialist              # orchestrator | specialist | reviewer
expertise:                    # 領域專長
  - system-design
  - api-design
  - database-modeling

# === 工具權限（Claude Code Task 工具）===
# 指定此代理可以使用哪些工具
allowed-tools:
  - Read                      # 檔案讀取
  - Glob                      # 模式匹配
  - Grep                      # 內容搜尋
  - Bash(git:*)               # 僅 Git 命令
  - WebFetch                  # 網頁抓取
  - WebSearch                 # 網頁搜尋
disallowed-tools:             # 明確封鎖的工具
  - Write                     # 不可寫入檔案
  - Edit                      # 不可編輯檔案

# === 技能依賴 ===
# 為此代理提供上下文/知識的技能
skills:
  - spec-driven-dev           # 技能名稱引用
  - testing-guide

# === 模型偏好（僅 Claude Code）===
model: claude-sonnet-4-20250514  # 偏好模型
temperature: 0.3              # 回應創造性（0.0-1.0）

# === 上下文策略（RLM 啟發）===
# 處理大型程式碼庫和長上下文的配置
context-strategy:
  mode: adaptive              # full | chunked | adaptive
  max-chunk-size: 50000       # 每個區塊的最大 token 數
  overlap: 500                # 區塊間的 token 重疊
  analysis-pattern: hierarchical  # hierarchical | parallel | sequential

# === 觸發條件 ===
triggers:
  keywords:                   # 這些關鍵字自動啟動
    - architecture
    - system design
    - 架構設計
  commands:                   # 呼叫此代理的斜線命令
    - /architect
---
```

### 角色類型

| 角色 | 描述 | 使用案例 |
|------|------|---------|
| `orchestrator` | 協調多個代理 | 複雜工作流程、功能開發 |
| `specialist` | 特定領域的深度專業 | 架構、測試、文件 |
| `reviewer` | 評估並提供回饋 | 程式碼審查、規格審查、PR 審查 |

### 工具權限模式

```yaml
# 完全工具存取（未指定時的預設）
allowed-tools: [*]

# 唯讀代理
allowed-tools: [Read, Glob, Grep]
disallowed-tools: [Write, Edit, Bash]

# 僅限 Git 的 bash 存取
allowed-tools:
  - Bash(git:*)     # 僅 git 命令
  - Bash(npm:test)  # 僅 npm test

# 特定檔案模式
allowed-tools:
  - Write(*.md)     # 僅 markdown 檔案
  - Edit(src/**)    # 僅 src 目錄
```

### 上下文策略配置（RLM 啟發）

`context-strategy` 區段使用 RLM（遞迴語言模型）原則實現對大型程式碼庫和長上下文的智慧處理。

#### 模式選項

| 模式 | 描述 | 使用案例 |
|------|------|---------|
| `full` | 一次載入完整上下文 | 小專案、文件任務 |
| `chunked` | 將上下文分成固定大小的區塊 | 順序程式碼審查、大型檔案分析 |
| `adaptive` | 根據內容結構動態調整 | 複雜分析、架構探索 |

#### 分析模式

| 模式 | 描述 | 最適合 |
|------|------|--------|
| `hierarchical` | 先分析高層結構，然後深入細節 | 架構分析、系統設計 |
| `parallel` | 同時處理多個區段 | 獨立模組分析、規格審查 |
| `sequential` | 依序處理區段，保留上下文 | 程式碼審查、逐步分析 |

## 內建代理

| 代理 | 角色 | 描述 |
|------|------|------|
| [code-architect](./code-architect.md) | specialist | 軟體架構和系統設計 |
| [test-specialist](./test-specialist.md) | specialist | 測試策略和測試實作 |
| [reviewer](./reviewer.md) | reviewer | 程式碼審查和品質評估 |
| [doc-writer](./doc-writer.md) | specialist | 文件和技術寫作 |
| [spec-analyst](./spec-analyst.md) | specialist | 規格分析和需求萃取 |

## 使用方式

### CLI 安裝

```bash
# 列出可用的代理
uds agent list

# 將特定代理安裝到專案
uds agent install code-architect

# 安裝所有代理
uds agent install --all

# 安裝到使用者目錄（全域）
uds agent install code-architect --global
```

### 在 Claude Code 中直接呼叫

```
/architect [任務描述]
```

或透過自然語言觸發：

```
請幫我設計新認證系統的架構。
```

## 建立自訂代理

### 1. 建立 AGENT.md 檔案

```bash
# 在你的專案中
mkdir -p .claude/agents
touch .claude/agents/my-agent.md
```

### 2. 定義 Frontmatter

```yaml
---
name: my-custom-agent
version: 1.0.0
description: |
  針對特定專案需求的自訂代理。
  關鍵字: custom, specific, project.

role: specialist
expertise: [domain-specific]

allowed-tools: [Read, Glob, Grep, Edit]
skills: [relevant-skill]

triggers:
  commands: [/myagent]
---
```

### 3. 撰寫代理指令

```markdown
# 我的自訂代理

## 目的

描述此代理的功能。

## 工作流程

1. 步驟一
2. 步驟二
3. 步驟三

## 指南

- 指南 1
- 指南 2
```

## 代理 vs 技能比較

| 面向 | 技能 | 代理 |
|------|------|------|
| **目的** | 提供知識/上下文 | 執行自主任務 |
| **執行** | 作為上下文載入 | 作為子代理產生（或內嵌） |
| **狀態** | 無狀態 | 可維護任務狀態 |
| **工具存取** | 無（僅上下文） | 可配置權限 |
| **觸發** | 手動載入 | 關鍵字、命令、工作流程 |
| **組合** | 由代理引用 | 可使用技能作為上下文 |

## 與工作流程整合

代理可透過工作流程定義進行協調：

```yaml
# workflows/feature-dev.workflow.yaml
name: feature-development
steps:
  - agent: spec-analyst
    task: 分析需求
  - agent: code-architect
    task: 設計解決方案
  - agent: test-specialist
    task: 定義測試策略
  - manual: 實作
  - agent: reviewer
    task: 程式碼審查
```

請參閱 [workflows/README.md](../workflows/README.md) 取得工作流程文件。

---

## 相關資源

- [技能文件](../README.md)
- [工作流程文件](../workflows/README.md)
- [AI 代理路徑配置](../../cli/src/config/ai-agent-paths.js)

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.1.0 | 2026-01-21 | 新增 RLM 啟發的 context-strategy 配置 |
| 1.0.0 | 2026-01-20 | 初始發布 |

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
