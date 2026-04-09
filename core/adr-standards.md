# Architecture Decision Records (ADR)

> **Language**: English | [繁體中文](../locales/zh-TW/core/adr-standards.md)

**Version**: 1.0.0
**Last Updated**: 2026-03-26
**Applicability**: All software projects making architectural decisions
**Scope**: universal
**Industry Standards**: ISO/IEC/IEEE 42010 (Architecture Description), TOGAF ADR
**References**: [Michael Nygard's ADR](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions), [MADR](https://adr.github.io/madr/)

---

## Purpose

Architecture Decision Records capture the context, options, and rationale behind significant technical decisions. They serve as a decision log that helps current and future team members understand why the architecture is the way it is.

---

## When to Write an ADR

| Write an ADR | Skip ADR |
|-------------|----------|
| Choosing a framework, library, or platform | Routine dependency updates |
| Defining API contracts or data formats | Bug fixes within existing architecture |
| Changing deployment strategy | Code style or formatting decisions |
| Establishing coding patterns or conventions | Trivial implementation choices |
| Making trade-offs with long-term consequences | Decisions already documented elsewhere |
| Deviating from established patterns | Following existing ADR guidance |

**Rule of thumb**: If someone might ask "why did we do it this way?" in 6 months, write an ADR.

---

## ADR Template

```markdown
# ADR-NNN: [Decision Title]

- **Status**: [Proposed | Accepted | Deprecated | Superseded by ADR-NNN]
- **Date**: YYYY-MM-DD
- **Deciders**: [People involved in the decision]
- **Technical Story**: [Related SPEC-ID, Issue, or PR]

## Context

[Describe the technical or business context that prompted this decision.
What is the problem or opportunity? What constraints exist?]

## Decision Drivers

- [Driver 1: e.g., performance requirements]
- [Driver 2: e.g., team expertise]
- [Driver 3: e.g., budget constraints]

## Considered Options

1. [Option 1]
2. [Option 2]
3. [Option 3]

## Decision Outcome

Chosen option: **[Option N]**, because [justification].

### Consequences

**Good:**
- [Positive outcome 1]
- [Positive outcome 2]

**Bad:**
- [Negative outcome or trade-off 1]
- [Accepted risk 1]

**Neutral:**
- [Side effect that is neither good nor bad]

## Links

- [Related ADRs, SPECs, PRs, or external references]
```

---

## ADR Numbering

- Use sequential numbering: `ADR-001`, `ADR-002`, etc.
- Numbers are never reused, even if an ADR is deprecated.
- Prefix with project identifier for multi-project organizations: `[PROJECT]-ADR-001`.

---

## Status Lifecycle

```
Proposed ──► Accepted ──► Deprecated
                │
                └──► Superseded by ADR-NNN
```

| Status | Description |
|--------|-------------|
| **Proposed** | Under discussion, not yet decided |
| **Accepted** | Decision is active and should be followed |
| **Deprecated** | Decision is no longer relevant (e.g., feature removed) |
| **Superseded** | Replaced by a newer ADR (include link) |

### Rules

1. A **Proposed** ADR can become **Accepted** or be deleted (if rejected).
2. An **Accepted** ADR can become **Deprecated** or **Superseded**.
3. **Deprecated** and **Superseded** are terminal states.
4. Never revert an **Accepted** ADR to **Proposed**. Instead, create a new ADR that supersedes it.

---

## Storage Convention

```
docs/adr/
├── ADR-001-use-postgresql.md
├── ADR-002-adopt-event-sourcing.md
├── ADR-003-migrate-to-kubernetes.md
└── README.md          # ADR index (optional)
```

### File Naming

- Format: `ADR-NNN-short-description.md`
- Use kebab-case for the description part.
- Keep descriptions under 5 words.

### Index File (Optional)

Maintain a `README.md` in `docs/adr/` listing all ADRs:

```markdown
# Architecture Decision Records

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](ADR-001-use-postgresql.md) | Use PostgreSQL | Accepted | 2026-01-15 |
| [ADR-002](ADR-002-adopt-event-sourcing.md) | Adopt Event Sourcing | Superseded by ADR-005 | 2026-02-01 |
```

---

## Superseding an ADR

When a decision is replaced:

1. Create a new ADR with the updated decision.
2. In the new ADR, add: `Supersedes [ADR-NNN](ADR-NNN-old-title.md)`.
3. Update the old ADR's status to: `Superseded by [ADR-NNN](ADR-NNN-new-title.md)`.
4. Keep the old ADR's content intact for historical context.

---

## Integration with Other Artifacts

| Artifact | Integration |
|----------|-------------|
| **SDD Specs** | Reference ADRs in Technical Design section |
| **Code Comments** | Link to ADR when implementing a non-obvious pattern: `// See ADR-003` |
| **PR Descriptions** | Reference relevant ADRs for architectural changes |
| **Commit Messages** | Include `ADR-NNN` in footer for traceability |

---

## Quality Checklist

Before accepting an ADR, verify:

- [ ] **Context** clearly explains the problem or opportunity
- [ ] At least **2 options** were considered
- [ ] **Decision drivers** are explicitly listed
- [ ] **Consequences** include both positive and negative outcomes
- [ ] **Status** is set correctly
- [ ] **Links** to related artifacts are included
- [ ] File is stored in `docs/adr/` with correct naming

---

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| ADR after the fact | Missing real context and alternatives | Write ADR before or during the decision |
| Too many ADRs | Decision fatigue, noise | Only record significant decisions |
| Too few ADRs | Lost knowledge, repeated debates | Follow "6-month rule" above |
| No consequences | Incomplete analysis | Always list good and bad outcomes |
| Vague context | Useless for future readers | Include specific constraints and drivers |
| Editing accepted ADRs | Lost history | Supersede instead of editing |

---

## Best Practices

1. **Write ADRs at decision time** — not weeks later when context is forgotten.
2. **Keep them short** — 1-2 pages maximum. Brevity encourages writing and reading.
3. **Include rejected options** — knowing what was not chosen is as valuable as what was.
4. **Link bidirectionally** — ADRs reference code; code references ADRs.
5. **Review periodically** — mark outdated ADRs as deprecated during architecture reviews.
6. **Store in version control** — ADRs should live alongside the code they govern.

---

## DEC Borrowing Extension

> **Context**: For cross-project Decision Records (DEC) that document the borrowing of methods from papers, repositories, or external sources, extend the base ADR template with the following blocks. These blocks are backward-compatible — existing DECs without them are valid, but new borrowing DECs should include them.

### Extended DEC Template

```markdown
# DEC-NNN: [Borrowing Decision Title]

> **建立日期**: YYYY-MM-DD
> **上游來源**: [Source Name](URL)
> **上游快照日期**: YYYY-MM-DD
> **用途**: [Brief description of the borrowing purpose]

---

## [Standard DEC Sections: Context / Decision / Consequences]

... (same as base ADR template) ...

---

## 技術雷達狀態

- **狀態**: Trial | Adopt | Assess | Hold
- **最後評估日期**: YYYY-MM-DD
- **下次評估日期**: YYYY-MM-DD（Trial 狀態必填）

## 借鑒假設

- **假設陳述**: 實作 [方法X] 後，[指標Y] 將從 [基準值a] 改善至 [目標值b]
- **測量方式**: [如何量測，例如：人工評分 / 自動化測試通過率 / 工具輸出品質]
- **基準值**: [借鑒前的現狀數據或主觀評分]
- **目標值**: [預期達到的改善幅度]
- **驗證期限**: YYYY-MM-DD
- **成功條件**: [達到目標值的 X% 以上]
- **失敗條件**: [超過期限且低於目標值 Y%，或指標惡化]

## 評估紀錄

| 日期 | 狀態 | 觀察 | 決定 |
|------|------|------|------|
| YYYY-MM-DD | Trial | [初始建立] | 開始評估 |
```

### Technology Radar States

| State | Meaning | Action |
|-------|---------|--------|
| **Adopt** | Validated effective; fully adopted | Document as standard practice; record evidence |
| **Trial** | Under evaluation; limited scope | Measure continuously; maintain hypothesis block |
| **Assess** | Effective under limited conditions | Record applicability boundary; do not expand |
| **Hold** | Evaluated ineffective or harmful | Stop new adoption; plan removal |

**Default**: All new borrowing DECs start at `Trial`.

### Diagnosis Flow (When Negative Results Observed)

```
觀察到負面結果
      ↓
Step 1: 對照原始論文/Repo，確認實作是否正確
      ↓ 實作有誤 ──→ 修正實作，重啟假設書計時（不建立 Reversal DEC）
      ↓ 實作正確
Step 2: 確認應用場景是否符合論文假設
      ↓ 場景不符 ──→ 記錄適用邊界，狀態更新為 Assess
      ↓ 場景符合
Step 3: 判定方法本身無效
      ↓
建立 Reversal DEC（DEC-NNN-reversal）→ 移除實作 → TECH-RADAR 更新為 Hold
```

---

## Reversal DEC Format

When a borrowing method is determined ineffective, create a `DEC-NNN-reversal.md` file alongside the original DEC:

```markdown
# DEC-NNN-reversal: [Original Method Name] — 移除決定

> **建立日期**: YYYY-MM-DD
> **原始 DEC**: [DEC-NNN](DEC-NNN-original-title.md)
> **移除原因**: 方法本身無效 | 場景不符 | 有反效果
> **緊急程度**: 正常流程 | 緊急（反效果，立即停用）

---

## 移除原因

[詳述為何判定此方法無效。說明已確認：
1. 實作正確性（已對照原始論文/Repo 確認）
2. 應用場景符合性（已確認場景符合論文假設）
3. 方法在我們環境中的實際表現]

## 診斷過程

| 步驟 | 確認項目 | 結果 |
|------|---------|------|
| Step 1 | 實作是否正確對照原始來源 | ✅ 正確 |
| Step 2 | 應用場景是否符合論文假設 | ✅ 符合 |
| Step 3 | 方法本身有效性 | ❌ 無效 |

## 觀察到的指標

| 指標 | 借鑲前 | 借鑲後 | 預期目標 | 判定 |
|------|-------|-------|---------|------|
| [指標名稱] | [基準值] | [實際值] | [目標值] | ❌ 未達成 |

## 反模式紀錄

> 記錄此方法在我們環境中的反模式，供未來避免相同錯誤。

- [反模式 1: 具體描述]
- [反模式 2: 具體描述]

## 移除步驟

- [ ] 透過 Feature Flag 停用相關功能
- [ ] 移除實作程式碼
- [ ] 更新 TECH-RADAR.md：狀態改為 Hold
- [ ] 更新原始 DEC 狀態為 `Superseded by DEC-NNN-reversal`
- [ ] 在下次 Retrospective 分享學習（緊急情況除外）

## 學習點

[從此次失敗借鑲中學到什麼？對未來借鑲決策的啟示？]

## Links

- 原始 DEC: [DEC-NNN](DEC-NNN-original-title.md)
- 相關 Retrospective: [連結]
- TECH-RADAR: [cross-project/decisions/TECH-RADAR.md](../decisions/TECH-RADAR.md)
```

### Reversal DEC Rules

1. **Always create** a Reversal DEC when a method is determined ineffective (not just implementation errors).
2. **Do NOT create** a Reversal DEC for implementation errors — fix and restart the hypothesis timer instead.
3. The original DEC status should be updated to `Superseded by DEC-NNN-reversal`.
4. Reversal DECs are terminal — they are never reversed themselves.
5. For methods with harmful side effects, skip the Retrospective wait and act immediately.
