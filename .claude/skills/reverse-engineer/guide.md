---
scope: partial
description: |
  系統考古——從邏輯（Logic）、資料（Data）、執行環境（Runtime）三個維度對既有系統做反向工程。
  使用時機：分析舊有程式碼、為未文件化的系統撰寫文件、從現有實作建立規格、理解資料模型、建立執行環境基準。
  關鍵字：reverse engineering, legacy code, documentation, spec extraction, code archaeology, system archeology, data model, runtime baseline, 反向工程, 舊有程式碼, 規格提取, 系統考古。
source: ../../../../skills/reverse-engineer/guide.md
source_version: 2.0.0
translation_version: 1.2.0
last_synced: 2026-10-12
source_hash: a97db6ef1238
status: current
---

# 系統考古指南 — 跨三維度的反向工程

> **語言**: [English](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/skills/reverse-engineer/guide.md) | 繁體中文

**版本**: 2.0.0
**最後更新**: 2026-02-12
**適用範圍**: Claude Code Skills

> **核心規範**：此技能實作[反向工程標準](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/locales/zh-TW/core/reverse-engineering-standards.md)。任何 AI 工具皆可參考核心規範取得完整方法論文件。

---

## 目的

此技能提供一套**系統考古框架**，從三個維度——**邏輯（Logic）**、**資料（Data）**、**執行環境（Runtime）**——對既有系統做反向工程，產出完整的 SDD 規格文件，並嚴格遵循反幻覺標準。

## 快速參考

### 系統考古框架

```
┌──────────────────────────────────────────────────────────────────┐
│                   系統考古框架                                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  維度 1：資料 DATA（/reverse data）                               │
│      ├─ 資料庫 schema、ORM 模型、遷移                             │
│      ├─ 實體關係映射                                              │
│      └─ 輸出：資料模型規格                                        │
│                                                                    │
│  維度 2：執行環境 RUNTIME（/reverse runtime）                     │
│      ├─ 設定、環境變數、功能旗標                                  │
│      ├─ Docker/K8s 拓樸、CI/CD 管線                               │
│      └─ 輸出：執行環境基準                                        │
│                                                                    │
│  維度 3：邏輯 LOGIC（/reverse spec）                              │
│      ├─ API、模組、資料流程、測試                                 │
│      ├─ 以資料 + 執行環境脈絡加以充實                             │
│      └─ 輸出：SPEC-XXX.md                                         │
│                                                                    │
│  /reverse（不帶子指令）= 全部 3 個維度 → 完整報告                 │
│                                                                    │
│  人類審查：                                                        │
│      ├─ 驗證 [已確認] / [推斷] / [未知] 標籤                      │
│      ├─ 補上動機、風險評估、商業背景                              │
│      └─ 透過 /sdd 核准規格                                        │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

### 可提取與不可提取的內容

| 面向 | 可提取 | 確定性 | 備註 |
|------|--------|--------|------|
| **API 端點** | ✅ 是 | [已確認] | 路由定義、HTTP 方法 |
| **資料模型** | ✅ 是 | [已確認] | 類型、介面、結構描述 |
| **函數簽名** | ✅ 是 | [已確認] | 參數、回傳類型 |
| **測試案例** | ✅ 是 | [已確認] | → 驗收標準 |
| **相依性** | ✅ 是 | [已確認] | 套件引用 |
| **行為模式** | ⚠️ 部分 | [推斷] | 從程式碼分析推斷 |
| **動機/為什麼** | ❌ 否 | [未知] | 需要人類輸入 |
| **商業背景** | ❌ 否 | [未知] | 需要人類輸入 |
| **風險評估** | ❌ 否 | [未知] | 需要領域專業知識 |
| **權衡決策** | ❌ 否 | [未知] | 缺少歷史背景 |

## 核心原則

### 1. 反幻覺合規

**關鍵**：此技能必須嚴格遵循[反幻覺標準](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/locales/zh-TW/core/anti-hallucination.md)。

#### 確定性標籤（來自統一標籤系統）

此技能使用**確定性標籤**來分析既有程式碼。完整標籤參考請見[反幻覺標準](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/locales/zh-TW/core/anti-hallucination.md#certainty-classification-tags)。

| 標籤 | 使用時機 | 範例 |
|------|----------|------|
| `[已確認]` | 來自程式碼/測試的直接證據 | `src/api/users.ts:15` 的 API 端點 |
| `[推斷]` | 從模式合理推斷 | 「根據建構函數模式，可能使用依賴注入」 |
| `[未知]` | 無法從程式碼判斷 | 動機、商業需求 |
| `[需確認]` | 需要人類驗證 | 設計意圖、邊界案例處理 |

#### 來源標註

每個提取的項目必須包含來源標註：

```markdown
## API 設計

### 使用者認證
[已確認] POST /api/auth/login 端點接受電子郵件和密碼
- [來源: 程式碼] src/controllers/AuthController.ts:25-45
- [來源: 程式碼] src/routes/auth.ts:8

### 工作階段管理
[推斷] 根據 JWT 過期設定，工作階段在 24 小時後過期
- [來源: 程式碼] src/config/auth.ts:12 - TOKEN_EXPIRY=86400
- [來源: 知識] 標準 JWT 過期解釋（⚠️ 請驗證意圖）
```

### 2. 漸進式揭露

從高層級架構開始，然後深入：

1. **系統概覽**：進入點、主要元件
2. **元件詳情**：個別模組及其職責
3. **實作細節**：演算法、資料流程

### 3. 測試對應需求

從測試提取驗收標準：

```javascript
// 測試檔案：src/tests/auth.test.ts
describe('認證', () => {
  it('應該對無效憑證回傳 401', () => {...});
  it('應該在登入成功時發放 JWT 權杖', () => {...});
  it('應該在過期前更新權杖', () => {...});
});
```

轉換為：

```markdown
## 驗收標準
[推斷] 從測試分析（src/tests/auth.test.ts）：
- [ ] 對無效憑證回傳 401 狀態碼
- [ ] 登入成功時發放 JWT 權杖
- [ ] 支援過期前的權杖更新
```

## 工作流程階段

### 階段 1：程式碼掃描

**輸入**：檔案路徑或目錄
**輸出**：程式碼結構分析

**動作**：
1. 識別進入點（主函數、API 路由、事件處理器）
2. 映射模組相依性
3. 提取類型定義和介面
4. 列出設定來源

### 階段 2：測試分析

**輸入**：測試檔案
**輸出**：驗收標準候選

**動作**：
1. 解析測試案例名稱
2. 提取 Given-When-Then 模式（如為 BDD 風格）
3. 識別邊界條件
4. 記錄覆蓋率缺口

### 階段 3：缺口識別

**輸入**：程式碼 + 測試分析
**輸出**：需要人類輸入的未知項目清單

**必要人類輸入**：
- [ ] 動機：為什麼要建立此功能？
- [ ] 使用者故事：誰使用這個功能？用於什麼目的？
- [ ] 風險：可能出什麼問題？
- [ ] 權衡：為什麼選擇這個方法而非其他替代方案？
- [ ] 範圍外：明確排除了什麼？

### 階段 4：規格生成

**輸入**：所有分析結果
**輸出**：初稿規格文件

**範本**：使用 [reverse-spec-template.md](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/locales/zh-TW/templates/reverse-spec-template.md)

### 階段 5：人類審查

**輸入**：初稿規格
**輸出**：經驗證的規格

**審查清單**：
- [ ] 所有 `[已確認]` 項目驗證準確
- [ ] 所有 `[推斷]` 項目經過驗證或修正
- [ ] 所有 `[未知]` 項目由人類填寫
- [ ] 來源引用已檢查
- [ ] 商業背景已新增

## 範例

### 範例 1：API 端點提取

**輸入程式碼**（`src/controllers/UserController.ts`）：
```typescript
export class UserController {
  @Get('/users/:id')
  @Authorize('admin', 'user')
  async getUser(@Param('id') id: string): Promise<User> {
    return this.userService.findById(id);
  }
}
```

**提取的規格**：
```markdown
## API 端點

### GET /users/:id
[已確認] 依 ID 取得使用者
- [來源: 程式碼] src/controllers/UserController.ts:3-7

**授權**：[已確認] 需要 'admin' 或 'user' 角色
- [來源: 程式碼] 第 4 行的 @Authorize 裝飾器

**參數**：
- `id`（路徑，必要）：使用者識別碼 [已確認]

**回應**：[已確認] 回傳 User 物件
- [來源: 程式碼] 第 5 行的回傳類型

**錯誤處理**：[未知] 錯誤回應無法從程式碼中明確得知
```

### 範例 2：測試轉換為標準

**輸入測試**（`src/tests/cart.test.ts`）：
```typescript
describe('購物車', () => {
  it('應該將商品加入空購物車', () => {...});
  it('應該對重複商品增加數量', () => {...});
  it('不應超過最大數量 99', () => {...});
  it('應該計算含稅總額', () => {...});
});
```

**提取的驗收標準**：
```markdown
## 驗收標準

[推斷] 從測試分析（src/tests/cart.test.ts）：
- [ ] 可將商品加入空購物車（第 2 行）
- [ ] 對重複商品增加數量（第 3 行）
- [ ] 最大數量限制：99 件（第 4 行）
- [ ] 總額計算包含稅金（第 5 行）

[未知] 稅金計算規則未在測試中指定
[需確認] 購物車超過 99 件時會發生什麼？（拒絕或限制？）
```

## 與其他技能的整合

### 與 /sdd（規格驅動開發）

1. 使用 `/reverse-sdd` 生成反向工程規格
2. 審查並填寫 `[未知]` 區塊
3. 使用 `/sdd review` 驗證完整性
4. 繼續正常 SDD 工作流程進行增強

### 與 /tdd（測試驅動開發）

1. 提取現有測試模式
2. 識別測試覆蓋率缺口
3. 使用 `/tdd` 新增缺失的測試
4. 用新的驗收標準更新規格

### 與 /bdd（行為驅動開發）

1. 將提取的驗收標準轉換為 Gherkin 格式
2. 使用 `/bdd` 正式化場景
3. 與利害關係人驗證場景

## 資料維度指南（`/reverse data`）

### 要掃描什麼

| 來源 | 要找什麼 | 確定性 |
|------|----------|--------|
| `schema.prisma` / `*.schema.*` | 模型、欄位、關聯、列舉 | [已確認] |
| `migrations/` / `*.migration.*` | Schema 演進歷史 | [已確認] |
| `models/` / `entities/` | ORM 模型定義 | [已確認] |
| `knexfile.*` / `sequelize` 設定 | 資料庫連線、方言 | [已確認] |
| `seeds/` / `fixtures/` | 測試資料、預設值 | [已確認] |
| `docker-compose.yml`（資料庫服務） | 資料庫引擎、連接埠、volume | [已確認] |
| 程式碼模式（`.findBy`、`.save`） | 隱含的關聯 | [推斷] |
| 找不到任何 schema 檔 | 可能是 schemaless/NoSQL | [未知] |

### 輸出範本：資料模型規格

```markdown
# 資料模型規格 — [專案名稱]

## 實體

### User
[已確認] 來源：schema.prisma:5-15
| 欄位 | 類型 | 約束 | 備註 |
|------|------|------|------|
| id | UUID | PK, auto | — |
| email | String | Unique, Not Null | — |
| role | Enum(admin,user) | Default: user | — |

### Order
[已確認] 來源：models/Order.ts:3-20
...

## 關聯
[已確認] User 1:N Order（FK: order.userId → user.id）
[推斷] Order M:N Product（關聯表：order_items——來自程式碼模式）

## 遷移歷史
| 版本 | 日期 | 說明 | 來源 |
|------|------|------|------|
| 001 | 2024-03-01 | 初始 schema | migrations/001_init.ts |
| 002 | 2024-06-15 | 為 user 新增 role | migrations/002_add_role.ts |

## 資料流程路徑
- 寫入：API → Service → Repository → DB
- 讀取：DB → Repository → Service → Serializer → API
```

---

## 執行環境維度指南（`/reverse runtime`）

### 要掃描什麼

| 來源 | 要找什麼 | 確定性 |
|------|----------|--------|
| `.env.example` / `.env.template` | 環境變數名稱 | [已確認] |
| `docker-compose.yml` | 服務、連接埠、相依性 | [已確認] |
| `Dockerfile` | 基礎映像、建置步驟、對外連接埠 | [已確認] |
| `k8s/` / Helm charts | 部署拓樸 | [已確認] |
| CI/CD 檔案（`.github/`、`.gitlab-ci.yml`） | 建置／部署管線 | [已確認] |
| 設定檔（`*.config.*`） | 功能旗標、設定階層 | [已確認] |
| 日誌檔（僅看模式） | 錯誤模式、日誌層級 | [推斷] |
| 監控端點（`/health`、`/metrics`） | 可觀測性介面 | [已確認] |

### 安全規則

- **絕不**輸出 `.env`、機密、API 金鑰或密碼的實際值
- 只列出變數**名稱**並推斷其**用途**
- 任何敏感設定一律標記為 `[REDACTED]`

### 輸出範本：執行環境基準

```markdown
# 執行環境基準 — [專案名稱]

## 環境變數
| 變數 | 用途 | 必要 | 來源 |
|------|------|------|------|
| DATABASE_URL | 資料庫連線字串 | 是 | .env.example:1 |
| JWT_SECRET | 權杖簽章金鑰 | 是 | .env.example:3 |
| REDIS_URL | 快取連線 | 否 | .env.example:5 |
| FEATURE_NEW_UI | 功能旗標 | 否 | config/features.ts:12 |

## 外部相依服務
| 服務 | 協定 | 用途 | 來源 |
|------|------|------|------|
| PostgreSQL 15 | TCP:5432 | 主要資料庫 | docker-compose.yml:8 |
| Redis 7 | TCP:6379 | 工作階段快取 | docker-compose.yml:15 |
| Stripe API | HTTPS | 付款處理 | [推斷] src/services/payment.ts:3 |

## 部署拓樸
[已確認] 來源：docker-compose.yml
- app (Node.js 20) → port 3000
- db (PostgreSQL 15) → port 5432
- redis (Redis 7) → port 6379

## 健康檢查與監控
[已確認] GET /health → src/routes/health.ts:5
[推斷] 未發現 metrics 端點——建議新增 /metrics

## CI/CD 管線
[已確認] 來源：.github/workflows/ci.yml
- 觸發：push 到 main、PR
- 步驟：lint → test → build → deploy
```

---

## 完整反向工程管道

反向工程技能支援完整的 SDD → BDD → TDD 管道：

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        完整反向工程管道                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   程式碼 + 測試                                                          │
│        │                                                                │
│        ▼                                                                │
│   /reverse-sdd                                                          │
│        │                                                                │
│        └─→ 生成 SPEC-XXX 含驗收標準                                      │
│                │                                                        │
│                ▼                                                        │
│   /reverse-bdd                                                          │
│        │                                                                │
│        ├─→ AC → Gherkin 場景轉換                                         │
│        ├─→ 條列式自動轉換為 Given-When-Then                              │
│        └─→ 生成 .feature 檔案                                           │
│                │                                                        │
│                ▼                                                        │
│   /reverse-tdd                                                          │
│        │                                                                │
│        ├─→ 分析現有單元測試                                              │
│        └─→ 生成覆蓋率報告與缺口                                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 管道命令

| 命令 | 輸入 | 輸出 | 目的 |
|------|------|------|------|
| `/reverse-sdd` | 程式碼目錄 | SPEC-XXX.md | 從程式碼提取需求 |
| `/reverse-bdd` | SPEC 檔案 | .feature 檔案 | 將 AC 轉換為 Gherkin 場景 |
| `/reverse-tdd` | .feature 檔案 | 覆蓋率報告 | 映射場景到單元測試 |

### 使用範例

```bash
# 步驟 1：將程式碼反向工程成 SDD 規格
/reverse-sdd src/auth/

# 步驟 2：將驗收標準轉換為 BDD 場景
/reverse-bdd specs/SPEC-AUTH.md

# 步驟 3：分析 BDD 場景的測試覆蓋率
/reverse-tdd features/auth.feature
```

### 詳細指南

- [BDD 提取工作流程](./bdd-extraction.md) - AC → Gherkin 轉換詳細指南
- [TDD 分析工作流程](./tdd-analysis.md) - BDD → TDD 覆蓋率分析詳細指南

## 應避免的反模式

### ❌ 不要這樣做

1. **捏造動機**
   - 錯誤：「此功能是為了改善使用者體驗而建立的」
   - 正確：「[未知] 動機需要人類輸入」

2. **假設需求**
   - 錯誤：「系統需要 SSO 支援」
   - 正確：「[需確認] 程式碼中發現 SSO 設定 - 這是需求嗎？」

3. **推測未讀取的程式碼**
   - 錯誤：「PaymentService 處理 Stripe 整合」
   - 正確：「[未知] PaymentService 功能 - 需要讀取 src/services/PaymentService.ts」

4. **呈現選項時沒有不確定性標記**
   - 錯誤：「程式碼使用 Redis 做快取」
   - 正確：「[已確認] Redis 客戶端設定於 src/config/cache.ts:5」

## 最佳實踐

### 應該做的

- ✅ 在提出聲明前讀取所有相關檔案
- ✅ 為每個陳述標記確定性等級
- ✅ 包含帶有 file:line 的來源引用
- ✅ 清楚列出需要人類輸入的內容
- ✅ 保留原始程式碼註解作為背景

### 不應該做的

- ❌ 假設動機或商業背景
- ❌ 將推斷呈現為已確認的事實
- ❌ 跳過來源標註
- ❌ 為未讀取的程式碼生成規格
- ❌ 在沒有人類輸入的情況下填寫 `[未知]` 區塊

---

## 設定偵測

此技能會自動偵測專案設定：

1. 檢查是否存在 `specs/` 目錄
2. 檢查 SDD 工具（OpenSpec、Spec Kit）
3. 偵測用於提取驗收標準的測試框架
4. 識別程式碼模式（MVC、DDD 等）

---

## 相關標準

- [反向工程標準](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/locales/zh-TW/core/reverse-engineering-standards.md) - **核心方法論標準（主要參考）**
- [規格驅動開發](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/locales/zh-TW/core/spec-driven-development.md) - 輸出格式與審查流程
- [反幻覺指南](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/locales/zh-TW/core/anti-hallucination.md) - 以證據為基礎的分析要求
- [程式碼審查檢查清單](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/locales/zh-TW/core/code-review-checklist.md) - 審查指南

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 2.0.0 | 2026-02-12 | 重大更新：三維度系統考古（邏輯 + 資料 + 執行環境） |
| 1.2.0 | 2026-01-25 | 新增：參照統一標籤系統 |
| 1.1.0 | 2026-01-19 | 新增 BDD/TDD 管道整合；新增核心規範參照 |
| 1.0.0 | 2026-01-19 | 初始發布 |

---

## 授權

此技能採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
