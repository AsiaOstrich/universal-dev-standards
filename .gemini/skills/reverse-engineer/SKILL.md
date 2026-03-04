---
name: reverse
scope: partial
description: "[UDS] System archeology — reverse engineer code across Logic, Data, and Runtime dimensions"
allowed-tools: Read, Grep, Glob, Bash(pg_dump:*), Bash(mysql:*), Bash(sqlite3:*), Bash(npm run:*), Bash(cat:*), Bash(docker:*)
argument-hint: "[spec|data|runtime|bdd|tdd] <input>"
disable-model-invocation: true
---

# Reverse Engineering Assistant | 反向工程助手

System archeology framework: reverse engineer existing systems across three dimensions — **Logic**, **Data**, and **Runtime**.

系統考古框架：從三個維度反向工程既有系統——**邏輯**、**資料**、**執行環境**。

## Three Dimensions | 三大維度

```
┌─────────────────────────────────────────────────────────┐
│              System Archeology Framework                   │
├──────────┬──────────────┬────────────────────────────────┤
│  Logic   │     Data     │          Runtime               │
│ (spec)   │    (data)    │         (runtime)              │
├──────────┼──────────────┼────────────────────────────────┤
│ APIs     │ DB Schemas   │ Logs & Error Patterns          │
│ Modules  │ ORMs/Models  │ Config & Environment           │
│ Flows    │ Migrations   │ Metrics & Performance          │
│ Tests    │ Seed Data    │ Infra & Deployment             │
└──────────┴──────────────┴────────────────────────────────┘
```

## Subcommands | 子命令

| Subcommand | Dimension | Input | Output | 說明 |
|------------|-----------|-------|--------|------|
| *(none)* | All | Project root | Full Archeology Report | 三維度全面分析 |
| `spec` | Logic | Code files/dirs | `SPEC-XXX.md` | 從程式碼提取規格 |
| `data` | Data | DB schemas, ORMs, migrations | Data Model Spec | 分析資料模型與結構 |
| `runtime` | Runtime | Logs, configs, metrics | Runtime Baseline | 分析執行環境基準 |
| `bdd` | — | `SPEC-XXX.md` | `.feature` | 將 AC 轉為 Gherkin |
| `tdd` | — | `.feature` | Coverage Report | 分析測試覆蓋率 |

## Full Analysis Mode | 全面分析模式

When `/reverse` is invoked without a subcommand, execute all three dimensions sequentially:

1. **Data** → Scan schemas, ORMs, migrations
2. **Runtime** → Analyze logs, configs, deployment
3. **Logic (spec)** → Extract APIs, flows, tests → Generate SPEC

Output: Integrated **System Archeology Report** combining all three dimensions.

## Dimension Details | 維度詳情

### spec: Logic Dimension (既有)

1. **Scan** - Read source files and identify public APIs, data flows, and business logic
2. **Classify** - Tag each finding as `[Confirmed]`, `[Inferred]`, or `[Unknown]`
3. **Structure** - Organize into SDD spec format with Acceptance Criteria
4. **Attribute** - Cite every reversed item with `file:line` source reference

### data: Data Dimension (新增)

1. **Discover** - Find database schemas, ORM models, migration files, seed data
2. **Map** - Build entity-relationship model from code evidence
3. **Classify** - Tag relationships as `[Confirmed]` (FK constraints) or `[Inferred]` (code patterns)
4. **Report** - Output data model spec with:
   - Entity list with fields and types
   - Relationship map (1:1, 1:N, M:N)
   - Index and constraint inventory
   - Migration history summary
   - Data flow paths (write → read)

**Evidence sources**: `schema.prisma`, `*.migration.*`, `models/`, `entities/`, `knexfile.*`, `sequelize`, `typeorm`, SQL files, `docker-compose.yml` (DB services)

### runtime: Runtime Dimension (新增)

1. **Scan configs** - Environment variables, config files, feature flags
2. **Analyze logs** - Log patterns, error frequency, log levels
3. **Check infra** - Docker configs, CI/CD pipelines, deployment manifests
4. **Baseline** - Output runtime baseline with:
   - Environment variable inventory (names only, **never values/secrets**)
   - Config file map and hierarchy
   - External service dependencies (APIs, queues, caches)
   - Deployment topology (containers, services)
   - Health check and monitoring endpoints

**Evidence sources**: `.env.example`, `docker-compose.yml`, `Dockerfile`, `*.config.*`, CI/CD files, `k8s/`, log files (patterns only)

**Security**: NEVER output actual secret values. Only list variable names and describe their purpose.

## Anti-Hallucination Rules | 防幻覺規則

| Rule | Requirement | 要求 |
|------|-------------|------|
| **Certainty Tags** | Use `[Confirmed]`, `[Inferred]`, `[Unknown]` for all findings | 所有發現須標注確定性 |
| **Source Attribution** | Cite `file:line` for every reversed item | 每項反向結果須引用來源 |
| **No Fabrication** | Never invent APIs or behaviors not found in code | 不得捏造程式碼中不存在的 API 或行為 |
| **No Secrets** | Never output secret values from configs or env files | 不得輸出設定檔或環境變數的密鑰值 |

## Usage | 使用方式

```
/reverse                              - Full 3-dimension analysis | 三維度全面分析
/reverse spec src/auth/               - Logic: extract spec | 邏輯：提取規格
/reverse data                         - Data: analyze schemas & models | 資料：分析結構
/reverse runtime                      - Runtime: analyze configs & infra | 執行環境：分析配置
/reverse bdd specs/SPEC-AUTH.md       - Convert spec ACs to Gherkin
/reverse tdd features/auth.feature    - Analyze test coverage
```

## Next Steps Guidance | 下一步引導

After `/reverse` (full or `spec`) completes, the AI assistant should suggest:

> **系統考古完成。建議下一步 / System archeology complete. Suggested next steps:**
> - 執行 `/sdd` 審查並核准此規格 — Review and approve the generated spec
> - 執行 `/derive` 從規格推導測試 — Derive tests from spec (requires approval first)
> - 審查規格中的 `[Inferred]` 和 `[Unknown]` 標記 — Review uncertainty tags manually

## Reference | 參考

- Detailed guide: [guide.md](./guide.md)
- Core standard: [reverse-engineering-standards.md](../../core/reverse-engineering-standards.md)
