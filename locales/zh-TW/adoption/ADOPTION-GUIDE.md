---
source: ../../../adoption/ADOPTION-GUIDE.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

# 規範採用指南

> **語言**: [English](../../adoption/ADOPTION-GUIDE.md) | 繁體中文
>
> 版本 1.0.0

本指南幫助軟體專案正確採用通用文件標準，避免重複引用或遺漏。

---

## 目錄

- [了解兩個專案](#了解兩個專案)
- [靜態與動態規範](#靜態與動態規範)
- [規範分類](#規範分類)
- [完整規範對照表](#完整規範對照表)
- [採用等級](#採用等級)
- [如何採用](#如何採用)
- [常見錯誤避免](#常見錯誤避免)

---

## 了解兩個專案

| 專案 | 用途 | 使用方式 |
|------|------|----------|
| **[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)** | 所有規範的權威來源 | 參考文件，複製到專案 |
| **[universal-dev-skills](https://github.com/AsiaOstrich/universal-dev-skills)** | Claude Code Skills 實作 | 互動式 AI 工作流程輔助 |

### 關鍵原則

**對於有 Skills 的規範**：安裝 Skill 或複製原始文件 — **擇一即可，不要兩者都做**。

---

## 靜態與動態規範

規範依據**應用時機**分類：

| 類型 | 說明 | 部署方式 |
|------|------|----------|
| **靜態** | 隨時生效 | 專案文件（`CLAUDE.md`） |
| **動態** | 關鍵字觸發 | Skills（按需載入） |

### 靜態規範

這 3 個規範應該在專案中**隨時生效**：

- `anti-hallucination.md` - 確定性標籤、建議原則
- `checkin-standards.md` - 建置、測試、覆蓋率門檻
- `project-structure.md` - 目錄慣例

**部署方式**：加入 `CLAUDE.md` 或 `.cursorrules`。請參閱 [CLAUDE.md.template](../../../templates/CLAUDE.md.template)。

### 動態規範

這 10 個規範由**關鍵字觸發**，按需載入：

| Skill | 觸發關鍵字 |
|-------|-----------|
| commit-standards | commit, git, 提交 |
| code-review-assistant | review, PR, 審查 |
| git-workflow-guide | branch, merge |
| testing-guide | test, coverage |
| release-standards | version, release |
| documentation-guide | docs, README |
| requirement-assistant | spec, SDD, 新功能 |

**部署方式**：透過 `skills/claude-code/install.sh` 安裝為 Skills。

> 詳細分類請參閱 [STATIC-DYNAMIC-GUIDE.md](../../../adoption/STATIC-DYNAMIC-GUIDE.md)。

---

## 規範分類

### 類別一：Skills

已製作為 Claude Code Skills 的規範，提供互動式 AI 輔助。

**採用方式**：透過 [universal-dev-skills](https://github.com/AsiaOstrich/universal-dev-skills) 安裝

```bash
git clone https://github.com/AsiaOstrich/universal-dev-skills.git
cd universal-dev-skills
./install.sh
```

### 類別二：參考文件

靜態參考文件，提供指南但沒有工作流程對應。這些不適合製作成 Skills，因為它們是查詢參考而非互動式工作流程。

**採用方式**：複製到專案的 `.standards/` 目錄

```bash
mkdir -p .standards
cp <source-file> .standards/
```

### 類別三：延伸

語言、框架或地區特定的規範。根據專案技術堆疊選用。

**採用方式**：適用於專案時複製

### 類別四：整合

各種編輯器和 AI 助理的工具配置檔。

**採用方式**：複製到工具預期的位置

### 類別五：模板

特定用途的文件模板。

**採用方式**：根據需要複製和自訂

---

## 完整規範對照表

### 核心規範

| 規範 | 類別 | Skill 名稱 | 等級 | 採用方式 |
|------|------|-----------|------|---------|
| anti-hallucination.md | Skill | ai-collaboration-standards | 1 | 安裝 Skill |
| commit-message-guide.md | Skill | commit-standards | 1 | 安裝 Skill |
| checkin-standards.md | 參考文件 | - | 1 | 複製到專案 |
| spec-driven-development.md | 參考文件 | - | 1 | 複製到專案 |
| code-review-checklist.md | Skill | code-review-assistant | 2 | 安裝 Skill |
| git-workflow.md | Skill | git-workflow-guide | 2 | 安裝 Skill |
| versioning.md | Skill | release-standards | 2 | 安裝 Skill |
| changelog-standards.md | Skill | release-standards | 2 | 安裝 Skill |
| testing-standards.md | Skill | testing-guide | 2 | 安裝 Skill |
| documentation-structure.md | Skill | documentation-guide | 3 | 安裝 Skill |
| documentation-writing-standards.md | 參考文件 | - | 3 | 複製到專案 |
| project-structure.md | 參考文件 | - | 3 | 複製到專案 |

### 延伸規範

| 規範 | 類別 | 適用範圍 | 等級 |
|------|------|---------|------|
| csharp-style.md | 延伸 | C# 專案 | 2 |
| php-style.md | 延伸 | PHP 8.1+ 專案 | 2 |
| fat-free-patterns.md | 延伸 | Fat-Free Framework | 2 |
| zh-tw.md | 延伸 | 繁體中文團隊 | 2 |

### 整合配置

| 規範 | 目標路徑 | 等級 |
|------|---------|------|
| copilot-instructions.md | .github/copilot-instructions.md | 2 |
| .cursorrules | .cursorrules | 2 |
| .windsurfrules | .windsurfrules | 2 |
| .clinerules | .clinerules | 2 |
| google-antigravity/* | 請參閱 README | 2 |
| openspec/* | 請參閱 README | 2 |

### 模板

| 模板 | 類別 | 適用範圍 | 等級 |
|------|------|---------|------|
| requirement-*.md | Skill | 所有專案 | 2 |
| migration-template.md | 模板 | 遷移專案 | 3 |

---

## 採用等級

### 等級一：基本

任何專案的最低可行標準。設置時間：約 30 分鐘。

**必要**：
- [ ] ai-collaboration-standards (Skill)
- [ ] commit-standards (Skill)
- [ ] checkin-standards.md (參考文件)
- [ ] spec-driven-development.md (參考文件)

詳細檢查清單請參閱 [checklists/minimal.md](../../../adoption/checklists/minimal.md)。

### 等級二：推薦

團隊專案的專業品質標準。設置時間：約 2 小時。

**包含等級一，加上**：
- [ ] code-review-assistant (Skill)
- [ ] git-workflow-guide (Skill)
- [ ] release-standards (Skill)
- [ ] testing-guide (Skill)
- [ ] 適用的延伸規範
- [ ] AI 工具整合

詳細檢查清單請參閱 [checklists/recommended.md](../../../adoption/checklists/recommended.md)。

### 等級三：企業

企業或受監管專案的全面標準。設置時間：1-2 天。

**包含等級二，加上**：
- [ ] documentation-guide (Skill)
- [ ] documentation-writing-standards.md (參考文件)
- [ ] project-structure.md (參考文件)
- [ ] migration-template.md (如適用)

詳細檢查清單請參閱 [checklists/enterprise.md](../../../adoption/checklists/enterprise.md)。

---

## 如何採用

### 步驟一：決定採用等級

考慮專案需求：
- **個人／副專案**：等級一
- **團隊專案**：等級二
- **企業／受監管**：等級三

### 步驟二：安裝 Skills

```bash
# 複製並安裝 universal-dev-skills
git clone https://github.com/AsiaOstrich/universal-dev-skills.git
cd universal-dev-skills
./install.sh

# 根據需求選擇安裝類型
```

### 步驟三：複製參考文件

```bash
# 在專案目錄中
mkdir -p .standards

# 根據等級複製參考文件
# 等級一
cp path/to/universal-dev-standards/core/checkin-standards.md .standards/
cp path/to/universal-dev-standards/core/spec-driven-development.md .standards/

# 等級三（額外）
cp path/to/universal-dev-standards/core/documentation-writing-standards.md .standards/
cp path/to/universal-dev-standards/core/project-structure.md .standards/
```

### 步驟四：複製適用的延伸

```bash
# 範例：PHP 專案，繁體中文團隊
cp path/to/universal-dev-standards/extensions/languages/php-style.md .standards/
cp path/to/universal-dev-standards/extensions/locales/zh-tw.md .standards/
```

### 步驟五：設置 AI 工具整合

```bash
# 範例：Cursor IDE
cp path/to/universal-dev-standards/integrations/cursor/.cursorrules .

# 範例：GitHub Copilot
mkdir -p .github
cp path/to/universal-dev-standards/integrations/github-copilot/copilot-instructions.md .github/
```

---

## 常見錯誤避免

### 錯誤一：同時引用 Skill 和原始文件

**錯誤**：
```
# 專案同時有：
- 已安裝 ai-collaboration-standards skill
- 已複製 .standards/anti-hallucination.md
```

**正確**：
```
# 專案只有其中一個：
- 已安裝 ai-collaboration-standards skill
# 或
- 已複製 .standards/anti-hallucination.md
```

### 錯誤二：遺漏僅參考文件的規範

**錯誤**：
```
# 安裝了所有 skills，但忘記參考文件
- Skills 已安裝 ✓
- checkin-standards.md ✗（遺漏）
- spec-driven-development.md ✗（遺漏）
```

**正確**：
```
# Skills 和參考文件都有
- Skills 已安裝 ✓
- .standards/checkin-standards.md ✓
- .standards/spec-driven-development.md ✓
```

### 錯誤三：忘記工具整合

如果使用 AI 編碼助理，不要忘記複製整合檔案：
- `.cursorrules` 用於 Cursor
- `.windsurfrules` 用於 Windsurf
- `.github/copilot-instructions.md` 用於 GitHub Copilot

---

## 機器可讀註冊表

工具和自動化請參閱 [standards-registry.json](../../../adoption/standards-registry.json)。

此 JSON 檔案包含所有規範、類別和採用方法的完整對照。

---

## 相關連結

- [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards) - 來源儲存庫
- [universal-dev-skills](https://github.com/AsiaOstrich/universal-dev-skills) - Skills 儲存庫
- [最小檢查清單](../../../adoption/checklists/minimal.md) - 等級一採用檢查清單
- [推薦檢查清單](../../../adoption/checklists/recommended.md) - 等級二採用檢查清單
- [企業檢查清單](../../../adoption/checklists/enterprise.md) - 等級三採用檢查清單
