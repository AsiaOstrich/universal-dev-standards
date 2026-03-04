/**
 * Feedback Reporter - Layer 3: GitHub issue submission
 *
 * Collects audit findings, allows user selection, and submits
 * structured GitHub issues via fallback chain:
 * 1. gh CLI (if available)
 * 2. Browser deeplink URL
 * 3. Clipboard copy with manual URL
 *
 * @module utils/feedback-reporter
 * @see docs/specs/system/SPEC-AUDIT-01-standards-audit.md (AC-4)
 */

import { execSync } from 'child_process';
import { platform } from 'os';

const REPO = 'AsiaOstrich/universal-dev-standards';
const MAX_URL_BODY_LENGTH = 2000;

/**
 * Format audit results into a GitHub issue body
 * @param {Object} auditResult - Full audit result
 * @param {string} userComments - User's free-text comments
 * @param {Object} options - { selectedFindings }
 * @returns {{ title: string, body: string, labels: string[] }}
 */
export function formatIssueContent(auditResult, userComments = '') {
  const labels = [];
  const sections = [];

  sections.push('## UDS Audit Feedback | UDS 審計回饋\n');
  sections.push(`**UDS Version**: ${auditResult.udsVersion || 'unknown'}`);
  sections.push(`**Node Version**: ${process.version}`);
  sections.push(`**OS**: ${process.platform} ${process.arch}\n`);

  // Health issues
  if (auditResult.health && auditResult.health.issues.length > 0) {
    const healthIssues = auditResult.health.issues.filter(i => i.severity !== 'INFO');
    if (healthIssues.length > 0) {
      labels.push('audit-health');
      sections.push('### Health Issues');
      for (const issue of healthIssues) {
        const icon = issue.severity === 'ERROR' ? '❌' : '⚠️';
        sections.push(`- ${icon} ${issue.component}: ${issue.message}`);
      }
      sections.push('');
    }
  }

  // Pattern suggestions
  if (auditResult.patterns && auditResult.patterns.length > 0) {
    labels.push('audit-pattern');
    sections.push('### Pattern Suggestions');
    for (const pattern of auditResult.patterns) {
      sections.push(`- **[${pattern.severity}] ${pattern.name}** — Evidence: ${pattern.evidence.join(', ')}`);
    }
    sections.push('');
  }

  // Friction reports
  if (auditResult.frictions && auditResult.frictions.length > 0) {
    labels.push('audit-friction');
    sections.push('### Friction Reports');
    for (const friction of auditResult.frictions) {
      const details = friction.diff ? `: ${friction.diff}` : '';
      sections.push(`- **${friction.standard}** — ${capitalizeFirst(friction.type)}${details}`);
    }
    sections.push('');
  }

  // User comments
  if (userComments) {
    sections.push('### User Comments');
    sections.push(`> ${userComments.replace(/\n/g, '\n> ')}`);
    sections.push('');
  }

  // Title
  const counts = [];
  if (auditResult.health?.issues.filter(i => i.severity !== 'INFO').length > 0) {
    counts.push(`${auditResult.health.issues.filter(i => i.severity !== 'INFO').length} health`);
  }
  if (auditResult.patterns?.length > 0) {
    counts.push(`${auditResult.patterns.length} patterns`);
  }
  if (auditResult.frictions?.length > 0) {
    counts.push(`${auditResult.frictions.length} frictions`);
  }

  const title = `[Audit] ${counts.join(', ') || 'No issues'}`;
  const body = sections.join('\n');

  return { title, body, labels };
}

/**
 * Submit feedback via the fallback chain
 * @param {{ title: string, body: string, labels: string[] }} issue
 * @param {Object} options - { dryRun, forceGh }
 * @returns {{ method: string, success: boolean, url?: string, error?: string }}
 */
export async function submitFeedback(issue, options = {}) {
  const { dryRun = false, forceGh = false } = options;

  if (dryRun) {
    return { method: 'dry-run', success: true };
  }

  // Try gh CLI first
  if (forceGh || isGhAvailable()) {
    const result = submitViaGh(issue);
    if (result.success) return result;
  }

  // Fallback: browser deeplink
  const deeplinkResult = submitViaDeeplink(issue);
  return deeplinkResult;
}

/**
 * Check if gh CLI is available and authenticated
 * @returns {boolean}
 */
export function isGhAvailable() {
  try {
    execSync('gh auth status', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Submit via gh CLI
 * @param {{ title: string, body: string, labels: string[] }} issue
 * @returns {{ method: string, success: boolean, url?: string, error?: string }}
 */
function submitViaGh(issue) {
  try {
    const labelArgs = issue.labels.length > 0
      ? issue.labels.map(l => `--label "${l}"`).join(' ')
      : '';

    const cmd = `gh issue create --repo ${REPO} --title "${escapeShellArg(issue.title)}" --body "${escapeShellArg(issue.body)}" ${labelArgs}`;
    const output = execSync(cmd, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const url = output.trim();
    return { method: 'gh', success: true, url };
  } catch (error) {
    return { method: 'gh', success: false, error: error.message };
  }
}

/**
 * Submit via browser deeplink
 * @param {{ title: string, body: string, labels: string[] }} issue
 * @returns {{ method: string, success: boolean, url?: string, truncated?: boolean }}
 */
function submitViaDeeplink(issue) {
  let body = issue.body;
  let truncated = false;

  if (body.length > MAX_URL_BODY_LENGTH) {
    truncated = true;
    // Create summary version
    body = createSummaryBody(issue);
    // Copy full report to clipboard
    copyToClipboard(issue.body);
  }

  const params = new URLSearchParams({
    title: issue.title,
    body,
    labels: issue.labels.join(',')
  });

  const url = `https://github.com/${REPO}/issues/new?${params.toString()}`;

  // Try to open browser
  try {
    const openCmd = getOpenCommand();
    if (openCmd) {
      execSync(`${openCmd} "${url}"`, {
        stdio: ['pipe', 'pipe', 'pipe']
      });
    }
  } catch {
    // Browser open failed, copy to clipboard as last resort
    copyToClipboard(issue.body);
    return {
      method: 'clipboard',
      success: true,
      url: `https://github.com/${REPO}/issues/new`,
      truncated: true
    };
  }

  return { method: 'deeplink', success: true, url, truncated };
}

/**
 * Create a summary body for truncated deeplinks
 * @param {{ title: string, body: string, labels: string[] }} issue
 * @returns {string}
 */
function createSummaryBody(issue) {
  const lines = [
    '## UDS Audit Feedback (Summary)',
    '',
    '_Full report copied to clipboard. Please paste it into the issue body._',
    '',
    `Labels: ${issue.labels.join(', ')}`,
    ''
  ];
  return lines.join('\n');
}

/**
 * Copy text to clipboard
 * @param {string} text
 */
export function copyToClipboard(text) {
  try {
    const os = platform();
    if (os === 'darwin') {
      execSync('pbcopy', { input: text, stdio: ['pipe', 'pipe', 'pipe'] });
    } else if (os === 'linux') {
      try {
        execSync('xclip -selection clipboard', { input: text, stdio: ['pipe', 'pipe', 'pipe'] });
      } catch {
        execSync('xsel --clipboard --input', { input: text, stdio: ['pipe', 'pipe', 'pipe'] });
      }
    } else if (os === 'win32') {
      execSync('clip', { input: text, stdio: ['pipe', 'pipe', 'pipe'] });
    }
  } catch {
    // Clipboard not available
  }
}

/**
 * Get platform-specific browser open command
 * @returns {string|null}
 */
function getOpenCommand() {
  const os = platform();
  if (os === 'darwin') return 'open';
  if (os === 'linux') return 'xdg-open';
  if (os === 'win32') return 'start';
  return null;
}

/**
 * Escape string for shell argument
 * @param {string} str
 * @returns {string}
 */
function escapeShellArg(str) {
  return str.replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

/**
 * Capitalize first letter
 * @param {string} str
 * @returns {string}
 */
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate the deeplink URL without opening browser
 * @param {Object} auditResult
 * @param {string} userComments
 * @returns {string}
 */
export function generateReportUrl(auditResult, userComments = '') {
  const { title, body, labels } = formatIssueContent(auditResult, userComments);
  const params = new URLSearchParams({
    title,
    body: body.length > MAX_URL_BODY_LENGTH ? createSummaryBody({ title, body, labels }) : body,
    labels: labels.join(',')
  });
  return `https://github.com/${REPO}/issues/new?${params.toString()}`;
}
