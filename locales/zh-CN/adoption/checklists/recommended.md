---
source: ../../../../adoption/checklists/recommended.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

# 等级二：推荐采用检查清单

> **语言**: [English](../../../../adoption/checklists/recommended.md) | 繁体中文

> 团队专案的专业品质标准
>
> 设置时间：约 2 小时

---

## 前置条件

- [ ] 等级一（基本）已完成
- [ ] 团队已同意采用

---

## Skills 安装

安装额外的等级二 skills:

**推荐：Plugin Marketplace**
```bash
/plugin marketplace add AsiaOstrich/universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

**检查清单**:

### 来自等级一
- [ ] ai-collaboration-standards
- [ ] commit-standards

### 等级二 Skills
- [ ] code-review-assistant
- [ ] git-workflow-guide
- [ ] release-standards
- [ ] testing-guide
- [ ] requirement-assistant

---

## 参考文件

等级二没有超出等级一的额外参考文件。

**验证等级一文件**:
- [ ] `.standards/checkin-standards.md` exists
- [ ] `.standards/spec-driven-development.md` exists

---

## 延伸规范（选择适用的）

### 语言延伸

**用于 C# 专案（macOS / Linux）**:
```bash
cp path/to/universal-dev-standards/extensions/languages/csharp-style.md .standards/
```

**用于 C# 专案（Windows PowerShell）**:
```powershell
Copy-Item path\to\universal-dev-standards\extensions\languages\csharp-style.md .standards\
```
- [ ] `csharp-style.md` copied (if applicable)

**用于 PHP 专案（macOS / Linux）**:
```bash
cp path/to/universal-dev-standards/extensions/languages/php-style.md .standards/
```

**用于 PHP 专案（Windows PowerShell）**:
```powershell
Copy-Item path\to\universal-dev-standards\extensions\languages\php-style.md .standards\
```
- [ ] `php-style.md` copied (if applicable)

### 框架延伸

**用于 Fat-Free 框架（macOS / Linux）**:
```bash
cp path/to/universal-dev-standards/extensions/frameworks/fat-free-patterns.md .standards/
```

**用于 Fat-Free 框架（Windows PowerShell）**:
```powershell
Copy-Item path\to\universal-dev-standards\extensions\frameworks\fat-free-patterns.md .standards\
```
- [ ] `fat-free-patterns.md` copied (if applicable)

### 地区延伸

**用于繁体中文团队（macOS / Linux）**:
```bash
cp path/to/universal-dev-standards/extensions/locales/zh-cn.md .standards/
```

**用于繁体中文团队（Windows PowerShell）**:
```powershell
Copy-Item path\to\universal-dev-standards\extensions\locales\zh-cn.md .standards\
```
- [ ] `zh-cn.md` copied (if applicable)

---

## AI 工具整合

根据您的工具选择并安装：

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

## 团队配置

### Git 工作流程选择

Review `git-workflow.md` and select:
- [ ] Trunk-Based Development
- [ ] GitHub Flow
- [ ] GitFlow

Document decision in project README or CONTRIBUTING.md.

### 程式码审查流程

- [ ] Define required reviewers
- [ ] Set up branch protection rules
- [ ] Configure code-review-assistant skill settings

### 测试标准

- [ ] Define coverage targets (recommended: 70/20/7/3)
- [ ] Set up CI/CD pipeline
- [ ] Configure testing-guide skill settings

---

## 验证

### 测试所有 Skills

1. **commit-standards**: Write a commit → Should follow Conventional Commits
2. **code-review-assistant**: Review code → Should use systematic checklist
3. **git-workflow-guide**: Ask about branching → Should explain chosen workflow
4. **release-standards**: Ask about versioning → Should explain SemVer
5. **testing-guide**: Ask about tests → Should explain testing pyramid

### 验证整合

- [ ] AI tool follows project standards
- [ ] AI tool provides evidence-based responses

---

## 最终检查清单

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

准备升级到等级三（企业）时：
- 参见 [enterprise.md](enterprise.md)

---

## 相关标准

- [Essential Adoption Checklist](minimal.md) - Level 1 基本采用
- [Enterprise Adoption Checklist](enterprise.md) - Level 3 升级指南
- [Checkin Standards](../../../../core/checkin-standards.md) - 签入标准
- [Git Workflow](../../../../core/git-workflow.md) - Git 工作流程
- [Testing Standards](../../../../core/testing-standards.md) - 测试标准
- [Code Review Checklist](../../../../core/code-review-checklist.md) - 程式码审查

---

## 版本历史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.1 | 2025-12-24 | Added: Related Standards, License sections |
| 1.0.0 | 2025-12-23 | Initial checklist |

---

## 授权

本检查清单以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。
