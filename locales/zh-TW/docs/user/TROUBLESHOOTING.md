---
source: docs/user/TROUBLESHOOTING.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# UDS 疑難排解指南

> **語言**: [English](../../../../docs/user/TROUBLESHOOTING.md) | 繁體中文

找到你的問題 → 照著修法做。

---

## 安裝問題

**問題：`npm install -g` 之後出現 `uds: command not found`**

```bash
# 檢查 npm 全域 bin 是否在你的 PATH 中
npm config get prefix
# 在 ~/.zshrc 或 ~/.bashrc 把 <prefix>/bin 加入 PATH
export PATH="$(npm config get prefix)/bin:$PATH"
```

**問題：`uds init` 因權限錯誤而失敗**

```bash
# 改用 Node 版本管理器（nvm/fnm），而非系統內建的 Node
# 或修正 npm 全域目錄：https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally
```

---

## Claude Code 中未顯示 Skill

**問題：我在 Claude Code 選單中看不到 `/sdd`、`/tdd` 或其他 UDS skill。**

步驟 1 — 驗證 UDS 已初始化：
```bash
uds check
```
若回報檔案遺失，重新執行 `uds init`。

步驟 2 — 驗證 `.claude/` 設定存在：
```bash
ls .claude/settings.json
```
若遺失，`uds init` 應會建立它。試試 `uds init --force`。

步驟 3 — 可能超出 skill 預算（skill 太多 → 描述被截斷）：
參閱 [skill-budget-tuning.md](../../../../docs/skill-budget-tuning.md)，將少用的 skill 降為 Tier 3。

步驟 4 — 強制重新載入 Claude Code：
關閉並重新開啟正在執行 Claude Code 的 IDE／終端機視窗。

**問題：有些 skill 看得到，有些卻看不到。**

這對 Tier 3 skill 而言是預期行為。Tier 3 skill 只顯示名稱（無描述）以節省 context 預算，而某些 AI 用戶端可能根本不列出它們。

**Tier 3 skill 仍可直接呼叫**：輸入 `/<name>` 並按 Enter。

若要讓某個 Tier 3 skill 顯示，加入你的 `.claude/settings.json`：
```json
{
  "skillOverrides": {
    "brainstorm-assistant": "on"
  }
}
```

---

## Skill 行為不如預期

**問題：Skill 有啟動，但給的是通用回應，而非 UDS 專屬的指引。**

可能原因：`.standards/` 目錄為空或過時。
```bash
uds check       # 檢查安裝了什麼
uds update      # 更新到最新標準
```

**問題：`/commit` 產生的 commit 訊息不符合 Conventional Commits。**

commit-standards skill 會讀取你既有的 commit 來學習專案風格。若你先前沒有 Conventional Commits 格式的 commit，它可能會偏離。

在 `CLAUDE.md` 加入明確指引：
```markdown
## Commit Format
Always use Conventional Commits: `<type>(<scope>): <subject>`
Types: feat, fix, docs, chore, test, refactor, style, build, ci
```

**問題：`/sdd` 建立了 spec，但我想要不同的格式。**

在你的 `CLAUDE.md` 加入內容來自訂 spec 範本：
```markdown
## Spec Format
When creating specs with /sdd, use this template:
[paste your preferred template here]
```

---

## 不使用 Claude Code 而使用 UDS

**問題：我用的是 Cursor / GitHub Copilot / Windsurf——skill 無法運作。**

Skill（`/command` 系統）為 Claude Code 專屬。對於其他 AI 工具：

1. 執行 `uds init` 並選擇你的工具——它會設定 `.cursorrules`、`.github/copilot-instructions.md` 等
2. `.standards/` 中的 Core Standards 與工具無關，能為任何讀取它們的 AI 提供 context
3. 在你的 AI 指令檔中使用下方的快速參考表

**可嵌入任何 AI 工具的快速參考：**

```markdown
## Commit Messages
Format: <type>(<scope>): <subject>
Types: feat, fix, docs, chore, test, refactor, style

## Testing Pyramid
Unit: 70% | Integration: 20% | System: 7% | E2E: 3%

## User Stories
As a [role], I want [feature], so that [benefit].
INVEST: Independent, Negotiable, Valuable, Estimable, Small, Testable
```

**Skill → Core Standard 對照**（當 skill 無法使用時）：

| Skill | 要參考的 Core Standard |
|-------|------------------------|
| `commit-standards` | `.standards/commit-message.md` |
| `testing-guide` | `.standards/testing.md` |
| `code-review-assistant` | `.standards/code-review.md` |
| `requirement-assistant` | `.standards/requirement-engineering.md` |
| `spec-driven-dev` | `.standards/spec-driven-development.md` |
| `tdd-assistant` | `.standards/test-driven-development.md` |
| `bdd-assistant` | `.standards/behavior-driven-development.md` |
| `git-workflow-guide` | `.standards/git-workflow.md` |
| `refactoring-assistant` | `.standards/refactoring-standards.md` |

---

## 更新問題

**問題：`uds update` 失敗。**

```bash
# 檢查網路／npm registry 連線
npm ping
# 試試指定 registry
npm install -g universal-dev-standards@latest
# 然後重新初始化
uds init --force
```

**問題：更新後，我的 skill 看起來壞掉了。**

更新可能變更了 skill 格式。試試：
```bash
uds check
uds init --force   # 重新安裝 skill 設定
```

---

## 一般診斷

執行 `uds check` 取得完整健康報告：
```
uds check
```

它會檢查：
- 標準安裝狀態
- Skill 設定
- AI 工具相容性
- 版本對齊

---

## 還是卡住？

- **GitHub Issues**：[github.com/AsiaOstrich/universal-dev-standards/issues](https://github.com/AsiaOstrich/universal-dev-standards/issues)
- **FAQ**：[FAQ.md](FAQ.md)
- **Skill 預算調整**：[skill-budget-tuning.md](../../../../docs/skill-budget-tuning.md)
