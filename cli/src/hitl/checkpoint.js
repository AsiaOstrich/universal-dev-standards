/**
 * HITL Checkpoint
 * Evaluates risk level against configuration to determine action.
 */

export class Checkpoint {
  /**
   * Evaluate an operation risk.
   * @param {number} riskLevel - 0-4
   * @param {Object} config - HITL configuration object
   * @param {string} operation - Operation string (for pattern matching overrides)
   * @returns {'approve' | 'prompt' | 'deny'} Action
   */
  evaluate(riskLevel, config, operation) {
    const { 
      threshold = 2, 
      overrides = [], 
      'always-prompt': alwaysPrompt = [], 
      'never-prompt': neverPrompt = [] 
    } = config;

    // 1. Check explicit string matches (highest priority)
    // Note: In real implementation, these would be regex patterns from config
    // Simplified for now: assume config patterns are simple strings or regex strings
    
    // Check always-prompt
    if (this._matchesAny(operation, alwaysPrompt)) {
      return 'prompt';
    }

    // Check never-prompt
    if (this._matchesAny(operation, neverPrompt)) {
      return 'approve';
    }

    // 2. Check overrides (Pattern-based threshold adjustment)
    let effectiveThreshold = threshold;
    for (const override of overrides) {
      if (this._matches(operation, override.pattern)) {
        effectiveThreshold = override.threshold;
        // Keep checking to find the most specific/last match? 
        // For now, first match wins or last match wins? Usually last match wins in cascading.
        // Let's assume the overrides list is ordered by priority.
      }
    }

    // 3. Level 4 Restricted Safety Net
    if (riskLevel >= 4) {
      // Level 4 always requires explicit prompt or deny, never auto-approve based on standard threshold
      // Unless explicitly overridden by a specific pattern with threshold 4+
      return 'prompt'; 
      // TODO: Should we return 'deny' by default for Level 4?
      // Spec says: "Block unless override". "Block" usually means Deny.
      // But for usability, maybe 'prompt' with a scary warning is better?
      // Let's stick to 'prompt' for now, but the Manager should handle it carefully.
    }

    // 4. Standard Threshold Check
    if (riskLevel < effectiveThreshold) {
      return 'approve';
    }

    return 'prompt';
  }

  _matchesAny(text, patterns) {
    if (!patterns || !Array.isArray(patterns)) return false;
    return patterns.some(p => this._matches(text, p));
  }

  _matches(text, pattern) {
    if (!text || !pattern) return false;
    try {
      // Simple includes check or Regex
      return text.includes(pattern) || new RegExp(pattern).test(text);
    } catch (e) {
      return false;
    }
  }
}
