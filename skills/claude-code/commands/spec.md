---
description: Create or review specification documents for Spec-Driven Development
allowed-tools: Read, Write, Grep, Glob, Bash(git:*)
argument-hint: [spec name or feature | 規格名稱或功能]
---

# Spec-Driven Development Assistant | 規格驅動開發助手

Create, review, and manage specification documents for implementing features.

建立、審查和管理規格文件，用於實作功能。

## Workflow | 工作流程

1. **Create spec** - Write detailed specification document
2. **Review spec** - Validate against requirements
3. **Approve spec** - Get stakeholder sign-off
4. **Implement** - Code follows the approved spec
5. **Verify** - Ensure implementation matches spec

## Spec Document Structure | 規格文件結構

```markdown
# Feature: [Feature Name]

## Overview
Brief description of the feature.

## Requirements
- REQ-001: [Requirement description]
- REQ-002: [Requirement description]

## Technical Design
### Architecture
[Design details]

### API Changes
[API specifications]

### Database Changes
[Schema changes]

## Test Plan
- [ ] Unit tests for [component]
- [ ] Integration tests for [flow]

## Rollout Plan
[Deployment strategy]
```

## Spec States | 規格狀態

| State | Description | 說明 |
|-------|-------------|------|
| Draft | Work in progress | 草稿中 |
| Review | Under review | 審查中 |
| Approved | Ready for implementation | 已核准 |
| Implemented | Code complete | 已實作 |
| Archived | Completed or deprecated | 已歸檔 |

## Usage | 使用方式

- `/spec` - Interactive spec creation wizard
- `/spec auth-flow` - Create spec for specific feature
- `/spec review` - Review existing specs

## Reference | 參考

- Full standard: [spec-driven-dev](../../spec-driven-dev/SKILL.md)
