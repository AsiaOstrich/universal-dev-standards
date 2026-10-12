---
source: ../../../../skills/commands/release.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-12
source_hash: d77b132dc55c
---

---
name: release
description: [UDS] 管理發布流程與變更日誌。
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

## AI 代理行為

> 遵循 [AI 命令行為標準](../../core/ai-command-behavior.md)

### 進入路由

| 輸入 | 模式 | AI 動作 |
|------|------|---------|
| `/release` | All | 讀取 release mode，根據模式引導對應流程 |
| `/release start <version>` | All | 開始指定版本的發布流程 |
| `/release finish <version>` | CI/CD | 完成發布（tag、merge） |
| `/release promote <version>` | Manual/Hybrid | RC → Stable 晉升 |
| `/release deploy <env>` | Manual/Hybrid | 記錄部署紀錄 |
| `/release manifest` | Manual/Hybrid | 產生 build-manifest.json |
| `/release verify` | Manual/Hybrid | 驗證 manifest 一致性 |
| `/release changelog <version>` | All | 更新 CHANGELOG.md |
| `/release check` | All | 執行預發布檢查 |

### 互動腳本

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

#### `/release promote`（僅限 Manual/Hybrid）
1. 確認目前 RC 版本和目標 stable 版本
2. 驗證同一 commit

🛑 **STOP**: 展示晉升計畫，等待確認

3. 更新版本檔案為 stable
4. 建立 Git tag
5. 記錄 promoted_from

#### `/release deploy`（僅限 Manual/Hybrid）
1. 記錄部署紀錄到 deployments.yaml
2. 若部署到 production 且 staging 未通過，顯示警告

🛑 **STOP**: production 部署警告時等待確認

#### `/release check`
1. 執行所有預發布檢查腳本
2. 展示結果摘要

### 停止點

| 停止點 | 等待內容 |
|--------|---------|
| 版本檔案更新後 | 確認版本號正確 |
| git tag 建立前 | 確認要建立 tag |
| git push 前 | 確認要推送到遠端 |

### 錯誤處理

| 錯誤條件 | AI 動作 |
|----------|---------|
| 預發布檢查失敗 | 列出失敗項目，阻止繼續 |
| 版本號格式不正確 | 提示正確格式（X.Y.Z 或 X.Y.Z-type.N） |
| 工作目錄不乾淨 | 建議先 commit 或 stash |

## 參考

*   [發布標準技能](../release-standards/SKILL.md)
*   [變更日誌指南](../changelog-guide/SKILL.md)
*   [核心規範](../../core/versioning.md)
