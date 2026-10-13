#!/usr/bin/env python3
"""Run a program on a real pseudo-terminal, optionally with a given window size and a script of answers.

Used by the XSPEC-482 end-to-end tests that need a TTY (a spinner on a terminal with no width; a prompt that asks
before sending a report). Node has no pty in its standard library and the repository takes no native dependency, so
the terminal is made here with the standard `pty` module.

Usage: pty-run.py '<json spec>'
spec: { "cmd": [...], "cwd": "...", "env": {...}, "cols": 80, "rows": 24, "timeout": 30,
        "script": [ {"expect": "text", "send": "keys"}, ... ] }
  - the window size is set on the child's terminal before it starts (cols 0 is allowed: it is the case under test);
  - each script step waits until its `expect` text has appeared in the output since the previous step, then sends `send`;
  - on timeout the child is killed and the result says so.
Prints one JSON line: { "code": <exit code or null>, "timedOut": bool, "out": "<everything the program printed>",
                        "unanswered": [<expect texts never seen>] }
"""
import json, os, pty, select, signal, struct, sys, time, fcntl, termios

spec = json.loads(sys.argv[1])
cmd = spec["cmd"]
cols = int(spec.get("cols", 80))
rows = int(spec.get("rows", 24))
timeout = float(spec.get("timeout", 30))
script = list(spec.get("script", []))

pid, fd = pty.fork()
if pid == 0:
    try:
        fcntl.ioctl(0, termios.TIOCSWINSZ, struct.pack("HHHH", rows, cols, 0, 0))
    except OSError:
        pass
    if spec.get("cwd"):
        os.chdir(spec["cwd"])
    env = dict(os.environ)
    env.update(spec.get("env", {}))
    os.execvpe(cmd[0], cmd, env)

out = b""
since = 0  # offset in `out` after the last answered step
deadline = time.time() + timeout
timed_out = False
code = None
while True:
    if time.time() > deadline:
        timed_out = True
        try:
            os.kill(pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
        break
    r, _, _ = select.select([fd], [], [], 0.2)
    if r:
        try:
            chunk = os.read(fd, 65536)
        except OSError:
            chunk = b""
        if not chunk:
            break
        out += chunk
        if script:
            step = script[0]
            if step["expect"].encode() in out[since:]:
                time.sleep(float(step.get("delay", 0.3)))
                os.write(fd, step["send"].encode())
                since = len(out)
                script.pop(0)
try:
    _, status = os.waitpid(pid, 0)
    code = os.waitstatus_to_exitcode(status) if hasattr(os, 'waitstatus_to_exitcode') else (os.WEXITSTATUS(status) if os.WIFEXITED(status) else -os.WTERMSIG(status))
except ChildProcessError:
    pass
print(json.dumps({"code": None if timed_out else code, "timedOut": timed_out,
                  "out": out.decode("utf-8", "replace"), "unanswered": [s["expect"] for s in script]}))
