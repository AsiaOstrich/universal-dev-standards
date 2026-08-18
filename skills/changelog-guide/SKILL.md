---
name: changelog
scope: partial
description: |
  [UDS] Generate and maintain CHANGELOG.md entries in Keep a Changelog format.
  Use when: writing changelog entries from commit history, filling the Unreleased section, categorising changes as Added/Changed/Fixed.
  Not for: choosing the next version number or running the release — use /release; writing the commit messages themselves — use /commit.
  Keywords: changelog, CHANGELOG.md, Keep a Changelog, release notes, unreleased, 變更日誌, 發布說明, 版本紀錄.
allowed-tools: Read, Write, Grep, Bash(git log:*)
status: stable
# 2026-08-18: `disable-model-invocation: true` removed, and a status recorded.
#
# The flag was applied by d415937e alongside the description rewrite and, like
# the two lifted on 2026-08-17, followed no stateable rule. These eight were
# left alone that day for a reason that was correct at the time: the rule
# settled on was "a reference is model-invocable", and none of them carried a
# `status` at all, so lifting them would have replaced one unruled state with
# one unruled action.
#
# Measured 2026-08-18, which is what closed it: all eight carry a full
# `Use when:` trigger and a `Not for:` exclusion, all eight describe an action
# rather than reference material, and all eight already have a slash command —
# which is exactly the shape of `code-review-assistant`, whose paired `/code-review`
# was ruled not to justify the flag. `journey-test-assistant` is the standing
# precedent: same "Generate X" shape, `status: stable`, never disabled.
#
# `stable` rather than a new value: `skills/` uses reference, stable and
# experimental, and inventing a fourth would be the same unruled-action mistake
# in different clothing.
#
# The cost of being wrong is asymmetric and observable in only one direction.
# Over-triggering shows up and is undone by deleting a line; a skill that is
# structurally unable to fire produces no signal at all. (XSPEC-378 R5)
---

# Changelog Assistant | 變更日誌助手

Generate and maintain CHANGELOG.md entries following the Keep a Changelog format.

根據 Keep a Changelog 格式產生和維護 CHANGELOG.md 條目。

## Workflow | 工作流程

1. **Analyze git log** - Read commit history since last release using `git log`
2. **Categorize changes** - Map commits to changelog categories
3. **Generate entries** - Write user-friendly descriptions for each change
4. **Update CHANGELOG.md** - Insert entries into the [Unreleased] or versioned section

## Change Categories | 變更分類

| Category | When to Use | 使用時機 | Commit Types |
|----------|-------------|---------|-------------|
| **Added** | New features | 新功能 | `feat` |
| **Changed** | Modifications to existing features | 修改既有功能 | `perf`, `BREAKING CHANGE` |
| **Deprecated** | Features to be removed | 即將移除的功能 | -- |
| **Removed** | Removed features | 已移除的功能 | `BREAKING CHANGE` |
| **Fixed** | Bug fixes | 錯誤修復 | `fix` |
| **Security** | Security patches | 安全性修補 | `security` |

## Entry Format | 條目格式

```markdown
## [Unreleased]

### Added
- Add user dashboard with customizable widgets (#123)

### Changed
- **BREAKING**: Change API response format from XML to JSON (#789)

### Fixed
- Fix memory leak when processing large files (#456)

### Security
- Fix SQL injection vulnerability in search endpoint (CVE-2025-12345)
```

### Writing Guidelines | 撰寫指南

- Write for **users**, not developers | 為使用者而非開發者撰寫
- Focus on **impact**, not implementation | 聚焦影響而非實作
- Include issue/PR references | 附上 issue/PR 編號
- Mark breaking changes with **BREAKING** prefix | 用 **BREAKING** 標記破壞性變更

## Usage | 使用方式

- `/changelog` - Analyze recent commits and generate changelog entries
- Also available via `/release changelog [version]`

## Next Steps Guidance | 下一步引導

After `/changelog` completes, the AI assistant should suggest:

> **變更日誌已更新。建議下一步 / Changelog updated. Suggested next steps:**
> - 執行 `/release` 開始發布流程 ⭐ **Recommended / 推薦** — Start release process
> - 執行 `/commit` 提交日誌變更 — Commit changelog changes
> - 審查日誌條目確保使用者導向語言 — Review entries for user-facing language

## Reference | 參考

- Detailed guide: [guide.md](./guide.md)
- Core standard: [changelog-standards.md](../../core/changelog-standards.md)
