---
source: ../../README.md
source_version: 3.2.2
translation_version: 3.2.2
last_synced: 2026-01-06
status: current
---

# 通用开发规范

> **Language**: [English](../../README.md) | [繁體中文](../zh-TW/README.md) | 简体中文

**版本**: 3.2.2
**最后更新**: 2026-01-06
**授权**: [双重授权](../../LICENSE) (CC BY 4.0 + MIT)

---

## 📋 目的

此储存库提供**与语言无关、与框架无关、与领域无关**的软体专案文件标准。这些标准确保各种技术堆叠的一致性、品质和可维护性。

---

## 🎯 核心原则

1. **通用适用性** - 标准适用于任何程式语言、框架或领域
2. **模组化设计** - 选择与您专案相关的标准
3. **可扩充架构** - 可使用语言特定、框架特定或领域特定规则进行扩充
4. **基于证据** - 标准源自业界最佳实务与实际验证
5. **自包含** - 每个标准都可独立使用，无需依赖其他标准

---

## 📦 内容概览

```
universal-dev-standards/
├── core/                           # 核心通用标准
│   ├── anti-hallucination.md      # AI 协作指南
│   ├── checkin-standards.md       # 程式码签入品质门槛
│   ├── commit-message-guide.md    # Commit 讯息规范
│   ├── spec-driven-development.md # SDD 方法论与标准
│   ├── git-workflow.md            # Git 分支策略
│   ├── code-review-checklist.md   # 程式码审查指南
│   ├── documentation-structure.md # 文件组织
│   ├── project-structure.md       # 专案目录规范
│   ├── versioning.md              # 语意化版本控制指南
│   ├── changelog-standards.md     # 变更日志撰写指南
│   └── testing-standards.md       # 测试标准 (UT/IT/ST/E2E)
│
├── skills/                         # ✅ 新增：AI 工具技能 (v2.1.0)
│   ├── claude-code/               # Claude Code Skills
│   ├── cursor/                    # Cursor Rules（规划中）
│   ├── windsurf/                  # Windsurf Rules（规划中）
│   ├── cline/                     # Cline Rules（规划中）
│   ├── copilot/                   # GitHub Copilot（规划中）
│   └── _shared/                   # 共享范本
│
├── extensions/                     # 选用扩充
│   ├── languages/                 # 语言特定标准
│   ├── frameworks/                # 框架特定标准
│   ├── locales/                   # 地区特定标准
│   └── domains/                   # 领域特定标准
│
├── templates/                      # 专案文件范本
├── integrations/                   # 工具设定档
├── cli/                           # CLI 工具
└── adoption/                       # 采用指南
```

---

## 🤖 AI 优化标准

### 双格式架构

本专案现在提供两种格式的标准，适用于不同使用场景：

| 格式 | 位置 | 使用场景 | Token 使用量 |
|------|------|----------|--------------|
| **人类可读** | `core/`、`options/` | 文件、入职、参考 | 标准 |
| **AI 优化** | `ai/` | AI 助手、自动化、CLAUDE.md | 减少约 80% |

### 使用 AI 优化标准

**用于 AI 助手（Claude、Cursor 等）**：
```yaml
# 在 CLAUDE.md 或系统提示中引用
standards:
  source: ai/standards/
  options:
    workflow: ai/options/git-workflow/github-flow.ai.yaml
    commit_language: ai/options/commit-message/english.ai.yaml
    test_levels:
      - ai/options/testing/unit-testing.ai.yaml
      - ai/options/testing/integration-testing.ai.yaml
```

**使用 CLI 选择格式**：
```bash
# 使用 AI 格式初始化（推荐用于 AI 辅助专案）
uds init --format ai

# 使用两种格式初始化
uds init --format both

# 设定特定选项
uds init --workflow github-flow --commit-lang english --test-levels unit,integration
```

### 可用选项

| 类别 | 选项 |
|------|------|
| **Git 工作流** | `github-flow`、`gitflow`、`trunk-based`、`squash-merge`、`merge-commit`、`rebase-ff` |
| **Commit 语言** | `english`、`traditional-chinese`、`bilingual` |
| **测试层级** | `unit`、`integration`、`system`、`e2e` |
| **专案结构** | `nodejs`、`python`、`dotnet`、`java`、`go` |

### 翻译

AI 优化标准提供以下语言版本：
- 英文：`ai/`
- 繁体中文：`locales/zh-TW/ai/`

---

## 🔗 规范采用

### 搭配 Claude Code 使用（推荐）

一次安装所有 14 个完整开发技能：

#### 方法 1：Plugin Marketplace（推荐）

**一次性设置：**
```bash
# 添加 marketplace
/plugin marketplace add AsiaOstrich/universal-dev-standards

# 安装包含所有 14 个技能的 plugin
/plugin install universal-dev-standards@asia-ostrich
```

**优点：**
- ✅ 单一指令安装
- ✅ 新版本发布时自动更新
- ✅ 所有 14 个技能立即加载
- ✅ 无需手动 git clone

**包含的技能：** ai-collaboration-standards、changelog-guide、code-review-assistant、commit-standards、documentation-guide、error-code-guide、git-workflow-guide、logging-guide、project-structure-guide、release-standards、requirement-assistant、spec-driven-dev、tdd-assistant、test-coverage-assistant、testing-guide

**从 v3.2.x 或更早版本迁移？**

如果你使用旧的 marketplace 名称（`universal-dev-standards@universal-dev-standards`）安装，请进行迁移：

```bash
# 卸载旧版本
/plugin uninstall universal-dev-standards@universal-dev-standards

# 安装新版本
/plugin install universal-dev-standards@asia-ostrich
```

---

#### 方法 2：脚本安装（替代方案）

适合偏好本地安装或需要自定义的用户：

**macOS / Linux / Git Bash：**
```bash
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards/skills/claude-code
./install.sh
```

**Windows (PowerShell)：**
```powershell
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards\skills\claude-code
.\install.ps1
```

### 多 AI 工具支援（即将推出）

我们正在扩展对更多 AI 程式码助手的支援：

| AI 工具 | 状态 | 路径 |
|---------|------|------|
| Claude Code | ✅ 完成 | `skills/claude-code/` |
| Cursor | 🚧 规划中 | `skills/cursor/` |
| Windsurf | 🚧 规划中 | `skills/windsurf/` |
| Cline | 🚧 规划中 | `skills/cline/` |
| GitHub Copilot | 🚧 规划中 | `skills/copilot/` |

### 规范涵盖范围

| 规范 | Skill 可用 | 采用方式 |
|------|-----------|----------|
| anti-hallucination.md | ✅ ai-collaboration-standards | 安装 Skill |
| commit-message-guide.md | ✅ commit-standards | 安装 Skill |
| code-review-checklist.md | ✅ code-review-assistant | 安装 Skill |
| git-workflow.md | ✅ git-workflow-guide | 安装 Skill |
| versioning.md + changelog-standards.md | ✅ release-standards | 安装 Skill |
| testing-standards.md | ✅ testing-guide | 安装 Skill |
| documentation-structure.md | ✅ documentation-guide | 安装 Skill |
| requirement templates | ✅ requirement-assistant | 安装 Skill |
| **checkin-standards.md** | ❌ | 复制到专案 |
| **spec-driven-development.md** | ❌ | 复制到专案 |
| **documentation-writing-standards.md** | ❌ | 复制到专案 |
| **project-structure.md** | ❌ | 复制到专案 |
| 语言/框架扩充 | ❌ | 视需要复制 |
| AI 工具整合 | ❌ | 复制到工具位置 |

> **重要**：对于有 Skill 的规范，使用 Skill 或复制原始文件 — **择一即可，不要两者都做**。

📖 请参阅 [采用指南](adoption/ADOPTION-GUIDE.md) 获得完整指导和检查清单。

### 使用 CLI 工具

**选项一：npm（推荐）**
```bash
# 全域安装
npm install -g universal-dev-standards

# 在您的专案目录中
uds init    # 互动式初始化
uds check   # 检查采用状态
uds update  # 更新至最新版本
uds skills  # 列出已安装的 Claude Code Skills
```

**选项二：npx（免安装）**
```bash
npx universal-dev-standards init
npx universal-dev-standards check
```

**选项三：克隆并连结（开发用）**

macOS / Linux：
```bash
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards/cli && npm install && npm link
```

Windows (PowerShell)：
```powershell
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards\cli; npm install; npm link
```

📖 请参阅 [CLI README](../../cli/README.md) 了解详细的 CLI 使用方法和所有可用命令。
📖 请参阅 [Windows 指南](docs/WINDOWS-GUIDE.md) 获得 Windows 特定说明。

---

## 🚀 快速开始

### 步骤 1：选择核心规范

**最小设定（必要）**：
```bash
# 复制必要规范到您的专案
cp core/anti-hallucination.md your-project/.standards/
cp core/checkin-standards.md your-project/.standards/
cp core/commit-message-guide.md your-project/.standards/
```

**推荐设定**：
```bash
# 复制所有核心规范
cp core/*.md your-project/.standards/
```

---

### 步骤 2：新增语言/框架扩充

**对于 .NET 专案**：
```bash
cp extensions/languages/csharp-style.md your-project/.standards/
cp extensions/frameworks/dotnet.md your-project/.standards/
```

**对于 TypeScript 专案**：
```bash
cp extensions/languages/typescript-style.md your-project/.standards/
```

**对于 Python 专案**：
```bash
cp extensions/languages/python-style.md your-project/.standards/
```

---

### 步骤 3：设定专案特定设定

编辑 `your-project/CONTRIBUTING.md` 或 `your-project/.standards/PROJECT-CONFIG.md`：

```markdown
## 文件标准设定

### Commit 讯息语言
- 类型语言：**英文**（feat, fix, refactor）
- 主旨语言：**英文**

### Git 工作流程
- 策略：**GitFlow**
- 主要分支：`main`, `develop`
- 功能分支前缀：`feature/`
- 热修复分支前缀：`hotfix/`

### 程式码品质工具
- Linter：ESLint
- Formatter：Prettier
- 测试框架：Jest
- 最低测试覆盖率：80%

### 签入要求
- ✅ 建置必须通过
- ✅ 所有测试必须通过
- ✅ Linter 必须无错误
- ✅ 测试覆盖率 ≥80%
```

---

### 步骤 4（选用）：使用范本

```bash
# 初始化专案文件
cp templates/README.md.template your-project/README.md
cp templates/CONTRIBUTING.md.template your-project/CONTRIBUTING.md
cp templates/CHANGELOG.md.template your-project/CHANGELOG.md

# 替换范本中的占位符来自订
# [PROJECT_NAME] → 您的专案名称
# [DESCRIPTION] → 您的专案描述
# 等等。
```

---

## 📊 规范等级

### 🟢 等级 1：必要（最小可行标准）

**每个专案必须具备**：
- ✅ `anti-hallucination.md` - AI 协作指南
- ✅ `checkin-standards.md` - 提交前的品质门槛
- ✅ `commit-message-guide.md` - 标准化的 commit 格式
- ✅ `spec-driven-development.md` - 规格驱动开发标准

**预估设定时间**：30 分钟
**推荐对象**：所有专案，特别是 AI 辅助开发

---

### 🟡 等级 2：推荐（专业品质）

**包含等级 1 +**：
- ✅ `git-workflow.md` - 分支策略
- ✅ `code-review-checklist.md` - 审查指南
- ✅ `versioning.md` - 版本管理
- ✅ `changelog-standards.md` - 变更日志撰写指南
- ✅ `testing-standards.md` - 测试金字塔（UT/IT/ST/E2E）
- ✅ 语言特定的风格指南（例如 `csharp-style.md`）

**预估设定时间**：2 小时
**推荐对象**：团队专案、开源专案

---

### 🔵 等级 3：全面（企业级）

**包含等级 2 +**：
- ✅ `documentation-structure.md` - 文件组织
- ✅ 框架特定标准（例如 `dotnet.md`）
- ✅ 领域特定标准（例如 `fintech.md`）
- ✅ OpenSpec 整合用于规格驱动开发
- ✅ 完整范本套件（README、CONTRIBUTING、CHANGELOG、API 文件）

**预估设定时间**：1-2 天
**推荐对象**：企业专案、受监管产业、大型团队

---

## 🔧 自订指南

### 自订内容要写在哪里

| 自订类型 | 档案 | 位置 |
|---------|------|------|
| AI 工具规则与排除 | `CLAUDE.md`、`.cursorrules`、`.windsurfrules`、`.clinerules` | 专案根目录 |
| 专案标准覆写 | `PROJECT-STANDARDS.md` | 专案根目录 |
| 复制的核心规范 | `docs/standards/` 或自订位置 | 您的专案 |

### 调整规范以符合专案需求

所有核心规范都包含 **「专案特定自订」** 区段。可透过以下方式自订：

1. **语言选择**
   ```markdown
   ## Commit 讯息语言选择
   - 英文：feat, fix, refactor
   - 繁体中文：新增, 修正, 重构
   - 西班牙文：característica, corrección, refactorización
   ```

2. **工具设定**
   ```markdown
   ## 建置指令
   ```bash
   npm run build  # Node.js 专案
   dotnet build   # .NET 专案
   mvn package    # Java 专案
   ```
   ```

3. **阈值调整**
   ```markdown
   ## 品质阈值
   - 测试覆盖率：80%（根据专案成熟度调整）
   - 最大方法长度：50 行（根据语言调整）
   - 最大循环复杂度：10（标准）
   ```

4. **范围定义**
   ```markdown
   ## 允许的 Commit 范围
   - auth：认证模组
   - payment：支付处理
   - [在此新增您的模组]
   ```

### 排除标准

不是每个标准都适合每个专案。使用以下方法排除标准：

1. **在 `uds init` 时**：只选择您需要的标准
   ```bash
   uds init
   # 互动式提示让您选择：
   # - 要采用哪些核心标准
   # - 要设定哪些 AI 工具
   # - 要安装哪些 Skills（或完全跳过）
   ```

2. **选择性采用**：只复制需要的档案
   ```bash
   # 不使用完整 init，只复制特定标准
   cp core/commit-message-guide.md your-project/docs/
   cp core/code-review-checklist.md your-project/docs/
   ```

3. **AI 工具整合排除**：在 AI 工具设定档中指定排除模式

   | AI 工具 | 设定档 | 位置 |
   |---------|--------|------|
   | Claude Code | `CLAUDE.md` | 专案根目录 |
   | Cursor | `.cursorrules` | 专案根目录 |
   | Windsurf | `.windsurfrules` | 专案根目录 |
   | Cline | `.clinerules` | 专案根目录 |

   ```markdown
   # 范例：新增至 CLAUDE.md 或 .cursorrules
   ## 排除的标准
   SDD 命令可在以下情况跳过：
   - 微小的 bug 修复（< 5 行）
   - 仅文件变更
   - 设定档更新
   ```

4. **专案层级覆写**：在专案根目录建立 `PROJECT-STANDARDS.md` 记录偏差
   ```markdown
   # PROJECT-STANDARDS.md（在专案根目录）

   ## 排除的标准
   - `testing-completeness.md` - 使用旧版测试框架
   - `api-spec.md` - 内部工具，无外部 API

   ## 修改的阈值
   - 测试覆盖率：60%（旧有程式码迁移中）
   ```

### 可排除项目

| 类别 | 可排除项目 |
|------|-----------|
| **核心标准** | 13 个标准中的任何一个，根据专案需求 |
| **AI Skills** | 个别 skill 或整个 skill 安装 |
| **整合** | 特定 AI 工具设定 |
| **范本** | README、CHANGELOG、CONTRIBUTING 范本 |

---

## 🌍 多语言支援

### Commit 讯息语言范例

**英文**：
```
feat(auth): Add OAuth2 support
fix(api): Resolve memory leak
docs(readme): Update installation guide
```

**繁体中文**：
```
新增(认证): 实作 OAuth2 支援
修正(API): 解决记忆体泄漏
文件(README): 更新安装指南
```

**西班牙文**：
```
característica(auth): Agregar soporte OAuth2
corrección(api): Resolver fuga de memoria
documentación(readme): Actualizar guía de instalación
```

**日文**：
```
机能(认证): OAuth2サポートを追加
修正(API): メモリリークを解决
文书(README): インストールガイドを更新
```

---

## 🛠️ 工具整合

### Git Hooks

**安装 commitlint**（Node.js 专案）：
```bash
npm install --save-dev @commitlint/{cli,config-conventional}
npm install --save-dev husky

# 初始化 husky
npx husky install
npx husky add .husky/commit-msg 'npx commitlint --edit $1'
```

**设定 commitlint**：
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

### CI/CD 整合

**GitHub Actions 范例**：
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

### OpenSpec 整合

对于规格驱动开发，整合 OpenSpec：

```bash
# 复制 OpenSpec 框架
cp -r integrations/openspec/ your-project/openspec/

# 建立 .claude/commands 目录
mkdir -p your-project/.claude/commands/
cp integrations/openspec/commands/* your-project/.claude/commands/
```

**使用方式**：
```bash
# 提出新变更
/openspec proposal "Add user authentication"

# 套用已批准的规格
/openspec apply specs/auth-feature

# 封存已完成的规格
/openspec archive specs/auth-feature
```

---

## 📚 范例

### 范例 1：.NET Web API 专案

**规范设定**：
```
✅ 核心规范
   - anti-hallucination.md
   - checkin-standards.md
   - commit-message-guide.md（英文类型）
   - git-workflow.md（GitFlow）

✅ 扩充
   - languages/csharp-style.md
   - frameworks/dotnet.md

✅ 范本
   - CLAUDE.md（为 .NET 自订）
   - README.md
   - CONTRIBUTING.md
```

请参阅 `examples/dotnet-web-api/` 获取完整实作。

---

### 范例 2：React SPA 专案

**规范设定**：
```
✅ 核心规范
   - anti-hallucination.md
   - checkin-standards.md
   - commit-message-guide.md（英文类型）
   - git-workflow.md（GitHub Flow）

✅ 扩充
   - languages/typescript-style.md
   - frameworks/react.md

✅ 工具
   - ESLint + Prettier
   - Husky + commitlint
   - Jest + React Testing Library
```

请参阅 `examples/react-spa/` 获取完整实作。

---

### 范例 3：Python ML 专案

**规范设定**：
```
✅ 核心规范
   - anti-hallucination.md
   - checkin-standards.md
   - commit-message-guide.md（英文类型）
   - git-workflow.md（主干开发）

✅ 扩充
   - languages/python-style.md
   - domains/machine-learning.md

✅ 工具
   - Black（格式化）
   - pylint（Linter）
   - pytest（测试）
   - mypy（型别检查）
```

请参阅 `examples/python-ml/` 获取完整实作。

---

## 🤝 贡献

我们欢迎协助改善这些标准的贡献！

### 如何贡献

1. **建议改善**：开启 issue 描述问题和建议的解决方案
2. **新增范例**：提交您如何应用这些标准的范例
3. **扩展标准**：贡献新的语言/框架/领域扩充
4. **翻译**：协助将标准翻译成其他语言

### 贡献指南

所有贡献必须：
- ✅ 维持语言/框架/领域无关性（对于核心规范）
- ✅ 在至少 2 个不同情境中包含范例
- ✅ 遵循现有的文件结构
- ✅ 以 CC BY 4.0 授权

---

## 📖 延伸阅读

### 相关标准与框架

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Git Best Practices](https://sethrobertson.github.io/GitBestPractices/)
- [Code Review Best Practices](https://google.github.io/eng-practices/review/)

### 书籍与文章

- **The Art of Readable Code** by Boswell & Foucher
- **Clean Code** by Robert C. Martin
- **The Pragmatic Programmer** by Hunt & Thomas
- **Accelerate** by Forsgren, Humble, and Kim

---

## 🔄 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 3.2.2 | 2026-01-06 | 新增：`uds skills` 指令列出已安装的 Claude Code Skills；弃用：手动安装脚本 (install.sh/install.ps1) |
| 3.2.0 | 2026-01-02 | 新增：Plugin Marketplace 分发支持、CLI Marketplace 选项；修复：CLI 通配符路径处理、程序挂起问题 |
| 3.1.0 | 2025-12-30 | 新增：简体中文（zh-CN）翻译、语言切换链接 |
| 3.0.0 | 2025-12-30 | 新增：完整 Windows 支持、npm 发布、CLI 增强、5 个新 Skills（共 14 个）|
| 2.3.0 | 2025-12-29 | 新增：AI 优化标准 (`ai/`)、可配置选项 (`options/`)、CLI 格式/选项支援 |
| 2.2.0 | 2025-12-25 | 新增：多语言支援架构、繁体中文翻译 |
| 1.3.0 | 2025-12-15 | 新增：changelog-standards.md；更新：versioning.md, git-workflow.md（交叉引用）|
| 1.2.0 | 2025-12-11 | 新增：project-structure.md；更新：documentation-structure.md（档案命名、版本对齐）|
| 1.1.0 | 2025-12-05 | 新增：testing-standards.md (UT/IT/ST/E2E) |
| 1.0.0 | 2025-11-12 | 初始版本，包含核心规范 |

---

## 📄 授权

本专案采用**双重授权**：

| 组件 | 授权 |
|------|------|
| 文件（`core/`, `extensions/`, `templates/` 等）| [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| CLI 工具（`cli/`）| [MIT](../../cli/LICENSE) |

两种授权都是宽松型授权，允许商业使用、修改与再发布。

请参阅 [LICENSE](../../LICENSE) 获取完整详情。

---

## 💬 社群

- **Issues**：回报错误或建议改善
- **Discussions**：分享您如何使用这些标准
- **Examples**：提交您的专案作为范例

---

## ✅ 采用标准检查清单

- [ ] 已复制核心规范到专案
- [ ] 已选择语言/框架扩充
- [ ] 已在 CONTRIBUTING.md 中设定专案特定设定
- [ ] 已设定 Git hooks（commitlint, pre-commit）
- [ ] 已在 CI/CD 中整合品质门槛
- [ ] 已对团队进行标准培训
- [ ] 已更新专案 README 引用标准
- [ ] 已建立遵循标准的第一个 commit

---

**准备好提升专案的文件品质了吗？**

从今天开始使用等级 1（必要规范）！

---

**由开源社群用 ❤️ 维护**
