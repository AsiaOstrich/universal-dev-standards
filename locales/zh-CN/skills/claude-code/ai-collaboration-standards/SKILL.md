---
source: ../../../../../skills/claude-code/ai-collaboration-standards/SKILL.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-01-25
status: current
---

# AI 协作标准

> **语言**: [English](../../../../../skills/claude-code/ai-collaboration-standards/SKILL.md) | 简体中文

**版本**: 1.1.0
**最後更新**: 2026-01-25
**適用範圍**: Claude Code Skills

---

## 目的

此技能确保 AI 助理提供准确、基於证据的响应，避免产生幻覺。

## 快速參考

### 确定性标签

| 标签 | 使用时机 |
|-----|----------|
| `[Confirmed]` | 來自程序码/文件的直接证据 |
| `[Inferred]` | 基於证据的邏辑推論 |
| `[Assumption]` | 基於常見模式（需要验证） |
| `[Unknown]` | 信息不可用 |
| `[Need Confirmation]` | 需要使用者澄清 |

### 來源类型

| 來源类型 | 标签 | 可靠性 |
|-------------|-----|-------------|
| 项目程序码 | `[Source: Code]` | ⭐⭐⭐⭐⭐ 最高 |
| 项目文件 | `[Source: Docs]` | ⭐⭐⭐⭐ 高 |
| 外部文件 | `[Source: External]` | ⭐⭐⭐⭐ 高 |
| 网络搜尋 | `[Source: Search]` | ⭐⭐⭐ 中等 |
| AI 知識 | `[Source: Knowledge]` | ⭐⭐ 低 |
| 使用者提供 | `[Source: User]` | ⭐⭐⭐ 中等 |

### 核心規則

1. **僅基於证据**: 只分析已明确读取的内容
2. **引用來源**: 包含程序码參考的文件路徑和行号
3. **分类确定性**: 为所有陳述標记确定性等级
4. **永遠提供建议**: 在呈現选项时，包含建议选择及其理由

## 详细指南

完整标准請參阅：
- [防幻覺指南](./anti-hallucination.md)
- [确定性标签參考](./certainty-labels.md)

## 範例

### ✅ 正确响应

```
[Confirmed] src/auth/service.ts:45 - JWT 验证使用 'jsonwebtoken' 函式庫
[Inferred] 基於 src/repositories/ 中的储存庫模式，可能使用依賴注入
[Need Confirmation] 新功能是否应支援多租戶？
```

### ❌ 错误响应

```
系统使用 Redis 进行快取（程序码未审查）
UserService 应該有 authenticate() 方法（API 未验证）
```

### ✅ 正确选项呈現

```
有三个选项：
1. Redis 快取
2. 记忆体快取
3. 文件快取

**建议：选项 1 (Redis)**：鑑於项目已有 Redis 基礎设施
且需要跨实例快取共享，Redis 是最合適的选择。
```

### ❌ 错误选项呈現

```
有三个选项：
1. Redis 快取
2. 记忆体快取
3. 文件快取

請选择一个。
```

## 检查清单

在做出任何陳述之前：

- [ ] 來源已验证 - 我是否已读取实际文件/文件？
- [ ] 來源类型已標记 - 我是否指定了 `[Source: Code]`、`[Source: External]` 等？
- [ ] 參考已引用 - 我是否包含了文件路徑和行号？
- [ ] 确定性已分类 - 我是否標记为 `[Confirmed]`、`[Inferred]` 等？
- [ ] 無捏造 - 我是否避免了虛構 API、设置或需求？
- [ ] 包含建议 - 在呈現选项时，我是否包含了建议选择？

---

## 设置檢测

此技能支援项目特定的确定性标签语言设置。

### 檢测順序

1. 检查 `CONTRIBUTING.md` 中的「Certainty Tag Language」章节
2. 如果找到，使用指定的语言（English / 中文）
3. 如果未找到，**预设使用英文**标签

### 首次设置

如果未找到设置且情境不明确：

1. 詢問使用者：「此项目尚未设置确定性标签语言偏好。您想使用哪一种？（English / 中文）」
2. 使用者选择後，建议在 `CONTRIBUTING.md` 中记录：

```markdown
## Certainty Tag Language

This project uses **[English / 中文]** certainty tags.
<!-- Options: English | 中文 -->
```

### 设置範例

在项目的 `CONTRIBUTING.md` 中：

```markdown
## Certainty Tag Language

This project uses **English** certainty tags.

### Tag Reference
- [Confirmed] - Direct evidence from code/docs
- [Inferred] - Logical deduction from evidence
- [Assumption] - Based on common patterns
- [Unknown] - Information not available
- [Need Confirmation] - Requires user clarification
```

---

## 相关标准

- [防幻覺标准](../../core/anti-hallucination.md)
- [程序码审查检查清单](../../core/code-review-checklist.md)
- [测试标准](../../core/testing-standards.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 1.0.0 | 2025-12-24 | 新增：标准章节（目的、相关标准、版本历史、授权） |

---

## 授权

此技能依据 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 釋出。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
