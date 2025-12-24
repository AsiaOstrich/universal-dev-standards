# Certainty Labels Reference
# 確定性標籤參考

**Version**: 1.0.0
**Last Updated**: 2025-12-24
**Applicability**: Claude Code Skills
**適用範圍**: Claude Code Skills

---

## Purpose | 目的

This document provides reference for certainty labels and source types used in AI responses.

本文件提供 AI 回應中使用的確定性標籤和來源類型的參考。

---

## Tag Mapping (English / 中文)

| English Tag | 中文標籤 | Use When |
|-------------|---------|----------|
| `[Confirmed]` | `[已確認]` | Direct evidence from code/docs |
| `[Inferred]` | `[推論]` | Logical deduction from evidence |
| `[Assumption]` | `[假設]` | Based on common patterns (needs verification) |
| `[Unknown]` | `[未知]` | Information not available |
| `[Need Confirmation]` | `[待確認]` | Requires user clarification |

---

## Source Types

| Source Type | Tag | Description | Reliability |
|-------------|-----|-------------|-------------|
| Project Code | `[Source: Code]` | Directly read from codebase | ⭐⭐⭐⭐⭐ Highest |
| Project Docs | `[Source: Docs]` | README, Wiki, inline comments | ⭐⭐⭐⭐ High |
| External Docs | `[Source: External]` | Official documentation with URL | ⭐⭐⭐⭐ High |
| Web Search | `[Source: Search]` | Search results (include date) | ⭐⭐⭐ Medium |
| AI Knowledge | `[Source: Knowledge]` | AI training data (needs verification) | ⭐⭐ Low |
| User Provided | `[Source: User]` | Information from user conversation | ⭐⭐⭐ Medium |

---

## Usage Examples

### In Technical Documents

```markdown
## System Architecture Analysis

`[Confirmed]` System uses ASP.NET Core 8.0 framework [Source: Code] Program.cs:1
`[Confirmed]` Database uses SQL Server [Source: Code] appsettings.json:12
`[Inferred]` Based on Repository Pattern usage, system likely adopts DDD architecture
`[Assumption]` Caching mechanism may use Redis (need to confirm config)
`[Need Confirmation]` Should multi-tenancy be supported?
```

### 技術文件中（中文）

```markdown
## 系統架構分析

`[已確認]` 系統使用 ASP.NET Core 8.0 框架 [Source: Code] Program.cs:1
`[已確認]` 資料庫採用 SQL Server [Source: Code] appsettings.json:12
`[推論]` 基於 Repository Pattern 的使用，系統可能採用 DDD 架構
`[假設]` 快取機制可能使用 Redis（需確認設定檔）
`[待確認]` 是否需要支援多租戶架構？
```

### In Code Review

```markdown
## Review Comments

`[Confirmed]` src/Services/AuthService.cs:45 - Password validation lacks brute force protection
`[Inferred]` Rate limiting may be needed here
`[Need Confirmation]` Are there other layers of protection already in place?
```

### 程式碼審查中（中文）

```markdown
## 審查意見

`[已確認]` src/Services/AuthService.cs:45 - 密碼驗證缺少防暴力破解機制
`[推論]` 此處可能需要加入 Rate Limiting
`[待確認]` 是否已有其他層級的防護措施？
```

---

## Best Practices

### 1. Consistency

- Use the same language tags throughout a document (all Chinese or all English)
- Team should specify preferred language in `CONTRIBUTING.md`

### 2. Source Citation

- Chinese tags still require source citations
- Format: `[已確認]` statement [Source: Code] file_path:line_number

### 3. Team Agreement

- Decide on Chinese or English tags at project start
- Document in `CONTRIBUTING.md` or `.standards/` directory

---

## Quick Decision Guide

```
Did you read the actual code/doc?
├── YES → [Confirmed] / [已確認]
└── NO
    ├── Can you deduce from available evidence?
    │   ├── YES → [Inferred] / [推論]
    │   └── NO
    │       ├── Is it a common pattern?
    │       │   ├── YES → [Assumption] / [假設]
    │       │   └── NO → [Unknown] / [未知]
    └── Does user need to clarify?
        └── YES → [Need Confirmation] / [待確認]
```

---

## Related Standards | 相關標準

- [Anti-Hallucination Guidelines](./anti-hallucination.md) - 防幻覺指南
- [Anti-Hallucination Standards](../../../core/anti-hallucination.md) - 防幻覺標準

---

## Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-24 | Added: Standard sections (Purpose, Related Standards, Version History, License) |

---

## License | 授權

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
