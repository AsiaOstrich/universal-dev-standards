/**
 * Does every command, subcommand and option of the uds CLI have an acceptance step? (dev-platform XSPEC-471 R2)
 *
 * Pure: takes the command tree (what `dump-cli-tree.mjs` prints), the parsed steps file and the baseline, and
 * returns what is wrong. `check-cli-coverage.mjs` prints it and sets the exit code; the tests call it with samples.
 *
 * Items and their names (the names are what a report, an exemption and the baseline use):
 *   command   `init`, `spec create`            the path of command names from the top, joined by one space
 *   option    `init --mode`, `spec list -x`    the owner's path, then the long flag (the short one when there is no long one);
 *                                              an option of the program itself is owned by `uds` (`uds --ui-lang`)
 * `-h, --help` and the `help` command are not listed: commander puts them on every command by itself, so naming
 * them would make each command owe a step for something the project never wrote.
 *
 * A step USES an item when the arguments it gives to the installed uds name it: the `uds` and `shim` arguments, or
 * the arguments after `{bin}` (or after a word that is `uds`) in a `run` step. An alias (`spec ls`) uses the
 * command it stands for; a short flag (`-m`) uses its long one; `--mode=full` and `--mode full` both use `--mode`.
 * A step that only names a command with `--help` uses the command and nothing else.
 *
 * A command is also used when a step runs one of its subcommands (`open-work self-test` uses `open-work`).
 *
 * Standard library only.
 */

import { MIN_REASON_LENGTH } from './steps.mjs';

const ROOT_OWNER = 'uds';

/** @typedef {{ name: string, aliases: string[], hidden?: boolean, options: Array<{flags: string, long: string|null, short: string|null, takesValue: boolean, valueOptional?: boolean, hidden?: boolean}>, commands: object[] }} TreeNode */

/** The names an option is known by in a steps file. */
const optionName = (o) => o.long || o.short;

/**
 * Every item of the tree.
 * @param {TreeNode} root
 * @returns {{ commands: Array<{id: string, path: string[], topLevel: boolean}>, options: Array<{id: string, owner: string, path: string[]}> }}
 */
export function listItems(root) {
  const commands = [];
  const options = [];
  const visit = (node, path) => {
    for (const o of node.options || []) {
      const name = optionName(o);
      if (!name) continue;
      options.push({ id: `${path.length ? path.join(' ') : ROOT_OWNER} ${name}`, owner: path.length ? path.join(' ') : ROOT_OWNER, path });
    }
    for (const c of node.commands || []) {
      const p = [...path, c.name];
      commands.push({ id: p.join(' '), path: p, topLevel: p.length === 1 });
      visit(c, p);
    }
  };
  visit(root, []);
  return { commands, options };
}

/** The arguments a step gives to the installed uds, or null when it does not run uds (inspect, git, ...). */
export function udsArgsOf(step) {
  if (Array.isArray(step.uds)) return step.uds;
  if (Array.isArray(step.shim)) return step.shim;
  if (Array.isArray(step.run)) {
    const at = step.run.findIndex((w) => w === '{bin}' || w === 'uds');
    return at === -1 ? null : step.run.slice(at + 1);
  }
  return null;
}

/**
 * Read a step's arguments against the tree.
 * @returns {{ path: string[], options: string[] }}  the command the step runs, and the ids of the options it uses
 */
export function resolveUsage(root, args) {
  let node = root;
  const path = [];
  const used = new Set();
  const chain = [root];
  const findLong = (name) => {
    for (let i = chain.length - 1; i >= 0; i -= 1) {
      const o = (chain[i].options || []).find((x) => x.long === name);
      if (o) return { o, owner: i };
    }
    return null;
  };
  const findShort = (name) => {
    for (let i = chain.length - 1; i >= 0; i -= 1) {
      const o = (chain[i].options || []).find((x) => x.short === name);
      if (o) return { o, owner: i };
    }
    return null;
  };
  // `--x <v>` takes the next argument; `--x [v]` takes it only when it is not itself a flag
  const takesNext = (o, i) => o.takesValue && i + 1 < args.length && (!o.valueOptional || !String(args[i + 1]).startsWith('-'));
  const ownerId = (i) => (i === 0 ? ROOT_OWNER : path.slice(0, i).join(' '));
  const mark = (hit) => used.add(`${ownerId(hit.owner)} ${optionName(hit.o)}`);
  let descending = true;

  for (let i = 0; i < args.length; i += 1) {
    const a = String(args[i]);
    if (a === '--') break;
    if (a.startsWith('--')) {
      const [name, ...rest] = a.split('=');
      const hit = findLong(name);
      if (!hit) continue;
      mark(hit);
      if (rest.length === 0 && takesNext(hit.o, i)) i += 1;
    } else if (a.startsWith('-') && a.length > 1) {
      // `-y`, `-mfull` (value attached), or a bundle of flags `-yv`: read letter by letter while the letters are flags
      for (let j = 1; j < a.length; j += 1) {
        const hit = findShort(`-${a[j]}`);
        if (!hit) break;
        mark(hit);
        if (hit.o.takesValue) {
          if (j === a.length - 1 && takesNext(hit.o, i)) i += 1; // the value is the next argument
          break; // otherwise the rest of this argument is the value
        }
      }
    } else if (descending) {
      const child = (node.commands || []).find((c) => c.name === a || (c.aliases || []).includes(a));
      if (child) {
        node = child;
        chain.push(child);
        path.push(child.name);
      } else {
        descending = false; // a positional argument: what follows belongs to the command, never to a subcommand
      }
    }
  }
  return { path, options: [...used] };
}

/** An exemption's target in the vocabulary of this check: `{ kind: 'command' | 'option', id }`, or null (it is for something else). */
export function surfaceTarget(x) {
  if (x && typeof x.command === 'string') return { kind: 'command', id: x.command.trim() };
  if (x && typeof x.option === 'string') return { kind: 'option', id: x.option.trim() };
  return null;
}

const hasReason = (x) => typeof x.reason === 'string' && x.reason.trim().length >= MIN_REASON_LENGTH;

/**
 * @param {{ tree: TreeNode, doc: object, baseline: { commands?: string[], options?: string[] } | null }} input
 *   `baseline` null = there is no baseline file (every gap is new).
 */
export function judgeSurface({ tree, doc, baseline }) {
  const { commands, options } = listItems(tree);
  const steps = Array.isArray(doc && doc.steps) ? doc.steps : [];
  const exemptions = (Array.isArray(doc && doc.exemptions) ? doc.exemptions : []).filter((x) => surfaceTarget(x));

  // what the steps use
  const usedCommands = new Set();
  const usedOptions = new Set();
  for (const s of steps) {
    const args = udsArgsOf(s);
    if (!args) continue;
    const u = resolveUsage(tree, args);
    for (let n = 1; n <= u.path.length; n += 1) usedCommands.add(u.path.slice(0, n).join(' '));
    for (const o of u.options) usedOptions.add(o);
  }

  // the exemptions: one that gives a reason counts; one that does not is as good as none
  const known = new Map([...commands.map((c) => [`command:${c.id}`, c]), ...options.map((o) => [`option:${o.id}`, o])]);
  const exempt = new Set();
  const exemptionProblems = [];
  const exemptionNotes = [];
  for (const x of exemptions) {
    const t = surfaceTarget(x);
    const key = `${t.kind}:${t.id}`;
    if (!hasReason(x)) {
      exemptionProblems.push(`the exemption for ${t.kind} "${t.id}" needs a "reason" of at least ${MIN_REASON_LENGTH} characters saying why no step can test it; without one it does not count`);
      continue;
    }
    if (!known.has(key)) {
      exemptionProblems.push(`the exemption for ${t.kind} "${t.id}" names something the CLI does not have`);
      continue;
    }
    const covered = t.kind === 'command' ? usedCommands.has(t.id) : usedOptions.has(t.id);
    if (covered) {
      exemptionProblems.push(`the exemption for ${t.kind} "${t.id}" is not needed: a step already uses it. Remove the exemption`);
      continue;
    }
    exempt.add(key);
    exemptionNotes.push(key);
  }

  const baselineSet = {
    command: new Set(baseline && Array.isArray(baseline.commands) ? baseline.commands : []),
    option: new Set(baseline && Array.isArray(baseline.options) ? baseline.options : []),
  };

  const kinds = {
    command: { items: commands, used: usedCommands },
    option: { items: options, used: usedOptions },
  };
  const result = {
    ok: false,
    totals: {},
    newGaps: [], // uncovered, not exempt, not in the baseline: red
    knownGaps: [], // uncovered, not exempt, in the baseline: counted, not red
    staleBaseline: [], // in the baseline but covered, exempt or gone: red, so the baseline cannot rot
    exemptionProblems,
    exempted: [...exempt].map((k) => k.replace(':', ' ')),
  };

  for (const [kind, { items, used }] of Object.entries(kinds)) {
    const ids = new Set(items.map((i) => i.id));
    let covered = 0;
    let exempted = 0;
    let gaps = 0;
    for (const item of items) {
      if (used.has(item.id)) covered += 1;
      else if (exempt.has(`${kind}:${item.id}`)) exempted += 1;
      else {
        gaps += 1;
        (baselineSet[kind].has(item.id) ? result.knownGaps : result.newGaps).push({ kind, id: item.id });
      }
    }
    for (const id of baselineSet[kind]) {
      if (!ids.has(id)) result.staleBaseline.push({ kind, id, why: 'the CLI no longer has it' });
      else if (used.has(id)) result.staleBaseline.push({ kind, id, why: 'a step now uses it' });
      else if (exempt.has(`${kind}:${id}`)) result.staleBaseline.push({ kind, id, why: 'it now has an exemption' });
    }
    result.totals[kind] = { total: items.length, covered, exempted, gaps };
  }
  result.totals.topLevelCommands = (() => {
    const top = commands.filter((c) => c.topLevel);
    return { total: top.length, covered: top.filter((c) => usedCommands.has(c.id)).length, exempted: top.filter((c) => !usedCommands.has(c.id) && exempt.has(`command:${c.id}`)).length };
  })();
  result.totals.subcommands = (() => {
    const sub = commands.filter((c) => !c.topLevel);
    return { total: sub.length, covered: sub.filter((c) => usedCommands.has(c.id)).length, exempted: sub.filter((c) => !usedCommands.has(c.id) && exempt.has(`command:${c.id}`)).length };
  })();

  result.ok = result.newGaps.length === 0 && result.staleBaseline.length === 0 && exemptionProblems.length === 0 && commands.length > 0;
  return result;
}

/** The baseline a tree and steps file would need today: every gap that is not exempt. Used by --shrink-baseline (which only keeps what is already in the file). */
export function currentGaps(input) {
  const r = judgeSurface({ ...input, baseline: null });
  return {
    commands: r.newGaps.filter((g) => g.kind === 'command').map((g) => g.id),
    options: r.newGaps.filter((g) => g.kind === 'option').map((g) => g.id),
  };
}
