---
name: brainstorm
description: "[UDS] Structured AI-assisted brainstorming before spec creation"
argument-hint: "[problem or feature idea | 問題或功能構想]"
---

# Brainstorm Assistant | 腦力激盪助手

Structured ideation before specification writing. Transform vague ideas into actionable feature proposals through a persona-ensemble brainstorm.

在撰寫規格前進行結構化發想。透過 persona 集成式腦力激盪，將模糊構想轉化為可執行的功能提案。

## Usage | 用法

```bash
/brainstorm [problem or feature idea]
```

## Workflow | 工作流程

```
PRE-FLIGHT ──► FRAME ──► DIVERGE ──────────► CONVERGE ─────────► OUTPUT
  防錨定        定義問題    persona 集成+透鏡     多評審面板+硬角色反駁   輸出提案
```

| Phase | Goal | Key Techniques (v3) + BQS gate (v4) | 目標 |
|-------|------|--------------------------------------|------|
| **PRE-FLIGHT** | Prevent AI anchoring | User writes 3 ideas first; no analogy seed; **BQS Layer 0 intent (explore/exploit)** | 防止錨定 |
| **FRAME** | Define problem clearly | 5 Whys, HMW, Stakeholder Map; **D1 frame purity** | 清楚定義問題 |
| **DIVERGE** | Force viewpoint diversity | Persona ensemble + diversity lenses; **BQS Layer 1 D1–D4, hard gate hides D5–D8** | 逼出視角多樣性 |
| **CONVERGE** | Bias-checked selection | Multi-critic panel + Devil's Advocate/Steelman; **BQS Layer 2 D5–D8 on Top 3, D4 judge≠generator** | 降偏誤選擇 |
| **OUTPUT** | Actionable report | Brainstorm Report + Seeds + Contested Zone + **Layer 3 Judgment Override** | 可執行的報告 |

> **BQS v1 (XSPEC-296):** v4 layers a four-layer × timeline quality contract on v3. Full oracles and structural rules are in the skill — see [Brainstorm Assistant Skill](../brainstorm-assistant/SKILL.md#bqs-v1--quality-contract--bqs-v1--品質契約).
>
> **BQS v1（XSPEC-296）：** v4 在 v3 上疊加四層 × 時間軸品質契約。完整 oracle 與結構規則見 skill：[Brainstorm Assistant Skill](../brainstorm-assistant/SKILL.md#bqs-v1--quality-contract--bqs-v1--品質契約)。

## Techniques | 技法

| Technique | Best For | 適用場景 |
|-----------|----------|----------|
| **Persona ensemble** | Forced viewpoint diversity (v3 core) | 強制視角多樣性（v3 核心） |
| **Diversity lenses** | Analogical / reversal / morphological | 突破顯而易見區 |
| **Multi-critic panel** | Bias-reduced scoring (v3 core) | 降偏誤評分（v3 核心） |
| **Devil's Advocate + Steelman** | Hard-role rebuttal | 硬角色反駁 |
| **5 Whys / HMW / SCAMPER / Six Hats** | Classic framing & divergence | 經典框定與發散 |

## Examples | 範例

```bash
/brainstorm                                          # Start interactive session
/brainstorm "user retention"                         # Brainstorm around a topic
/brainstorm --enhanced "user retention"              # Parallel persona ensemble (if host supports it)
/brainstorm --personas "designer,economist,skeptic"  # Custom personas
/brainstorm --lens analogical "onboarding"           # Force the analogical lens
/brainstorm --quick "reduce checkout friction"       # Fast 3-idea mode
```

## Output Format | 輸出格式

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

## Next Steps | 後續步驟

After brainstorming, the typical workflow is:

1. `/brainstorm` - Structured ideation (this command)
2. `/requirement` - Write user stories and requirements
3. `/sdd` - Create specification documents
4. `/derive-all` or `/tdd` - Implement with test protection

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/brainstorm` | 啟動 PRE-FLIGHT，請使用者先寫 問題＋3 想法＋反向排除 |
| `/brainstorm "topic"` | 以指定主題啟動 PRE-FLIGHT，再進入 FRAME |
| `/brainstorm --personas "a,b,c"` | 以自訂 persona 組進入 DIVERGE |
| `/brainstorm --lens <name>` | 以指定多樣性透鏡為主進入 DIVERGE |
| `/brainstorm --enhanced` | 若宿主支援子代理則平行跑 persona/評審，否則靜默退回 baseline；此模式下 BQS D4 方可 pass |
| `/brainstorm --intent exploit` | 以 exploit 意圖啟動（BQS Layer 0），D2 低覆蓋不扣分 |

### Interaction Script | 互動腳本

#### PRE-FLIGHT Phase
1. 請使用者先寫 問題（一句）＋3 個初始想法＋最不想要的解法類型
2. 拒絕「像 X 但給 Y」種子，改寫為底層問題
3. **BQS Layer 0**：宣告本次 explore/exploit 配比與賭注類型（未宣告預設偏 explore）

🛑 **STOP**: 收到三項輸入前不生成任何想法（`--skip-preflight` 例外，顯示錨定警告）

#### FRAME Phase
1. 釐清問題陳述（5 Whys 找根因）
2. 重構為 HMW 問題；識別利害關係人
3. **BQS D1 框架純度**：問題不得內嵌特定方案或「像 X 給 Y」，須到根因

🛑 **STOP**: 問題定義後等待使用者確認

#### DIVERGE Phase (BQS Layer 1 — D1–D4 leading, visible)
1. 逐一以預設 persona（領域專家／懷疑者／跨域類比者／成本約束者／使用者代言）思維鏈生成想法
2. **分支隔離**：生成各 persona 時不互相預覽，全部產完才一起呈現
3. 至少套用一個多樣性透鏡（類比／假設反轉／形態矩陣）
4. 以多樣性（覆蓋的 persona/透鏡數，D2/D3）而非數量為繼續門檻
5. **硬序列閘**：D5–D8 在最後一個 persona 產完前**不得揭示或評分**；CONVERGE critic 不得提前呼叫

#### CONVERGE Phase (BQS Layer 2 — D5–D8 on Top 3 only)
1. 以 3 個獨立評審（工程可行性／使用者影響／策略一致）各自評分後聚合
2. 對前 3 名跑硬角色 Devil's Advocate（論證會失敗）+ Steelman；使用者以 (a)修改/(b)反駁/(c)移除 回應。**D4 判官≠產生者**：評審須在獨立 context（`--enhanced`）方可 pass，否則標 `[degraded]` 不得 pass
3. **僅對 Top 3** 套用 D5 接地（外部事實需 file:line／來源、跨級地板；假說免接地）、D6 淨值（解誰問題／真有嗎／不做代價＋掛 lagging 欄）、D7 二態證偽（「需先做 X」轉 next-step、不算 fail）、D8 next-step 裁決
4. **Meta 停止規則**：維度全綠且再跑一輪 Top 3 集合成員不變→停；硬上限 2 輪

🛑 **STOP**: 展示 Brainstorm Report（含 Seeds／爭議區／Judgment Override）後等待使用者決定下一步

### Stop Points | 停止點

| Stop Point | 等待內容 |
|-----------|---------|
| PRE-FLIGHT 提交前 | 收到使用者三項輸入 |
| 問題定義後 | 確認問題正確 |
| 反駁輪每個反對理由 | 使用者 (a)/(b)/(c) 回應 |
| 報告展示後 | 決定進入 `/requirement` 或 `/sdd` |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| 主題太廣泛 | 引導縮小範圍 |
| 使用「像 X 但給 Y」種子 | 改寫為底層問題再繼續（反種子 guardrail） |
| 指定的 persona/透鏡不存在 | 列出可用選項供選擇 |
| `--enhanced` 但宿主不支援子代理 | 靜默退回 baseline，照常進行 |
| 前 3 名全來自同一 persona/透鏡 | 標示並在輸出前再跑一個透鏡 |
| baseline 單 context 跑評審（無獨立 context） | BQS D4 標 `[degraded]`，不得標 pass |
| 外部事實宣稱無 file:line／來源 | D5 接地 fail，要求補來源或改標 `[假說]` |

## References | 參考

* [Brainstorm Assistant Skill](../brainstorm-assistant/SKILL.md)
* [Brainstorm Assistant Guide](../brainstorm-assistant/guide.md)
* [Requirement Assistant](../requirement-assistant/SKILL.md)
* [Spec-Driven Development](../spec-driven-dev/SKILL.md)
