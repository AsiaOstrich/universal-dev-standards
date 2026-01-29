---
source: ../../adoption/ADOPTION-GUIDE.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

# 规范采用指南

> **语言**: [English](../../adoption/ADOPTION-GUIDE.md) | 繁体中文
>
> 版本 1.0.0

本指南帮助软体专案正确采用通用文件标准，避免重复引用或遗漏。

---

## 目录

- [了解两个专案](#了解两个专案)
- [静态与动态规范](#静态与动态规范)
- [规范分类](#规范分类)
- [完整规范对照表](#完整规范对照表)
- [采用等级](#采用等级)
- [如何采用](#如何采用)
- [常见错误避免](#常见错误避免)

---

## 了解两个专案

| 专案 | 用途 | 使用方式 |
|------|------|----------|
| **[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)** | 所有规范的权威来源 | 参考文件，复制到专案 |
| **[universal-dev-skills](https://github.com/AsiaOstrich/universal-dev-skills)** | Claude Code Skills 实作 | 互动式 AI 工作流程辅助 |

### 关键原则

**对于有 Skills 的规范**：安装 Skill 或复制原始文件 — **择一即可，不要两者都做**。

---

## 静态与动态规范

规范依据**应用时机**分类：

| 类型 | 说明 | 部署方式 |
|------|------|----------|
| **静态** | 随时生效 | 专案文件（`CLAUDE.md`） |
| **动态** | 关键字触发 | Skills（按需载入） |

### 静态规范

这 3 个规范应该在专案中**随时生效**：

- `anti-hallucination.md` - 确定性标签、建议原则
- `checkin-standards.md` - 建置、测试、覆盖率门槛
- `project-structure.md` - 目录惯例

**部署方式**：加入 `CLAUDE.md` 或 `.cursorrules`。请参阅 [CLAUDE.md.template](../../templates/CLAUDE.md.template)。

### 动态规范

这 10 个规范由**关键字触发**，按需载入：

| Skill | 触发关键字 |
|-------|-----------|
| commit-standards | commit, git, 提交 |
| code-review-assistant | review, PR, 审查 |
| git-workflow-guide | branch, merge |
| testing-guide | test, coverage |
| release-standards | version, release |
| documentation-guide | docs, README |
| requirement-assistant | spec, SDD, 新功能 |

**部署方式**：通过 Plugin Marketplace 或手动复制安装为 Skills。

> 详细分类请参阅 [STATIC-DYNAMIC-GUIDE.md](../../adoption/STATIC-DYNAMIC-GUIDE.md)。

---

## 规范分类

### 类别一：Skills

已制作为 Claude Code Skills 的规范，提供互动式 AI 辅助。

**采用方式**：通过 Plugin Marketplace（推荐）或手动复制安装

```bash
# Plugin Marketplace（推荐）
/plugin marketplace add AsiaOstrich/universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich

# 或手动复制（macOS / Linux）
mkdir -p ~/.claude/skills
cp -r skills/commit-standards ~/.claude/skills/
```

### 类别二：参考文件

静态参考文件，提供指南但没有工作流程对应。这些不适合制作成 Skills，因为它们是查询参考而非互动式工作流程。

**采用方式**：复制到专案的 `.standards/` 目录

**macOS / Linux:**
```bash
mkdir -p .standards
cp <source-file> .standards/
```

**Windows PowerShell:**
```powershell
New-Item -ItemType Directory -Force -Path .standards
Copy-Item <source-file> .standards\
```

### 类别三：延伸

语言、框架或地区特定的规范。根据专案技术堆叠选用。

**采用方式**：适用于专案时复制

### 类别四：整合

各种编辑器和 AI 助理的工具配置档。

**采用方式**：复制到工具预期的位置

### 类别五：模板

特定用途的文件模板。

**采用方式**：根据需要复制和自订

---

## 完整规范对照表

### 核心规范

| 规范 | 类别 | Skill 名称 | 等级 | 采用方式 |
|------|------|-----------|------|---------|
| anti-hallucination.md | Skill | ai-collaboration-standards | 1 | 安装 Skill |
| commit-message-guide.md | Skill | commit-standards | 1 | 安装 Skill |
| checkin-standards.md | 参考文件 | - | 1 | 复制到专案 |
| spec-driven-development.md | 参考文件 | - | 1 | 复制到专案 |
| code-review-checklist.md | Skill | code-review-assistant | 2 | 安装 Skill |
| git-workflow.md | Skill | git-workflow-guide | 2 | 安装 Skill |
| versioning.md | Skill | release-standards | 2 | 安装 Skill |
| changelog-standards.md | Skill | release-standards | 2 | 安装 Skill |
| testing-standards.md | Skill | testing-guide | 2 | 安装 Skill |
| documentation-structure.md | Skill | documentation-guide | 3 | 安装 Skill |
| documentation-writing-standards.md | 参考文件 | - | 3 | 复制到专案 |
| project-structure.md | 参考文件 | - | 3 | 复制到专案 |

### 延伸规范

| 规范 | 类别 | 适用范围 | 等级 |
|------|------|---------|------|
| csharp-style.md | 延伸 | C# 专案 | 2 |
| php-style.md | 延伸 | PHP 8.1+ 专案 | 2 |
| fat-free-patterns.md | 延伸 | Fat-Free Framework | 2 |
| zh-cn.md | 延伸 | 繁体中文团队 | 2 |

### 整合配置

| 规范 | 目标路径 | 等级 |
|------|---------|------|
| copilot-instructions.md | .github/copilot-instructions.md | 2 |
| .cursorrules | .cursorrules | 2 |
| .windsurfrules | .windsurfrules | 2 |
| .clinerules | .clinerules | 2 |
| google-antigravity/* | 请参阅 README | 2 |
| openspec/* | 请参阅 README | 2 |

### 模板

| 模板 | 类别 | 适用范围 | 等级 |
|------|------|---------|------|
| requirement-*.md | Skill | 所有专案 | 2 |
| migration-template.md | 模板 | 迁移专案 | 3 |

---

## 采用等级

### 等级一：基本

任何专案的最低可行标准。设置时间：约 30 分钟。

**必要**：
- [ ] ai-collaboration-standards (Skill)
- [ ] commit-standards (Skill)
- [ ] checkin-standards.md (参考文件)
- [ ] spec-driven-development.md (参考文件)

详细检查清单请参阅 [checklists/minimal.md](../../adoption/checklists/minimal.md)。

### 等级二：推荐

团队专案的专业品质标准。设置时间：约 2 小时。

**包含等级一，加上**：
- [ ] code-review-assistant (Skill)
- [ ] git-workflow-guide (Skill)
- [ ] release-standards (Skill)
- [ ] testing-guide (Skill)
- [ ] 适用的延伸规范
- [ ] AI 工具整合

详细检查清单请参阅 [checklists/recommended.md](../../adoption/checklists/recommended.md)。

### 等级三：企业

企业或受监管专案的全面标准。设置时间：1-2 天。

**包含等级二，加上**：
- [ ] documentation-guide (Skill)
- [ ] documentation-writing-standards.md (参考文件)
- [ ] project-structure.md (参考文件)
- [ ] migration-template.md (如适用)

详细检查清单请参阅 [checklists/enterprise.md](../../adoption/checklists/enterprise.md)。

---

## 如何采用

### 步骤一：决定采用等级

考虑专案需求：
- **个人／副专案**：等级一
- **团队专案**：等级二
- **企业／受监管**：等级三

### 步骤二：安装 Skills

**推荐：Plugin Marketplace**
```bash
/plugin marketplace add AsiaOstrich/universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

**替代方案：手动复制（macOS / Linux）**
```bash
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
mkdir -p ~/.claude/skills
cp -r universal-dev-standards/skills/commit-standards ~/.claude/skills/
```

**替代方案：手动复制（Windows PowerShell）**
```powershell
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
New-Item -ItemType Directory -Force -Path $env:USERPROFILE\.claude\skills
Copy-Item -Recurse universal-dev-standards\skills\claude-code\commit-standards $env:USERPROFILE\.claude\skills\
```

### 步骤三：复制参考文件

**macOS / Linux:**
```bash
# 在专案目录中
mkdir -p .standards

# 根据等级复制参考文件
# 等级一
cp path/to/universal-dev-standards/core/checkin-standards.md .standards/
cp path/to/universal-dev-standards/core/spec-driven-development.md .standards/

# 等级三（额外）
cp path/to/universal-dev-standards/core/documentation-writing-standards.md .standards/
cp path/to/universal-dev-standards/core/project-structure.md .standards/
```

**Windows PowerShell:**
```powershell
# 在专案目录中
New-Item -ItemType Directory -Force -Path .standards

# 根据等级复制参考文件
# 等级一
Copy-Item path\to\universal-dev-standards\core\checkin-standards.md .standards\
Copy-Item path\to\universal-dev-standards\core\spec-driven-development.md .standards\

# 等级三（额外）
Copy-Item path\to\universal-dev-standards\core\documentation-writing-standards.md .standards\
Copy-Item path\to\universal-dev-standards\core\project-structure.md .standards\
```

### 步骤四：复制适用的延伸

**macOS / Linux:**
```bash
# 范例：PHP 专案，繁体中文团队
cp path/to/universal-dev-standards/extensions/languages/php-style.md .standards/
cp path/to/universal-dev-standards/extensions/locales/zh-cn.md .standards/
```

**Windows PowerShell:**
```powershell
# 范例：PHP 专案，繁体中文团队
Copy-Item path\to\universal-dev-standards\extensions\languages\php-style.md .standards\
Copy-Item path\to\universal-dev-standards\extensions\locales\zh-cn.md .standards\
```

### 步骤五：设置 AI 工具整合

**macOS / Linux:**
```bash
# 范例：Cursor IDE
cp path/to/universal-dev-standards/integrations/cursor/.cursorrules .

# 范例：GitHub Copilot
mkdir -p .github
cp path/to/universal-dev-standards/integrations/github-copilot/copilot-instructions.md .github/
```

**Windows PowerShell:**
```powershell
# 范例：Cursor IDE
Copy-Item path\to\universal-dev-standards\integrations\cursor\.cursorrules .

# 范例：GitHub Copilot
New-Item -ItemType Directory -Force -Path .github
Copy-Item path\to\universal-dev-standards\integrations\github-copilot\copilot-instructions.md .github\
```

---

## 常见错误避免

### 错误一：同时引用 Skill 和原始文件

**错误**：
```
# 专案同时有：
- 已安装 ai-collaboration-standards skill
- 已复制 .standards/anti-hallucination.md
```

**正确**：
```
# 专案只有其中一个：
- 已安装 ai-collaboration-standards skill
# 或
- 已复制 .standards/anti-hallucination.md
```

### 错误二：遗漏仅参考文件的规范

**错误**：
```
# 安装了所有 skills，但忘记参考文件
- Skills 已安装 ✓
- checkin-standards.md ✗（遗漏）
- spec-driven-development.md ✗（遗漏）
```

**正确**：
```
# Skills 和参考文件都有
- Skills 已安装 ✓
- .standards/checkin-standards.md ✓
- .standards/spec-driven-development.md ✓
```

### 错误三：忘记工具整合

如果使用 AI 编码助理，不要忘记复制整合档案：
- `.cursorrules` 用于 Cursor
- `.windsurfrules` 用于 Windsurf
- `.github/copilot-instructions.md` 用于 GitHub Copilot

---

## 机器可读注册表

工具和自动化请参阅 [standards-registry.json](../../adoption/standards-registry.json)。

此 JSON 档案包含所有规范、类别和采用方法的完整对照。

---

## 相关连结

- [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards) - 来源储存库
- [universal-dev-skills](https://github.com/AsiaOstrich/universal-dev-skills) - Skills 储存库
- [最小检查清单](../../adoption/checklists/minimal.md) - 等级一采用检查清单
- [推荐检查清单](../../adoption/checklists/recommended.md) - 等级二采用检查清单
- [企业检查清单](../../adoption/checklists/enterprise.md) - 等级三采用检查清单
