---
source: ../../../../adoption/checklists/enterprise.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 8a0f688e3ba8
status: current
---

# 完整采用检查清单

> **语言**: [English](../../../../adoption/checklists/enterprise.md) | [繁體中文](../../../zh-TW/adoption/checklists/enterprise.md) | 简体中文

> 适用于所有专案的全面标准
>
> 快速设置：`npx universal-dev-standards init`

---

## 前置条件

- [ ] 已初始化 Git 储存库
- [ ] 已安装 Claude Code（用于 Skills）
- [ ] 利害关系人已批准采用

---

## Skills 安装

确保安装所有 skills:

**主要路径：装进项目**（支持多种 AI 工具、有繁体与简体中文文本、跟随你装的 UDS 版本）
```bash
npx universal-dev-standards init                      # 新项目
npx universal-dev-standards update --apply --skills   # 已设置好的项目
```

**替代方式（有限制）：Claude Code 插件市场**（只支持 Claude Code、只有英文技能文本、只跟正式版、项目内不放文件）
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
- [ ] `checkin-standards.md`（Level 1）
- [ ] `spec-driven-development.md`（Level 1）
- [ ] `documentation-writing-standards.md`（Level 3）
- [ ] `project-structure.md`（Level 3）

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
- [ ] 已复制 `migration-template.md`（如适用）

---

## 延伸规范

验证等级二的所有适用延伸规范已安装：

### 语言延伸
- [ ] `csharp-style.md`（C# 专案）
- [ ] `php-style.md`（PHP 专案）

### 框架延伸
- [ ] `fat-free-patterns.md`（Fat-Free 专案）

### 地区延伸
- [ ] `zh-tw.md`（繁体中文团队）

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
- [ ] 已建立／更新 `README.md`
- [ ] 已建立 `CONTRIBUTING.md`
- [ ] 已建立 `CHANGELOG.md`
- [ ] 已建立 `docs/` 目录结构
- [ ] `docs/adr/` 用于架构决策记录（ADR）

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

- [ ] 目录结构遵循标准
- [ ] `.gitignore` 已正确配置

---

## 治理

### 文件标准

遵循 `documentation-writing-standards.md`:

- [ ] 已定义文件矩阵（哪种专案类型需要哪些文件）
- [ ] 已向团队传达撰写指引
- [ ] 已建立文件审查流程

### 品质闸门

遵循 `checkin-standards.md`:

- [ ] 已配置 Pre-commit hooks
- [ ] CI/CD 流水线强制执行标准
- [ ] 构建验证已自动化

### 规格驱动开发

遵循 `spec-driven-development.md`:

- [ ] 团队已接受 SDD 方法论培训
- [ ] 已建立 OpenSpec（或同等）工作流程
- [ ] 已定义 规格 → 实作 → 验证 循环

---

## 合规与稽核轨迹

适用于受监管产业：

- [ ] 已记录标准采用情况
- [ ] 已定义变更管理流程
- [ ] 所有标准均纳入版本控制
- [ ] 已排定定期标准审查

---

## 验证

### 完整 Skills 测试

以相关情境测试每个 skill:

| Skill | 测试情境 | 通过 |
|-------|---------|------|
| ai-collaboration-standards | 要求提出未经验证的说法 | [ ] |
| commit-standards | 撰写复杂的 commit | [ ] |
| code-review-assistant | 审查 PR | [ ] |
| git-workflow-guide | 说明分支策略 | [ ] |
| release-standards | 规划一次发布 | [ ] |
| testing-guide | 设计测试策略 | [ ] |
| requirement-assistant | 撰写 user story | [ ] |
| documentation-guide | 规划文件 | [ ] |

### 文件稽核

- [ ] 所有必要文件皆存在
- [ ] 文件遵循撰写标准
- [ ] 文件保持最新

### 整合验证

- [ ] 所有 AI 工具遵循专案标准
- [ ] CI/CD 强制执行品质闸门
- [ ] 团队遵循既定工作流程

---

## 最终检查清单

| 类别 | 项目 | 状态 |
|------|------|------|
| **所有 Skills（8）** | 完整安装 | [ ] |
| **参考文件（4）** | 所有 Level 1 + Level 3 文件 | [ ] |
| **延伸规范** | 所有适用项目已安装 | [ ] |
| **整合** | 所有工具已配置 | [ ] |
| **文件** | 结构已建立 | [ ] |
| **专案结构** | 遵循标准 | [ ] |
| **治理** | 流程已定义 | [ ] |
| **验证** | 所有测试通过 | [ ] |

---

## 维护

### 定期审查

- [ ] 每月：审查标准遵循情况
- [ ] 每季：视需要更新标准
- [ ] 每年：完整标准稽核

### 更新

监控更新：
- [ ] 订阅 universal-dev-standards 的发布
- [ ] 订阅 universal-dev-skills 的发布
- [ ] 规划新版本的升级流程

---

## 摘要

完成后，您的专案具有：

- 以 8 个 Claude Code Skills 提供的完整 AI 协助
- 完整的参考文件
- 语言/框架专属指引
- 所有 AI 工具整合
- 正确的文件结构
- 标准的专案组织
- 治理流程

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

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.1 | 2025-12-24 | 新增：相关标准、授权章节 |
| 1.0.0 | 2025-12-23 | 初版检查清单 |

---

## 授权

本检查清单以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。
