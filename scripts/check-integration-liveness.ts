#!/usr/bin/env tsx
/**
 * Integration Liveness & Registry Consistency Checker
 * 整合目標存活性與註冊表一致性檢查器
 *
 * Guards two failure modes that both went unnoticed for months:
 *
 *   1. LIVENESS — an integration target stops existing (Gemini CLI, sunset 2026-06-18) and
 *      nothing goes red. Dead tools sit in the lowest tiers, whose rule sets are small
 *      enough to pass on file existence alone, so the exemption system designed to tolerate
 *      an incomplete integration silently absorbed the integration's death. A month later
 *      links inside its tree were still being repaired.
 *
 *   2. CONSISTENCY — the same field carries different values in different registries.
 *      `antigravity.supportsSkills` was true in the behavioural config and false in the
 *      registry for 5.5 months, on a change that was itself about registries.
 *
 * Sources of truth, in precedence order:
 *   integrations/REGISTRY.json          SSOT for tier, deprecated, supersededBy
 *   cli/src/config/ai-agent-paths.js    behavioural — actually drives install
 *   cli/standards-registry.json         informational mirror (no code reads it)
 *   scripts/check-ai-agent-sync.sh      hardcoded agent list (a fourth registry)
 *
 * Usage: tsx scripts/check-integration-liveness.ts [--verbose]
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = dirname(dirname(fileURLToPath(import.meta.url)));

const RED = '\x1b[0;31m';
const GREEN = '\x1b[0;32m';
const YELLOW = '\x1b[1;33m';
const BLUE = '\x1b[0;34m';
const DIM = '\x1b[2m';
const NC = '\x1b[0m';

const VERBOSE = process.argv.includes('--verbose');

/**
 * Known, deliberately-unresolved divergences.
 *
 * An entry here is a claim about TODAY, not a historical note. Each needs a reason and a
 * tracking reference, and when the divergence is resolved the entry must be deleted in the
 * same commit. Anything not listed here is an error — that separation is the whole point:
 * without it, a list of "expected failures" quietly becomes the place new breakage hides.
 */
interface KnownDrift {
  agent: string;
  field: string;
  reason: string;
  tracking: string;
}

const KNOWN_DRIFT: ReadonlyArray<KnownDrift> = [
  {
    agent: 'cursor',
    field: 'supportsSkills',
    reason:
      'standards-registry says false while REGISTRY.json and ai-agent-paths say true — and standards-registry also gives it skillsPath "skills/cursor", which contradicts its own false. Which value is correct is a product question, not a mechanical one.',
    tracking: 'XSPEC-355 OQ8',
  },
  {
    agent: 'windsurf',
    field: 'supportsSkills',
    reason:
      'ai-agent-paths says true (with skillsPath "skills/windsurf") while both registries say false. Same shape as cursor, opposite majority.',
    tracking: 'XSPEC-355 OQ8',
  },
];

function isKnownDrift(agent: string, field: string): KnownDrift | undefined {
  return KNOWN_DRIFT.find((d) => d.agent === agent && d.field === field);
}

// ───────────────────────────────────────────────────────────────
// Load sources
// ───────────────────────────────────────────────────────────────

interface RegistryAgent {
  name: string;
  tier: string;
  deprecated?: boolean;
  deprecationNote?: string;
  supersededBy?: string;
  rulesLocation?: string;
  supportsSkills?: boolean;
}

function readJson(relPath: string): any {
  const full = join(ROOT_DIR, relPath);
  if (!existsSync(full)) {
    throw new Error(`Required source not found: ${relPath}`);
  }
  return JSON.parse(readFileSync(full, 'utf8'));
}

const registry = readJson('integrations/REGISTRY.json');
const standardsRegistry = readJson('cli/standards-registry.json');
const agentPaths = (await import(join(ROOT_DIR, 'cli/src/config/ai-agent-paths.js')))
  .AI_AGENT_PATHS as Record<string, { supportsSkills?: boolean; skills?: unknown }>;

const regAgents = registry.agents as Record<string, RegistryAgent>;
const stdAgents = Object.fromEntries(
  Object.entries(standardsRegistry.supportedAITools as Record<string, any>).filter(
    ([k]) => !k.startsWith('_'),
  ),
);

const READMES = [
  'README.md',
  'locales/zh-TW/README.md',
  'locales/zh-CN/README.md',
] as const;

let errors = 0;
let warnings = 0;
let passed = 0;

function fail(msg: string, detail?: string): void {
  process.stdout.write(`  ${RED}[FAIL]${NC} ${msg}\n`);
  if (detail) process.stdout.write(`         ${DIM}${detail}${NC}\n`);
  errors += 1;
}

function warn(msg: string, detail?: string): void {
  process.stdout.write(`  ${YELLOW}[WARN]${NC} ${msg}\n`);
  if (detail) process.stdout.write(`         ${DIM}${detail}${NC}\n`);
  warnings += 1;
}

function ok(msg: string): void {
  if (VERBOSE) process.stdout.write(`  ${GREEN}[OK]${NC}   ${msg}\n`);
  passed += 1;
}

function section(title: string): void {
  process.stdout.write(`\n${BLUE}${title}${NC}\n`);
  process.stdout.write('----------------------------------------\n');
}

process.stdout.write('\n==========================================\n');
process.stdout.write('  Integration Liveness & Consistency\n');
process.stdout.write('  整合存活性與註冊表一致性\n');
process.stdout.write('==========================================\n');

// ───────────────────────────────────────────────────────────────
// Check 1 — cross-registry field consistency
// ───────────────────────────────────────────────────────────────
section('[1/4] Cross-registry field consistency');

const COMPARED_FIELDS = ['supportsSkills'] as const;

for (const agentId of Object.keys(regAgents).sort()) {
  for (const field of COMPARED_FIELDS) {
    const values: Array<{ source: string; value: unknown }> = [
      { source: 'REGISTRY.json', value: (regAgents[agentId] as any)[field] },
      { source: 'standards-registry', value: (stdAgents as any)[agentId]?.[field] },
      { source: 'ai-agent-paths', value: agentPaths[agentId]?.[field as 'supportsSkills'] },
    ].filter((v) => v.value !== undefined);

    if (values.length < 2) {
      ok(`${agentId}.${field}: declared in only one source, nothing to compare`);
      continue;
    }

    const first = values[0].value;
    const agrees = values.every((v) => v.value === first);
    const known = isKnownDrift(agentId, field);

    if (agrees) {
      if (known) {
        fail(
          `${agentId}.${field}: sources now AGREE but is still listed in KNOWN_DRIFT`,
          `Remove the entry (tracking: ${known.tracking}). A stale allowlist hides the next real drift.`,
        );
      } else {
        ok(`${agentId}.${field} = ${String(first)} across ${values.length} sources`);
      }
      continue;
    }

    const rendered = values.map((v) => `${v.source}=${String(v.value)}`).join(', ');
    if (known) {
      warn(`${agentId}.${field} diverges (known): ${rendered}`, `${known.tracking} — ${known.reason}`);
    } else {
      fail(
        `${agentId}.${field} diverges: ${rendered}`,
        'Resolve it, or register it in KNOWN_DRIFT with a reason and a tracking reference.',
      );
    }
  }
}

// ───────────────────────────────────────────────────────────────
// Check 2 — deprecation metadata is complete
// ───────────────────────────────────────────────────────────────
section('[2/4] Deprecation metadata completeness');

const deprecatedAgents = Object.entries(regAgents).filter(([, a]) => a.deprecated === true);

if (deprecatedAgents.length === 0) {
  ok('No agents are marked deprecated');
}

for (const [agentId, agent] of deprecatedAgents) {
  if (!agent.deprecationNote) {
    fail(`${agentId} is deprecated but has no deprecationNote`);
  } else {
    ok(`${agentId} has a deprecationNote`);
  }

  if (!agent.supersededBy) {
    warn(`${agentId} is deprecated with no supersededBy`, 'Acceptable only if nothing replaced it.');
  } else if (!regAgents[agent.supersededBy]) {
    fail(
      `${agentId}.supersededBy points at "${agent.supersededBy}", which is not a registered agent`,
    );
  } else if (regAgents[agent.supersededBy].deprecated) {
    fail(`${agentId} is superseded by "${agent.supersededBy}", which is itself deprecated`);
  } else {
    ok(`${agentId} → ${agent.supersededBy} (live)`);
  }

  // A frozen tree should say so at its own location, where someone editing it will look.
  const loc = agent.rulesLocation;
  if (loc) {
    const marker = join(ROOT_DIR, loc, 'DEPRECATED.md');
    const readme = join(ROOT_DIR, loc, 'README.md');
    const hasMarker = existsSync(marker);
    const readmeSaysSo =
      existsSync(readme) && /deprecat|discontinu|frozen|sunset/i.test(readFileSync(readme, 'utf8'));
    if (hasMarker || readmeSaysSo) {
      ok(`${agentId}: freeze is documented at ${loc}`);
    } else {
      fail(
        `${agentId}: nothing at ${loc} says it is frozen`,
        `Add ${loc}DEPRECATED.md, or say so in its README. Someone editing those files will not read REGISTRY.json first.`,
      );
    }
  }
}

// ───────────────────────────────────────────────────────────────
// Check 3 — README status projection
// ───────────────────────────────────────────────────────────────
section('[3/4] README status projection');

// Language-independent marker, so one rule covers all three READMEs.
const DISCONTINUED_MARK = '⛔';

for (const readmePath of READMES) {
  const full = join(ROOT_DIR, readmePath);
  if (!existsSync(full)) {
    fail(`README not found: ${readmePath}`);
    continue;
  }
  const text = readFileSync(full, 'utf8');

  for (const [agentId, agent] of Object.entries(regAgents)) {
    // Match the tool's row in the support table by its bolded display name.
    const rowPattern = new RegExp(
      `^\\|\\s*\\*\\*${agent.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\*\\*\\s*\\|([^|]*)\\|`,
      'm',
    );
    const match = text.match(rowPattern);
    if (!match) {
      // Only registered AI assistants are expected in the table; SDD tools are not.
      if (agent.deprecated) {
        fail(`${readmePath}: deprecated agent "${agent.name}" has no row in the support table`);
      } else if (agent.tier !== 'tool') {
        // Not an error — the table may legitimately use a shorter label — but it must be
        // visible. An unmatched row is a hole in this check, and a silent hole reads as
        // coverage it does not have.
        warn(
          `${readmePath}: no row matched "${agent.name}" — not covered by this check`,
          'Align the README label with REGISTRY.json `name`, or accept that this tool\'s status is unverified.',
        );
      }
      continue;
    }

    const statusCell = match[1];
    const marked = statusCell.includes(DISCONTINUED_MARK);

    if (agent.deprecated && !marked) {
      fail(
        `${readmePath}: "${agent.name}" is deprecated but its status cell does not carry ${DISCONTINUED_MARK}`,
        `Status cell reads: ${statusCell.trim()}`,
      );
    } else if (!agent.deprecated && marked) {
      fail(
        `${readmePath}: "${agent.name}" is marked ${DISCONTINUED_MARK} but is not deprecated in REGISTRY.json`,
        'The registry is the SSOT — update it, or fix the README.',
      );
    } else {
      ok(`${readmePath}: "${agent.name}" status matches registry`);
    }
  }
}

// ───────────────────────────────────────────────────────────────
// Check 4 — the fourth registry: the hardcoded list in check-ai-agent-sync.sh
// ───────────────────────────────────────────────────────────────
section('[4/4] Hardcoded agent list in check-ai-agent-sync.sh');

const syncScriptPath = join(ROOT_DIR, 'scripts/check-ai-agent-sync.sh');
if (!existsSync(syncScriptPath)) {
  fail('scripts/check-ai-agent-sync.sh not found');
} else {
  const syncScript = readFileSync(syncScriptPath, 'utf8');
  const listMatch = syncScript.match(/^AGENTS="([^"]*)"/m);
  if (!listMatch) {
    fail('Could not find the AGENTS="..." list in check-ai-agent-sync.sh', 'The check below cannot run — fix the parser rather than ignoring it.');
  } else {
    const listed = new Set(listMatch[1].split(/\s+/).filter(Boolean));

    // `tier: tool` entries are SDD tools, not AI assistants — they carry no rule set.
    const expected = Object.entries(regAgents)
      .filter(([, a]) => a.tier !== 'tool')
      .map(([id]) => id);

    for (const agentId of expected) {
      if (listed.has(agentId)) {
        ok(`check-ai-agent-sync.sh covers ${agentId}`);
      } else {
        warn(
          `check-ai-agent-sync.sh does not check ${agentId}`,
          'It is registered as an AI assistant but absent from the hardcoded list, so no rule is enforced against it.',
        );
      }
    }

    for (const agentId of listed) {
      if (!regAgents[agentId]) {
        fail(`check-ai-agent-sync.sh checks "${agentId}", which is not in REGISTRY.json`);
      }
    }
  }
}

// ───────────────────────────────────────────────────────────────
// Summary
// ───────────────────────────────────────────────────────────────
process.stdout.write('\n==========================================\n');
process.stdout.write('  Summary | 摘要\n');
process.stdout.write('==========================================\n');
process.stdout.write(`  Passed:   ${passed}\n`);
process.stdout.write(`  Warnings: ${warnings}\n`);
process.stdout.write(`  Errors:   ${errors}\n`);

if (KNOWN_DRIFT.length > 0) {
  process.stdout.write(
    `\n  ${YELLOW}${KNOWN_DRIFT.length} registered divergence(s) awaiting a decision:${NC}\n`,
  );
  for (const d of KNOWN_DRIFT) {
    process.stdout.write(`    - ${d.agent}.${d.field} (${d.tracking})\n`);
  }
}

if (errors > 0) {
  process.stdout.write(`\n${RED}FAILED${NC}\n\n`);
  process.exit(1);
}

process.stdout.write(`\n${GREEN}All liveness and consistency checks passed ✓${NC}\n\n`);
process.exit(0);
