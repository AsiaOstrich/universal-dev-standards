// [Source: DEC-115-L1 (dev-platform cross-project/decisions/DEC-115-memory-code-reference-check.md)]
// developer-memory 1.2.0: `code-reference` staleness check in review.checks.
// Reuses knowledge-graph-memory 1.0.0's existing degraded/engine dual mode
// rather than inventing a third; unresolvable must never read as present or
// missing.
// Pattern: AAA (Arrange-Act-Assert)

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { load } from 'js-yaml';

const AI_YAML_PATH = resolve(import.meta.dirname, '../../../../ai/standards/developer-memory.ai.yaml');

describe('developer-memory code-reference staleness', () => {
  let doc;
  let standard;
  let checks;
  let codeReferenceCheck;

  beforeAll(() => {
    const content = readFileSync(AI_YAML_PATH, 'utf-8');
    doc = load(content);
    standard = doc.standard;
    checks = standard?.operations?.review?.checks || [];
    codeReferenceCheck = checks.find((c) => c.type === 'code-reference');
  });

  it('is a review check with a degraded mode and an engine mode', () => {
    // Arrange — nothing further to arrange; doc parsed in beforeAll.

    // Act / Assert — version bumped to 1.2.0 (minor: new review check added)
    expect(standard.meta.version).toBe('1.2.0');

    // Assert — review.checks carries a code-reference staleness entry
    expect(codeReferenceCheck).toBeDefined();
    expect(codeReferenceCheck.type).toBe('code-reference');
    expect(codeReferenceCheck.trigger).toMatch(/file path|symbol/i);
    expect(codeReferenceCheck.trigger).toMatch(/no longer exists|moved/i);

    // Assert — both modes present, reusing knowledge-graph-memory 1.0.0's
    // dual mode rather than inventing a third
    expect(codeReferenceCheck.modes).toBeDefined();
    expect(codeReferenceCheck.modes.degraded).toBeDefined();
    expect(codeReferenceCheck.modes.engine).toBeDefined();
    expect(codeReferenceCheck.modes.degraded.source).toMatch(/knowledge-graph-memory/);
    expect(codeReferenceCheck.modes.engine.source).toMatch(/knowledge-graph-memory/);
    // Degraded mode: AI verifies itself, no engine required.
    expect(codeReferenceCheck.modes.degraded.how).toMatch(/Glob|Grep|Read/);
    // Engine mode: reports the four states, e.g. via EngramGraph's `egr refs check`.
    expect(codeReferenceCheck.modes.engine.how).toMatch(/present/);
    expect(codeReferenceCheck.modes.engine.how).toMatch(/moved/);
    expect(codeReferenceCheck.modes.engine.how).toMatch(/missing/);
    expect(codeReferenceCheck.modes.engine.how).toMatch(/unresolvable/);

    // Assert — unresolvable must not collapse into present or missing
    expect(codeReferenceCheck.unresolvable_rule).toBeDefined();
    expect(codeReferenceCheck.unresolvable_rule).toMatch(/unresolvable/i);
    expect(codeReferenceCheck.unresolvable_rule).toMatch(/must not/i);
    expect(codeReferenceCheck.unresolvable_rule).toMatch(/present or missing|present.*missing/i);

    // Assert — first-batch scope: file paths + symbol names only, file:line out
    expect(codeReferenceCheck.scope).toMatch(/file path/i);
    expect(codeReferenceCheck.scope).toMatch(/symbol/i);
    expect(codeReferenceCheck.scope.toLowerCase()).toMatch(/file:line/);
    expect(codeReferenceCheck.scope).toMatch(/out of scope/i);

    // Assert — timing hooked to proactive-surfacing: check runs before surfacing
    expect(codeReferenceCheck.timing).toMatch(/proactive-surfacing/);
    expect(codeReferenceCheck.timing).toMatch(/before/i);

    const surfacingRule = (standard.rules || []).find((r) => r.id === 'proactive-surfacing');
    expect(surfacingRule).toBeDefined();
    expect(surfacingRule.instruction).toMatch(/code-reference/);
  });
});
