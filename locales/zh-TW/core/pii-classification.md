---
source: ../../../core/pii-classification.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-07-23
source_hash: 16bf07c4e383
status: current
---

# PII 分類與處理標準

> **Language**: [English](../../../core/pii-classification.md) | 繁體中文

> **版本**: 1.1.0 | **狀態**: Active | **更新日期**: 2026-06-19
> **AI 最佳化版本**: `ai/standards/pii-classification.ai.yaml`
> **規格**: XSPEC-066（cross-project/specs/XSPEC-066-uds-compliance-audit-pack.md）

## 概觀

本標準定義**個人可識別資訊（PII）**與敏感個資如何分類、標記、儲存、傳輸與銷毀。
涵蓋三級資料敏感度分類、各級必備處理控制、資料最小化原則、同意管理要求、保留／
刪除排程，以及跨境傳輸限制。與 GDPR 第 9 條、CCPA 及一般 privacy-by-design 原則
對齊。

本標準屬於**合規與稽核標準包**（XSPEC-066）。其定義的 PII 等級驅動
`logging-standards` 執行的遮罩規則，以及 `audit-trail` 記錄的必備資料存取事件。

> **範圍**：本標準定義*分類等級*與各級*處理控制*。具體遮罩／tokenization 函式庫、
> 存放加密金鑰的 secrets store，以及 PIA 工作流程工具屬採用者的選擇。

## 需求

| ID | 規則 | 等級 |
|----|------|------|
| REQ-001 | PII 資料敏感度分類（TIER-1/2/3） | MUST |
| REQ-002 | 資料最小化與目的限制 | MUST |
| REQ-003 | 非正式環境的 PII 遮罩與匿名化 | MUST |
| REQ-004 | 資料保留與刪除排程 | MUST |
| REQ-005 | 跨境資料傳輸控制 | MUST |
| REQ-006 | 新功能的 PII 衝擊評估（PIA） | SHOULD |

### REQ-001 — PII 資料敏感度分類

所有含個人資訊的資料欄位，MUST 在儲存或處理前分類為以下三級之一：

| 等級 | 範例 | 必備控制 |
|------|------|----------|
| **TIER-1**（高度敏感） | 健康資料、金融帳號、政府識別碼、生物特徵、密碼、SSN | 靜態與傳輸中加密、存取記錄、不快取 |
| **TIER-2**（敏感） | 全名 + 聯絡資訊組合、位置歷史、行為輪廓、IP 位址 | 傳輸中加密、存取控制 |
| **TIER-3**（一般 PII） | 僅名、國家層級位置、一般人口統計 | 標準存取控制 |

### REQ-002 — 資料最小化與目的限制

系統 MUST 僅蒐集明確聲明目的所必需的最少 PII。資料模型中每個 PII 欄位 MUST 具備
文件化的業務目的與法律依據（同意、契約、正當利益、法律義務）。蒐集未具文件化目的
的 PII 為 **PROHIBITED**。目的限制 MUST 被強制執行：為目的 A 蒐集的資料，未經另行
同意 MUST NOT 用於不相關的目的 B。

### REQ-003 — 非正式環境的 PII 遮罩與匿名化

除非明確需要並經核准，PII MUST NOT 存在於非正式環境（開發、staging、測試）。測試／
staging 資料庫 MUST 使用匿名化或合成資料。任何核准的例外 MUST 有時限、受存取控制
並文件化。PII MUST 在應用日誌中遮罩：email 顯示為 `u***@domain.com`、電話為
`+1-XXX-XXX-1234`、卡號為 `****-****-****-1234`。

### REQ-004 — 資料保留與刪除排程

每個含 PII 的資料類別 MUST 具備文件化保留排程，其最大保留期須對齊法律要求與業務
需要。MUST 對超過保留期的資料實作自動刪除。刪除 MUST 可驗證（刪除收據或稽核日誌）。
行使刪除權（right to erasure）的使用者 MUST 在 30 天內（GDPR）或 45 天內（CCPA）
收到刪除確認。

### REQ-005 — 跨境資料傳輸控制

TIER-1 或 TIER-2 PII 的跨國境傳輸 MUST 遵循適用的傳輸機制。EU → 非適足性國家的
傳輸 MUST 使用標準契約條款（SCC）或拘束性企業規則。資料落地（residency）要求 MUST
記載於系統設計中。跨境傳輸 MUST 記錄目的地國家與法律依據。

### REQ-006 — 新功能的 PII 衝擊評估

任何引入新 PII 蒐集或處理的新功能或系統變更，SHOULD 在實作前進行隱私衝擊評估
（PIA）。PIA MUST 記載：蒐集何種 PII、目的、法律依據、保留期、第三方分享，以及
風險緩解。含 TIER-1 PII 的功能須強制 PIA；TIER-2 為建議。

## 與既有標準的整合

- **`audit-trail`**——TIER-1／TIER-2 PII 讀取、匯出與刪除請求為必備稽核事件。
- **`logging-standards`**——執行本標準要求的遮罩規則。
- **`security-standards`**——TIER-1 的靜態／傳輸加密控制引用專案安全基線。
- **`database-standards`**——資料字典欄位帶有 PII 等級與 REQ-002 的文件化目的／
  法律依據。

## PII 發現與交接契約

上述整合僅指出了消費方，但交接需要明確定義的**觸發點、介面、負責人與狀態**——
否則「驅動遮罩規則」只是一種主張，而非契約。本節沿用 `data-contract` REQ-005
的消費方註冊模型，以及 `agent-communication-protocol` §3 的結構化交接形式。

### 觸發點——分類何時啟動

| 時機 | 發生的事 |
|------|----------|
| 新功能設計 | REQ-006 PII 衝擊評估**須於**實作前為每個新 PII 欄位分類 |
| PR／掃描時 | 帶有 PII 但無等級標記的欄位為**阻擋（blocking）**發現（CI） |
| 資料字典變更 | `database-standards` 欄位新增／移除 PII 等級 → 重新通知消費方 |

### 介面——傳遞的內容

生產方產出物是每個欄位的**PII 分類登錄（registry）**項目：
`{ field, tier (TIER-1/2/3), purpose, legal_basis, masking_rule, retention }`。
消費方依此註冊（依 `data-contract` REQ-005），並於變更時收到通知。

### 負責人與已註冊消費方

| 角色 | 職責 |
|------|------|
| 資料負責人／功能作者 | **產出**分類結果（REQ-001／REQ-006） |
| `logging-standards`（消費方） | 對非正式環境中的 TIER-1/2 套用 `masking_rule` 並記錄日誌 |
| `audit-trail`（消費方） | 記錄必備的存取／匯出／刪除事件 |
| `security-standards`（消費方） | 對 TIER-1 強制執行靜態／傳輸中加密 |
| 隱私／合規負責人 | 於任何新增 TIER-1 欄位或分類變更時**收到通知** |

### 狀態轉換

`Found（已發現）→ Classified（已分類，已指定等級）→ Handled（已處理：遮罩／加密／已設定保留期）→ Verified（已驗證：消費方確認規則已套用）`。
停留在 `Found`（有 PII 但無等級）狀態的欄位**將阻擋發布**（REQ-001 + 上述 PR 時觸發規則）。

## 相關規格

- XSPEC-066 — UDS 合規與稽核標準包（本標準來源）
- DEC-041 — EU AI Act 2026 合規（PII 處理作為合規支柱）

## 變更紀錄

| 版本 | 日期 | 變更 |
|------|------|------|
| v1.1.0 | 2026-06-19 | 新增：PII 發現與交接契約（觸發點／介面／負責人／狀態），使宣稱與 logging-standards／audit-trail 的交接成為明確契約而非空談（XSPEC-292 T16） |
| v1.0.0 | 2026-06-17 | 初版——REQ-001~006：PII 等級、資料最小化、非正式環境遮罩、保留／刪除、跨境傳輸、PIA（XSPEC-066） |
