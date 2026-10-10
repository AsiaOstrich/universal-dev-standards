---
source: ../../../../adoption/checklists/minimal.md
source_version: 1.0.1
translation_version: 1.0.1
last_synced: 2026-10-11
source_hash: e1ac3b282885
status: current
---

# 基本采用检查清单（历史参考）

> **语言**: [English](../../../../adoption/checklists/minimal.md) | [繁體中文](../../../zh-TW/adoption/checklists/minimal.md) | 简体中文
>
> **注意**：等级制度已移除。UDS 现在通过 `uds init` 默认安装所有标准。本检查清单保留作为历史参考。完整的采用检查清单请参见 [enterprise.md](enterprise.md)。

> 任何专案的最低可行标准
>
> 设置时间：约 30 分钟

---

## 前置条件

- [ ] 已初始化 Git 储存库
- [ ] 已安装 Claude Code（用于 Skills）

---

## Skills 安装

### 选项 A：装进项目（主要路径）

支持多种 AI 工具、有繁体与简体中文文本、跟随你装的 UDS 版本。

```bash
npx universal-dev-standards init
```

### 选项 B：Plugin Marketplace（替代方式，有限制）

只支持 Claude Code、只有英文技能文本、只跟正式版、项目内不放文件。

```bash
# In Claude Code
/plugin marketplace add AsiaOstrich/universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

### 选项 C：手动复制（macOS / Linux）

```bash
# Copy only Level 1 skills
cp -r universal-dev-skills/skills/ai-collaboration-standards ~/.claude/skills/
cp -r universal-dev-skills/skills/commit-standards ~/.claude/skills/
```

### 选项 D：手动复制（Windows PowerShell）

```powershell
# Copy only Level 1 skills
Copy-Item -Recurse universal-dev-skills\skills\ai-collaboration-standards $env:USERPROFILE\.claude\skills\
Copy-Item -Recurse universal-dev-skills\skills\commit-standards $env:USERPROFILE\.claude\skills\
```

**检查清单**：
- [ ] 已安装 ai-collaboration-standards skill
- [ ] 已安装 commit-standards skill

---

## 参考文件

将这些文件复制到您的专案：

**macOS / Linux:**
```bash
# In your project root
mkdir -p .standards

# Copy Level 1 reference documents
cp path/to/universal-dev-standards/core/checkin-standards.md .standards/
cp path/to/universal-dev-standards/core/spec-driven-development.md .standards/
```

**Windows PowerShell:**
```powershell
# In your project root
New-Item -ItemType Directory -Force -Path .standards

# Copy Level 1 reference documents
Copy-Item path\to\universal-dev-standards\core\checkin-standards.md .standards\
Copy-Item path\to\universal-dev-standards\core\spec-driven-development.md .standards\
```

**检查清单**:
- [ ] `.standards/` 目录已建立
- [ ] `checkin-standards.md` 已复制
- [ ] `spec-driven-development.md` 已复制

---

## 验证

### 测试 Skills

1. 在您的专案中打开 Claude Code
2. 尝试："Help me write a commit message" → 应遵循 Conventional Commits
3. 询问代码变更 → 应提供基于证据的回应

### 检阅参考文件

- [ ] 阅读 `checkin-standards.md` 并理解质量关卡
- [ ] 阅读 `spec-driven-development.md` 并理解该方法论

---

## 最终检查清单

| 项目 | 状态 |
|------|------|
| ai-collaboration-standards skill | [ ] |
| commit-standards skill | [ ] |
| .standards/checkin-standards.md | [ ] |
| .standards/spec-driven-development.md | [ ] |

---

## 下一步

准备升级到等级二（推荐）时：
- 参见 [recommended.md](recommended.md)

---

## 相关标准

- [Recommended Adoption Checklist](recommended.md) - Level 2 升级指南
- [Enterprise Adoption Checklist](enterprise.md) - Level 3 升级指南
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
