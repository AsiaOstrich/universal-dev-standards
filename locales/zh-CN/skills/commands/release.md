---
source: ../../../../skills/commands/release.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: d77b132dc55c
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

## AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### 进入路由

| 输入 | 模式 | AI 动作 |
|------|------|---------|
| `/release` | All | 读取 release mode，根据模式引导对应流程 |
| `/release start <version>` | All | 开始指定版本的发布流程 |
| `/release finish <version>` | CI/CD | 完成发布（tag、merge） |
| `/release promote <version>` | Manual/Hybrid | RC → Stable 晋升 |
| `/release deploy <env>` | Manual/Hybrid | 记录部署记录 |
| `/release manifest` | Manual/Hybrid | 生成 build-manifest.json |
| `/release verify` | Manual/Hybrid | 验证 manifest 一致性 |
| `/release changelog <version>` | All | 更新 CHANGELOG.md |
| `/release check` | All | 运行预发布检查 |

### 交互脚本

#### `/release start`
1. 确认版本号和类型
2. 运行预发布检查（tests、lint、git status）

🛑 **STOP**: 预发布检查结果展示后等待确认

3. 更新版本文件

🛑 **STOP**: 版本文件更新后展示变更，等待确认

4. 更新 CHANGELOG.md

🛑 **STOP**: CHANGELOG 更新后展示内容，等待确认

#### `/release finish`
1. 确认所有检查通过
2. 创建 git tag

🛑 **STOP**: git tag 创建前等待确认

3. 展示 commit 和 push 命令

🛑 **STOP**: git push 前等待确认

#### `/release promote`（仅 Manual/Hybrid）
1. 确认当前 RC 版本和目标 stable 版本
2. 验证同一 commit

🛑 **STOP**: 展示晋升计划，等待确认

3. 更新版本文件为 stable
4. 创建 Git tag
5. 记录 promoted_from

#### `/release deploy`（仅 Manual/Hybrid）
1. 记录部署记录到 deployments.yaml
2. 若部署到 production 且 staging 未通过，显示警告

🛑 **STOP**: production 部署警告时等待确认

#### `/release check`
1. 运行所有预发布检查脚本
2. 展示结果摘要

### 停止点

| 停止点 | 等待内容 |
|--------|---------|
| 版本文件更新后 | 确认版本号正确 |
| git tag 创建前 | 确认要创建 tag |
| git push 前 | 确认要推送到远端 |

### 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| 预发布检查失败 | 列出失败项目，阻止继续 |
| 版本号格式不正确 | 提示正确格式（X.Y.Z 或 X.Y.Z-type.N） |
| 工作目录不干净 | 建议先 commit 或 stash |

## 参考

*   [发布规范技能](../release-standards/SKILL.md)
*   [Changelog 指南](../changelog-guide/SKILL.md)
*   [核心规范](../../core/versioning.md)
