---
source: ../../../../core/guides/file-placement-guide.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-04
status: current
---

# 檔案歸檔決策指南

> **語言**: [English](../../../../core/guides/file-placement-guide.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-03-04
**適用範圍**: 所有軟體專案
**範圍**: universal
**上層規範**: [專案結構](../project-structure.md)、[文件結構](../documentation-structure.md)

---

## 目的

本指南回答：**「這個檔案該放哪裡？」**

提供主決策樹、反向查詢索引、程式碼組織深入辨析、以及開發中間產物生命週期管理。當你不確定新檔案該放在專案的哪個位置時，使用本指南。

關於標準目錄定義，請參閱上方連結的上層規範。本指南聚焦於**決策過程**，而非目錄清單。

---

## 1. 主決策樹

從這裡開始。識別檔案的主要分類，然後沿著分支進行。

```
你要放置什麼類型的檔案？
│
├── 程式碼（原始碼、測試、腳本、生成碼）
│   ├── 應用程式邏輯？ → src/{module}/
│   ├── 測試檔案？ → tests/（或依語言慣例放在原始碼旁）
│   ├── 腳本/工具？ → tools/ 或 scripts/
│   ├── 生成碼？ → src/generated/{type}/
│   └── 工具函式/輔助？ → 參見 §3 程式碼組織深入辨析
│
├── 文件（正式、工作中、參考）
│   ├── 正式（穩定、版本化）？
│   │   ├── 架構決策 → docs/ADR/NNN-title.md
│   │   ├── 規格 → docs/specs/
│   │   ├── API 參考 → docs/api-reference.md
│   │   ├── 使用指南 → docs/
│   │   └── 流程/圖表 → docs/flows/ 或 docs/diagrams/
│   └── 工作中（進行中、暫時）？
│       ├── 腦力激盪 → docs/working/brainstorms/
│       ├── RFC → docs/working/rfcs/
│       ├── 技術調查 → docs/working/investigations/
│       ├── POC → docs/working/poc/{name}/
│       └── 會議記錄 → docs/working/meeting-notes/
│
├── 設定檔
│   ├── 工具設定（linter、formatter、bundler） → 專案根目錄 /
│   ├── 應用程式執行時設定 → config/ 或 src/config/
│   ├── 環境變數 → .env（gitignored）
│   ├── CI/CD 管線 → .github/workflows/ 或 .gitlab-ci.yml
│   └── 基礎設施即程式碼 → infra/ 或 deploy/
│
└── 資源（靜態檔案、媒體）
    ├── Web 公開資源 → public/ 或 static/
    ├── 原始資源（需處理） → assets/ 或 src/assets/
    └── 文件圖片 → docs/images/ 或 docs/diagrams/
```

---

## 2. 反向查詢索引

按檔案類型查找其目的地。

### 程式碼檔案

| 檔案類型 | 目的地 | 說明 |
|---------|--------|------|
| 工具函式 | `src/utils/` | 無狀態、通用、跨模組 |
| 輔助函式 | `{layer}/helpers/` | 層級特定（例如 `tests/helpers/`） |
| 中間件 | `src/middleware/` | HTTP/請求管線處理器 |
| 型別定義 | `src/types/` 或 `shared/types/` | 全域型別放 shared/，模組型別放 module/ |
| 常數 | `src/constants/` 或 `shared/constants/` | 不變的設定值 |
| 測試夾具 | `tests/fixtures/` | 測試資料檔案 |
| 測試輔助 | `tests/helpers/` | 測試特定的工具函式 |
| 資料庫遷移 | `migrations/` 或 `db/migrations/` | 資料庫 schema 變更 |
| 種子資料 | `db/seeds/` 或 `seeds/` | 資料庫種子腳本 |
| 路由定義 | `src/routes/` | API/頁面路由處理器 |
| 設定模組 | `src/config/` | 執行時設定載入器 |
| 生成的 API 客戶端 | `src/generated/api/` | 從 OpenAPI/GraphQL 自動生成 |
| 生成的資料庫型別 | `src/generated/db/` | 從 ORM schema 自動生成 |
| 生成的 protobuf | `src/generated/proto/` | 從 .proto 檔案自動生成 |
| 腳本/工具 | `tools/` 或 `scripts/` | 建構、部署、維護腳本 |
| 建構設定 | 專案根目錄 | `webpack.config.js`、`vite.config.ts` 等 |
| 進入點 | `src/index.*` 或 `src/main.*` | 應用程式進入檔案 |

### 文件檔案

| 檔案類型 | 目的地 | 說明 |
|---------|--------|------|
| ADR | `docs/ADR/NNN-title.md` | 編號、永久 |
| 規格 | `docs/specs/` | 按類別組織 |
| 腦力激盪 | `docs/working/brainstorms/` | 日期前綴、暫時 |
| RFC | `docs/working/rfcs/RFC-NNN-title.md` | 編號、生命週期管理 |
| 技術調查 | `docs/working/investigations/` | 技術研究、日期前綴 |
| POC 報告 | `docs/working/poc/{name}/` | 子目錄含 README.md |
| 會議記錄 | `docs/working/meeting-notes/` | 日期前綴 |
| 流程文件 | `docs/flows/` | 流程與資料流 |
| 架構圖 | `docs/diagrams/` | .mmd、.puml、.drawio 檔案 |
| 疑難排解 | `docs/troubleshooting.md` | 常見問題與解決方案 |
| CHANGELOG | 根目錄 `/CHANGELOG.md` | Keep a Changelog 格式 |
| README | 根目錄 `/README.md` 或目錄 `README.md` | 每個重要目錄都應有一個 |

### 基礎設施與設定檔

| 檔案類型 | 目的地 | 說明 |
|---------|--------|------|
| Dockerfile | 根目錄 `/` 或 `deploy/` | 單服務：根目錄；多服務：deploy/ |
| docker-compose.yml | 根目錄 `/` 或 `deploy/` | 開發 vs 生產 compose 檔案 |
| CI 管線 | `.github/workflows/` | GitHub Actions YAML |
| .env 檔案 | 根目錄 `/`（gitignored） | 環境特定變數 |
| IDE 設定 | 根目錄 `/`（多數 gitignored） | `.vscode/`、`.idea/` |
| Git hooks | `.husky/` 或 `.githooks/` | Pre-commit、pre-push 腳本 |
| 授權 | 根目錄 `/LICENSE` | 大寫，無副檔名 |
| IaC（Terraform） | `infra/` | Terraform、Pulumi、CloudFormation |
| Kubernetes manifests | `deploy/k8s/` 或 `infra/k8s/` | 部署 manifests |

---

## 3. 程式碼組織深入辨析

### utils/ vs helpers/ vs shared/ vs common/ vs lib/ vs internal/

這是最常見的混淆來源。以下是完整辨析：

#### 快速參考

| 目錄 | 關鍵特徵 | 範例內容 |
|------|---------|---------|
| `utils/` | **無狀態 + 通用** | `formatDate()`、`slugify()`、`retry()` |
| `helpers/` | **層級綁定** | `tests/helpers/mockUser()`、`views/helpers/formatCurrency()` |
| `shared/` | **跨模組邊界** | `shared/types/User.ts`、`shared/constants/` |
| `common/` | shared/ 的別名 | 避免使用；建議用 `shared/` |
| `lib/` | **包裝依賴** | `lib/http-client/`（包裝 axios）、`lib/logger/` |
| `internal/` | **套件私有**（Go 慣例） | `internal/parser/`（外部無法 import） |

#### 詳細標準

**`utils/`** — 純工具函式
- 無副作用、無狀態、無業務邏輯
- 可以被提取為 npm/pip 套件
- 範例：`formatDate()`、`deepClone()`、`slugify()`、`retry()`
- 反模式：`utils/userService.js`（有業務邏輯 → 屬於 `services/`）

**`helpers/`** — 情境特定輔助
- 綁定特定層級或領域
- 通常放在層級目錄內：`tests/helpers/`、`views/helpers/`
- 很少在 `src/helpers/`（如果需要在 src 層級，可能是 `utils/`）
- 範例：`tests/helpers/createMockUser()`、`views/helpers/formatPrice()`

**`shared/`** — 跨模組共用程式碼
- 被 2 個以上模組使用
- 可包含型別、常數、驗證規則或簡單服務
- 有明確的模組邊界（使用者從 `shared/` import）
- 範例：`shared/types/User.ts`、`shared/validation/email.ts`

**`lib/`** — 包裝/Vendored 函式庫
- 包裝第三方依賴並加入專案特定預設
- 提供穩定的內部介面，即使外部函式庫變更
- 範例：`lib/http-client/`（包裝 axios）、`lib/logger/`（包裝 winston）

**`internal/`** — 套件私有（Go 慣例）
- Go 特定：`internal/` 下的程式碼無法被外部套件 import
- 其他語言：改用存取修飾符或模組邊界
- 範例：`internal/parser/`、`internal/codec/`

---

## 4. 開發中間產物生命週期

工作文件從建立到畢業（或歸檔）遵循一個生命週期。

### 畢業路徑

| 來源 | 目的地 | 觸發條件 |
|------|--------|---------|
| 腦力激盪 | 規格（`docs/specs/`） | 想法固化為需求 |
| RFC | ADR（`docs/ADR/`） | 決策完成並被接受 |
| 技術調查 | ADR 或知識庫 | 找到根因，需要決策 |
| POC | 功能實作 | POC 驗證通過，開始建構 |
| 會議記錄 | 行動項目（在 issue tracker 中） | 決策已提取 |

### 保留指南

| 狀態 | 保留期限 |
|------|---------|
| `draft` | 不活躍 3 個月後自動歸檔 |
| `active` | 保留直到解決 |
| `graduated` | 永久保留（歷史參考） |
| `archived` | 每年審查，不再有用則刪除 |

---

## 5. 遷移指南

如果你的專案有檔案在非標準位置，遵循此流程：

### 步驟 1：盤點

列出所有可能放錯位置的檔案。

### 步驟 2：分類

使用反向查詢索引（§2）確定每個檔案的正確目的地。

### 步驟 3：移動

```bash
# 建立目標目錄
mkdir -p docs/working/{brainstorms,investigations,rfcs,meeting-notes,poc}
mkdir -p src/generated

# 移動檔案（之後更新參考）
git mv old/path/file.md new/path/file.md
```

### 步驟 4：更新參考

移動檔案後，更新所有參考：
- 程式碼中的 import 路徑
- 文件中的連結
- CI/CD 管線路徑
- IDE 設定路徑

---

## 6. 反模式

### ❌ 根目錄雜亂

```
❌ project/
   ├── package.json
   ├── brainstorm.md          # 應放在 docs/working/brainstorms/
   ├── investigation-oom.md   # 應放在 docs/working/investigations/
   ├── TODO.md                # 應在 issue tracker 中
   └── notes.md               # 應放在 docs/working/
```

### ❌ docs/ 作為垃圾桶

```
❌ docs/
   ├── architecture.md        # ✓ 正確
   ├── brainstorm-2024.md     # → docs/working/brainstorms/
   ├── meeting-jan-15.md      # → docs/working/meeting-notes/
   ├── poc-redis.md           # → docs/working/poc/redis/
   └── random-thoughts.md     # → docs/working/brainstorms/ 或刪除
```

### ❌ utils/ 作為萬用桶

```
❌ src/utils/
   ├── formatDate.js          # ✓ 正確（純工具函式）
   ├── userService.js         # → src/services/（有業務邏輯）
   ├── database.js            # → src/config/ 或 lib/（基礎設施）
   └── authMiddleware.js      # → src/middleware/（層級特定）
```

### ❌ 目錄沒有 README

```
❌ docs/working/poc/redis-cache/
   ├── benchmark-results.txt
   ├── test-script.sh
   └── （沒有 README.md — 結論是什麼？）

✅ docs/working/poc/redis-cache/
   ├── README.md              # 目的、發現、結論、後續步驟
   ├── benchmark-results.txt
   └── test-script.sh
```

---

## 相關標準

- [專案結構標準](../project-structure.md) — 標準目錄定義
- [文件結構標準](../documentation-structure.md) — 文件目錄規則
- [程式碼提交標準](../checkin-standards.md) — 提交前驗證
- [AI 友善架構](../ai-friendly-architecture.md) — AI 協作的結構

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-03-04 | 初始檔案歸檔決策指南 |

---

## 授權

本指南以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
