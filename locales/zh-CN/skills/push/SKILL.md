---
name: push
source: ../../../../skills/push/SKILL.md
source_version: 2.0.0
translation_version: 2.0.0
last_synced: 2026-06-02
source_hash: b7812535483c
scope: universal
description: |
  [UDS] AI 辅助 git push 安全层：质量门禁 + 协作护栏。
  Use when: pushing commits, force pushing, pushing to protected branches, pushing feature branches.
  Keywords: git push, force push, protected branch, quality gate, push receipt, PR automation, 推送, 保护分支, 质量门禁.
allowed-tools: Read, Bash(git:*), Bash(npm:*), Bash(pnpm:*), Bash(yarn:*), Bash(bun:*)
argument-hint: "[--force] [--target <branch>] [--skip-gates] [--no-pr]"
---

# 推送助手

> **语言**: [English](../../../../skills/push/SKILL.md) | 简体中文

**版本**：2.0.0
**创建日期**：2026-04-23
**适用范围**：Claude Code Skills

---

`git push` 的 AI 辅助安全层。检测保护分支、强制 force-push 护栏、执行 pre-push 质量门禁、输出结构化推送收据，并集成 PR 自动化。

## 核心标准

本 Skill 实现 [`.standards/push-standards.ai.yaml`](../../../../.standards/push-standards.ai.yaml)。

---

## 执行工作流程

调用 `/push` 后，Claude 原生依序执行以下步骤：

### Step 1：检测保护分支
执行 `git rev-parse --abbrev-ref HEAD` 获取当前分支。
比对 `protected_branches` 列表（默认：main、master、release/*、hotfix/*）。
若为保护分支：显示警告 + 待推送的 commit 列表，需用户明确确认才能继续。

### Step 2：检测 Force Push
若检测到 `--force` 或 `--force-with-lease`：
执行 `git log origin/<branch>..HEAD --oneline` 找出将被覆盖的 commits。
显示数量与作者列表。需要用户输入 `yes, force push` 才能继续。

### Step 3：执行 Pre-Push 质量门禁
依序使用 Bash tool 执行每个已设置的门禁：
- `lint`：检测并执行项目 lint 命令
- `test`：检测并执行项目测试命令
- `type-check`（可选）：TypeScript 类型检查
- `ac-coverage`（可选）：验收条件覆盖率
- `security-scan`（可选）：安全漏洞扫描

若任何必需门禁失败：中止并显示错误信息。

### Step 4：执行推送
执行 `git push <remote> <branch> [--force]`。
若推送失败：显示 git 错误并建议修正方式。

### Step 5：发出推送收据
将结构化收据输出到 console（可选择写入 `~/.uds/push-history.jsonl`）：
```json
{
  "branch": "<branch>",
  "commit_sha": "<sha>",
  "gates_passed": ["lint", "test"],
  "force_push": false,
  "timestamp": "<ISO8601>",
  "target_remote": "origin"
}
```

### Step 6：PR 集成
若 `auto_pr=true` **且** `repo_mode=team` **且**该分支无 open PR：
建议用户执行 `/pr-automation-assistant` 创建 Pull Request。

---

## 功能说明

### 1. 推送目标风险检测

推送前检测目标分支是否为保护分支（例如 `main`、`master`、`release/*`、`hotfix/*`）。

- 显示**警告**，列出分支名称与 commit 列表
- 需要用户明确确认才能继续
- 用户未确认则中止推送

### 2. Force-Push 护栏

检测到 `--force` 时，推送前显示影响范围。

- 计算远端将被覆盖的 commits
- 显示被覆盖 commits 的数量与作者
- 要求用户输入确认字符串（`yes, force push`）
- 在推送收据中记录 `force_push: true`

### 3. Pre-Push 质量门禁

推送前依序执行已设置的质量门禁。

| 门禁 | 说明 |
|------|------|
| `lint` | 执行 lint 检查 |
| `test` | 执行测试 |
| `type-check` | TypeScript 类型检查（可选） |
| `ac-coverage` | AC 覆盖率检查（可选） |
| `security-scan` | 安全扫描（可选） |

### 4. 推送收据

推送成功后输出结构化收据，供审计追踪使用。

```json
{
  "branch": "feature/my-feature",
  "commit_sha": "a1b2c3d",
  "gates_passed": ["lint", "test"],
  "gates_skipped": false,
  "force_push": false,
  "timestamp": "2026-04-23T10:00:00Z",
  "target_remote": "origin"
}
```

可选择追加到 `~/.uds/push-history.jsonl` 以持久化审计追踪。

### 5. PR 自动化集成入口

推送 feature branch 后，若尚无 PR，提示用户创建 Pull Request。

- 检查该分支是否已有 open PR
- 提示用户执行 `pr-automation-assistant`
- 在 `single-owner` repo 模式或使用 `--no-pr` 旗标时跳过

---

## 使用方式

```bash
# 标准推送（自动执行质量门禁）
/push

# Force push（显示被覆盖 commits，需要确认）
/push --force

# 推送到指定的远端分支
/push --target main

# 跳过质量门禁（紧急情况）
/push --skip-gates

# 推送但不提示创建 PR
/push --no-pr

# Force push 且不提示创建 PR（例如更新个人分支）
/push --force --no-pr
```

## 参数说明

| 参数 | 说明 |
|------|------|
| `--force` | 启用 force push，含护栏确认 |
| `--target <branch>` | 明确指定目标远端分支 |
| `--skip-gates` | 跳过质量门禁（仅紧急情况） |
| `--no-pr` | 推送后不提示创建 PR |

---

## 设置

通过 `uds.project.yaml` 设置：

```yaml
push:
  repo_mode: team           # "team" | "single-owner"
  protected_branches:
    - main
    - master
    - "release/*"
    - "hotfix/*"
  push_gates:
    default:
      - lint
      - test
    optional:
      - type-check
      - ac-coverage
      - security-scan
  receipt:
    output: console          # "console" | "file" | "both"
    file_path: "~/.uds/push-history.jsonl"
  auto_pr: true              # 推送到非保护分支后是否提示创建 PR
```

### 选项模式

| Option 文件 | 模式 | 说明 |
|-------------|------|------|
| [`options/push/team-mode.md`](../../../../options/push/team-mode.md) | `team` | 完整协作护栏（默认） |
| [`options/push/single-owner-mode.md`](../../../../options/push/single-owner-mode.md) | `single-owner` | 个人 repo 低摩擦模式 |

---

## 下一步引导

`/push` 完成后，AI 助手应建议：

> **推送完成。建议下一步：**
> - 执行 `/pr-automation-assistant` 创建或更新 Pull Request ⭐ **推荐** — 确保协作流程完整
> - 执行 `/checkin` 确认代码签入质量 — 下次提交前的质量确认
> - 查看 `~/.uds/push-history.jsonl` 确认推送记录 — 审计追踪

---

## 相关标准

- [Push Standards](../../../../.standards/push-standards.ai.yaml) — 核心推送安全规则
- [Git Workflow](../../../../.standards/git-workflow.ai.yaml) — 分支策略
- [Commit Message](../../../../.standards/commit-message.ai.yaml) — Commit 约定
- [PR Automation](../pr-automation-assistant/SKILL.md) — Pull Request 自动化

---

## 版本历程

| 版本 | 日期 | 变更 |
|------|------|------|
| 2.0.0 | 2026-04-28 | 还原 workflow 执行步骤（XSPEC-097 采用层解耦）；移除弃用通知 |
| 1.0.0 | 2026-04-23 | 初始版本 — XSPEC-081 Phase 1 |

---

## 授权

本 Skill 采用 [MIT License](https://opensource.org/licenses/MIT) 与 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 双重授权发布。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
