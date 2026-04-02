---
source: ../../../skills/README.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-01-07
status: current
---

# Claude Code Skills

> **語言**: [English](../../../skills/README.md) | 繁體中文

軟體開發標準的 Claude Code Skills。

> 衍生自 [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards) 核心標準。

## 概述

這些技能會根據上下文在使用 Claude Code 時自動觸發，協助您：

- 透過基於證據的回應防止 AI 幻覺
- 撰寫一致且格式良好的提交訊息
- 進行全面的程式碼審查
- 遵循測試最佳實踐
- 使用語意化版本管理發布

## 可用的 Skills

| Skill（資料夾） | 指令 | 描述 |
|----------------|---------|-------------|
| `guide` | `/guide` | [UDS] 存取所有標準指南 |
| `checkin-assistant` | `/checkin` | [UDS] 提交前品質閘道 |
| `commit-standards` | `/commit` | [UDS] Conventional Commits 格式 |
| `code-review-assistant` | `/review` | [UDS] 系統化程式碼審查 |
| `tdd-assistant` | `/tdd` | [UDS] 測試驅動開發 |
| `bdd-assistant` | `/bdd` | [UDS] 行為驅動開發 |
| `atdd-assistant` | `/atdd` | [UDS] 驗收測試驅動開發 |
| `e2e-assistant` | `/e2e` | [UDS] 從 BDD 場景生成 E2E 測試骨架 |
| `release-standards` | `/release` | [UDS] 發布與變更日誌管理 |
| `documentation-guide` | `/docs` | [UDS] 文件管理 |
| `requirement-assistant` | `/requirement` | [UDS] 需求撰寫 |
| `reverse-engineer` | `/reverse` | [UDS] 逆向工程程式碼 |
| `forward-derivation` | `/derive` | [UDS] 從規格衍生產出物 |
| `spec-driven-dev` | `/sdd` | [UDS] 規格驅動開發 |
| `test-coverage-assistant` | `/coverage` | [UDS] 測試覆蓋率分析 |
| `methodology-system` | `/methodology` | [UDS] 開發方法論 |
| `refactoring-assistant` | `/refactor` | [UDS] 重構指引 |
| `project-discovery` | `/discover` | [UDS] 評估專案健康度與風險 |
| `brainstorm-assistant` | `/brainstorm` | [UDS] 結構化 AI 輔助構想 |
| `changelog-guide` | `/changelog` | [UDS] 生成變更日誌條目 |
| `dev-workflow-guide` | `/dev-workflow` | [UDS] 將開發階段對應到 UDS 命令 |
| `docs-generator` | `/docgen` | [UDS] 生成使用文件 |

## 靜態與動態規範

規範依據應用時機分為兩類：

Standards are classified into two types based on when they should be applied:

### 靜態規範（專案檔案）

這些規範應該**隨時生效**，建議放在專案的 `CLAUDE.md` 或 `.cursorrules` 中：

These standards should **always be active**. Add them to your project's `CLAUDE.md` or `.cursorrules`:

| Standard | 核心規則 | Key Rules |
|----------|---------|-----------|
| [anti-hallucination](../../../core/anti-hallucination.md) | 確定性標籤、建議原則 | Certainty labels, suggestion principles |
| [checkin-standards](../../../core/checkin-standards.md) | 編譯通過、測試通過、覆蓋率達標 | Build passes, tests pass, coverage met |
| [project-structure](../../../core/project-structure.md) | 目錄結構規範 | Directory structure conventions |

> 📄 參見 [CLAUDE.md.template](../../../templates/CLAUDE.md.template) 取得可直接使用的範本。
>
> 📄 See [CLAUDE.md.template](../../../templates/CLAUDE.md.template) for a ready-to-use template.

### 動態規範（Skills）

這些規範由**關鍵字觸發**，按需載入。安裝為 Skills 使用：

These are **triggered by keywords** or specific tasks. Install as Skills:

| Skill | 觸發關鍵字 | Trigger Keywords |
|-------|-----------|-----------------|
| commit-standards | 提交、訊息 | commit, git, message |
| code-review-assistant | 審查、檢查 | review, PR, checklist |
| git-workflow-guide | 分支、合併 | branch, merge, workflow |
| testing-guide | 測試、覆蓋率 | test, coverage, pyramid |
| tdd-assistant | TDD、測試優先、紅綠重構 | TDD, test first, red green refactor |
| release-standards | 版本、發布 | version, release, semver |
| documentation-guide | 文件、文檔 | README, docs, documentation |
| requirement-assistant | 規格、需求、新功能 | spec, SDD, requirement |

> 📖 參見[靜態與動態指南](../../../adoption/STATIC-DYNAMIC-GUIDE.md)了解詳細分類說明。
>
> 📖 See [Static vs Dynamic Guide](../../../adoption/STATIC-DYNAMIC-GUIDE.md) for detailed classification.

## 安裝

### 推薦：Plugin Marketplace

透過 Claude Code Plugin Marketplace 安裝以獲得自動更新：

```bash
# 新增 marketplace（一次性設定）
/plugin marketplace add AsiaOstrich/universal-dev-standards

# 安裝包含所有 15 個技能的插件
/plugin install universal-dev-standards@asia-ostrich
```

**優點：**
- ✅ Claude Code 重啟時自動更新
- ✅ 與 Claude Code 更好的整合
- ✅ 無需手動維護

所有技能將自動載入並可使用。

### 替代方案：腳本安裝（已棄用）

> ⚠️ **已棄用**：透過腳本手動安裝已棄用，將在未來版本中移除。請改用 Plugin Marketplace。

適用於無法存取 Marketplace 的環境（例如企業網路）：

#### 手動安裝（選擇性 Skills）

**macOS / Linux:**
```bash
mkdir -p ~/.claude/skills
cp -r ai-collaboration-standards ~/.claude/skills/
cp -r commit-standards ~/.claude/skills/
```

**Windows PowerShell:**
```powershell
New-Item -ItemType Directory -Force -Path $env:USERPROFILE\.claude\skills
Copy-Item -Recurse ai-collaboration-standards $env:USERPROFILE\.claude\skills\
Copy-Item -Recurse commit-standards $env:USERPROFILE\.claude\skills\
```

### 替代方案：專案層級安裝（已棄用）

> ⚠️ **已棄用**：專案層級手動安裝已棄用。建議使用 Plugin Marketplace 以獲得最佳體驗。

適用於專案特定技能自訂：

**macOS / Linux:**
```bash
mkdir -p .claude/skills
cp -r /path/to/skills/* .claude/skills/
```

**Windows PowerShell:**
```powershell
New-Item -ItemType Directory -Force -Path .claude\skills
Copy-Item -Recurse path\to\skills\claude-code\* .claude\skills\
```

> **注意**：專案層級技能（`.claude/skills/`）優先於全域技能（`~/.claude/skills/`）。

## 設定

Skills 支援透過 `CONTRIBUTING.md` 進行專案特定設定。

### 停用 Skills

在您的專案 `CONTRIBUTING.md` 中加入：

```markdown
## Disabled Skills

- testing-guide
- release-standards
```

### 設定範本

完整設定選項請參見 [CONTRIBUTING.template.md](../../../skills/CONTRIBUTING.template.md)。

## Skill 優先順序

當同一個 skill 同時存在於兩個位置時：
1. **專案層級**（`.claude/skills/`）優先
2. **全域層級**（`~/.claude/skills/`）為備援

## 授權條款

雙重授權：CC BY 4.0（文件）+ MIT（程式碼）
