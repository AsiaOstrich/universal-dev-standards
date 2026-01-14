---
source: ../../MAINTENANCE.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-01-08
status: current
---

# 通用開發標準 - 維護指南

> **Language**: [English](../../MAINTENANCE.md) | 繁體中文

**版本**: 1.1.0
**最後更新**: 2026-01-07

---

## 目的

本文件定義通用開發標準專案的完整維護工作流程。涵蓋所有目錄、檔案及其同步關係。

---

## 專案架構概覽

```
universal-dev-standards/
├── core/                    ← 一級來源（16 個標準）
├── options/                 ← MD 選項（18 個檔案）
├── ai/                      ← AI 優化版（52 個 YAML 檔案）
│   ├── standards/           ← 16 個 AI 標準
│   ├── options/             ← 36 個 AI 選項
│   └── MAINTENANCE.md       ← AI 專用維護指南
├── extensions/              ← 語言/框架/地區擴充（4 個檔案）
│   ├── languages/           ← 語言特定標準
│   ├── frameworks/          ← 框架特定模式
│   └── locales/             ← 地區特定規範
├── skills/                  ← Claude Code 技能（48 個檔案）
│   └── claude-code/         ← 15 個技能套件
├── adoption/                ← 採用指南（5 個檔案）
├── templates/               ← 文件模板（4 個檔案）
├── integrations/            ← AI 工具配置（7 個檔案）
├── cli/                     ← Node.js CLI 工具
├── scripts/                 ← 維護腳本
├── locales/                 ← 翻譯（129 個檔案）
│   ├── zh-TW/               ← 繁體中文
│   └── zh-CN/               ← 簡體中文（部分）
└── [根目錄檔案]              ← README、CHANGELOG、CLAUDE.md 等
```

---

## 完整同步層級

```
┌─────────────────────────────────────────────────────────────────────┐
│                          一級來源                                    │
│                         core/*.md                                    │
└─────────────────────────────────────────────────────────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   options/*.md  │    │ ai/standards/   │    │ skills/claude-  │
│   (MD 選項)     │    │   *.ai.yaml     │    │   code/*/       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
          │                       │                       │
          ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ locales/zh-TW/  │    │  ai/options/    │    │ locales/zh-TW/  │
│   options/      │    │   *.ai.yaml     │    │   skills/       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                    ┌─────────────────┐
                    │ locales/zh-TW/  │
                    │   ai/           │
                    └─────────────────┘
```

**黃金法則**：永遠從上往下更新。不要在未更新來源的情況下修改下游檔案。

---

## 目錄參考

### 1. core/（一級來源）

| 檔案 | 版本 | 說明 |
|------|------|------|
| anti-hallucination.md | 1.3.1 | AI 行為準則 |
| changelog-standards.md | 1.1.0 | 變更日誌格式 |
| checkin-standards.md | 1.3.0 | 程式碼簽入檢查表 |
| code-review-checklist.md | 1.2.0 | 程式碼審查指南 |
| commit-message-guide.md | 1.2.0 | 提交訊息格式 |
| documentation-structure.md | 1.0.0 | 文件組織 |
| documentation-writing-standards.md | 1.0.1 | 撰寫指南 |
| error-code-standards.md | 1.1.0 | 錯誤碼格式 |
| git-workflow.md | 1.1.0 | Git 工作流程 |
| logging-standards.md | 1.1.0 | 日誌指南 |
| project-structure.md | 1.1.0 | 專案組織 |
| spec-driven-development.md | 1.2.0 | SDD 工作流程 |
| test-completeness-dimensions.md | 1.0.0 | 測試維度 |
| test-driven-development.md | 1.0.0 | TDD 工作流程 |
| testing-standards.md | 2.1.0 | 測試指南 |
| versioning.md | 1.2.0 | 語意化版本 |

**總計**: 16 個檔案

---

### 2. options/（MD 選項）

提供可配置選擇的人類可讀選項檔案。

| 類別 | 檔案數 | 相關標準 |
|------|--------|----------|
| commit-message/ | 3（english、traditional-chinese、bilingual） | commit-message-guide.md |
| git-workflow/ | 6（gitflow、github-flow、trunk-based、merge-commit、squash-merge、rebase-ff） | git-workflow.md |
| project-structure/ | 5（dotnet、nodejs、python、java、go） | project-structure.md |
| testing/ | 4（unit、integration、system、e2e） | testing-standards.md |

**總計**: 18 個檔案

---

### 3. ai/（AI 優化版）

供 AI 助手使用的機器可讀 YAML 格式。詳細同步規則請參閱 [ai/MAINTENANCE.md](ai/MAINTENANCE.md)。

| 子目錄 | 檔案數 | 說明 |
|--------|--------|------|
| standards/ | 16 | AI 優化的核心標準 |
| options/changelog/ | 2 | 變更日誌選項 |
| options/code-review/ | 3 | 程式碼審查選項 |
| options/commit-message/ | 3 | 提交訊息選項 |
| options/documentation/ | 3 | 文件選項 |
| options/git-workflow/ | 6 | Git 工作流程選項 |
| options/project-structure/ | 10 | 專案結構選項（5 個僅 YAML） |
| options/testing/ | 9 | 測試選項（5 個僅 YAML） |

**總計**: 52 個 YAML 檔案

---

### 4. skills/（Claude Code 技能）

Claude Code AI 助手的技能套件。

| 技能 | 檔案數 | 相關核心標準 |
|------|--------|--------------|
| ai-collaboration-standards/ | 3 | anti-hallucination.md |
| changelog-guide/ | 2 | changelog-standards.md |
| code-review-assistant/ | 3 | code-review-checklist.md、checkin-standards.md |
| commit-standards/ | 3 | commit-message-guide.md |
| documentation-guide/ | 3 | documentation-structure.md、documentation-writing-standards.md |
| error-code-guide/ | 2 | error-code-standards.md |
| git-workflow-guide/ | 3 | git-workflow.md |
| logging-guide/ | 2 | logging-standards.md |
| project-structure-guide/ | 2 | project-structure.md |
| release-standards/ | 4 | changelog-standards.md、versioning.md |
| requirement-assistant/ | 3 | spec-driven-development.md |
| spec-driven-dev/ | 2 | spec-driven-development.md |
| tdd-assistant/ | 3 | test-driven-development.md |
| test-coverage-assistant/ | 2 | test-completeness-dimensions.md |
| testing-guide/ | 2 | testing-standards.md |

**總計**: 38 個技能檔案 + 10 個共用/README 檔案 = 48 個檔案

---

### 5. adoption/（採用指南）

| 檔案 | 說明 |
|------|------|
| ADOPTION-GUIDE.md | 主要採用指南 |
| STATIC-DYNAMIC-GUIDE.md | 靜態 vs 動態採用 |
| checklists/minimal.md | 最小採用檢查表 |
| checklists/recommended.md | 建議採用檢查表 |
| checklists/enterprise.md | 企業採用檢查表 |

**總計**: 5 個檔案

---

### 6. templates/（文件模板）

| 檔案 | 說明 |
|------|------|
| migration-template.md | 遷移文件模板 |
| requirement-template.md | 需求文件模板 |
| requirement-document-template.md | 詳細需求模板 |
| requirement-checklist.md | 需求檢查表 |

**總計**: 4 個檔案

---

### 7. integrations/（AI 工具配置）

| 工具 | 檔案 | 說明 |
|------|------|------|
| Cursor | .cursorrules | Cursor AI 規則 |
| Cline | .clinerules | Cline AI 規則 |
| Windsurf | .windsurfrules | Windsurf AI 規則 |
| GitHub Copilot | copilot-instructions.md | Copilot 指示 |
| Google Antigravity | INSTRUCTIONS.md、README.md | Antigravity 設定 |
| OpenSpec | AGENTS.md | OpenSpec 代理配置 |

**總計**: 7 個檔案

---

### 8. extensions/（語言/框架/地區擴充）

可選的語言特定、框架特定和地區特定標準擴充。

| 子目錄 | 檔案數 | 說明 |
|--------|--------|------|
| languages/ | 2 | 語言編碼風格（C#、PHP） |
| frameworks/ | 1 | 框架開發模式（Fat-Free） |
| locales/ | 1 | 地區規範（繁體中文） |

**總計**: 4 個檔案

**特性**:
- 不屬於核心標準同步鏈
- 目前無 zh-TW 翻譯（預留）
- 採用 CC BY 4.0 授權
- 由專案依需求獨立採用

**目前檔案**:
| 檔案 | 版本 | 說明 |
|------|------|------|
| languages/csharp-style.md | 1.0.1 | C# 編碼風格指南 |
| languages/php-style.md | 1.0.0 | PHP 8.1+ 編碼風格指南 |
| frameworks/fat-free-patterns.md | 1.0.0 | Fat-Free Framework 開發模式 |
| locales/zh-tw.md | 1.2.0 | 繁體中文地區規範 |

---

### 9. cli/（CLI 工具）

用於採用標準的 Node.js 命令列工具。

| 元件 | 檔案數 | 說明 |
|------|--------|------|
| bin/ | 1 | 入口點（uds.js） |
| src/commands/ | 5 | CLI 命令（init、list、check、configure、update） |
| src/prompts/ | 1 | 互動式提示 |
| src/utils/ | 4 | 工具程式（copier、detector、github、registry） |
| tests/ | 多個 | 測試檔案 |

**更新觸發**：當核心標準或選項有重大變更時。

---

### 10. locales/（翻譯）

| 語系 | 狀態 | 覆蓋率 |
|------|------|--------|
| zh-TW（繁體中文） | 活躍 | ~100% |
| zh-CN（簡體中文） | 部分 | ~10% |

**zh-TW 結構**（鏡像英文版）：
```
locales/zh-TW/
├── core/                    ← 16 個翻譯標準
├── options/                 ← 18 個翻譯 MD 選項
├── ai/
│   ├── standards/           ← 16 個翻譯 AI 標準
│   └── options/             ← 36 個翻譯 AI 選項
├── skills/claude-code/      ← 翻譯技能
├── adoption/                ← 翻譯採用指南
├── templates/               ← 翻譯模板
├── README.md
├── CLAUDE.md
└── MAINTENANCE.md           ← 本檔案
```

**總計**: zh-TW 約 129 個檔案

---

### 11. 根目錄檔案

| 檔案 | 說明 | 更新觸發 |
|------|------|----------|
| README.md | 專案概覽 | 重大變更 |
| CHANGELOG.md | 版本歷史 | 每次發布 |
| CLAUDE.md | AI 助手指示 | 專案指南變更 |
| CONTRIBUTING.md | 貢獻指南 | 流程變更 |
| STANDARDS-MAPPING.md | 標準快速參考 | 標準新增/移除 |
| MAINTENANCE.md | 本檔案 | 維護流程變更 |

---

## 完整檔案同步對照表

### 按核心標準分類

每個核心標準都有依賴樹。更新核心檔案時，必須更新所有下游檔案。

#### 簡單標準（無選項）

| 核心標準 | 下游檔案 | 總計 |
|----------|----------|------|
| anti-hallucination.md | ai/standards、skill、2x locales | ~6 |
| checkin-standards.md | ai/standards、skill、2x locales | ~6 |
| documentation-writing-standards.md | ai/standards、skill、2x locales | ~6 |
| spec-driven-development.md | ai/standards、2x locales | ~4 |
| test-completeness-dimensions.md | ai/standards、skill、2x locales | ~6 |
| error-code-standards.md | ai/standards、2x locales | ~4 |
| logging-standards.md | ai/standards、2x locales | ~4 |
| versioning.md | ai/standards、skill、2x locales | ~8 |

#### 中等複雜度（僅 YAML 選項）

| 核心標準 | 選項數 | 下游檔案 | 總計 |
|----------|--------|----------|------|
| changelog-standards.md | 2 YAML | ai/standards、ai/options、skill、locales | ~12 |
| code-review-checklist.md | 3 YAML | ai/standards、ai/options、skill、locales | ~14 |
| documentation-structure.md | 3 YAML | ai/standards、ai/options、skill、locales | ~14 |

#### 高複雜度（MD + YAML 選項）

| 核心標準 | MD 選項 | YAML 選項 | 總檔案數 |
|----------|---------|-----------|----------|
| commit-message-guide.md | 3 | 3 | ~20 |
| git-workflow.md | 6 | 6 | ~32 |

#### 非常高複雜度

| 核心標準 | MD 選項 | YAML 選項 | 總檔案數 |
|----------|---------|-----------|----------|
| project-structure.md | 5 | 10 | ~38 |
| testing-standards.md | 4 | 9 | ~34 |

---

## 標準分類：動態 vs 靜態

在決定核心標準應該轉換為技能還是加入 CLAUDE.md 時，請使用以下分類指南。

> **採用決策**：詳細的決策流程圖和部署指南請參見 [STATIC-DYNAMIC-GUIDE.md](adoption/STATIC-DYNAMIC-GUIDE.md)。

### 動態標準（適合作為技能）

具有以下特徵的標準應該成為技能：
- ✅ 有明確的觸發時機（事件、關鍵字）
- ✅ 需要決策支援（選擇、建議）
- ✅ 有步驟化的工作流程
- ✅ 能產出具體結果（訊息、檔案）

| 核心標準 | 技能 | 觸發關鍵字 |
|----------|------|------------|
| anti-hallucination.md | ai-collaboration-standards | certainty, assumption, 確定性, 推論 |
| changelog-standards.md | changelog-guide | changelog, release notes, 變更日誌 |
| code-review-checklist.md | code-review-assistant | review, PR, checklist, 審查 |
| commit-message-guide.md | commit-standards | commit, git, message, 提交訊息 |
| documentation-*.md | documentation-guide | README, docs, CONTRIBUTING, 文件 |
| error-code-standards.md | error-code-guide | error code, error handling, 錯誤碼 |
| git-workflow.md | git-workflow-guide | branch, merge, PR, 分支 |
| logging-standards.md | logging-guide | logging, log level, 日誌 |
| project-structure.md | project-structure-guide | structure, organization, 結構 |
| spec-driven-development.md | spec-driven-dev | spec, SDD, proposal, 規格, 提案 |
| test-completeness-dimensions.md | test-coverage-assistant | test coverage, 7 dimensions, 測試覆蓋 |
| test-driven-development.md | tdd-assistant | TDD, red-green-refactor, test first, 紅綠重構 |
| testing-standards.md | testing-guide | test, unit, integration, 測試 |
| versioning.md | release-standards | version, release, semver, 版本 |

### 靜態標準（適合加入 CLAUDE.md）

具有以下特徵的標準應該加入 CLAUDE.md，而非成為技能：
- ❌ 全域適用，無特定觸發時機
- ❌ 強制性規則，無需選擇
- ❌ 一次性設定
- ❌ 背景知識性質

| 核心標準 | 位置 | 原因 |
|----------|------|------|
| checkin-standards.md | CLAUDE.md | 強制性的提交前檢查表，全時適用 |

---

## 更新工作流程

### 工作流程 1：更新核心標準

```
1. 編輯 core/{standard}.md                    ← 來源
2. 更新 locales/zh-TW/core/{standard}.md      ← 翻譯
3. 更新 ai/standards/{standard}.ai.yaml       ← AI 版本
4. 更新 locales/zh-TW/ai/standards/...        ← 翻譯 AI
5. 如有 MD 選項：
   a. 更新 options/{category}/*.md
   b. 更新 locales/zh-TW/options/{category}/
6. 如有 YAML 選項：
   a. 更新 ai/options/{category}/*.ai.yaml
   b. 更新 locales/zh-TW/ai/options/{category}/
7. 如有技能：
   a. 更新 skills/claude-code/{skill}/
   b. 更新 locales/zh-TW/skills/claude-code/{skill}/
8. 執行 ./scripts/check-translation-sync.sh zh-TW
9. 如有重大變更，更新 CHANGELOG.md
```

### 工作流程 2：新增核心標準

```
1. 建立 core/{new-standard}.md
2. 建立 locales/zh-TW/core/{new-standard}.md
3. 建立 ai/standards/{new-standard}.ai.yaml
4. 建立 locales/zh-TW/ai/standards/{new-standard}.ai.yaml
5. 如需選項：
   a. 建立 options/{category}/*.md（如需 MD 選項）
   b. 建立 ai/options/{category}/*.ai.yaml
   c. 建立所有語系翻譯
6. 如需技能：
   a. 建立 skills/claude-code/{skill-name}/
   b. 建立 locales/zh-TW/skills/claude-code/{skill-name}/
7. 更新：
   - README.md（加入標準列表）
   - STANDARDS-MAPPING.md
   - CHANGELOG.md
8. 執行同步檢查
```

### 工作流程 3：新增選項

```
1. 識別父標準
2. 建立選項檔案：
   - options/{category}/{option}.md（如為 MD 選項）
   - ai/options/{category}/{option}.ai.yaml（如為 YAML 選項）
3. 更新父 ai/standards/{standard}.ai.yaml 引用新選項
4. 建立所有語系翻譯
5. 執行同步檢查
```

### 工作流程 4：新增技能

```
0. 判斷是否適合作為技能
   在建立技能前，先確認該標準是「動態」的：
   - [ ] 有明確的觸發時機（事件、關鍵字）？
   - [ ] 需要決策支援（選擇、建議）？
   - [ ] 有步驟化的工作流程？
   - [ ] 能產出具體結果（訊息、檔案）？

   若大部分為是 → 建立技能（繼續步驟 1）
   若大部分為否 → 改加入 CLAUDE.md（參見靜態標準）

1. 建立 skills/claude-code/{skill-name}/
   - SKILL.md（含 YAML frontmatter 的主要技能定義）
   - {topic}.md（選用的支援文件）
2. 建立 locales/zh-TW/skills/claude-code/{skill-name}/
   - SKILL.md（翻譯版本）
3. 更新 MAINTENANCE.md
   - 在第 4 節新增至技能表格
   - 新增至動態標準表格
4. 更新 CHANGELOG.md
```

**SKILL.md 標準結構**：
```markdown
---
name: skill-name
description: |
  簡短描述。
  Use when: 觸發情境。
  Keywords: english, keywords, 中文, 關鍵字.
---

# 技能標題

> **Language**: English | [繁體中文](path/to/zh-TW)

**Version**: 1.0.0
**Last Updated**: YYYY-MM-DD
**Applicability**: Claude Code Skills

---

## Purpose
## Quick Reference
## Detailed Guidelines
## AI-Optimized Format
## Examples
## Configuration Detection
## Related Standards
## Version History
## License
```

### 工作流程 5：更新整合

```
1. 識別哪些標準影響此整合
2. 更新 integrations/{tool}/{file}
3. 不需翻譯（工具專用）
4. 如可能，使用實際 AI 工具測試
```

### 工作流程 6：發布新版本

```
1. 確保所有同步檢查通過
2. 更新版本號：
   - package.json（cli/）
   - 修改的核心標準（meta.version）
   - 修改的 AI 標準（meta.version）
3. 用所有變更更新 CHANGELOG.md
4. 如有版本徽章，更新 README.md
5. 建立 git tag
6. 發布到 npm（如有 cli 變更）
   - Beta 版本：GitHub Actions 自動標記為 @beta
   - 穩定版本：GitHub Actions 自動標記為 @latest
   - 詳見 .github/workflows/publish.yml 自動化流程
```

**npm dist-tag 策略**：

| 版本模式 | npm Tag | 安裝指令 | 使用情境 |
|---------|---------|---------|---------|
| `X.Y.Z` | `latest` | `npm install -g universal-dev-standards` | 穩定版本 |
| `X.Y.Z-beta.N` | `beta` | `npm install -g universal-dev-standards@beta` | Beta 測試 |
| `X.Y.Z-alpha.N` | `alpha` | `npm install -g universal-dev-standards@alpha` | Alpha 測試 |
| `X.Y.Z-rc.N` | `rc` | `npm install -g universal-dev-standards@rc` | 候選版本 |

**手動修正標籤**（如需要）：
```bash
# 修正錯誤的標籤
npm dist-tag add universal-dev-standards@X.Y.Z latest
npm dist-tag add universal-dev-standards@X.Y.Z-beta.N beta
```

### 工作流程 7：更新擴充

```
1. 識別擴充類型：
   - languages/ → 語言特定編碼風格
   - frameworks/ → 框架特定模式
   - locales/ → 地區特定規範
2. 編輯 extensions/{type}/{file}.md
3. 更新檔案元資料中的版本號
4. 如有 zh-TW 翻譯：
   a. 更新 locales/zh-TW/extensions/{type}/{file}.md
5. 如有重大變更，更新 CHANGELOG.md
```

**備註**：擴充獨立於核心同步鏈，由專案依需求採用。

### 工作流程 8：更新採用指南

```
1. 編輯 adoption/{file}.md
2. 更新 locales/zh-TW/adoption/{file}.md
3. 如檢查表有變更：
   a. 確認 minimal/recommended/enterprise 之間的一致性
4. 如有重大變更，更新 CHANGELOG.md
```

### 工作流程 9：更新模板

```
1. 編輯 templates/{template}.md
2. 更新 locales/zh-TW/templates/{template}.md
3. 確認模板佔位符一致
4. 如有重大變更，更新 CHANGELOG.md
```

### 工作流程 10：更新 CLI 工具

```
1. 編輯 cli/src/{component}
2. 執行測試：cd cli && npm test
3. 執行檢查：cd cli && npm run lint
4. 如命令行為有變更：
   a. 更新 cli/README.md
   b. 更新原始碼中的說明文字
5. 如新增命令：
   a. 建立 cli/src/commands/{command}.js
   b. 在 cli/bin/uds.js 中註冊
   c. 在 cli/tests/ 中新增測試
6. 如發布，更新 package.json 版本號
7. 更新 CHANGELOG.md
```

---

## 驗證命令

**macOS / Linux:**
```bash
# 檢查翻譯同步狀態
./scripts/check-translation-sync.sh zh-TW

# 列出所有 AI 標準
ls ai/standards/*.yaml

# 列出所有 AI 選項
find ai/options -name "*.yaml" | sort

# 比較檔案數量
echo "EN standards: $(ls ai/standards/*.yaml | wc -l)"
echo "ZH standards: $(ls locales/zh-TW/ai/standards/*.yaml | wc -l)"

# 尋找缺少的選項（被引用但不存在）
grep -rh "file:.*options/" ai/standards/*.yaml | \
  sed 's/.*file: //' | sort -u | \
  while read f; do [ ! -f "ai/$f" ] && echo "Missing: $f"; done

# 計算所有專案檔案
find . -name "*.md" -not -path "./node_modules/*" | wc -l
find . -name "*.yaml" -not -path "./node_modules/*" | wc -l

# CLI 測試
cd cli && npm test
```

**Windows PowerShell:**
```powershell
# 檢查翻譯同步狀態
.\scripts\check-translation-sync.ps1 -Locale zh-TW

# 列出所有 AI 標準
Get-ChildItem ai\standards\*.yaml

# 列出所有 AI 選項
Get-ChildItem -Recurse ai\options -Filter "*.yaml" | Sort-Object FullName

# 比較檔案數量
Write-Host "EN standards: $((Get-ChildItem ai\standards\*.yaml).Count)"
Write-Host "ZH standards: $((Get-ChildItem locales\zh-TW\ai\standards\*.yaml).Count)"

# CLI 測試
Set-Location cli; npm test
```

---

## 檔案數量摘要

| 目錄 | 英文 | zh-TW | 總計 |
|------|------|-------|------|
| core/ | 16 | 16 | 32 |
| options/ | 18 | 18 | 36 |
| ai/standards/ | 16 | 16 | 32 |
| ai/options/ | 36 | 36 | 72 |
| extensions/ | 4 | 0 | 4 |
| skills/ | 38 | 38 | 76 |
| adoption/ | 5 | 5 | 10 |
| templates/ | 4 | 4 | 8 |
| integrations/ | 7 | 0 | 7 |
| 根目錄檔案 | 6 | 3 | 9 |
| **總計** | **150** | **136** | **286** |

*備註：cli/ 和 scripts/ 不包含在內（不需翻譯）*

---

## 相關文件

- [ai/MAINTENANCE.md](ai/MAINTENANCE.md) - AI 專用維護指南
- [../../CONTRIBUTING.md](../../CONTRIBUTING.md) - 貢獻指南
- [../../CHANGELOG.md](../../CHANGELOG.md) - 版本歷史
- [../../STANDARDS-MAPPING.md](../../STANDARDS-MAPPING.md) - 標準快速參考

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.1.0 | 2026-01-07 | 新增 TDD 標準和 tdd-assistant 技能，更新至 15 個技能 |
| 1.0.0 | 2025-12-30 | 初始專案層級維護指南 |

---

## 授權

本文件採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權釋出。
