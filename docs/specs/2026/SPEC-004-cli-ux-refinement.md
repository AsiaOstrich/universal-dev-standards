# SPEC-004: CLI UX Refinement

> **Status**: Implemented
> **Author**: Architect Agent
> **Date**: 2026-01-30
> **Implemented**: 2026-01-30

## 1. Objective

Refine CLI prompts based on user feedback to improve clarity, localization, and visual consistency.

## 2. Changes

### 2.1 First Prompt (Display Language)
- **Change**: Remove bilingual text in the question itself.
- **Before**: `? Select display language / 選擇顯示語言:`
- **After**: `? Select display language:` (English only, as it's the fallback)
- **Implementation**: Updated all three locales in `messages.js`

### 2.2 AI Tools Prompt
- **Change**: Remove green color formatting from "Claude Code".
- **Reason**: Visual consistency.
- **Implementation**: Changed `chalk.green('Claude Code')` to `'Claude Code'` in `init.js:95`

### 2.3 Skills & Commands Location Prompts
- **Change**: Add explanatory text about Git version control.
- **Text**: "Tip: Commit .claude/skills/ to Git to share with your team" (Localized)
- **Implementation**: Added `gitSharingHint` to `skillsLocation` and `commandsInstallation` in all three locales

### 2.4 Standards Scope Prompt
- **Change**: Translate title "Standards Installation".
- **Change**: Add explanation about "Full" scope consuming more context.
- **Implementation**:
  - zh-tw: `標準安裝範圍:`
  - zh-cn: `标准安装范围:`
  - Added context window warning to `scope.full.explanations`

### 2.5 Adoption Level Prompt
- **Change**: Translate title "Adoption Level".
- **Decision**: Keep as List (not Checkbox) because levels are progressive (Level 2 includes Level 1).
- **Implementation**:
  - zh-tw: `採用等級:`
  - zh-cn: `采用等级:`

### 2.6 Standards Format Prompt
- **Change**: Translate title "Standards Format".
- **Decision**: Keep "Detailed" option for human-only reading scenarios.
- **Implementation**:
  - zh-tw: `標準格式:`
  - zh-cn: `标准格式:`

### 2.7 Other Titles Localization

| English | zh-tw | zh-cn |
|---------|-------|-------|
| Content Mode: | 內容模式: | 内容模式: |
| Git Workflow: | Git 工作流程: | Git 工作流: |
| Merge Strategy: | 合併策略: | 合并策略: |
| Test Coverage: | 測試覆蓋: | 测试覆盖: |

### 2.8 Checkbox Instructions
- **Status**: Already implemented (`instructions: false` in init.js)
- Custom translated hints shown via `t().checkboxHint`

### 2.9 Option Descriptions
- **Status**: Existing descriptions are adequate for current release

## 3. Files Modified

| File | Change Type |
|------|-------------|
| `cli/src/i18n/messages.js` | Updated titles, added `gitSharingHint`, added context window explanation |
| `cli/src/prompts/init.js` | Removed chalk.green from Claude Code, added gitSharingHint display |
| `cli/tests/unit/i18n/messages.test.js` | Updated test to expect translated title |

## 4. Verification

- ✅ All 1173 unit tests pass
- ✅ ESLint shows only pre-existing warnings (0 errors)
- ✅ `displayLanguage` question uses English only
- ✅ All titles translated in zh-tw and zh-cn
- ✅ gitSharingHint displayed before Skills/Commands installation prompts
