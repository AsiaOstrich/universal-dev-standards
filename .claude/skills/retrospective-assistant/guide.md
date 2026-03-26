---
description: |
  引導結構化團隊回顧的詳細指南。
  使用時機：需要完整了解回顧流程、技法細節、行動項目追蹤。
  關鍵字：retrospective, retro, sprint, release, 回顧, 引導, 持續改善。
source: ../../../../skills/retrospective-assistant/guide.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-26
status: current
---

# 回顧助手指南

> **語言**: [English](../../../../skills/retrospective-assistant/guide.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-03-26
**適用範圍**: 所有軟體團隊
**範疇**: universal

---

## 目的

不反思的團隊不會進步。沒有結構化的回顧，問題會持續存在，挫折會累積，同樣的錯誤會重複。良好的回顧將抱怨轉化為行動，建立持續改善的文化。

---

## 引導技巧

### 沉默書寫優先（5 分鐘）

討論前先讓每個人寫下想法。這可以：
- 防止錨定效應
- 確保內向者也能貢獻
- 產生更多元的觀點

### 圓桌分享

每人每次分享一項，輪流直到所有項目都被分享。

### 點數投票

每人 3 票，投給最重要的項目。票數最高的成為行動項目。

---

## SMART 行動項目

| 字母 | 意義 | 範例 |
|------|------|------|
| **S** | 具體 (Specific) | 「新增 pre-commit hook 執行 lint」 |
| **M** | 可衡量 (Measurable) | 「CI 中零 lint 錯誤」 |
| **A** | 可分配 (Assignable) | 「Alice 負責」 |
| **R** | 務實 (Realistic) | 「一個迭代內可完成」 |
| **T** | 有期限 (Time-bound) | 「2026-04-05 前完成」 |

---

## 常見問題

**Q：和 `/incident` 事後檢討有什麼不同？**
A：`/incident` 是被動的（事故觸發）。`/retrospective` 是主動的（定期排程）。不同觸發、不同範圍、互補實踐。

**Q：多久做一次回顧？**
A：每個 Sprint/迭代。不使用 Sprint 的團隊至少每月一次。Release 回顧在每次發布後。

---

## 參考

- 核心規範：[retrospective-standards.md](../../../../core/retrospective-standards.md)
- 技能定義：[SKILL.md](./SKILL.md)
