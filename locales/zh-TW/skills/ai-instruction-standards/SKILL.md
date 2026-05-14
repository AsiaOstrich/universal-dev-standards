---
name: ai-instruction-standards
source: ../../../../skills/ai-instruction-standards/SKILL.md
source_version: 2.0.0
translation_version: 2.0.0
last_synced: 2026-04-28
status: current
scope: partial
description: "[UDS] 建立和維護 AI 指令檔案（CLAUDE.md、AGENTS.md、.cursor/rules/ 等）並採用適當結構"
---

# AI 指令檔案標準指南

> **語言**: [English](../../../../skills/ai-instruction-standards/SKILL.md) | 繁體中文

**版本**: 2.0.0
**最後更新**: 2026-04-28
**適用範圍**: 所有主流 AI 輔助編程工具

---

> **核心標準**: 本技能實作 [AI 指令檔案標準](../../core/ai-instruction-standards.md)。完整方法論文件請參閱核心標準。

## AI 技能層級

本技能是三層 AI 協作系統的一部分：

| 層級 | 技能 | 回答的問題 |
|------|------|-----------|
| **行為**（即時） | `/ai-collaboration` | 「AI 如何準確回應？」 |
| **配置**（Session） | `/ai-instruction-standards`（本技能） | 「CLAUDE.md / AGENTS.md 該寫什麼？」 |
| **架構**（長期） | `/ai-friendly-architecture` | 「如何讓專案對 AI 友善？」 |

## 目的

本技能協助建立和維護 AI 指令檔案，適當區分通用標準與專案特定配置，適用於所有主流 AI 輔助編程工具。

---

## 快速參考

### 支援的 AI 工具（2026-04-28 更新）

#### CLI / Agent 型（終端機代理）

| 工具 | 主要指令檔案 | Workflow 機制 | MCP |
|------|------------|--------------|-----|
| **Claude Code** | `CLAUDE.md` + `.claude/rules/*.md` | Skills (`.claude/skills/` → `/{name}`) | ✅ |
| **Gemini CLI** | `GEMINI.md` | `.gemini/commands/*.toml` → `/{name}` | ✅ |
| **OpenAI Codex CLI** | `AGENTS.md`（+ `AGENTS.override.md`） | 團隊指令；`/review` 內建 | ✅ |
| **OpenCode** | `AGENTS.md`（相容 CLAUDE.md） | 僅內建（`/init` `/undo` `/share`） | ✅ |

#### AI-native IDE / 編輯器整合

| 工具 | 主要指令檔案 | Workflow 機制 | MCP |
|------|------------|--------------|-----|
| **Cursor** | `.cursor/rules/*.mdc` ⚠️ | `@`-mention；`/multitask` | ✅ |
| **GitHub Copilot** | `.github/copilot-instructions.md` | `.github/prompts/*.prompt.md` → `/{name}` | ✅ |
| **Windsurf** | `.windsurfrules` / `.windsurf/rules/*.md` | `.windsurf/workflows/*.md` → `/{name}` | ✅ |
| **Cline** | `.clinerules` | 無 | ✅ |

> ⚠️ **Cursor**：`.cursorrules` 已**棄用** — 請遷移至 `.cursor/rules/*.mdc`

---

### 跨工具通用標準：`AGENTS.md`

`AGENTS.md` 正成為事實上的跨工具指令標準：

**支援的工具**：Gemini CLI、OpenAI Codex CLI、OpenCode、GitHub Copilot、Windsurf、Cursor
**不支援的工具**：Claude Code（使用 `CLAUDE.md`）、Cline（使用 `.clinerules`）

**建議**：多工具專案使用 `AGENTS.md` 作為通用基準，再為各工具添加特定檔案（Skills、Workflows、Prompts）。

---

### 核心原則：通用 vs 專案特定

| 類型 | 包含內容 | 範例 |
|------|----------|------|
| **通用** | 通用規則 | 「提交前執行測試」 |
| **專案特定** | 具體命令 | 「提交前執行 `npm test`」 |

---

### 建議配置

```markdown
# [專案名稱] - AI 指令

## 通用標準
<!-- 適用於任何專案的規則 -->
- Commit 訊息格式
- 程式碼審查清單
- 測試標準
- 反幻覺規則

---

## 專案特定配置
<!-- 此專案獨有的設定 -->

### 技術棧
[你的技術在此]

### 快速命令
[你的建置/測試/部署命令]

### 檔案結構
[你的專案結構]
```

---

## 各工具設定指南

### Claude Code

```
CLAUDE.md                        # 主要指令（階層式：全域 → 專案 → 子目錄）
.claude/rules/                   # Glob 範圍的附加規則
.claude/skills/{name}/SKILL.md   # 自訂斜線命令 → /{name}
.claude/agents/{name}.md         # 子代理定義
```

### Gemini CLI

```
GEMINI.md                          # 主要指令
.gemini/commands/{name}.toml       # 自訂斜線命令 → /{name}
.gemini/agents/{name}.yaml         # 子代理定義
```

`.gemini/commands/review.toml` 範例：
```toml
description = "執行程式碼審查清單"
prompt = "審查以下變更：!{git diff HEAD}"
```

### OpenAI Codex CLI

```
AGENTS.md                  # 主要指令（從 Git root 到 cwd 逐層讀取）
AGENTS.override.md         # 暫時覆蓋（最高優先級）
~/.codex/AGENTS.md         # 全域備援
.codex/agents/             # 自訂代理定義
```

### OpenCode

```
AGENTS.md                       # 主要（自動識別）
CLAUDE.md                       # 同樣識別（遷移相容性）
.opencode/agents/               # 自訂代理定義
opencode.json (instructions)    # Glob 模式檔案引用
```

### Cursor

```
.cursor/rules/                  # MDC 格式規則（取代 .cursorrules）
  {name}.mdc                    # Frontmatter: description, globs, alwaysApply
AGENTS.md                       # 也支援（代理上下文）
```

MDC frontmatter 範例：
```yaml
---
description: "TypeScript 編碼標準"
globs: ["**/*.ts", "**/*.tsx"]
alwaysApply: false
---
```

> **遷移指引**：若有 `.cursorrules`，請將內容移至 `.cursor/rules/*.mdc`。

### GitHub Copilot

```
.github/copilot-instructions.md         # 永遠啟用，所有對話
.github/instructions/*.instructions.md  # 條件式，Glob 範圍（applyTo frontmatter）
.github/prompts/*.prompt.md             # 可重用模板 → /{name} 斜線命令
.github/agents/*.agent.md               # 自訂代理，精細工具存取控制
AGENTS.md                               # 也被識別
```

### Windsurf

```
.windsurfrules                   # 專案規則（可 Git 共享）
.windsurf/rules/*.md             # MDC frontmatter 結構化規則
.windsurf/workflows/*.md         # 可重用任務序列 → /{name}
AGENTS.md                        # 也被識別
```

Workflow 範例（`.windsurf/workflows/review.md`）：
```markdown
執行程式碼審查：
1. 執行 `git diff HEAD`
2. 檢查 BLOCKING 問題（安全性、正確性）
3. 檢查 IMPORTANT 問題（設計、測試）
4. 以 BLOCKING/IMPORTANT/SUGGESTION 前綴輸出發現
```

---

## 多工具專案配置

當專案使用多個 AI 工具時：

```
project/
├── AGENTS.md                            # 通用基準（跨工具）
├── CLAUDE.md                            # Claude Code（擴展 AGENTS.md）
├── GEMINI.md                            # Gemini CLI
├── .cursor/rules/
│   └── standards.mdc                    # Cursor
├── .windsurf/
│   └── workflows/                       # Windsurf Workflows
│       ├── review.md
│       └── checkin.md
└── .github/
    ├── copilot-instructions.md          # Copilot 永遠啟用
    └── prompts/
        └── review.prompt.md             # Copilot 斜線命令
```

**最佳實踐**：將通用內容寫在 `AGENTS.md` 一次，從各工具特定檔案引用，避免重複。

---

## 內容指南

### 通用內容（保持通用）

| 類別 | 良好範例 |
|------|----------|
| **提交標準** | 「遵循 Conventional Commits 格式」 |
| **程式碼審查** | 「使用 BLOCKING、IMPORTANT、SUGGESTION 前綴」 |
| **測試** | 「維持最低 80% 覆蓋率」 |
| **AI 行為** | 「分析前務必先讀取程式碼」 |

**通用區段應避免：**
- 特定命令（`npm test`、`pytest`）
- 固定路徑（`cli/src/`、`/var/www/`）
- 版本號（`Node.js 18`、`Python 3.11`）
- 專案名稱和 URL

### 專案特定內容

| 類別 | 範例 |
|------|------|
| **技術棧** | Node.js 18、React 18、PostgreSQL 15 |
| **命令** | `npm run lint`、`./scripts/deploy.sh` |
| **檔案結構** | `src/`、`cli/`、`tests/` |
| **團隊慣例** | 繁體中文註解 |

---

## 維護檢查清單

提交 AI 指令檔案變更前：

- [ ] 通用區段不包含專案特定的路徑、命令或版本
- [ ] 專案特定區段有明確標記
- [ ] 標準文件的交叉引用正確
- [ ] 格式與現有區段一致
- [ ] 若使用 Cursor：`.cursorrules` 已遷移至 `.cursor/rules/*.mdc`
- [ ] 若為多工具專案：`AGENTS.md` 已涵蓋通用基準

---

## 配置偵測

### 偵測順序

1. 檢查是否存在 `CLAUDE.md`、`AGENTS.md`、`GEMINI.md` 或等效檔案
2. 偵測使用中的 AI 工具（檢查 `.cursor/`、`.windsurf/`、`.github/copilot-instructions.md` 等）
3. 分析內容結構是否區分通用/專案特定
4. 若未找到，**建議建立結構化 AI 指令檔案**

### 首次設定

若未找到 AI 指令檔案：

1. 詢問：「此專案沒有 AI 指令檔案。你使用哪些 AI 工具？」
2. 多工具專案推薦 `AGENTS.md` 作為基準，純 Claude Code 使用 `CLAUDE.md`
3. 確定專案類型和技術棧
4. 產生包含適當區段的範本
5. 若包含敏感資訊，新增到 `.gitignore`

---

## 相關標準

- [AI 指令檔案標準](../../core/ai-instruction-standards.md) - 核心標準
- [文件撰寫標準](../../core/documentation-writing-standards.md) - 撰寫指南
- [反幻覺規範](../../core/anti-hallucination.md) - AI 準確性規則
- [AI 友善架構](../../core/ai-friendly-architecture.md) - 上下文優化

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 2.0.0 | 2026-04-28 | 新增 Gemini CLI、OpenAI Codex CLI；更新 Cursor（MDC 格式，標記 .cursorrules 棄用）；更新 OpenCode（AGENTS.md 為主）；更新 Copilot（多種指令檔案類型）；更新 Windsurf（Workflows）；新增 AGENTS.md 跨工具標準章節 |
| 1.0.0 | 2026-01-25 | 初始發布 |

---

## 授權

本技能以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)


## Next Steps Guidance

After `/ai-instructions` completes, suggest:

> - Create or update project's `CLAUDE.md` / `AGENTS.md` ⭐ **Recommended** — Apply standards immediately
> - Run `/ai-friendly-architecture` to optimize AI collaboration at the architecture level
> - Run `/ai-collaboration` to review AI behavior guidelines

---

## Related Standards

- [AI Instruction File Standards](../../core/ai-instruction-standards.md) - Core standard
- [Documentation Writing Standards](../../core/documentation-writing-standards.md) - Writing guidelines
- [Anti-Hallucination Guidelines](../../core/anti-hallucination.md) - AI accuracy rules
- [AI-Friendly Architecture](../../core/ai-friendly-architecture.md) - Context optimization

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2026-04-28 | Add Gemini CLI, OpenAI Codex CLI; update Cursor (MDC format, deprecated .cursorrules); update OpenCode (AGENTS.md primary); update Copilot (multiple file types); update Windsurf (Workflows); add AGENTS.md cross-tool standard section |
| 1.0.0 | 2026-01-25 | Initial release |

---

## License

This skill is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
