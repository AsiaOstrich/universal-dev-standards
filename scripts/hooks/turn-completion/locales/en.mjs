/**
 * English locale pack for the turn-completion check.
 *
 * Design note — why there is no verb whitelist.
 * The Traditional Chinese detector this was derived from was defeated twice by
 * its own lesson: version one enumerated phrases and missed a phrase; version
 * two enumerated verbs and missed a verb. Swapping a phrase list for a verb
 * list is still enumeration, one layer down.
 *
 * English gets the inverted shape: take whatever word follows the future
 * marker and treat it as an action UNLESS it is in a small, closed list of
 * verbs that describe rather than do. The blacklist can be enumerated honestly
 * because "verbs that are not work" is a bounded set; "verbs that are work" is
 * not.
 *
 * @see core/turn-completion-integrity.md
 */

/** Verbs that report, decide-not-to, or legitimately wait. Following one is not a commitment to work. */
const NON_ACTION = new Set([
  // describing rather than doing
  'say', 'says', 'said', 'note', 'noted', 'mention', 'explain', 'describe',
  'report', 'summarize', 'summarise', 'list', 'show', 'tell', 'clarify',
  'quote', 'point', 'highlight', 'flag', 'call', 'answer', 'respond', 'reply',
  // stating a belief, not an action
  'know', 'think', 'assume', 'believe', 'remember', 'recommend', 'suggest', 'propose',
  // a legitimate stop: the next move is not the agent's
  'wait', 'hold', 'pause', 'defer', 'stop', 'skip', 'leave', 'need', 'want', 'require',
]);

/** Reported speech: a reporting verb governing a clause. "when I say I will do X" is narration. */
const REPORTED_SPEECH =
  /\b(say|says|said|saying|note|noted|noting|mention|mentioned|tell|told|report|reported|write|wrote|claim|claimed|promise|promised)\b\s+(that\s+)?(I|you|we|it|he|she|they)\b/i;

const NEGATION = /\b(not|never|no longer|neither|nor)\b/i;

/**
 * A reporting verb sitting between "I" and the future marker means the sentence
 * describes a commitment rather than making one: "when I say I will do X".
 * Dropping this check let exactly that sentence block on the first corpus run.
 */
const REPORTING =
  /\b(say|says|said|saying|note|noted|mention|mentioned|tell|told|report|reported|write|wrote|claim|claimed|promise|promised|explain|explained)\b/i;

/** Requests for information from the human. A commitment beside one is conditional. */
const ASKING =
  /(\bshould I\b|\bdo you want\b|\bwould you like\b|\bwhich (one|file|option)\b|\blet me know\b|\btell me\b|\bgive me\b|\bpaste\b|\bwaiting on you\b|\byour call\b|\bup to you\b|\?)/i;

/**
 * Expand contractions so the patterns below never have to fight an apostrophe.
 * Both the ASCII and typographic apostrophes appear in real transcripts.
 */
export function normalize(text) {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/\bI'll\b/gi, 'I will')
    .replace(/\bI'm\b/gi, 'I am')
    .replace(/\bI've\b/gi, 'I have')
    .replace(/\bwon't\b/gi, 'will not')
    .replace(/\bcan't\b/gi, 'can not')
    .replace(/n't\b/gi, ' not');
}

const FUTURE = '(?:will|am going to|going to|am about to|about to)';
// Adverbs and filler between the future marker and the verb it governs.
const FILLER = "(?:not|never|also|then|now|next|first|just|be|still|already|soon|finally|quickly|\\w+ly)";
const COMMIT = new RegExp(
  `\\bI\\b([^.!?\\n]{0,10}?)\\b${FUTURE}\\b((?:\\s+${FILLER}\\b|\\s*,)*)\\s+([a-z][a-z-]*)`,
  'gi'
);
const LET_ME = /\blet me\b\s+((?:(?:just|now|first|quickly|\w+ly)\s+)*)([a-z][a-z-]*)/gi;

/** Does this sentence contain an unconditional first-person commitment to a next action? */
export function isCommitment(sentence) {
  const s = normalize(sentence);

  for (const re of [COMMIT, LET_ME]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(s)) !== null) {
      const isLetMe = re === LET_ME;
      const gap = isLetMe ? '' : m[1];
      const filler = isLetMe ? m[1] : m[2];
      const verb = (isLetMe ? m[2] : m[3]).toLowerCase();

      if (NON_ACTION.has(verb)) continue;
      if (NEGATION.test(gap) || NEGATION.test(filler)) continue;
      if (REPORTING.test(gap)) continue;
      // A reporting verb governing a clause anywhere earlier in the sentence
      // means this is narration about a commitment, not a commitment.
      if (REPORTED_SPEECH.test(s.slice(0, m.index + 2))) continue;
      return true;
    }
  }
  return false;
}

export function isAsking(text) {
  return ASKING.test(normalize(text));
}

/**
 * The human asking for the turn to end. Deliberately narrow: a false positive
 * here disables the check for the rest of the session, which is worse than a
 * missed block. It must read as an instruction to stop, not a mention of
 * stopping.
 */
const STOP_REQUEST =
  /(\blet's (stop|pause|pick this up later)\b|\b(pause|stop) (here|for now|there)\b|\bhold (on|off)\b|\bthat's (enough|it) for (now|today)\b|\b(done|enough) for (now|today)\b|\bwrap (it |this )?up\b|\bcontinue (this )?later\b|\bpick (this|it) up (tomorrow|later)\b|\btake a break\b|\bI'?m (heading|going) (home|out)\b|\bgood ?night\b)/i;

export function isStopRequest(text) {
  return STOP_REQUEST.test(normalize(text));
}

export const id = 'en';
export const label = 'English';

/**
 * The corpus. This is the pack's contract: it runs in CI, and a pack whose
 * corpus does not pass is not shipped. Cases marked `true` must block; cases
 * marked `false` must let the turn end.
 */
export const corpus = [
  [true, 'plain commitment', 'I will update the remaining two files.'],
  [true, 'contraction + filler', "I'll go ahead and rewrite the detector."],
  [true, 'going to', "Next I'm going to run the test suite."],
  [true, 'let me', 'Let me fix the exclusion and re-run the corpus.'],
  [true, 'about to', "I'm about to move on to the next item in the same class."],
  [true, 'negation then a real commitment in the next sentence',
    'I will not touch that config. I will wire the gate into CI next.'],
  [false, 'past tense report', 'I said I would fix it, and the commit is pushed.'],
  [false, 'negation', "I won't be changing that config."],
  [false, 'asking', 'Should I update the remaining files, or leave them?'],
  [false, 'narrating the pattern', 'The hook fires when I say I will do something and then stop.'],
  // Only REPORTED_SPEECH catches this one: the gap between "I" and "will" is
  // empty, so the gap-level reporting check cannot see the "said that".
  // Added after mutation testing showed REPORTED_SPEECH could be deleted with
  // the corpus staying green — an unproven guard is indistinguishable from a
  // dead one.
  [false, 'third-person reported speech', 'You said that I will handle the merge.'],
  [false, 'reporting verb as the action', "I'll explain why the exclusion exists."],
  [false, 'legitimate stop: the next move is the human\'s', 'I will wait for your key before deploying.'],
  [false, 'conditional: asking in the same paragraph',
    'Tell me which file you meant and I will check it.'],
];

/**
 * Messages from the human, and whether each one ends the turn by request.
 * Marked `true` must exempt; marked `false` must NOT — a message that merely
 * mentions stopping is not an instruction to stop.
 */
export const stopCorpus = [
  [true, 'plain pause', "Let's pause here, I'm heading home."],
  [true, 'enough for today', "That's enough for today, we can continue later."],
  [true, 'hold on', 'Hold on, I need to step out.'],
  [false, 'mentions stopping but is not one', 'Explain why the hook stops the turn.'],
  [false, 'asks for work', 'Stop using the hardcoded list and walk the registry instead.'],
  [false, 'ordinary instruction', 'Fix the detector and push it.'],
];
