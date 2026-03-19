---
source: ../../../../skills/commands/release.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
name: release
description: [UDS] Manage release process and changelogs.
argument-hint: "[start|finish|changelog] <version>"
---

# /release 命令

> **Language**: [English](../../../../skills/commands/release.md) | 繁體中文

根據語義化版本管理發布流程和變更日誌。

## 用法

```bash
/release [subcommand] [version]
```

### 子命令

| 子命令 | 說明 |
|--------|------|
| `start` | 開始一個發布分支/流程 |
| `finish` | 完成發布（標籤、合併） |
| `changelog` | 產生或更新 CHANGELOG.md |
| `check` | 執行預發布檢查 |

## 變更日誌管理

```bash
/release changelog [version]
```

更新 `CHANGELOG.md`，流程如下：
1.  將「Unreleased」中的變更移到新的 `[version]` 區段。
2.  建立新的「Unreleased」區段。
3.  更新底部的比較連結。

## 範例

```bash
# 開始發布 v1.2.0
/release start 1.2.0

# 更新 v1.2.0 的變更日誌
/release changelog 1.2.0

# 完成發布
/release finish 1.2.0
```

## 參考

*   [發布標準技能](../release-standards/SKILL.md)
*   [變更日誌指南](../changelog-guide/SKILL.md)
*   [核心規範](../../core/versioning.md)
