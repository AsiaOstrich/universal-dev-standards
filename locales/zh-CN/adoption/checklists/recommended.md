---
source: ../../../../adoption/checklists/recommended.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: a9db5033c84d
status: current
---

# 推荐采用检查清单（历史参考）

> **语言**: [English](../../../../adoption/checklists/recommended.md) | [繁體中文](../../../zh-TW/adoption/checklists/recommended.md) | 简体中文
>
> **注意**：等级制度已移除。UDS 现在通过 `uds init` 默认安装所有标准。本检查清单保留作为历史参考。完整的采用检查清单请参见 [enterprise.md](enterprise.md)。

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
- [ ] `.standards/checkin-standards.md` 已存在
- [ ] `.standards/spec-driven-development.md` 已存在

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
- [ ] 已复制 `csharp-style.md`（如适用）

**用于 PHP 专案（macOS / Linux）**:
```bash
cp path/to/universal-dev-standards/extensions/languages/php-style.md .standards/
```

**用于 PHP 专案（Windows PowerShell）**:
```powershell
Copy-Item path\to\universal-dev-standards\extensions\languages\php-style.md .standards\
```
- [ ] 已复制 `php-style.md`（如适用）

### 框架延伸

**用于 Fat-Free 框架（macOS / Linux）**:
```bash
cp path/to/universal-dev-standards/extensions/frameworks/fat-free-patterns.md .standards/
```

**用于 Fat-Free 框架（Windows PowerShell）**:
```powershell
Copy-Item path\to\universal-dev-standards\extensions\frameworks\fat-free-patterns.md .standards\
```
- [ ] 已复制 `fat-free-patterns.md`（如适用）

### 地区延伸

**用于繁体中文团队（macOS / Linux）**:
```bash
cp path/to/universal-dev-standards/extensions/locales/zh-tw.md .standards/
```

**用于繁体中文团队（Windows PowerShell）**:
```powershell
Copy-Item path\to\universal-dev-standards\extensions\locales\zh-tw.md .standards\
```
- [ ] 已复制 `zh-tw.md`（如适用）

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
- [ ] 已安装 `.github/copilot-instructions.md`

### Cursor IDE

**macOS / Linux:**
```bash
cp path/to/universal-dev-standards/integrations/cursor/.cursorrules .
```

**Windows PowerShell:**
```powershell
Copy-Item path\to\universal-dev-standards\integrations\cursor\.cursorrules .
```
- [ ] 已安装 `.cursorrules`

### Windsurf IDE

**macOS / Linux:**
```bash
cp path/to/universal-dev-standards/integrations/windsurf/.windsurfrules .
```

**Windows PowerShell:**
```powershell
Copy-Item path\to\universal-dev-standards\integrations\windsurf\.windsurfrules .
```
- [ ] 已安装 `.windsurfrules`

### Cline

**macOS / Linux:**
```bash
cp path/to/universal-dev-standards/integrations/cline/.clinerules .
```

**Windows PowerShell:**
```powershell
Copy-Item path\to\universal-dev-standards\integrations\cline\.clinerules .
```
- [ ] 已安装 `.clinerules`

### OpenSpec（用于 SDD 工作流程）

**macOS / Linux:**
```bash
cp -r path/to/universal-dev-standards/integrations/openspec/ .openspec/
```

**Windows PowerShell:**
```powershell
Copy-Item -Recurse path\to\universal-dev-standards\integrations\openspec\ .openspec\
```
- [ ] 已安装 `.openspec/` 目录

---

## 团队配置

### Git 工作流程选择

阅读 `git-workflow.md` 并选择：
- [ ] Trunk-Based Development
- [ ] GitHub Flow
- [ ] GitFlow

将决定记录在项目的 README 或 CONTRIBUTING.md 中。

### 代码审查流程

- [ ] 定义必要的审查者
- [ ] 设置分支保护规则
- [ ] 配置 code-review-assistant skill 设置

### 测试标准

- [ ] 定义覆盖率目标（建议：70/20/7/3）
- [ ] 设置 CI/CD 流水线
- [ ] 配置 testing-guide skill 设置

---

## 验证

### 测试所有 Skills

1. **commit-standards**：写一个 commit → 应遵循 Conventional Commits
2. **code-review-assistant**：审查代码 → 应使用系统性检查清单
3. **git-workflow-guide**：询问分支策略 → 应说明所选的工作流程
4. **release-standards**：询问版本管理 → 应说明 SemVer
5. **testing-guide**：询问测试 → 应说明测试金字塔

### 验证整合

- [ ] AI 工具遵循项目标准
- [ ] AI 工具提供基于证据的回应

---

## 最终检查清单

| 类别 | 项目 | 状态 |
|------|------|------|
| **等级一 Skills** | ai-collaboration-standards, commit-standards | [ ] |
| **等级二 Skills** | code-review-assistant, git-workflow-guide, release-standards, testing-guide, requirement-assistant | [ ] |
| **参考文件** | checkin-standards.md, spec-driven-development.md | [ ] |
| **延伸规范** | （依项目选择） | [ ] |
| **整合** | （依工具选择） | [ ] |
| **团队配置** | 工作流程、审查流程、测试目标 | [ ] |

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
- [Code Review Checklist](../../../../core/code-review-checklist.md) - 代码审查

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.1 | 2025-12-24 | 新增：相关标准、授权章节 |
| 1.0.0 | 2025-12-23 | 初版检查清单 |

---

## 授权

本检查清单以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。
