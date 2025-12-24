---
source: ../../../adoption/checklists/enterprise.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

# 等級三：企業採用檢查清單

> **語言**: [English](../../../adoption/checklists/enterprise.md) | 繁體中文

> 企業或受監管專案的全面標準
>
> 設置時間：1-2 天

---

## 前置條件

- [ ] 等級二（推薦）已完成
- [ ] 利害關係人已批准全面採用
- [ ] 已分配時間進行文件審查

---

## Skills 安裝

確保安裝所有 skills:

```bash
git clone https://github.com/AsiaOstrich/universal-dev-skills.git
cd universal-dev-skills
./install.sh
# Select: Global installation (all skills)
```

**完整 Skills 檢查清單**:

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

## 參考文件

複製所有參考文件到您的專案：

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

**檢查清單**:
- [ ] `checkin-standards.md` (Level 1)
- [ ] `spec-driven-development.md` (Level 1)
- [ ] `documentation-writing-standards.md` (Level 3)
- [ ] `project-structure.md` (Level 3)

---

## 模板

### 遷移模板（如適用）

用於涉及技術遷移的專案：

```bash
cp path/to/universal-dev-standards/templates/migration-template.md docs/
```
- [ ] `migration-template.md` copied (if applicable)

---

## 延伸規範

驗證等級二的所有適用延伸規範已安裝：

### 語言延伸
- [ ] `csharp-style.md` (if C# project)
- [ ] `php-style.md` (if PHP project)

### 框架延伸
- [ ] `fat-free-patterns.md` (if Fat-Free project)

### 地區延伸
- [ ] `zh-tw.md` (if Traditional Chinese team)

---

## AI 工具整合

驗證等級二的所有適用整合已安裝：

- [ ] GitHub Copilot: `.github/copilot-instructions.md`
- [ ] Cursor: `.cursorrules`
- [ ] Windsurf: `.windsurfrules`
- [ ] Cline: `.clinerules`
- [ ] OpenSpec: `.openspec/`

---

## 文件結構

遵循 `documentation-structure.md`，設置：

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

**檢查清單**:
- [ ] `README.md` created/updated
- [ ] `CONTRIBUTING.md` created
- [ ] `CHANGELOG.md` created
- [ ] `docs/` directory structure created
- [ ] `docs/adr/` for Architecture Decision Records

---

## 專案結構

遵循 `project-structure.md`，驗證：

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

### 文件標準

遵循 `documentation-writing-standards.md`:

- [ ] Document matrix defined (which docs for which project type)
- [ ] Writing guidelines communicated to team
- [ ] Review process for documentation established

### 品質閘門

遵循 `checkin-standards.md`:

- [ ] Pre-commit hooks configured
- [ ] CI/CD pipeline enforces standards
- [ ] Build verification automated

### 規格驅動開發

遵循 `spec-driven-development.md`:

- [ ] Team trained on SDD methodology
- [ ] OpenSpec (or equivalent) workflow established
- [ ] Spec → Implementation → Verification cycle defined

---

## 合規與稽核軌跡

適用於受監管產業：

- [ ] Standards adoption documented
- [ ] Change management process defined
- [ ] Version control for all standards
- [ ] Regular standards review scheduled

---

## 驗證

### 完整 Skills 測試

以相關情境測試每個 skill:

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

### 整合驗證

- [ ] All AI tools follow project standards
- [ ] CI/CD enforces quality gates
- [ ] Team follows established workflows

---

## 最終檢查清單

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

## 維護

### 定期審查

- [ ] Monthly: Review standards compliance
- [ ] Quarterly: Update standards if needed
- [ ] Annually: Full standards audit

### 更新

監控更新：
- [ ] Subscribe to universal-dev-standards releases
- [ ] Subscribe to universal-dev-skills releases
- [ ] Plan upgrade process for new versions

---

## 摘要

完成後，您的專案具有：

- Full AI assistance with 8 Claude Code Skills
- Complete reference documentation
- Language/framework-specific guidelines
- All AI tool integrations
- Proper documentation structure
- Standard project organization
- Governance processes

您的專案現在遵循企業級文件標準。

---

## 相關標準

- [Essential Adoption Checklist](minimal.md) - Level 1 基本採用
- [Recommended Adoption Checklist](recommended.md) - Level 2 推薦採用
- [Documentation Writing Standards](../../../core/documentation-writing-standards.md) - 文件撰寫規範
- [Project Structure](../../../core/project-structure.md) - 專案結構標準
- [Checkin Standards](../../../core/checkin-standards.md) - 簽入標準
- [Spec-Driven Development](../../../core/spec-driven-development.md) - 規格驅動開發

---

## 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.1 | 2025-12-24 | Added: Related Standards, License sections |
| 1.0.0 | 2025-12-23 | Initial checklist |

---

## 授權

本檢查清單以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
