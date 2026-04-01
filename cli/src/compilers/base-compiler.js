/**
 * Base Compiler — Abstract compiler interface for Standards-as-Hooks
 *
 * Subclasses implement compile() to generate target-specific hook configurations.
 *
 * @module compilers/base-compiler
 * @see docs/specs/SPEC-COMPILE-001-standards-as-hooks-compiler.md (REQ-1)
 */

export class BaseCompiler {
  /**
   * Filter standards that have an enforcement block.
   * @param {Array<Object>} standards - Array of parsed standard objects
   * @returns {Array<Object>} Standards with enforcement fields only
   */
  filterEnforceable(standards) {
    return standards.filter((s) => s.enforcement != null);
  }

  /**
   * Compile enforceable standards into target-specific hook configuration.
   * Must be overridden by subclasses.
   * @param {Array<Object>} standards - Array of parsed standard objects
   * @returns {Object} Target-specific configuration
   * @throws {Error} When called on base class
   */
  compile(standards) {
    throw new Error('compile() must be implemented by subclass');
  }
}
