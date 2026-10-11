---
source: ../../../../skills/commands/changelog.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 474603032e40
---

---
name: changelog
description: "[UDS] Generate and maintain CHANGELOG.md entries"
---

# 变更日志助手

根据 Keep a Changelog 格式生成和维护 CHANGELOG.md 条目。

## 用法

```bash
/changelog
```

## 工作流程

1. **分析 git 日志** - 使用 `git log` 读取上次发布以来的提交历史
2. **分类变更** - 将提交映射到变更日志分类
3. **生成条目** - 为每个变更撰写面向用户的描述
4. **更新 CHANGELOG.md** - 将条目插入 [Unreleased] 或版本化区段

## 变更分类

| 分类 | 使用时机 | Commit 类型 |
|------|----------|-------------|
| **Added** | 新功能 | `feat` |
| **Changed** | 修改既有功能 | `perf`, `BREAKING CHANGE` |
| **Deprecated** | 即将移除的功能 | -- |
| **Removed** | 已移除的功能 | `BREAKING CHANGE` |
| **Fixed** | 错误修复 | `fix` |
| **Security** | 安全性修补 | `security` |

## 条目格式

```markdown
## [Unreleased]

### Added
- Add user dashboard with customizable widgets (#123)

### Fixed
- Fix memory leak when processing large files (#456)
```

### 撰写指南

- 为**用户**而非开发者撰写
- 聚焦**影响**而非实现
- 附上 issue/PR 编号
- 用 **BREAKING** 标记破坏性变更

## AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/changelog` | 分析 git log 自上次 release 以来的 commits，生成 changelog 条目 |

### 交互脚本

1. 找到最近的 git tag（上次 release）
2. 读取从上次 tag 至今的所有 commits
3. 依类型分类（Added / Changed / Fixed / Security 等）
4. 转写为用户导向的描述（非开发者语言）
5. 展示生成的 changelog 条目

🛑 **STOP**: 展示条目后等待用户确认更新 CHANGELOG.md

### 停止点

| 停止点 | 等待内容 |
|--------|---------|
| Changelog 条目展示后 | 确认内容正确并写入 |

### 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| 无 git tag（首次 release） | 分析所有 commits |
| CHANGELOG.md 不存在 | 建立新文件 |
| Commit message 格式不规范 | 尽力分类，标记 `[Manual Review]` |

## 参考

*   [Changelog Guide Skill](../changelog-guide/SKILL.md)
*   [Core Standard](../../core/changelog-standards.md)
