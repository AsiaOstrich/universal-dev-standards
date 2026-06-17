---
source: ../../../core/performance-standards.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-06-17
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

> **詳細說明與最佳化技術，請參閱 [效能指南](../../../core/guides/performance-guide.md)**

---

## 目的

本標準定義軟體效能工程的完整指南，涵蓋效能需求、測試方法論和監控實踐。

**參考標準**：
- [ISO/IEC 25010:2011](https://www.iso.org/standard/35733.html) - 效能效率
- [Google SRE Book](https://sre.google/books/) - 網站可靠性工程

---

## 效能需求範本

### NFR 格式

```markdown
### NFR-PERF-XXX: [標題]

**分類**: 效能效率 > [時間行為/資源利用/容量]
**優先級**: P1/P2/P3

**需求**:
| 百分位 | 目標 | 最大值 |
|--------|------|--------|
| p50 | Xms | Yms |
| p95 | Xms | Yms |
| p99 | Xms | Yms |
```

## 效能預算

| 類別 | 預算 | 測量方式 |
|------|------|----------|
| 頁面載入時間 | < 3 秒 | Lighthouse |
| API 回應時間 (p95) | < 500ms | APM 工具 |
| 記憶體使用 | < 512MB | 執行時監控 |
| CPU 使用率 | < 70% 平均 | 系統監控 |
| 套件大小 | < 200KB (gzip) | 建置分析 |

## 效能測試類型

| 類型 | 目的 | 工具 |
|------|------|------|
| **負載測試** | 驗證正常負載下的效能 | k6、JMeter、Locust |
| **壓力測試** | 找出系統極限 | k6、Gatling |
| **浸泡測試** | 偵測記憶體洩漏 | k6（長時間執行） |
| **尖峰測試** | 驗證突發流量處理 | k6、Artillery |

## 監控與告警

| 指標類型 | 範例 | 告警閾值 |
|----------|------|----------|
| 延遲 (Latency) | p95 回應時間 | > 目標的 2 倍 |
| 流量 (Traffic) | 每秒請求數 | 異常波動 > 50% |
| 錯誤率 (Errors) | HTTP 5xx 比例 | > 1% |
| 飽和度 (Saturation) | CPU/記憶體使用 | > 80% |

## 效能測試執行

### 測試類型定義

| 測試類型 | 目的 | 適用場景 |
|----------|------|----------|
| **Load Test** | 驗證系統在預期負載下的行為 | 發布前驗證、容量規劃 |
| **Stress Test** | 找出系統極限與崩潰行為 | 架構變更、擴展驗證 |
| **Soak Test** | 偵測記憶體洩漏或資源耗盡 | 重大發布、資源密集服務 |
| **Spike Test** | 驗證突發流量下的回應與恢復 | 行銷活動前、促銷事件 |

### Baseline 管理

**首次建立 Baseline：**
1. 在穩定版本上執行至少 3 次完整 Load Test
2. 取 p50、p95、p99 的中位數作為 baseline
3. 記錄測試環境配置（硬體、資料量、並發數）
4. 將 baseline 與測試腳本一同存入版本控制

**漂移偵測閾值：**

| 指標 | 可接受漂移 | 需調查 | 阻擋 |
|------|-----------|--------|------|
| p50 Latency | < 5% | 5-15% | > 15% |
| p95 Latency | < 10% | 10-20% | > 20% |
| p99 Latency | < 10% | 10-25% | > 25% |
| Throughput | < 5% 下降 | 5-15% 下降 | > 15% 下降 |
| Error Rate | 無增加 | < 0.1% 增加 | > 0.1% 增加 |

### CI 觸發條件

| 觸發條件 | Load Test | Stress Test | Soak Test | Spike Test |
|----------|-----------|-------------|-----------|------------|
| 每次 commit | 否 | 否 | 否 | 否 |
| PR 合併至 main | 是（精簡） | 否 | 否 | 否 |
| Release tag | 是（完整） | 是 | 否 | 否 |
| 排程（每週） | 是 | 否 | 是 | 否 |

### Performance Budget

| 概念 | 定義 | 範例 |
|------|------|------|
| **效能目標** | 目標效能水準 | p99 < 200ms |
| **效能預算** | 允許的劣化餘裕 | p99 可劣化至 220ms（10%） |
| **預算消耗** | 累積劣化百分比 | 本季已消耗 6% |
| **預算耗盡** | 觸發凍結非必要變更 | 剩餘 < 2% 時凍結 |

---

## 遷移非功能性對等（XSPEC-286）

> 屬於 [XSPEC-284](https://github.com/AsiaOstrich/universal-dev-standards) 9 軸遷移完整性矩陣的**軸⑥（非功能）**。涵蓋舊系統重構/重寫時「功能對了、資料對了，但**跑起來不一樣**」這一類遺漏。本節在上述通用基線/漂移機制之上**新增遷移專屬**的 before/after 語義，**不取代**通用效能框架。

### 為何是真缺口

上述通用基線管理回答的是「**這個版本**相較**它自己**先前的基線是否回歸」，**不**回答「**新**系統是否與它取代的**legacy**對等」。重寫時（如 PHP 單請求 → .NET 共享狀態多執行緒），legacy 的延遲/吞吐/隔離特性多為**隱性、未文件化**，使 per-request 功能對等與 behavior-snapshot 對等都通過，系統卻悄悄跑得更慢、耗盡更小的連線池、或丟失某個鎖語義。

### 差分神諭，非絕對門檻

遷移對等以 **legacy 為基線** + **宣告容差**，而非上述表格的絕對目標。legacy 量測到的行為就是 oracle，「回歸不超過宣告容差」即 pass。讓分歧自報，而非靠人記得列舉每條熱路徑。

### 步驟 1 — 機械化擷取非功能基線（R3）

legacy 非功能特性多為隱性。從 legacy artifact **機械化**推導基線（不靠人腦回憶）：

| 來源 | 推導出的基線項 |
|------|---------------|
| 關鍵路由 / controller | 各關鍵路徑 p50 / p95 / p99 延遲 |
| 熱點查詢 / 慢查詢 log | 每查詢延遲、掃描列數 |
| 背景作業 / cron | 作業時長、吞吐（records/min） |
| 連線池設定 | min/max 連線數、idle/connection timeout |
| 逾時 / rate-limit 設定 | 每端點逾時、requests/min、burst |
| 交易設定 | 隔離級別（READ COMMITTED / REPEATABLE READ / SERIALIZABLE） |

擷取的集合**同時**是回歸 gate 的比較基線**與**資源/限制 parity（步驟 4）的待驗清單。

### 步驟 2 — 效能回歸差分 gate（R1）

對每條基線路徑，量測新系統對應路徑，與 **legacy 基線**在宣告容差內比較。

| 指標 | 預設遷移容差 | block 條件 |
|------|-------------|-----------|
| p50 延遲 | ≤ +10%（vs legacy） | > +10% |
| p95 延遲 | ≤ +15%（vs legacy） | > +15% |
| p99 延遲 | ≤ +20%（vs legacy） | > +20% |
| 吞吐 | ≤ -10%（vs legacy） | > -10% 下降 |

容差**每路徑可配**（批次作業與互動端點不同）。**shadow** 起手（只量測不 block）以收樣校準每路徑容差，再升為 blocking。

**Gate 時機**：pre-UAT（簽核前抓回歸）**與** post-cutover（抓只在真實生產負載下浮現的回歸）。

### 步驟 3 — 並發隔離驗證（R2）

同一資源（同筆記錄 / 同帳戶餘額 / 同序號）可能被多並發操作存取。legacy 的鎖 / 交易隔離 / 順序保證屬**隱性行為**，重寫常被改變——而**功能測試與 behavior-snapshot 對等都抓不到**（per-request 對等 ≠ 並發對等，與「per-request ≠ data-at-rest」同源盲區）。

**方法**：以併發壓力觸發 race，斷言**領域不變量**而非逐一檢查輸出。

| 不變量類別 | 範例斷言 |
|-----------|---------|
| 守恆 | N 次並發轉帳後 `SUM(balance)` 不變 |
| 唯一性 | 並發配號下無重複序號 |
| 無遺失更新 | 已 commit 的寫入不被靜默覆寫 |
| 順序 | 並發下事件依保證順序套用 |

偵測到**隔離降級**（如 legacy SERIALIZABLE → 新 READ COMMITTED、或移除列鎖）即 block。不變量由領域定義；並發案例與狀態轉移/時序不變量重疊時，**狀態機/時序由 XSPEC-287（軸⑧）負責**，並發競態由本節（軸⑥）負責——見 XSPEC-287 §邊界。

**Gate 時機**：pre-UAT。

### 步驟 4 — 資源 / 限制 parity（R4）

驗證 legacy 資源限制不被重寫**無意**改變（逾時從 30s 悄悄降到 5s 會讓長作業失敗；更小的連線池會串行化流量）。納入非功能對帳清單：

- [ ] 請求 / 操作**逾時**與 legacy 一致（或變更已宣告）
- [ ] **Rate limit**（requests/min、burst）與 legacy 一致
- [ ] **連線池** min/max 與 idle/connection timeout 與 legacy 一致
- [ ] **批次大小**與 legacy 一致
- [ ] **交易隔離級別**與 legacy 一致（與步驟 3 交叉檢查）

每項要嘛匹配、要嘛有**宣告且具理由**的差異。未宣告的差異即已知回歸風險，block cutover。

### 完整性宣告（矩陣對齊）

當本節宣告三件事——**清單來源**（步驟 1 機械化基線）、**oracle**（步驟 2 回歸差分 + 步驟 3 不變量斷言）、**gate 時機**（pre-UAT + post-cutover）——即滿足遷移完整性矩陣軸⑥。複用通用基線/漂移與 `observability-assistant` 量測機制——本節只新增遷移 before/after 與並發隔離語義，不重造通用效能框架。

---

## 相關標準

- [部署標準](deployment-standards.md)
- [安全標準](security-standards.md)
- [測試標準](testing-standards.md)
- [需求工程](requirement-engineering.md) - NFR 文件
- [日誌標準](logging-standards.md) - 效能日誌
- [行為快照](behavior-snapshot.md) - 功能對等 oracle（與遷移非功能對等互補）
- [完整覆蓋測試](full-coverage-testing.md) - 並發維度交叉引用
