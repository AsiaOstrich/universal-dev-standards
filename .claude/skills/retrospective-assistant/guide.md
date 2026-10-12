---
source: ../../../../skills/retrospective-assistant/guide.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-12
source_hash: 7911a20c3dc1
status: current
scope: universal
description: |
  引導結構化團隊回顧的指南。
  Use when: 詳細的回顧引導、技巧深入解析、行動項目追蹤。
  Keywords: retrospective, retro, sprint, release, facilitation, action items, 回顧, 引導.
---

# 回顧助手指南

> **語言**: [English](../../../../skills/retrospective-assistant/guide.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-03-26
**適用範圍**: 所有軟體團隊
**範疇**: universal
**類型**: 有核心標準支撐的 Skill（core: retrospective-standards.md）

---

## 目的

不反思的團隊不會進步。沒有結構化的回顧，問題會持續存在、挫折感不斷累積，同樣的錯誤一再重演。一場運作良好的回顧能將抱怨轉化為行動，並建立持續改善的文化。

本 Skill 將回顧整合進 UDS 工作流程：

```
/incident (reactive) ←→ /retrospective (proactive) ←→ /metrics (data)
```

---

## 詳細工作流程

### 階段 1：PREPARE — 收集資料

在會議開始前，先收集客觀資料作為討論的基礎。

**Sprint 回顧：**

```bash
# Recent commits since last retro
git log --oneline --since="2 weeks ago"

# PRs merged
gh pr list --state merged --search "merged:>2026-03-12"

# Open issues/bugs
gh issue list --label bug --state open
```

**Release 回顧：**

另外收集：
- 發布說明／變更日誌
- 部署指標（成功率、回滾次數）
- 測試覆蓋率變化
- 客戶回饋／客服工單

---

### 階段 2：GATHER — 蒐集觀點

使用結構化的技巧，確保每個人的聲音都被聽見。

**引導技巧：**

1. **先默寫**（5 分鐘）— 討論前每個人先寫下自己的想法。這能避免定錨效應，並確保內向的成員也能貢獻。
2. **輪流分享** — 每人一次分享一個項目，輪流進行直到所有項目都分享完。
3. **不打斷** — 完整聆聽後再回應。
4. **時間盒** — 為每個環節設定計時器。

#### 技巧：Start-Stop-Continue（詳細）

| 階段 | 時長 | 提示 |
|------|------|------|
| 默寫 | 5 分鐘 | 「每個類別寫 2-3 個項目」 |
| 分享 Start | 5 分鐘 | 「我們應該採用哪些新做法？」 |
| 分享 Stop | 5 分鐘 | 「哪些做法正在傷害我們？」 |
| 分享 Continue | 5 分鐘 | 「哪些做法運作良好、應該保留？」 |
| 討論 | 10 分鐘 | 「哪些項目得票最多？」 |
| 行動項目 | 5 分鐘 | 「誰負責什麼、何時完成？」 |

#### 技巧：Starfish（詳細）

比 SSC 更細緻。當團隊需要更細的粒度時使用。

```
        More of
          │
 Start ───┼─── Keep
          │
 Stop ────┼─── Less of
```

- **More of（多做）**：正在做但應該增加的事
- **Keep（保持）**：運作完美的事——不要改變
- **Less of（少做）**：做得太多的事
- **Start（開始）**：要採用的全新做法
- **Stop（停止）**：要完全消除的事

#### 技巧：4Ls（詳細）

聚焦情緒。最適合用於團隊士氣與心理安全感。

- **Liked（喜歡）**：「這個 Sprint 你喜歡什麼？」（正面能量）
- **Learned（學到）**：「你獲得了什麼新知識？」（成長）
- **Lacked（缺乏）**：「缺少或不足的是什麼？」（缺口）
- **Longed for（渴望）**：「你希望有什麼不同？」（期望）

#### 技巧：Sailboat（詳細）

視覺化隱喻。在白板上畫出：

```
                    🏝️ Island (Goal)
                   /
    💨 Wind ──── ⛵ ──── 🪨 Rocks (Risks)
   (Strengths)    |
                  ⚓ Anchor (Impediments)
```

---

### 階段 3：ANALYZE — 找出模式

蒐集完畢後，將相關項目歸納成主題：

1. **親和圖（Affinity mapping）** — 將相似項目聚在一起
2. **點數投票（Dot voting）** — 每人有 3 票用來排定優先順序
3. **找出根本原因** — 針對得票最高的項目，追問「為什麼？」以深入挖掘

---

### 階段 4：DECIDE — 建立行動項目

將排名前 1-3 的主題轉化為具體的行動項目。

**SMART 格式：**
- **S**pecific（具體）— 清楚、無歧義的描述
- **M**easurable（可衡量）— 我們如何知道已完成？
- **A**ssignable（可指派）— 單一負責人，而不是「團隊」
- **R**ealistic（務實）— 可在一個迭代內達成
- **T**ime-bound（有時限）— 有到期日

**範例：**

| # | 行動 | 負責人 | 到期日 | 指標 |
|---|------|--------|--------|------|
| 1 | 為 lint 新增 pre-commit hook | Alice | 2026-04-05 | CI 中零 lint 錯誤 |
| 2 | 以結對程式設計協助新人上手 | Bob | 2026-04-12 | 新進開發者第 1 週即交付 PR |
| 3 | 將 PR 審查時間縮短到 < 24h | Carol | 2026-04-12 | 平均審查時間指標 |

---

### 階段 5：TRACK — 持續追蹤

這是大多數團隊失敗的地方。沒有追蹤，回顧就會淪為抱怨大會。

**每次回顧開始時：**

1. 調出上一次回顧的行動項目
2. 逐項檢視：已完成？進行中？受阻？
3. 慶祝已完成的項目
4. 重新評估停滯的項目（開啟超過 2 個週期）

---

## Release 回顧：額外區段

Release 回顧包含 Sprint 回顧的所有內容，另外加上：

### 指標比較

```markdown
## Metrics Summary
| Metric | This Release | Previous | Trend | Target |
|--------|-------------|----------|-------|--------|
| Stories delivered | 24 | 18 | ↑ +33% | 20 |
| Bugs found in QA | 3 | 7 | ↓ -57% | < 5 |
| Test coverage | 87% | 84% | ↑ +3% | 85% |
| Avg PR review time | 18h | 32h | ↓ -44% | < 24h |
| Deployment success | 100% | 90% | ↑ | 100% |
```

### 發布目標評估

```markdown
## Release Goals
| Goal | Status | Notes |
|------|--------|-------|
| Ship user dashboard v2 | ✅ Done | Delivered on time |
| Reduce API latency to < 200ms | ⚠️ Partial | P95 at 180ms, P99 at 350ms |
| Zero critical bugs at launch | ✅ Done | Clean launch |
```

---

## 常見錯誤

| 錯誤 | 影響 | 修正 |
|------|------|------|
| 「太忙」就跳過回顧 | 問題持續累積 | 視為不可協商的固定儀式 |
| 只討論負面事項 | 團隊士氣下降 | 一定要包含「哪些做得好」 |
| 行動項目沒有負責人 | 什麼都沒完成 | 每個項目都需要具名負責人 |
| 沒有資料，只有感受 | 討論原地打轉 | 從指標開始 |
| 每次都用同一種技巧 | 回顧疲乏 | 輪換技巧 |

---

## 常見問題

**Q：這和 `/incident` 事後檢討有什麼不同？**
A：`/incident` 是被動的（由服務中斷／錯誤觸發）。`/retrospective` 是主動的（在迭代／發布邊界排程進行）。觸發條件不同、範圍不同，兩者是互補的實踐。

**Q：多久應該做一次回顧？**
A：每個 Sprint／迭代。不使用 Sprint 的團隊，至少每月一次。Release 回顧則在每次發布後進行。

**Q：如果團隊太小（1-2 人）怎麼辦？**
A：個人回顧仍然有價值。使用相同的範本，但作為個人反思練習。AI 助手可以擔任「思考夥伴」。

---

## 參考

- 核心規範：[retrospective-standards.md](../../../../core/retrospective-standards.md)
- 技能定義：[SKILL.md](./SKILL.md)
