---
source: ../../MAINTENANCE.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-01-08
status: current
---

# 通用开发标准 - 维护指南

> **Language**: [English](../../MAINTENANCE.md) | 繁体中文

**版本**: 1.1.0
**最后更新**: 2026-01-07

---

## 目的

本文件定义通用开发标准专案的完整维护工作流程。涵盖所有目录、档案及其同步关系。

---

## 专案架构概览

```
universal-dev-standards/
├── core/                    ← 一级来源（16 个标准）
├── options/                 ← MD 选项（18 个档案）
├── ai/                      ← AI 优化版（52 个 YAML 档案）
│   ├── standards/           ← 16 个 AI 标准
│   ├── options/             ← 36 个 AI 选项
│   └── MAINTENANCE.md       ← AI 专用维护指南
├── extensions/              ← 语言/框架/地区扩充（4 个档案）
│   ├── languages/           ← 语言特定标准
│   ├── frameworks/          ← 框架特定模式
│   └── locales/             ← 地区特定规范
├── skills/                  ← Claude Code 技能（48 个档案）
│   └── claude-code/         ← 15 个技能套件
├── adoption/                ← 采用指南（5 个档案）
├── templates/               ← 文件模板（4 个档案）
├── integrations/            ← AI 工具配置（7 个档案）
├── cli/                     ← Node.js CLI 工具
├── scripts/                 ← 维护脚本
├── locales/                 ← 翻译（129 个档案）
│   ├── zh-TW/               ← 繁体中文
│   └── zh-CN/               ← 简体中文（部分）
└── [根目录档案]              ← README、CHANGELOG、CLAUDE.md 等
```

---

## 完整同步层级

```
┌─────────────────────────────────────────────────────────────────────┐
│                          一级来源                                    │
│                         core/*.md                                    │
└─────────────────────────────────────────────────────────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   options/*.md  │    │ ai/standards/   │    │ skills/claude-  │
│   (MD 选项)     │    │   *.ai.yaml     │    │   code/*/       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
          │                       │                       │
          ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ locales/zh-TW/  │    │  ai/options/    │    │ locales/zh-TW/  │
│   options/      │    │   *.ai.yaml     │    │   skills/       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                    ┌─────────────────┐
                    │ locales/zh-TW/  │
                    │   ai/           │
                    └─────────────────┘
```

**黄金法则**：永远从上往下更新。不要在未更新来源的情况下修改下游档案。

---

## 目录参考

### 1. core/（一级来源）

| 档案 | 版本 | 说明 |
|------|------|------|
| anti-hallucination.md | 1.3.1 | AI 行为准则 |
| changelog-standards.md | 1.1.0 | 变更日志格式 |
| checkin-standards.md | 1.3.0 | 程式码签入检查表 |
| code-review-checklist.md | 1.2.0 | 程式码审查指南 |
| commit-message-guide.md | 1.2.0 | 提交讯息格式 |
| documentation-structure.md | 1.0.0 | 文件组织 |
| documentation-writing-standards.md | 1.0.1 | 撰写指南 |
| error-code-standards.md | 1.1.0 | 错误码格式 |
| git-workflow.md | 1.1.0 | Git 工作流程 |
| logging-standards.md | 1.1.0 | 日志指南 |
| project-structure.md | 1.1.0 | 专案组织 |
| spec-driven-development.md | 1.2.0 | SDD 工作流程 |
| test-completeness-dimensions.md | 1.0.0 | 测试维度 |
| test-driven-development.md | 1.0.0 | TDD 工作流程 |
| testing-standards.md | 2.1.0 | 测试指南 |
| versioning.md | 1.2.0 | 语意化版本 |

**总计**: 16 个档案

---

### 2. options/（MD 选项）

提供可配置选择的人类可读选项档案。

| 类别 | 档案数 | 相关标准 |
|------|--------|----------|
| commit-message/ | 3（english、traditional-chinese、bilingual） | commit-message-guide.md |
| git-workflow/ | 6（gitflow、github-flow、trunk-based、merge-commit、squash-merge、rebase-ff） | git-workflow.md |
| project-structure/ | 5（dotnet、nodejs、python、java、go） | project-structure.md |
| testing/ | 4（unit、integration、system、e2e） | testing-standards.md |

**总计**: 18 个档案

---

### 3. ai/（AI 优化版）

供 AI 助手使用的机器可读 YAML 格式。详细同步规则请参阅 [ai/MAINTENANCE.md](ai/MAINTENANCE.md)。

| 子目录 | 档案数 | 说明 |
|--------|--------|------|
| standards/ | 16 | AI 优化的核心标准 |
| options/changelog/ | 2 | 变更日志选项 |
| options/code-review/ | 3 | 程式码审查选项 |
| options/commit-message/ | 3 | 提交讯息选项 |
| options/documentation/ | 3 | 文件选项 |
| options/git-workflow/ | 6 | Git 工作流程选项 |
| options/project-structure/ | 10 | 专案结构选项（5 个仅 YAML） |
| options/testing/ | 9 | 测试选项（5 个仅 YAML） |

**总计**: 52 个 YAML 档案

---

### 4. skills/（Claude Code 技能）

Claude Code AI 助手的技能套件。

| 技能 | 档案数 | 相关核心标准 |
|------|--------|--------------|
| ai-collaboration-standards/ | 3 | anti-hallucination.md |
| changelog-guide/ | 2 | changelog-standards.md |
| code-review-assistant/ | 3 | code-review-checklist.md、checkin-standards.md |
| commit-standards/ | 3 | commit-message-guide.md |
| documentation-guide/ | 3 | documentation-structure.md、documentation-writing-standards.md |
| error-code-guide/ | 2 | error-code-standards.md |
| git-workflow-guide/ | 3 | git-workflow.md |
| logging-guide/ | 2 | logging-standards.md |
| project-structure-guide/ | 2 | project-structure.md |
| release-standards/ | 4 | changelog-standards.md、versioning.md |
| requirement-assistant/ | 3 | spec-driven-development.md |
| spec-driven-dev/ | 2 | spec-driven-development.md |
| tdd-assistant/ | 3 | test-driven-development.md |
| test-coverage-assistant/ | 2 | test-completeness-dimensions.md |
| testing-guide/ | 2 | testing-standards.md |

**总计**: 38 个技能档案 + 10 个共用/README 档案 = 48 个档案

---

### 5. adoption/（采用指南）

| 档案 | 说明 |
|------|------|
| ADOPTION-GUIDE.md | 主要采用指南 |
| STATIC-DYNAMIC-GUIDE.md | 静态 vs 动态采用 |
| checklists/minimal.md | 最小采用检查表 |
| checklists/recommended.md | 建议采用检查表 |
| checklists/enterprise.md | 企业采用检查表 |

**总计**: 5 个档案

---

### 6. templates/（文件模板）

| 档案 | 说明 |
|------|------|
| migration-template.md | 迁移文件模板 |
| requirement-template.md | 需求文件模板 |
| requirement-document-template.md | 详细需求模板 |
| requirement-checklist.md | 需求检查表 |

**总计**: 4 个档案

---

### 7. integrations/（AI 工具配置）

| 工具 | 档案 | 说明 |
|------|------|------|
| Cursor | .cursorrules | Cursor AI 规则 |
| Cline | .clinerules | Cline AI 规则 |
| Windsurf | .windsurfrules | Windsurf AI 规则 |
| GitHub Copilot | copilot-instructions.md | Copilot 指示 |
| Google Antigravity | INSTRUCTIONS.md、README.md | Antigravity 设定 |
| OpenSpec | AGENTS.md | OpenSpec 代理配置 |

**总计**: 7 个档案

---

### 8. extensions/（语言/框架/地区扩充）

可选的语言特定、框架特定和地区特定标准扩充。

| 子目录 | 档案数 | 说明 |
|--------|--------|------|
| languages/ | 2 | 语言编码风格（C#、PHP） |
| frameworks/ | 1 | 框架开发模式（Fat-Free） |
| locales/ | 1 | 地区规范（繁体中文） |

**总计**: 4 个档案

**特性**:
- 不属于核心标准同步链
- 目前无 zh-TW 翻译（预留）
- 采用 CC BY 4.0 授权
- 由专案依需求独立采用

**目前档案**:
| 档案 | 版本 | 说明 |
|------|------|------|
| languages/csharp-style.md | 1.0.1 | C# 编码风格指南 |
| languages/php-style.md | 1.0.0 | PHP 8.1+ 编码风格指南 |
| frameworks/fat-free-patterns.md | 1.0.0 | Fat-Free Framework 开发模式 |
| locales/zh-tw.md | 1.2.0 | 繁体中文地区规范 |

---

### 9. cli/（CLI 工具）

用于采用标准的 Node.js 命令列工具。

| 元件 | 档案数 | 说明 |
|------|--------|------|
| bin/ | 1 | 入口点（uds.js） |
| src/commands/ | 5 | CLI 命令（init、list、check、configure、update） |
| src/prompts/ | 1 | 互动式提示 |
| src/utils/ | 4 | 工具程式（copier、detector、github、registry） |
| tests/ | 多个 | 测试档案 |

**更新触发**：当核心标准或选项有重大变更时。

---

### 10. locales/（翻译）

| 语系 | 状态 | 覆盖率 |
|------|------|--------|
| zh-TW（繁体中文） | 活跃 | ~100% |
| zh-CN（简体中文） | 部分 | ~10% |

**zh-TW 结构**（镜像英文版）：
```
locales/zh-TW/
├── core/                    ← 16 个翻译标准
├── options/                 ← 18 个翻译 MD 选项
├── ai/
│   ├── standards/           ← 16 个翻译 AI 标准
│   └── options/             ← 36 个翻译 AI 选项
├── skills/claude-code/      ← 翻译技能
├── adoption/                ← 翻译采用指南
├── templates/               ← 翻译模板
├── README.md
├── CLAUDE.md
└── MAINTENANCE.md           ← 本档案
```

**总计**: zh-TW 约 129 个档案

---

### 11. 根目录档案

| 档案 | 说明 | 更新触发 |
|------|------|----------|
| README.md | 专案概览 | 重大变更 |
| CHANGELOG.md | 版本历史 | 每次发布 |
| CLAUDE.md | AI 助手指示 | 专案指南变更 |
| CONTRIBUTING.md | 贡献指南 | 流程变更 |
| STANDARDS-MAPPING.md | 标准快速参考 | 标准新增/移除 |
| MAINTENANCE.md | 本档案 | 维护流程变更 |

---

## 完整档案同步对照表

### 按核心标准分类

每个核心标准都有依赖树。更新核心档案时，必须更新所有下游档案。

#### 简单标准（无选项）

| 核心标准 | 下游档案 | 总计 |
|----------|----------|------|
| anti-hallucination.md | ai/standards、skill、2x locales | ~6 |
| checkin-standards.md | ai/standards、skill、2x locales | ~6 |
| documentation-writing-standards.md | ai/standards、skill、2x locales | ~6 |
| spec-driven-development.md | ai/standards、2x locales | ~4 |
| test-completeness-dimensions.md | ai/standards、skill、2x locales | ~6 |
| error-code-standards.md | ai/standards、2x locales | ~4 |
| logging-standards.md | ai/standards、2x locales | ~4 |
| versioning.md | ai/standards、skill、2x locales | ~8 |

#### 中等复杂度（仅 YAML 选项）

| 核心标准 | 选项数 | 下游档案 | 总计 |
|----------|--------|----------|------|
| changelog-standards.md | 2 YAML | ai/standards、ai/options、skill、locales | ~12 |
| code-review-checklist.md | 3 YAML | ai/standards、ai/options、skill、locales | ~14 |
| documentation-structure.md | 3 YAML | ai/standards、ai/options、skill、locales | ~14 |

#### 高复杂度（MD + YAML 选项）

| 核心标准 | MD 选项 | YAML 选项 | 总档案数 |
|----------|---------|-----------|----------|
| commit-message-guide.md | 3 | 3 | ~20 |
| git-workflow.md | 6 | 6 | ~32 |

#### 非常高复杂度

| 核心标准 | MD 选项 | YAML 选项 | 总档案数 |
|----------|---------|-----------|----------|
| project-structure.md | 5 | 10 | ~38 |
| testing-standards.md | 4 | 9 | ~34 |

---

## 标准分类：动态 vs 静态

在决定核心标准应该转换为技能还是加入 CLAUDE.md 时，请使用以下分类指南。

> **采用决策**：详细的决策流程图和部署指南请参见 [STATIC-DYNAMIC-GUIDE.md](adoption/STATIC-DYNAMIC-GUIDE.md)。

### 动态标准（适合作为技能）

具有以下特征的标准应该成为技能：
- ✅ 有明确的触发时机（事件、关键字）
- ✅ 需要决策支援（选择、建议）
- ✅ 有步骤化的工作流程
- ✅ 能产出具体结果（讯息、档案）

| 核心标准 | 技能 | 触发关键字 |
|----------|------|------------|
| anti-hallucination.md | ai-collaboration-standards | certainty, assumption, 确定性, 推论 |
| changelog-standards.md | changelog-guide | changelog, release notes, 变更日志 |
| code-review-checklist.md | code-review-assistant | review, PR, checklist, 审查 |
| commit-message-guide.md | commit-standards | commit, git, message, 提交讯息 |
| documentation-*.md | documentation-guide | README, docs, CONTRIBUTING, 文件 |
| error-code-standards.md | error-code-guide | error code, error handling, 错误码 |
| git-workflow.md | git-workflow-guide | branch, merge, PR, 分支 |
| logging-standards.md | logging-guide | logging, log level, 日志 |
| project-structure.md | project-structure-guide | structure, organization, 结构 |
| spec-driven-development.md | spec-driven-dev | spec, SDD, proposal, 规格, 提案 |
| test-completeness-dimensions.md | test-coverage-assistant | test coverage, 7 dimensions, 测试覆盖 |
| test-driven-development.md | tdd-assistant | TDD, red-green-refactor, test first, 红绿重构 |
| testing-standards.md | testing-guide | test, unit, integration, 测试 |
| versioning.md | release-standards | version, release, semver, 版本 |

### 静态标准（适合加入 CLAUDE.md）

具有以下特征的标准应该加入 CLAUDE.md，而非成为技能：
- ❌ 全域适用，无特定触发时机
- ❌ 强制性规则，无需选择
- ❌ 一次性设定
- ❌ 背景知识性质

| 核心标准 | 位置 | 原因 |
|----------|------|------|
| checkin-standards.md | CLAUDE.md | 强制性的提交前检查表，全时适用 |

---

## 更新工作流程

### 工作流程 1：更新核心标准

```
1. 编辑 core/{standard}.md                    ← 来源
2. 更新 locales/zh-TW/core/{standard}.md      ← 翻译
3. 更新 ai/standards/{standard}.ai.yaml       ← AI 版本
4. 更新 locales/zh-TW/ai/standards/...        ← 翻译 AI
5. 如有 MD 选项：
   a. 更新 options/{category}/*.md
   b. 更新 locales/zh-TW/options/{category}/
6. 如有 YAML 选项：
   a. 更新 ai/options/{category}/*.ai.yaml
   b. 更新 locales/zh-TW/ai/options/{category}/
7. 如有技能：
   a. 更新 skills/claude-code/{skill}/
   b. 更新 locales/zh-TW/skills/claude-code/{skill}/
8. 执行 ./scripts/check-translation-sync.sh zh-TW
9. 如有重大变更，更新 CHANGELOG.md
```

### 工作流程 2：新增核心标准

```
1. 建立 core/{new-standard}.md
2. 建立 locales/zh-TW/core/{new-standard}.md
3. 建立 ai/standards/{new-standard}.ai.yaml
4. 建立 locales/zh-TW/ai/standards/{new-standard}.ai.yaml
5. 如需选项：
   a. 建立 options/{category}/*.md（如需 MD 选项）
   b. 建立 ai/options/{category}/*.ai.yaml
   c. 建立所有语系翻译
6. 如需技能：
   a. 建立 skills/claude-code/{skill-name}/
   b. 建立 locales/zh-TW/skills/claude-code/{skill-name}/
7. 更新：
   - README.md（加入标准列表）
   - STANDARDS-MAPPING.md
   - CHANGELOG.md
8. 执行同步检查
```

### 工作流程 3：新增选项

```
1. 识别父标准
2. 建立选项档案：
   - options/{category}/{option}.md（如为 MD 选项）
   - ai/options/{category}/{option}.ai.yaml（如为 YAML 选项）
3. 更新父 ai/standards/{standard}.ai.yaml 引用新选项
4. 建立所有语系翻译
5. 执行同步检查
```

### 工作流程 4：新增技能

```
0. 判断是否适合作为技能
   在建立技能前，先确认该标准是「动态」的：
   - [ ] 有明确的触发时机（事件、关键字）？
   - [ ] 需要决策支援（选择、建议）？
   - [ ] 有步骤化的工作流程？
   - [ ] 能产出具体结果（讯息、档案）？

   若大部分为是 → 建立技能（继续步骤 1）
   若大部分为否 → 改加入 CLAUDE.md（参见静态标准）

1. 建立 skills/claude-code/{skill-name}/
   - SKILL.md（含 YAML frontmatter 的主要技能定义）
   - {topic}.md（选用的支援文件）
2. 建立 locales/zh-TW/skills/claude-code/{skill-name}/
   - SKILL.md（翻译版本）
3. 更新 MAINTENANCE.md
   - 在第 4 节新增至技能表格
   - 新增至动态标准表格
4. 更新 CHANGELOG.md
```

**SKILL.md 标准结构**：
```markdown
---
name: skill-name
description: |
  简短描述。
  Use when: 触发情境。
  Keywords: english, keywords, 中文, 关键字.
---

# 技能标题

> **Language**: English | [繁体中文](path/to/zh-TW)

**Version**: 1.0.0
**Last Updated**: YYYY-MM-DD
**Applicability**: Claude Code Skills

---

## Purpose
## Quick Reference
## Detailed Guidelines
## AI-Optimized Format
## Examples
## Configuration Detection
## Related Standards
## Version History
## License
```

### 工作流程 5：更新整合

```
1. 识别哪些标准影响此整合
2. 更新 integrations/{tool}/{file}
3. 不需翻译（工具专用）
4. 如可能，使用实际 AI 工具测试
```

### 工作流程 6：发布新版本

```
1. 确保所有同步检查通过
2. 更新版本号：
   - package.json（cli/）
   - 修改的核心标准（meta.version）
   - 修改的 AI 标准（meta.version）
3. 用所有变更更新 CHANGELOG.md
4. 如有版本徽章，更新 README.md
5. 建立 git tag
6. 发布到 npm（如有 cli 变更）
   - Beta 版本：GitHub Actions 自动标记为 @beta
   - 稳定版本：GitHub Actions 自动标记为 @latest
   - 详见 .github/workflows/publish.yml 自动化流程
```

**npm dist-tag 策略**：

| 版本模式 | npm Tag | 安装指令 | 使用情境 |
|---------|---------|---------|---------|
| `X.Y.Z` | `latest` | `npm install -g universal-dev-standards` | 稳定版本 |
| `X.Y.Z-beta.N` | `beta` | `npm install -g universal-dev-standards@beta` | Beta 测试 |
| `X.Y.Z-alpha.N` | `alpha` | `npm install -g universal-dev-standards@alpha` | Alpha 测试 |
| `X.Y.Z-rc.N` | `rc` | `npm install -g universal-dev-standards@rc` | 候选版本 |

**手动修正标签**（如需要）：
```bash
# 修正错误的标签
npm dist-tag add universal-dev-standards@X.Y.Z latest
npm dist-tag add universal-dev-standards@X.Y.Z-beta.N beta
```

### 工作流程 7：更新扩充

```
1. 识别扩充类型：
   - languages/ → 语言特定编码风格
   - frameworks/ → 框架特定模式
   - locales/ → 地区特定规范
2. 编辑 extensions/{type}/{file}.md
3. 更新档案元资料中的版本号
4. 如有 zh-TW 翻译：
   a. 更新 locales/zh-TW/extensions/{type}/{file}.md
5. 如有重大变更，更新 CHANGELOG.md
```

**备注**：扩充独立于核心同步链，由专案依需求采用。

### 工作流程 8：更新采用指南

```
1. 编辑 adoption/{file}.md
2. 更新 locales/zh-TW/adoption/{file}.md
3. 如检查表有变更：
   a. 确认 minimal/recommended/enterprise 之间的一致性
4. 如有重大变更，更新 CHANGELOG.md
```

### 工作流程 9：更新模板

```
1. 编辑 templates/{template}.md
2. 更新 locales/zh-TW/templates/{template}.md
3. 确认模板占位符一致
4. 如有重大变更，更新 CHANGELOG.md
```

### 工作流程 10：更新 CLI 工具

```
1. 编辑 cli/src/{component}
2. 执行测试：cd cli && npm test
3. 执行检查：cd cli && npm run lint
4. 如命令行为有变更：
   a. 更新 cli/README.md
   b. 更新原始码中的说明文字
5. 如新增命令：
   a. 建立 cli/src/commands/{command}.js
   b. 在 cli/bin/uds.js 中注册
   c. 在 cli/tests/ 中新增测试
6. 如发布，更新 package.json 版本号
7. 更新 CHANGELOG.md
```

---

## 验证命令

### macOS / Linux

```bash
# 检查翻译同步状态
./scripts/check-translation-sync.sh zh-TW

# 列出所有 AI 标准
ls ai/standards/*.yaml

# 列出所有 AI 选项
find ai/options -name "*.yaml" | sort

# 比较档案数量
echo "EN standards: $(ls ai/standards/*.yaml | wc -l)"
echo "ZH standards: $(ls locales/zh-TW/ai/standards/*.yaml | wc -l)"

# 寻找缺少的选项（被引用但不存在）
grep -rh "file:.*options/" ai/standards/*.yaml | \
  sed 's/.*file: //' | sort -u | \
  while read f; do [ ! -f "ai/$f" ] && echo "Missing: $f"; done

# 计算所有专案档案
find . -name "*.md" -not -path "./node_modules/*" | wc -l
find . -name "*.yaml" -not -path "./node_modules/*" | wc -l

# CLI 测试
cd cli && npm test
```

### Windows PowerShell

```powershell
# 检查翻译同步状态
.\scripts\check-translation-sync.ps1 zh-TW

# 列出所有 AI 标准
Get-ChildItem ai\standards\*.yaml

# 列出所有 AI 选项
Get-ChildItem -Recurse ai\options -Filter "*.yaml" | Sort-Object FullName

# 比较档案数量
Write-Host "EN standards: $((Get-ChildItem ai\standards\*.yaml).Count)"
Write-Host "ZH standards: $((Get-ChildItem locales\zh-TW\ai\standards\*.yaml).Count)"

# 计算所有专案档案
(Get-ChildItem -Recurse -Filter "*.md" | Where-Object { $_.FullName -notmatch "node_modules" }).Count
(Get-ChildItem -Recurse -Filter "*.yaml" | Where-Object { $_.FullName -notmatch "node_modules" }).Count

# CLI 测试
cd cli; npm test
```

---

## 档案数量摘要

| 目录 | 英文 | zh-TW | 总计 |
|------|------|-------|------|
| core/ | 16 | 16 | 32 |
| options/ | 18 | 18 | 36 |
| ai/standards/ | 16 | 16 | 32 |
| ai/options/ | 36 | 36 | 72 |
| extensions/ | 4 | 0 | 4 |
| skills/ | 38 | 38 | 76 |
| adoption/ | 5 | 5 | 10 |
| templates/ | 4 | 4 | 8 |
| integrations/ | 7 | 0 | 7 |
| 根目录档案 | 6 | 3 | 9 |
| **总计** | **150** | **136** | **286** |

*备注：cli/ 和 scripts/ 不包含在内（不需翻译）*

---

## 相关文件

- [ai/MAINTENANCE.md](ai/MAINTENANCE.md) - AI 专用维护指南
- [../../CONTRIBUTING.md](../../CONTRIBUTING.md) - 贡献指南
- [../../CHANGELOG.md](../../CHANGELOG.md) - 版本历史
- [../../STANDARDS-MAPPING.md](../../STANDARDS-MAPPING.md) - 标准快速参考

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.1.0 | 2026-01-07 | 新增 TDD 标准和 tdd-assistant 技能，更新至 15 个技能 |
| 1.0.0 | 2025-12-30 | 初始专案层级维护指南 |

---

## 授权

本文件采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权释出。
