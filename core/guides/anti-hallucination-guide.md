# Anti-Hallucination Guide

> **Language**: English | [繁體中文](../../locales/zh-TW/core/guides/anti-hallucination-guide.md)

**Version**: 1.0.0
**Last Updated**: 2026-01-29
**Related Standard**: [Anti-Hallucination Standards](../anti-hallucination.md)

---

## Purpose

This guide provides detailed examples, conversation patterns, and case studies for preventing AI hallucination. For the core mandates, tagging system, and verification checklist, see [Anti-Hallucination Standards](../anti-hallucination.md).

---

## Table of Contents

1. [Understanding AI Hallucination](#understanding-ai-hallucination)
2. [Conversation Language Guidelines](#conversation-language-guidelines)
3. [Recommendation Best Practices](#recommendation-best-practices)
4. [Detailed Examples by Category](#detailed-examples-by-category)
5. [Review Scenarios](#review-scenarios)
6. [AI Assistant Workflow](#ai-assistant-workflow)
7. [Language-Agnostic Application](#language-agnostic-application)
8. [Integration with Code Review](#integration-with-code-review)

---

## Understanding AI Hallucination

AI hallucination occurs when an AI assistant generates information that appears authoritative but is:
- **Fabricated**: Made up without evidence
- **Assumed**: Based on patterns rather than facts
- **Outdated**: From training data, not current reality
- **Misattributed**: Confused with similar but different systems

### Why It Matters in Software Development

| Risk | Impact | Example |
|------|--------|---------|
| **Fabricated APIs** | Runtime errors, wasted debugging time | "Call `user.authenticate()` method" (doesn't exist) |
| **Wrong configurations** | Security vulnerabilities, system failures | "Set `DEBUG=true` in production" (wrong variable) |
| **Assumed requirements** | Building wrong features | "Users need SSO" (never specified) |
| **Outdated patterns** | Technical debt, security issues | "Use `componentWillMount`" (deprecated in React 17) |

---

## Conversation Language Guidelines

### Adapting to User Preferences

AI assistants should adapt to the user's preferred language while preserving technical accuracy:

| Context | Guideline | Example |
|---------|-----------|---------|
| Conversation | Use project's specified language | Traditional Chinese, English, etc. |
| Certainty Tags | Use project's specified language | `[Confirmed]` or `[已確認]` |
| Error Explanation | Use project's specified language | Explain compile/runtime errors in user's language |
| Technical Terms | Preserve original | JWT, BCrypt, API, Token |
| Code Comments | Follow project convention | Usually English |
| Commit Messages | Follow project convention | e.g., `feat(auth): add login feature` |

---

## Recommendation Best Practices

### Always Include a Recommended Choice

When providing multiple options, always include a recommended choice with reasoning:

**❌ Incorrect**:
```
There are three options:
1. Use Redis caching
2. Use in-memory caching
3. Use file-based caching

Please choose one.
```

**✅ Correct**:
```
There are three options:
1. Use Redis caching
2. Use in-memory caching
3. Use file-based caching

**Recommended: Option 1 (Redis)**: Given the project already has Redis infrastructure
and needs cross-instance cache sharing, Redis is the most suitable choice.
```

### Next Step Suggestions

Upon completing a task or subtask, always suggest logical next steps:

**✅ Correct**:
```
Task completed: API endpoint implemented.

**Suggested Next Steps**:
1. **[Recommended]** Add unit tests for the new endpoint (`src/tests/api/`)
2. Update API documentation (`docs/api-reference.md`)
3. Start frontend integration
```

---

## Detailed Examples by Category

### 1. Fabricating APIs or Function Signatures

**❌ Incorrect**:
```
Assistant: "You can call UserService.GetUserById(int id) to retrieve users"
```
**Problem**: Method doesn't exist or has different signature.

**✅ Correct**:
```
Assistant: "Let me read the UserService file to find the correct method signature."

[After reading src/services/UserService.cs]

[Source: Code] UserService.cs:45 - Found method: FindUser(Guid userId)
The actual method uses Guid instead of int for the user ID parameter.
```

---

### 2. Assuming Requirements

**❌ Incorrect**:
```
Assistant: "The system needs to support OAuth and SAML for enterprise SSO."
```
**Problem**: User only asked about authentication, didn't specify protocols.

**✅ Correct**:
```
Assistant: "[Need Confirmation] You mentioned needing authentication.
Could you clarify:
1. Is this for internal users, external customers, or both?
2. Do you need enterprise SSO (OAuth/SAML) or simple username/password?
3. Any existing identity providers to integrate with?

This will help me recommend the most appropriate approach."
```

---

### 3. Speculating About Unread Code

**❌ Incorrect**:
```
Assistant: "The PaymentService handles credit card processing and integrates with Stripe."
```
**Problem**: File wasn't read, functionality is assumed from the name.

**✅ Correct**:
```
Assistant: "I see a file named PaymentService.cs in your project structure.

[Unknown] I haven't read this file yet, so I cannot confirm its functionality.

Would you like me to read src/services/PaymentService.cs to understand:
- Which payment provider it uses?
- What payment methods are supported?
- How transactions are processed?"
```

---

### 4. Inventing Configuration

**❌ Incorrect**:
```
Assistant: "Set the DATABASE_URL environment variable to connect to PostgreSQL.
Your connection string should be in appsettings.json under 'ConnectionStrings:DefaultConnection'."
```
**Problem**: Configuration structure and variable names assumed without verification.

**✅ Correct**:
```
Assistant: "Let me check your actual configuration files."

[After reading appsettings.json]

[Source: Code] appsettings.json:8-12 - Found database configuration:
- Connection string key: "ConnectionStrings:MainDb" (not "DefaultConnection")
- Using SQL Server, not PostgreSQL
- Additional setting "CommandTimeout": 30

Your project uses a different key name than the .NET default.
```

---

### 5. Hallucinating Errors or Bugs

**❌ Incorrect**:
```
Assistant: "Your authentication code has a security vulnerability -
you're not hashing passwords properly."
```
**Problem**: Claiming a bug without reading the actual code.

**✅ Correct**:
```
Assistant: "Let me review your authentication implementation."

[After reading src/auth/AuthService.cs]

[Confirmed] AuthService.cs:67 - Password hashing implementation found:
- Using BCrypt with work factor 12 ✅
- Salt is auto-generated ✅
- No timing attack vulnerabilities detected ✅

Your password hashing implementation follows security best practices.
No issues found in the reviewed code.
```

---

### 6. Options Without Recommendation

**❌ Incorrect**:
```
Assistant: "You can use: 1) JWT 2) Session 3) OAuth. Which do you prefer?"
```
**Problem**: Lists options without guidance or context consideration.

**✅ Correct**:
```
Assistant: "Based on your requirements:

**Options**:
1. JWT - Stateless, scalable, good for APIs
2. Session - Server-side state, traditional web apps
3. OAuth - Third-party identity providers

**Recommended: JWT**

[Inferred] Based on your microservices architecture (seen in docker-compose.yml),
JWT is the best fit because:
- Stateless: No session store needed across services
- Scalable: Each service can validate tokens independently
- Standard: Well-supported across your tech stack (.NET, React)

If you need social login later, you can add OAuth on top of JWT."
```

---

### 7. Implementing Without Side Effect Analysis

**❌ Incorrect**:
```
User: "Add a function to delete user accounts"
Assistant: "Here's the implementation:

public async Task DeleteUser(Guid userId) {
    await _dbContext.Users.Where(u => u.Id == userId).DeleteAsync();
}
"
```
**Problem**: Directly implementing without considering cascading effects.

**✅ Correct**:
```
User: "Add a function to delete user accounts"
Assistant: "Before implementing, let me identify potential side effects:

**Potential Side Effects**:
1. **Data Integrity**: Related records (orders, comments, sessions) may become orphaned
2. **External Systems**: May need to notify third-party services (payment provider, email service)
3. **Audit Trail**: Deletion may violate compliance requirements (GDPR right to be forgotten vs. audit logs)

[Need Confirmation] How should we handle:
- Related user data (cascade delete vs. anonymize)?
- Active sessions?
- Historical records for reporting?

Once clarified, I'll provide the implementation."
```

---

## Review Scenarios

### Scenario 1: Code Analysis

**User Request**: "Review the authentication logic"

**❌ Bad Response**:
```
Your authentication system uses JWT with RS256 signing.
The tokens expire after 1 hour.
You should add refresh token support.
```
**Problem**: Makes claims without reading code, assumes implementation details.

**✅ Good Response**:
```
[Need Confirmation] Which file contains the authentication logic?
Possible locations might be:
- src/auth/
- src/services/auth
- src/middleware/

Please direct me to the correct file so I can provide accurate analysis.

Alternatively, I can search the codebase for authentication-related files.
```

---

### Scenario 2: Architecture Recommendations

**User Request**: "How should I structure the new payment module?"

**❌ Bad Response**:
```
Based on your existing architecture, you should:
1. Create PaymentService in src/services/
2. Use the Stripe API
3. Store transactions in the payments table
```
**Problem**: Assumes architecture, payment provider, and database schema without evidence.

**✅ Good Response**:
```
To provide an accurate recommendation, I need to understand your current architecture:

[Need Confirmation]
1. What payment provider do you plan to use? (Stripe, PayPal, custom, etc.)
2. What is your existing service layer structure?
3. What database are you using?

Could you share:
- Project structure (ls -R src/ or similar)
- Existing service examples
- Database schema or ORM models

Once I review these, I can suggest a structure that aligns with your patterns.
```

---

### Scenario 3: Bug Investigation

**User Request**: "The login is failing"

**❌ Bad Response**:
```
The issue is likely in your validateCredentials() function.
You probably need to hash the password before comparison.
```
**Problem**: Guesses at cause without seeing code.

**✅ Good Response**:
```
To investigate the login failure, I need more information:

[Need Confirmation]
1. What error message are you seeing? (console logs, error responses)
2. Which file contains the login logic?
3. Can you share relevant code snippets or logs?

Suggested debugging steps:
- Share the login controller/service code
- Provide error logs from console/server
- Describe expected vs actual behavior

Once I review the actual code and errors, I can identify the root cause.
```

---

### Scenario 4: Technology Selection

**User Request**: "What caching solution should I use?"

**❌ Bad Response**:
```
You have several options:
1. Redis
2. Memcached
3. In-memory cache

Let me know which one you'd like to use.
```
**Problem**: Lists options without recommendation or context consideration.

**✅ Good Response**:
```
Based on the options available:
1. Redis - Distributed, persistent, rich data structures
2. Memcached - Simple, fast, distributed
3. In-memory cache - Local only, no setup required

**Recommended: Redis**

[Need Confirmation] Before finalizing, I'd like to understand:
- Do you need cache sharing across multiple instances?
- Is data persistence required?
- What's your existing infrastructure?

If you already have Redis infrastructure or need cross-instance sharing,
Redis is the best choice. If this is a single-instance application with
simple caching needs, in-memory cache would suffice.
```

---

## AI Assistant Workflow

```
┌─────────────────────────────────┐
│  User Request Received          │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  Identify Information Needed    │
│  - Code files?                  │
│  - Configuration?               │
│  - Requirements?                │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  Identify Potential Side Effects│
│  - State changes?               │
│  - Dependencies affected?       │
│  - External system impacts?     │
└─────────────┬───────────────────┘
              │
              ▼
         ┌────┴────┐
         │  Available?  │
         └────┬────┘
              │
      ┌───────┴───────┐
      │               │
     YES              NO
      │               │
      ▼               ▼
┌──────────┐   ┌─────────────┐
│  Read/   │   │  Ask User   │
│  Analyze │   │  for Info   │
└────┬─────┘   └──────┬──────┘
     │                │
     ▼                ▼
┌─────────────────────────────────┐
│  Tag Response with:             │
│  - [Confirmed] for facts        │
│  - [Inferred] for deductions    │
│  - [Need Confirmation] for gaps │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  Cite Sources (file:line)       │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  Include Recommendation         │
│  (if presenting options)        │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  Deliver Response               │
└─────────────────────────────────┘
```

---

## Language-Agnostic Application

This standard applies regardless of programming language, framework, or domain:

- **Web Development**: Don't assume Express/Django/Spring Boot without evidence
- **Mobile**: Don't assume React Native/Flutter without evidence
- **Data Science**: Don't assume TensorFlow/PyTorch without evidence
- **DevOps**: Don't assume Docker/Kubernetes without evidence

**Universal Rule**: Read first, analyze second, report with evidence always.

---

## Integration with Code Review

When performing code reviews, apply these principles:

1. **Cite Line Numbers**: All review comments must reference specific lines
2. **Classify Severity with Evidence**:
   - `[Confirmed Bug]` - Code demonstrably broken
   - `[Potential Issue]` - Code may cause problems
   - `[Suggestion]` - Improvement idea (not a defect)
3. **Avoid Assumptions**: If unsure about design intent, ask the author

**Review Comment Template**:
```
[file:line] - [Severity]
[Description of issue with code excerpt]
[Evidence or reasoning]
[Suggested fix or question for clarification]
```

---

## License

This guide is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
