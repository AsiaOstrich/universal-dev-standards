# Universal Development Standards
# 通用開發規範

**Version**: 2.0.0
**Last Updated**: 2025-12-19
**License**: [Dual License](LICENSE) (CC BY 4.0 + MIT)

---

## 📋 Purpose | 目的

This repository provides **language-agnostic, framework-agnostic, domain-agnostic** documentation standards for software projects. These standards ensure consistency, quality, and maintainability across diverse technology stacks.

本儲存庫提供**語言無關、框架無關、領域無關**的軟體專案文件規範。這些標準確保跨不同技術棧的一致性、品質與可維護性。

---

## 🎯 Core Principles | 核心原則

1. **Universal Applicability** | 通用適用性
   Standards work for any programming language, framework, or domain

2. **Modular Design** | 模組化設計
   Pick and choose standards relevant to your project

3. **Extensible Architecture** | 可擴充架構
   Extend with language-specific, framework-specific, or domain-specific rules

4. **Evidence-Based** | 基於證據
   Standards derived from industry best practices and real-world validation

5. **Self-Contained** | 自成一體
   Each standard is independently usable without dependencies

---

## 📦 What's Inside | 內容概覽

```
universal-dev-standards/
├── core/                           # Core universal standards
│   ├── anti-hallucination.md      # AI collaboration guidelines
│   ├── checkin-standards.md       # Code check-in quality gates
│   ├── commit-message-guide.md    # Commit message conventions
│   ├── spec-driven-development.md # ✅ SDD methodology & standards
│   ├── git-workflow.md            # Git branching strategies
│   ├── code-review-checklist.md   # Code review guidelines
│   ├── documentation-structure.md # Documentation organization
│   ├── project-structure.md       # Project directory conventions
│   ├── versioning.md              # Semantic versioning guide
│   ├── changelog-standards.md     # Changelog writing guide
│   └── testing-standards.md       # Testing standards (UT/IT/ST/E2E)
│
├── extensions/                     # Optional extensions
│   ├── languages/                 # Language-specific standards
│   │   └── csharp-style.md        # ✅ C# coding conventions
│   ├── frameworks/                # Framework-specific standards
│   │   └── (coming soon)
│   ├── locales/                   # Locale-specific standards
│   │   └── zh-tw.md               # ✅ Traditional Chinese
│   └── domains/                   # Domain-specific standards
│       └── (coming soon)
│
├── templates/                      # Project document templates
│   ├── requirement-document-template.md  # ✅ Requirement doc format
│   ├── requirement-checklist.md          # ✅ Requirement checklist
│   ├── requirement-template.md           # ✅ Blank requirement template
│   └── docs/
│       └── (coming soon)
│
├── integrations/                   # Tool integrations
│   ├── cline/                     # Cline integration
│   ├── cursor/                    # Cursor integration
│   ├── github-copilot/            # GitHub Copilot integration
│   ├── google-antigravity/        # Google Antigravity integration
│   ├── windsurf/                  # Windsurf integration
│   └── openspec/                  # OpenSpec framework
│       ├── AGENTS.md
│       ├── commands/
│       └── project.md.template
│
└── examples/                       # Real-world examples
    ├── dotnet-web-api/
    ├── react-spa/
    └── README.md
```

---

## 🔗 Standards Adoption | 規範採用

### Using with Claude Code (Recommended) | 搭配 Claude Code 使用（推薦）

If you use Claude Code, install **[universal-dev-skills](https://github.com/AsiaOstrich/universal-dev-skills)** for interactive AI assistance:

如果您使用 Claude Code，安裝 **[universal-dev-skills](https://github.com/AsiaOstrich/universal-dev-skills)** 獲得互動式 AI 輔助：

```bash
git clone https://github.com/AsiaOstrich/universal-dev-skills.git
cd universal-dev-skills
./install.sh
```

### Standards Coverage | 規範涵蓋範圍

| Standard | Skill Available | Adoption |
|----------|----------------|----------|
| anti-hallucination.md | ✅ ai-collaboration-standards | Install Skill |
| commit-message-guide.md | ✅ commit-standards | Install Skill |
| code-review-checklist.md | ✅ code-review-assistant | Install Skill |
| git-workflow.md | ✅ git-workflow-guide | Install Skill |
| versioning.md + changelog-standards.md | ✅ release-standards | Install Skill |
| testing-standards.md | ✅ testing-guide | Install Skill |
| documentation-structure.md | ✅ documentation-guide | Install Skill |
| requirement templates | ✅ requirement-assistant | Install Skill |
| **checkin-standards.md** | ❌ | Copy to project |
| **spec-driven-development.md** | ❌ | Copy to project |
| **documentation-writing-standards.md** | ❌ | Copy to project |
| **project-structure.md** | ❌ | Copy to project |
| Language/Framework extensions | ❌ | Copy if applicable |
| AI tool integrations | ❌ | Copy to tool location |

> **Important**: For standards with Skills available, use the Skill OR copy the source document — **never both**.
>
> **重要**：對於有 Skill 的規範，使用 Skill 或複製原始文件 — **擇一即可，不要兩者都做**。

📖 See [Adoption Guide](adoption/ADOPTION-GUIDE.md) for complete guidance and checklists.

### Using CLI Tool | 使用 CLI 工具

```bash
# Clone and setup CLI (one-time)
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards/cli && npm install && npm link

# In your project directory
cd your-project
uds init    # Interactive initialization
uds check   # Check adoption status
uds update  # Update to latest version
```

📖 See [CLI README](cli/README.md) for detailed CLI usage.

---

## 🚀 Quick Start | 快速開始

### Step 1: Choose Core Standards | 選擇核心規範

**Minimal Setup (Required)**:
```bash
# Copy essential standards to your project
cp core/anti-hallucination.md your-project/.standards/
cp core/checkin-standards.md your-project/.standards/
cp core/commit-message-guide.md your-project/.standards/
```

**Recommended Setup**:
```bash
# Copy all core standards
cp core/*.md your-project/.standards/
```

---

### Step 2: Add Language/Framework Extensions | 新增語言/框架擴充

**For .NET Projects**:
```bash
cp extensions/languages/csharp-style.md your-project/.standards/
cp extensions/frameworks/dotnet.md your-project/.standards/
```

**For TypeScript Projects**:
```bash
cp extensions/languages/typescript-style.md your-project/.standards/
```

**For Python Projects**:
```bash
cp extensions/languages/python-style.md your-project/.standards/
```

---

### Step 3: Configure Project-Specific Settings | 設定專案特定設定

Edit `your-project/CONTRIBUTING.md` or `your-project/.standards/PROJECT-CONFIG.md`:

```markdown
## Documentation Standards Configuration

### Commit Message Language
- Type Language: **English** (feat, fix, refactor)
- Subject Language: **English**

### Git Workflow
- Strategy: **GitFlow**
- Main branches: `main`, `develop`
- Feature branch prefix: `feature/`
- Hotfix branch prefix: `hotfix/`

### Code Quality Tools
- Linter: ESLint
- Formatter: Prettier
- Test Framework: Jest
- Minimum Test Coverage: 80%

### Check-in Requirements
- ✅ Build must pass
- ✅ All tests must pass
- ✅ Linter must pass with 0 errors
- ✅ Test coverage ≥80%
```

---

### Step 4 (Optional): Use Templates | 使用範本

```bash
# Initialize project documentation
cp templates/README.md.template your-project/README.md
cp templates/CONTRIBUTING.md.template your-project/CONTRIBUTING.md
cp templates/CHANGELOG.md.template your-project/CHANGELOG.md

# Customize templates by replacing placeholders
# [PROJECT_NAME] → Your Project Name
# [DESCRIPTION] → Your project description
# etc.
```

---

## 📊 Standard Levels | 規範等級

### 🟢 Level 1: Essential (Minimum Viable Standards)

**Every project MUST have**:
- ✅ `anti-hallucination.md` - AI collaboration guidelines
- ✅ `checkin-standards.md` - Quality gates before commit
- ✅ `commit-message-guide.md` - Standardized commit format
- ✅ `spec-driven-development.md` - Spec-Driven Development standards

**Estimated Setup Time**: 30 minutes
**Recommended For**: All projects, especially AI-assisted development

---

### 🟡 Level 2: Recommended (Professional Quality)

**Include Level 1 +**:
- ✅ `git-workflow.md` - Branching strategy
- ✅ `code-review-checklist.md` - Review guidelines
- ✅ `versioning.md` - Version management
- ✅ `changelog-standards.md` - Changelog writing guide
- ✅ `testing-standards.md` - Testing pyramid (UT/IT/ST/E2E)
- ✅ Language-specific style guide (e.g., `csharp-style.md`)

**Estimated Setup Time**: 2 hours
**Recommended For**: Team projects, open-source projects

---

### 🔵 Level 3: Comprehensive (Enterprise Grade)

**Include Level 2 +**:
- ✅ `documentation-structure.md` - Docs organization
- ✅ Framework-specific standards (e.g., `dotnet.md`)
- ✅ Domain-specific standards (e.g., `fintech.md`)
- ✅ OpenSpec integration for spec-driven development
- ✅ Full template suite (README, CONTRIBUTING, CHANGELOG, API docs)

**Estimated Setup Time**: 1-2 days
**Recommended For**: Enterprise projects, regulated industries, large teams

---

## 🔧 Customization Guide | 自訂指南

### Adapting Standards to Your Project | 調整規範以符合專案需求

All core standards include **"Project-Specific Customization"** sections. Customize by:

1. **Language Choice** | 語言選擇
   ```markdown
   ## Commit Message Language Choice
   - English: feat, fix, refactor
   - Traditional Chinese: 新增, 修正, 重構
   - Spanish: característica, corrección, refactorización
   ```

2. **Tool Configuration** | 工具設定
   ```markdown
   ## Build Command
   ```bash
   npm run build  # Node.js project
   dotnet build   # .NET project
   mvn package    # Java project
   ```
   ```

3. **Threshold Adjustment** | 閾值調整
   ```markdown
   ## Quality Thresholds
   - Test Coverage: 80% (adjust based on project maturity)
   - Max Method Length: 50 lines (adjust based on language)
   - Max Cyclomatic Complexity: 10 (standard)
   ```

4. **Scope Definition** | 範圍定義
   ```markdown
   ## Allowed Commit Scopes
   - auth: Authentication module
   - payment: Payment processing
   - [add your modules here]
   ```

---

## 🌍 Multi-Language Support | 多語言支援

### Commit Message Language Examples | Commit 訊息語言範例

**English**:
```
feat(auth): Add OAuth2 support
fix(api): Resolve memory leak
docs(readme): Update installation guide
```

**Traditional Chinese**:
```
新增(認證): 實作 OAuth2 支援
修正(API): 解決記憶體洩漏
文件(README): 更新安裝指南
```

**Spanish**:
```
característica(auth): Agregar soporte OAuth2
corrección(api): Resolver fuga de memoria
documentación(readme): Actualizar guía de instalación
```

**Japanese**:
```
機能(認証): OAuth2サポートを追加
修正(API): メモリリークを解決
文書(README): インストールガイドを更新
```

---

## 🛠️ Tool Integration | 工具整合

### Git Hooks | Git 掛鉤

**Install commitlint** (Node.js projects):
```bash
npm install --save-dev @commitlint/{cli,config-conventional}
npm install --save-dev husky

# Initialize husky
npx husky install
npx husky add .husky/commit-msg 'npx commitlint --edit $1'
```

**Configure commitlint**:
```javascript
// .commitlintrc.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'refactor', 'docs', 'test', 'perf', 'build', 'ci', 'chore']
    ]
  }
};
```

---

### CI/CD Integration | CI/CD 整合

**GitHub Actions Example**:
```yaml
# .github/workflows/quality-gate.yml
name: Quality Gate

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Validate Commit Messages
        run: npx commitlint --from HEAD~1 --to HEAD --verbose

      - name: Build
        run: npm run build

      - name: Test
        run: npm test -- --coverage

      - name: Lint
        run: npm run lint

      - name: Check Coverage
        run: |
          coverage=$(npx nyc report --reporter=text-summary | grep 'Lines' | awk '{print $3}' | sed 's/%//')
          if (( $(echo "$coverage < 80" | bc -l) )); then
            echo "Coverage $coverage% is below 80%"
            exit 1
          fi
```

---

### OpenSpec Integration | OpenSpec 整合

For spec-driven development, integrate OpenSpec:

```bash
# Copy OpenSpec framework
cp -r integrations/openspec/ your-project/openspec/

# Create .claude/commands directory
mkdir -p your-project/.claude/commands/
cp integrations/openspec/commands/* your-project/.claude/commands/
```

**Usage**:
```bash
# Propose a new change
/openspec proposal "Add user authentication"

# Apply approved spec
/openspec apply specs/auth-feature

# Archive completed spec
/openspec archive specs/auth-feature
```

---

## 📚 Examples | 範例

### Example 1: .NET Web API Project

**Standards Configuration**:
```
✅ Core Standards
   - anti-hallucination.md
   - checkin-standards.md
   - commit-message-guide.md (English types)
   - git-workflow.md (GitFlow)

✅ Extensions
   - languages/csharp-style.md
   - frameworks/dotnet.md

✅ Templates
   - CLAUDE.md (customized for .NET)
   - README.md
   - CONTRIBUTING.md
```

See `examples/dotnet-web-api/` for full implementation.

---

### Example 2: React SPA Project

**Standards Configuration**:
```
✅ Core Standards
   - anti-hallucination.md
   - checkin-standards.md
   - commit-message-guide.md (English types)
   - git-workflow.md (GitHub Flow)

✅ Extensions
   - languages/typescript-style.md
   - frameworks/react.md

✅ Tools
   - ESLint + Prettier
   - Husky + commitlint
   - Jest + React Testing Library
```

See `examples/react-spa/` for full implementation.

---

### Example 3: Python ML Project

**Standards Configuration**:
```
✅ Core Standards
   - anti-hallucination.md
   - checkin-standards.md
   - commit-message-guide.md (English types)
   - git-workflow.md (Trunk-Based)

✅ Extensions
   - languages/python-style.md
   - domains/machine-learning.md

✅ Tools
   - Black (formatter)
   - pylint (linter)
   - pytest (testing)
   - mypy (type checking)
```

See `examples/python-ml/` for full implementation.

---

## 🤝 Contributing | 貢獻

We welcome contributions to improve these standards!

### How to Contribute | 如何貢獻

1. **Suggest Improvements**: Open an issue describing the problem and proposed solution
2. **Add Examples**: Submit examples of how you've applied these standards
3. **Extend Standards**: Contribute new language/framework/domain extensions
4. **Translate**: Help translate standards to other languages

### Contribution Guidelines | 貢獻指南

All contributions must:
- ✅ Maintain language/framework/domain agnosticism (for core standards)
- ✅ Include examples in at least 2 different contexts
- ✅ Follow the existing documentation structure
- ✅ Be licensed under CC BY 4.0

---

## 📖 Further Reading | 延伸閱讀

### Related Standards and Frameworks

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Git Best Practices](https://sethrobertson.github.io/GitBestPractices/)
- [Code Review Best Practices](https://google.github.io/eng-practices/review/)

### Books and Articles

- **The Art of Readable Code** by Boswell & Foucher
- **Clean Code** by Robert C. Martin
- **The Pragmatic Programmer** by Hunt & Thomas
- **Accelerate** by Forsgren, Humble, and Kim

---

## 🔄 Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.3.0 | 2025-12-15 | Added: changelog-standards.md; Updated: versioning.md, git-workflow.md (cross-references), zh-tw.md (terminology) |
| 1.2.0 | 2025-12-11 | Added: project-structure.md; Updated: documentation-structure.md (file naming, version alignment), checkin-standards.md (directory hygiene) |
| 1.1.0 | 2025-12-05 | Added: testing-standards.md (UT/IT/ST/E2E) |
| 1.0.0 | 2025-11-12 | Initial release with core standards |

---

## 📄 License | 授權

This project uses **dual licensing**:

本專案採用**雙重授權**：

| Component | License | 說明 |
|-----------|---------|------|
| Documentation (`core/`, `extensions/`, `templates/`, etc.) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | 文件與規範 |
| CLI Tool (`cli/`) | [MIT](cli/LICENSE) | CLI 工具程式碼 |

Both licenses are permissive and allow commercial use, modification, and redistribution.

兩種授權都是寬鬆型授權，允許商業使用、修改與再發布。

See [LICENSE](LICENSE) for full details.

---

## 💬 Community | 社群

- **Issues**: Report bugs or suggest improvements
- **Discussions**: Share how you're using these standards
- **Examples**: Submit your project as an example

---

## ✅ Checklist for Adopting Standards | 採用標準檢查清單

- [ ] Copied core standards to project
- [ ] Chose language/framework extensions
- [ ] Configured project-specific settings in CONTRIBUTING.md
- [ ] Set up Git hooks (commitlint, pre-commit)
- [ ] Integrated quality gates in CI/CD
- [ ] Trained team on standards
- [ ] Updated project README to reference standards
- [ ] Created first commit following standards

---

**Ready to improve your project's documentation quality?**
**準備好提升專案的文件品質了嗎？**

Start with Level 1 (Essential Standards) today!
從今天開始使用 Level 1（必要規範）！

---

**Maintained with ❤️ by the open-source community**
