---
name: documentation-guide
scope: universal
source: ../../../../skills/documentation-guide/SKILL.md
source_version: 2.1.0
translation_version: 2.2.0
last_synced: 2026-10-12
source_hash: a23a49fa4b9c
status: current
description: |
  引導文件結構、內容需求與專案文件的最佳實踐。
  Use when: 建立 README、撰寫文件、規劃 docs 目錄、專案初始設定、技術文件。
  Not for: 從原始碼機械式產生文件——請用 /docgen；變更日誌條目——請用 /changelog。
  Keywords: README, docs, documentation, CONTRIBUTING, CHANGELOG, ARCHITECTURE, API docs, 文件, 說明文件, 技術文件.
---

# 文件指南

> **語言**: [English](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/skills/documentation-guide/SKILL.md) | 繁體中文

**版本**: 2.1.0
**最後更新**: 2026-03-17
**適用範圍**: Claude Code Skills

---

## 目的

本 Skill 提供專案文件的全面指導，包括：
- 文件結構和檔案組織
- 依專案類型的內容需求
- 技術文件的撰寫標準
- 常見文件類型的範本

---

## 快速參考（YAML 壓縮格式）

```yaml
# === 專案類型 → 文件需求 ===
document_matrix:
  #           README  ARCH   API    DB     DEPLOY MIGRATE ADR    CHANGE CONTRIB
  new:        [REQ,   REQ,   if_app, if_app, REQ,   NO,     REC,   REQ,   REC]
  refactor:   [REQ,   REQ,   REQ,    REQ,    REQ,   REQ,    REQ,   REQ,   REC]
  migration:  [REQ,   REQ,   REQ,    REQ,    REQ,   REQ,    REQ,   REQ,   REC]
  maintenance:[REQ,   REC,   REC,    REC,    REC,   NO,     if_app, REQ,   if_app]
  # REQ=必要, REC=建議, if_app=如適用, NO=不需要

# === 文件金字塔 ===
pyramid:
  level_1: "README.md → 入口點，快速概覽"
  level_2: "ARCHITECTURE.md → 系統概述"
  level_3: "API.md, DATABASE.md, DEPLOYMENT.md → 技術細節"
  level_4: "ADR/, MIGRATION.md, CHANGELOG.md → 變更歷史"

# === 必要檔案 ===
root_files:
  README.md: {required: true, purpose: "專案概述、快速入門"}
  CONTRIBUTING.md: {required: "recommended", purpose: "貢獻指南"}
  CHANGELOG.md: {required: "recommended", purpose: "版本歷史"}
  LICENSE: {required: "for OSS", purpose: "授權資訊"}

docs_structure:
  INDEX.md: "文件索引"
  ARCHITECTURE.md: "系統架構"
  API.md: "API 文件"
  DATABASE.md: "資料庫綱要"
  DEPLOYMENT.md: "部署指南"
  MIGRATION.md: "遷移計畫（如適用）"
  ADR/: "架構決策記錄"

# === 檔案命名 ===
naming:
  root: "UPPERCASE.md (README.md, CONTRIBUTING.md, CHANGELOG.md)"
  docs: "lowercase-kebab-case.md (getting-started.md, api-reference.md)"

# === 品質標準 ===
quality:
  format:
    language: "英文（或專案指定）"
    encoding: "UTF-8"
    line_length: "建議 ≤120 字元"
    diagrams: "優先使用 Mermaid，其次 ASCII Art"
    links: "內部連結使用相對路徑"
  maintenance:
    sync: "程式碼變更時更新文件"
    version: "頂部標示版本和日期"
    review: "文件變更納入程式碼審查"
    periodic: "每季檢查文件是否過時"

# === DIÁTAXIS 分類 ===
diataxis:
  tutorial: "以學習為導向（getting-started.md）"
  how_to: "以任務為導向（deployment.md, migration.md）"
  reference: "以資訊為導向（api-reference.md, CHANGELOG.md）"
  explanation: "以理解為導向（architecture.md, ADR/）"
  header: "加入 **Document Type**: Tutorial | How-to | Reference | Explanation"

# === LLM 探索 ===
llm_discovery:
  llms_txt: "置於專案根目錄、供 LLM 檢索的結構化索引"
  llms_full_txt: "選用的完整串接文件"
  when: "公開專案、公開 API、使用 AI 工具的專案"

# === 品質指標 ===
quality_metrics:
  leading: ["覆蓋率 ≥90%", "新鮮度 ≤90 天", "連結健康度 100%", "範例有效性 100%"]
  lagging: ["支援工單減少", "新人上手時間", "與文件相關的 PR 評論"]
  tools: [markdown-link-check, lychee, remark-lint, vale, textstat]

# === ADR 強化 ===
adr_enhanced:
  new_fields: [Date, Deciders, Drivers, "supersedes/superseded-by"]
  lifecycle: "proposed → accepted → [deprecated | superseded]"
  decision_matrix: "影響程度 × 可逆性 → 是否需要 ADR？"

# === 翻譯友善 ===
translation_friendly:
  rules: ["使用完整句子", "不使用慣用語", "術語一致", "簡單的主動賓結構", "明確的指涉"]
  glossary: "維護 glossary.md 以確保術語一致"
  status_tracking: "以 YAML frontmatter 記錄 translation_status、source_version"
```

---

## 專案類型文件需求

### 文件需求矩陣

| 文件 | 新專案 | 重構 | 遷移 | 維護 |
|------|:------:|:----:|:----:|:----:|
| **README.md** | ✅ 必要 | ✅ 必要 | ✅ 必要 | ✅ 必要 |
| **ARCHITECTURE.md** | ✅ 必要 | ✅ 必要 | ✅ 必要 | ⚪ 建議 |
| **API.md** | ⚪ 如適用 | ✅ 必要 | ✅ 必要 | ⚪ 建議 |
| **DATABASE.md** | ⚪ 如適用 | ✅ 必要 | ✅ 必要 | ⚪ 建議 |
| **DEPLOYMENT.md** | ✅ 必要 | ✅ 必要 | ✅ 必要 | ⚪ 建議 |
| **MIGRATION.md** | ❌ 不需要 | ✅ 必要 | ✅ 必要 | ❌ 不需要 |
| **ADR/** | ⚪ 建議 | ✅ 必要 | ✅ 必要 | ⚪ 如適用 |
| **CHANGELOG.md** | ✅ 必要 | ✅ 必要 | ✅ 必要 | ✅ 必要 |

### 專案類型快速參考

```
🆕 新專案     → README + ARCHITECTURE + DEPLOYMENT + CHANGELOG
🔄 重構       → 所有文件 + MIGRATION + ADR（記錄「為何重構」）
🚚 遷移       → 所有文件 + MIGRATION（核心文件）+ 資料驗證
🔧 維護       → README + CHANGELOG（依變更範圍更新）
```

---

## 文件金字塔

```
                    ┌─────────────┐
                    │   README    │  ← 入口點，快速概覽
                    ├─────────────┤
                 ┌──┴─────────────┴──┐
                 │   ARCHITECTURE    │  ← 系統概述
                 ├───────────────────┤
              ┌──┴───────────────────┴──┐
              │  API / DATABASE / DEPLOY │  ← 技術細節
              ├─────────────────────────┤
           ┌──┴─────────────────────────┴──┐
           │    ADR / MIGRATION / CHANGELOG │  ← 變更歷史
           └───────────────────────────────┘
```

---

## 文件範本（YAML 壓縮格式）

```yaml
# === README.md ===
readme:
  minimum:
    - "# 專案名稱"
    - "簡短的單行描述"
    - "## 安裝"
    - "## 使用"
    - "## 授權"
  recommended:
    - "# 專案名稱 + 徽章"
    - "## 功能（項目符號列表）"
    - "## 安裝"
    - "## 快速入門 / 使用"
    - "## 文件（連結至 docs/）"
    - "## 貢獻（連結至 CONTRIBUTING.md）"
    - "## 授權"

# === ARCHITECTURE.md ===
architecture:
  required:
    - system_overview: "目的、範圍、主要功能"
    - architecture_diagram: "Mermaid 或 ASCII Art"
    - module_description: "職責、相依性"
    - technology_stack: "框架、語言、版本"
    - data_flow: "主要業務流程"
  recommended:
    - deployment_architecture: "生產環境拓撲"
    - design_decisions: "關鍵決策（或連結至 ADR）"

# === API.md ===
api:
  required:
    - api_overview: "版本、基礎 URL、身份驗證"
    - authentication: "Token 取得、過期時間"
    - endpoint_list: "所有 API 端點"
    - endpoint_specs: "請求/回應格式"
    - error_codes: "錯誤碼和說明"
  recommended:
    - code_examples: "常見語言的範例"
    - rate_limiting: "API 呼叫頻率限制"
  endpoint_format: |
    ### POST /api/v1/resource
    **請求**: | 欄位 | 類型 | 必要 | 說明 |
    **回應**: | 欄位 | 類型 | 說明 |
    **錯誤**: | 代碼 | 說明 |

# === DATABASE.md ===
database:
  required:
    - db_overview: "類型、版本、連線資訊"
    - er_diagram: "實體關係圖"
    - table_list: "所有資料表及用途"
    - table_specs: "欄位定義"
    - index_docs: "索引策略"
    - migration_scripts: "腳本位置"
  recommended:
    - backup_strategy: "頻率、保留期限"
  table_format: |
    ### 資料表名稱
    **欄位**: | 欄位 | 類型 | 可為空 | 預設值 | 說明 |
    **索引**: | 名稱 | 欄位 | 類型 |
    **關聯**: | 關聯表 | 連接欄位 | 關係 |

# === DEPLOYMENT.md ===
deployment:
  required:
    - environment_requirements: "硬體、軟體、網路"
    - installation_steps: "詳細流程"
    - configuration: "設定檔參數"
    - verification: "確認部署成功"
    - troubleshooting: "常見問題和解決方案"
  recommended:
    - monitoring: "健康檢查、日誌位置"
    - scaling_guide: "水平/垂直擴展"

# === MIGRATION.md ===
migration:
  required:
    - overview: "目標、範圍、時程"
    - prerequisites: "必要準備工作"
    - migration_steps: "詳細流程"
    - verification_checklist: "遷移後檢查"
    - rollback_plan: "失敗時的步驟"
    - backward_compatibility: "API/資料庫相容性"
  recommended:
    - partner_notification: "需通知的外部系統"

# === ADR（架構決策記錄）===
adr:
  filename: "NNN-kebab-case-title.md（例如：001-use-postgresql.md）"
  required:
    - title: "決策名稱"
    - status: "proposed | accepted | deprecated | superseded"
    - context: "為何需要此決策"
    - decision: "具體決策內容"
    - consequences: "影響（正面/負面）"
  recommended:
    - alternatives: "考慮過的其他選項"
```

---

## 檔案位置標準

```
project-root/
├── README.md                    # 專案入口文件
├── CONTRIBUTING.md              # 貢獻指南
├── CHANGELOG.md                 # 變更日誌
├── LICENSE                      # 授權檔案
└── docs/                        # 文件目錄
    ├── INDEX.md                 # 文件索引
    ├── ARCHITECTURE.md          # 架構文件
    ├── API.md                   # API 文件
    ├── DATABASE.md              # 資料庫文件
    ├── DEPLOYMENT.md            # 部署文件
    ├── MIGRATION.md             # 遷移文件（如需要）
    └── ADR/                     # 架構決策記錄
        ├── 001-xxx.md
        └── ...
```

---

## README.md 必要章節

### 最小可行 README

```markdown
# 專案名稱

簡短的單行描述。

## 安裝

```bash
npm install your-package
```

## 使用

```javascript
const lib = require('your-package');
lib.doSomething();
```

## 授權

MIT
```

### 建議的 README 章節

1. **專案名稱與描述**
2. **徽章**（CI 狀態、覆蓋率、npm 版本）
3. **功能**（項目符號列表）
4. **安裝**
5. **快速入門 / 使用**
6. **文件**（連結至 docs/）
7. **貢獻**（連結至 CONTRIBUTING.md）
8. **授權**

---

## ADR 範本

```markdown
# ADR-001: [決策標題]

**日期**: YYYY-MM-DD
**狀態**: proposed | accepted | deprecated | superseded
**決策者**: [參與人員清單]
**取代**: ADR-NNN（如適用）
**被取代於**: ADR-NNN（如適用）

## 驅動因素

- [關鍵因素 1]
- [關鍵因素 2]

## 背景
[為何需要此決策...]

## 決策
[具體決策內容...]

## 影響

### 正面
- 好處 1
- 好處 2

### 負面
- 缺點 1
- 缺點 2

## 考慮過的替代方案

### 替代方案 A：[名稱]
- **優點**: ...
- **缺點**: ...
- **拒絕原因**: ...
```

**何時撰寫 ADR**（影響程度 × 可逆性）：
- **高影響 + 難以回復** → 必須撰寫 ADR
- **高影響 + 容易回復** → 選擇性
- **低影響 + 難以回復** → 選擇性
- **低影響 + 容易回復** → 不需要 ADR

---

## 文件稽核檢查清單

審查專案文件時：

```
□ README.md 存在且包含必要章節
□ 安裝說明清楚且經過測試
□ 使用範例已提供且可運作
□ 已指定授權
□ ARCHITECTURE.md 存在（非簡單專案）
□ API.md 存在（如有暴露 API）
□ DATABASE.md 存在（如使用資料庫）
□ DEPLOYMENT.md 存在（已部署的專案）
□ ADR/ 存在於重大決策
□ CHANGELOG.md 遵循 Keep a Changelog 格式
□ 所有內部連結正常運作
□ 圖表是最新的
□ 無過時資訊
```

---

## 配置偵測

### 偵測順序

1. 檢查 `CONTRIBUTING.md` 中的「停用 Skills」區段
2. 檢查 `CONTRIBUTING.md` 中的「文件語言」區段
3. 檢查現有文件結構
4. 若未找到，**預設為英文**

### 首次設定

如果缺少文件：

1. 詢問：「此專案沒有完整的文件。應該使用哪種語言？(English / 中文)」
2. 判斷專案類型（新專案/重構/遷移/維護）
3. 依矩陣建立必要文件
4. 建議在 `CONTRIBUTING.md` 中記錄：

```markdown
## 文件標準

### 語言
此專案使用 **英文** 作為文件語言。

### 必要文件
根據專案類型，我們維護：
- README.md
- ARCHITECTURE.md
- DEPLOYMENT.md
- CHANGELOG.md
```

---

## 詳細指南

完整標準請參閱：
- [文件撰寫標準](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/locales/zh-TW/core/documentation-writing-standards.md)
- [文件結構標準](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/locales/zh-TW/core/documentation-structure.md)
- [README 範本](./readme-template.md)

---

## 下一步引導

`/docs-guide` 完成後，AI 助手應建議：

> **文件結構與需求已釐清。建議下一步：**
> - 執行 `/docs` 根據指南直接產生專案文件 ⭐ **推薦** — 立即將文件指南化為行動
> - 執行 `/changelog` 建立或更新 CHANGELOG.md — 確保變更歷史完整
> - 執行 `/sdd` 將文件需求納入規格驅動開發 — 確保文件與功能同步

---

## 相關標準

- [文件撰寫標準](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/locales/zh-TW/core/documentation-writing-standards.md) - 內容需求
- [文件結構標準](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/locales/zh-TW/core/documentation-structure.md) - 檔案組織
- [變更日誌標準](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/locales/zh-TW/core/changelog-standards.md) - CHANGELOG 格式
- [變更日誌指南技能](../changelog-guide/SKILL.md) - CHANGELOG 技能

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 2.1.0 | 2026-03-17 | 新增：Diátaxis 分類、LLM 發現、品質指標、增強版 ADR 範本、翻譯友善寫作 |
| 2.0.0 | 2026-01-12 | 新增：專案類型矩陣、文件範本、文件金字塔 |
| 1.0.0 | 2025-12-24 | 初始版本 |

---

## 授權

本 Skill 以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
