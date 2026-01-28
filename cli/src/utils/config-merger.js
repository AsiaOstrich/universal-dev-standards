/**
 * Configuration Merger for UDS
 * Handles deep merging of configuration objects with support for special strategies.
 */

export class ConfigMerger {
  /**
   * Deep merge two objects.
   * @param {Object} base - The base object (lower priority)
   * @param {Object} override - The override object (higher priority)
   * @returns {Object} - The merged object
   */
  static merge(base, override) {
    if (!base) return override || {};
    if (!override) return base || {};

    const result = { ...base };

    for (const key in override) {
      const value = override[key];

      // Handle arrays
      if (Array.isArray(value)) {
        // Special strategy: $append
        if (value.length > 0 && typeof value[0] === 'object' && value[0].$append) {
          const itemsToAppend = value[0].$append;
          result[key] = Array.isArray(base[key]) ? [...base[key], ...itemsToAppend] : itemsToAppend;
        } else {
          // Default: Replace array
          result[key] = value;
        }
        continue;
      }

      // Handle nested objects
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = this.merge(base[key] || {}, value);
        continue;
      }

      // Handle primitives
      result[key] = value;
    }

    return result;
  }
}
