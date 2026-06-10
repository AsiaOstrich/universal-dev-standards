---
source: ../../../core/deployment-standards.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-06-10
source_hash: ede6223c8aba
status: current
---

# 部署標準

> **語言**: [English](../../../core/deployment-standards.md) | 繁體中文

**版本**: 1.1.0
**最後更新**: 2026-05-26
**適用性**: 所有具有部署管線的軟體專案
**範圍**: 通用 (Universal)
**業界標準**: Twelve-Factor App、Google SRE — Release Engineering、DORA State of DevOps
**參考**: [12factor.net](https://12factor.net/)、[sre.google](https://sre.google/books/)、[dora.dev](https://dora.dev/)

---

## 目的

本標準定義安全部署軟體到正式環境的指南，涵蓋部署策略、Feature Flags、回滾程序、環境一致性和部署效能指標。

**參考標準**：
- [The Twelve-Factor App](https://12factor.net/) — Factor X：開發/正式一致性
- [Google SRE Book — Release Engineering](https://sre.google/sre-book/release-engineering/)
- [Martin Fowler — Feature Toggles](https://martinfowler.com/articles/feature-toggles.html)
- [DORA State of DevOps Report](https://dora.dev/)

---

## 核心原則

| 原則 | 說明 |
|------|------|
| **部署 ≠ 發布** | 部署程式碼到正式環境和將其暴露給使用者是分開的動作；使用 Feature Flags 控制曝光 |
| **漸進式曝光** | 將變更推送給越來越大的受眾：內部 → 金絲雀 → 百分比 → 全面上線 |
| **快速回滾** | 每次部署必須有經過測試的回滾路徑，在 5 分鐘內完成 |
| **環境一致性** | 保持開發、暫存和正式環境盡可能相似（Twelve-Factor App Factor X） |
| **自動化一切** | 手動部署步驟容易出錯；自動化建置、測試、部署和回滾 |
| **監控一切** | 部署時必須具備可觀測性；無法測量就無法安全部署 |

---

## 部署策略選擇

| 策略 | 使用場景 | 回滾速度 | 資源成本 | 複雜度 |
|------|----------|----------|----------|--------|
| **滾動更新 (Rolling)** | 無狀態服務、標準更新 | 中（分鐘） | 低（無額外基礎設施） | 低 |
| **藍綠部署 (Blue-Green)** | 零停機需求、相容資料庫變更 | 快（秒，DNS/LB 切換） | 高（2× 基礎設施） | 中 |
| **金絲雀部署 (Canary)** | 高風險變更、大型使用者群 | 快（重導流量） | 中（部分額外基礎設施） | 高 |
| **Feature Flag** | 解耦部署與發布、A/B 測試 | 即時（關閉開關） | 低（程式碼層級） | 中 |

### 決策指南

```
是否需要零停機時間？
├── 是 → 變更是否高風險或大規模？
│         ├── 是 → Canary
│         └── 否 → Blue-Green
└── 否 → 變更是否在 Feature Flag 後面？
          ├── 是 → Feature Flag（任何時候都可部署）
          └── 否 → Rolling
```

### 策略組合

策略並非互斥，常見組合如下：
- **Canary + Feature Flag**：部署 canary 並停用 flag，先對 canary 群組啟用 flag
- **Blue-Green + Feature Flag**：切換流量至 green 環境，再逐步啟用 flags
- **Rolling + Feature Flag**：推送程式碼，再分別控制功能曝光

---

## Feature Flags 生命週期

### Flag 類型

| 類型 | 目的 | 存活期 | 範例 |
|------|------|--------|------|
| **Release** | 控制功能推出 | 數天至數週 | `enable_new_checkout` |
| **Experiment** | A/B 測試 | 數週至數月 | `experiment_pricing_v2` |
| **Ops** | 操作控制（緊急關閉） | 永久 | `enable_cache_layer` |
| **Permission** | 使用者授權 | 永久 | `feature_premium_export` |

### 生命週期階段

| 階段 | 動作 | 目標期限 |
|------|------|----------|
| **1. 建立** | 定義 flag、設定預設值（關閉）、記錄目的與負責人 | 第 0 天 |
| **2. 啟用** | 漸進式推出：1% → 10% → 50% → 100% | 數天至數週 |
| **3. 監控** | 追蹤指標、錯誤率、使用者回饋 | 100% 時持續 1-2 週 |
| **4. 清理** | 從程式碼移除 flag、刪除設定、更新測試 | 全面推出後 1 個 sprint 內 |

### 技術債規則

| 規則 | 執行方式 |
|------|----------|
| Release flag 必須在全面推出後 **30 天內**移除 | 自動提醒／工單 |
| Experiment flag 必須在 **90 天內**移除 | 季度審計 |
| 每個 flag 必須有**負責人**和**到期日** | Flag 建立清單 |
| 每個服務的 flag 數量不應超過 **20** | 儀表板告警 |

---

## 回滾策略

### 自動觸發條件

| 指標 | 警告閾值 | 自動回滾閾值 | 時間窗口 |
|------|----------|-------------|----------|
| **錯誤率** | > 1% | > 5% | 5 分鐘 |
| **p95 延遲** | > 2× 基線 | > 3× 基線 | 5 分鐘 |
| **健康檢查** | 1 次失敗 | 3 次連續失敗 | 立即 |
| **CPU 使用率** | > 80% | > 95% | 10 分鐘 |
| **記憶體使用率** | > 85% | > 95% | 10 分鐘 |

### 手動觸發情境

- 客戶回報影響核心功能的嚴重 Bug
- 部署後發現安全漏洞
- 偵測到資料損毀或不一致
- 發現法規遵循違規

### 嚴重性決策矩陣

| 嚴重性 | 影響 | 動作 | 時限 |
|--------|------|------|------|
| **P1 嚴重** | 服務中斷、資料遺失 | 立即回滾，全員動員 | < 5 分鐘 |
| **P2 高** | 主要功能損壞、顯著使用者影響 | 在時間窗口內回滾 | < 15 分鐘 |
| **P3 中** | 次要功能損壞、有繞道方案 | 決定：回滾或熱修復 | < 1 小時 |
| **P4 低** | 外觀問題、邊緣情境 | 在下一個 release 修復 | 下次部署 |

### 回滾方式

| 方式 | 使用時機 | 速度 |
|------|----------|------|
| **還原部署** | 應用程式程式碼問題、無資料庫變更 | < 5 分鐘 |
| **Feature Flag 切換** | Flag 控制的功能出現問題 | 立即 |
| **資料庫回滾** | Schema 遷移失敗（若可逆） | 5-30 分鐘 |

---

## 環境一致性

### 三大落差（Twelve-Factor App）

| 落差 | 反模式 | 最佳實踐 |
|------|--------|----------|
| **時間落差** | 開發與部署相隔數週 | 開發後數小時內部署 |
| **人員落差** | 開發者寫程式，Ops 部署 | 撰寫程式的開發者參與部署 |
| **工具落差** | 不同環境使用不同技術棧 | 所有環境使用相同支援服務 |

### 環境一致性清單

#### 基礎設施
- [ ] 所有環境使用相同 OS 系列與版本
- [ ] 相同容器執行環境與 Orchestrator 版本
- [ ] 相同網路拓樸（負載平衡器、服務網格）
- [ ] 相同資源配置比例（暫存 = 正式 × 縮放因子）

#### 應用程式
- [ ] 所有環境部署相同應用程式版本
- [ ] 相同依賴版本（已提交 lock 檔案）
- [ ] 相同執行環境版本（Node.js、Python、JVM 等）
- [ ] 相同建置產物（建置一次，部署各處）

#### 資料
- [ ] 相同資料庫引擎與版本
- [ ] 相同 Schema 遷移工具
- [ ] 暫存環境使用實際資料量（匿名化的正式資料）
- [ ] 相同訊息佇列與快取實作

#### 設定
- [ ] 環境特定值透過環境變數管理
- [ ] 無環境特定程式碼路徑（不寫 `if (env === 'production')`）
- [ ] 跨環境使用相同 secret 管理工具
- [ ] 設定差異已記錄並最小化

---

## 部署前清單

### 1. 程式碼品質
- [ ] 所有測試通過（單元、整合、E2E）
- [ ] 程式碼審查已核准
- [ ] 無嚴重靜態分析警告
- [ ] 測試覆蓋率未降低

### 2. 安全性
- [ ] 依賴漏洞掃描通過
- [ ] 程式碼或設定檔中無 secrets
- [ ] 安全標頭已設定
- [ ] 驗證／授權變更已審查

### 3. 效能
- [ ] 受影響端點已完成負載測試
- [ ] 未偵測到效能回歸
- [ ] 資料庫查詢效能已驗證
- [ ] 快取失效策略已確認

### 4. 資料庫
- [ ] 遷移腳本在暫存環境測試過
- [ ] 可用並測試過的回滾遷移
- [ ] 無破壞性 Schema 變更（除非有向後相容性）
- [ ] 資料遷移已用正式規模資料量驗證

### 5. 設定與依賴
- [ ] 環境變數已記錄並設定
- [ ] Feature Flag 已設定正確預設值
- [ ] 第三方服務依賴已驗證
- [ ] API 版本相容性已確認

### 6. 部署準備
- [ ] 部署 Runbook 已更新
- [ ] 回滾程序已記錄並測試
- [ ] 監控儀表板已準備
- [ ] 告警閾值已設定

### 7. 溝通
- [ ] 利害關係人已通知部署時間窗口
- [ ] On-call 工程師已確認並待命
- [ ] 客戶支援已了解變更內容
- [ ] 狀態頁面已準備（若為公開服務）

---

## 防禦性部署順序

當部署腳本替換運行中的安裝（常見於 Windows IIS、SystemD 管理服務或任何「停止 → 替換 → 啟動」工作流程的破壞性更新模式），破壞性步驟相對於驗證的順序至關重要。

### 禁止的順序

```
1. 停止服務
2. 解壓縮新套件         ← 格式不符時可能靜默空操作
3. 刪除舊安裝           ← 無條件執行——摧毀運行中的安裝
4. 複製新安裝           ← 拋出例外（來源不存在）
5. 啟動服務             ← 無法啟動（Binary 已消失）
```

若步驟 2 靜默失敗（損毀的 archive、格式錯誤、磁碟空間不足、權限問題），步驟 3 仍然執行並**摧毀運行中的安裝**，除備份外無法恢復。備份有助於完整回滾，但**無法防止停機**——服務已經中斷。

### 必要順序——解壓縮、驗證、再刪除

破壞性部署順序**必須**如下：

```
1. 停止服務
2. 解壓縮新套件 → 暫存區      （不直接覆蓋運行中的安裝）
3. ✅ 驗證暫存區包含預期的產物
   ↑ 若驗證失敗：中止，不要動運行中的安裝
4. 備份運行中的安裝            （或在稍早完成——兩者皆做更好）
5. 刪除舊安裝（保留日誌 / 執行期資料）
6. 從暫存區複製新安裝
7. 還原保留的設定
8. 啟動服務
9. 健全性檢查（HTTP probe / health endpoint）
```

**步驟 3 的驗證不可省略。** 最低驗證要求是確認新套件中至少一個已知檔案存在於暫存區。若有可用的 manifest，以雜湊值逐一比對預期檔案為較佳做法。

### 驗證程式碼片段

**PowerShell**（Windows IIS 部署）:

```powershell
$staging = "C:\deploy\staging-$(Get-Date -Format yyyyMMddHHmmss)"
Expand-Archive -Path $zipPath -DestinationPath $staging -Force

# 不可省略：驗證暫存區後再動運行中的安裝
if (-not (Test-Path "$staging\api\MyApp.dll")) {
    throw "Expected $staging\api\MyApp.dll not found — archive may be corrupt or wrong format. Aborting deploy. Live install untouched."
}

# 直到此時才動運行中的安裝
Copy-Item "$apiDir" "$backupDir" -Recurse -Force
Get-ChildItem $apiDir -Exclude logs | Remove-Item -Recurse -Force
Copy-Item "$staging\api\*" $apiDir -Recurse
```

**bash**（Linux SystemD 管理服務）:

```bash
set -euo pipefail

STAGING="/srv/deploy/staging-$(date +%Y%m%d%H%M%S)"
mkdir -p "$STAGING"
tar -xzf "$ARCHIVE" -C "$STAGING"

# 不可省略：驗證暫存區後再動運行中的安裝
if [ ! -f "$STAGING/bin/myapp" ]; then
  echo "ERROR: Expected $STAGING/bin/myapp not found. Aborting deploy. Live install untouched." >&2
  exit 1
fi

# 直到此時才動運行中的安裝
systemctl stop myapp
cp -a "$LIVE_DIR" "$BACKUP_DIR"
find "$LIVE_DIR" -mindepth 1 -not -path "$LIVE_DIR/logs*" -delete
cp -a "$STAGING"/* "$LIVE_DIR/"
systemctl start myapp
```

### 涵蓋的失敗模式

| 失敗模式 | 保護機制 |
|---|---|
| Archive 格式錯誤（例如 tar 改名為 `.zip`） | 步驟 3 驗證失敗——運行中安裝不受影響 |
| 部分解壓縮（磁碟空間在解壓縮中途用完） | 步驟 3 驗證失敗——運行中安裝不受影響 |
| Archive 根目錄結構改變（額外的包裝資料夾、缺少關鍵檔案） | 步驟 3 驗證失敗——運行中安裝不受影響 |
| 權限問題（解壓縮步驟有讀取但沒有寫入權限） | 步驟 3 驗證失敗——運行中安裝不受影響 |
| 備份腳本本身失敗 | 步驟 4 後的可選次要檢查 |

### 上游預防

消費端的驗證是最後一道防線。**上游**預防——拒絕在一開始就產生格式錯誤的 archive——由[打包標準 — Archive 格式完整性](packaging-standards.md#archive-格式完整性)涵蓋。兩層合在一起構成縱深防禦；單獨任一層都不足夠。

### 失敗模式參考（真實事故）

一個 Windows IIS 正式部署腳本（2026-05-24）對 tar 改名的 `.zip` archive 執行 `Expand-Archive`（靜默空操作），接著對運行中的 `apiDir` 執行 `Remove-Item -Recurse`，然後從一個不存在的來源執行 `Copy-Item`（因為什麼都沒有被解壓縮）。運行中的安裝被清除，AppPool 停止，正式環境中斷約 3 分鐘，直到完成基於備份的回滾。若在步驟 3 加入驗證（`Test-Path "$staging/api/MyApp.dll"`），部署就會在暫存階段中止，運行中的安裝不受影響。

---

## 部署後清單

### 立即（< 5 分鐘）

- [ ] Health check endpoint 回傳 200
- [ ] 應用程式日誌未顯示錯誤
- [ ] 關鍵業務指標未變（訂單、註冊等）
- [ ] 監控儀表板顯示正常模式

### 短期（< 1 小時）

- [ ] 錯誤率在可接受閾值內（< 0.1%）
- [ ] 回應時間符合 SLA（p95 < 目標值）
- [ ] 客戶支援工單無增加
- [ ] 資料庫效能穩定

### 中期（< 24 小時）

- [ ] 批次任務成功完成
- [ ] 資料一致性已驗證
- [ ] 無記憶體洩漏或資源降級
- [ ] Feature Flag 漸進推出進度正常

### 長期（< 1 週）

- [ ] Feature Flag 清理已排程
- [ ] 部署回顧會議已完成
- [ ] 監控閾值已視需要調整
- [ ] 文件已更新並記錄學習心得

---

## 部署驗證

### 成功標準

部署在觀測視窗內滿足以下**所有**條件時視為成功：

| 條件 | 閾值 | 觀測視窗 |
|------|------|----------|
| **Error rate** | ≤ 部署前 baseline + 0.1% | 5 分鐘 |
| **P99 latency** | ≤ 部署前 baseline × 1.2 | 5 分鐘 |
| **Health check** | 100% 通過率 | 持續 |
| **Smoke tests** | 100% 通過率 | 部署後 2 分鐘內 |

任一條件失敗應觸發自動 rollback 或通知 on-call 工程師。

### 觀測期

| 部署類型 | 最短觀測期 | 關鍵觀測指標 |
|----------|-----------|-------------|
| **Canary** | 每流量階段 15 分鐘 | Error rate、Latency、業務指標 |
| **Blue-Green** | 切換後 5 分鐘 | Health check、Error rate |
| **Rolling** | 整個上線期間 | 每批次 Health check |
| **Feature Flag** | 首次啟用 24 小時 | 業務指標、使用者回饋 |

觀測期間：
- 自動監控必須處於啟用狀態
- 回滾能力必須保持可用
- 不應對相同服務進行額外部署

### Smoke Test 要求

部署後 Smoke Test 必須自動執行，至少涵蓋：

| # | 測試項目 | 預期結果 | 超時 |
|---|----------|----------|------|
| 1 | Health check endpoint 回傳 200 | HTTP 200 + status "healthy" | 5 秒 |
| 2 | 核心 API endpoints 可用（至少 3 條關鍵路徑） | HTTP 2xx | 10 秒/條 |
| 3 | 資料庫連線正常 | 查詢成功執行 | 5 秒 |
| 4 | 外部相依服務可達 | 連線檢查成功 | 10 秒/項 |
| 5 | 總執行時間 | 所有測試完成 | 最長 60 秒 |

Smoke Test 失敗必須阻擋部署並觸發 rollback。

---

## DORA 指標

| 指標 | 菁英水準 | 高水準 | 中水準 | 低水準 |
|------|----------|--------|--------|--------|
| **部署頻率** | 隨需（每天多次） | 每週至每月 | 每月至每半年 | 每半年至每年 |
| **變更前置時間** | < 1 小時 | 1 天至 1 週 | 1 週至 1 個月 | 1 至 6 個月 |
| **變更失敗率** | < 5% | 5-10% | 10-15% | > 15% |
| **平均恢復時間 (MTTR)** | < 1 小時 | < 1 天 | < 1 週 | > 1 週 |

### 追蹤建議

| 指標 | 資料來源 | 工具範例 |
|------|----------|----------|
| **部署頻率** | CI/CD pipeline 事件 | GitHub Actions、GitLab CI、Jenkins |
| **前置時間** | 首次提交 → 正式部署 | Git log + 部署時間戳記 |
| **變更失敗率** | 回滾次數 / 總部署次數 | 事故追蹤 + 部署日誌 |
| **MTTR** | 事故開始 → 解決 | PagerDuty、Opsgenie、事故日誌 |

---

## 相關標準

- [程式碼簽入標準](checkin-standards.md) — 部署前品質關卡
- [測試標準](testing-standards.md) — 部署準備的測試需求
- [安全標準](security-standards.md) — 部署安全清單
- [效能標準](performance-standards.md) — 部署前效能驗證
- [Changelog 標準](changelog-standards.md) — 記錄已部署變更
- [Git 工作流標準](git-workflow.md) — 分支策略與發布流程
- [版本控制標準](versioning.md) — 發布版本號碼

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.1.0 | 2026-05-26 | 新增：防禦性部署順序章節——必要的解壓縮-驗證-再刪除順序、PowerShell + bash 驗證程式碼片段、失敗模式對照表、交叉連結至打包標準 Archive 格式完整性（XSPEC-231 / 關閉 issue #110） |
| 1.0.0 | 2026-02-09 | 初始發行 |

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
