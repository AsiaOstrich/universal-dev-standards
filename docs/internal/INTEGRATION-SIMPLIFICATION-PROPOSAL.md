# Integration 配置精簡提案

**Created**: 2026-03-31
**Status**: Proposal

## 現狀分析

### Integration 配置與 Skills/Standards 的重複

UDS 有 13 個 AI 工具的 Integration 配置。以 `CLAUDE.md`（140 行）和 `GEMINI.md`（184 行）為例，內容可分為 4 個角色：

| 角色 | CLAUDE.md 範例 | 重複來源 | 是否可省略 |
|------|---------------|---------|-----------|
| **啟動引導** | 語言偏好、專案概述 | 無重複 | ❌ 必要 |
| **標準清單** | "Reference: `core/testing-standards.md`" | `standards-registry.json` | 🟡 可自動生成 |
| **行為規範** | Anti-Hallucination 協議、Testing Pyramid、Refactoring 三層策略 | `.standards/*.ai.yaml` + Skills | 🔴 重複 |
| **工作流程** | Workflow Enforcement Gates、Phase Gates | `.standards/workflow-enforcement.ai.yaml` | 🔴 重複 |

### 重複程度量化

| Integration 檔案 | 總行數 | 啟動引導 | 標準清單 | 重複行為規範 | 重複比例 |
|------------------|--------|----------|---------|-------------|---------|
| `claude-code/CLAUDE.md` | 140 | ~30 | ~10 | ~100 | **71%** |
| `gemini-cli/GEMINI.md` | 184 | ~30 | ~10 | ~144 | **78%** |

### 為什麼會重複？

```
歷史原因：Integration 配置早於 context-aware-loading 和 .standards/ 機制。
當時 .ai.yaml 還不存在，所以必須在配置中內嵌規範內容。
現在 .standards/ + context-aware-loading 已能動態載入相關標準。
```

## 分層引用策略

### 按 AI 工具能力分層

| 能力等級 | AI 工具 | Integration 配置應包含 |
|----------|--------|----------------------|
| **Level 3**：有 Skills + Context Loading | Claude Code | 最小化（啟動引導 + 標準清單） |
| **Level 2**：有 Agent 指令但無 Skills | Gemini CLI, Continue.dev, Aider, Codex, OpenCode | 中等（啟動引導 + 關鍵行為引用） |
| **Level 1**：僅讀取配置 | Copilot, Cursor, Windsurf, Cline | 完整（含行為規範，因無其他載入機制） |

### Level 3 精簡範本（Claude Code 專用）

```markdown
# Project Guidelines for Claude Code

## Project Overview
[專案描述]

## Language
Traditional Chinese (繁體中文)

## Standards
This project uses UDS. Standards are loaded via context-aware-loading.
Installed standards: `.standards/*.ai.yaml`
Available skills: `.claude/skills/`

## Quick Commands
npm test / npm run lint

## Notes
- Refer to `.standards/` for all development standards
- Use slash commands for interactive guidance
- DO NOT duplicate standard content in this file
```

**從 140 行 → ~20 行，減少 86%**

### Level 2 引用範本（Gemini, Aider 等）

```markdown
# Project Guidelines

## Project Overview
[專案描述]

## Standards Reference
This project uses UDS. Key standards:
- Anti-hallucination: `.standards/anti-hallucination.ai.yaml`
- Commit messages: `.standards/commit-message.ai.yaml`
- Testing: `.standards/testing.ai.yaml`
- Workflow enforcement: `.standards/workflow-enforcement.ai.yaml`

Read the referenced .ai.yaml files for detailed rules.

## Quick Commands
npm test / npm run lint
```

**從 184 行 → ~30 行，減少 84%**

### Level 1 保持完整（Copilot, Cursor 等）

這些工具只能讀取配置檔，無法動態載入 `.standards/`，因此需要保持完整的行為規範內嵌。

## 風險與注意事項

| 風險 | 緩解措施 |
|------|---------|
| Level 2 工具可能無法讀取 .ai.yaml | 確認各工具支援讀取 YAML；若不支援，保持 Level 1 |
| 精簡後 context 不足 | context-aware-loading 會動態補充相關標準 |
| 翻譯同步負擔減輕 | 精簡後翻譯行數大幅減少，維護更容易 |

## 實施計畫

### Phase A：驗證（建議先做）
1. 在 Claude Code 中測試精簡版 CLAUDE.md，確認 context-aware-loading 能補足
2. 在 Gemini CLI 中測試引用式配置，確認能正確讀取 .ai.yaml

### Phase B：執行
1. 依 Level 分類所有 13 個 Integration
2. Level 3 工具：精簡配置
3. Level 2 工具：改為引用式
4. Level 1 工具：保持不變
5. 更新翻譯（精簡後翻譯量大幅減少）

### Phase C：驗證
1. 新增 `check-integration-sync.sh`：驗證 Integration 引用的 .standards/ 檔案存在
2. 納入 pre-release-check.sh

## 決策需求

此提案需要以下決策：
- [ ] 確認 Level 分類是否正確（哪些工具支援讀取 .ai.yaml）
- [ ] 是否接受 Level 3 的極簡方案（僅 ~20 行）
- [ ] 實施時間表（是否在下個版本進行）
