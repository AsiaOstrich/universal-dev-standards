# Level 3: Enterprise Adoption Checklist

> **Language**: English | [繁體中文](../../locales/zh-TW/adoption/checklists/enterprise.md)

> Comprehensive standards for enterprise or regulated projects
>
> Setup time: 1-2 days

---

## Prerequisites

- [ ] Level 2 (Recommended) completed
- [ ] Stakeholder approval for comprehensive adoption
- [ ] Dedicated time for documentation review

---

## Skills Installation

Ensure ALL skills are installed:

**Recommended: Plugin Marketplace**
```bash
/plugin marketplace add AsiaOstrich/universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

**Complete Skills Checklist**:

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

## Reference Documents

Copy all reference documents to your project:

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

**Checklist**:
- [ ] `checkin-standards.md` (Level 1)
- [ ] `spec-driven-development.md` (Level 1)
- [ ] `documentation-writing-standards.md` (Level 3)
- [ ] `project-structure.md` (Level 3)

---

## Templates

### Migration Template (if applicable)

For projects involving technology migrations:

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

## Extensions

Verify all applicable extensions from Level 2 are installed:

### Language Extensions
- [ ] `csharp-style.md` (if C# project)
- [ ] `php-style.md` (if PHP project)

### Framework Extensions
- [ ] `fat-free-patterns.md` (if Fat-Free project)

### Locale Extensions
- [ ] `zh-tw.md` (if Traditional Chinese team)

---

## AI Tool Integrations

Verify all applicable integrations from Level 2 are installed:

- [ ] GitHub Copilot: `.github/copilot-instructions.md`
- [ ] Cursor: `.cursorrules`
- [ ] Windsurf: `.windsurfrules`
- [ ] Cline: `.clinerules`
- [ ] OpenSpec: `.openspec/`

---

## Documentation Structure

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

**Checklist**:
- [ ] `README.md` created/updated
- [ ] `CONTRIBUTING.md` created
- [ ] `CHANGELOG.md` created
- [ ] `docs/` directory structure created
- [ ] `docs/adr/` for Architecture Decision Records

---

## Project Structure

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

## Governance

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

## Compliance & Audit Trail

For regulated industries:

- [ ] Standards adoption documented
- [ ] Change management process defined
- [ ] Version control for all standards
- [ ] Regular standards review scheduled

---

## Verification

### Full Skills Test

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

### Documentation Audit

- [ ] All required documents exist
- [ ] Documents follow writing standards
- [ ] Documents are up-to-date

### Integration Verification

- [ ] All AI tools follow project standards
- [ ] CI/CD enforces quality gates
- [ ] Team follows established workflows

---

## Final Checklist

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

## Maintenance

### Regular Reviews

- [ ] Monthly: Review standards compliance
- [ ] Quarterly: Update standards if needed
- [ ] Annually: Full standards audit

### Updates

Monitor for updates:
- [ ] Subscribe to universal-dev-standards releases
- [ ] Subscribe to universal-dev-skills releases
- [ ] Plan upgrade process for new versions

---

## Summary

Upon completion, your project has:

- Full AI assistance with 8 Claude Code Skills
- Complete reference documentation
- Language/framework-specific guidelines
- All AI tool integrations
- Proper documentation structure
- Standard project organization
- Governance processes

Your project now follows enterprise-grade documentation standards.

---

## Related Standards

- [Essential Adoption Checklist](minimal.md) - Level 1 basics
- [Recommended Adoption Checklist](recommended.md) - Level 2 professional standards
- [Documentation Writing Standards](../../core/documentation-writing-standards.md) - Writing guidelines
- [Project Structure](../../core/project-structure.md) - Organization standards
- [Checkin Standards](../../core/checkin-standards.md) - Quality gate standards
- [Spec-Driven Development](../../core/spec-driven-development.md) - Development methodology

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.1 | 2025-12-24 | Added: Related Standards, License sections |
| 1.0.0 | 2025-12-23 | Initial checklist |

---

## License

This checklist is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
