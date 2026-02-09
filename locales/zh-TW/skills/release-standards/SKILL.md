---
source: ../../../../skills/release-standards/SKILL.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-02-10
status: current
description: |
  引導遵循語義化版本和變更日誌最佳實踐的發布流程。
  使用時機：版本發布、版本管理、變更日誌更新。
  關鍵字：release, version, semver, changelog, 發布, 版本, 語義化。
---

# 發布助手

> **語言**: [English](../../../../skills/release-standards/SKILL.md) | 繁體中文

引導遵循語義化版本和變更日誌最佳實踐的發布流程。

## 子命令

| 子命令 | 說明 | Description |
|--------|------|-------------|
| `start` | 開始發布流程 | Start a release branch/process |
| `finish` | 完成發布（標籤、合併） | Finalize release (tag, merge) |
| `changelog` | 產生或更新變更日誌 | Generate or update CHANGELOG.md |
| `check` | 執行發布前檢查 | Run pre-release verification |

## 版本類型

| 類型 | 格式 | npm Tag | 用途 |
|------|------|---------|------|
| 正式版 | `X.Y.Z` | `@latest` | Stable |
| 公開測試 | `X.Y.Z-beta.N` | `@beta` | Beta |
| 內部測試 | `X.Y.Z-alpha.N` | `@alpha` | Alpha |
| 候選版本 | `X.Y.Z-rc.N` | `@rc` | RC |

## 工作流程

1. **決定版本** - 根據變更決定版本類型（MAJOR/MINOR/PATCH）
2. **更新版本檔案** - 更新 package.json 和相關版本參考
3. **更新 CHANGELOG** - 將 [Unreleased] 條目移至新版本區段
4. **執行發布前檢查** - 驗證測試、lint 和標準合規
5. **建立 git tag** - 使用 `vX.Y.Z` 格式標籤
6. **提交並推送** - 提交版本更新並推送標籤

### 版本遞增規則

| 變更類型 | 遞增 | 範例 |
|---------|------|------|
| 破壞性變更 | MAJOR | 1.9.5 → 2.0.0 |
| 新功能（向下相容） | MINOR | 2.3.5 → 2.4.0 |
| 錯誤修復（向下相容） | PATCH | 3.1.2 → 3.1.3 |

## 使用方式

- `/release start 1.2.0` - 開始 v1.2.0 的發布流程
- `/release changelog 1.2.0` - 更新 v1.2.0 的 CHANGELOG
- `/release finish 1.2.0` - 完成並標籤 v1.2.0
- `/release check` - 執行發布前驗證

## 參考

- 詳細指南：[guide.md](./guide.md)
- 核心規範：[versioning.md](../../../../core/versioning.md)
