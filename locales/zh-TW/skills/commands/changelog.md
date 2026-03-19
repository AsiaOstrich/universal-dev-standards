---
source: ../../../../skills/commands/changelog.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
name: changelog
description: "[UDS] Generate and maintain CHANGELOG.md entries"
---

# 變更日誌助手

> **Language**: [English](../../../../skills/commands/changelog.md) | 繁體中文

根據 Keep a Changelog 格式產生和維護 CHANGELOG.md 條目。

---

## 用法

```bash
/changelog
```

## 工作流程

1. **分析 git log** - 使用 `git log` 讀取自上次發布以來的提交歷史
2. **分類變更** - 將提交映射到變更日誌分類
3. **產生條目** - 為每個變更撰寫面向使用者的描述
4. **更新 CHANGELOG.md** - 將條目插入 [Unreleased] 或版本化區段

## 變更分類

| 分類 | 使用時機 | 對應 Commit 類型 |
|------|---------|-----------------|
| **Added** | 新功能 | `feat` |
| **Changed** | 修改既有功能 | `perf`, `BREAKING CHANGE` |
| **Deprecated** | 即將移除的功能 | -- |
| **Removed** | 已移除的功能 | `BREAKING CHANGE` |
| **Fixed** | 錯誤修復 | `fix` |
| **Security** | 安全性修補 | `security` |

## 條目格式

```markdown
## [Unreleased]

### Added
- Add user dashboard with customizable widgets (#123)

### Fixed
- Fix memory leak when processing large files (#456)
```

### 撰寫指南

- 為**使用者**而非開發者撰寫
- 聚焦**影響**而非實作
- 附上 issue/PR 編號
- 用 **BREAKING** 標記破壞性變更

## 參考

*   [Changelog Guide Skill](../changelog-guide/SKILL.md)
*   [Core Standard](../../core/changelog-standards.md)
