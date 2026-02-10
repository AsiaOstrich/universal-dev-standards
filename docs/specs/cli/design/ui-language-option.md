# UI Language Option Specification / UI 語言選項規格

**Feature ID**: CLI-LANG-001
**Version**: 1.0.0
**Last Updated**: 2026-01-19
**Status**: Implemented

## Overview / 概述

The `--ui-lang` global option allows users to specify the CLI interface language, overriding automatic detection and manifest settings.

`--ui-lang` 全域選項允許使用者指定 CLI 介面語言，覆蓋自動偵測和 manifest 設定。

## Syntax / 語法

```bash
uds [command] --ui-lang <lang>
```

## Parameters / 參數

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `lang` | string | No | `auto` | Language code: `en`, `zh-tw`, `zh-cn`, or `auto` |

## Supported Languages / 支援語言

| Code | Language | 語言 |
|------|----------|------|
| `en` | English | 英文 |
| `zh-tw` | Traditional Chinese | 繁體中文 |
| `zh-cn` | Simplified Chinese | 簡體中文 |
| `auto` | Auto-detect | 自動偵測 |

## Expected Behavior / 預期行為

### Scenario Table / 情境表

| Scenario | Input | Expected Language |
|----------|-------|-------------------|
| Explicit English | `uds config --ui-lang en` | English |
| Explicit Traditional Chinese | `uds config --ui-lang zh-tw` | 繁體中文 |
| Explicit Simplified Chinese | `uds config --ui-lang zh-cn` | 简体中文 |
| Auto-detect (LANG=en_US) | `uds config` | English |
| Auto-detect (LANG=zh_TW) | `uds config` | 繁體中文 |
| Auto-detect (LANG=zh_CN) | `uds config` | 简体中文 |

### Priority Order / 優先順序

Language is determined by the following priority (highest to lowest):

1. **Command line `--ui-lang` flag** - User's explicit choice
2. **Environment variables** (`LANG`, `LC_ALL`, `LC_MESSAGES`) - When `--ui-lang` is `auto`
3. **Project manifest `commit_language`** - Only when `--ui-lang` is not explicitly set

語言優先順序（由高到低）：

1. **命令列 `--ui-lang` 旗標** - 使用者明確選擇
2. **環境變數** (`LANG`, `LC_ALL`, `LC_MESSAGES`) - 當 `--ui-lang` 為 `auto` 時
3. **專案 manifest 的 `commit_language`** - 僅當未明確設定 `--ui-lang` 時

## Affected Commands / 影響範圍

All subcommands are affected:

- `uds list`
- `uds init`
- `uds configure` / `uds config`
- `uds check`
- `uds update`
- `uds skills`

## Implementation Details / 實作細節

### Files Involved / 相關檔案

| File | Purpose |
|------|---------|
| `cli/bin/uds.js` | Global option definition and preAction hook |
| `cli/src/i18n/messages.js` | Language state management functions |
| `cli/src/commands/configure.js` | Respects explicit language setting |

### Key Functions / 關鍵函數

```javascript
// cli/src/i18n/messages.js

// Set language without marking as explicit
setLanguage(lang)

// Set language AND mark as explicitly set by user
setLanguageExplicit(lang)

// Check if language was explicitly set via --ui-lang
isLanguageExplicitlySet()
```

### Flow Diagram / 流程圖

```
User runs: uds config --ui-lang en
                │
                ▼
      ┌─────────────────────┐
      │  preAction hook     │
      │  (uds.js)           │
      └─────────────────────┘
                │
                ▼
      ┌─────────────────────┐
      │  --ui-lang != auto? │
      └─────────────────────┘
           │           │
          Yes         No
           │           │
           ▼           ▼
    ┌───────────┐  ┌───────────┐
    │setLanguage│  │setLanguage│
    │ Explicit  │  │(detected) │
    └───────────┘  └───────────┘
           │           │
           ▼           ▼
      ┌─────────────────────┐
      │  configureCommand   │
      │  reads manifest     │
      └─────────────────────┘
                │
                ▼
      ┌─────────────────────┐
      │isLanguageExplicitly │
      │      Set()?         │
      └─────────────────────┘
           │           │
          Yes         No
           │           │
           ▼           ▼
    ┌───────────┐  ┌───────────┐
    │  Keep     │  │  Override │
    │  current  │  │  from     │
    │  language │  │  manifest │
    └───────────┘  └───────────┘
```

## Test Cases / 測試案例

### TC-001: Explicit English overrides manifest

```bash
# Setup: Project has commit_language: traditional-chinese
# Command:
uds config --ui-lang en
# Expected: CLI displays in English
```

### TC-002: Explicit zh-tw works

```bash
# Command:
uds list --ui-lang zh-tw
# Expected: CLI displays in Traditional Chinese
```

### TC-003: Auto-detect respects environment

```bash
# Setup: LANG=zh_TW.UTF-8
# Command:
uds list
# Expected: CLI displays in Traditional Chinese
```

### TC-004: Auto-detect falls back to manifest

```bash
# Setup: LANG=en_US.UTF-8, manifest has commit_language: traditional-chinese
# Command:
uds config
# Expected: CLI displays in Traditional Chinese (from manifest)
```

## Changelog / 變更記錄

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-19 | Initial specification with bug fix for explicit flag priority |

## References / 參考資料

- [CLI Architecture](../../../../cli/README.md)
- [i18n Module](../../../../cli/src/i18n/messages.js)
