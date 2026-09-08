/**
 * Shared text preparation and pack runner for the turn-completion check.
 *
 * The language-specific part lives in ./locales/<id>.js. This file holds only
 * what is true of every language, so that adding a language cannot accidentally
 * change the behaviour of the ones already shipped.
 *
 * @see core/turn-completion-integrity.md (R7)
 */

/**
 * Remove the parts of a message that quote a pattern rather than enact it.
 *
 * Every exclusion here was added because its absence produced a false block:
 * a detector reliably matches the text that documents it. Fenced code, inline
 * backticks and markdown table rows are all places where an example of a
 * commitment gets written down without anyone committing to anything.
 *
 * @param {string} text
 * @returns {string}
 */
export function stripNonProse(text) {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('|'))
    .filter((line) => !line.trimStart().startsWith('>'))
    .join('\n')
    .replace(/`[^`\n]*`/g, ' ');
}

/** Split into paragraphs on blank lines. */
export function splitParagraphs(text) {
  return text.split(/\n\s*\n/).filter((p) => p.trim());
}

/**
 * Split into sentences.
 *
 * Judgement is made per sentence, never per paragraph: a negated clause
 * followed by a real commitment produces exactly one paragraph-level match,
 * and the negation swallows the commitment.
 */
export function splitSentences(text) {
  return text.split(/[.!?。！？\n]+/).filter((s) => s.trim());
}

/**
 * Did the human ask for the turn to end?
 *
 * 🔴 The check reads only the agent's final message, so a turn that ends
 * because the human said "pause, I'm going home" is indistinguishable from one
 * that ends on an abandoned commitment — the agent's words are the same in both.
 * Measured 2026-09-08: the first real firing after shipping was exactly this.
 *
 * A user-directed stop is the one legitimate ending the message-only design
 * cannot represent, so the check has to look at the other side of the exchange.
 *
 * @param {string} text - the human's most recent message
 * @param {Array<{isStopRequest: (t: string) => boolean}>} packs
 * @returns {boolean}
 */
export function userAskedToStop(text, packs) {
  if (!text || !text.trim()) return false;
  return packs.some((p) => typeof p.isStopRequest === 'function' && p.isStopRequest(text));
}

/**
 * Run every locale pack over one message.
 *
 * All packs run, and any one of them firing is enough. A bilingual transcript
 * is the normal case, not the exception, and asking the adopter to configure
 * which language they write in is a knob that will be set wrong.
 *
 * @param {string} text - the assistant's final message
 * @param {Array<{id: string, isCommitment: (s: string) => boolean, isAsking: (t: string) => boolean}>} packs
 * @returns {{ fired: boolean, packId: string|null, sentence: string|null }}
 */
export function detectCommitment(text, packs) {
  const body = stripNonProse(text);

  for (const paragraph of splitParagraphs(body)) {
    // A commitment that shares a paragraph with a request for information is
    // conditional ("give me X and I will do Y"), not an unkept promise.
    // Stopping there is correct behaviour, and blocking it teaches the adopter
    // to uninstall the hook.
    const asking = packs.some((p) => p.isAsking(paragraph));
    if (asking) continue;

    for (const sentence of splitSentences(paragraph)) {
      for (const pack of packs) {
        if (pack.isCommitment(sentence)) {
          return { fired: true, packId: pack.id, sentence: sentence.trim().slice(0, 160) };
        }
      }
    }
  }
  return { fired: false, packId: null, sentence: null };
}
