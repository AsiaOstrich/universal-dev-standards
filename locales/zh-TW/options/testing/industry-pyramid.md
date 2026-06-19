---
source: options/testing/industry-pyramid.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---
# 業界測試金字塔

> **語言**: [English](../../../../options/testing/industry-pyramid.md) | 繁體中文

**上層標準**: [測試完整性](../../core/test-completeness-dimensions.md)

---

## 概觀

業界測試金字塔是一套務實的 4 層測試模型，廣為敏捷與 DevOps 團隊採用。它強調透過大量的 unit test 取得快速回饋、適量的 integration test、用於子系統驗證的 system test，以及最少量的端對端測試。

## 最適用於

- 敏捷／Scrum 開發團隊
- 以 CI/CD 為核心的環境
- 中小型專案
- DevOps 實務
- 快速迭代循環

## 金字塔

```
    ┌─────────┐
    │   E2E   │  ←  3% (Slow, expensive)
    ├─────────┤
    │   ST    │  ←  7% (Medium speed)
    ├─────────┤
    │   IT    │  ← 20% (Fast)
    ├─────────┤
    │   UT    │  ← 70% (Very fast, many)
    └─────────┘
```

**目標比例：** 70/20/7/3（UT/IT/ST/E2E）

**注意：** 此為 Mike Cohn 的經驗性建議，並非強制標準。

**理由：**
- 較多 unit test = 更快的回饋
- 較少 E2E test = 較低的維護成本
- integration test 能捕捉介面問題
- system test 在 stub 外部相依的情況下驗證子系統行為

## 測試層級

### 單元測試（UT）- 70%

| 面向 | 細節 |
|--------|---------|
| **定義** | 針對個別函式、方法或類別的隔離測試 |
| **範圍** | 單一函式／方法／類別 |
| **速度** | 每個測試 < 100ms |
| **相依** | 全部 mock |

**特性：**
- 執行快速
- 結果具決定性
- 無 I/O 操作
- 測試單一行為單元

### 整合測試（IT）- 20%

| 面向 | 細節 |
|--------|---------|
| **定義** | 針對元件互動與資料流的測試 |
| **範圍** | 多個元件相互作用 |
| **速度** | 每個測試 < 1 秒 |
| **相依** | 真實與 mock 混合 |

**特性：**
- 測試真實的整合
- 可能使用容器（Testcontainers）
- 驗證資料流

### 系統測試（ST）- 7%

| 面向 | 細節 |
|--------|---------|
| **定義** | 在 stub 外部相依的情況下測試完整子系統 |
| **範圍** | 完整子系統驗證 |
| **速度** | 每個測試 < 10 秒 |
| **相依** | 真實內部服務、stub 外部 API |

**特性：**
- 端對端驗證子系統行為
- stub 外部相依
- 在 SIT 環境中測試

### 端對端測試（E2E）- 3%

| 面向 | 細節 |
|--------|---------|
| **定義** | 跨整個系統測試完整使用者工作流程 |
| **範圍** | 從使用者視角的完整使用者流程 |
| **速度** | 每個測試 30 秒至數分鐘 |
| **相依** | 全部真實 |

**特性：**
- 模擬真實使用者行為
- 僅測試關鍵路徑
- 最高的維護成本

## 覆蓋率目標

| 指標 | 最低 | 建議 |
|--------|---------|-------------|
| 行覆蓋率（Line Coverage） | 70% | 85% |
| 分支覆蓋率（Branch Coverage） | 60% | 80% |
| 函式覆蓋率（Function Coverage） | 80% | 90% |

## 各層級工具

### 單元測試

| 語言 | 工具 |
|----------|-------|
| JavaScript | Jest, Vitest, Mocha |
| Python | pytest, unittest |
| Java | JUnit, TestNG |
| C# | xUnit, NUnit, MSTest |
| Go | testing package, testify |

### 整合測試

| 語言 | 工具 |
|----------|-------|
| JavaScript | Supertest, Testcontainers |
| Python | pytest, Testcontainers |
| Java | Spring Boot Test, Testcontainers |
| C# | WebApplicationFactory, Testcontainers |

### E2E 測試

| 語言 | 工具 |
|----------|-------|
| JavaScript | Playwright, Cypress, Puppeteer |
| Python | Playwright, Selenium |
| Java | Selenium, Playwright |

## 何時選擇業界金字塔

**選擇時機：**
- 實踐敏捷／Scrum 方法論
- CI/CD 管線至關重要
- 快速回饋為優先
- 團隊規模小且跨職能
- 期望最少的文件負擔

**避免時機：**
- 需要正式 QA 認證
- 企業合規需求
- 專責 QA 團隊偏好 ISTQB
- 需要稽核文件

## 與 ISTQB 的比較

| 業界層級 | ISTQB 對應 | 注意 |
|----------------|------------------|------|
| 單元測試（UT） | Component Testing | 概念相同 |
| 整合測試（IT） | Integration Testing | 概念相同 |
| 系統測試（ST） | System Testing | 概念相同 |
| E2E 測試 | Acceptance Testing | 業界 E2E ≈ ISTQB Acceptance |

## 規則

| 規則 | 描述 | 優先級 |
|------|-------------|----------|
| 遵循金字塔比例 | UT/IT/ST/E2E 目標 70/20/7/3 比例（經驗性，非強制） | Required |
| 在最低層級測試 | 在能提供信心的最低層級撰寫測試 | Recommended |
| 邊界情況避免用 E2E | 邊界情況使用 unit test，而非 E2E | Recommended |
| 邊界用整合測試 | 使用 integration test 驗證介面合約 | Recommended |

## 相關選項

- [ISTQB 框架](./istqb-framework.md) - 正式的 4 層測試框架
- [單元測試](./unit-testing.md) - 詳細的單元測試實務
- [整合測試](./integration-testing.md) - 整合測試實務
- [E2E 測試](./e2e-testing.md) - 端對端測試實務

---

## 參考資料

- [Martin Fowler's Testing Pyramid](https://martinfowler.com/bliki/TestPyramid.html)
- [Google Testing Blog](https://testing.googleblog.com)

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權釋出。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
