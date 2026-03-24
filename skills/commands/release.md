---
name: release
description: [UDS] Manage release process and changelogs.
argument-hint: "[start|finish|changelog] <version>"
---

# /release Command | /release 命令

Manage the release workflow and changelogs according to Semantic Versioning.

根據語義化版本管理發布流程和變更日誌。

## Usage | 用法

```bash
/release [subcommand] [version]
```

### Subcommands | 子命令

| Subcommand | Description |
|------------|-------------|
| `start` | Start a release branch/process |
| `finish` | Finalize release (tag, merge) |
| `changelog` | Generate or update CHANGELOG.md |
| `check` | Run pre-release checks |

## Changelog Management

```bash
/release changelog [version]
```

Updates `CHANGELOG.md` by:
1.  Moving "Unreleased" changes to the new `[version]` section.
2.  Creating a new "Unreleased" section.
3.  Updating comparison links at the bottom.

## Examples | 範例

```bash
# Start release v1.2.0
/release start 1.2.0

# Update changelog for v1.2.0
/release changelog 1.2.0

# Finish release
/release finish 1.2.0
```

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/release` | 詢問版本號和發布類型（alpha/beta/rc/stable） |
| `/release start <version>` | 開始指定版本的發布流程 |
| `/release finish <version>` | 完成發布（tag、merge） |
| `/release changelog <version>` | 更新 CHANGELOG.md |
| `/release check` | 執行預發布檢查 |

### Interaction Script | 互動腳本

#### `/release start`
1. 確認版本號和類型
2. 執行預發布檢查（tests、lint、git status）

🛑 **STOP**: 預發布檢查結果展示後等待確認

3. 更新版本檔案

🛑 **STOP**: 版本檔案更新後展示變更，等待確認

4. 更新 CHANGELOG.md

🛑 **STOP**: CHANGELOG 更新後展示內容，等待確認

#### `/release finish`
1. 確認所有檢查通過
2. 建立 git tag

🛑 **STOP**: git tag 建立前等待確認

3. 展示 commit 和 push 命令

🛑 **STOP**: git push 前等待確認

#### `/release check`
1. 執行所有預發布檢查腳本
2. 展示結果摘要

### Stop Points | 停止點

| Stop Point | 等待內容 |
|-----------|---------|
| 版本檔案更新後 | 確認版本號正確 |
| git tag 建立前 | 確認要建立 tag |
| git push 前 | 確認要推送到遠端 |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| 預發布檢查失敗 | 列出失敗項目，阻止繼續 |
| 版本號格式不正確 | 提示正確格式（X.Y.Z 或 X.Y.Z-type.N） |
| 工作目錄不乾淨 | 建議先 commit 或 stash |

## References | 參考

*   [Release Standards Skill](../release-standards/SKILL.md)
*   [Changelog Guide](../changelog-guide/SKILL.md)
*   [Core Standard](../../core/versioning.md)