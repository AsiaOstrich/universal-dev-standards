---
name: brainstorm
scope: universal
description: "[UDS] Structured AI-assisted brainstorming before spec creation"
allowed-tools: Read, Glob, Grep, Write
argument-hint: "[problem or feature idea | 問題或功能構想]"
---

# Brainstorm Assistant | 腦力激盪助手

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/brainstorm-assistant/SKILL.md)

Structured ideation before specification writing. Transform vague ideas into actionable feature proposals through guided brainstorming — grounded in 2024–2026 research on AI-assisted ideation.

在撰寫規格前進行結構化發想。以 2024–2026 年 AI 輔助發想研究為基礎，透過引導式腦力激盪，將模糊構想轉化為可執行的功能提案。

> **Implements**: XSPEC-296 Brainstorm Quality Standard (BQS v1) — brainstorm v4, layered on
> XSPEC-247 brainstorm v3 (Multi-Persona Ensemble + Multi-Critic Convergence).

**What changed in v3 | v3 的核心改動:** Divergence is no longer a single AI voice racing to a count — it is a **persona ensemble** (each role reasons via chain-of-thought, in isolation) crossed with **diversity lenses**. Convergence is no longer one AI scorer plus one devil's-advocate — it is a **multi-critic panel** plus a **hard-role rebuttal** (Devil's Advocate + Steelman). This directly targets the strongest finding in the literature: multiple personas beat a single pass, and a single LLM critic is weak and prone to sycophancy.

v3 把發散從「單一 AI 衝數量」改為**persona 集成**（每個角色以思維鏈獨立推理）× **多樣性透鏡**；把收斂從「單一 AI 評分 + 單一反駁」改為**多評審面板** + **硬角色反駁**（Devil's Advocate + Steelman）。直接對應文獻最強結論：多 persona 勝過單一 pass，單一 LLM 評審既弱又易諂媚。

**What changed in v4 | v4 的核心改動:** v3 supplied strong *mechanisms* but no decidable pass/fail quality gate. v4 layers a **time-sequenced quality contract** on top — the **Brainstorm Quality Standard (BQS v1)** — without removing any v3 behaviour. BQS is a **four-layer × timeline** structure: Layer 0 declares explore/exploit intent; Layer 1 (process, leading, visible during divergence) runs dimensions **D1–D4**; Layer 2 (product, leading, applied to Top 3 only after convergence) runs **D5–D8** plus a Seeds column and a contested zone; Layer 3 is an ungoverned **Judgment Override**. First principle: **decisions use leading signals; calibration uses lagging signals — these are ordered in time, not a right/wrong trade-off.** The hard sequence gate forbids D5–D8 from being revealed or scored during divergence. See "BQS v1 — Quality Contract" below.

**v4 的核心改動：** v3 提供了強健的*機制*，卻沒有可判定 pass/fail 的品質閘。v4 在其上疊加一道**時序化品質契約**——**腦力激盪品質標準（BQS v1）**——且不移除任何 v3 行為。BQS 是**四層 × 時間軸**結構：第 0 層宣告 explore/exploit 意圖；第 1 層（過程、leading、發散期全程可見）跑維度 **D1–D4**；第 2 層（產物、leading、收斂後僅施於 Top 3）跑 **D5–D8** 加 Seeds 欄與爭議區；第 3 層是不受治理的 **Judgment Override**。第一原理：**決策用 leading 訊號、校準用 lagging 訊號——兩者是時間前後，而非對錯取捨。** 硬序列閘禁止 D5–D8 在發散期被揭示或評分。詳見下方「BQS v1 — 品質契約」。

## Mode Selection | 使用前先選模式

Apply these **objective triggers** before starting. Default is full v3 — routing rules are shortcuts to skip phases, not barriers to add.

使用前套用以下**客觀觸發條件**。預設為完整 v3，路由規則是跳過階段的快捷鍵，而非額外障礙。

| Condition | Recommended Mode | Command |
|-----------|-----------------|---------|
| Problem description < 20 words **or** topic feels vague | Full v3 (default) | `/brainstorm [topic]` |
| Strategic question (career, architecture, business model) | Full v3 with rebuttal | `/brainstorm [topic]` |
| Host supports parallel subagents and you want maximum diversity | Full v3 + Enhanced tier | `/brainstorm --enhanced [topic]` |
| Creative-only (naming, tagline, marketing copy) | Lite — skip rebuttal | `/brainstorm --no-rebuttal [topic]` |
| Time-constrained or execution-type (write code, fix copy) | Quick mode | `/brainstorm --quick [topic]` |
| Already have an SDD spec for this topic | Skip pre-flight | `/brainstorm --skip-preflight [topic]` |

> **Rule of thumb:** If you are unsure which row applies, use full v3. The cognitive overhead of deciding is higher than just running the full flow.
>
> **判斷原則：** 不確定適用哪一行時，直接用完整 v3。判斷本身的認知成本高於直接跑完整流程。

## Workflow | 工作流程

```
[Mode Selection] ─► PRE-FLIGHT ─► FRAME ─► DIVERGE ───────────► CONVERGE ──────────► OUTPUT
   客觀路由          防止錨定      定義問題   persona 集成+透鏡       多評審面板+硬角色反駁    輸出提案
   ▲ Layer 0 intent              ▲ Layer 1 (D1–D4, leading)        ▲ Layer 2 (D5–D8, Top 3)   ▲ Layer 3 override
```

---

## BQS v1 — Quality Contract | BQS v1 — 品質契約

> First principle | 第一原理: A brainstorm's output is a **hypothesis, not an answer**. Whether an idea is good is unknowable at ideation time, so quality can only be judged on **leading** signals (process + epistemic integrity); the standard's legitimacy is **calibrated** by **lagging** signals (later outcomes). Decisions use leading; calibration uses lagging; they are ordered in **time**, not a right/wrong choice. (This corrects any "use only leading, never lagging" absolutism.)
>
> 腦力激盪的產物是**假說，不是答案**。一個點子好不好在發想當下不可知，所以品質只能用 **leading** 訊號（過程＋認識論完整性）判；標準的正當性靠 **lagging** 訊號（事後結果）**校準**。決策用 leading、校準用 lagging，兩者是**時間**前後，不是對錯取捨。（此處修正任何「只用 leading 不用 lagging」的絕對說法。）

BQS is a **four-layer × timeline** contract. It is **additive** to v3 — every v3 flag and mechanism is preserved (see "Backward Compatibility").

BQS 是**四層 × 時間軸**契約。它是 v3 的**疊加**——所有 v3 旗標與機制都保留（見「向後相容」）。

### Layer 0 — Intent (opening declaration) | 第 0 層 — 意圖（開場宣告）

At the start, declare the **explore/exploit ratio** and the bet type (incremental vs barbell long-tail). This layer **modulates dimension weights**: under an exploit-leaning session, a **low D2 (divergence coverage) score is correct and is NOT penalised**.

開場宣告本次 **explore/exploit 配比** 與賭注類型（漸進 vs barbell 長尾）。此層**調節維度權重**：偏 exploit 的工作階段，**D2（發散覆蓋）低分是正確的、不扣分**。

### Layer 1 — Process (divergence-period leading, fully visible) | 第 1 層 — 過程（發散期 leading，全程可見）

| Dim | Oracle (how it fails) | Oracle（怎麼判 fail）|
|-----|-----------------------|----------------------|
| **D1 Frame purity** | Problem embeds a specific solution or a "like X but for Y" framing → fail; must run 5-Whys to the root cause | 問題內嵌特定方案或「像 X 給 Y」→fail；須 5-Whys 到根因 |
| **D2 Divergence coverage** | Surviving ideas span < 3 independent personas/lenses → fail (modulated by Layer 0 weight); only a round with zero new ideas counts as saturation | 存活想法跨 <3 獨立 persona/透鏡→fail（受第 0 層權重調節）；連一輪零新增才算飽和 |
| **D3 Cross-session diversity** | Seed is a competitor analogy → fail; Top all from a single lens → fail | 種子是競品類比→fail；Top 全來自單一 lens→fail |
| **D4 Evaluation de-bias** | Requires ≥3 critics + hard-role Devil's Advocate + Steelman; **pass requires an independent context**, otherwise mark `[degraded]` — must NOT be marked pass | 須 ≥3 評審 + 硬角色 Devil's Advocate + Steelman；**pass 須在獨立 context 執行**，否則標 `[degraded]` 不得標 pass |

> **Hard sequence gate | 硬序列閘:** D5–D8 are **forbidden** from being revealed or scored during the divergence period. The CONVERGE critics MUST NOT be invoked before the **last persona** has produced its set.
>
> D5–D8 禁止在發散期揭示或評分；CONVERGE 的 critic 不得在**最後一個 persona** 產完前被呼叫。

### Layer 2 — Product (post-convergence leading, applied to Top 3 only) | 第 2 層 — 產物（收斂後 leading，僅施於 Top 3）

> Evaluative dimensions are confined to **after convergence × Top 3 only** — never as a full gate on every divergence idea (that would retroactively pollute divergence, kill evidence-free future ideas, and create form-filling theatre). | 評判維度限縮在**收斂後 × 僅 Top 3**，絕不在發散期對全部想法當硬閘（否則回溯污染發散、扼殺無證據的未來想法、製造填表劇場）。

| Dim | Oracle | Oracle |
|-----|--------|--------|
| **D5 Grounding** | A `[current state / external fact]` claim with no file:line/source → fail; a `[future / hypothesis]` claim needs no grounding, marked `[hypothesis]`. **An external-fact claim is a cross-tier floor (applies even at the creative tier).** | 「現狀/外部事實」主張無 file:line/來源→fail；「未來/假說」免接地、標 `[假說]`。**外部事實宣稱為跨級地板**（creative 級亦適用）|
| **D6 Net benefit** | A selected idea that does not answer "whose problem / do we actually have it / cost of not doing it" → fail; at least one "not worth doing" elimination required. **Attach a lagging registry field**: which signal will later validate this judgement? | 入選想法未答「解誰問題／我們真有嗎／不做的代價」→fail；至少一個「不值得做」淘汰。**掛 lagging 登記欄**：此判斷事後拿什麼訊號驗證？ |
| **D7 Falsifiability** | Two-state: `[falsifiable now]` or `[need to do X first to define falsification]`; the latter is **routed to a next-step feeding D8 and does NOT count as fail** | 二態：`[現可陳述證偽]` 或 `[需先做 X 才能定義證偽]`；後者**轉 next-step 餵 D8，不算 fail** |
| **D8 Actionability** | No next-step decision (including "defer") → fail | 無 next-step 裁決（含「暫不做」）→fail |
| **+ Seeds column** | When killing an idea, force-store "what was wrong, what real problem it points to"; if ≥1 idea was killed then Seeds ≥1 (only checked for non-empty) | 殺想法時強制存「錯在哪、指向什麼真問題」；被殺 ≥1 則 Seeds ≥1（只檢查非空）|
| **+ Contested zone** | Ideas whose critic variance exceeds a threshold are surfaced in a split view and **not eliminated by mean ranking** (protects barbell long-tail) | critic 方差 > 閾值的想法分流呈現，不按 mean 排序淘汰（守 barbell 長尾）|

### Layer 3 — Ungoverned zone (Judgment Override) | 第 3 層 — 不可治理區（Judgment Override）

A reserved space no oracle enters: a human's intuition to "keep / kill" needs only a one-line reason and **overrides the aggregate score — it passes through no dimension**. This admits the standard is incomplete and avoids "brainstorming to pass dimensions".

明文留一塊 oracle 不進入的地：人類直覺「保留/斃掉」附一句理由即可，**凌駕聚合分數、不需過任何維度**。承認標準不完備，避免「為過維度而 brainstorm」。

### Structural rules | 結構規則

1. **Meta stop rule | Meta 停止規則:** stop when the layer's dimensions are all green **and**, after one more round, the **Top 3 set membership is unchanged** (set membership, not internal ranking). **Hard cap: 2 rounds.** This replaces the vague "decision didn't flip" criterion. | 該層維度全綠 **且** 再跑一輪後 **Top 3 集合成員不變**（看集合成員、不看內部排序）→停。**硬上限 2 輪**。取代模糊的「不翻決策」。
2. **Judge ≠ generator | 判官≠產生者:** D2/D4/D5/D7 judgements need an independent viewpoint; single-context self-evaluation may only be `[degraded]`, never pass. | D2/D4/D5/D7 判定須獨立視角；單 context 自評只能 `[degraded]`，不得 pass。
3. **Calibration loop (consumes lagging) | 校準回路（吃 lagging）:** v3's three Session Self-Evaluation metrics are folded in as the **lagging** end — **Adoption Rate = D6 lagging validation, Diversity = D2/D3 lagging observation, Cognitive Load = a cost constraint**. **Two parallel evaluation systems are forbidden** — there is one loop, not a separate self-eval. | v3 的 **Adoption Rate**＝D6 滯後驗證、**Diversity**＝D2/D3 滯後觀測、**Cognitive Load**＝成本約束；三者收編為此回路 lagging 端，**禁兩套平行評估**。
4. **BQS self-evolution (lightweight) | BQS 自我演化（輕量）:** versioned + an evidence `last-reviewed` that flags when overdue; "periodically brainstorm BQS itself" is optional. | 版本化 + 證據清單 last-reviewed 逾期 flag；「定期對 BQS 自身 brainstorm」列可選。
5. **Minimal sufficiency | 最小充分原則:** apply only the fewest dimensions the tier requires + the Top-3 confinement — this is the gate for cognitive economy; no separate cost dimension is added. | 套用該 tier 所需的最少維度 + Top-3 限縮——認知經濟性的守門，不另設成本維度。

### Tiering (bound to v3 objective triggers, not self-assessment) | 分級（綁 v3 既有客觀觸發，非自評）

| Tier (from Mode Selection triggers) | BQS dimensions applied | 套用維度 |
|-------------------------------------|------------------------|----------|
| creative / `--quick` | D1–D3 **+ D5 external-fact floor** | D1–D3 ＋ D5 外部事實地板 |
| default | D1–D5 + D8 | D1–D5 + D8 |
| strategic / architecture / business | all layers | 全層 |

> Tiers are selected by the **objective Mode Selection triggers** (word count, flags, existence of a spec) — not by the initiator's self-assessment. | 分級由**客觀模式選擇觸發表**（字數、旗標、是否有規格）決定，而非發起者自評。

---

### Phase 0: PRE-FLIGHT | 防止 AI 錨定

**Why this phase exists:** Independent ideas written *before* the AI generates anything consistently produce more diverse results. In AI-assisted contexts this matters *more*, not less: research on design fixation shows that AI output — being fluent and high-fidelity — **deepens** fixation rather than relieving it (Wadinambiarachchi et al., CHI 2024).

**本階段存在的原因：** 在 AI 生成任何內容之前先寫下自己的想法，能持續產出更多樣的結果。在 AI 情境下這**更**重要：設計固著研究顯示，流暢、高擬真的 AI 輸出反而**加深**固著（Wadinambiarachchi 等，CHI 2024）。

**Before the AI generates any content**, the user completes three items:

在 AI 生成任何內容之前，使用者完成三件事：

| Item | Prompt | 說明 |
|------|--------|------|
| 1 | One-sentence problem description | 一句話描述問題 |
| 2 | Three initial ideas (any format, any quality) | 3 個初始想法（任意形式、不限品質） |
| 3 | "Solution types I do NOT want" (N/A allowed) | 「我最不想要的解法類型」（可填 N/A） |

**After the user submits**, the AI reads all three inputs and proceeds to FRAME. The AI's first DIVERGE output MUST explore directions the user did not mention and MUST NOT duplicate the user's three ideas.

**使用者提交後**，AI 讀取全部三項輸入再進入 FRAME。AI 的第一批 DIVERGE 輸出必須探索使用者未提及的方向，且不得重複使用者已提交的想法。

> **Anti-seed guardrail (new in v3):** Do NOT accept or generate a "like X but for Y" framing as the seed (e.g. "Slack but for doctors"). Such analogical seeds lock the LLM into one solution space and measurably reduce idea variety. Capture the underlying *problem*, not a product analogy.
>
> **反種子 guardrail（v3 新增）：** 不要用「像 X 但給 Y」的框架當種子（如「給醫生用的 Slack」）。這類產品類比種子會把 LLM 鎖進單一解空間、明顯降低想法多樣性。請捕捉底層**問題**，而非產品類比。

> **BQS Layer 0 — Intent declaration (new in v4):** Before FRAME, state the **explore/exploit ratio** and bet type (incremental vs barbell long-tail) for this session. This modulates D2 weighting downstream — under an exploit-leaning session, low divergence coverage is correct and is not penalised. Default when unstated: explore-leaning.
>
> **BQS 第 0 層 — 意圖宣告（v4 新增）：** 在 FRAME 之前，宣告本次的 **explore/exploit 配比** 與賭注類型（漸進 vs barbell 長尾）。此宣告下游調節 D2 權重——偏 exploit 時低發散覆蓋是正確的、不扣分。未宣告時預設：偏 explore。

**Flag:** `--skip-preflight` bypasses this phase with a one-line warning:
`⚠ Skipping Pre-flight may cause AI anchoring`

---

### Phase 1: FRAME | 定義問題

Define the problem space clearly before generating ideas.

在產生想法之前，先清楚定義問題空間。

| Step | Action | 步驟 |
|------|--------|------|
| 1 | Clarify the problem with 5 Whys | 用 5 Whys 釐清問題根因 |
| 2 | Reframe as "How Might We" (HMW) questions | 重構為 HMW 問題 |
| 3 | Identify stakeholders and constraints | 識別利害關係人與限制條件 |
| 4 | Gather context from codebase (if applicable) | 從程式碼庫蒐集脈絡（如適用） |

---

### Phase 2: DIVERGE | 發散思考（v3：persona 集成 + 多樣性透鏡）

> **Core mechanism in v3:** a **persona ensemble**, each persona reasoning via **chain-of-thought** in **isolation**, crossed with **diversity lenses**. Meincke, Mollick & Terwiesch (2024) found that chain-of-thought + personas produces the highest idea diversity of any prompting strategy — close to human groups. A raw idea count is a weak proxy; structurally forcing distinct viewpoints is the real lever.
>
> **v3 核心機制：** **persona 集成**——每個 persona 以**思維鏈**在**隔離**狀態下推理——再乘上**多樣性透鏡**。Meincke、Mollick、Terwiesch（2024）發現「思維鏈 + persona」的想法多樣性高於所有受測提示策略，接近人類團體。光衝數量是弱代理；結構性逼出不同視角才是真正槓桿。

#### Step 2a — Persona ensemble | persona 集成

Generate ideas through a default ensemble of personas. Each persona reasons **step by step (chain-of-thought)** and produces 2–4 ideas **from its own lens only**. The user may add, drop, or rename personas via `--personas`.

透過預設 persona 組生成想法。每個 persona **逐步推理（思維鏈）**，**只從自己的視角**產出 2–4 個想法。使用者可用 `--personas` 增減或改名。

| Default persona | Lens it argues from | 視角 |
|-----------------|---------------------|------|
| **Domain expert** | What does best-practice in this domain demand? | 領域最佳實務要求什麼？ |
| **Skeptic / risk** | Where does this break? What fails first? | 哪裡會壞？什麼先失敗？ |
| **Cross-domain analogist** | How do biology / other fields solve an analogous problem? | 生物/他領域如何解類似問題？ |
| **Cost / constraint** | What is the cheapest, smallest thing that works? | 最便宜最小可行解是什麼？ |
| **End-user advocate** | What does the actual user feel and need? | 真實使用者的感受與需求？ |

> **Branch isolation:** In baseline mode, generate each persona's ideas **without showing it the other personas' output** — this prevents intra-session anchoring. Present all personas' ideas together only *after* every persona has produced its set. (In the Enhanced tier, run personas as parallel isolated agents — see "Enhanced Tier" below.)
>
> **分支隔離：** baseline 模式下，生成每個 persona 的想法時**不讓它看到其他 persona 的輸出**，以防止 session 內錨定。等所有 persona 都產完才一起呈現。（Enhanced 層以平行隔離 agent 跑——見下方「Enhanced Tier」。）

#### Step 2b — Diversity lenses | 多樣性透鏡

Apply at least one lens across the ensemble to push past the "obvious answer zone." Connecting disparate concepts measurably increases originality (Mehrotra, Parab & Gulwani, 2024).

在 persona 組上至少套用一個透鏡，以突破「顯而易見答案區」。連結異域概念能可量測地提升原創性（Mehrotra、Parab、Gulwani，2024）。

| Lens | Prompt pattern | 透鏡 |
|------|----------------|------|
| **Analogical / cross-domain** | "Find a system in [biology / logistics / games] that solves an analogous problem. What can we borrow?" | 類比/跨域：借用他領域結構 |
| **Assumption reversal** | "List what everyone assumes must be true, then invert each one." | 假設反轉：列出共識假設並逐一反轉 |
| **Morphological matrix** | "Build a 3-axis matrix (e.g. User × Trigger × Constraint); fill rare combinations." | 形態矩陣：系統性填補罕見組合 |

Force `--lens analogical|reversal|morphological` to make a specific lens the primary one.

#### Step 2c — Continue nudge (auxiliary) | 繼續發散提示（輔助）

The "best ideas appear in the second half" pattern (Nijstad) is a **human-group** finding and is **not confirmed for LLMs** (which tend to plateau / exhaust). So a fixed idea-count gate is demoted to an **auxiliary nudge**: if fewer than ~8 distinct ideas exist across the ensemble, prompt "Continue — add a persona or lens you haven't used." Diversity (distinct lenses covered), not raw count, is the gate.

「好點子在後半」（Nijstad）是**人類群體**現象，**未在 LLM 證實**（LLM 多為高原/枯竭）。故固定數量門檻降為**輔助提示**：若全組少於約 8 個相異想法，提示「繼續——加一個還沒用過的 persona 或透鏡」。真正的門檻是**多樣性**（覆蓋了幾個不同視角），而非數量。

> **BQS Layer 1 applies here (D1–D4, leading, visible) | 此處生效 BQS 第 1 層（D1–D4，leading，全程可見）:** during divergence, only **D1 (frame purity), D2 (divergence coverage, weighted by Layer 0), D3 (cross-session diversity), D4 (evaluation de-bias)** are scored and shown. **Hard sequence gate:** the evaluative dimensions **D5–D8 must NOT be revealed or scored before the last persona has produced its set** — the CONVERGE critics are not invoked until divergence is complete.
>
> 發散期只對 **D1（框架純度）、D2（發散覆蓋，依第 0 層加權）、D3（跨會話多樣性）、D4（評估去偏）** 評分與呈現。**硬序列閘：** 評判維度 **D5–D8 在最後一個 persona 產完前不得揭示或評分**——CONVERGE 的 critic 在發散完成前不被呼叫。

#### Classic techniques (still available) | 經典技法（仍保留）

| Technique | When to Use | 使用時機 |
|-----------|-------------|----------|
| **HMW Questions** | Default starting point | 預設起點 |
| **SCAMPER** | Improving existing features | 改善現有功能 |
| **Six Thinking Hats** | Need multiple perspectives (works well as personas) | 需要多角度（很適合當 persona） |

---

### Phase 3: CONVERGE | 收斂（v3：多評審面板 + 硬角色反駁）

> **Core mechanism in v3:** a **multi-critic panel** replaces the single weighted scorer. A single LLM is a weak, biased evaluator (Li et al., 2025: LLMs are strong at generation/refinement but weak at evaluation — keep the human as final arbiter). Three independent critic lenses score each idea; their scores are aggregated.
>
> **v3 核心機制：** **多評審面板**取代單一加權評分者。單一 LLM 是弱且有偏的評估者（Li 等，2025：LLM 強於生成/精煉、弱於評估——人類保留最終裁決權）。三個獨立評審透鏡各自評分後聚合。

#### Step 3a: Multi-critic panel | 多評審面板

Run **three independent critics**, each scoring every idea 1–5 on its own lens. Aggregate (mean) to reduce single-critic bias. Each critic uses the weighted formula below.

跑**三個獨立評審**，各自以自己的透鏡對每個想法打 1–5 分；取平均聚合以降低單評審偏誤。每位評審皆套用下方加權公式。

| Critic lens | Weighted criteria it owns | 評審透鏡 |
|-------------|---------------------------|----------|
| **Engineering feasibility** | Feasibility 50% · Effort 50% | 工程可行性 |
| **User impact** | Impact 70% · Alignment 30% | 使用者影響 |
| **Strategic alignment** | Alignment 60% · Impact 40% | 策略一致性 |

Per-criterion guide (1–5): Feasibility (5=trivial … 1=near-impossible); Impact (5=transformative … 1=negligible); Effort (5=hours … 1=quarters, inverted so lower effort scores higher); Alignment (5=core mission … 1=off-mission).

> **Optional — RICE / ICE (product features):** for prioritising shippable features, score `RICE = (Reach × Impact × Confidence) / Effort` or the lighter `ICE = Impact × Confidence × Ease`. Let engineers — not the LLM — estimate Effort; the LLM lacks codebase knowledge. RICE favours incremental wins, so don't use it alone for strategic bets.
>
> **可選——RICE / ICE（產品功能）：** 排序可出貨功能時用 `RICE =（Reach × Impact × Confidence）/ Effort` 或較輕的 `ICE = Impact × Confidence × Ease`。Effort 交由工程師估、不要讓 LLM 估（它無程式庫知識）。RICE 偏好漸進式勝利，別單獨用於策略性押注。

#### Step 3b: Hard-role Rebuttal Round | 硬角色反駁輪

A soft "please critique this" instruction yields mostly agreement (sycophancy). v3 assigns **hard roles**: for each of the **top 3 ideas**, run a **Devil's Advocate** ("Your job is to argue this idea WILL fail") and a **Steelman** ("State the strongest charitable version of the counterargument"). Together they stress-test resilience rather than merely poke.

軟性「請批評一下」只會得到附和（諂媚）。v3 指派**硬角色**：對**前三名想法**各跑一個 **Devil's Advocate**（「你的任務是論證此案會失敗」）與一個 **Steelman**（「說出反方最強而善意的版本」）。兩者一起壓力測試韌性，而非只是戳。

Each counterargument must take the form: "This idea will fail in [specific context] because [specific reason]." Vague concerns ("this might be hard") are rejected.

每個反對理由須為：「在 [具體情境] 下，此想法會失敗，因為 [具體原因]。」模糊顧慮（「這可能有點難」）不接受。

The user **must** respond to each before advancing:

使用者必須對每個給出回應才能繼續：

| Option | Action | 說明 |
|--------|--------|------|
| (a) | Accept criticism → provide modified version | 接受批評 → 提供修改版本 |
| (b) | Disagree → provide specific reason to retain | 不同意 → 給具體保留理由 |
| (c) | Criticism valid → remove from ranking | 批評成立 → 從排名移除 |

**Flag:** `--no-rebuttal` skips this step; report section marked "Rebuttal: skipped".

> **BQS D4 — judge ≠ generator | BQS D4 — 判官≠產生者:** D4 passes **only when the critics/Devil's Advocate run in an independent context** (the `--enhanced` isolated-agent host). On a baseline single context, the panel runs as same-context self-evaluation, which is marked `[degraded]` and **must NOT be marked pass** — it is honest but not independent. Do not silently treat a baseline run as a D4 pass.
>
> D4 唯有**評審/Devil's Advocate 在獨立 context 執行**（`--enhanced` 隔離 agent 宿主）才可 pass。baseline 單 context 下，面板是同 context 自評，標 `[degraded]`、**不得標 pass**——誠實但非獨立。不得把 baseline 跑當成 D4 pass 靜默通過。

#### Step 3c: BQS Layer 2 — product gate on Top 3 | BQS 第 2 層——對 Top 3 的產物閘

After convergence, apply **D5–D8 to the Top 3 only** (never to every divergence idea). For each Top-3 idea:

收斂後，**僅對 Top 3** 套用 **D5–D8**（絕不對全部發散想法）。對每個 Top-3 想法：

- **D5 Grounding:** split each claim into `[current state / external fact]` (needs a file:line or source, else fail) vs `[future / hypothesis]` (no grounding needed, mark `[hypothesis]`). An **external-fact claim is a cross-tier floor** — it must be grounded even at the creative tier. | 將每個主張分流為 `[現狀/外部事實]`（需 file:line 或來源，否則 fail）vs `[未來/假說]`（免接地、標 `[假說]`）。**外部事實宣稱為跨級地板**——creative 級也須接地。
- **D6 Net benefit:** each Top-3 idea must answer "whose problem / do we actually have it / cost of not doing it"; at least one idea must be eliminated as "not worth doing"; attach a **lagging registry field** (which later signal validates this). | 每個 Top-3 須答「解誰問題／我們真有嗎／不做的代價」；至少一個淘汰為「不值得做」；掛 **lagging 登記欄**（事後哪個訊號驗證）。
- **D7 Falsifiability (two-state):** mark `[falsifiable now]` **or** `[need to do X first to define falsification]`. The latter is **routed to a next-step that feeds D8 — it does NOT count as fail**. | 標 `[現可陳述證偽]` **或** `[需先做 X 才能定義證偽]`。後者**轉 next-step 餵 D8——不算 fail**。
- **D8 Actionability:** every surviving idea needs a next-step decision (including an explicit "defer / not now"); none → fail. | 每個存活想法需 next-step 裁決（含明確「暫不做」）；無 → fail。

> **Meta stop rule (BQS structural rule 1) | Meta 停止規則:** stop iterating when the applied dimensions are all green **and** one more round leaves the **Top 3 set membership unchanged** (set membership, not internal ordering). **Hard cap: 2 rounds.**
>
> 當套用的維度全綠 **且** 再跑一輪後 **Top 3 集合成員不變**（看集合成員、非內部排序）→停。**硬上限 2 輪。**

---

### Phase 4: OUTPUT | 輸出提案

Produce a Brainstorm Report ready for `/requirement` or `/sdd`. Each surviving idea is marked `✓ Passed rebuttal` with a one-line summary of the user's response, its originating persona/lens, and its aggregated critic score.

產生可直接對接 `/requirement` 或 `/sdd` 的腦力激盪報告。每個存活想法標記 `✓ Passed rebuttal`、使用者回應摘要、來源 persona/透鏡、以及聚合評審分數。

## Output Format | 輸出格式

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

## Top 3 Recommendations (BQS Layer 2 applied)
1. **[Idea]** ✓ Passed rebuttal — [Why] — Persona: [..] — [User rebuttal response]
   - D5 grounding: [current-state claims with file:line | future claims marked [hypothesis]]
   - D6 net benefit: [whose problem / do we have it / cost of not doing] — lagging signal: [..]
   - D7 falsifiability: [falsifiable now | need to do X first → next-step]
   - D8 next-step: [action | defer]

## Contested Zone (high critic-variance ideas)
[Ideas whose critic variance exceeded threshold — surfaced, NOT eliminated by mean ranking (barbell long-tail)]

## Seeds (from killed ideas)
[For each killed idea: what was wrong, what real problem it points to. Non-empty if ≥1 idea was killed.]

## Judgment Override (Layer 3, ungoverned)
[Human keep/kill decisions that override the aggregate score, each with a one-line reason. Optional.]

## Diversity Note
[How many distinct lenses/personas the surviving ideas span — flag if all from one cluster]

## Discarded Ideas (with reasons)
| Idea | Reason |

## Next Steps
- [ ] Proceed to `/requirement` with top idea
- [ ] Proceed to `/sdd` if requirements are clear
```

> **BQS output additions (v4):** the **Seeds** section (rule: non-empty when ≥1 idea was killed), the **Contested Zone** (high-variance ideas not eliminated by mean ranking), and the **Judgment Override** channel (human decision overriding the aggregate score) are required by BQS Layer 2/3. The Top-3 block records the D5–D8 status per idea.
>
> **BQS 輸出新增（v4）：** **Seeds** 區（規則：被殺 ≥1 則非空）、**爭議區**（高方差想法不按 mean 淘汰）、**Judgment Override** 通道（人類裁決凌駕聚合分）為 BQS 第 2/3 層所要求。Top-3 區塊逐項記錄 D5–D8 狀態。

## Diversity-Collapse Guardrail | 多樣性崩塌防護

Using a single LLM for ideation reduces the **diversity of ideas across users**, even when each individual feels more creative (Anderson, Shah & Kreminski, 2024; corroborated by the widely-cited Doshi & Hauser, *Science Advances* 2024). Guard against it:

用單一 LLM 發想會降低**跨使用者的想法多樣性**，即使個人覺得更有創意（Anderson、Shah、Kreminski，2024；與廣為引用的 Doshi & Hauser，《Science Advances》2024 同向）。防範方式：

- **Never seed** with a competitor or product analogy ("like X but for Y"). | 絕不用競品/產品類比當種子。
- **Vary the lens**, not just the wording — reword ≠ diversify. | 變的是透鏡而非措辭——換句話不等於多樣化。
- If the surviving Top 3 all came from one persona/lens, **flag it** and run one more lens before OUTPUT. | 若前三名全來自同一 persona/透鏡，**標示**並在輸出前再跑一個透鏡。

## Enhanced Tier — Parallel Personas | 強化層——平行 persona

Multi-agent ideation (independent agents conversing/contributing) outperforms a single agent on perceived quality and novelty (Quan et al., 2025, *MultiColleagues*). Where the host supports parallel subagents (e.g. Claude Code's Agent/Workflow tools), `--enhanced` runs each persona — and each critic — as a **parallel, context-isolated agent**, then merges and de-duplicates the results.

多 agent 發想（獨立 agent 互相對話/貢獻）在感知品質與新穎度上勝過單 agent（Quan 等，2025，*MultiColleagues*）。在支援平行子代理的宿主（如 Claude Code 的 Agent/Workflow 工具），`--enhanced` 會把每個 persona 與每個評審當作**平行、context 隔離的 agent** 跑，再合併去重。

> **Graceful degradation:** This tier is **optional**. On hosts without subagents, `--enhanced` silently falls back to baseline (single-context simulated personas). The skill remains `scope: universal`.
>
> **優雅降級：** 此層為**可選**。在無子代理的宿主，`--enhanced` 靜默退回 baseline（單 context 模擬 persona）。本 skill 維持 `scope: universal`。

## Technique Quick Reference | 技法速覽

| Technique | Purpose | 用途 |
|-----------|---------|------|
| **5 Whys** | Root cause analysis | 根因分析 |
| **HMW** | Problem reframing | 問題重構 |
| **Persona ensemble** | Forced viewpoint diversity (v3 core) | 強制視角多樣性（v3 核心） |
| **Diversity lenses** | Push past obvious zone (analogical / reversal / morphological) | 突破顯而易見區 |
| **Multi-critic panel** | Bias-reduced scoring (v3 core) | 降偏誤評分（v3 核心） |
| **Devil's Advocate + Steelman** | Hard-role rebuttal | 硬角色反駁 |
| **SCAMPER / Six Hats** | Classic divergence (usable as personas) | 經典發散（可當 persona） |

## Calibration Loop — Lagging Signals (BQS) | 校準回路——lagging 訊號（BQS）

> **This is the lagging end of the single BQS quality loop — NOT a second, parallel evaluation system.** The leading decision is made by BQS Layers 0–2 during the session; these three metrics calibrate the standard afterwards. Do not run a separate "self-evaluation" alongside BQS.
>
> **這是同一道 BQS 品質回路的 lagging 端——不是第二套平行評估系統。** 工作階段中由 BQS 第 0–2 層做 leading 決策；這三個指標事後校準標準。禁止在 BQS 之外另跑一套「自評」。

After each session, record three metrics (1–5). Each maps onto a BQS dimension as its lagging validation:

每次工作階段結束後記錄三個指標（1–5 分），各自對應一個 BQS 維度作為其滯後驗證：

| Metric | Question | BQS lagging role | 指標 / 滯後角色 |
|--------|----------|------------------|------------------|
| **Adoption Rate** | How many of today's ideas will I actually use? | **D6 net-benefit lagging validation** | 採用率 = D6 淨值滯後驗證 |
| **Diversity** | Did surviving ideas span multiple personas/lenses? | **D2/D3 lagging observation** | 多樣性 = D2/D3 滯後觀測 |
| **Cognitive Load** | How mentally taxing was this? (5 = effortless) | **cost constraint** | 認知負擔 = 成本約束 |

Collect 3 sessions before drawing conclusions. See [guide.md](./guide.md) for the full A/B experiment protocol.

收集 3 次工作階段資料再下結論。完整 A/B 實驗協議見 [guide.md](./guide.md)。

## Flags | 旗標

| Flag | Effect | 說明 |
|------|--------|------|
| `--intent explore\|exploit\|<ratio>` | Declare BQS Layer 0 explore/exploit intent (modulates D2 weight) | 宣告 BQS 第 0 層 explore/exploit 意圖（調節 D2 權重） |
| `--personas "a,b,c"` | Override the default persona ensemble | 覆寫預設 persona 組 |
| `--lens analogical\|reversal\|morphological` | Force a primary diversity lens | 指定主要多樣性透鏡 |
| `--enhanced` | Parallel persona/critic agents (falls back if unsupported) | 平行 persona/評審 agent（不支援則退回） |
| `--skip-preflight` | Skip Phase 0 with warning | 跳過 Phase 0，顯示錨定警告 |
| `--no-rebuttal` | Skip rebuttal round in CONVERGE | 跳過反駁輪，報告標注 skipped |
| `--quick` | 3-idea fast mode; gates and rebuttal exempt | 快速 3 想法模式；門檻與反駁均豁免 |
| `--technique scamper` | Force SCAMPER as primary technique | 強制使用 SCAMPER |

## Usage | 使用方式

- `/brainstorm` — Start interactive brainstorming session
- `/brainstorm "user retention"` — Brainstorm around a specific topic
- `/brainstorm --enhanced "user retention"` — Parallel persona ensemble (if host supports it)
- `/brainstorm --personas "designer,economist,skeptic" "pricing"` — Custom personas
- `/brainstorm --lens analogical "onboarding"` — Force the analogical lens
- `/brainstorm --quick "reduce checkout friction"` — Fast 3-idea mode
- `/brainstorm --no-rebuttal "topic"` — Skip rebuttal round

## Next Steps Guidance | 下一步引導

After `/brainstorm` completes, the AI assistant should suggest:

> **腦力激盪完成。建議下一步 / Brainstorming complete. Suggested next steps:**
> - 執行 `/requirement` 將最佳構想轉為使用者故事 — Convert top idea to user stories
> - 執行 `/sdd` 直接建立規格（若需求已明確）⭐ **Recommended / 推薦** — Create spec directly
> - 針對特定構想進行更深入探索 — Explore a specific idea further

## Reference | 參考

- Detailed guide: [guide.md](./guide.md)

## AI Agent Behavior | AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/brainstorm`](../commands/brainstorm.md#ai-agent-behavior--ai-代理行為)
>
> For complete AI agent behavior definition, see the corresponding command file: [`/brainstorm`](../commands/brainstorm.md#ai-agent-behavior--ai-代理行為)
