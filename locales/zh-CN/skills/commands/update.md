---
description: [UDS] Update development standards to latest version
allowed-tools: Read, Bash(uds update:*), Bash(uds check:*), Bash(uds configure:*), Bash(npx:*), Bash(cat .standards/*), Bash(ls .claude/*), Bash(ls .opencode/*), Bash(ls .github/*)
argument-hint: "[--yes] [--offline] [--beta]"
---

# Update Standards | 更新标准

Update Universal Development Standards to the latest version.

将 Universal Development Standards 更新至最新版本。

## Interactive Mode (Default) | 交互模式（默认）

When invoked without `--yes`, use AskUserQuestion to confirm update preferences.

当不带 `--yes` 执行时，使用 AskUserQuestion 确认更新偏好。

### Step 1: Check Current Status | 步骤 1：检查当前状态

First, run `uds check --summary` to show compact installation status.

首先，执行 `uds check --summary` 显示精简安装状态。

```bash
uds check --summary
```

This shows: version (with update indicator), level, files status, Skills status, and Commands status.

### Step 2: Ask Update Preferences | 步骤 2：询问更新偏好

If updates are available, use AskUserQuestion with options based on version type.

根据可用更新的版本类型显示对应选项。

#### Pre-release Version Types | Pre-release 版本类型

Pre-release versions are sorted by stability (ascending):

Pre-release 版本按稳定度排序（由低到高）：

| Type | Stability | Description | 说明 |
|------|-----------|-------------|------|
| alpha | Early | Features may be incomplete, for internal testing | 功能可能不完整，供内部测试 |
| beta | Testing | Features complete, may have bugs, for early adopters | 功能大致完成，可能有 bug，供早期采用者 |
| rc | Near-stable | Release candidate, close to stable, for beta testers | 候选发布版，接近正式版，供 beta 测试者 |

Version comparison: `alpha < beta < rc < stable`

For detailed versioning standards, see [core/versioning.md](../../core/versioning.md).

#### Update Options | 更新选项

**If stable version available (e.g., 3.5.1):**

| Option | Description |
|--------|-------------|
| **Update Now** | 更新标准至最新稳定版 X.Y.Z（推荐） |
| **Check Beta** | 检查 beta 版本更新 |
| **Skip** | 目前不更新 |

**If only pre-release version available, show specific type:**

Detect the version type from `uds check` output and display the specific type name:

| Detected Type | Option Label | Description |
|---------------|--------------|-------------|
| `X.Y.Z-alpha.N` | **Update to Alpha** | 更新至 alpha 版本 X.Y.Z-alpha.N（早期测试） |
| `X.Y.Z-beta.N` | **Update to Beta** | 更新至 beta 版本 X.Y.Z-beta.N（功能大致完成） |
| `X.Y.Z-rc.N` | **Update to RC** | 更新至 RC 版本 X.Y.Z-rc.N（接近稳定） |

Always include **Skip** option: 目前不更新。

**Example AskUserQuestion for beta version:**
- Question: "有新的 beta 版本可用：3.5.1-beta.3 → 3.5.1-beta.15。您想如何处理？"
- Option 1: "更新至 Beta (建议)" - "更新标准至 3.5.1-beta.15 版本（功能大致完成）"
- Option 2: "暂时跳过" - "目前不进行更新，维持现有版本"

### Step 3: Execute Update | 步骤 3：执行更新

**If Update Now selected:**
```bash
uds update --yes
```

**If Check Beta selected:**
```bash
uds update --beta --yes
```

### Step 4: Check Skills/Commands Status | 步骤 4：检查 Skills/Commands 状态

After update completes, check for missing or outdated Skills/Commands using multi-stage AskUserQuestion.

更新完成后，使用多阶段 AskUserQuestion 检查缺少或过时的 Skills/Commands。

**重要：** 由于 AskUserQuestion 选项有限（最多 4 个），使用多阶段方式处理不同 AI 工具和安装偏好。

#### Step 4a: Detect Missing Skills | 步骤 4a：检测缺少的 Skills

First, read the manifest to identify configured AI tools and their Skills status:

首先读取 manifest 来识别已配置的 AI 工具及其 Skills 状态：

```bash
# Read manifest to get configured AI tools
cat .standards/manifest.json
# Check existing Skills installations
ls .claude/skills/ 2>/dev/null || echo "Not installed"
ls .opencode/skill/ 2>/dev/null || echo "Not installed"
```

For each configured AI tool that supports Skills, check if Skills are installed.

#### Step 4b/4c: Ask Skills Installation (Combined) | 步骤 4b/4c：询问 Skills 安装（整合）

If any configured AI tools are missing Skills, use **Smart Grouping** strategy.

如果有已配置的 AI 工具缺少 Skills，使用**智能分组**策略。

**重要：AskUserQuestion 最多只能有 4 个选项。** 使用智能分组来处理。

**Step 4b-1: Check Marketplace Status (Claude Code only)**

First, check if Plugin Marketplace is already installed:
```bash
ls ~/.claude/plugins/universal-dev-standards@asia-ostrich 2>/dev/null && echo "Marketplace installed"
```

- If Marketplace IS installed → Show "Claude Code: ✓ 已通过 Marketplace 安装" and skip Claude Code options
- If Marketplace NOT installed → Include Marketplace option

**Step 4b-2: Apply Smart Grouping Strategy**

#### Strategy A: 1-2 Tools → Combined Question | 策略 A：1-2 个工具 → 合并询问

**Example (Claude Code only, Marketplace not installed):**
```
Question: "Skills 要安装到哪里？"
Options:
1. Plugin Marketplace (建议) - 自动更新，易于管理
2. User Level (~/.claude/skills/) - 所有项目共用
3. Project Level (.claude/skills/) - 仅此项目
4. 跳过 - 不安装 Skills
```

**Example (OpenCode + Copilot, Claude Code already via Marketplace):**
```
Question: "Skills 要安装到哪里？（Claude Code: ✓ 已通过 Marketplace 安装）"
Options:
1. 全部 User Level - 所有项目共用
2. 全部 Project Level (建议) - 仅此项目
3. 跳过 - 不安装额外 Skills
```

#### Strategy B: 3+ Tools → Two-Stage Question | 策略 B：3+ 个工具 → 两阶段询问

**Stage 1: Ask unified or individual**
```
Question: "有多个 AI 工具需要安装 Skills，安装层级要如何设定？"
Options:
1. 统一层级 (建议) - 所有工具使用相同层级
2. 个别设定 - 为每个工具分别选择层级
3. 跳过 - 不安装 Skills
```

**Stage 2a: If unified → ask level once**
```
Question: "所有 Skills 要安装到哪个层级？"
Options:
1. User Level - 所有项目共用
2. Project Level (建议) - 仅此项目
```

**Stage 2b: If individual → per-tool questions**

**Execute installation:**
```bash
uds configure --type skills --ai-tool opencode --skills-location project
uds configure --type skills --ai-tool cursor --skills-location user
```

**注意：** 如果用户选择统一层级，使用 `--skills-location` 选项。如果选择个别设定，不带此选项执行以触发交互提示。

#### Step 4d: Detect Missing Commands | 步骤 4d：检测缺少的 Commands

Check for configured AI tools that support Commands but don't have them installed:

检查已配置但尚未安装 Commands 的 AI 工具：

```bash
# Check existing Commands installations
ls .opencode/commands/ 2>/dev/null || echo "Not installed"
ls .github/commands/ 2>/dev/null || echo "Not installed"
```

**Note:** Not all AI tools support Commands. Tools that support Commands:
- OpenCode (.opencode/commands/)
- GitHub Copilot (.github/commands/)
- Roo Code (.roo/commands/)
- Gemini CLI (.gemini/commands/)

#### Step 4e: Ask Commands Installation | 步骤 4e：询问 Commands 安装

If any configured AI tools are missing Commands, use **Smart Grouping** strategy.

如果有已配置的 AI 工具缺少 Commands，使用**智能分组**策略。

**重要：AskUserQuestion 最多只能有 4 个选项。** 使用智能分组来处理。

#### Strategy A: 1-2 Tools → Combined Question | 策略 A：1-2 个工具 → 合并询问

**Example (OpenCode only):**
```
Question: "Commands 要安装到哪里？"
Options:
1. User Level (~/.config/opencode/command/) - 所有项目共用
2. Project Level (.opencode/command/) - 仅此项目 (建议)
3. 跳过 - 使用 Skills 即可
```

**Example (OpenCode + Copilot):**
```
Question: "Commands 要安装到哪里？"
Options:
1. 全部 User Level - 所有项目共用
2. 全部 Project Level (建议) - 仅此项目
3. 跳过 - 使用 Skills 即可
```

#### Strategy B: 3+ Tools → Two-Stage Question | 策略 B：3+ 个工具 → 两阶段询问

**Stage 1: Ask unified or individual**
```
Question: "有多个 AI 工具需要安装 Commands，安装层级要如何设定？"
Options:
1. 统一层级 (建议) - 所有工具使用相同层级
2. 个别设定 - 为每个工具分别选择层级
3. 跳过 - 不安装 Commands
```

**Stage 2a: If unified → ask level once**
```
Question: "所有 Commands 要安装到哪个层级？"
Options:
1. User Level - 所有项目共用
2. Project Level (建议) - 仅此项目
```

**Stage 2b: If individual → per-tool questions**

**Execute installation:**
```bash
# CLI will prompt for installation level
uds configure --type commands --ai-tool opencode
uds configure --type commands --ai-tool copilot
```

**注意：** 指定 `--ai-tool` 时，CLI 会交互询问安装层级（project 或 user）。

#### Declined Features Handling | 拒绝功能处理

**重要：** CLI 会在 `manifest.declinedFeatures` 中追踪用户拒绝的选项。

- 用户之前拒绝的工具不会在后续提示中显示
- 可通过 `/config skills` 或 `/config commands` 重新安装
- 拒绝按工具记录（例如拒绝 OpenCode 的 Skills 不影响 Claude Code）

### Step 5: Explain Results | 步骤 5：说明结果

After all operations complete, explain:
1. 更新了什么（标准版本、文件数量）
2. Skills/Commands 安装结果
3. 遇到的任何错误
4. 后续步骤（如果安装了 Skills 则重启 AI 工具）

## Quick Mode | 快速模式

When invoked with `--yes` or specific options, skip interactive questions:

```bash
/update --yes           # 无需确认直接更新
/update --beta --yes    # 更新至 beta 版本
/update --offline       # 跳过 npm registry 检查
/update --skills        # 仅更新 Skills
/update --commands      # 仅更新 Commands
```

**注意：** 在 `--yes` 模式下，CLI 显示可用 Skills/Commands 的提示但不会自动安装（保守行为）。

## Options Reference | 选项参考

| Option | Description | 说明 |
|--------|-------------|------|
| `--yes`, `-y` | Skip confirmation prompt | 跳过确认提示 |
| `--offline` | Skip npm registry check | 跳过 npm registry 检查 |
| `--beta` | Check for beta version updates | 检查 beta 版本更新 |
| `--skills` | Update Skills only | 仅更新 Skills |
| `--commands` | Update Commands only | 仅更新 Commands |
| `--integrations-only` | Regenerate integration files only | 仅重新生成集成文件 |
| `--sync-refs` | Sync integration file references | 同步集成文件引用 |
| `--standards-only` | Update standards without integrations | 仅更新标准，不更新集成 |

## What Gets Updated | 更新内容

- `.standards/` 目录中的标准文件
- 扩展文件（语言、框架、区域设置）
- 集成文件（`.cursorrules`、`CLAUDE.md` 等）
- `manifest.json` 中的版本信息

## Skills Update | Skills 更新

Skills are managed separately:

| Installation | Update Method | 更新方法 |
|--------------|---------------|----------|
| Plugin Marketplace | Auto-updates on Claude Code restart | 重启 Claude Code 自动更新 |
| User-level | `cd ~/.claude/skills && git pull` | 手动更新 |
| Project-level | `cd .claude/skills && git pull` | 手动更新 |

## Troubleshooting | 故障排查

**"Standards not initialized"**
- 先运行 `/init` 初始化标准

**"Already up to date"**
- 无需操作；标准已是最新

**"Skills previously declined"**
- 运行 `/config skills` 重新安装被拒绝的 Skills

## Reference | 参考

- CLI documentation: `uds update --help`
- Check command: [/check](./check.md)
- Config command: [/config](./config.md)
