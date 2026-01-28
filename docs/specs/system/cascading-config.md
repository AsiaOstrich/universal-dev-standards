# [SPEC-CASCADE-01] Cascading Configuration System / 層疊式配置系統

**Priority**: P1
**Status**: Draft
**Last Updated**: 2026-01-28
**Feature ID**: SYS-CONFIG-001
**Dependencies**: None

---

## Summary / 摘要

The Cascading Configuration System provides a hierarchical way to manage UDS settings. It merges configurations from global user preferences, organization-wide standards, and project-specific overrides, ensuring flexibility for developers while maintaining compliance for enterprises.

層疊式配置系統提供了一種分層管理 UDS 設定的方法。它合併了全域使用者偏好、組織級標準和專案特定覆蓋的配置，在確保企業合規性的同時，為開發者提供靈活性。

---

## Motivation / 動機

### Problem Statement / 問題陳述

1.  **Conflict of Interest**: Developers want personalized tools (e.g., UI language), but enterprises need enforced standards (e.g., security checks).
2.  **Repetition**: Setting up the same rules for every new project is tedious.
3.  **Inconsistency**: Without a central source of truth, different projects drift apart in standards.

### Solution / 解決方案

A 4-layer configuration merge strategy (Priority Low to High):
1.  **Default** (Built-in)
2.  **Global** (`~/.udsrc`)
3.  **Organization** (Remote/Shared)
4.  **Project** (`.uds/config.yaml`)
5.  **Environment/CLI** (Runtime flags)

---

## User Stories / 使用者故事

### US-1: Personalization

```
As a developer in Taiwan,
I want to set "ui_lang: zh-TW" globally once,
So that all my UDS projects interact with me in Traditional Chinese.

作為台灣的開發者，
我想要全域設定一次 "ui_lang: zh-TW"，
這樣我所有的 UDS 專案都用繁體中文與我互動。
```

### US-2: Enterprise Compliance

```
As a CTO,
I want to enforce "hitl.threshold: 3" for all company projects,
So that no AI agent can delete production databases without approval.

作為技術長，
我想要強制所有公司專案設定 "hitl.threshold: 3"，
這樣沒有 AI 代理可以在未經批准的情況下刪除生產資料庫。
```

### US-3: Project Specifics

```
As a team lead for a legacy project,
I want to relax "test.coverage" requirements for this specific repo,
So that we can maintain it without being blocked by strict rules valid for new projects.

作為遺留專案的團隊負責人，
我想要放寬此特定儲存庫的 "test.coverage" 要求，
這樣我們可以維護它，而不會被適用於新專案的嚴格規則阻擋。
```

---

## Acceptance Criteria / 驗收條件

### AC-1: Merge Logic

**Given** configurations exist at multiple levels
**When** UDS initializes
**Then** settings are merged with the following precedence (highest wins):
1.  **CLI Flags** (`--ui-lang=en`)
2.  **Environment Variables** (`UDS_UI_LANG=en`)
3.  **Project Config** (`./.uds/config.yaml`)
4.  **Organization Config** (Defined in Project Config `extends: url`)
5.  **Global Config** (`~/.udsrc`)
6.  **Built-in Defaults**

### AC-2: Array Handling

**Given** a configuration key is an array (e.g., `ignore_patterns`)
**When** configs are merged
**Then** arrays are **replaced** by default, NOT concatenated, unless a specific merge strategy (`$append`) is used.

*Example*:
- Global: `ignore: [node_modules]`
- Project: `ignore: [dist]`
- Result: `ignore: [dist]` (Project wins)

### AC-3: Profile Support

**Given** I work on different types of projects (Personal vs Work)
**When** I run `uds init --profile work`
**Then** it loads the specific configuration profile defined in Global Config.

### AC-4: Schema Validation

**Given** a config file is loaded
**When** it contains invalid keys or types
**Then** UDS reports a warning but ignores the invalid key (fail-safe).

---

## Technical Design / 技術設計

### Configuration File Format (YAML)

```yaml
# .uds/config.yaml

# Base configuration
version: 1.0
extends: "https://config.mycompany.com/uds-standards.yaml"  # Org config

# Core settings
ui:
  language: zh-TW
  emoji: true

# Module settings
hitl:
  threshold: 2
  overrides:
    - pattern: "tests/**"
      threshold: 0

vibe-coding:
  enabled: true
  auto-sweep: false  # Project override

# Advanced: Merge strategy
ignore_patterns:
  $append:
    - ".tmp/"
```

### Architecture Diagram

```
┌─────────────────┐
│  Built-in Defs  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌───────────────────┐
│  Global Config  │ <─── │  ~/.udsrc (User)  │
└────────┬────────┘      └───────────────────┘
         │
         ▼
┌─────────────────┐      ┌───────────────────────────────┐
│   Org Config    │ <─── │ HTTP/Git (Central Governance) │
└────────┬────────┘      └───────────────────────────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────────┐
│ Project Config  │ <─── │ .uds/config.yaml     │
└────────┬────────┘      └──────────────────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────────┐
│ Runtime Config  │ <─── │ ENV VARS & CLI Flags │
└─────────────────┘      └──────────────────────┘
         │
         ▼
    Final Config Object
```

### CLI Commands

```bash
# View final merged config
uds config view

# Get specific value
uds config get hitl.threshold

# Set global preference
uds config set ui.language zh-TW --global

# Set project config
uds config set vibe-coding.enabled true
```

### File Structure

```
cli/src/
├── config/
│   ├── loader.js        # Loads files from disk/net
│   ├── merger.js        # Deep merge logic
│   ├── schema.js        # Zod/Joi validation schema
│   └── defaults.js      # Built-in values
```

---

## Integration Points / 整合點

### With HITL
- HITL module queries `config.get('hitl.threshold')`.
- Organization config can enforce a minimum HITL level that projects cannot lower (requires "Protected Keys" feature in future).

### With Vibe Coding
- Vibe module queries `config.get('vibe-coding.enabled')`.

### With I18n
- I18n module initializes based on `config.get('ui.language')`.

---

## Risks / 風險

| Risk | Impact | Mitigation |
|------|--------|------------|
| Network latency (Org config) | Slow startup | Cache remote config locally with 24h expiry |
| Merge confusion | User unexpected behavior | `uds config view --trace` to show origin of values |
| Circular `extends` | Crash | Max recursion depth check (limit 3) |

---

## Version History / 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-28 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).