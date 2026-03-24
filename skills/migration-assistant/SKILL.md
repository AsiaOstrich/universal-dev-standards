---
name: migrate
scope: universal
description: "[UDS] Guide code migration, framework upgrades, and technology modernization"
allowed-tools: Read, Grep, Glob, Bash(npm:*, git:*)
argument-hint: "[migration target or framework | 遷移目標或框架]"
---

# Migration Assistant | 遷移助手

Guide systematic code migration, framework upgrades, and technology modernization.

引導系統性程式碼遷移、框架升級與技術現代化。

## Usage | 使用方式

| Command | Purpose | 用途 |
|---------|---------|------|
| `/migrate` | Start interactive migration guide | 啟動互動式遷移引導 |
| `/migrate --assess` | Risk assessment only | 僅風險評估 |
| `/migrate "Vue 2 to 3"` | Guide specific migration | 引導特定遷移 |
| `/migrate --deps` | Dependency upgrade analysis | 依賴升級分析 |
| `/migrate --rollback` | Plan rollback strategy | 規劃回滾策略 |

## Migration Types | 遷移類型

| Type | Examples | Risk | 風險 |
|------|----------|------|------|
| **Framework Upgrade** | React 17→18, Vue 2→3, Angular 15→17 | Medium-High | 中高 |
| **Language Migration** | JS→TS, Python 2→3, Java 8→17 | High | 高 |
| **API Version** | REST v1→v2, GraphQL schema update | Medium | 中 |
| **Database Migration** | MySQL→PostgreSQL, SQL→NoSQL | Very High | 極高 |
| **Build Tool** | Webpack→Vite, Grunt→ESBuild | Low-Medium | 低中 |
| **Package Manager** | npm→pnpm, pip→poetry | Low | 低 |

## Risk Assessment Matrix | 風險評估矩陣

| | Low Impact | Medium Impact | High Impact |
|---|-----------|---------------|-------------|
| **Low Complexity** | Safe (proceed) | Caution | Plan carefully |
| **Medium Complexity** | Caution | Plan + test | Staged rollout |
| **High Complexity** | Plan + test | Staged rollout | Full SDD spec |

| | 低影響 | 中影響 | 高影響 |
|---|--------|--------|--------|
| **低複雜度** | 安全（直接進行） | 謹慎 | 仔細規劃 |
| **中複雜度** | 謹慎 | 規劃 + 測試 | 分階段發布 |
| **高複雜度** | 規劃 + 測試 | 分階段發布 | 完整 SDD 規格 |

## Workflow | 工作流程

1. **ASSESS** - Evaluate current state, identify breaking changes
2. **PLAN** - Create migration checklist with dependencies
3. **PREPARE** - Set up codemods, compatibility layers, feature flags
4. **MIGRATE** - Execute migration in phases with tests
5. **VERIFY** - Run full test suite, check for regressions
6. **CLEANUP** - Remove compatibility shims, old dependencies

---

1. **評估** - 評估現狀、識別破壞性變更
2. **規劃** - 建立含依賴關係的遷移清單
3. **準備** - 設定 codemods、相容層、功能旗標
4. **遷移** - 分階段執行遷移並測試
5. **驗證** - 執行完整測試套件、檢查回歸
6. **清理** - 移除相容層、舊依賴

## Rollback Strategy | 回滾策略

| Approach | When to Use | 使用時機 |
|----------|-------------|---------|
| **Git revert** | Small, atomic changes | 小型、原子性變更 |
| **Feature flag** | Gradual rollout needed | 需要逐步發布 |
| **Dual-run** | Critical systems, zero downtime | 關鍵系統、零停機 |
| **Branch freeze** | Full migration in one go | 一次性完整遷移 |

## Usage Examples | 使用範例

```
User: /migrate "Vue 2 to 3"
AI: Migration Assessment: Vue 2 → Vue 3
    Breaking changes found: 12
    - Options API → Composition API (47 components)
    - Filters removed (8 usages)
    - Event bus removed (3 usages)
    Risk: Medium-High
    Estimated effort: 2-3 weeks
    Recommended: Staged migration with @vue/compat
```

## Next Steps Guidance | 下一步引導

After `/migrate` completes, the AI assistant should suggest:

> **遷移分析完成。建議下一步 / Migration analysis complete. Suggested next steps:**
> - 執行 `/reverse` 深入理解現有程式碼 — Understand current codebase
> - 執行 `/testing` 確保遷移後測試通過 — Verify post-migration tests
> - 執行 `/commit` 提交遷移變更 — Commit migration changes

## Reference | 參考

- Core standard: [refactoring-standards.md](../../core/refactoring-standards.md)

## Version History | 版本歷史

| Version | Date | Changes | 變更 |
|---------|------|---------|------|
| 1.0.0 | 2026-03-24 | Initial release | 初始版本 |


## AI Agent Behavior | AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/migrate`](../commands/migrate.md#ai-agent-behavior--ai-代理行為)
>
> For complete AI agent behavior definition, see the corresponding command file: [`/migrate`](../commands/migrate.md#ai-agent-behavior--ai-代理行為)

## License | 授權

CC BY 4.0
