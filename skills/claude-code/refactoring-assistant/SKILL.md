---
name: refactoring-assistant
scope: universal
description: |
  Guide refactoring decisions and large-scale code improvements.
  Use when: refactoring code, legacy modernization, technical debt, rewrite decisions.
  Keywords: refactor, rewrite, legacy, strangler, technical debt, 重構, 重寫, 技術債.
---

# Refactoring Assistant

> **Language**: English | [繁體中文](../../../locales/zh-TW/skills/claude-code/refactoring-assistant/SKILL.md)

**Version**: 2.0.0
**Last Updated**: 2026-01-21
**Applicability**: Claude Code Skills

---

## Purpose

This skill provides decision frameworks for refactoring vs rewriting, large-scale refactoring patterns, and technical debt management. Strategies are organized into three tiers: Tactical (daily), Strategic (architectural), and Safety (legacy code).

---

## Quick Reference (YAML Compressed)

```yaml
# === DECISION: Refactor vs Rewrite ===
decision_tree:
  - q: "Code in production?"
    n: "→ Consider rewrite (lower risk)"
    y: next
  - q: "Understand what code does?"
    n: "→ Characterization tests first"
    y: next
  - q: "Test coverage >60%?"
    n: "→ Add tests first"
    y: next
  - q: "Core architecture salvageable?"
    n: "→ Strangler Fig pattern"
    y: "→ Incremental Refactoring ✓"

comparison_matrix:
  favor_refactor: [large_codebase, good_tests, business_critical, team_knows_code, sound_arch, tight_deadline, low_risk]
  favor_rewrite: [small_isolated, no_tests, can_tolerate_downtime, no_knowledge, flawed_arch, flexible_time, higher_risk]

# === WARNING: Second-System Effect ===
rewrite_antipatterns:
  - "Adding features not in original"
  - "Over-abstracting for future flexibility"
  - "Ignoring lessons from existing system"
quote: "The second system is the most dangerous system a person ever designs. — Fred Brooks"

# === TACTICAL: Daily Refactoring Strategies ===
tactical:
  preparatory_refactoring:
    definition: "Restructure code to make upcoming change easier"
    quote: "First make the change easy (this might be hard), then make the easy change. — Kent Beck"
    when: [feature_blocked, reduce_friction, upcoming_changes]
    workflow:
      1: "Identify the change you want to make"
      2: "Identify what makes this change difficult"
      3: "Refactor to make the change easy"
      4: "Make the (now easy) change"
    principles:
      - "Preparatory refactoring is separate commit from feature"
      - "Each step maintains passing tests"
      - "Don't combine refactoring with feature work"

  boy_scout_rule:
    definition: "Leave code cleaner than you found it (opportunistic refactoring)"
    quote: "Leave the campground cleaner than you found it. — Robert C. Martin"
    when: [any_maintenance, bug_fixes, feature_additions, fighting_entropy]
    guidelines:
      - "Only small improvements (minutes, not hours)"
      - "Don't change behavior"
      - "Don't break existing tests"
      - "Keep scope within current task"
    examples:
      - "Rename confusingly-named variable"
      - "Extract lines into well-named method"
      - "Remove dead code"
      - "Add clarifying comment"
    antipatterns:
      - "Turning bug fix into major refactoring"
      - "Refactoring unrelated code"
      - "Changes without test coverage"
      - "Scope creep beyond original task"

  red_green_refactor:
    definition: "TDD refactoring phase"
    duration: "5-15 min per cycle"
    scope: "single method/class"
    techniques: [extract_method, rename, inline_var, replace_magic_number]
    reference: "→ See TDD Standards"

# === STRATEGIC: Architectural Refactoring ===
strategic:
  strangler_fig:
    definition: "Gradually replace legacy by routing to new system"
    origin: "Named after strangler fig trees"
    phases:
      1_intercept: "Request → Facade → Legacy(100%)"
      2_migrate: "Request → Facade → [New(Feature), Legacy(Rest)]"
      3_complete: "Request → New(100%) [Legacy decommissioned]"
    checklist:
      - "Identify interception point"
      - "Create event capture layer"
      - "Implement first feature in new"
      - "Route traffic incrementally"
      - "Monitor and compare"
      - "Decommission legacy"

  anti_corruption_layer:
    definition: "Translation layer preventing legacy model from polluting new system"
    origin: "Eric Evans, Domain-Driven Design (2003)"
    when:
      - "New and legacy must coexist and interact"
      - "Legacy has chaotic domain model"
      - "Protecting new system's Bounded Context"
    components:
      facade: "Simplifies complex legacy interfaces"
      adapter: "Converts legacy data to new domain model"
      translator: "Maps legacy terminology to ubiquitous language"
    checklist:
      - "Define clear ACL interface"
      - "Map legacy entities to new model"
      - "Handle data format conversions"
      - "Implement error translation"
      - "Add logging for debugging"
      - "Test ACL isolation thoroughly"
    vs_strangler:
      strangler: "Goal is to replace legacy"
      acl: "Goal is to coexist with legacy"

  branch_by_abstraction:
    steps:
      1: "Client → Abstraction(interface) → OldImpl"
      2: "Client → Abstraction → [OldImpl, NewImpl(toggled)]"
      3: "Client → NewImpl [OldImpl removed]"
    principles: [all_changes_on_trunk, feature_toggles, coexist_during_transition]

  parallel_change:
    aka: "Expand-Migrate-Contract"
    phases:
      expand: "Add new alongside old, new code uses new, old still works"
      migrate: "Update all clients to new, verify, data migration"
      contract: "Remove old, clean up, update docs"

# === SAFETY: Legacy Code Strategies ===
safety:
  legacy:
    definition: "Code without tests (regardless of age)"
    dilemma: "Need tests to change safely → Need to change to add tests"
    solution: "Safe techniques to add tests first"

  characterization_tests:
    purpose: "Capture existing behavior (not verify correctness)"
    process:
      1: "Call code to understand"
      2: "Write assertion expected to FAIL"
      3: "Run, see actual result"
      4: "Update assertion to match actual"
      5: "Repeat until behavior covered"
    principle: "Document what code DOES, not what it SHOULD do"

  scratch_refactoring:
    definition: "Refactor to understand, discard all changes"
    workflow:
      1: "Create scratch branch (or git stash)"
      2: "Aggressively refactor to understand"
      3: "Take notes on learnings"
      4: "Discard changes (git reset --hard)"
      5: "Apply learnings to write characterization tests"
    when: [code_too_complex, no_docs, need_mental_model_fast]
    principle: "Goal is understanding, not clean code"

  seams:
    definition: "Place to alter behavior without editing code"
    object: "Override via polymorphism (inject test double)"
    preprocessing: "Compile-time substitution (macros)"
    link: "Replace at link time (DI, module replacement)"

  sprout_wrap:
    sprout_method: "New logic → create new method, call from old"
    sprout_class: "New logic evolves independently → new class"
    wrap_method: "Add before/after → rename original, create wrapper"
    wrap_class: "Decorate existing → decorator pattern"
    principle: "New code uses TDD; legacy untouched until tested"

# === DATABASE: Refactoring ===
db_expand_contract:
  expand: "Add new column/table, app writes BOTH, safe to rollback"
  migrate: "Copy data, verify consistency, app reads from new"
  contract: "Confirm old unused, remove old, cleanup dual-write"

db_scenarios:
  rename_column: {strategy: "add→migrate→drop", risk: medium}
  split_table: {strategy: "new+FK→migrate→adjust", risk: high}
  merge_tables: {strategy: "new→merge→switch", risk: high}
  change_datatype: {strategy: "new_col→convert→switch", risk: medium}
  add_not_null: {strategy: "fill_defaults→add_constraint", risk: low}

# === WORKFLOW: Safe Refactoring ===
before: [define_success_criteria, "coverage>80%", clean_working_dir, create_branch, communicate]
during: [one_small_change, test_after_every_change, revert_if_fail, commit_frequently, no_new_functionality]
after: [all_tests_pass, measurably_better, docs_updated, team_reviewed, no_new_functionality]

# === METRICS ===
code_quality:
  cyclomatic_complexity: "<10/function"
  cognitive_complexity: "lower=better"
  coupling: "reduce"
  cohesion: "increase"
  duplication: "<3%"

test_quality:
  coverage: "≥80%, don't decrease"
  speed: "faster after refactoring"
  flaky_count: "decrease"

# === TECHNICAL DEBT ===
quadrant: # Martin Fowler
  prudent_deliberate: "We know this is debt"
  reckless_deliberate: "No time for design"
  prudent_inadvertent: "Now we know how we should have done it"
  reckless_inadvertent: "What's layering?"

priority:
  high: {criteria: "blocks dev, frequent bugs", action: "address immediately"}
  medium: {criteria: "slows dev, increases complexity", action: "plan next sprint"}
  low: {criteria: "minor annoyance, isolated", action: "address opportunistically"}

tracking:
  fields: [description, impact, estimated_effort, risk_if_ignored, related_code]

# === DECISION MATRIX SUMMARY ===
decision_matrix:
  - {strategy: "Preparatory Refactoring", scale: "Small", risk: "Low", use: "Reduce friction before feature work"}
  - {strategy: "Boy Scout Rule", scale: "Very Small", risk: "Low", use: "Continuous debt repayment"}
  - {strategy: "Red-Green-Refactor", scale: "Small", risk: "Low", use: "TDD development cycle"}
  - {strategy: "Strangler Fig", scale: "Large", risk: "Medium", use: "System replacement"}
  - {strategy: "Anti-Corruption Layer", scale: "Medium", risk: "Low", use: "New-legacy coexistence"}
  - {strategy: "Branch by Abstraction", scale: "Large", risk: "Medium", use: "Trunk refactoring"}
  - {strategy: "Parallel Change", scale: "Medium", risk: "Low", use: "Interface/schema migration"}
  - {strategy: "Characterization Tests", scale: "—", risk: "—", use: "Prerequisite for legacy refactoring"}
  - {strategy: "Scratch Refactoring", scale: "Small", risk: "Low", use: "Understanding black-box code"}

# === STRATEGY SELECTION ===
selection_guide:
  feature_blocked_by_messy_code: "Preparatory Refactoring"
  touching_code_during_bug_fix: "Boy Scout Rule"
  writing_new_code_with_tdd: "Red-Green-Refactor"
  replacing_entire_legacy_system: "Strangler Fig"
  integrating_without_pollution: "Anti-Corruption Layer"
  refactoring_shared_code_on_trunk: "Branch by Abstraction"
  changing_widely_used_interface: "Parallel Change"
  working_with_untested_legacy: "Characterization Tests + Scratch Refactoring FIRST"
```

---

## Configuration Detection

### Detection Order

1. Check `CONTRIBUTING.md` for "Disabled Skills" section
2. Check `CONTRIBUTING.md` for "Refactoring Standards" section
3. If not found, **default to standard refactoring practices**

---

## Detailed Guidelines

For complete standards, see:
- [Refactoring Standards](../../../core/refactoring-standards.md)

---

## Related Standards

- [Refactoring Standards](../../../core/refactoring-standards.md) - Core standard
- [Test-Driven Development](../../../core/test-driven-development.md) - TDD refactor phase
- [Code Review Checklist](../../../core/code-review-checklist.md) - Refactoring PR review
- [Checkin Standards](../../../core/checkin-standards.md) - Pre-commit requirements
- [TDD Assistant](../tdd-assistant/SKILL.md) - TDD workflow

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2026-01-21 | Added tactical strategies (Preparatory Refactoring, Boy Scout Rule), Anti-Corruption Layer, Decision Matrix Summary. Reorganized into Tactical/Strategic/Safety tiers. |
| 1.0.0 | 2026-01-12 | Initial release |

---

## License

This skill is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
