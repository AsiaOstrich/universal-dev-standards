/**
 * Inquirer Checkbox Patch
 *
 * Monkey-patches inquirer's CheckboxPrompt to properly support the
 * `instructions: false` option, which is ignored in the default implementation.
 *
 * Problem: inquirer uses `this.dontShowHints` internally but only sets it to
 * true in `onEnd()`. The `instructions` option in the question config is
 * completely ignored.
 *
 * Solution: Extend CheckboxPrompt to respect `instructions: false` from the
 * question config by setting `dontShowHints = true` in the constructor.
 *
 * @see https://github.com/SBoudrias/Inquirer.js/blob/master/packages/inquirer/lib/prompts/checkbox.js
 */

import inquirer from 'inquirer';

// Flag to track if patch has been applied
let patchApplied = false;

/**
 * Patch inquirer checkbox to support translated instructions
 *
 * After calling this function, any checkbox prompt with `instructions: false`
 * will properly hide the default English hint text:
 * "(Press <space> to select, <a> to toggle all, <i> to invert selection, and <enter> to proceed)"
 *
 * Usage:
 * ```javascript
 * import { patchCheckboxInstructions } from '../utils/inquirer-patch.js';
 *
 * // Call once at module load
 * patchCheckboxInstructions();
 *
 * // Now checkbox prompts respect instructions: false
 * const { items } = await inquirer.prompt([{
 *   type: 'checkbox',
 *   name: 'items',
 *   message: 'Select items:',
 *   instructions: false,  // This now works!
 *   choices: [...]
 * }]);
 * ```
 */
export function patchCheckboxInstructions() {
  // Avoid applying patch multiple times
  if (patchApplied) {
    return;
  }

  // Get the original CheckboxPrompt class
  const originalCheckbox = inquirer.prompt.prompts?.checkbox;

  // If checkbox prompt is not available, skip patching silently
  // This is expected in test environments where inquirer is mocked
  if (!originalCheckbox) {
    return;
  }

  /**
   * Patched CheckboxPrompt that respects the `instructions` option
   */
  class PatchedCheckboxPrompt extends originalCheckbox {
    constructor(questions, rl, answers) {
      super(questions, rl, answers);

      // If instructions: false is set, hide the default hint
      // This is the key fix - the original implementation ignores this option
      if (this.opt.instructions === false) {
        this.dontShowHints = true;
      }
    }
  }

  // Register the patched prompt
  inquirer.registerPrompt('checkbox', PatchedCheckboxPrompt);

  patchApplied = true;
}

/**
 * Check if the patch has been applied
 * @returns {boolean} True if patch has been applied
 */
export function isPatchApplied() {
  return patchApplied;
}

/**
 * Reset patch state (mainly for testing)
 * Note: This does not restore the original checkbox prompt
 */
export function resetPatchState() {
  patchApplied = false;
}

export default patchCheckboxInstructions;
