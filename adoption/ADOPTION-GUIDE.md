# Standards Adoption Guide | 規範採用指南

> Version 1.0.0 | 版本 1.0.0

This guide helps software projects adopt Universal Documentation Standards without duplication or omission.

本指南幫助軟體專案正確採用通用文件標準，避免重複引用或遺漏。

---

## Table of Contents | 目錄

- [Understanding the Two Projects | 了解兩個專案](#understanding-the-two-projects--了解兩個專案)
- [Standard Categories | 規範分類](#standard-categories--規範分類)
- [Complete Standards Matrix | 完整規範對照表](#complete-standards-matrix--完整規範對照表)
- [Adoption Levels | 採用等級](#adoption-levels--採用等級)
- [How to Adopt | 如何採用](#how-to-adopt--如何採用)
- [Common Mistakes to Avoid | 常見錯誤避免](#common-mistakes-to-avoid--常見錯誤避免)

---

## Understanding the Two Projects | 了解兩個專案

| Project | Purpose | Usage |
|---------|---------|-------|
| **[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)** | Source of truth for all standards | Reference documents, copy to project |
| **[universal-dev-skills](https://github.com/AsiaOstrich/universal-dev-skills)** | Claude Code Skills implementation | Interactive AI workflow assistance |

| 專案 | 用途 | 使用方式 |
|------|------|----------|
| **universal-dev-standards** | 所有規範的權威來源 | 參考文件，複製到專案 |
| **universal-dev-skills** | Claude Code Skills 實作 | 互動式 AI 工作流程輔助 |

### Key Principle | 關鍵原則

**For standards with Skills**: Install the Skill OR copy the source document — **never both**.

**對於有 Skills 的規範**：安裝 Skill 或複製原始文件 — **擇一即可，不要兩者都做**。

---

## Standard Categories | 規範分類

### Category 1: Skills | 類別一：Skills

Standards implemented as Claude Code Skills for interactive AI assistance.

已製作為 Claude Code Skills 的規範，提供互動式 AI 輔助。

**Adoption Method | 採用方式**: Install via [universal-dev-skills](https://github.com/AsiaOstrich/universal-dev-skills)

```bash
git clone https://github.com/AsiaOstrich/universal-dev-skills.git
cd universal-dev-skills
./install.sh
```

### Category 2: Reference Documents | 類別二：參考文件

Static reference documents that provide guidelines but don't have workflow equivalents. These are not suitable for Skills conversion because they are lookup references rather than interactive workflows.

靜態參考文件，提供指南但沒有工作流程對應。這些不適合製作成 Skills，因為它們是查詢參考而非互動式工作流程。

**Adoption Method | 採用方式**: Copy to project's `.standards/` directory

```bash
mkdir -p .standards
cp <source-file> .standards/
```

### Category 3: Extensions | 類別三：延伸

Language, framework, or locale-specific standards. Apply based on your project's technology stack.

語言、框架或地區特定的規範。根據專案技術堆疊選用。

**Adoption Method | 採用方式**: Copy if applicable to your project

### Category 4: Integrations | 類別四：整合

AI tool configuration files for various editors and assistants.

各種編輯器和 AI 助理的工具配置檔。

**Adoption Method | 採用方式**: Copy to tool's expected location

### Category 5: Templates | 類別五：模板

Document templates for specific purposes.

特定用途的文件模板。

**Adoption Method | 採用方式**: Copy and customize as needed

---

## Complete Standards Matrix | 完整規範對照表

### Core Standards | 核心規範

| Standard | Category | Skill Name | Level | Adoption |
|----------|----------|------------|-------|----------|
| anti-hallucination.md | Skill | ai-collaboration-standards | 1 | Install Skill |
| commit-message-guide.md | Skill | commit-standards | 1 | Install Skill |
| checkin-standards.md | Reference | - | 1 | Copy to project |
| spec-driven-development.md | Reference | - | 1 | Copy to project |
| code-review-checklist.md | Skill | code-review-assistant | 2 | Install Skill |
| git-workflow.md | Skill | git-workflow-guide | 2 | Install Skill |
| versioning.md | Skill | release-standards | 2 | Install Skill |
| changelog-standards.md | Skill | release-standards | 2 | Install Skill |
| testing-standards.md | Skill | testing-guide | 2 | Install Skill |
| documentation-structure.md | Skill | documentation-guide | 3 | Install Skill |
| documentation-writing-standards.md | Reference | - | 3 | Copy to project |
| project-structure.md | Reference | - | 3 | Copy to project |

### Extensions | 延伸規範

| Standard | Category | Applicability | Level |
|----------|----------|---------------|-------|
| csharp-style.md | Extension | C# projects | 2 |
| php-style.md | Extension | PHP 8.1+ projects | 2 |
| fat-free-patterns.md | Extension | Fat-Free Framework | 2 |
| zh-tw.md | Extension | Traditional Chinese teams | 2 |

### Integrations | 整合配置

| Standard | Target Path | Level |
|----------|-------------|-------|
| copilot-instructions.md | .github/copilot-instructions.md | 2 |
| .cursorrules | .cursorrules | 2 |
| .windsurfrules | .windsurfrules | 2 |
| .clinerules | .clinerules | 2 |
| google-antigravity/* | See README | 2 |
| openspec/* | See README | 2 |

### Templates | 模板

| Template | Category | Applicability | Level |
|----------|----------|---------------|-------|
| requirement-*.md | Skill | All projects | 2 |
| migration-template.md | Template | Migration projects | 3 |

---

## Adoption Levels | 採用等級

### Level 1: Essential | 等級一：基本

Minimum viable standards for any project. Setup time: ~30 minutes.

任何專案的最低可行標準。設置時間：約 30 分鐘。

**Required | 必要**:
- [ ] ai-collaboration-standards (Skill)
- [ ] commit-standards (Skill)
- [ ] checkin-standards.md (Reference)
- [ ] spec-driven-development.md (Reference)

See [checklists/minimal.md](checklists/minimal.md) for detailed checklist.

### Level 2: Recommended | 等級二：推薦

Professional quality standards for team projects. Setup time: ~2 hours.

團隊專案的專業品質標準。設置時間：約 2 小時。

**Includes Level 1, plus | 包含等級一，加上**:
- [ ] code-review-assistant (Skill)
- [ ] git-workflow-guide (Skill)
- [ ] release-standards (Skill)
- [ ] testing-guide (Skill)
- [ ] Applicable extensions
- [ ] AI tool integrations

See [checklists/recommended.md](checklists/recommended.md) for detailed checklist.

### Level 3: Enterprise | 等級三：企業

Comprehensive standards for enterprise or regulated projects. Setup time: 1-2 days.

企業或受監管專案的全面標準。設置時間：1-2 天。

**Includes Level 2, plus | 包含等級二，加上**:
- [ ] documentation-guide (Skill)
- [ ] documentation-writing-standards.md (Reference)
- [ ] project-structure.md (Reference)
- [ ] migration-template.md (if applicable)

See [checklists/enterprise.md](checklists/enterprise.md) for detailed checklist.

---

## How to Adopt | 如何採用

### Step 1: Determine Your Level | 步驟一：決定採用等級

Consider your project's needs:
- **Personal/Side project**: Level 1
- **Team project**: Level 2
- **Enterprise/Regulated**: Level 3

### Step 2: Install Skills | 步驟二：安裝 Skills

```bash
# Clone and install universal-dev-skills
git clone https://github.com/AsiaOstrich/universal-dev-skills.git
cd universal-dev-skills
./install.sh

# Choose installation type based on your needs
```

### Step 3: Copy Reference Documents | 步驟三：複製參考文件

```bash
# In your project directory
mkdir -p .standards

# Copy reference documents based on your level
# Level 1
cp path/to/universal-dev-standards/core/checkin-standards.md .standards/
cp path/to/universal-dev-standards/core/spec-driven-development.md .standards/

# Level 3 (additional)
cp path/to/universal-dev-standards/core/documentation-writing-standards.md .standards/
cp path/to/universal-dev-standards/core/project-structure.md .standards/
```

### Step 4: Copy Applicable Extensions | 步驟四：複製適用的延伸

```bash
# Example: For a PHP project with Traditional Chinese team
cp path/to/universal-dev-standards/extensions/languages/php-style.md .standards/
cp path/to/universal-dev-standards/extensions/locales/zh-tw.md .standards/
```

### Step 5: Setup AI Tool Integrations | 步驟五：設置 AI 工具整合

```bash
# Example: For Cursor IDE
cp path/to/universal-dev-standards/integrations/cursor/.cursorrules .

# Example: For GitHub Copilot
mkdir -p .github
cp path/to/universal-dev-standards/integrations/github-copilot/copilot-instructions.md .github/
```

---

## Common Mistakes to Avoid | 常見錯誤避免

### Mistake 1: Referencing Both Skill AND Source Document

**Wrong | 錯誤**:
```
# Project has both:
- ai-collaboration-standards skill installed
- .standards/anti-hallucination.md copied
```

**Correct | 正確**:
```
# Project has ONLY ONE:
- ai-collaboration-standards skill installed
# OR
- .standards/anti-hallucination.md copied
```

### Mistake 2: Missing Reference-Only Standards

**Wrong | 錯誤**:
```
# Installed all skills but forgot reference documents
- Skills installed ✓
- checkin-standards.md ✗ (missing)
- spec-driven-development.md ✗ (missing)
```

**Correct | 正確**:
```
# Both skills AND reference documents
- Skills installed ✓
- .standards/checkin-standards.md ✓
- .standards/spec-driven-development.md ✓
```

### Mistake 3: Forgetting Tool Integrations

If you use AI coding assistants, don't forget to copy the integration files:
- `.cursorrules` for Cursor
- `.windsurfrules` for Windsurf
- `.github/copilot-instructions.md` for GitHub Copilot

---

## Machine-Readable Registry | 機器可讀註冊表

For tooling and automation, see [standards-registry.json](standards-registry.json).

This JSON file contains the complete mapping of all standards, categories, and adoption methods.

---

## Related Links | 相關連結

- [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards) - Source repository
- [universal-dev-skills](https://github.com/AsiaOstrich/universal-dev-skills) - Skills repository
- [Minimal Checklist](checklists/minimal.md) - Level 1 adoption checklist
- [Recommended Checklist](checklists/recommended.md) - Level 2 adoption checklist
- [Enterprise Checklist](checklists/enterprise.md) - Level 3 adoption checklist
