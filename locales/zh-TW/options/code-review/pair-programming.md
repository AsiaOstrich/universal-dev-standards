---
source: options/code-review/pair-programming.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# Pair Programming

> **語言**: [English](../../../../options/code-review/pair-programming.md) | 繁體中文

**上層標準**: [Code Review Checklist](../../core/code-review-checklist.md)

---

## 概觀

Pair programming 是一種即時協作的程式碼審查方式，由兩位開發者在同一台工作站上共同作業。一人負責撰寫程式碼（Driver），另一人負責審查與引導（Navigator）。此方法能提供即時回饋，並促進知識傳遞。

## 最適用於

- 需要深入思考的複雜功能
- 知識傳遞與新人上手
- 關鍵的程式碼路徑
- 連線品質良好的同地或遠端團隊
- 資淺開發者的指導

## 角色

### Driver
**撰寫程式碼**
- 實作解決方案
- 說明思考過程
- 接納 navigator 的建議
- 專注於戰術層面的實作

### Navigator
**審查與引導**
- 即時審查程式碼
- 思考更全面的大方向
- 提出改進建議
- 及早抓出錯誤
- 考量邊界情況

## 配對模式

### Ping Pong

最適合 TDD 工作流程。

1. Driver 撰寫一個失敗的測試
2. 交換角色
3. 新的 driver 讓測試通過
4. 新的 driver 撰寫下一個失敗的測試
5. 交換並重複

### Strong-Style

最適合知識傳遞。

**規則**：「想法要從你的腦袋進到電腦裡，必須經過別人的雙手」

- Navigator 必須將所有想法說出來
- Driver 只輸入 navigator 口述的內容
- 確保完整的知識傳遞

### Driver-Navigator（傳統）

最常見的模式。

1. Driver 專注於戰術層面的編碼
2. Navigator 進行策略性思考
3. 每 25–30 分鐘交換一次
4. 雙方都貢獻想法

## 會議準則

### 準備
- 為本次會議定義明確目標
- 設置共用的開發環境
- 對配對模式達成共識
- 排除干擾

### 會議進行中
- 每 45–60 分鐘休息一次
- 定期交換角色（25–30 分鐘）
- 持續溝通
- 保持投入與專注

### 會議結束後
- 簡短的回顧
- 記錄所做的決策
- Commit 並 push 程式碼
- 分享學到的心得

## 工具

### 遠端配對
| 工具 | 平台 | 功能 |
|------|------|------|
| VS Code Live Share | VS Code | 即時編輯、終端機 |
| JetBrains Code With Me | JetBrains IDEs | 完整 IDE 共享 |
| Tuple | macOS | 低延遲、繪圖 |
| Screen sharing | 任何平台 | 備援選項 |

### 本地配對
- 一台電腦搭配兩組鍵盤／滑鼠
- 大型螢幕或投影機
- 舒適的座位安排

## 規則

| 規則 | 描述 | 優先級 |
|------|------|--------|
| 定期交換 | 每 25–30 分鐘交換角色 | Required |
| 口語溝通 | 提出建議前先說明理由 | Required |
| 尊重 driver | 用口語引導，不要搶鍵盤 | Required |
| 適時休息 | 每 45–60 分鐘休息一次 | Recommended |
| 保持投入 | 雙方都應保持主動 | Required |

## 與 PR Review 的比較

| 面向 | Pair Programming | PR Review |
|------|------------------|-----------|
| 時機 | 即時 | 非同步 |
| 回饋 | 立即 | 延遲 |
| 知識分享 | 高 | 中 |
| 文件化 | 較低 | 較高（PR 留言） |
| 可擴展性 | 受限 | 高 |
| 遠端友善度 | 具挑戰性 | 容易 |
| 成本 | 較高（2 人） | 較低 |

## 何時使用

### 適合的情境
- 複雜的演算法
- 關鍵的安全性程式碼
- 新團隊成員上手
- 探索不熟悉的程式庫
- 設計決策

### 不適合的情境
- 簡單、例行的任務
- 個人研究／探索
- 行政性的程式碼變更
- 任一方感到疲憊時

## 相關選項

- [PR Review](./pr-review.md) - 非同步程式碼審查
- [Automated Review](./automated-review.md) - 工具輔助審查

---

## 參考資料

- [Pair Programming Illuminated](https://www.amazon.com/Pair-Programming-Illuminated-Laurie-Williams/dp/0201745763)
- [Martin Fowler on Pair Programming](https://martinfowler.com/articles/on-pair-programming.html)

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 釋出。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
