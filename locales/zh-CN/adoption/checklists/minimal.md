---
source: adoption/checklists/minimal.md
source_version: 1.0.1
translation_version: 1.0.1
last_synced: 2025-12-25
status: current
---

# 等级 1：基本采用检查清单

> **语言**: [English](../../../adoption/checklists/minimal.md) | 繁体中文

> 任何专案的最低可行标准
>
> 设置时间：约 30 分钟

---

## 前置条件

- [ ] 已初始化 Git 储存库
- [ ] 已安装 Claude Code（用于 Skills）

---

## Skills 安装

### 选项 A：Plugin Marketplace（推荐）

```bash
/plugin marketplace add AsiaOstrich/universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

### 选项 B：脚本安装（macOS / Linux）

```bash
git clone https://github.com/AsiaOstrich/universal-dev-skills.git
cd universal-dev-skills
./install.sh
# Select: Global installation
```

### 选项 C：手动复制（macOS / Linux）

```bash
# Copy only Level 1 skills
cp -r universal-dev-skills/skills/ai-collaboration-standards ~/.claude/skills/
cp -r universal-dev-skills/skills/commit-standards ~/.claude/skills/
```

### 选项 C：手动复制（Windows PowerShell）

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

1. Open Claude Code in your project
2. Try: "Help me write a commit message" → Should follow Conventional Commits
3. Ask about code changes → Should provide evidence-based responses

### 检阅参考文件

- [ ] Read `checkin-standards.md` and understand quality gates
- [ ] Read `spec-driven-development.md` and understand the methodology

---

## 最终检查清单

| Item | Status |
|------|--------|
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
- [Checkin Standards](../../../core/checkin-standards.md) - 签入标准
- [Spec-Driven Development](../../../core/spec-driven-development.md) - 规格驱动开发

---

## 版本历史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.1 | 2025-12-24 | Added: Related Standards, License sections |
| 1.0.0 | 2025-12-23 | Initial checklist |

---

## 授权

本检查清单以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。
