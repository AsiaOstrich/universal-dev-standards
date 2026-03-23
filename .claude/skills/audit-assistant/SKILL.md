---
source: ../../../../skills/audit-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-04
status: current
description: "[UDS] UDS 健康檢查與回饋系統，診斷安裝完整性與偵測開發模式"
name: audit
allowed-tools: Read, Grep, Glob, Bash(git log, uds audit)
scope: universal
argument-hint: "[--health | --patterns | --friction | --report]"
disable-model-invocation: true
---

# 審計助手

> **語言**: [English](../../../../skills/audit-assistant/SKILL.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-03-04

診斷 UDS 安裝健康狀態、偵測值得規範化的開發模式、識別與現有標準的摩擦點，並向 UDS 儲存庫提交結構化回饋。

## 工作流程

```
DIAGNOSE ──► ANALYZE ──► REPORT
診斷健康      分析模式      回報回饋
```

### 階段 1：DIAGNOSE | 診斷

執行 UDS 安裝健康檢查。

| 檢查項目 | 說明 |
|---------|------|
| `.standards/` 存在 | 驗證目錄與檔案 |
| `manifest.json` 有效 | 解析驗證 manifest |
| 檔案完整性 | 比對雜湊與 manifest |
| AI 設定引用 | 驗證 AI 設定檔引用 `.standards/` |

### 階段 2：ANALYZE | 分析

偵測模式與摩擦點。

| 分析方法 | 說明 |
|---------|------|
| 目錄模式 | 掃描已知標準類別 |
| Commit 模式 | 分析近 100 筆 commit 的重複主題 |
| 已修改標準 | 比對檔案雜湊（差異比對式）|
| 未使用標準 | 檢查 AI 設定引用 |
| 孤立檔案 | 找出 `.standards/` 中未追蹤的檔案 |

### 階段 3：REPORT | 回報

將發現以結構化 GitHub issue 提交。

| 方法 | 條件 |
|------|------|
| `gh issue create` | gh CLI 已安裝 |
| 瀏覽器連結 | 退回至預填 URL |
| 剪貼簿複製 | 最終手段 |

## 使用方式

```bash
# 完整審計（所有層級）
uds audit

# 僅健康檢查
uds audit --health

# 僅模式偵測
uds audit --patterns

# 僅摩擦偵測
uds audit --friction

# JSON 輸出
uds audit --format json

# 僅摘要（適用於腳本）
uds audit --quiet

# 互動式提交回饋
uds audit --report

# 預覽報告不提交
uds audit --report --dry-run
```

## 與其他技能的整合

當被其他技能（如 `/checkin`、`/commit`、`/review`、`/sdd`）建議時，`/audit` 可根據情境執行針對性的檢查：

| 情境 | 建議指令 |
|------|---------|
| `/checkin` 失敗後診斷 | `/audit --health` |
| `/commit` 後回報發現 | `/audit --report` |
| `/review` 發現摩擦時 | `/audit --friction` |
| `/sdd` 規格建立後檢查覆蓋率 | `/audit --patterns` |

## 後續步驟

| 發現 | 建議動作 |
|------|---------|
| 健康 ERROR | 執行 `uds init` 或 `uds check --restore` |
| 偵測到模式 | 考慮透過 `--report` 請求新標準 |
| 已修改標準 | 檢視標準是否需要更多彈性 |
| 未使用標準 | 考慮以 `uds uninstall` 移除 |

## 相關規範

- [checkin-standards](../../../../core/checkin-standards.md) — 程式碼提交規範
- [testing-standards](../../../../core/testing-standards.md) — 測試規範

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-03-04 | 初版 — 三層審計系統 |

## 授權

CC BY 4.0 — 詳見 [LICENSE](../../../../LICENSE)。
