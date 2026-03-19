---
source: ../../../../skills/commands/release.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
status: current
---

---
name: release
description: [UDS] Manage release process and changelogs.
argument-hint: "[start|finish|changelog] <version>"
---

# /release 命令

根据语义化版本管理发布流程和变更日志。

## 用法

```bash
/release [subcommand] [version]
```

### 子命令

| Subcommand | Description |
|------------|-------------|
| `start` | 启动发布分支/流程 |
| `finish` | 完成发布（标签、合并） |
| `changelog` | 生成或更新 CHANGELOG.md |
| `check` | 运行预发布检查 |

## Changelog 管理

```bash
/release changelog [version]
```

通过以下方式更新 `CHANGELOG.md`：
1.  将「Unreleased」变更移动到新的 `[version]` 区段。
2.  创建新的「Unreleased」区段。
3.  更新底部的比较链接。

## 范例

```bash
# 启动发布 v1.2.0
/release start 1.2.0

# 更新 v1.2.0 的 changelog
/release changelog 1.2.0

# 完成发布
/release finish 1.2.0
```

## 参考

*   [发布规范技能](../release-standards/SKILL.md)
*   [Changelog 指南](../changelog-guide/SKILL.md)
*   [核心规范](../../core/versioning.md)
