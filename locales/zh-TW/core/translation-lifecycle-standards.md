---
source: ../../../core/translation-lifecycle-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-20
status: current
---

# 翻譯生命週期標準

> **語言**: [English](../../../core/translation-lifecycle-standards.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-04-20
**狀態**: Trial（到期 2026-10-20）
**適用範圍**: 所有具備多語言文件的專案
**來源**: UDS BUG-A06 事後分析（2026-04-20）
**父標準**: [documentation-lifecycle](documentation-lifecycle.md)

---

## 目的

翻譯生命週期標準：MISSING 與 OUTDATED 的區別、Semver 嚴重度分級，以及自動化整合（pre-commit hook、release gate）。

`documentation-lifecycle` 標準提到翻譯同步是 release gate 的一環，但未定義如何分類或回應不同程度的漂移。本標準填補這個缺口：翻譯檔案不存在與略微過時有本質差異，major 版本落差與 patch 升版也有本質差異。若不作區分，團隊要麼過度阻塞（任何過時都 fail），要麼阻塞不足（忽略所有過時直到成為用戶可見的問題）。

**證據（BUG-A06 事後分析）**：
1. UDS 在 3 個月內新增 32 個標準時，因缺乏 MISSING gate，翻譯全部缺失，直到 Q2 audit 才發現。
2. `anti-hallucination.md` zh-CN 停在 1.5.0，來源已升至 1.5.1——新的 Agent 認識論校準框架段落在 zh-CN 版本中完全缺失，使用者看不到。

---

## 核心規範

- `MISSING`（翻譯檔案不存在）永遠是 release blocker — `exit 1`
- `MAJOR` 版本落差（來源 X > 翻譯 x，X > x）是 release blocker — `exit 1`
- `MINOR` 版本落差是 advisory — 醒目警告，不阻塞
- `PATCH` 版本落差是 advisory — 柔和警告，不阻塞
- 嚴重度由翻譯 frontmatter 的 `source_version` 與目前來源版本的 semver 比較決定
- 每個翻譯檔案必須有 YAML frontmatter，包含 `source`、`source_version`、`translation_version`、`last_synced`、`status`
- 來源標準被修改後，翻譯的 `source_version` 立即過時——這種漂移可在 commit 時透過 pre-commit hook 偵測

---

## 嚴重度分級

| 等級 | 條件 | Exit Code | 行動 |
|------|------|-----------|------|
| `MISSING` | 翻譯檔案不存在 | 1 | 發布前建立 |
| `MAJOR` | 來源 MAJOR > 翻譯 MAJOR | 1 | 正式版發布前更新 |
| `MINOR` | 來源 MINOR > 翻譯 MINOR（同 MAJOR）| 0 | 下次發布前更新（advisory）|
| `PATCH` | 來源 PATCH > 翻譯 PATCH（同 MAJOR.MINOR）| 0 | 方便時更新（advisory）|
| `CURRENT` | source_version == 目前來源版本 | 0 | 無需行動 |

### Semver 差異公式

```
diff_level = compare(
  strip_prerelease(current_source_version),
  strip_prerelease(translation.source_version)
)

其中：major 不同 → MAJOR，minor 不同 → MINOR，其他 → PATCH
```

---

## 觸發條件

| 事件 | 必要行動 |
|------|---------|
| 新增標準到 `core/` | 在所有支援的語言建立翻譯（MISSING check 阻塞發布）|
| 標準 PATCH 升版 | 方便時更新翻譯的 `source_version` + `last_synced` |
| 標準 MINOR 升版（含新段落）| 更新翻譯內容 + frontmatter，下次發布前完成 |
| 標準 MAJOR 升版（大改寫）| 更新翻譯內容 + frontmatter，當前發布前完成（阻塞）|
| 手動更新翻譯 | 升版 `translation_version` + `last_synced` |

---

## 翻譯 Frontmatter 協議

每個翻譯檔案必須以以下格式開頭：

```yaml
---
source: ../../../core/<filename>.md          # 指向來源的相對路徑
source_version: <X.Y.Z>                      # 最後同步時的來源版本
translation_version: <X.Y.Z>                 # 翻譯自身的版本
last_synced: <YYYY-MM-DD>                    # 最後同步日期
status: current | outdated | draft           # 人類可讀狀態
---
```

更新翻譯時：
1. 翻譯新增或修改的內容
2. 設定 `source_version` = 新的來源版本
3. 設定 `translation_version` = 與 `source_version` 相同（或獨立升版）
4. 設定 `last_synced` = 今天日期
5. 設定 `status: current`

---

## 自動化整合

### Pre-Commit Hook

當 `core/*.md` 檔案被暫存時，pre-commit hook 執行 `check-translation-sync.sh` 並顯示 OUTDATED 警告。Hook **永不阻塞** commit（在 commit 時阻塞過於擾人）——純提醒用途。

設定方式：`./scripts/install-hooks.sh`（clone 後執行一次）

### Release Gate（`check-translation-sync.sh`）

在 `npm publish` 前或作為 `pre-release-check.sh` 的一部分執行：

```bash
bash scripts/check-translation-sync.sh
# MISSING 或 MAJOR 落差 → exit 1
# 僅 MINOR/PATCH 落差 → exit 0（附 advisory 輸出）
```

### Version Bump 整合（`bump-version.sh`）

`bump-version.sh` 在更新版本檔案後自動執行 `check-translation-sync.sh`，在升版時即時顯示翻譯健康狀態快照——讓作者立即知道發布前需要更新什麼。

---

## 情境範例

**情境 1 — 標準 patch 升版（1.0.0 → 1.0.1）**
- 翻譯 `source_version: 1.0.0`，來源現在是 `1.0.1`
- 嚴重度：`PATCH` — advisory，exit 0
- 行動：下次方便時更新，不阻塞發布

**情境 2 — 標準 minor 升版含新段落（1.0.0 → 1.1.0）**
- 翻譯 `source_version: 1.0.0`，來源現在是 `1.1.0`
- 嚴重度：`MINOR` — advisory，exit 0
- 行動：下次發布前更新；zh-CN 使用者缺少新內容

**情境 3 — 標準 major 大改寫（1.x.x → 2.0.0）**
- 翻譯 `source_version: 1.5.0`，來源現在是 `2.0.0`
- 嚴重度：`MAJOR` — 阻塞，exit 1
- 行動：正式版發布前必須更新

**情境 4 — 新標準，無翻譯檔案**
- `locales/zh-TW/core/new-standard.md` 不存在
- 嚴重度：`MISSING` — 阻塞，exit 1
- 行動：發布前建立翻譯檔案

---

## 錯誤碼

| 代碼 | 說明 |
|------|------|
| `TRANS-001` | `MISSING_TRANSLATION` — 來源標準的翻譯檔案不存在 |
| `TRANS-002` | `MAJOR_VERSION_GAP` — 翻譯的 source_version 落後目前來源 MAJOR 版本 |
| `TRANS-003` | `MISSING_FRONTMATTER` — 翻譯檔案缺少必要的 YAML frontmatter |
| `TRANS-004` | `STALE_SOURCE_REF` — frontmatter 的 `source` 路徑指向不存在的檔案 |
