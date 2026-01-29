/**
 * HITL Risk Classifier
 * Classifies operations into risk levels (0-4) based on patterns.
 */

export class RiskClassifier {
  constructor() {
    this.rules = [
      // Level 4: Restricted (Destructive & Hard to Recover)
      { pattern: /^rm\s+-(r|R|rf|fR)/, level: 4 },
      { pattern: /drop\s+table/i, level: 4 },
      { pattern: /git\s+push\s+.*--force/, level: 4 },
      
      // Level 3: Critical (Destructive or Security Sensitive)
      { pattern: /^(delete|remove|unlink)/i, level: 3 },
      { pattern: /^(deploy|publish|release)/i, level: 3 },
      { pattern: /(auth|secret|password|token|key)/i, level: 3 },
      { pattern: /^rm\s+/, level: 3 }, // Simple rm
      
      // Level 2: Elevated (Changes Config or Env)
      { pattern: /^(npm|pip|yarn|pnpm)\s+install/, level: 2 },
      { pattern: /^config\s+set/, level: 2 },
      { pattern: /^chmod/, level: 2 },
      
      // Level 1: Standard (Modifies Files)
      { pattern: /^(write|edit|modify|touch|mkdir)/i, level: 1 },
      { pattern: /^git\s+commit/, level: 1 },
      
      // Level 0: Routine (Read-only)
      { pattern: /^(read|cat|ls|grep|find|search)/i, level: 0 }
    ];
  }

  /**
   * Classify an operation string into a risk level.
   * @param {string} operation - The operation description or command
   * @returns {number} Risk level (0-4)
   */
  classify(operation) {
    if (!operation || typeof operation !== 'string') {
      return 1; // Default to Standard if unknown
    }

    const op = operation.trim();

    for (const rule of this.rules) {
      if (rule.pattern.test(op)) {
        return rule.level;
      }
    }

    return 1; // Default to Standard
  }
}
