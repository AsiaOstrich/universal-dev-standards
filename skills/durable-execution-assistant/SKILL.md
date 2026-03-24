---
name: durable
scope: partial
description: "[UDS] Guide workflow failure recovery with checkpoints, retries, and rollback"
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[workflow name or failure context | 工作流名稱或失敗情境]"
---

# Durable Execution Assistant | 持久執行助手

Guide fault-tolerant workflow design with automatic recovery, checkpoints, and retry strategies.

引導容錯工作流程設計，包含自動恢復、檢查點與重試策略。

## Usage | 使用方式

| Command | Purpose | 用途 |
|---------|---------|------|
| `/durable` | Start interactive failure recovery guide | 啟動互動式故障恢復引導 |
| `/durable --checkpoint` | Design checkpoint strategy | 設計檢查點策略 |
| `/durable --retry` | Configure retry policies | 配置重試策略 |
| `/durable --rollback` | Plan rollback procedures | 規劃回滾程序 |
| `/durable <workflow>` | Analyze specific workflow for durability | 分析特定工作流的持久性 |

## Core Concepts | 核心概念

| Concept | Definition | 定義 |
|---------|-----------|------|
| **Checkpoint** | Save execution state at known-good points | 在已知正確的位置儲存執行狀態 |
| **Retry** | Automatically re-attempt failed operations | 自動重新嘗試失敗的操作 |
| **Rollback** | Revert to last known-good state on failure | 失敗時回復到上一個已知正確狀態 |
| **Idempotency** | Operations produce same result on re-execution | 操作重新執行時產生相同結果 |
| **Circuit Breaker** | Stop retries when failure rate exceeds threshold | 失敗率超過閾值時停止重試 |

## Failure Recovery Decision Tree | 故障恢復決策樹

```
Failure detected
├── Is it transient? (network, timeout)
│   ├── Yes → Retry with backoff
│   └── No → Is state corrupted?
│       ├── Yes → Rollback to checkpoint
│       └── No → Is it a logic error?
│           ├── Yes → Stop, report, fix code
│           └── No → Escalate with diagnostics
```

## Retry Strategy Guide | 重試策略指南

| Strategy | When to Use | Config | 使用時機 |
|----------|-------------|--------|---------|
| **Immediate** | Rare glitches, fast ops | max 2 retries | 罕見故障、快速操作 |
| **Exponential Backoff** | Network/API calls | base 1s, max 30s | 網路/API 呼叫 |
| **Circuit Breaker** | Downstream service issues | threshold 50%, window 60s | 下游服務問題 |
| **Dead Letter** | Unrecoverable after retries | max 5 retries then queue | 重試後仍不可恢復 |

## Checkpoint Granularity | 檢查點粒度

| Granularity | Use Case | 使用場景 |
|-------------|----------|---------|
| **Per-step** | Long pipelines (> 5 steps) | 長管線（> 5 步驟） |
| **Per-batch** | Bulk data processing | 批量資料處理 |
| **Per-phase** | Multi-phase workflows | 多階段工作流程 |
| **Start/End** | Short, atomic operations | 短暫的原子操作 |

## Workflow | 工作流程

1. **DETECT** - Identify failure type and scope
2. **DIAGNOSE** - Determine root cause category
3. **RECOVER** - Apply appropriate recovery strategy
4. **VERIFY** - Confirm system state is consistent
5. **RESUME** - Continue from last checkpoint

---

1. **偵測** - 識別故障類型與範圍
2. **診斷** - 判定根本原因類別
3. **恢復** - 套用適當的恢復策略
4. **驗證** - 確認系統狀態一致
5. **繼續** - 從上一個檢查點繼續

## Usage Examples | 使用範例

```
User: /durable deploy-pipeline
AI: Analyzing deploy-pipeline for durability...
    Steps: build → test → deploy → verify
    Risk: deploy step has no rollback strategy.
    Recommendation: Add checkpoint after test,
    configure rollback for deploy using blue-green strategy.
```

## Next Steps Guidance | 下一步引導

After `/durable` completes, the AI assistant should suggest:

> **持久性分析完成。建議下一步 / Durability analysis complete. Suggested next steps:**
> - 執行 `/methodology` 選擇適合的開發方法論 — Choose suitable methodology
> - 執行 `/commit` 提交持久化設計變更 — Commit durability design changes

## Version History | 版本歷史

| Version | Date | Changes | 變更 |
|---------|------|---------|------|
| 1.0.0 | 2026-03-24 | Initial release | 初始版本 |


## AI Agent Behavior | AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/durable`](../commands/durable.md#ai-agent-behavior--ai-代理行為)
>
> For complete AI agent behavior definition, see the corresponding command file: [`/durable`](../commands/durable.md#ai-agent-behavior--ai-代理行為)

## License | 授權

CC BY 4.0
