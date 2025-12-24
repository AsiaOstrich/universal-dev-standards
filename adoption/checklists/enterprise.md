# Level 3: Enterprise Adoption Checklist | 等級三：企業採用檢查清單

> Comprehensive standards for enterprise or regulated projects | 企業或受監管專案的全面標準
>
> Setup time: 1-2 days | 設置時間：1-2 天

---

## Prerequisites | 前置條件

- [ ] Level 2 (Recommended) completed | 等級二（推薦）已完成
- [ ] Stakeholder approval for comprehensive adoption | 利害關係人已批准全面採用
- [ ] Dedicated time for documentation review | 已分配時間進行文件審查

---

## Skills Installation | Skills 安裝

Ensure ALL skills are installed:

```bash
git clone https://github.com/AsiaOstrich/universal-dev-skills.git
cd universal-dev-skills
./install.sh
# Select: Global installation (all skills)
```

**Complete Skills Checklist | 完整 Skills 檢查清單**:

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

## Reference Documents | 參考文件

Copy all reference documents to your project:

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

**Checklist | 檢查清單**:
- [ ] `checkin-standards.md` (Level 1)
- [ ] `spec-driven-development.md` (Level 1)
- [ ] `documentation-writing-standards.md` (Level 3)
- [ ] `project-structure.md` (Level 3)

---

## Templates | 模板

### Migration Template (if applicable) | 遷移模板（如適用）

For projects involving technology migrations:

```bash
cp path/to/universal-dev-standards/templates/migration-template.md docs/
```
- [ ] `migration-template.md` copied (if applicable)

---

## Extensions | 延伸規範

Verify all applicable extensions from Level 2 are installed:

### Language Extensions
- [ ] `csharp-style.md` (if C# project)
- [ ] `php-style.md` (if PHP project)

### Framework Extensions
- [ ] `fat-free-patterns.md` (if Fat-Free project)

### Locale Extensions
- [ ] `zh-tw.md` (if Traditional Chinese team)

---

## AI Tool Integrations | AI 工具整合

Verify all applicable integrations from Level 2 are installed:

- [ ] GitHub Copilot: `.github/copilot-instructions.md`
- [ ] Cursor: `.cursorrules`
- [ ] Windsurf: `.windsurfrules`
- [ ] Cline: `.clinerules`
- [ ] OpenSpec: `.openspec/`

---

## Documentation Structure | 文件結構

Following `documentation-structure.md`, set up:

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

**Checklist | 檢查清單**:
- [ ] `README.md` created/updated
- [ ] `CONTRIBUTING.md` created
- [ ] `CHANGELOG.md` created
- [ ] `docs/` directory structure created
- [ ] `docs/adr/` for Architecture Decision Records

---

## Project Structure | 專案結構

Following `project-structure.md`, verify:

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

## Governance | 治理

### Documentation Standards

Following `documentation-writing-standards.md`:

- [ ] Document matrix defined (which docs for which project type)
- [ ] Writing guidelines communicated to team
- [ ] Review process for documentation established

### Quality Gates

Following `checkin-standards.md`:

- [ ] Pre-commit hooks configured
- [ ] CI/CD pipeline enforces standards
- [ ] Build verification automated

### Spec-Driven Development

Following `spec-driven-development.md`:

- [ ] Team trained on SDD methodology
- [ ] OpenSpec (or equivalent) workflow established
- [ ] Spec → Implementation → Verification cycle defined

---

## Compliance & Audit Trail | 合規與稽核軌跡

For regulated industries:

- [ ] Standards adoption documented
- [ ] Change management process defined
- [ ] Version control for all standards
- [ ] Regular standards review scheduled

---

## Verification | 驗證

### Full Skills Test | 完整 Skills 測試

Test each skill with relevant scenarios:

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

### Documentation Audit | 文件稽核

- [ ] All required documents exist
- [ ] Documents follow writing standards
- [ ] Documents are up-to-date

### Integration Verification | 整合驗證

- [ ] All AI tools follow project standards
- [ ] CI/CD enforces quality gates
- [ ] Team follows established workflows

---

## Final Checklist | 最終檢查清單

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

## Maintenance | 維護

### Regular Reviews | 定期審查

- [ ] Monthly: Review standards compliance
- [ ] Quarterly: Update standards if needed
- [ ] Annually: Full standards audit

### Updates | 更新

Monitor for updates:
- [ ] Subscribe to universal-dev-standards releases
- [ ] Subscribe to universal-dev-skills releases
- [ ] Plan upgrade process for new versions

---

## Summary | 摘要

Upon completion, your project has:

✅ Full AI assistance with 8 Claude Code Skills
✅ Complete reference documentation
✅ Language/framework-specific guidelines
✅ All AI tool integrations
✅ Proper documentation structure
✅ Standard project organization
✅ Governance processes

Your project now follows enterprise-grade documentation standards.

您的專案現在遵循企業級文件標準。
