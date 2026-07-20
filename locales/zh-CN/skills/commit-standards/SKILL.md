---
source: ../../../../skills/commit-standards/SKILL.md
source_version: 1.0.0
source_hash: bc13c6166e8d
translation_version: 1.0.0
last_synced: 2026-07-09
status: current
description: |
  [UDS] 根据 Conventional Commits 规范产生格式正确的 commit message。
  使用时机：提交代码、撰写 commit message、检查提交格式。
  关键字：commit, conventional commits, 提交, 消息, feat, fix, refactor。
---

# Commit Message 助手

> **语言**: [English](../../../../skills/commit-standards/SKILL.md) | 简体中文

根据 staged 的变更，产生符合 Conventional Commits 格式的 commit message。

## 工作流程

0. **检测语言** - 读取 `.standards/manifest.json` → 检查 `options.output_language`。若找不到，默认为 `english`。
1. **检查状态** - 执行 `git status` 和 `git diff --staged` 了解变更内容
2. **分析变更** - 判断类型（feat、fix、refactor 等）和范围
3. **产生消息** - 按检测到的语言，依以下对应格式建立 commit message（见下方）
4. **确认并提交** - 在执行 `git commit` 前询问用户确认

### 消息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

## 提交类型

| 类型 | 使用时机 |
|------|---------|
| `feat` | 新功能 |
| `fix` | 修复错误 |
| `refactor` | 重构（无功能变更） |
| `docs` | 文档更新 |
| `style` | 格式调整（无逻辑变更） |
| `test` | 测试相关 |
| `perf` | 性能优化 |
| `chore` | 维护任务 |

## 规则

- **Subject**：祈使语气、不加句号、首字母大写、不超过 72 字符
- **Body**：说明**为什么**进行变更，而非仅描述变更了什么
- **Footer**：使用 `BREAKING CHANGE:` 标记破坏性变更，使用 `Fixes #123` 关联 issue

## 双语格式

当 `output_language` 为 `bilingual` 时，你必须使用以下格式：

```
<type>(<scope>): <English subject>. <中文主旨>.

<English body — explain what and why in English>

<中文正文 — 用中文说明做了什么及为什么>

<footer>
```

### 必须遵守的规则

1. 英文正文在前，中文正文在后
2. 英文正文与中文正文之间以空白行分隔
3. 严禁在同一段落内混用语言
4. 严禁省略中文正文——两种语言皆为必填
5. Footer（BREAKING CHANGE、Fixes #、Co-authored-by）置于两段正文之后的最末端

### 双语示例

```
feat(auth): Add OAuth2 Google login support. 新增 OAuth2 Google 登录支持.

Implement Google OAuth2 authentication flow for user login.

- Add Google OAuth2 SDK integration
- Create callback endpoint for OAuth flow
- Store refresh tokens securely

实现 Google OAuth2 认证流程供用户登录。

- 集成 Google OAuth2 SDK
- 建立 OAuth 流程回调端点
- 安全存储刷新令牌

Closes #123
```

## 繁体中文格式

当 `output_language` 为 `traditional-chinese` 时，使用中文类型与正文：

```
功能(认证): 新增 OAuth2 Google 登录支持

实现 Google OAuth2 认证流程供用户登录。

关闭 #123
```

## 使用方式

- `/commit` - 自动分析 staged 的变更并建议 commit message
- `/commit fix login bug` - 根据提供的描述产生消息

## 下一步引导

`/commit` 完成后，AI 助手应建议：

> **提交完成。建议下一步：**
> - 执行 `git push` 推送到远端 ⭐ **推荐** — 推送到远端
> - 准备发布时 → 执行 `/changelog` + `/release` — 准备发布时执行
> - 发现重复模式或规范摩擦 → 执行 `/audit --report` 回报 — 检测到模式或摩擦时回报反馈

## 参考

- 详细指南：[guide.md](./guide.md)
- 核心规范：[commit-message-guide.md](../../../../core/commit-message-guide.md)

## AI 代理行为

> 完整的 AI 行为定义请参阅对应的命令文件：[`/commit`](../../../../skills/commands/commit.md#ai-agent-behavior--ai-代理行為)
