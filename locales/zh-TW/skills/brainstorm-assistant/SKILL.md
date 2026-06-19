---
name: brainstorm-assistant
source: ../../../../skills/brainstorm-assistant/SKILL.md
source_version: 3.0.0
source_hash: 25e622a7d063
translation_version: 3.0.0
last_synced: 2026-06-01
status: current
description: "[UDS] 在撰寫規格前進行結構化 AI 輔助腦力激盪"
---

# 腦力激盪助手

> **語言**: [English](../../../../skills/brainstorm-assistant/SKILL.md) | 繁體中文

在撰寫規格前進行結構化發想。以 2024–2026 年 AI 輔助發想研究為基礎，透過引導式腦力激盪，將模糊構想轉化為可執行的功能提案。

> **Implements**: XSPEC-247 brainstorm v3 — Multi-Persona Ensemble + Multi-Critic Convergence
> （取代 v2「認知科學升級」。）

**v3 的核心改動：** v3 把發散從「單一 AI 衝數量」改為 **persona 集成**（每個角色以思維鏈獨立推理）× **多樣性透鏡**；把收斂從「單一 AI 評分 + 單一反駁」改為**多評審面板** + **硬角色反駁**（Devil's Advocate + Steelman）。直接對應文獻最強結論：多 persona 勝過單一 pass，單一 LLM 評審既弱又易諂媚。

## 使用前先選模式

使用前套用以下**客觀觸發條件**。預設為完整 v3，路由規則是跳過階段的快捷鍵，而非額外障礙。

| 條件 | 建議模式 | 指令 |
|------|---------|------|
| 問題描述少於 20 字**或**主題感覺模糊 | 完整 v3（預設） | `/brainstorm [topic]` |
| 策略性問題（職涯、架構、商業模式） | 完整 v3 含反駁 | `/brainstorm [topic]` |
| 宿主支援平行子代理且想要最大多樣性 | 完整 v3 + Enhanced 層 | `/brainstorm --enhanced [topic]` |
| 純創意（命名、標語、行銷文案） | Lite——跳過反駁 | `/brainstorm --no-rebuttal [topic]` |
| 時間受限或執行型任務（寫程式碼、修文案） | 快速模式 | `/brainstorm --quick [topic]` |
| 此主題已有 SDD 規格 | 跳過 pre-flight | `/brainstorm --skip-preflight [topic]` |

> **判斷原則：** 不確定適用哪一行時，直接用完整 v3。判斷本身的認知成本高於直接跑完整流程。

## 工作流程

```
[Mode Selection] ─► PRE-FLIGHT ─► FRAME ─► DIVERGE ───────────► CONVERGE ──────────► OUTPUT
   客觀路由          防止錨定      定義問題   persona 集成+透鏡       多評審面板+硬角色反駁    輸出提案
```

---

### Phase 0: PRE-FLIGHT | 防止 AI 錨定

**本階段存在的原因：** 在 AI 生成任何內容之前先寫下自己的想法，能持續產出更多樣的結果。在 AI 情境下這**更**重要：設計固著研究顯示，流暢、高擬真的 AI 輸出反而**加深**固著（Wadinambiarachchi 等，CHI 2024）。

在 AI 生成任何內容之前，使用者完成三件事：

| 項目 | 提示 |
|------|------|
| 1 | 一句話描述問題 |
| 2 | 3 個初始想法（任意形式、不限品質） |
| 3 | 「我最不想要的解法類型」（可填 N/A） |

**使用者提交後**，AI 讀取全部三項輸入再進入 FRAME。AI 的第一批 DIVERGE 輸出必須探索使用者未提及的方向，且不得重複使用者已提交的想法。

> **反種子 guardrail（v3 新增）：** 不要用「像 X 但給 Y」的框架當種子（如「給醫生用的 Slack」）。這類產品類比種子會把 LLM 鎖進單一解空間、明顯降低想法多樣性。請捕捉底層**問題**，而非產品類比。

**旗標：** `--skip-preflight` 跳過本階段並顯示一行警告：
`⚠ Skipping Pre-flight may cause AI anchoring`

---

### Phase 1: FRAME | 定義問題

在產生想法之前，先清楚定義問題空間。

| 步驟 | 動作 |
|------|------|
| 1 | 用 5 Whys 釐清問題根因 |
| 2 | 重構為 HMW（How Might We）問題 |
| 3 | 識別利害關係人與限制條件 |
| 4 | 從程式碼庫蒐集脈絡（如適用） |

---

### Phase 2: DIVERGE | 發散思考（v3：persona 集成 + 多樣性透鏡）

> **v3 核心機制：** **persona 集成**——每個 persona 以**思維鏈**在**隔離**狀態下推理——再乘上**多樣性透鏡**。Meincke、Mollick、Terwiesch（2024）發現「思維鏈 + persona」的想法多樣性高於所有受測提示策略，接近人類團體。光衝數量是弱代理；結構性逼出不同視角才是真正槓桿。

#### Step 2a — persona 集成

透過預設 persona 組生成想法。每個 persona **逐步推理（思維鏈）**，**只從自己的視角**產出 2–4 個想法。使用者可用 `--personas` 增減或改名。

| 預設 persona | 它所論辯的視角 |
|-------------|---------------|
| **Domain expert（領域專家）** | 領域最佳實務要求什麼？ |
| **Skeptic / risk（懷疑者／風險）** | 哪裡會壞？什麼先失敗？ |
| **Cross-domain analogist（跨域類比者）** | 生物／他領域如何解類似問題？ |
| **Cost / constraint（成本／約束）** | 最便宜最小可行解是什麼？ |
| **End-user advocate（使用者代言）** | 真實使用者的感受與需求？ |

> **分支隔離：** baseline 模式下，生成每個 persona 的想法時**不讓它看到其他 persona 的輸出**，以防止 session 內錨定。等所有 persona 都產完才一起呈現。（Enhanced 層以平行隔離 agent 跑——見下方「Enhanced Tier」。）

#### Step 2b — 多樣性透鏡

在 persona 組上至少套用一個透鏡，以突破「顯而易見答案區」。連結異域概念能可量測地提升原創性（Mehrotra、Parab、Gulwani，2024）。

| 透鏡 | 提示模式 |
|------|---------|
| **Analogical / cross-domain（類比／跨域）** | 「在 [生物／物流／遊戲] 中找一個解類似問題的系統。我們能借用什麼？」 |
| **Assumption reversal（假設反轉）** | 「列出大家都認為必為真的事，再逐一反轉。」 |
| **Morphological matrix（形態矩陣）** | 「建立三軸矩陣（如 User × Trigger × Constraint），填補罕見組合。」 |

用 `--lens analogical|reversal|morphological` 強制指定某透鏡為主要透鏡。

#### Step 2c — 繼續發散提示（輔助）

「好點子在後半」（Nijstad）是**人類群體**現象，**未在 LLM 證實**（LLM 多為高原／枯竭）。故固定數量門檻降為**輔助提示**：若全組少於約 8 個相異想法，提示「繼續——加一個還沒用過的 persona 或透鏡」。真正的門檻是**多樣性**（覆蓋了幾個不同視角），而非數量。

#### 經典技法（仍保留）

| 技法 | 使用時機 |
|------|----------|
| **HMW Questions** | 預設起點 |
| **SCAMPER** | 改善現有功能 |
| **Six Thinking Hats** | 需要多角度（很適合當 persona） |

---

### Phase 3: CONVERGE | 收斂（v3：多評審面板 + 硬角色反駁）

> **v3 核心機制：** **多評審面板**取代單一加權評分者。單一 LLM 是弱且有偏的評估者（Li 等，2025：LLM 強於生成／精煉、弱於評估——人類保留最終裁決權）。三個獨立評審透鏡各自評分後聚合。

#### Step 3a: 多評審面板

跑**三個獨立評審**，各自以自己的透鏡對每個想法打 1–5 分；取平均聚合以降低單評審偏誤。每位評審皆套用下方加權公式。

| 評審透鏡 | 它所負責的加權準則 |
|---------|-------------------|
| **Engineering feasibility（工程可行性）** | Feasibility 50% · Effort 50% |
| **User impact（使用者影響）** | Impact 70% · Alignment 30% |
| **Strategic alignment（策略一致性）** | Alignment 60% · Impact 40% |

各準則評分指南（1–5）：Feasibility（5=輕而易舉 … 1=幾乎不可能）；Impact（5=變革性 … 1=可忽略）；Effort（5=數小時 … 1=數季，反向計分，工作量越低分越高）；Alignment（5=核心使命 … 1=偏離使命）。

> **可選——RICE / ICE（產品功能）：** 排序可出貨功能時用 `RICE =（Reach × Impact × Confidence）/ Effort` 或較輕的 `ICE = Impact × Confidence × Ease`。Effort 交由工程師估、不要讓 LLM 估（它無程式庫知識）。RICE 偏好漸進式勝利，別單獨用於策略性押注。

#### Step 3b: 硬角色反駁輪

軟性「請批評一下」只會得到附和（諂媚）。v3 指派**硬角色**：對**前三名想法**各跑一個 **Devil's Advocate**（「你的任務是論證此案會失敗」）與一個 **Steelman**（「說出反方最強而善意的版本」）。兩者一起壓力測試韌性，而非只是戳。

每個反對理由須為：「在 [具體情境] 下，此想法會失敗，因為 [具體原因]。」模糊顧慮（「這可能有點難」）不接受。

使用者**必須**對每個給出回應才能繼續：

| 選項 | 動作 |
|------|------|
| (a) | 接受批評 → 提供修改版本 |
| (b) | 不同意 → 給具體保留理由 |
| (c) | 批評成立 → 從排名移除 |

**旗標：** `--no-rebuttal` 跳過此步驟；報告段落標注「Rebuttal: skipped」。

---

### Phase 4: OUTPUT | 輸出提案

產生可直接對接 `/requirement` 或 `/sdd` 的腦力激盪報告。每個存活想法標記 `✓ Passed rebuttal`、使用者回應摘要、來源 persona／透鏡、以及聚合評審分數。

## 輸出格式

```markdown
# Brainstorm Report: [Topic]

## Problem Statement
[Refined problem + root cause from FRAME]

## HMW Questions
1. How might we ...?

## Ideas Generated
| # | Idea | Persona | Lens | Critic-Feas | Critic-Impact | Critic-Align | Agg. Score |
|---|------|---------|------|-------------|---------------|--------------|-----------|
| 1 | ...  | Skeptic | Reversal | 4.0 | 4.5 | 4.0 | 4.2 |

## Top 3 Recommendations
1. **[Idea]** ✓ Passed rebuttal — [Why] — Persona: [..] — [User rebuttal response]

## Diversity Note
[How many distinct lenses/personas the surviving ideas span — flag if all from one cluster]

## Discarded Ideas (with reasons)
| Idea | Reason |

## Next Steps
- [ ] Proceed to `/requirement` with top idea
- [ ] Proceed to `/sdd` if requirements are clear
```

## 多樣性崩塌防護

用單一 LLM 發想會降低**跨使用者的想法多樣性**，即使個人覺得更有創意（Anderson、Shah、Kreminski，2024；與廣為引用的 Doshi & Hauser，《Science Advances》2024 同向）。防範方式：

- **絕不**用競品或產品類比當種子（「像 X 但給 Y」）。
- 變的是**透鏡**而非措辭——換句話不等於多樣化。
- 若存活的前三名全來自同一 persona／透鏡，**標示**並在輸出前再跑一個透鏡。

## 強化層——平行 persona

多 agent 發想（獨立 agent 互相對話／貢獻）在感知品質與新穎度上勝過單 agent（Quan 等，2025，*MultiColleagues*）。在支援平行子代理的宿主（如 Claude Code 的 Agent/Workflow 工具），`--enhanced` 會把每個 persona 與每個評審當作**平行、context 隔離的 agent** 跑，再合併去重。

> **優雅降級：** 此層為**可選**。在無子代理的宿主，`--enhanced` 靜默退回 baseline（單 context 模擬 persona）。本 skill 維持 `scope: universal`。

## 技法速覽

| 技法 | 用途 |
|------|------|
| **5 Whys** | 根因分析 |
| **HMW** | 問題重構 |
| **Persona ensemble** | 強制視角多樣性（v3 核心） |
| **Diversity lenses** | 突破顯而易見區（analogical / reversal / morphological） |
| **Multi-critic panel** | 降偏誤評分（v3 核心） |
| **Devil's Advocate + Steelman** | 硬角色反駁 |
| **SCAMPER / Six Hats** | 經典發散（可當 persona） |

## 工作階段自評

每次工作階段結束後記錄三個指標（1–5 分），追蹤長期改善。

| 指標 | 問題 |
|------|------|
| **Adoption Rate（採用率）** | 今天的想法我實際會用幾個？ |
| **Diversity（多樣性）** | 存活想法跨越多個 persona／透鏡嗎？ |
| **Cognitive Load（認知負擔）** | 這過程心智上有多累？（5 = 毫不費力） |

收集 3 次工作階段資料再下結論。完整 A/B 實驗協議見 [guide.md](./guide.md)。

## 旗標

| 旗標 | 說明 |
|------|------|
| `--personas "a,b,c"` | 覆寫預設 persona 組 |
| `--lens analogical\|reversal\|morphological` | 指定主要多樣性透鏡 |
| `--enhanced` | 平行 persona／評審 agent（不支援則退回） |
| `--skip-preflight` | 跳過 Phase 0，顯示錨定警告 |
| `--no-rebuttal` | 跳過 CONVERGE 反駁輪，報告標注 skipped |
| `--quick` | 快速 3 想法模式；門檻與反駁均豁免 |
| `--technique scamper` | 強制使用 SCAMPER 為主要技法 |

## 使用方式

- `/brainstorm` — 啟動互動式腦力激盪工作階段
- `/brainstorm "user retention"` — 針對特定主題腦力激盪
- `/brainstorm --enhanced "user retention"` — 平行 persona 集成（若宿主支援）
- `/brainstorm --personas "designer,economist,skeptic" "pricing"` — 自訂 persona
- `/brainstorm --lens analogical "onboarding"` — 強制類比透鏡
- `/brainstorm --quick "reduce checkout friction"` — 快速 3 想法模式
- `/brainstorm --no-rebuttal "topic"` — 跳過反駁輪

## 下一步引導

`/brainstorm` 完成後，AI 助手應建議：

> **腦力激盪完成。建議下一步：**
> - 執行 `/requirement` 將最佳構想轉為使用者故事
> - 執行 `/sdd` 直接建立規格（若需求已明確）⭐ **推薦**
> - 針對特定構想進行更深入探索

## 參考

- 詳細指南：[guide.md](./guide.md)

## AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/brainstorm`](../../../../skills/commands/brainstorm.md#ai-agent-behavior--ai-代理行為)
