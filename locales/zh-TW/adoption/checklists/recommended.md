---
source: ../../../../adoption/checklists/recommended.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

# 等級二：推薦採用檢查清單

> **語言**: [English](../../../adoption/checklists/recommended.md) | 繁體中文

> 團隊專案的專業品質標準
>
> 設置時間：約 2 小時

---

## 前置條件

- [ ] 等級一（基本）已完成
- [ ] 團隊已同意採用

---

## Skills 安裝

安裝額外的等級二 skills:

**推薦：Plugin Marketplace**
```bash
/plugin marketplace add AsiaOstrich/universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

**替代方案：腳本安裝（macOS / Linux）**
```bash
git clone https://github.com/AsiaOstrich/universal-dev-skills.git
cd universal-dev-skills
./install.sh
# Select: Global installation
```

**檢查清單**:

### 來自等級一
- [ ] ai-collaboration-standards
- [ ] commit-standards

### 等級二 Skills
- [ ] code-review-assistant
- [ ] git-workflow-guide
- [ ] release-standards
- [ ] testing-guide
- [ ] requirement-assistant

---

## 參考文件

等級二沒有超出等級一的額外參考文件。

**驗證等級一文件**:
- [ ] `.standards/checkin-standards.md` exists
- [ ] `.standards/spec-driven-development.md` exists

---

## 延伸規範（選擇適用的）

### 語言延伸

**用於 C# 專案（macOS / Linux）**:
```bash
cp path/to/universal-dev-standards/extensions/languages/csharp-style.md .standards/
```

**用於 C# 專案（Windows PowerShell）**:
```powershell
Copy-Item path\to\universal-dev-standards\extensions\languages\csharp-style.md .standards\
```
- [ ] `csharp-style.md` copied (if applicable)

**用於 PHP 專案（macOS / Linux）**:
```bash
cp path/to/universal-dev-standards/extensions/languages/php-style.md .standards/
```

**用於 PHP 專案（Windows PowerShell）**:
```powershell
Copy-Item path\to\universal-dev-standards\extensions\languages\php-style.md .standards\
```
- [ ] `php-style.md` copied (if applicable)

### 框架延伸

**用於 Fat-Free 框架（macOS / Linux）**:
```bash
cp path/to/universal-dev-standards/extensions/frameworks/fat-free-patterns.md .standards/
```

**用於 Fat-Free 框架（Windows PowerShell）**:
```powershell
Copy-Item path\to\universal-dev-standards\extensions\frameworks\fat-free-patterns.md .standards\
```
- [ ] `fat-free-patterns.md` copied (if applicable)

### 地區延伸

**用於繁體中文團隊（macOS / Linux）**:
```bash
cp path/to/universal-dev-standards/extensions/locales/zh-tw.md .standards/
```

**用於繁體中文團隊（Windows PowerShell）**:
```powershell
Copy-Item path\to\universal-dev-standards\extensions\locales\zh-tw.md .standards\
```
- [ ] `zh-tw.md` copied (if applicable)

---

## AI 工具整合

根據您的工具選擇並安裝：

### GitHub Copilot

**macOS / Linux:**
```bash
mkdir -p .github
cp path/to/universal-dev-standards/integrations/github-copilot/copilot-instructions.md .github/
```

**Windows PowerShell:**
```powershell
New-Item -ItemType Directory -Force -Path .github
Copy-Item path\to\universal-dev-standards\integrations\github-copilot\copilot-instructions.md .github\
```
- [ ] `.github/copilot-instructions.md` installed

### Cursor IDE

**macOS / Linux:**
```bash
cp path/to/universal-dev-standards/integrations/cursor/.cursorrules .
```

**Windows PowerShell:**
```powershell
Copy-Item path\to\universal-dev-standards\integrations\cursor\.cursorrules .
```
- [ ] `.cursorrules` installed

### Windsurf IDE

**macOS / Linux:**
```bash
cp path/to/universal-dev-standards/integrations/windsurf/.windsurfrules .
```

**Windows PowerShell:**
```powershell
Copy-Item path\to\universal-dev-standards\integrations\windsurf\.windsurfrules .
```
- [ ] `.windsurfrules` installed

### Cline

**macOS / Linux:**
```bash
cp path/to/universal-dev-standards/integrations/cline/.clinerules .
```

**Windows PowerShell:**
```powershell
Copy-Item path\to\universal-dev-standards\integrations\cline\.clinerules .
```
- [ ] `.clinerules` installed

### OpenSpec (for SDD workflow)

**macOS / Linux:**
```bash
cp -r path/to/universal-dev-standards/integrations/openspec/ .openspec/
```

**Windows PowerShell:**
```powershell
Copy-Item -Recurse path\to\universal-dev-standards\integrations\openspec\ .openspec\
```
- [ ] `.openspec/` directory installed

---

## 團隊配置

### Git 工作流程選擇

Review `git-workflow.md` and select:
- [ ] Trunk-Based Development
- [ ] GitHub Flow
- [ ] GitFlow

Document decision in project README or CONTRIBUTING.md.

### 程式碼審查流程

- [ ] Define required reviewers
- [ ] Set up branch protection rules
- [ ] Configure code-review-assistant skill settings

### 測試標準

- [ ] Define coverage targets (recommended: 70/20/7/3)
- [ ] Set up CI/CD pipeline
- [ ] Configure testing-guide skill settings

---

## 驗證

### 測試所有 Skills

1. **commit-standards**: Write a commit → Should follow Conventional Commits
2. **code-review-assistant**: Review code → Should use systematic checklist
3. **git-workflow-guide**: Ask about branching → Should explain chosen workflow
4. **release-standards**: Ask about versioning → Should explain SemVer
5. **testing-guide**: Ask about tests → Should explain testing pyramid

### 驗證整合

- [ ] AI tool follows project standards
- [ ] AI tool provides evidence-based responses

---

## 最終檢查清單

| Category | Items | Status |
|----------|-------|--------|
| **Level 1 Skills** | ai-collaboration-standards, commit-standards | [ ] |
| **Level 2 Skills** | code-review-assistant, git-workflow-guide, release-standards, testing-guide, requirement-assistant | [ ] |
| **Reference Docs** | checkin-standards.md, spec-driven-development.md | [ ] |
| **Extensions** | (selected based on project) | [ ] |
| **Integrations** | (selected based on tools) | [ ] |
| **Team Config** | Workflow, review process, testing targets | [ ] |

---

## 下一步

準備升級到等級三（企業）時：
- 參見 [enterprise.md](enterprise.md)

---

## 相關標準

- [Essential Adoption Checklist](minimal.md) - Level 1 基本採用
- [Enterprise Adoption Checklist](enterprise.md) - Level 3 升級指南
- [Checkin Standards](../../../core/checkin-standards.md) - 簽入標準
- [Git Workflow](../../../core/git-workflow.md) - Git 工作流程
- [Testing Standards](../../../core/testing-standards.md) - 測試標準
- [Code Review Checklist](../../../core/code-review-checklist.md) - 程式碼審查

---

## 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.1 | 2025-12-24 | Added: Related Standards, License sections |
| 1.0.0 | 2025-12-23 | Initial checklist |

---

## 授權

本檢查清單以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
