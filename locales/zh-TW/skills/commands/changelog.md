---
source: ../../../../skills/commands/changelog.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 474603032e40
status: current
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

| 分類 | When to Use | 使用時機 | 對應 Commit 類型 |
|------|-------------|---------|-----------------|
| **Added** | New features | 新功能 | `feat` |
| **Changed** | Modifications to existing features | 修改既有功能 | `perf`, `BREAKING CHANGE` |
| **Deprecated** | Features to be removed | 即將移除的功能 | -- |
| **Removed** | Removed features | 已移除的功能 | `BREAKING CHANGE` |
| **Fixed** | Bug fixes | 錯誤修復 | `fix` |
| **Security** | Security patches | 安全性修補 | `security` |

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

## AI 代理行為

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### 進入路由

| 輸入 | AI 動作 |
|-------|-----------|
| `/changelog` | 分析 git log 自上次 release 以來的 commits，生成 changelog 條目 |

### 互動腳本

1. 找到最近的 git tag（上次 release）
2. 讀取從上次 tag 至今的所有 commits
3. 依類型分類（Added / Changed / Fixed / Security 等）
4. 轉寫為使用者導向的描述（非開發者語言）
5. 展示生成的 changelog 條目

🛑 **STOP**: 展示條目後等待使用者確認更新 CHANGELOG.md

### 停止點

| 停止點 | 等待內容 |
|-----------|---------|
| Changelog 條目展示後 | 確認內容正確並寫入 |

### 錯誤處理

| 錯誤情況 | AI 動作 |
|-----------------|-----------|
| 無 git tag（首次 release） | 分析所有 commits |
| CHANGELOG.md 不存在 | 建立新檔案 |
| Commit message 格式不規範 | 盡力分類，標記 `[Manual Review]` |

## 參考

*   [Changelog Guide Skill](../changelog-guide/SKILL.md)
*   [Core Standard](../../core/changelog-standards.md)
