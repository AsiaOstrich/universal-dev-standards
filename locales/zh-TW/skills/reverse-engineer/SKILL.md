---
name: reverse-engineer
source: ../../../../skills/reverse-engineer/SKILL.md
source_version: 1.2.0
source_hash: d543b24b2422
translation_version: 1.2.0
last_synced: 2026-06-01
status: current
description: "[UDS] 系統考古——跨邏輯、資料、執行環境三維度反向工程程式碼"
---

# 反向工程助手

> **語言**: [English](../../../../skills/reverse-engineer/SKILL.md) | 繁體中文

系統考古框架：從三個維度反向工程既有系統——**邏輯**、**資料**、**執行環境**。

## 三大維度

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

## 子命令

| 子命令 | 維度 | 輸入 | 輸出 | 說明 |
|--------|------|------|------|------|
| *(無)* | 全部 | 專案根目錄 | 完整考古報告 | 三維度全面分析 |
| `spec` | 邏輯 | 程式碼檔案/目錄 | `SPEC-XXX.md` | 從程式碼提取規格 |
| `data` | 資料 | DB 結構、ORM、遷移檔 | 資料模型規格 | 分析資料模型與結構 |
| `runtime` | 執行環境 | 日誌、設定、指標 | 執行環境基準 | 分析執行環境基準 |
| `bdd` | — | `SPEC-XXX.md` | `.feature` | 將 AC 轉為 Gherkin |
| `tdd` | — | `.feature` | 覆蓋率報告 | 分析測試覆蓋率 |

## 全面分析模式

當 `/reverse` 在未帶子命令的情況下被呼叫時，依序執行全部三個維度：

1. **資料（Data）** → 掃描結構、ORM、遷移檔
2. **執行環境（Runtime）** → 分析日誌、設定、部署
3. **邏輯（Logic / spec）** → 提取 API、流程、測試 → 產生 SPEC

輸出：整合三個維度的 **系統考古報告（System Archeology Report）**。

## 維度詳情

### spec：邏輯維度（既有）

1. **掃描** - 讀取原始碼檔案，識別公開 API、資料流與業務邏輯
2. **分類** - 將每個發現標記為 `[Confirmed]`、`[Inferred]` 或 `[Unknown]`
3. **結構化** - 整理為 SDD 規格格式，包含驗收條件
4. **引用來源** - 每項反向結果皆以 `file:line` 引用來源

### data：資料維度（新增）

1. **探索** - 找出資料庫結構、ORM 模型、遷移檔、種子資料
2. **對應** - 從程式碼證據建立實體關聯模型
3. **分類** - 將關聯標記為 `[Confirmed]`（FK 約束）或 `[Inferred]`（程式碼模式）
4. **報告** - 輸出資料模型規格，包含：
   - 含欄位與型別的實體清單
   - 關聯對應（1:1、1:N、M:N）
   - 索引與約束清單
   - 遷移歷史摘要
   - 資料流路徑（寫入 → 讀取）

**證據來源**：`schema.prisma`、`*.migration.*`、`models/`、`entities/`、`knexfile.*`、`sequelize`、`typeorm`、SQL 檔案、`docker-compose.yml`（DB 服務）

### runtime：執行環境維度（新增）

1. **掃描設定** - 環境變數、設定檔、功能旗標
2. **分析日誌** - 日誌模式、錯誤頻率、日誌層級
3. **檢查基礎設施** - Docker 設定、CI/CD 管線、部署清單
4. **建立基準** - 輸出執行環境基準，包含：
   - 環境變數清單（僅名稱，**絕不含值/密鑰**）
   - 設定檔對應與階層
   - 外部服務依賴（API、佇列、快取）
   - 部署拓撲（容器、服務）
   - 健康檢查與監控端點

**證據來源**：`.env.example`、`docker-compose.yml`、`Dockerfile`、`*.config.*`、CI/CD 檔案、`k8s/`、日誌檔案（僅模式）

**安全性**：絕不輸出實際密鑰值。僅列出變數名稱並描述其用途。

## 防幻覺規則

| 規則 | 要求 |
|------|------|
| **確定性標籤** | 所有發現須使用 `[Confirmed]`、`[Inferred]`、`[Unknown]` 標注 |
| **來源引用** | 每項反向結果須引用 `file:line` 來源 |
| **禁止捏造** | 不得捏造程式碼中不存在的 API 或行為 |
| **禁止密鑰** | 不得輸出設定檔或環境變數的密鑰值 |

## 使用方式

```
/reverse                              - 三維度全面分析
/reverse spec src/auth/               - 邏輯：提取規格
/reverse data                         - 資料：分析結構與模型
/reverse runtime                      - 執行環境：分析設定與基礎設施
/reverse bdd specs/SPEC-AUTH.md       - 將規格 AC 轉為 Gherkin
/reverse tdd features/auth.feature    - 分析測試覆蓋率
```

## 下一步引導

`/reverse`（完整或 `spec`）完成後，AI 助手應建議：

> **系統考古完成。建議下一步：**
> - 執行 `/sdd` 審查並核准此規格 ⭐ **推薦** — 審查並核准產生的規格
> - 執行 `/derive` 從規格推導測試 — 從規格推導測試（須先核准）
> - 審查規格中的 `[Inferred]` 和 `[Unknown]` 標記 — 手動審查不確定性標籤

## 參考

- 詳細指南：[guide.md](./guide.md)
- 核心規範：[reverse-engineering-standards.md](../../../../core/reverse-engineering-standards.md)

## AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/reverse`](../../../../skills/commands/reverse.md#ai-agent-behavior--ai-代理行為)
