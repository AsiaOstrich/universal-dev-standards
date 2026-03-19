---
source: ../../../../skills/commands/check.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
description: [UDS] Verify standards adoption status
allowed-tools: Read, Bash(uds check:*), Bash(npx:*), Bash(ls:*)
argument-hint: "[--offline | --restore | --summary]"
---

# 检查标准

验证当前专案的 Universal Development Standards 采用状态。

## 快速开始

```bash
# Basic check (with interactive mode for issues)
uds check

# Compact summary for quick status
uds check --summary

# Check without network access
uds check --offline

# Restore missing or modified files
uds check --restore
```

## 输出模式

### 摘要模式 (--summary)

显示精简状态供快速浏览：

```
UDS Status Summary
──────────────────────────────────────────────────
  Version: 3.5.1-beta.16 → 3.5.1-beta.18 ⚠
  Level: 2 - Professional (专业)
  Files: 12 ✓
  Skills: Claude Code ✓ | OpenCode ○
  Commands: OpenCode ✓
──────────────────────────────────────────────────
```

### 完整模式（默认）

显示详细信息，包括：
- 采用状态（等级、版本、安装日期）
- 文件完整性（未变更/已修改/遗失数量）
- Skills 完整性（如果在 manifest 中追踪）
- Commands 完整性（如果在 manifest 中追踪）
- 集成区块完整性
- 引用同步状态
- AI 工具集成文件覆盖率
- 覆盖率报告

## 互动模式

当检测到问题时（已修改/遗失的文件），CLI 自动进入互动模式：

```
──────────────────────────────────────────────────
⚠ Modified: .standards/commit-message.ai.yaml

? What would you like to do?
❯ View diff
  Restore original
  Keep current (update hash)
  Skip
```

**可用操作：**

| 操作 | 说明 |
|------|------|
| **View diff** | 显示当前版本与原始版本的差异 |
| **Restore original** | 用上游版本替换 |
| **Keep current** | 接受修改并更新 hash |
| **Skip** | 对此文件不做任何操作 |

对于遗失的文件：

| 操作 | 说明 |
|------|------|
| **Restore** | 从上游下载并恢复 |
| **Remove from tracking** | 从 manifest 移除 |
| **Skip** | 对此文件不做任何操作 |

## 选项

| 选项 | 说明 |
|------|------|
| `--summary` | 显示精简状态摘要 |
| `--offline` | 跳过 npm registry 检查 |
| `--diff` | 显示修改文件的差异 |
| `--restore` | 还原所有修改和遗失的文件 |
| `--restore-missing` | 仅还原遗失的文件 |
| `--migrate` | 迁移旧版 manifest 到 hash 追踪 |

## 输出区段

### 采用状态

- 采用等级 (1-3)
- 安装日期
- 已安装版本
- 更新可用性

### 文件完整性

显示每个追踪文件的状态：

| 符号 | 含义 |
|------|------|
| ✓ (绿色) | 未变更 |
| ⚠ (黄色) | 已修改 |
| ✗ (红色) | 遗失 |
| ? (灰色) | 存在但无 hash |

摘要格式：`{unchanged} unchanged, {modified} modified, {missing} missing`

### Skills 完整性 (v3.3.0+)

如果 manifest 中存在 `skillHashes`，检查：
- 文件是否存在于预期路径
- hash 比对以检测修改

### Commands 完整性 (v3.3.0+)

如果 manifest 中存在 `commandHashes`，检查：
- 文件是否存在于预期路径
- hash 比对以检测修改

### 集成区块完整性 (v3.3.0+)

如果 manifest 中存在 `integrationBlockHashes`，检查：
- UDS 标记区块是否存在
- 区块内容 hash（用户在区块外的自定义内容会被保留）

### Skills 状态

显示每个已配置 AI 工具的安装状态：

```
Skills Status
  Claude Code:
    ✓ Skills installed:
      - User level: ~/.claude/skills/
        Version: 3.5.1
    ✓ Commands: 7 installed
      Path: .opencode/commands/
```

状态指示器：
- ✓ installed (绿色) - Skills/Commands 已安装
- ○ not installed (灰色) - 未安装

### 覆盖率摘要

显示标准覆盖率：
- 当前等级所需的标准
- Skills 覆盖的标准
- 参考文档覆盖的标准

## 状态指示

| 符号 | 含义 |
|------|------|
| ✓ (绿色) | 一切正常 |
| ⚠ (黄色) | 警告，建议采取行动 |
| ✗ (红色) | 错误，需要采取行动 |
| ○ (灰色) | 未安装/配置 |

## 常见问题

**"Standards not initialized"**
- 执行 `/init` 初始化标准

**"Update available"**
- 执行 `/update` 获取最新版本

**"Missing files"**
- 执行 `/check --restore` 或 `/update` 恢复

**"Modified files detected"**
- 执行 `/check --diff` 查看变更
- 执行 `/check --restore` 重置为原始版本
- 或使用互动模式逐个处理文件

**"Skills not installed"**
- 执行 `/update` 安装缺失的 Skills
- 或执行 `/config skills` 管理 Skills

**"Legacy manifest detected"**
- 执行 `uds check --migrate` 升级到 hash 追踪

## 使用方式

```bash
/check                  # Full check with interactive mode
/check --summary        # Quick status overview
/check --offline        # Check without network access
/check --restore        # Restore modified/missing files
/check --diff           # Show file differences
/check --migrate        # Upgrade manifest format
```

## 参考

- CLI 文档: `uds check --help`
- 初始化命令: [/init](./init.md)
- 更新命令: [/update](./update.md)
- 配置命令: [/config](./config.md)
