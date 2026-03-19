/**
 * Workflow Phase Definitions
 *
 * Defines the phase graphs for each workflow type (SDD, TDD, BDD).
 * Used by WorkflowGate to validate phase transitions.
 *
 * @version 1.0.0
 */

/**
 * SDD workflow phase graph
 * Each phase lists its allowed predecessors (phases that must have been completed)
 */
export const SDD_PHASES = {
  discuss: {
    id: 'discuss',
    label: 'Discuss',
    predecessors: [],
    description: 'Capture gray areas, lock scope'
  },
  create: {
    id: 'create',
    label: 'Create',
    predecessors: [],  // discuss is recommended but not required
    description: 'Write spec document'
  },
  review: {
    id: 'review',
    label: 'Review',
    predecessors: ['create'],
    description: 'Validate spec with stakeholders'
  },
  approve: {
    id: 'approve',
    label: 'Approve',
    predecessors: ['review'],
    description: 'Sign off on spec'
  },
  implement: {
    id: 'implement',
    label: 'Implement',
    predecessors: ['approve'],
    description: 'Code following approved spec'
  },
  verify: {
    id: 'verify',
    label: 'Verify',
    predecessors: ['implement'],
    description: 'Confirm implementation matches spec'
  }
};

/**
 * TDD workflow phase graph (cyclic)
 */
export const TDD_PHASES = {
  red: {
    id: 'red',
    label: 'RED',
    predecessors: [],  // Entry point, or after refactor
    description: 'Write failing test'
  },
  green: {
    id: 'green',
    label: 'GREEN',
    predecessors: ['red'],
    description: 'Write minimal code to pass'
  },
  refactor: {
    id: 'refactor',
    label: 'REFACTOR',
    predecessors: ['green'],
    description: 'Improve code, keep tests passing'
  }
};

/**
 * BDD workflow phase graph
 */
export const BDD_PHASES = {
  discovery: {
    id: 'discovery',
    label: 'Discovery',
    predecessors: [],
    description: 'Explore behavior with stakeholders'
  },
  formulation: {
    id: 'formulation',
    label: 'Formulation',
    predecessors: ['discovery'],
    description: 'Write Gherkin scenarios'
  },
  automation: {
    id: 'automation',
    label: 'Automation',
    predecessors: ['formulation'],
    description: 'Implement step definitions'
  },
  living_docs: {
    id: 'living_docs',
    label: 'Living Docs',
    predecessors: ['automation'],
    description: 'Maintain as documentation'
  }
};

/**
 * Phase prerequisite checks — machine-executable validation functions
 * Each check returns { passed, message, guidance }
 */
export const PHASE_CHECKS = {
  sdd: {
    implement: [
      {
        id: 'spec_exists',
        description: 'At least one spec file exists',
        check: 'ls docs/specs/SPEC-*.md 2>/dev/null | head -1',
        expectedCondition: 'non_empty',
        guidance: 'No spec found. Run `/sdd create` to create one first.'
      },
      {
        id: 'spec_approved',
        description: 'Spec status is Approved',
        check: 'grep -l "^status: Approved" docs/specs/SPEC-*.md 2>/dev/null | head -1',
        expectedCondition: 'non_empty',
        guidance: 'No approved spec found. Run `/sdd approve SPEC-XXX.md` first.'
      }
    ],
    verify: [
      {
        id: 'implementation_exists',
        description: 'Implementation commits exist for the spec',
        check: 'grep -l "^status: Implemented\\|^status: Approved" docs/specs/SPEC-*.md 2>/dev/null | head -1',
        expectedCondition: 'non_empty',
        guidance: 'No implementation found. Run `/sdd implement SPEC-XXX.md` first.'
      }
    ]
  },
  tdd: {
    green: [
      {
        id: 'failing_test_exists',
        description: 'At least one failing test exists',
        guidance: 'No failing test found. Write a test first (RED phase) before writing implementation code.'
      }
    ],
    refactor: [
      {
        id: 'all_tests_passing',
        description: 'All tests must be passing',
        guidance: 'Some tests are still failing. Fix them first (GREEN phase) before refactoring.'
      }
    ]
  },
  bdd: {
    formulation: [
      {
        id: 'examples_collected',
        description: 'Concrete examples from discovery phase exist',
        guidance: 'No examples collected yet. Complete the DISCOVERY phase first to gather concrete examples.'
      }
    ],
    automation: [
      {
        id: 'feature_file_exists',
        description: 'At least one .feature file exists',
        check: 'ls tests/features/*.feature 2>/dev/null | head -1',
        expectedCondition: 'non_empty',
        guidance: 'No .feature file found. Write Gherkin scenarios first (FORMULATION phase).'
      }
    ]
  }
};

/**
 * All workflow definitions indexed by name
 */
export const WORKFLOW_DEFINITIONS = {
  sdd: { phases: SDD_PHASES, checks: PHASE_CHECKS.sdd },
  tdd: { phases: TDD_PHASES, checks: PHASE_CHECKS.tdd },
  bdd: { phases: BDD_PHASES, checks: PHASE_CHECKS.bdd }
};

export default WORKFLOW_DEFINITIONS;
