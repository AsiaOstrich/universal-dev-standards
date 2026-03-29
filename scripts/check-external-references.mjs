#!/usr/bin/env node
/**
 * External Reference Checker (SPEC-SELFDIAG-001 REQ-5, AC-7)
 *
 * Scans core/*.md and .standards/*.ai.yaml for external URLs,
 * checks reachability (HEAD, concurrency 5, timeout 10s, cache 7d),
 * and detects outdated version references.
 *
 * Usage: node scripts/check-external-references.mjs [--offline] [--json]
 *
 * Offline fallback: skips URL checks, only runs static version comparisons.
 */

import { readdirSync, readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const args = process.argv.slice(2);
const isOffline = args.includes('--offline');
const isJson = args.includes('--json');

// Known latest versions for static comparison
const KNOWN_VERSIONS = {
  'node.js': { latest: '22', pattern: /node\.?js\s+(\d+)/gi },
  'owasp': { latest: '2025', pattern: /owasp\s+(\d{4})/gi },
  'ecmascript': { latest: '2025', pattern: /es(\d{4})/gi },
  'typescript': { latest: '5', pattern: /typescript\s+(\d+)/gi },
};

// URL extraction regex
const URL_REGEX = /https?:\/\/[^\s)"'>\]]+/g;

// Cache
const CACHE_DIR = join(ROOT, '.uds', 'reference-cache');
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function loadCache() {
  const cachePath = join(CACHE_DIR, 'url-cache.json');
  try {
    if (!existsSync(cachePath)) return {};
    const data = JSON.parse(readFileSync(cachePath, 'utf-8'));
    // Prune expired entries
    const now = Date.now();
    const valid = {};
    for (const [url, entry] of Object.entries(data)) {
      if (now - entry.checked_at < CACHE_TTL_MS) {
        valid[url] = entry;
      }
    }
    return valid;
  } catch {
    return {};
  }
}

function saveCache(cache) {
  try {
    mkdirSync(CACHE_DIR, { recursive: true });
    writeFileSync(join(CACHE_DIR, 'url-cache.json'), JSON.stringify(cache, null, 2));
  } catch { /* silent */ }
}

async function checkUrl(url, cache) {
  if (cache[url]) return cache[url];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'UDS-Reference-Checker/1.0' }
    });
    clearTimeout(timeout);

    const result = { status: res.status, ok: res.ok, checked_at: Date.now() };
    cache[url] = result;
    return result;
  } catch (err) {
    const result = { status: 0, ok: false, error: err.message, checked_at: Date.now() };
    cache[url] = result;
    return result;
  }
}

function scanFiles() {
  const files = [];

  // Scan core/*.md
  const coreDir = join(ROOT, 'core');
  if (existsSync(coreDir)) {
    for (const f of readdirSync(coreDir).filter(f => f.endsWith('.md'))) {
      files.push({ path: join(coreDir, f), name: `core/${f}` });
    }
  }

  // Scan .standards/*.ai.yaml
  const stdDir = join(ROOT, '.standards');
  if (existsSync(stdDir)) {
    for (const f of readdirSync(stdDir).filter(f => f.endsWith('.ai.yaml'))) {
      files.push({ path: join(stdDir, f), name: `.standards/${f}` });
    }
  }

  return files;
}

function extractUrls(content) {
  const matches = content.match(URL_REGEX) || [];
  // Deduplicate and clean trailing punctuation
  return [...new Set(matches.map(u => u.replace(/[.,;:!?)]+$/, '')))];
}

function checkVersionReferences(content, fileName) {
  const issues = [];
  for (const [tech, { latest, pattern }] of Object.entries(KNOWN_VERSIONS)) {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    while ((match = regex.exec(content)) !== null) {
      const found = match[1];
      if (Number(found) < Number(latest)) {
        issues.push({
          file: fileName,
          type: 'outdated-version',
          tech,
          found: match[0],
          current_version: found,
          latest_version: latest
        });
      }
    }
  }
  return issues;
}

async function main() {
  const files = scanFiles();
  const allUrls = new Map(); // url → [files]
  const versionIssues = [];

  // Extract URLs and check versions
  for (const { path: filePath, name } of files) {
    const content = readFileSync(filePath, 'utf-8');

    // URLs
    const urls = extractUrls(content);
    for (const url of urls) {
      if (!allUrls.has(url)) allUrls.set(url, []);
      allUrls.get(url).push(name);
    }

    // Version references
    versionIssues.push(...checkVersionReferences(content, name));
  }

  // Check URLs (unless offline)
  const linkResults = [];
  if (!isOffline && allUrls.size > 0) {
    const cache = loadCache();
    const urls = [...allUrls.keys()];

    // Process in batches of 5 (concurrency limit)
    for (let i = 0; i < urls.length; i += 5) {
      const batch = urls.slice(i, i + 5);
      const results = await Promise.all(batch.map(url => checkUrl(url, cache)));
      for (let j = 0; j < batch.length; j++) {
        if (!results[j].ok) {
          linkResults.push({
            url: batch[j],
            status: results[j].status,
            error: results[j].error,
            files: allUrls.get(batch[j]),
            type: 'link-rot'
          });
        }
      }
    }

    saveCache(cache);
  } else if (isOffline) {
    if (!isJson) {
      console.log('⚠️  Offline mode: skipping URL reachability checks\n');
    }
  }

  // Output
  const report = {
    scanned_files: files.length,
    total_urls: allUrls.size,
    broken_links: linkResults,
    outdated_versions: versionIssues,
    offline: isOffline
  };

  if (isJson) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  // Terminal output
  console.log(`External Reference Check`);
  console.log('═'.repeat(50));
  console.log(`Scanned: ${files.length} files, ${allUrls.size} URLs\n`);

  if (linkResults.length > 0) {
    console.log(`❌ Broken Links (${linkResults.length}):`);
    for (const link of linkResults) {
      console.log(`  ${link.url}`);
      console.log(`    Status: ${link.status || link.error}`);
      console.log(`    In: ${link.files.join(', ')}`);
    }
    console.log();
  }

  if (versionIssues.length > 0) {
    console.log(`⚠️  Outdated Version References (${versionIssues.length}):`);
    for (const v of versionIssues) {
      console.log(`  ${v.found} → latest: ${v.latest_version}`);
      console.log(`    In: ${v.file}`);
    }
    console.log();
  }

  if (linkResults.length === 0 && versionIssues.length === 0) {
    console.log('✅ No issues found');
  }

  const exitCode = linkResults.length > 0 ? 1 : 0;
  process.exit(exitCode);
}

main();
