---
description: |
  在新增功能前评估项目健康度、架构与风险。
  使用时机：接手旧项目、在现有代码上新增功能、评估技术债。
  关键字：discovery, assessment, audit, legacy, health check, technical debt, 现况评估, 风险分析, 技术债, 项目盘点。
source: ../../../../skills/project-discovery/guide.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: bd8ecb9edb1f
status: current
---

# 项目现况评估指南

> **语言**: [English](../../../../skills/project-discovery/guide.md) | [繁體中文](../../../zh-TW/skills/project-discovery/guide.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-02-09
**适用范围**: 所有 AI 编码助手

> **工具型技能**：此技能组合既有的 UDS 核心规范，构建结构化的现况评估流程。无需专属的核心规范。

---

## 目的

在向现有代码库添加新功能之前，你需要清楚了解其当前状态。Phase 0 —— 现况评估 —— 提供对代码健康度、架构、文档、依赖和风险的系统化评估，以便你能胸有成竹地规划变更。

此技能引导你完成 6 个评估步骤，每个步骤均引用既有的 UDS 规范以获取方法论和质量闸门。

## 快速参考

### Phase 0 现况评估工作流程

```
┌─────────────────────────────────────────────────────────────────┐
│                  Phase 0: Project Discovery                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  0.1  Code Health Check                                         │
│       └─ Test coverage, lint issues, code smells                │
│                                                                  │
│  0.2  Architecture Understanding                                │
│       └─ Entry points, module map, patterns                     │
│                                                                  │
│  0.3  Documentation Inventory                                   │
│       └─ READMEs, ADRs, changelogs, inline docs                │
│                                                                  │
│  0.4  Code Review Snapshot                                      │
│       └─ Sample audit of critical paths                         │
│                                                                  │
│  0.5  Dependency & Security Check                               │
│       └─ Outdated packages, known vulnerabilities               │
│                                                                  │
│  0.6  Impact Scope Analysis                                     │
│       └─ Change propagation, risk matrix                        │
│                                                                  │
│  ──────────────────────────────────────────────────────────────  │
│  Output: Discovery Report (go / no-go / conditional)            │
│  Next:  /reverse → /sdd → implement                            │
└─────────────────────────────────────────────────────────────────┘
```

### 步骤总览

| 步骤 | 重点 | 关键产出 | 引用的 UDS 规范 |
|------|-------|------------|------------------------|
| 0.1 | 代码健康度 | 测试覆盖率 %、lint 分数、代码异味计数 | 测试、反向工程 |
| 0.2 | 架构 | 模块依赖图、模式识别 | AI 友善架构、反向工程 |
| 0.3 | 文档 | 文档覆盖矩阵、陈旧指标 | 文档结构、变更日志 |
| 0.4 | 代码审查 | 关键路径审计、质量快照 | 反幻觉、代码审查清单 |
| 0.5 | 依赖 | 漏洞报告、过时包列表 | 安全、签入规范 |
| 0.6 | 影响范围 | 风险矩阵、变更传播图 | 需求工程 |

## 工作流程步骤

### 步骤 0.1：代码健康度检查

**目标**：建立代码质量的基准度量。

**操作**：
1. 运行现有测试套件并记录通过率和覆盖率
2. 运行 linter 并统计警告/错误数
3. 识别代码异味（过长函数、深层嵌套、重复逻辑）
4. 检查死代码和未使用的导出

**输出格式**：
```markdown
## Code Health Summary

| Metric | Value | Status |
|--------|-------|--------|
| Test pass rate | 85/100 (85%) | ⚠️ Below target |
| Test coverage | 42% | ❌ Low |
| Lint errors | 23 | ⚠️ Needs attention |
| Code smells | 7 major | ⚠️ Needs attention |
```

**质量闸门**：若测试通过率 < 70%，在继续之前标记为高风险。

**引用规范**：
- [测试标准](../../core/testing-standards.md)
- [反向工程标准](../../core/reverse-engineering-standards.md)

### 步骤 0.2：架构理解

**目标**：绘制系统结构并识别架构模式。

**操作**：
1. 识别入口点（主文件、API 路由、事件处理器）
2. 绘制模块/包依赖关系
3. 识别架构模式（MVC、DDD、微服务、单体等）
4. 记录任何反模式（循环依赖、上帝模块）
5. 评估 AI 友好度（清晰边界、可发现结构）

**输出格式**：
```markdown
## Architecture Overview

**Pattern**: [Confirmed] MVC with service layer
**Entry Points**: src/index.ts, src/api/routes.ts
**Module Count**: 24 modules across 6 packages

### Dependency Map (simplified)
routes → controllers → services → repositories → database

### Concerns
- [Confirmed] Circular dependency between UserService ↔ AuthService
- [Inferred] Tight coupling in payment module
```

**质量闸门**：若不存在清晰的模块边界，建议在功能开发前进行架构重构。

**引用规范**：
- [AI 友善架构](../../core/ai-friendly-architecture.md)
- [反向工程标准](../../core/reverse-engineering-standards.md)

### 步骤 0.3：文档盘点

**目标**：评估文档完整性和新鲜度。

**操作**：
1. 检查 README、CONTRIBUTING、CHANGELOG
2. 扫描架构决策记录（ADR）
3. 评估内嵌文档（JSDoc、docstring、注释）
4. 检查文档是否与当前代码状态一致

**输出格式**：
```markdown
## Documentation Inventory

| Document | Exists | Last Updated | Current |
|----------|--------|-------------|---------|
| README.md | ✅ | 2025-06-15 | ⚠️ Stale |
| CHANGELOG.md | ❌ | — | — |
| API docs | ✅ | 2025-09-01 | ✅ Current |
| ADRs | ❌ | — | — |
| Inline docs | ⚠️ Partial | — | — |
```

**质量闸门**：若 README 缺失或严重过期，建议将文档更新作为先决条件。

**引用规范**：
- [文档结构](../../core/documentation-structure.md)
- [变更日志标准](../../core/changelog-standards.md)

### 步骤 0.4：代码审查快照

**目标**：对关键代码路径进行抽样审查，评估质量和正确性。

**操作**：
1. 识别 3-5 条最关键的代码路径（认证、支付、数据访问等）
2. 使用代码审查清单逐一检视每条路径
3. 应用反幻觉标签——只报告你实际阅读过的内容
4. 记录任何安全疑虑或错误处理缺口

**输出格式**：
```markdown
## Code Review Snapshot

### Critical Path: Authentication
[Confirmed] Reviewed src/auth/login.ts, src/auth/middleware.ts

| Aspect | Rating | Notes |
|--------|-------|--------|
| Error handling | ⚠️ | Missing catch for token refresh failure |
| Security | ✅ | bcrypt hashing, parameterized queries |
| Readability | ✅ | Clear naming, reasonable function length |

[Unknown] Token rotation policy — requires stakeholder input
```

**质量闸门**：任何 ❌ 安全发现均需在功能开发前立即处理。

**引用规范**：
- [反幻觉指南](../../core/anti-hallucination.md)
- [代码审查清单](../../core/code-review-checklist.md)

### 步骤 0.5：依赖与安全检查

**目标**：识别存在漏洞、过期或不必要的依赖。

**操作**：
1. 运行适用于该项目生态系统的 `npm audit` / `pip audit` / 等效命令
2. 列出过期包及其严重程度级别
3. 检查依赖中的已知 CVE
4. 识别未使用的依赖

**输出格式**：
```markdown
## Dependency Report

| Category | Count | Severity |
|----------|-------|----------|
| Critical vulnerabilities | 1 | ❌ High |
| High vulnerabilities | 3 | ⚠️ Medium |
| Outdated (major) | 5 | ⚠️ |
| Outdated (minor/patch) | 12 | ℹ️ |
| Unused dependencies | 2 | ℹ️ |
```

**质量闸门**：任何严重漏洞必须在添加新功能前完成修补。

**引用规范**：
- [安全标准](../../core/security-standards.md)
- [签入标准](../../core/checkin-standards.md)

### 步骤 0.6：影响范围分析

**目标**：绘制提议的变更在系统中的传播路径。

**操作**：
1. 识别要修改的功能区域
2. 追踪直接依赖和传递依赖
3. 评估爆炸半径（触及多少个模块）
4. 构建风险矩阵（可能性 vs. 影响）

**输出格式**：
```markdown
## Impact Analysis

### Change Target: User profile module

**Blast Radius**: 6 modules directly affected, 3 transitively

### Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Break auth flow | Medium | High | Add integration tests |
| Payment regression | Low | Critical | Manual QA before deploy |
| API contract change | High | Medium | Version API endpoint |
```

**质量闸门**：若爆炸半径超过模块总数的 30%，建议采用增量式方法。

**引用规范**：
- [需求工程](../../core/requirement-engineering.md)

## 现况评估报告模板

完成全部 6 个步骤后，将发现综合整理为现况评估报告：

```markdown
# Discovery Report: [Project Name]

**Date**: YYYY-MM-DD
**Assessed by**: [AI / Human]

## Executive Summary
[1-2 sentences: overall project health and readiness]

## Verdict: [GO / NO-GO / CONDITIONAL]

## Key Findings
1. ...
2. ...
3. ...

## Blockers (if any)
- ...

## Recommendations
1. ...
2. ...

## Next Steps
- [ ] /reverse (if legacy code needs SDD specs)
- [ ] /sdd (for new feature specification)
- [ ] Address blockers listed above
```

## 与其他技能的集成

### 搭配 /reverse（反向工程）

在以下情况下于现况评估后使用 `/reverse`：
- 架构缺乏文档记录
- 需要为既有模块建立正式的 SDD 规格
- 旧有代码在变更前需要结构化分析

### 搭配 /sdd（规格驱动开发）

在现况评估后使用 `/sdd` 以：
- 根据现况评估发现编写新功能规格
- 在风险评估区段引用现况评估报告

### 搭配 /code-review（代码审查）

步骤 0.4 快照是 `/code-review` 的轻量版。在以下情况使用完整的 `/code-review`：
- 现况评估发现重大质量疑虑
- 规划变更前需要更深入的审计

## 应避免的反模式

### 不应该做的事

1. **跳过现况评估**
   - 错误：直接在不熟悉的代码库上开始编码
   - 正确：先运行 `/discover` 了解你正在处理的内容

2. **捏造指标**
   - 错误：“测试覆盖率大概在 60% 左右”
   - 正确：“[Unknown] 测试覆盖率 — 需要运行测试套件才能量测”

3. **不完整的评估**
   - 错误：只检查代码健康度，跳过依赖
   - 正确：完成全部 6 个步骤以获得可靠的全貌

4. **忽视质量闸门**
   - 错误：无视严重漏洞继续进行
   - 正确：在增加复杂度前先处理阻塞项目

## 最佳实践

- 在做出声明前先阅读所有相关代码（反幻觉）
- 使用确定性标签：`[Confirmed]`、`[Inferred]`、`[Unknown]`
- 包含来源引用及 file:line 参考
- 清楚区分事实与建议
- 根据项目规模调整深度（小型项目 = 轻量评估）

---

## 相关规范

- [反向工程标准](../../core/reverse-engineering-standards.md) — 深度代码分析方法论
- [测试标准](../../core/testing-standards.md) — 测试覆盖率基准
- [安全标准](../../core/security-standards.md) — 漏洞评估
- [AI 友善架构](../../core/ai-friendly-architecture.md) — 架构评估标准
- [文档结构](../../core/documentation-structure.md) — 文档完整性
- [变更日志标准](../../core/changelog-standards.md) — 变更追踪
- [反幻觉指南](../../core/anti-hallucination.md) — 证据导向分析
- [代码审查清单](../../core/code-review-checklist.md) — 审查方法论
- [签入标准](../../core/checkin-standards.md) — 质量闸门
- [需求工程](../../core/requirement-engineering.md) — 影响分析

---

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 1.0.0 | 2026-02-09 | 初始发布 |

---

## 授权

此技能采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
