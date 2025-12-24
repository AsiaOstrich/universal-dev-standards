# Requirement Completeness Checklist
# 需求完整性檢查清單

## Quick Checklist | 快速檢查

Before submitting any requirement, verify these essentials:

| Item | Check | Question |
|------|:-----:|----------|
| Problem | [ ] | What problem are we solving? |
| Users | [ ] | Who benefits from this? |
| Value | [ ] | Why is this important? |
| Scope | [ ] | What's included and excluded? |
| Criteria | [ ] | How do we know it's done? |
| Priority | [ ] | How urgent is this? |

---

## Detailed Checklist by Requirement Type | 依需求類型的詳細檢查清單

### Feature Request Checklist | 功能需求檢查清單

#### 1. Problem Definition | 問題定義

- [ ] Problem is clearly stated
- [ ] Current pain points identified
- [ ] Impact quantified (if possible)
- [ ] Root cause understood

#### 2. User Context | 使用者情境

- [ ] Target users/personas identified
- [ ] User goals described
- [ ] Current workarounds documented
- [ ] User journey mapped (if complex)

#### 3. Solution Description | 解決方案描述

- [ ] Feature described (not implementation)
- [ ] User interactions outlined
- [ ] Expected outcomes stated
- [ ] Success metrics defined

#### 4. Acceptance Criteria | 驗收標準

- [ ] All criteria are testable
- [ ] Happy path covered
- [ ] Error scenarios defined
- [ ] Edge cases considered
- [ ] Performance criteria (if applicable)

#### 5. Scope Definition | 範圍定義

- [ ] In-scope items listed
- [ ] Out-of-scope items listed
- [ ] Future considerations noted
- [ ] Dependencies identified

#### 6. Priority & Timeline | 優先級與時程

- [ ] Priority assigned (P0-P3 or MoSCoW)
- [ ] Business justification provided
- [ ] Deadline noted (if any)
- [ ] Release target identified

---

### Bug Report Checklist | 錯誤回報檢查清單

#### 1. Description | 描述

- [ ] Title is clear and specific
- [ ] Description is concise
- [ ] Impact/severity stated

#### 2. Reproduction | 重現步驟

- [ ] Steps are numbered
- [ ] Steps are reproducible
- [ ] Prerequisites listed
- [ ] Test data provided (if needed)

#### 3. Behavior | 行為

- [ ] Expected behavior described
- [ ] Actual behavior described
- [ ] Difference is clear

#### 4. Evidence | 證據

- [ ] Screenshots attached (if UI)
- [ ] Error logs included (if available)
- [ ] Stack trace provided (if crash)

#### 5. Environment | 環境

- [ ] OS and version
- [ ] Browser and version (if web)
- [ ] App version
- [ ] Relevant configuration

#### 6. Classification | 分類

- [ ] Severity assigned
- [ ] Priority assigned
- [ ] Component/area identified
- [ ] Related issues linked

---

### Technical Task Checklist | 技術任務檢查清單

#### 1. Context | 背景

- [ ] Why is this needed?
- [ ] What problem does it solve?
- [ ] What triggered this task?

#### 2. Technical Details | 技術細節

- [ ] Approach described
- [ ] Affected components listed
- [ ] Database changes noted
- [ ] API changes noted

#### 3. Scope | 範圍

- [ ] What will be changed?
- [ ] What will NOT be changed?
- [ ] Backward compatibility addressed

#### 4. Criteria | 標準

- [ ] Definition of done clear
- [ ] Testing requirements defined
- [ ] Documentation needs identified

#### 5. Risks | 風險

- [ ] Technical risks identified
- [ ] Mitigation strategies noted
- [ ] Rollback plan (if deployment)

---

## INVEST Validation | INVEST 驗證

Use this to validate user stories:

### Independent | 獨立性

- [ ] Can be delivered without other stories
- [ ] No blocking dependencies
- [ ] Can be prioritized freely

**If NO**: Consider combining with dependent story or redefining scope.

### Negotiable | 可協商性

- [ ] Implementation details not locked in
- [ ] Room for technical discussion
- [ ] Focus on WHAT, not HOW

**If NO**: Remove implementation specifics, focus on outcome.

### Valuable | 有價值性

- [ ] Delivers value to user/stakeholder
- [ ] Solves a real problem
- [ ] Benefit is clear

**If NO**: Reconsider if this should be done at all.

### Estimable | 可估算性

- [ ] Team can estimate effort
- [ ] Scope is understood
- [ ] No major unknowns

**If NO**: Spike/research task needed first.

### Small | 小型化

- [ ] Can complete in one sprint
- [ ] Typically 1-5 days effort
- [ ] Single coherent piece of work

**If NO**: Break into smaller stories.

### Testable | 可測試性

- [ ] Clear acceptance criteria
- [ ] Can write automated tests
- [ ] Definition of done is unambiguous

**If NO**: Add specific, measurable criteria.

---

## Acceptance Criteria Quality Check | 驗收標準品質檢查

For each acceptance criterion:

| Quality | Check | Example |
|---------|:-----:|---------|
| Specific | [ ] | "Login button is blue (#007bff)" not "Button looks good" |
| Measurable | [ ] | "Response < 200ms" not "Fast response" |
| Achievable | [ ] | Technically feasible |
| Relevant | [ ] | Related to the requirement |
| Testable | [ ] | Can write a test case |

### Common Issues | 常見問題

| Issue | Bad Example | Good Example |
|-------|-------------|--------------|
| Too vague | "System works well" | "System returns 200 OK within 500ms" |
| Subjective | "UI is user-friendly" | "User can complete checkout in 3 clicks" |
| Missing edge cases | "User can upload file" | "User can upload 1-10MB files; error shown for larger files" |
| Implementation detail | "Use Redis cache" | "Dashboard loads in under 1 second" |

---

## Final Review Checklist | 最終審查檢查清單

Before submitting for development:

### Content Quality | 內容品質

- [ ] Title is clear and descriptive
- [ ] Description is complete
- [ ] No ambiguous language
- [ ] No assumptions unstated
- [ ] Technical jargon explained

### Completeness | 完整性

- [ ] All required fields filled
- [ ] Acceptance criteria defined
- [ ] Scope boundaries clear
- [ ] Dependencies listed
- [ ] Priority assigned

### Consistency | 一致性

- [ ] Follows team templates
- [ ] Consistent terminology
- [ ] Linked to related items
- [ ] Labels applied correctly

### Ready for Development | 準備開發

- [ ] Team can estimate effort
- [ ] No blocking questions
- [ ] Stakeholder approval (if needed)
- [ ] Design assets ready (if UI)

---

## Checklist Results | 檢查結果

**Requirement Title**: ___________________________

**Checked By**: ___________________________

**Date**: ___________________________

| Section | Complete | Notes |
|---------|:--------:|-------|
| Problem Definition | [ ] | |
| User Context | [ ] | |
| Solution Description | [ ] | |
| Acceptance Criteria | [ ] | |
| Scope Definition | [ ] | |
| Priority | [ ] | |
| INVEST Validation | [ ] | |

**Ready for Development**: [ ] Yes  [ ] No

**Action Items**:
- ___________________________
- ___________________________

---

**License**: CC BY 4.0 | **Source**: [universal-doc-standards](https://github.com/AsiaOstrich/universal-doc-standards)
