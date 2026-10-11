---
source: ../../../../skills/release-standards/SKILL.md
source_version: 1.1.0
translation_version: 1.2.0
last_synced: 2026-10-11
source_hash: e9e935fd95a0
status: current
description: |
  [UDS] 引导发布流程——语义化版本、发布模式，以及 start/finish/promote/deploy 的顺序。
  Use when: 切一个发布版本、决定语义化版本要升哪一位、把 release candidate 晋级为稳定版、记录一次部署。
  Not for: 撰写变更日志条目本身——请用 /changelog；部署的实现机制——请用 /deploy。
  Keywords: release, semantic versioning, version bump, release candidate, promote, 发布, 语义化版本, 发版流程, 版本晋级.
---

# 发布助手

> **语言**: [English](../../../../skills/release-standards/SKILL.md) | 简体中文

引导遵循语义化版本和变更日志最佳实践的发布流程。

## 子命令

| 子命令 | 模式 | 说明 |
|--------|------|------|
| `start` | All | 开始发布流程 |
| `finish` | CI/CD | 完成发布（标签、合并） |
| `promote` | Manual/Hybrid | RC → Stable 晋升 |
| `deploy` | Manual/Hybrid | 记录部署记录 |
| `manifest` | Manual/Hybrid | 生成打包信息清单（build-manifest.json） |
| `verify` | Manual/Hybrid | 验证清单一致性 |
| `changelog` | All | 生成或更新变更日志 |
| `check` | All | 执行发布前检查 |

## 发布模式

通过 `uds init` 或 `uds config --type release_mode` 配置：

| 模式 | 说明 |
|------|------|
| `ci-cd` | 通过 CI/CD 流水线自动发布（默认） |
| `manual` | 手动打包 + RC 工作流程 |
| `hybrid` | CI 构建产物 + 手动部署 |

## 版本类型

| 类型 | 格式 | npm Tag | 用途 |
|------|------|---------|------|
| Stable | `X.Y.Z` | `@latest` | 正式版 |
| Beta | `X.Y.Z-beta.N` | `@beta` | 公开测试 |
| Alpha | `X.Y.Z-alpha.N` | `@alpha` | 内部测试 |
| RC | `X.Y.Z-rc.N` | `@rc` | 候选版本 |

## 工作流程

1. **决定版本** - 根据变更决定版本类型（MAJOR/MINOR/PATCH）
2. **分流未关闭的 issue/PR** - `gh pr list` + `gh issue list`；将每一项二分为 **带上（bring-in）或延后（defer）**（XSPEC-265）
3. **更新版本文件** - 更新 package.json 和相关版本引用
4. **更新 CHANGELOG** - 将 [Unreleased] 条目移至新版本区段
5. **执行发布前检查** - 验证测试、lint、标准合规，**以及 issue/PR 分流闸门**
6. **创建 git tag** - 使用 `vX.Y.Z` 格式标签
7. **提交并推送** - 提交版本更新并推送标签

### 发版前 issue/PR 分流闸门（XSPEC-265）

递增版本号之前，扫描未关闭的 issue/PR，并对每一项做出有意识的决定——**不要**依赖记忆：

| 类别 | 动作 |
|------|------|
| **带上（Bring-in）** | patch 级 dependabot PR / 阻塞发布的 bug / 与本版主题相关的修复 → 在递增版本前合并 |
| **延后（Defer）** | major PR、审计/增强类 issue、需要另行评估者 → 记录在签核（signoff）的 "deferred" 中，并写入发布说明的 Known Issues |

- 确认 `cross-project/sub-project-triage.md` 快照是近期的（≤7 天）；若已过期则刷新。
- 将结果记录在发布签核（Tier-1）中：`Pre-release issue/PR triage | PASS | N PRs / M issues: X merged / Y deferred`。
- **不要求清空 backlog**——只要求每一项都有有意识的决定 + 留下记录。

### 版本递增规则

| 变更类型 | 递增 | 示例 |
|---------|------|------|
| 破坏性变更 | MAJOR | 1.9.5 → 2.0.0 |
| 新功能（向下兼容） | MINOR | 2.3.5 → 2.4.0 |
| 错误修复（向下兼容） | PATCH | 3.1.2 → 3.1.3 |

## 使用方式

### CI/CD 模式（默认）
- `/release start 1.2.0` - 开始 v1.2.0 的发布流程
- `/release changelog 1.2.0` - 更新 v1.2.0 的 CHANGELOG
- `/release finish 1.2.0` - 完成并标记 v1.2.0
- `/release check` - 执行发布前验证

### 手动模式（RC 工作流程）
- `/release start 1.2.0-rc.1` - 创建 RC 版本
- `uds release manifest` - 生成 build-manifest.json
- `uds release deploy staging` - 记录 staging 部署
- `uds release deploy staging --result passed` - 记录测试结果
- `/release promote 1.2.0` - 将 RC 晋升为稳定版
- `uds release deploy production` - 记录 production 部署
- `uds release verify` - 验证清单一致性

## 下一步引导

`/release` 完成后，AI 助手应建议：

> **发布流程完成。建议下一步：**
> - 验证 npm 发布状态 `npm view <pkg> dist-tags` ⭐ **推荐**
> - 创建 GitHub Release 并撰写发布说明
> - 通知利益相关者新版本已发布

## 参考

- [变更日志格式指南](./changelog-format.md) — 要撰写或审查变更日志条目时读它。
- [发布流程指南](./release-workflow.md) — 真的要发一版、需要逐步流程时读它。
- [语义化版本指南](./semantic-versioning.md) — 要判断一个变更算 major、minor 还是 patch 时读它。
- 详细指南：[guide.md](./guide.md)
- 核心规范：[versioning.md](../../../../core/versioning.md)

## AI 代理行为

> 完整的 AI 行为定义请参阅对应的命令文件：[`/release`](../../../../skills/commands/release.md#ai-agent-behavior--ai-代理行為)
