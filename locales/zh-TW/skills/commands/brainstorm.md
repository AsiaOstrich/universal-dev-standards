---
source: ../../../../skills/commands/brainstorm.md
source_version: 4.0.0
source_hash: 3212203924de
translation_version: 4.0.0
last_synced: 2026-06-22
---

---
name: brainstorm
description: "[UDS] 在撰寫規格前進行結構化 AI 輔助腦力激盪"
argument-hint: "[problem or feature idea | 問題或功能構想]"
---

# 腦力激盪助手

> **Language**: [English](../../../../skills/commands/brainstorm.md) | 繁體中文

在撰寫規格前進行結構化發想。透過 persona 集成式腦力激盪，將模糊構想轉化為可執行的功能提案。

## 用法

```bash
/brainstorm [problem or feature idea]
```

## 工作流程

```
PRE-FLIGHT ──► FRAME ──► DIVERGE ──────────► CONVERGE ─────────► OUTPUT
  防錨定        定義問題    persona 集成+透鏡     多評審面板+硬角色反駁   輸出提案
```

| 階段 | 目標 | 關鍵技法（v3）+ BQS 閘（v4） |
|------|------|-------------------------------|
| **PRE-FLIGHT** | 防止 AI 錨定 | 使用者先寫 3 個想法；無類比種子；**BQS 第 0 層意圖（explore/exploit）** |
| **FRAME** | 清楚定義問題 | 5 Whys、HMW、Stakeholder Map；**D1 框架純度** |
| **DIVERGE** | 逼出視角多樣性 | persona 集成 + 多樣性透鏡；**BQS 第 1 層 D1–D4，硬閘隱藏 D5–D8** |
| **CONVERGE** | 降偏誤選擇 | 多評審面板 + Devil's Advocate／Steelman；**BQS 第 2 層 D5–D8 施於 Top 3，D4 判官≠產生者** |
| **OUTPUT** | 可執行的報告 | Brainstorm Report + Seeds + 爭議區 + **第 3 層 Judgment Override** |

> **BQS v1（XSPEC-296）：** v4 在 v3 上疊加四層 × 時間軸品質契約。完整 oracle 與結構規則見 skill：[Brainstorm Assistant Skill](../brainstorm-assistant/SKILL.md#bqs-v1--品質契約)。

## 技法

| 技法 | 適用場景 |
|------|----------|
| **Persona ensemble** | 強制視角多樣性（v3 核心） |
| **Diversity lenses** | 突破顯而易見區（analogical / reversal / morphological） |
| **Multi-critic panel** | 降偏誤評分（v3 核心） |
| **Devil's Advocate + Steelman** | 硬角色反駁 |
| **5 Whys / HMW / SCAMPER / Six Hats** | 經典框定與發散 |

## 範例

```bash
/brainstorm                                          # 啟動互動式工作階段
/brainstorm "user retention"                         # 針對特定主題腦力激盪
/brainstorm --enhanced "user retention"              # 平行 persona 集成（若宿主支援）
/brainstorm --personas "designer,economist,skeptic"  # 自訂 persona
/brainstorm --lens analogical "onboarding"           # 強制類比透鏡
/brainstorm --quick "reduce checkout friction"       # 快速 3 想法模式
```

## 輸出格式

```markdown
# Brainstorm Report: [Topic]

## Problem Statement
[Refined problem from FRAME phase]

## Top 3 Recommendations
1. **[Idea]** — Agg. X.X ✓ Passed rebuttal — Persona: [..] — [Why recommended]

## Diversity Note
[How many distinct personas/lenses the surviving ideas span]

## Next Steps
- [ ] Proceed to `/requirement` with top idea
- [ ] Proceed to `/sdd` if requirements are clear
```

## 後續步驟

腦力激盪後，典型的工作流程為：

1. `/brainstorm` - 結構化發想（本命令）
2. `/requirement` - 撰寫使用者故事和需求
3. `/sdd` - 建立規格文件
4. `/derive-all` 或 `/tdd` - 以測試保護進行實作

## AI 代理行為

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### 進入路由

| 輸入 | AI 動作 |
|------|---------|
| `/brainstorm` | 啟動 PRE-FLIGHT，請使用者先寫 問題＋3 想法＋反向排除 |
| `/brainstorm "topic"` | 以指定主題啟動 PRE-FLIGHT，再進入 FRAME |
| `/brainstorm --personas "a,b,c"` | 以自訂 persona 組進入 DIVERGE |
| `/brainstorm --lens <name>` | 以指定多樣性透鏡為主進入 DIVERGE |
| `/brainstorm --enhanced` | 若宿主支援子代理則平行跑 persona／評審，否則靜默退回 baseline；此模式下 BQS D4 方可 pass |
| `/brainstorm --intent exploit` | 以 exploit 意圖啟動（BQS 第 0 層），D2 低覆蓋不扣分 |

### 互動腳本

#### PRE-FLIGHT Phase
1. 請使用者先寫 問題（一句）＋3 個初始想法＋最不想要的解法類型
2. 拒絕「像 X 但給 Y」種子，改寫為底層問題
3. **BQS 第 0 層**：宣告本次 explore/exploit 配比與賭注類型（未宣告預設偏 explore）

🛑 **STOP**: 收到三項輸入前不生成任何想法（`--skip-preflight` 例外，顯示錨定警告）

#### FRAME Phase
1. 釐清問題陳述（5 Whys 找根因）
2. 重構為 HMW 問題；識別利害關係人
3. **BQS D1 框架純度**：問題不得內嵌特定方案或「像 X 給 Y」，須到根因

🛑 **STOP**: 問題定義後等待使用者確認

#### DIVERGE Phase（BQS 第 1 層 — D1–D4 leading，全程可見）
1. 逐一以預設 persona（領域專家／懷疑者／跨域類比者／成本約束者／使用者代言）思維鏈生成想法
2. **分支隔離**：生成各 persona 時不互相預覽，全部產完才一起呈現
3. 至少套用一個多樣性透鏡（類比／假設反轉／形態矩陣）
4. 以多樣性（覆蓋的 persona／透鏡數，D2/D3）而非數量為繼續門檻
5. **硬序列閘**：D5–D8 在最後一個 persona 產完前**不得揭示或評分**；CONVERGE critic 不得提前呼叫

#### CONVERGE Phase（BQS 第 2 層 — D5–D8 僅施於 Top 3）
1. 以 3 個獨立評審（工程可行性／使用者影響／策略一致）各自評分後聚合
2. 對前 3 名跑硬角色 Devil's Advocate（論證會失敗）+ Steelman；使用者以 (a)修改／(b)反駁／(c)移除 回應。**D4 判官≠產生者**：評審須在獨立 context（`--enhanced`）方可 pass，否則標 `[degraded]` 不得 pass
3. **僅對 Top 3** 套用 D5 接地（外部事實需 file:line／來源、跨級地板；假說免接地）、D6 淨值（解誰問題／真有嗎／不做代價＋掛 lagging 欄）、D7 二態證偽（「需先做 X」轉 next-step、不算 fail）、D8 next-step 裁決
4. **Meta 停止規則**：維度全綠且再跑一輪 Top 3 集合成員不變→停；硬上限 2 輪

🛑 **STOP**: 展示 Brainstorm Report（含 Seeds／爭議區／Judgment Override）後等待使用者決定下一步

### 停止點

| 停止點 | 等待內容 |
|--------|---------|
| PRE-FLIGHT 提交前 | 收到使用者三項輸入 |
| 問題定義後 | 確認問題正確 |
| 反駁輪每個反對理由 | 使用者 (a)／(b)／(c) 回應 |
| 報告展示後 | 決定進入 `/requirement` 或 `/sdd` |

### 錯誤處理

| 錯誤情況 | AI 動作 |
|---------|---------|
| 主題太廣泛 | 引導縮小範圍 |
| 使用「像 X 但給 Y」種子 | 改寫為底層問題再繼續（反種子 guardrail） |
| 指定的 persona／透鏡不存在 | 列出可用選項供選擇 |
| `--enhanced` 但宿主不支援子代理 | 靜默退回 baseline，照常進行 |
| 前 3 名全來自同一 persona／透鏡 | 標示並在輸出前再跑一個透鏡 |
| baseline 單 context 跑評審（無獨立 context） | BQS D4 標 `[degraded]`，不得標 pass |
| 外部事實宣稱無 file:line／來源 | D5 接地 fail，要求補來源或改標 `[假說]` |

## 參考

* [Brainstorm Assistant Skill](../brainstorm-assistant/SKILL.md)
* [Brainstorm Assistant Guide](../brainstorm-assistant/guide.md)
* [Requirement Assistant](../requirement-assistant/SKILL.md)
* [Spec-Driven Development](../spec-driven-dev/SKILL.md)
