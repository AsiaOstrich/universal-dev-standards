# Requirement Completeness Checklist

> **Language**: English | [繁體中文](../../../../locales/zh-TW/skills/claude-code/requirement-assistant/requirement-checklist.md)

**Version**: 1.0.0
**Last Updated**: 2025-12-24
**Applicability**: Claude Code Skills

---

## Purpose

This document provides checklists for verifying requirement completeness and quality.

---

## Quick Checklist

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

## Detailed Checklist by Requirement Type

### Feature Request Checklist

#### 1. Problem Definition

- [ ] Problem is clearly stated
- [ ] Current pain points identified
- [ ] Impact quantified (if possible)
- [ ] Root cause understood

#### 2. User Context

- [ ] Target users/personas identified
- [ ] User goals described
- [ ] Current workarounds documented
- [ ] User journey mapped (if complex)

#### 3. Solution Description

- [ ] Feature described (not implementation)
- [ ] User interactions outlined
- [ ] Expected outcomes stated
- [ ] Success metrics defined

#### 4. Acceptance Criteria

- [ ] All criteria are testable
- [ ] Happy path covered
- [ ] Error scenarios defined
- [ ] Edge cases considered
- [ ] Performance criteria (if applicable)

#### 5. Scope Definition

- [ ] In-scope items listed
- [ ] Out-of-scope items listed
- [ ] Future considerations noted
- [ ] Dependencies identified

#### 6. Priority & Timeline

- [ ] Priority assigned (P0-P3 or MoSCoW)
- [ ] Business justification provided
- [ ] Deadline noted (if any)
- [ ] Release target identified

---

### Bug Report Checklist

#### 1. Description

- [ ] Title is clear and specific
- [ ] Description is concise
- [ ] Impact/severity stated

#### 2. Reproduction

- [ ] Steps are numbered
- [ ] Steps are reproducible
- [ ] Prerequisites listed
- [ ] Test data provided (if needed)

#### 3. Behavior

- [ ] Expected behavior described
- [ ] Actual behavior described
- [ ] Difference is clear

#### 4. Evidence

- [ ] Screenshots attached (if UI)
- [ ] Error logs included (if available)
- [ ] Stack trace provided (if crash)

#### 5. Environment

- [ ] OS and version
- [ ] Browser and version (if web)
- [ ] App version
- [ ] Relevant configuration

#### 6. Classification

- [ ] Severity assigned
- [ ] Priority assigned
- [ ] Component/area identified
- [ ] Related issues linked

---

### Technical Task Checklist

#### 1. Context

- [ ] Why is this needed?
- [ ] What problem does it solve?
- [ ] What triggered this task?

#### 2. Technical Details

- [ ] Approach described
- [ ] Affected components listed
- [ ] Database changes noted
- [ ] API changes noted

#### 3. Scope

- [ ] What will be changed?
- [ ] What will NOT be changed?
- [ ] Backward compatibility addressed

#### 4. Criteria

- [ ] Definition of done clear
- [ ] Testing requirements defined
- [ ] Documentation needs identified

#### 5. Risks

- [ ] Technical risks identified
- [ ] Mitigation strategies noted
- [ ] Rollback plan (if deployment)

---

## INVEST Validation

Use this to validate user stories:

### Independent

- [ ] Can be delivered without other stories
- [ ] No blocking dependencies
- [ ] Can be prioritized freely

**If NO**: Consider combining with dependent story or redefining scope.

### Negotiable

- [ ] Implementation details not locked in
- [ ] Room for technical discussion
- [ ] Focus on WHAT, not HOW

**If NO**: Remove implementation specifics, focus on outcome.

### Valuable

- [ ] Delivers value to user/stakeholder
- [ ] Solves a real problem
- [ ] Benefit is clear

**If NO**: Reconsider if this should be done at all.

### Estimable

- [ ] Team can estimate effort
- [ ] Scope is understood
- [ ] No major unknowns

**If NO**: Spike/research task needed first.

### Small

- [ ] Can complete in one sprint
- [ ] Typically 1-5 days effort
- [ ] Single coherent piece of work

**If NO**: Break into smaller stories.

### Testable

- [ ] Clear acceptance criteria
- [ ] Can write automated tests
- [ ] Definition of done is unambiguous

**If NO**: Add specific, measurable criteria.

---

## Acceptance Criteria Quality Check

For each acceptance criterion:

| Quality | Check | Example |
|---------|:-----:|---------|
| Specific | [ ] | "Login button is blue (#007bff)" not "Button looks good" |
| Measurable | [ ] | "Response < 200ms" not "Fast response" |
| Achievable | [ ] | Technically feasible |
| Relevant | [ ] | Related to the requirement |
| Testable | [ ] | Can write a test case |

### Common Issues

| Issue | Bad Example | Good Example |
|-------|-------------|--------------|
| Too vague | "System works well" | "System returns 200 OK within 500ms" |
| Subjective | "UI is user-friendly" | "User can complete checkout in 3 clicks" |
| Missing edge cases | "User can upload file" | "User can upload 1-10MB files; error shown for larger files" |
| Implementation detail | "Use Redis cache" | "Dashboard loads in under 1 second" |

---

## Final Review Checklist

Before submitting for development:

### Content Quality

- [ ] Title is clear and descriptive
- [ ] Description is complete
- [ ] No ambiguous language
- [ ] No assumptions unstated
- [ ] Technical jargon explained

### Completeness

- [ ] All required fields filled
- [ ] Acceptance criteria defined
- [ ] Scope boundaries clear
- [ ] Dependencies listed
- [ ] Priority assigned

### Consistency

- [ ] Follows team templates
- [ ] Consistent terminology
- [ ] Linked to related items
- [ ] Labels applied correctly

### Ready for Development

- [ ] Team can estimate effort
- [ ] No blocking questions
- [ ] Stakeholder approval (if needed)
- [ ] Design assets ready (if UI)

---

## Checklist Results

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

## Related Standards

- [Requirement Writing Guide](./requirement-writing.md)
- [Spec-Driven Development](../../../core/spec-driven-development.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-24 | Added: Standard sections (Purpose, Related Standards, Version History, License) |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
