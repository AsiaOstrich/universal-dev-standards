---
source: ../../../core/performance-standards.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-10-16
source_hash: b678e96a3ff1
status: current
---

# 效能標準

> **語言**: [English](../../../core/performance-standards.md) | 繁體中文

**版本**: 1.2.0
**最後更新**: 2026-06-17
**適用性**: 所有軟體專案
**範圍**: 通用 (Universal)
**業界標準**: ISO/IEC 25010 效能效率
**參考**: [sre.google](https://sre.google/books/)

> **詳細說明與最佳化技術，請參閱 [效能指南](guides/performance-guide.md)**

---

## 目的

本標準定義軟體效能工程的完整指南，涵蓋效能需求、測試方法論和監控實踐。

**參考標準**:
- [ISO/IEC 25010:2011](https://www.iso.org/standard/35733.html) - 效能效率
- [Google SRE Book](https://sre.google/books/) - 網站可靠性工程

---

## 效能需求範本

### NFR 格式

```markdown
### NFR-PERF-XXX: [Title]

**Category**: Performance Efficiency > [Time Behavior/Resource Utilization/Capacity]
**Priority**: P1/P2/P3

**Requirement**:
| Percentile | Target | Maximum |
|------------|--------|---------|
| p50 | Xms | Yms |
| p95 | Xms | Yms |
| p99 | Xms | Yms |

**Conditions**: [Load, data volume, etc.]
**Measurement**: [Tool, sampling, reporting]
```

---

## 常見效能目標

| 系統類型 | 回應時間 (p95) | 吞吐量 | 可用性 |
|----------|----------------|--------|--------|
| **電子商務** | < 200ms | 1000+ rps | 99.9% |
| **內部工具** | < 500ms | 100+ rps | 99.5% |
| **批次處理** | N/A | 10K+ 筆記錄/分鐘 | 99% |
| **即時系統** | < 50ms (p99) | 10K+ rps | 99.99% |
| **API 閘道** | < 100ms | 5K+ rps | 99.95% |

---

## Core Web Vitals 目標

| 指標 | 目標 | 說明 |
|------|------|------|
| **LCP** (Largest Contentful Paint) | < 2.5s | 感知載入速度 |
| **INP** (Interaction to Next Paint) | < 200ms | 互動回應性 |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 視覺穩定性 |

---

## 效能預算

```yaml
# Example Performance Budget
resources:
  total_size: 500KB
  javascript: 200KB
  css: 50KB
  images: 200KB
  fonts: 50KB

metrics:
  time_to_interactive: 3s
  first_contentful_paint: 1.5s
  speed_index: 3s

lighthouse_scores:
  performance: 90
  accessibility: 100
  best_practices: 100
  seo: 100
```

---

## 效能指標

### 百分位數指引

| 百分位數 | 意義 | 用途 |
|----------|------|------|
| **p50** | 中位數 | 典型使用者體驗 |
| **p90** | 90% 較快 | 大多數使用者體驗 |
| **p95** | 95% 較快 | SLA 閾值（常見） |
| **p99** | 99% 較快 | 對多數使用者而言的最差情況 |
| **p99.9** | 99.9% 較快 | 高流量系統 |

### 四個黃金訊號 (SRE)

| 訊號 | 測量項目 | 目標 |
|------|----------|------|
| **延遲 (Latency)** | 回應時間 (p50, p95, p99) | < SLA |
| **流量 (Traffic)** | 每秒請求數 | 取決於容量 |
| **錯誤 (Errors)** | 錯誤率 % | < 0.1% |
| **飽和度 (Saturation)** | 資源利用率 | 持續 < 70% |

---

## 告警閾值

| 指標 | 警告 | 嚴重 | 處置動作 |
|------|------|------|----------|
| **p95 回應時間** | > 200ms | > 500ms | 調查、擴展 |
| **錯誤率** | > 0.1% | > 1% | Call 值班人員 (Page on-call) |
| **CPU 使用率** | > 70% | > 90% | 擴展、最佳化 |
| **記憶體使用率** | > 80% | > 95% | 擴展、調查洩漏 |
| **磁碟使用率** | > 80% | > 95% | 清理、擴充 |

---

## 容量規劃閾值

| 資源 | 規劃水位 | 嚴重 |
|------|----------|------|
| **運算 (CPU)** | 持續 70% | 90% |
| **記憶體** | 80% | 95% |
| **儲存空間** | 70% | 90% |
| **網路** | 60% | 80% |
| **資料庫連線** | 80% | 95% |

---

## 連線池配置

| 參數 | 建議值 | 備註 |
|------|--------|------|
| **最小連線數** | 5-10 | 維持熱連線 (warm connections) |
| **最大連線數** | 20-100 | 取決於資料庫與應用程式伺服器 |
| **閒置逾時** | 10-30 分鐘 | 釋放未使用的連線 |
| **連線逾時** | 5-10 秒 | 發生問題時快速失敗 (Fail fast) |

---

## 速率限制 (Rate Limiting) 配置

| 端點類型 | 限制 | 突發 (Burst) |
|----------|------|--------------|
| **公開 API** | 100/分鐘 | 10 |
| **已驗證** | 1000/分鐘 | 50 |
| **進階層級 (Premium tier)** | 10000/分鐘 | 200 |
| **內部** | 無限制 | N/A |

---

## 效能測試頻率

| 測試類型 | 開發階段 | 預備環境 (Staging) | 正式環境 (Production) |
|----------|----------|-------------------|----------------------|
| **單元效能** | 每次提交 | - | - |
| **負載測試** | 每週 | 每次發布 | 每月 |
| **壓力測試** | 每月 | 每次發布 | 每季 |
| **浸泡測試** | 每月 | 重大發布 | 每季 |
| **尖峰測試** | - | 重大發布 | 大型活動前 |

---

## 效能檢查清單

### 開發階段

- [ ] 已定義並記錄效能需求
- [ ] 已建立效能預算
- [ ] 資料庫查詢已最佳化（索引、EXPLAIN）
- [ ] 已實作快取策略
- [ ] 列表端點已加上分頁機制
- [ ] 長時間操作已採用非同步處理
- [ ] 已配置連線池

### 發布前

- [ ] 已使用類生產資料完成負載測試
- [ ] 已完成壓力測試（找出崩潰極限點）
- [ ] CI/CD 中已納入效能回歸測試
- [ ] 已達成 Core Web Vitals 目標（若是前端）
- [ ] 已完成資料庫查詢分析
- [ ] 快取命中率在可接受範圍
- [ ] 錯誤率低於閾值

### 正式環境

- [ ] 已配置 APM 監控
- [ ] 已建立效能儀表板
- [ ] 已定義告警閾值
- [ ] 已記錄容量規劃
- [ ] 具備效能問題的維運手冊 (Runbook)
- [ ] 已安排定期的效能審查

---

## 效能測試執行

### 測試類型定義

| 測試類型 | 目的 | 適用場景 |
|-----------|---------|---------------------|
| **Load Test** | 驗證系統在預期負載下的行為 | 發布前驗證、容量規劃 |
| **Stress Test** | 找出系統極限與崩潰點行為 | 架構變更、擴展驗證 |
| **Soak Test** | 偵測長時間執行下的記憶體洩漏或資源耗盡 | 重大發布、資源密集服務 |
| **Spike Test** | 驗證突發流量下的系統回應與復原 | 行銷活動前、促銷事件 |

### Baseline 管理

#### 首次建立 Baseline

1. 在穩定版本上執行至少 3 次完整 Load Test
2. 取 p50、p95、p99 的中位數作為 baseline
3. 記錄測試環境配置（硬體、資料量、並發數）
4. 將 baseline 與測試指令稿一同存入版本控制

#### 漂移偵測閾值

| 指標 | 可接受漂移 | 需調查 | 阻擋 |
|--------|-----------------|-------------|----------|
| p50 Latency | < 5% | 5-15% | > 15% |
| p95 Latency | < 10% | 10-20% | > 20% |
| p99 Latency | < 10% | 10-25% | > 25% |
| Throughput | < 5% 下降 | 5-15% 下降 | > 15% 下降 |
| Error Rate | 無增加 | < 0.1% 增加 | > 0.1% 增加 |

#### Baseline 更新策略

- 架構重構後：必須（MUST）重新建立 baseline
- 硬體升級後：應該（SHOULD）更新 baseline
- 效能最佳化成功後：應該（SHOULD）將新數值設為 baseline
- 所有 baseline 更新都必須（MUST）記錄變更原因與日期

### CI 觸發條件

並非每次 commit 都需要執行效能測試。請使用以下觸發條件矩陣：

| 觸發條件 | Load Test | Stress Test | Soak Test | Spike Test |
|-------------------|-----------|-------------|-----------|------------|
| 每次 commit | 否 | 否 | 否 | 否 |
| PR 合併至 main | 是（精簡） | 否 | 否 | 否 |
| Release tag | 是（完整） | 是 | 否 | 否 |
| 排程（每週） | 是 | 否 | 是 | 否 |
| 手動觸發 | 是 | 是 | 是 | 是 |
| 效能相關檔案變更 | 是（精簡） | 否 | 否 | 否 |

### Performance Budget

類似於 SRE Error Budget 的概念，Performance Budget 定義了可容忍的劣化餘裕。

| 概念 | 定義 | 範例 |
|---------|------------|---------|
| **效能目標** | 目標效能水準 | p99 < 200ms |
| **效能預算** | 允許的劣化餘裕 | p99 可劣化至 220ms（10%） |
| **預算消耗** | 累積劣化百分比 | 本季已消耗 6% |
| **預算耗盡** | 觸發凍結非必要變更 | 剩餘 < 2% 時凍結 |

#### 劣化容差

- p99 延遲不得（SHALL NOT）劣化超過 10%
- 吞吐量不得（SHALL NOT）下降超過 5%
- 錯誤率不得（SHALL NOT）增加超過 0.05%
- 預算依每季週期重設

### 測試報告格式

#### 報告範本

```markdown
## Performance Test Report

### Test Metadata
- **Date**: YYYY-MM-DD
- **Duration**: X minutes
- **Test Type**: Load / Stress / Soak / Spike
- **Environment**: staging / production-mirror

### Results Summary
| Metric | Baseline | Current | Change | Status |
|--------|----------|---------|--------|--------|
| p50 Latency | Xms | Yms | +Z% | PASS/FAIL |
| p95 Latency | Xms | Yms | +Z% | PASS/FAIL |
| p99 Latency | Xms | Yms | +Z% | PASS/FAIL |
| Throughput | X rps | Y rps | -Z% | PASS/FAIL |
| Error Rate | X% | Y% | +Z% | PASS/FAIL |

### Pass/Fail Determination
- **Overall**: PASS / FAIL
- **Failed Criteria**: [list of exceeded thresholds]

### Trend Analysis
- Chart of last 10 runs with baseline markers
- Anomaly points highlighted

### Recommendations
- Action items based on results
```

#### 通過/失敗判定規則

- 所有阻擋級別（blocking-level）閾值皆在限制內 → **PASS**
- 超過任何阻擋級別閾值 → **FAIL**
- 超過調查級別（investigation-level）閾值 → 記錄為警告，不阻擋

#### 趨勢圖需求

- 納入至少最近 10 次執行紀錄以進行趨勢比較
- 在圖表上顯示 baseline 標記
- 突顯超出閾值的異常資料點

---

## 遷移非功能性對等（XSPEC-286）

> 屬於 [XSPEC-284](https://github.com/AsiaOstrich/universal-dev-standards) 9 軸遷移完整性矩陣的**軸 ⑥ — 非功能**。涵蓋舊系統重構／重寫時「功能正確、資料正確，但**跑起來不一樣**」這一類遺漏。本節在上述通用基線／漂移機制之上新增**遷移專屬**的 before/after 語意；本節**不取代**通用效能框架。

### 為何這是真正的缺口

上述通用 Baseline 管理回答的是「*這個版本*相較*它自己*先前的 baseline 是否回歸」。它**無法**回答「**新**系統是否與它所取代的 **legacy** 系統對等」。在重寫時（例如 PHP 單請求 → .NET 共享狀態執行緒），legacy 的延遲／吞吐／隔離特性往往是**隱性且未經記錄的**，導致每請求功能對等（per-request functional parity）與行為快照對等（behavior-snapshot parity）皆通過，但系統卻悄悄跑得更慢、耗盡更小的連線池，或是遺失了某個鎖語意。

### 差分 oracle，而非絕對門檻

遷移對等使用 **legacy 作為 baseline** 並採用**宣告的容差**，而非上表中的絕對目標。legacy 系統量測到的行為即為 oracle；「回歸未超過宣告的容差」即為通過準則。這能讓分歧自我回報，而非依賴某人記得列舉每條熱路徑。

### 步驟 1 — 機械化擷取非功能 baseline（R3）

legacy 的非功能特性大多為隱性的。應從 legacy 產物**機械化地**（而非靠記憶）推導 baseline：

| 來源 | 推導出的 baseline 項目 |
|--------|----------------------|
| 關鍵路由／控制器 | 各關鍵路徑的 p50 / p95 / p99 延遲 |
| 熱點查詢／慢查詢日誌 | 每查詢延遲、掃描列數 |
| 背景作業／cron | 作業時長、吞吐量（筆數／分鐘） |
| 連線池設定 | 最小／最大連線數、閒置／連線逾時 |
| 逾時／速率限制（rate-limit）設定 | 每端點逾時、請求數／分鐘、突發量 |
| 交易設定 | 隔離等級（READ COMMITTED / REPEATABLE READ / SERIALIZABLE） |

所擷取的集合**同時**是回歸關卡（regression gate）的比對 baseline，**也是**資源／限制對等（步驟 4）的待驗證檢查清單。

### 步驟 2 — 效能回歸差分關卡（R1）

針對每條 baseline 路徑，量測新系統中對應的路徑，並在宣告的容差範圍內與 **legacy baseline** 進行比較。

| 指標 | 預設遷移容差 | 阻擋條件 |
|--------|----------------------------|-----------|
| p50 延遲 | ≤ +10% 相較於 legacy | > +10% |
| p95 延遲 | ≤ +15% 相較於 legacy | > +15% |
| p99 延遲 | ≤ +20% 相較於 legacy | > +20% |
| 吞吐量 | ≤ -10% 相較於 legacy | > -10% 下降 |

容差為**可按路徑設定**（批次作業與互動式端點有所不同）。以 **shadow** 模式起步（僅量測，不阻擋）以收集樣本並校準各路徑容差，隨後再晉級為 blocking。

**關卡時機**：pre-UAT（在簽核前抓出回歸）**以及** post-cutover（抓出僅在真實生產負載下才會顯現的回歸）。

```markdown
## Migration Performance Parity Report — <path>

| Metric | Legacy baseline | New system | Δ | Tolerance | Status |
|--------|-----------------|------------|---|-----------|--------|
| p50 | [X]ms | [Y]ms | +[Z]% | +10% | PASS/FAIL |
| p95 | [X]ms | [Y]ms | +[Z]% | +15% | PASS/FAIL |
| p99 | [X]ms | [Y]ms | +[Z]% | +20% | PASS/FAIL |
| Throughput | [X] rps | [Y] rps | -[Z]% | -10% | PASS/FAIL |

**Mode**: shadow (measure-only) / blocking
**Overall**: PASS / FAIL
```

### 步驟 3 — 並發隔離驗證（R2）

同一資源（同一筆記錄／同一個帳戶餘額／同一個序號）可能會被多個並發操作存取。legacy 的鎖定／交易隔離／順序保證皆為**隱性行為**，且經常在重寫中被改變——而**功能測試與行為快照對等兩者皆無法捕捉到這點**（每請求對等 ≠ 並發對等，此為與「每請求 ≠ 靜態資料」相同類型的盲點）。

**方法**：透過並發壓力觸發競態，接著斷言**領域不變量**，而非逐一檢查輸出。

| 不變量類別 | 範例斷言 |
|-----------------|-------------------|
| 守恆 | 在 N 次並發轉帳後 `SUM(balance)` 保持不變 |
| 唯一性 | 在並發配置下不會產生重複序號 |
| 無遺失更新 | 最後寫入者勝出（last-writer-wins）不會靜默覆寫已提交的寫入 |
| 順序 | 在並發情況下事件依照保證的順序套用 |

偵測到**隔離等級調降**（例如 legacy SERIALIZABLE → 新系統 READ COMMITTED，或移除了資料列鎖）將予以阻擋。不變量本身由領域定義；當並發案例與狀態轉移或時間不變量重疊時，**狀態機／時間考量由 XSPEC-287**（軸 ⑧）負責，而並發競態則由本節（軸 ⑥）負責——請參閱 XSPEC-287 §邊界。

**關卡時機**：pre-UAT。

### 步驟 4 — 資源／限制對等（R4）

驗證 legacy 資源限制未被重寫**無意間**變更（逾時時間悄悄從 30 秒降至 5 秒會導致長時間作業失敗；較小的連線池會將流量序列化）。將以下項目加入非功能核對清單：

- [ ] 請求／操作**逾時**與 legacy 一致（或變更已明確宣告）
- [ ] **速率限制**（請求數／分鐘、突發量）與 legacy 一致
- [ ] **連線池**最小／最大連線數及閒置／連線逾時與 legacy 一致
- [ ] **批次大小**與 legacy 一致
- [ ] **交易隔離等級**與 legacy 一致（與步驟 3 交叉比對）

每個項目若非完全一致，就必須有**已宣告且具正當理由的**差異。未宣告的差異屬於已知回歸風險，將阻擋切換（cutover）。

### 完整性宣告（矩陣對齊）

當本節同時宣告以下三項時，即滿足遷移完整性矩陣的軸 ⑥：**推導**（步驟 1 機械化 baseline）、**oracle**（步驟 2 回歸差分 + 步驟 3 不變量斷言）以及**關卡時機**（pre-UAT + post-cutover）。複用通用 baseline／漂移機制與 `observability-assistant` 量測機制——本節僅新增遷移 before/after 與並發隔離語意，並不重新建構通用的效能框架。

---

## 每次發布容量簽核

本節定義在正式發布前必須滿足的**容量關卡**（`release-readiness-gate.md` 中的維度 10，Tier-3）。

### 容量預測

在每個發布候選版本（release candidate）之前，根據以下項目產出容量預測：

1. **基線（Baseline）**：尖峰 TPS 與資源利用率（CPU、記憶體、DB 連線數、儲存空間成長率）的 90 天滾動平均值
2. **發布影響評估**：新功能預期的流量變動（例如：新通知流程帶來 +15% TPS）
3. **季節性調整**：未來 30 天內任何已知的流量尖峰（行銷活動、季節性尖峰）

### 餘裕閾值

| 指標 | 目標 (PASS) | 警告區間 | 失敗閾值 |
|------|--------------|-----------|----------------|
| 預估尖峰時的 CPU 餘裕 | ≥ 30% | 20–30% | < 20% |
| 記憶體餘裕 | ≥ 25% | 15–25% | < 15% |
| DB 連線池餘裕 | ≥ 40% | 25–40% | < 25% |
| p99 延遲 vs 基線 | ≤ +5% | +5% 至 +10% | > +10% 回歸 |
| 尖峰負載下的錯誤率 | < 0.1% | 0.1–0.5% | > 0.5% |

### 負載測試要求

在完成容量簽核前，執行上方「效能測試」章節所定義的負載測試場景（至少包含 Soak + Spike 測試）：

```bash
# Example: k6 capacity verification run
k6 run --vus 500 --duration 20m scripts/perf/soak-test.js
# Pass criterion: headroom metrics above, p99 within budget
```

### 簽核佐證

容量關卡需要**兩位具名簽核**——工程負責人（Engineering Lead）與 SRE 負責人（SRE Lead）：

```markdown
## Capacity Sign-off — <version>

**Projection date**: YYYY-MM-DD
**Baseline period**: last 90 days

| Metric | Baseline peak | Projected peak | Headroom | Status |
|--------|-------------|---------------|----------|--------|
| CPU | [X]% | [Y]% | [Z]% | PASS/WARN/FAIL |
| Memory | [X]% | [Y]% | [Z]% | PASS/WARN/FAIL |
| DB pool | [X]% | [Y]% | [Z]% | PASS/WARN/FAIL |
| p99 latency | [X]ms | [Y]ms | [±Z]% | PASS/WARN/FAIL |

**Load test artifact**: [link to load test report]

**Eng Lead sign-off**: _______________ Date: __________
**SRE Lead sign-off**: _______________ Date: __________
```

### Tier-3 適用為 N/A 的時機

在下列情況下，容量簽核為 `N/A`（需附上書面理由）：
- 專案 DAU < 100 且預期無顯著流量增長
- 使用者人數固定的內部工具
- 靜態內容／文件網站

---

## 相關標準

- [測試標準](testing-standards.md) - 效能測試整合
- [需求工程](requirement-engineering.md) - NFR 文件
- [日誌標準](logging-standards.md) - 效能日誌
- [程式碼審查清單](code-review-checklist.md) - 效能審查
- [部署標準](deployment-standards.md) - 部署前效能驗證
- [發布就緒關卡](release-readiness-gate.md) - 維度 1（負載）與維度 10（容量）
- [行為快照](behavior-snapshot.md) - 功能對等 oracle（與遷移非功能對等互補）
- [完整覆蓋測試](full-coverage-testing.md) - 並發維度交叉引用

---

## 版本歷史

| 版本 | 日期 | 變更 |
|---------|------|---------|
| 1.2.0 | 2026-06-17 | 新增遷移非功能性對等（XSPEC-286，軸⑥）：before/after 差分回歸關卡、並發隔離驗證、資源／限制對等、機械化基線擷取 |
| 1.1.0 | 2026-01-29 | 重構：拆分為規則 + 指南，將說明移至指南 |
| 1.0.0 | 2026-01-29 | 初次發布 |

---

## 授權條款

本標準採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 釋出。
