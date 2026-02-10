---
source: ../../../../adoption/checklists/enterprise.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

# 等级三：企业采用检查清单

> **语言**: [English](../../../../adoption/checklists/enterprise.md) | 繁体中文

> 企业或受监管专案的全面标准
>
> 设置时间：1-2 天

---

## 前置条件

- [ ] 等级二（推荐）已完成
- [ ] 利害关系人已批准全面采用
- [ ] 已分配时间进行文件审查

---

## Skills 安装

确保安装所有 skills:

**推荐：Plugin Marketplace**
```bash
/plugin marketplace add AsiaOstrich/universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

**完整 Skills 检查清单**:

### Level 1 Skills
- [ ] ai-collaboration-standards
- [ ] commit-standards

### Level 2 Skills
- [ ] code-review-assistant
- [ ] git-workflow-guide
- [ ] release-standards
- [ ] testing-guide
- [ ] requirement-assistant

### Level 3 Skills
- [ ] documentation-guide

---

## 参考文件

复制所有参考文件到您的专案：

**macOS / Linux:**
```bash
# In your project root
mkdir -p .standards

# Level 1 reference documents
cp path/to/universal-dev-standards/core/checkin-standards.md .standards/
cp path/to/universal-dev-standards/core/spec-driven-development.md .standards/

# Level 3 reference documents
cp path/to/universal-dev-standards/core/documentation-writing-standards.md .standards/
cp path/to/universal-dev-standards/core/project-structure.md .standards/
```

**Windows PowerShell:**
```powershell
# In your project root
New-Item -ItemType Directory -Force -Path .standards

# Level 1 reference documents
Copy-Item path\to\universal-dev-standards\core\checkin-standards.md .standards\
Copy-Item path\to\universal-dev-standards\core\spec-driven-development.md .standards\

# Level 3 reference documents
Copy-Item path\to\universal-dev-standards\core\documentation-writing-standards.md .standards\
Copy-Item path\to\universal-dev-standards\core\project-structure.md .standards\
```

**检查清单**:
- [ ] `checkin-standards.md` (Level 1)
- [ ] `spec-driven-development.md` (Level 1)
- [ ] `documentation-writing-standards.md` (Level 3)
- [ ] `project-structure.md` (Level 3)

---

## 模板

### 迁移模板（如适用）

用于涉及技术迁移的专案：

**macOS / Linux:**
```bash
cp path/to/universal-dev-standards/templates/migration-template.md docs/
```

**Windows PowerShell:**
```powershell
Copy-Item path\to\universal-dev-standards\templates\migration-template.md docs\
```
- [ ] `migration-template.md` copied (if applicable)

---

## 延伸规范

验证等级二的所有适用延伸规范已安装：

### 语言延伸
- [ ] `csharp-style.md` (if C# project)
- [ ] `php-style.md` (if PHP project)

### 框架延伸
- [ ] `fat-free-patterns.md` (if Fat-Free project)

### 地区延伸
- [ ] `zh-cn.md` (if 简体中文 team)

---

## AI 工具整合

验证等级二的所有适用整合已安装：

- [ ] GitHub Copilot: `.github/copilot-instructions.md`
- [ ] Cursor: `.cursorrules`
- [ ] Windsurf: `.windsurfrules`
- [ ] Cline: `.clinerules`
- [ ] OpenSpec: `.openspec/`

---

## 文件结构

遵循 `documentation-structure.md`，设置：

```
project/
├── README.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── guides/
│   └── adr/          # Architecture Decision Records
├── .standards/
│   ├── checkin-standards.md
│   ├── spec-driven-development.md
│   ├── documentation-writing-standards.md
│   └── project-structure.md
└── ...
```

**检查清单**:
- [ ] `README.md` created/updated
- [ ] `CONTRIBUTING.md` created
- [ ] `CHANGELOG.md` created
- [ ] `docs/` directory structure created
- [ ] `docs/adr/` for Architecture Decision Records

---

## 专案结构

遵循 `project-structure.md`，验证：

```
project/
├── src/              # Source code
├── tests/            # Test files
├── tools/            # Build and development tools
├── examples/         # Example code
├── dist/             # Build output (gitignored)
└── ...
```

- [ ] Directory structure follows standard
- [ ] `.gitignore` properly configured

---

## 治理

### 文件标准

遵循 `documentation-writing-standards.md`:

- [ ] Document matrix defined (which docs for which project type)
- [ ] Writing guidelines communicated to team
- [ ] Review process for documentation established

### 品质闸门

遵循 `checkin-standards.md`:

- [ ] Pre-commit hooks configured
- [ ] CI/CD pipeline enforces standards
- [ ] Build verification automated

### 规格驱动开发

遵循 `spec-driven-development.md`:

- [ ] Team trained on SDD methodology
- [ ] OpenSpec (or equivalent) workflow established
- [ ] Spec → Implementation → Verification cycle defined

---

## 合规与稽核轨迹

适用于受监管产业：

- [ ] Standards adoption documented
- [ ] Change management process defined
- [ ] Version control for all standards
- [ ] Regular standards review scheduled

---

## 验证

### 完整 Skills 测试

以相关情境测试每个 skill:

| Skill | Test Scenario | Pass |
|-------|--------------|------|
| ai-collaboration-standards | Ask for unverified claim | [ ] |
| commit-standards | Write complex commit | [ ] |
| code-review-assistant | Review PR | [ ] |
| git-workflow-guide | Explain branching strategy | [ ] |
| release-standards | Plan a release | [ ] |
| testing-guide | Design test strategy | [ ] |
| requirement-assistant | Write user story | [ ] |
| documentation-guide | Plan documentation | [ ] |

### 文件稽核

- [ ] All required documents exist
- [ ] Documents follow writing standards
- [ ] Documents are up-to-date

### 整合验证

- [ ] All AI tools follow project standards
- [ ] CI/CD enforces quality gates
- [ ] Team follows established workflows

---

## 最终检查清单

| Category | Items | Status |
|----------|-------|--------|
| **All Skills (8)** | Complete set installed | [ ] |
| **Reference Docs (4)** | All Level 1 + Level 3 docs | [ ] |
| **Extensions** | All applicable installed | [ ] |
| **Integrations** | All tools configured | [ ] |
| **Documentation** | Structure established | [ ] |
| **Project Structure** | Follows standard | [ ] |
| **Governance** | Processes defined | [ ] |
| **Verification** | All tests passed | [ ] |

---

## 维护

### 定期审查

- [ ] Monthly: Review standards compliance
- [ ] Quarterly: Update standards if needed
- [ ] Annually: Full standards audit

### 更新

监控更新：
- [ ] Subscribe to universal-dev-standards releases
- [ ] Subscribe to universal-dev-skills releases
- [ ] Plan upgrade process for new versions

---

## 摘要

完成后，您的专案具有：

- Full AI assistance with 8 Claude Code Skills
- Complete reference documentation
- Language/framework-specific guidelines
- All AI tool integrations
- Proper documentation structure
- Standard project organization
- Governance processes

您的专案现在遵循企业级文件标准。

---

## 相关标准

- [Essential Adoption Checklist](minimal.md) - Level 1 基本采用
- [Recommended Adoption Checklist](recommended.md) - Level 2 推荐采用
- [Documentation Writing Standards](../../../../core/documentation-writing-standards.md) - 文件撰写规范
- [Project Structure](../../../../core/project-structure.md) - 专案结构标准
- [Checkin Standards](../../../../core/checkin-standards.md) - 签入标准
- [Spec-Driven Development](../../../../core/spec-driven-development.md) - 规格驱动开发

---

## 版本历史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.1 | 2025-12-24 | Added: Related Standards, License sections |
| 1.0.0 | 2025-12-23 | Initial checklist |

---

## 授权

本检查清单以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。
