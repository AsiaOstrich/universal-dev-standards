/**
 * Micro-Spec Module for Vibe Coding Integration
 *
 * Generates and manages lightweight specifications for vibe coding sessions.
 * Micro-specs capture intent before implementation, enabling traceability
 * without the overhead of formal specifications.
 *
 * @module vibe/micro-spec
 * @see docs/specs/system/vibe-coding-integration.md (AC-1)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync, renameSync } from 'node:fs';
import { join, basename } from 'node:path';
import { config } from '../utils/config-manager.js';

/**
 * Micro-spec status values
 */
export const SpecStatus = {
  DRAFT: 'draft',
  CONFIRMED: 'confirmed',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived'
};

/**
 * MicroSpec class for managing lightweight specifications
 */
export class MicroSpec {
  constructor(options = {}) {
    this.cwd = options.cwd || process.cwd();

    // Priority: CLI parameter > project config > default
    const configuredPath = config.get('specs.path', 'specs');
    this.specsDir = options.output
      ? join(this.cwd, options.output)
      : join(this.cwd, configuredPath);

    this.archiveDir = join(this.specsDir, 'archive');
    this.config = config.get('vibe-coding.micro-specs', {
      generate: true,
      requireConfirmation: true,
      storage: 'specs/'
    });
  }

  /**
   * Ensure the micro-specs directory exists
   */
  ensureDirectories() {
    if (!existsSync(this.specsDir)) {
      mkdirSync(this.specsDir, { recursive: true });
    }
    if (!existsSync(this.archiveDir)) {
      mkdirSync(this.archiveDir, { recursive: true });
    }
  }

  /**
   * Get the next available spec number
   * @returns {number} Next spec number
   */
  getNextSpecNumber() {
    this.ensureDirectories();
    const files = readdirSync(this.specsDir).filter(f => f.match(/^SPEC-\d{3}/));
    if (files.length === 0) return 1;

    const numbers = files.map(f => {
      const match = f.match(/^SPEC-(\d{3})/);
      return match ? parseInt(match[1], 10) : 0;
    });
    return Math.max(...numbers) + 1;
  }

  /**
   * Generate a unique spec ID based on sequential number and title
   * @param {string} title - Spec title
   * @returns {string} Unique spec ID (SPEC-XXX-slug format)
   */
  generateId(title) {
    const nextNumber = this.getNextSpecNumber();
    const paddedNumber = String(nextNumber).padStart(3, '0');

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 30);

    return `SPEC-${paddedNumber}-${slug}`;
  }

  /**
   * Parse intent description to extract structured information
   * @param {string} intent - Natural language intent description
   * @returns {Object} Parsed spec data
   */
  parseIntent(intent) {
    // Extract potential scope indicators
    const scopeIndicators = {
      frontend: /\b(ui|frontend|component|page|button|form|display|view)\b/i,
      backend: /\b(api|backend|endpoint|server|database|auth)\b/i,
      fullstack: /\b(full|complete|end.to.end|integration)\b/i,
      refactor: /\b(refactor|clean|improve|optimize)\b/i,
      fix: /\b(fix|bug|issue|error|broken)\b/i
    };

    let scope = 'general';
    for (const [key, pattern] of Object.entries(scopeIndicators)) {
      if (pattern.test(intent)) {
        scope = key;
        break;
      }
    }

    // Extract a title (first sentence or first 50 chars)
    const firstSentence = intent.split(/[.!?]/)[0].trim();
    const title = firstSentence.length > 50
      ? firstSentence.slice(0, 47) + '...'
      : firstSentence;

    return {
      title,
      intent: intent.trim(),
      scope,
      type: scope === 'fix' ? 'bugfix' : scope === 'refactor' ? 'refactor' : 'feature'
    };
  }

  /**
   * Generate acceptance criteria from intent
   * @param {string} intent - Intent description
   * @param {string} type - Spec type (feature/bugfix/refactor)
   * @returns {string[]} Generated acceptance criteria
   */
  generateAcceptanceCriteria(intent, type) {
    const criteria = [];

    // Add type-specific default criteria
    if (type === 'feature') {
      criteria.push('[ ] Feature implemented as described');
      criteria.push('[ ] No regressions introduced');
    } else if (type === 'bugfix') {
      criteria.push('[ ] Bug is fixed and verified');
      criteria.push('[ ] Root cause addressed');
    } else if (type === 'refactor') {
      criteria.push('[ ] Behavior unchanged');
      criteria.push('[ ] Code quality improved');
    }

    // Parse intent for additional criteria
    const lines = intent.split(/[,;.\n]/).filter(l => l.trim().length > 5);
    for (const line of lines.slice(0, 3)) {
      const cleaned = line.trim();
      if (cleaned && !criteria.some(c => c.includes(cleaned))) {
        criteria.push(`[ ] ${cleaned}`);
      }
    }

    return criteria.slice(0, 5); // Max 5 criteria
  }

  /**
   * Create a micro-spec from natural language intent
   * @param {string} intent - Natural language description
   * @param {Object} options - Additional options
   * @returns {Object} Created spec object
   */
  create(intent, options = {}) {
    this.ensureDirectories();

    const parsed = this.parseIntent(intent);
    const id = this.generateId(parsed.title);
    const criteria = this.generateAcceptanceCriteria(intent, parsed.type);

    const spec = {
      id,
      title: parsed.title,
      status: SpecStatus.DRAFT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      intent: parsed.intent,
      scope: options.scope || parsed.scope,
      type: parsed.type,
      acceptance: criteria,
      confirmed: false,
      notes: options.notes || ''
    };

    // Generate markdown content
    const markdown = this.toMarkdown(spec);

    // Save to file
    const filename = `${id}.md`;
    const filepath = join(this.specsDir, filename);
    writeFileSync(filepath, markdown, 'utf-8');

    return { spec, filepath, markdown };
  }

  /**
   * Convert spec object to markdown format
   * @param {Object} spec - Spec object
   * @returns {string} Markdown content
   */
  toMarkdown(spec) {
    const lines = [
      `## Micro-Spec: ${spec.title}`,
      '',
      `**Status**: ${spec.status}`,
      `**Created**: ${spec.createdAt.slice(0, 10)}`,
      `**Type**: ${spec.type}`,
      '',
      `**Intent**: ${spec.intent}`,
      '',
      `**Scope**: ${spec.scope}`,
      '',
      '**Acceptance**:',
      ...spec.acceptance.map(a => `- ${a}`),
      '',
      `**Confirmed**: ${spec.confirmed ? 'Yes' : 'No'}`,
      ''
    ];

    if (spec.notes) {
      lines.push('**Notes**:', spec.notes, '');
    }

    return lines.join('\n');
  }

  /**
   * Parse markdown file back to spec object
   * @param {string} content - Markdown content
   * @param {string} id - Spec ID
   * @returns {Object} Spec object
   */
  fromMarkdown(content, id) {
    const spec = {
      id,
      title: '',
      status: SpecStatus.DRAFT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      intent: '',
      scope: 'general',
      type: 'feature',
      acceptance: [],
      confirmed: false,
      notes: ''
    };

    // Parse title
    const titleMatch = content.match(/^## Micro-Spec: (.+)$/m);
    if (titleMatch) spec.title = titleMatch[1];

    // Parse status
    const statusMatch = content.match(/\*\*Status\*\*: (\w+)/);
    if (statusMatch) spec.status = statusMatch[1];

    // Parse created date
    const createdMatch = content.match(/\*\*Created\*\*: ([\d-]+)/);
    if (createdMatch) spec.createdAt = createdMatch[1];

    // Parse type
    const typeMatch = content.match(/\*\*Type\*\*: (\w+)/);
    if (typeMatch) spec.type = typeMatch[1];

    // Parse intent
    const intentMatch = content.match(/\*\*Intent\*\*: (.+)/);
    if (intentMatch) spec.intent = intentMatch[1];

    // Parse scope
    const scopeMatch = content.match(/\*\*Scope\*\*: (.+)/);
    if (scopeMatch) spec.scope = scopeMatch[1];

    // Parse acceptance criteria
    const acceptanceMatches = content.match(/- \[[ x]\] .+/g);
    if (acceptanceMatches) {
      spec.acceptance = acceptanceMatches.map(a => a.replace(/^- /, ''));
    }

    // Parse confirmed
    const confirmedMatch = content.match(/\*\*Confirmed\*\*: (Yes|No)/);
    if (confirmedMatch) spec.confirmed = confirmedMatch[1] === 'Yes';

    return spec;
  }

  /**
   * List all micro-specs
   * @param {Object} options - Filter options
   * @returns {Object[]} Array of spec summaries
   */
  list(options = {}) {
    this.ensureDirectories();

    const files = readdirSync(this.specsDir)
      .filter(f => f.endsWith('.md'));

    const specs = files.map(file => {
      const filepath = join(this.specsDir, file);
      const content = readFileSync(filepath, 'utf-8');
      const id = basename(file, '.md');
      return this.fromMarkdown(content, id);
    });

    // Apply filters
    let filtered = specs;
    if (options.status) {
      filtered = filtered.filter(s => s.status === options.status);
    }
    if (options.type) {
      filtered = filtered.filter(s => s.type === options.type);
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return filtered;
  }

  /**
   * Get a specific spec by ID
   * @param {string} id - Spec ID
   * @returns {Object|null} Spec object or null if not found
   */
  get(id) {
    const filepath = join(this.specsDir, `${id}.md`);
    if (!existsSync(filepath)) {
      return null;
    }

    const content = readFileSync(filepath, 'utf-8');
    return this.fromMarkdown(content, id);
  }

  /**
   * Update a spec's status
   * @param {string} id - Spec ID
   * @param {string} status - New status
   * @returns {Object|null} Updated spec or null
   */
  updateStatus(id, status) {
    const spec = this.get(id);
    if (!spec) return null;

    spec.status = status;
    spec.updatedAt = new Date().toISOString();

    if (status === SpecStatus.CONFIRMED) {
      spec.confirmed = true;
    }

    const markdown = this.toMarkdown(spec);
    const filepath = join(this.specsDir, `${id}.md`);
    writeFileSync(filepath, markdown, 'utf-8');

    return spec;
  }

  /**
   * Confirm a spec (mark as confirmed and active)
   * @param {string} id - Spec ID
   * @returns {Object|null} Confirmed spec or null
   */
  confirm(id) {
    return this.updateStatus(id, SpecStatus.CONFIRMED);
  }

  /**
   * Archive a spec (move to archive directory)
   * @param {string} id - Spec ID
   * @returns {boolean} Success
   */
  archive(id) {
    const sourcePath = join(this.specsDir, `${id}.md`);
    if (!existsSync(sourcePath)) {
      return false;
    }

    this.ensureDirectories();
    const destPath = join(this.archiveDir, `${id}.md`);

    // Update status before archiving
    const spec = this.get(id);
    spec.status = SpecStatus.ARCHIVED;
    spec.updatedAt = new Date().toISOString();
    const markdown = this.toMarkdown(spec);
    writeFileSync(sourcePath, markdown, 'utf-8');

    // Move to archive
    renameSync(sourcePath, destPath);
    return true;
  }

  /**
   * Delete a spec
   * @param {string} id - Spec ID
   * @returns {boolean} Success
   */
  delete(id) {
    const filepath = join(this.specsDir, `${id}.md`);
    if (!existsSync(filepath)) {
      return false;
    }
    unlinkSync(filepath);
    return true;
  }

  /**
   * Get the path for promoting a spec to formal documentation
   * @param {string} id - Spec ID
   * @returns {string} Target path in docs/specs/
   */
  getPromotePath(id) {
    const spec = this.get(id);
    if (!spec) return null;

    const targetDir = join(this.cwd, 'docs', 'specs', 'features');
    const filename = `${id}.md`;
    return join(targetDir, filename);
  }
}

// Export singleton instance for simple usage
export const microSpec = new MicroSpec();
