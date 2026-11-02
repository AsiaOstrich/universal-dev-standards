/**
 * End the process without losing output that is still waiting to be written (board #81).
 *
 * `process.exit()` throws away what Node has not yet handed to a pipe. On macOS (and on Windows) a pipe is written
 * asynchronously, so a command that prints a lot and then calls `process.exit()` can stop at exactly one pipe's worth
 * (65,536 bytes measured) when the reader is slow: the end of the output - the part that says what failed last - is
 * the part that is lost, while the exit code still arrives.
 *
 * Use this for a command that must still end the process explicitly (a handle - a spinner, a prompt - would otherwise
 * keep it alive) and whose output can grow with the project. For a command that can simply return, set
 * `process.exitCode` and return instead. A command whose output is a handful of fixed lines does not need either.
 *
 * It waits for an empty write on each stream to finish. Writes on a stream are finished in the order they were made, so
 * when the empty one is done, everything before it has been taken by the reader.
 *
 * @param {number} code - the exit code; also left in `process.exitCode`
 * @returns {Promise<void>} resolves only if `process.exit` is stubbed (tests); otherwise the process ends here
 */
export async function flushAndExit(code) {
  process.exitCode = code;
  await Promise.all([drained(process.stdout), drained(process.stderr)]);
  process.exit(code);
}

/** Resolves when everything already written to `stream` has been taken by its reader, or at once if it cannot be written. */
function drained(stream) {
  return new Promise((resolve) => {
    if (!stream || stream.destroyed || stream.writableEnded) return resolve();
    // A reader that has gone away (EPIPE) must not keep us from exiting.
    stream.once('error', resolve);
    try {
      stream.write('', () => resolve());
    } catch {
      resolve();
    }
  });
}
