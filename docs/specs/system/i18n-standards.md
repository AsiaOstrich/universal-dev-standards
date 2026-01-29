# [SPEC-I18N-01] Internationalization Standards / 國際化規範

**Priority**: P1
**Status**: Draft
**Last Updated**: 2026-01-28
**Feature ID**: SYS-I18N-001
**Dependencies**: [SPEC-CASCADE-01 Cascading Config]

---

## Summary / 摘要

The Internationalization Standards define how UDS supports multiple languages for core standards, skills, CLI messages, and documentation. It establishes translation workflows, quality assurance processes, and contribution guidelines.

國際化規範定義 UDS 如何支援核心規範、技能、CLI 訊息和文件的多語言。它建立翻譯工作流程、品質保證流程和貢獻指南。

---

## Motivation / 動機

### Problem Statement / 問題陳述

1. **English-Only Standards**: Non-English speakers struggle with English-only documentation
2. **Inconsistent Translations**: Ad-hoc translations lack quality consistency
3. **Sync Drift**: Translations become out of sync with source
4. **Contribution Barriers**: No clear process for translation contributions

### Solution / 解決方案

A comprehensive i18n system that:
- Defines translation file structure and workflow
- Provides sync checking and validation tools
- Establishes quality standards for translations
- Enables community contributions

---

## User Stories / 使用者故事

### US-1: Native Language Standards

```
As a non-English speaking developer,
I want to read UDS standards in my native language,
So that I can fully understand and apply them.

作為非英語母語的開發者，
我想要用母語閱讀 UDS 規範，
讓我能完全理解並應用它們。
```

### US-2: Bilingual Display

```
As a team with mixed language preferences,
I want to see standards in both English and local language,
So that everyone can understand regardless of language skill.

作為有混合語言偏好的團隊，
我想要看到英文和本地語言的規範，
讓每個人無論語言技能都能理解。
```

### US-3: Translation Contribution

```
As a developer fluent in multiple languages,
I want to contribute translations to UDS,
So that I can help non-English speakers.

作為精通多語言的開發者，
我想要為 UDS 貢獻翻譯，
讓我能幫助非英語使用者。
```

---

## Acceptance Criteria / 驗收條件

### AC-1: Supported Languages

**Given** UDS i18n system
**When** language is configured
**Then** these languages are supported:

| Code | Language | Status |
|------|----------|--------|
| `en` | English | Source (always complete) |
| `zh-TW` | Traditional Chinese | Tier 1 (actively maintained) |
| `zh-CN` | Simplified Chinese | Tier 1 (actively maintained) |
| `ja` | Japanese | Tier 2 (community contributed) |
| `ko` | Korean | Tier 2 (community contributed) |
| `es` | Spanish | Tier 2 (community contributed) |

### AC-2: Translation File Structure

**Given** a core standard exists
**When** translations are organized
**Then** structure follows:

```
core/
├── commit-message-guide.md       # English source

locales/
├── zh-TW/
│   └── core/
│       └── commit-message-guide.md
├── zh-CN/
│   └── core/
│       └── commit-message-guide.md
└── ja/
    └── core/
        └── commit-message-guide.md
```

### AC-3: Sync Checking

**Given** I run `./scripts/check-translation-sync.sh zh-TW`
**When** translations are checked
**Then** report shows:

```
Translation Sync Report (zh-TW)

✓ core/commit-message-guide.md (synced)
✓ core/testing-standards.md (synced)
⚠ core/code-review-checklist.md (outdated: 3 days behind)
✗ core/new-standard.md (missing)

Summary: 20/23 synced, 2 outdated, 1 missing
```

### AC-4: CLI Language Setting

**Given** I configure language preference
**When** I run UDS commands
**Then** output is in preferred language

```bash
# Set global language
uds configure --global set language zh-TW

# Override for single command
uds list --lang en

# Use environment variable
LANG=zh-TW uds list
```

### AC-5: Bilingual Mode

**Given** I enable bilingual mode
**When** standards are displayed
**Then** both languages shown:

```bash
uds configure set bilingual true
```

```markdown
# Commit Message Guide
# 提交訊息指南

Follow the Conventional Commits specification.
遵循 Conventional Commits 規範。
```

### AC-6: Translation Quality Standards

**Given** a translation is submitted
**When** quality is evaluated
**Then** it meets these criteria:

| Criterion | Requirement |
|-----------|-------------|
| Completeness | All sections translated |
| Accuracy | Meaning preserved |
| Terminology | Consistent with glossary |
| Formatting | Markdown structure preserved |
| Technical Terms | Keep or annotate English terms |

---

## Technical Design / 技術設計

### Translation Metadata / 翻譯元資料

```yaml
# locales/zh-TW/core/commit-message-guide.md (frontmatter)
---
source: core/commit-message-guide.md
source-version: 2.1.0
translation-version: 2.1.0
translator: contributor@example.com
last-synced: 2026-01-28
---
```

### Sync Detection Logic / 同步偵測邏輯

```javascript
// scripts/check-translation-sync.js
function checkSync(sourcePath, translationPath) {
  const source = readFile(sourcePath);
  const translation = readFile(translationPath);

  const sourceMeta = extractFrontmatter(source);
  const translationMeta = extractFrontmatter(translation);

  if (sourceMeta.version !== translationMeta['source-version']) {
    return {
      status: 'outdated',
      sourceVersion: sourceMeta.version,
      translationVersion: translationMeta['source-version'],
    };
  }

  return { status: 'synced' };
}
```

### CLI Language Resolution / CLI 語言解析

```javascript
// Order of precedence:
// 1. --lang flag
// 2. Project config (.uds/config.yaml)
// 3. Global config (~/.udsrc)
// 4. Environment variable (LANG, LC_ALL)
// 5. Default (en)

function resolveLanguage(options) {
  return (
    options.lang ||
    getProjectConfig('language') ||
    getGlobalConfig('language') ||
    process.env.LANG?.split('.')[0] ||
    'en'
  );
}
```

### Glossary / 術語表

```yaml
# locales/glossary.yaml
terms:
  commit:
    en: commit
    zh-TW: 提交
    zh-CN: 提交

  standard:
    en: standard
    zh-TW: 規範
    zh-CN: 规范

  workflow:
    en: workflow
    zh-TW: 工作流程
    zh-CN: 工作流

  # Technical terms (keep English)
  TDD:
    en: TDD
    zh-TW: TDD (測試驅動開發)
    zh-CN: TDD (测试驱动开发)
```

### CLI Commands / CLI 命令

```bash
# Check translation sync
./scripts/check-translation-sync.sh zh-TW
./scripts/check-translation-sync.sh --all

# Generate translation template
uds i18n init zh-CN core/new-standard.md

# Validate translation
uds i18n validate locales/zh-TW/core/commit-guide.md

# Show glossary
uds i18n glossary
uds i18n glossary --term commit
```

---

## Translation Workflow / 翻譯工作流程

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Translation Workflow                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Source Update (English)                                                │
│        │                                                                │
│        ▼                                                                │
│   ┌────────────────────────────────────────────────────────┐           │
│   │ 1. CI detects source change                             │           │
│   │    • Runs check-translation-sync.sh                     │           │
│   │    • Creates issues for outdated translations           │           │
│   └────────────────────────────────────────────────────────┘           │
│        │                                                                │
│        ▼                                                                │
│   ┌────────────────────────────────────────────────────────┐           │
│   │ 2. Translator picks up issue                            │           │
│   │    • Reviews source changes                             │           │
│   │    • Updates translation                                │           │
│   │    • Updates metadata                                   │           │
│   └────────────────────────────────────────────────────────┘           │
│        │                                                                │
│        ▼                                                                │
│   ┌────────────────────────────────────────────────────────┐           │
│   │ 3. PR Review                                            │           │
│   │    • CI validates format                                │           │
│   │    • Native speaker reviews                             │           │
│   │    • Terminology consistency check                      │           │
│   └────────────────────────────────────────────────────────┘           │
│        │                                                                │
│        ▼                                                                │
│   Translation Merged                                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Risks / 風險

| Risk | Impact | Mitigation |
|------|--------|------------|
| Translation drift | Medium | Automated sync checks in CI |
| Poor quality translations | Medium | Review process, glossary |
| Volunteer burnout | Medium | Tier system, prioritize core docs |

---

## Out of Scope / 範圍外

- Machine translation integration
- Real-time translation API
- RTL language support (Arabic, Hebrew)
- Translation memory systems

---

## Sync Checklist

### Starting from System Spec
- [ ] Update sync check scripts for new format
- [ ] Create i18n CLI subcommand
- [ ] Define glossary structure
- [ ] Update contribution guidelines
- [ ] Create translation PR template

---

## References / 參考資料

- [Vue i18n](https://vue-i18n.intlify.dev/)
- [React-Intl](https://formatjs.io/docs/react-intl/)
- [GNU gettext](https://www.gnu.org/software/gettext/)

---

## Version History / 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-28 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
