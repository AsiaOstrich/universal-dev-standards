---
name: changelog
description: "[UDS] Generate and maintain CHANGELOG.md entries"
---

# Changelog Assistant | 變更日誌助手

Generate and maintain CHANGELOG.md entries following the Keep a Changelog format.

根據 Keep a Changelog 格式產生和維護 CHANGELOG.md 條目。

## Usage | 用法

```bash
/changelog
```

## Workflow | 工作流程

1. **Analyze git log** - Read commit history since last release using `git log`
2. **Categorize changes** - Map commits to changelog categories
3. **Generate entries** - Write user-friendly descriptions for each change
4. **Update CHANGELOG.md** - Insert entries into the [Unreleased] or versioned section

## Change Categories | 變更分類

| Category | When to Use | 使用時機 | Commit Types |
|----------|-------------|---------|-------------|
| **Added** | New features | 新功能 | `feat` |
| **Changed** | Modifications to existing features | 修改既有功能 | `perf`, `BREAKING CHANGE` |
| **Deprecated** | Features to be removed | 即將移除的功能 | -- |
| **Removed** | Removed features | 已移除的功能 | `BREAKING CHANGE` |
| **Fixed** | Bug fixes | 錯誤修復 | `fix` |
| **Security** | Security patches | 安全性修補 | `security` |

## Entry Format | 條目格式

```markdown
## [Unreleased]

### Added
- Add user dashboard with customizable widgets (#123)

### Fixed
- Fix memory leak when processing large files (#456)
```

### Writing Guidelines | 撰寫指南

- Write for **users**, not developers | 為使用者而非開發者撰寫
- Focus on **impact**, not implementation | 聚焦影響而非實作
- Include issue/PR references | 附上 issue/PR 編號
- Mark breaking changes with **BREAKING** prefix | 用 **BREAKING** 標記破壞性變更

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/changelog` | 分析 git log 自上次 release 以來的 commits，生成 changelog 條目 |

### Interaction Script | 互動腳本

1. 找到最近的 git tag（上次 release）
2. 讀取從上次 tag 至今的所有 commits
3. 依類型分類（Added / Changed / Fixed / Security 等）
4. 轉寫為使用者導向的描述（非開發者語言）
5. 展示生成的 changelog 條目

🛑 **STOP**: 展示條目後等待使用者確認更新 CHANGELOG.md

### Stop Points | 停止點

| Stop Point | 等待內容 |
|-----------|---------|
| Changelog 條目展示後 | 確認內容正確並寫入 |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| 無 git tag（首次 release） | 分析所有 commits |
| CHANGELOG.md 不存在 | 建立新檔案 |
| Commit message 格式不規範 | 盡力分類，標記 `[Manual Review]` |

## References | 參考

*   [Changelog Guide Skill](../changelog-guide/SKILL.md)
*   [Core Standard](../../core/changelog-standards.md)
