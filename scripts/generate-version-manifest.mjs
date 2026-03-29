#!/usr/bin/env node
/**
 * Generate Version Manifest (SPEC-SELFDIAG-001 REQ-9, AC-14)
 *
 * Produces .standards/version-manifest.json during release process.
 * Contains UDS version, standards hash, and compatibility info.
 *
 * Usage: node scripts/generate-version-manifest.mjs
 */

import { createHash } from 'crypto';
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const require = createRequire(import.meta.url);

function computeStandardsHash() {
  const stdDir = join(ROOT, '.standards');
  if (!existsSync(stdDir)) return 'none';

  const files = readdirSync(stdDir)
    .filter(f => f.endsWith('.ai.yaml'))
    .sort();

  const hash = createHash('sha256');
  for (const f of files) {
    const content = readFileSync(join(stdDir, f));
    hash.update(f);
    hash.update(content);
  }
  return hash.digest('hex');
}

function main() {
  const pkg = require(join(ROOT, 'cli', 'package.json'));

  const manifest = {
    uds_version: pkg.version,
    generated_at: new Date().toISOString(),
    standards_hash: `sha256:${computeStandardsHash()}`,
    standards_count: readdirSync(join(ROOT, '.standards'))
      .filter(f => f.endsWith('.ai.yaml')).length,
    compatibility: {
      devap: '>=0.3.0',
      vibeops: '>=0.5.0'
    }
  };

  const outputPath = join(ROOT, '.standards', 'version-manifest.json');
  writeFileSync(outputPath, JSON.stringify(manifest, null, 2) + '\n');

  console.log(`Generated ${outputPath}`);
  console.log(`  Version: ${manifest.uds_version}`);
  console.log(`  Standards: ${manifest.standards_count}`);
  console.log(`  Hash: ${manifest.standards_hash.substring(0, 20)}...`);
}

main();
