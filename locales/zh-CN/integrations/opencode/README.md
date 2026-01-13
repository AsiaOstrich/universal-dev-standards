---
source: ../../../../integrations/opencode/README.md
source_version: 1.3.0
translation_version: 1.3.0
last_synced: 2026-01-13
status: current
---

# OpenCode 集成

本目录提供将通用开发规范与 OpenCode 集成的资源。

## 概述

OpenCode 是开源 AI 编码代理，可作为终端界面、桌面应用或 IDE 扩展。此集成帮助 OpenCode 理解您的项目并遵循开发规范。

## 资源

- **[AGENTS.md](./AGENTS.md)**（必要）：
  项目级规则文件，OpenCode 会自动加载。

- **[skills-mapping.md](./skills-mapping.md)**（参考）：
  将所有 18 个 Claude Code 技能对应到 OpenCode 等效方式。

- **[opencode.json](../../../../integrations/opencode/opencode.json)**（可选）：
  配置示例，包含权限设置和自定义 agent。

## 配置层级

OpenCode 支持多层配置：

| 类型 | 文件位置 | 说明 |
|------|---------|------|
| 项目规则 | `AGENTS.md` | 项目根目录，自动加载 |
| 全局规则 | `~/.config/opencode/AGENTS.md` | 个人规则，适用所有项目 |
| 项目配置 | `opencode.json` | JSON 格式配置 |
| 全局配置 | `~/.config/opencode/opencode.json` | 全局 JSON 配置 |
| 自定义 Agent | `.opencode/agent/*.md` | 项目级 agent |
| 全局 Agent | `~/.config/opencode/agent/*.md` | 全局 agent |

## 快速开始

### 方式一：复制规则文件（推荐）

```bash
# 复制到项目根目录
cp integrations/opencode/AGENTS.md AGENTS.md

# 可选：复制配置文件
cp integrations/opencode/opencode.json opencode.json
```

### 方式二：使用 curl

```bash
curl -o AGENTS.md https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/integrations/opencode/AGENTS.md
```

### 方式三：使用 /init（追加模式）

```bash
opencode
/init
```

注意：`/init` 会**追加**到现有 AGENTS.md，而非覆盖。

### 方式四：使用 UDS CLI（推荐用于 Skills）

```bash
# 全局安装 UDS CLI
npm install -g universal-dev-standards

# 初始化项目 - 选择 OpenCode 作为 AI 工具
uds init

# Skills 将安装到 .claude/skills/（OpenCode 会自动检测）
```

**v3.5.0 新功能**：OpenCode 现在在 CLI 中被视为 skills 兼容工具。
当只选择 OpenCode（或 Claude Code）时，将自动提供带有 skills 的精简安装。

使用 `uds check` 验证安装状态和 skills 兼容性。

## 规则合并行为

OpenCode 的规则合并机制：

| 情况 | 行为 |
|------|------|
| `/init` 且已有 AGENTS.md | **追加**新内容，不覆盖 |
| 全局 + 项目规则同时存在 | **合并**两者，项目规则优先 |
| 配置文件（opencode.json） | **合并**，只有冲突的键才覆盖 |

## 配置选项

### opencode.json

```json
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": ["AGENTS.md", "CONTRIBUTING.md"],
  "permission": {
    "edit": "ask",
    "bash": "ask"
  },
  "agent": {
    "code-reviewer": {
      "description": "Reviews code following standards",
      "mode": "subagent",
      "tools": {"write": false, "edit": false}
    }
  }
}
```

**关键选项**：
- `instructions`：引用额外规则文件（适用于 monorepo）
- `permission`：编辑和 bash 命令需用户确认
- `agent`：定义具有特定能力的自定义 agent

---

## Skills 兼容性

OpenCode **完全兼容** Claude Code 技能。所有 18 个 UDS 技能无需修改即可使用。

### 配置对照

| Claude Code | OpenCode |
|-------------|----------|
| `CLAUDE.md` | `AGENTS.md` |
| `.claude/skills/` | `.opencode/skill/`（也读取 `.claude/skills/`） |
| `settings.json` | `opencode.json` |

### 技能搜索顺序

OpenCode 按以下顺序搜索技能：
1. `.opencode/skill/<name>/SKILL.md`（项目）
2. `~/.config/opencode/skill/<name>/SKILL.md`（全局）
3. **`.claude/skills/<name>/SKILL.md`**（Claude 兼容 ✅）

### 快速验证

```bash
# 在 OpenCode 中测试技能加载
opencode
/commit  # 应加载 commit-standards 技能
```

完整技能对照和安装方法，请参阅 **[skills-mapping.md](./skills-mapping.md)**

---

## 相关规范

- [防幻觉规范](../../core/anti-hallucination.md)
- [Commit 消息指南](../../core/commit-message-guide.md)
- [代码审查清单](../../core/code-review-checklist.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.3.0 | 2026-01-13 | 新增 UDS CLI 安装选项；OpenCode 现在在 CLI 中支持 skills |
| 1.2.0 | 2026-01-13 | 新增 skills-mapping.md；简化 README |
| 1.1.0 | 2026-01-13 | 新增 Claude Code 迁移指南 |
| 1.0.0 | 2026-01-09 | 初始 OpenCode 集成 |

---

## 许可证

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。
