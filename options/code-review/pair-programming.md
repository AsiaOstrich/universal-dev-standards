# Pair Programming

> **Language**: English | [繁體中文](../../locales/zh-TW/options/code-review/pair-programming.md)

**Parent Standard**: [Code Review Checklist](../../core/code-review-checklist.md)

---

## Overview

Pair programming is a real-time collaborative code review approach where two developers work together at one workstation. One writes code (Driver) while the other reviews and guides (Navigator). This method provides immediate feedback and facilitates knowledge transfer.

## Best For

- Complex features requiring deep thought
- Knowledge transfer and onboarding
- Critical code paths
- Co-located or remote teams with good connectivity
- Junior developer mentoring

## Roles

### Driver
**Writes the code**
- Implement the solution
- Explain thought process
- Accept navigator's suggestions
- Focus on tactical implementation

### Navigator
**Reviews and guides**
- Review code in real-time
- Think about the bigger picture
- Suggest improvements
- Catch errors early
- Consider edge cases

## Pairing Patterns

### Ping Pong

Best for TDD workflows.

1. Driver writes failing test
2. Switch roles
3. New driver makes test pass
4. New driver writes next failing test
5. Switch and repeat

### Strong-Style

Best for knowledge transfer.

**Rule**: "For an idea to go from your head to the computer, it must go through someone else's hands"

- Navigator must verbalize all ideas
- Driver only types what navigator dictates
- Ensures full knowledge transfer

### Driver-Navigator (Traditional)

Most common pattern.

1. Driver focuses on tactical coding
2. Navigator thinks strategically
3. Switch every 25-30 minutes
4. Both contribute ideas

## Session Guidelines

### Preparation
- Define clear goal for session
- Set up shared development environment
- Agree on pairing pattern
- Clear distractions

### During Session
- Take breaks every 45-60 minutes
- Switch roles regularly (25-30 min)
- Communicate constantly
- Stay engaged and focused

### After Session
- Brief retrospective
- Document decisions made
- Commit and push code
- Share learnings

## Tools

### Remote Pairing
| Tool | Platform | Features |
|------|----------|----------|
| VS Code Live Share | VS Code | Real-time editing, terminals |
| JetBrains Code With Me | JetBrains IDEs | Full IDE sharing |
| Tuple | macOS | Low latency, drawing |
| Screen sharing | Any | Fallback option |

### Local Pairing
- Single computer with two keyboards/mice
- Large monitor or projector
- Comfortable seating arrangement

## Rules

| Rule | Description | Priority |
|------|-------------|----------|
| Regular switching | Switch roles every 25-30 minutes | Required |
| Verbal communication | Explain reasoning before suggesting | Required |
| Respect the driver | Guide verbally, don't grab keyboard | Required |
| Take breaks | Break every 45-60 minutes | Recommended |
| Stay engaged | Both should remain active | Required |

## Comparison with PR Review

| Aspect | Pair Programming | PR Review |
|--------|------------------|-----------|
| Timing | Real-time | Asynchronous |
| Feedback | Immediate | Delayed |
| Knowledge sharing | High | Medium |
| Documentation | Lower | Higher (PR comments) |
| Scalability | Limited | High |
| Remote-friendly | Challenging | Easy |
| Cost | Higher (2 people) | Lower |

## When to Use

### Good Candidates
- Complex algorithms
- Critical security code
- New team member onboarding
- Unfamiliar codebase exploration
- Design decisions

### Poor Candidates
- Simple, routine tasks
- Individual research/exploration
- Administrative code changes
- When either person is fatigued

## Related Options

- [PR Review](./pr-review.md) - Asynchronous code review
- [Automated Review](./automated-review.md) - Tool-assisted review

---

## References

- [Pair Programming Illuminated](https://www.amazon.com/Pair-Programming-Illuminated-Laurie-Williams/dp/0201745763)
- [Martin Fowler on Pair Programming](https://martinfowler.com/articles/on-pair-programming.html)

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
