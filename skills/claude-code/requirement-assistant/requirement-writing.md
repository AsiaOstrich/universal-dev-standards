# Requirement Writing Guide

> **Language**: English | [繁體中文](../../../../locales/zh-TW/skills/claude-code/requirement-assistant/requirement-writing.md)

**Version**: 1.0.0
**Last Updated**: 2025-12-24
**Applicability**: Claude Code Skills

---

## Purpose

This document provides comprehensive guidelines for writing clear and effective requirements.

---

## User Story Format

### Standard Template

```
As a [user role],
I want [goal/feature],
So that [benefit/value].
```

### Examples

**Good**:
```
As a registered user,
I want to reset my password via email,
So that I can regain access to my account if I forget my password.
```

**Bad**:
```
Users should be able to reset passwords.
(Missing: who, why, acceptance criteria)
```

---

## INVEST Criteria

### I - Independent

- Story can be developed and delivered independently
- Minimal dependencies on other stories
- Can be prioritized and scheduled flexibly

**Test**: "Can we deliver this without finishing another story first?"

### N - Negotiable

- Details are not locked in stone
- Conversation starter, not a contract
- Implementation approach can be discussed

**Test**: "Is there room for technical discussion?"

### V - Valuable

- Delivers value to users or stakeholders
- Solves a real problem
- Contributes to business goals

**Test**: "What problem does this solve? Who benefits?"

### E - Estimable

- Team can estimate the effort
- Scope is understood well enough
- No major unknowns

**Test**: "Can we give a rough estimate?"

### S - Small

- Can be completed in one sprint
- Typically 1-5 days of work
- If larger, break into smaller stories

**Test**: "Can we finish this in one sprint?"

### T - Testable

- Clear acceptance criteria
- Can write automated tests
- Definition of done is clear

**Test**: "How do we know this is done?"

---

## Acceptance Criteria

### Format Options

#### Given-When-Then (BDD Style)

```gherkin
Given [precondition]
When [action]
Then [expected result]
```

**Example**:
```gherkin
Given I am on the login page
When I enter valid credentials and click login
Then I should be redirected to the dashboard
```

#### Checkbox Style

```markdown
- [ ] User can upload files up to 10MB
- [ ] Supported formats: JPG, PNG, PDF
- [ ] Upload progress is displayed
- [ ] Error message shown if upload fails
```

### Writing Good Acceptance Criteria

| Quality | Good | Bad |
|---------|------|-----|
| **Specific** | "Error message displays within 2 seconds" | "Error handling works" |
| **Measurable** | "Response time < 500ms" | "System is fast" |
| **Testable** | "User sees confirmation modal" | "User experience is good" |
| **Complete** | Lists all scenarios | Missing edge cases |

### Checklist

- [ ] All happy path scenarios covered
- [ ] Error scenarios defined
- [ ] Edge cases considered
- [ ] Performance criteria (if applicable)
- [ ] Security requirements (if applicable)
- [ ] Accessibility requirements (if applicable)

---

## Requirement Types

### Functional Requirements (FR)

**What the system should DO**

```markdown
### FR1: User Registration

**Description**: Users can create new accounts using email.

**Acceptance Criteria**:
- [ ] Email format validation
- [ ] Password strength requirements (min 8 chars, 1 uppercase, 1 number)
- [ ] Confirmation email sent
- [ ] Duplicate email prevention
```

### Non-Functional Requirements (NFR)

**How the system should BEHAVE**

| Category | Example |
|----------|---------|
| **Performance** | Response time < 200ms for 95th percentile |
| **Scalability** | Support 10,000 concurrent users |
| **Security** | All data encrypted in transit (TLS 1.3) |
| **Availability** | 99.9% uptime |
| **Usability** | WCAG 2.1 AA compliance |

---

## Priority Frameworks

### MoSCoW Method

| Priority | Meaning | Description |
|----------|---------|-------------|
| **M**ust Have | Critical | Release cannot proceed without |
| **S**hould Have | Important | High value but not blocking |
| **C**ould Have | Desirable | Nice to have, lower priority |
| **W**on't Have | Out of scope | Not this release |

### Numbered Priority (P0-P3)

| Level | Label | Description | Example |
|-------|-------|-------------|---------|
| P0 | Critical | Showstopper | Security vulnerability |
| P1 | High | Must fix soon | Core feature bug |
| P2 | Medium | Should fix | UX improvement |
| P3 | Low | Nice to have | Minor enhancement |

---

## Issue Templates

### Feature Request

```markdown
## Summary
[One-line description of the feature]

## Motivation
### Problem Statement
[What problem does this solve?]

### User Impact
[Who is affected and how?]

## Detailed Description
[Full description of the requested feature]

## Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

## Design Considerations
[Any technical considerations or constraints]

## Out of Scope
- [What this feature does NOT include]

## Priority
- [ ] P0 - Critical
- [ ] P1 - High
- [ ] P2 - Medium
- [ ] P3 - Low
```

### Bug Report

```markdown
## Description
[Clear, concise description of the bug]

## Steps to Reproduce
1. [First step]
2. [Second step]
3. [Third step]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Screenshots/Logs
[If applicable]

## Environment
- OS: [e.g., Windows 11, macOS 14]
- Browser: [e.g., Chrome 120]
- Version: [e.g., v1.2.3]

## Severity
- [ ] Critical - System unusable
- [ ] High - Major feature broken
- [ ] Medium - Minor feature broken
- [ ] Low - Cosmetic issue
```

### Technical Task

```markdown
## Summary
[One-line description]

## Background
[Why is this needed? Context.]

## Technical Details
[Implementation details, approach]

## Acceptance Criteria
- [ ] [Technical criterion 1]
- [ ] [Technical criterion 2]

## Dependencies
- [List any dependencies]

## Risks
- [List any risks or concerns]
```

---

## Common Mistakes

### Too Vague

❌ **Bad**:
```
Make the system faster.
```

✅ **Good**:
```
Reduce API response time to under 200ms for the /users endpoint.
```

### Solution Instead of Problem

❌ **Bad**:
```
Add a Redis cache.
```

✅ **Good**:
```
Improve dashboard load time from 5s to under 1s.
(Redis cache may be one solution, but let team decide)
```

### Missing Acceptance Criteria

❌ **Bad**:
```
Implement user authentication.
```

✅ **Good**:
```
Implement user authentication.

Acceptance Criteria:
- [ ] Users can register with email/password
- [ ] Users can log in with credentials
- [ ] Users can reset password via email
- [ ] Session expires after 24 hours of inactivity
- [ ] Failed login attempts limited to 5 per hour
```

### Too Large

❌ **Bad**:
```
Build the entire e-commerce platform.
```

✅ **Good**:
```
Epic: E-commerce Platform

Story 1: User can browse product catalog
Story 2: User can add items to cart
Story 3: User can checkout with credit card
Story 4: Admin can manage inventory
```

---

## Requirement Review Checklist

Before submitting a requirement:

- [ ] Clear problem statement
- [ ] Target user/persona identified
- [ ] Acceptance criteria defined
- [ ] Priority assigned
- [ ] Scope boundaries clear
- [ ] Dependencies identified
- [ ] Follows INVEST principles
- [ ] Testable and measurable
- [ ] No implementation details (unless necessary)

---

## Related Standards

- [Requirement Completeness Checklist](./requirement-checklist.md)
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
