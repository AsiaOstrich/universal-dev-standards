---
source: ../../../core/feature-manifest-standard.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: 501a97944fd0
status: current
---

# Feature Manifest 標準

> **Language**: [English](../../../core/feature-manifest-standard.md) | 繁體中文

**適用範圍**: 將既有系統移植或重組的遷移與重構專案
**Scope**: universal

---

## 概述

Feature Manifest 標準定義一種機器可讀格式（`feature-manifest.yaml`），用於在遷移或重構開始前，盤點既有系統的所有功能。它在舊系統的能力與新系統的驗收標準之間提供結構化的橋樑，讓工具（VibeOps `/vo-pipeline --variant migration`）能自動強制執行完整性閘門。

## 參考資料

| 標準/來源 | 內容 |
|----------------|---------|
| XSPEC-200 | 遷移功能盤點與完整性閘門 |
| XSPEC-201 | 重構/遷移完整性協議 |
| XSPEC-199 | AC `not_implemented` 狀態擴充 |

---

## 何時使用

在以下情況使用 `feature-manifest.yaml`：
- 將系統從一種語言/框架遷移到另一種（例如 PHP → C# .NET）
- 將舊系統移植到新架構
- 啟動必須保留既有行為的大型重構

**請勿用於** greenfield 開發——manifest 是既有系統的映照，不是設計文件。

---

## Feature Manifest 格式

### 檔案位置

```
artifacts/feature-manifest.yaml
```

### 頂層結構

```yaml
manifest_version: "1.0"
source_system:
  language: php
  framework: laravel
  scan_date: "2026-05-12"
  scan_coverage: "47/47 routes (100%)"

features:
  - id: FM-001
    name: UserLogin
    # ... (see Feature Entry below)
```

### Feature Entry 結構描述

| 欄位 | 型別 | 必填 | 說明 |
|-------|------|----------|-------------|
| `id` | string | 是 | `FM-NNN`（補零） |
| `name` | string | 是 | PascalCase 業務功能名稱 |
| `description` | string | 是 | 以白話描述業務目的 |
| `http_method` | string | 否 | `GET`、`POST`、`PUT`、`PATCH`、`DELETE`；CLI/背景作業為 `null` |
| `route` | string | 否 | URL 路徑；CLI/背景作業為 `null` |
| `controller` | string | 是 | `ClassName::methodName` |
| `confidence` | float | 是 | 0.0–1.0（見 Confidence 評分） |
| `side_effects` | list | 是 | `DB_READ`、`DB_WRITE`、`EMAIL`、`QUEUE`、`HTTP_CALL`、`FILE` |
| `migration_risks` | list | 否 | 風險標籤（見遷移風險） |
| `ac_id` | string | 否 | 初始為 `null`；manifest 建立後由 Planner 設定 |
| `status` | string | 是 | 初始一律為 `not_implemented` |

### 完整 Feature Entry 範例

```yaml
features:
  - id: FM-007
    name: OrderCancellation
    description: 取消訂單並觸發退款流程
    http_method: POST
    route: /api/orders/{id}/cancel
    controller: OrderController::cancel
    confidence: 0.9
    side_effects:
      - DB_WRITE
      - QUEUE
    migration_risks:
      - ORM_DIFFERENCES
    ac_id: null
    status: not_implemented
```

---

## Confidence 評分

| 數值 | 意義 | 動作 |
|-------|---------|--------|
| 1.0 | 功能名稱與業務目的明確無歧義 | 進入 AC 產生階段 |
| 0.8 | 功能名稱合理，目的需要推斷 | 附註後繼續 |
| 0.5 | 可能是基礎設施/工具程式，非主要業務功能 | 標記供人工審查 |
| 0.3 | 不明——無法判斷業務目的 | **暫停；必須由人工確認** |

**規則**：所有 `confidence < 0.5` 的功能，必須先經人工審查，Planner 才能產生 AC。

---

## 遷移風險

### PHP → C# .NET

| 標籤 | 說明 |
|-------|-------------|
| `SESSION_HANDLING` | PHP `$_SESSION` → ASP.NET Core Session/Cookie middleware |
| `ORM_DIFFERENCES` | Eloquent ORM 與 Entity Framework 的行為差異 |
| `TIMEZONE_HANDLING` | PHP 時區函式 → .NET `DateTimeOffset` |
| `FILE_UPLOAD_PATH` | PHP `$_FILES` → ASP.NET Core `IFormFile` |
| `REGEX_DIFFERENCES` | PHP PCRE 語法與 .NET `System.Text.RegularExpressions` 的差異 |
| `ARRAY_FUNCTIONS` | PHP `array_*` 函式 → LINQ 對應寫法 |
| `EXCEPTION_HIERARCHY` | PHP 例外階層與 .NET 例外階層的差異 |

### 通用

| 標籤 | 說明 |
|-------|-------------|
| `ASYNC_MODEL` | 同步程式碼 → async/await 遷移 |
| `NULL_SEMANTICS` | Null 處理差異 |
| `STRING_ENCODING` | 字串編碼/定序（collation）差異 |

---

## FEATURE_STUB 標記協議

在目標程式碼庫中實作 manifest 內的功能時，使用 `FEATURE_STUB:` 標記作為占位符：

### 格式

```
// FEATURE_STUB: <FM-ID> <FeatureName> — <AC-ID> pending
```

### 範例（C#）

```csharp
// FEATURE_STUB: FM-007 OrderCancellation — AC-007 pending
public async Task<Result<OrderDto>> CancelOrderAsync(string orderId, CancellationReason reason)
{
    throw new NotImplementedException();
}
```

### FEATURE_STUB 與 WARNING:STUB 的差異

| 標記 | 語義 | 使用時機 |
|--------|----------|-------------|
| `// WARNING: STUB` | 暫時的假邏輯（程式可執行但行為錯誤） | 帶有錯誤業務邏輯的占位符 |
| `// FEATURE_STUB:` | 功能尚未實作（完全沒有邏輯） | manifest 中尚未撰寫程式碼的功能 |

**兩種標記都會阻擋 CI**（main 分支 push 與 UAT/production 部署）。

### 生命週期

1. 功能加入 manifest，`status: not_implemented`
2. 開發人員在目標程式碼中加入 `FEATURE_STUB:` 占位符
3. 開發人員實作該功能，移除 `FEATURE_STUB:` 標記
4. 更新 manifest `status` → `implemented`
5. 更新 AC traceability `status` → `uncovered` 或 `covered`

---

## 完整性閘門

### Gate 1（Pre-Pipeline）

在 `/vo-pipeline --variant migration` 開始前：
- `artifacts/feature-manifest.yaml` 必須存在
- `.snapshots/` 目錄必須存在且至少含一個 JSON 檔案

### 功能完整性閘門（Pre-UAT）

CI 在以下條件同時成立時阻擋 UAT 部署：
- manifest 中有任何功能的 `status: not_implemented`，且
- 程式碼庫中存在對應的 `FEATURE_STUB:`

---

## 反模式

| 反模式 | 影響 | 正確做法 |
|--------------|--------|------------------|
| 沒有 manifest 就開始遷移 | 功能缺口到 UAT 才被發現 | 一律先產生 manifest |
| 跳過低 confidence 的功能 | 功能被靜默遺漏 | 審查並確認所有功能 |
| 用 `uncovered` 取代 `not_implemented` | CI 不會因缺少功能而阻擋 | 程式碼不存在時使用 `not_implemented` |
| 實作後未移除 `FEATURE_STUB:` | CI 出現「未完成」的假訊號 | 實作後一律清除標記 |

---

## 相關標準

- [Acceptance Criteria Traceability](acceptance-criteria-traceability.md) — `not_implemented` AC 狀態
- [Behavior Snapshot Standard](behavior-snapshot.md) — HTTP parity 基準記錄
- [Refactoring Standards](refactoring-standards.md) — 重構用的 Characterization 測試
- [Spec-Driven Development](spec-driven-development.md) — AC 產生工作流程

---

## 版本歷史

| 版本 | 日期 | 變更 |
|---------|------|---------|
| 1.0.0 | 2026-05-12 | 初始版本——FM-NNN schema、confidence 評分、FEATURE_STUB 協議（XSPEC-200） |
