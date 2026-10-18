"""
Semantic Delay — RPC v0.2 conformance test
==========================================

v0.2 adds one thing to the contract: an optional `options.coupling` on
`convert` (the melody knob — see RPC-v0.2.md). This test pins what v0.2
promises, against the stub backend, stdlib only:

  * hello negotiates 0.2, answers a 0.1 client in 0.1, refuses 0.3;
  * hello advertises `features: ["coupling"]`;
  * a convert without coupling is still the bit-exact v0.1 pass-through;
  * a convert with coupling returns a `coupling` report (the stub says
    `applied: false` rather than pretending it bent any pitch);
  * a bad knob value is refused with E_OPTION_INVALID, and the connection
    survives it (the blob was read before refusing);
  * an unknown prompt is refused and the same connection still converts.

The real backend's coupling is proved on the Mac by
`../standalone/stage4_wander_through_helper.py`.

Run:  python test_rpc_v02_conformance.py
"""

from __future__ import annotations

import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from client import DaemonClient, DaemonError  # noqa: E402
from test_rpc_v01_conformance import Checks, _f32le_silence, _wait_for_socket, _wait_model_loaded  # noqa: E402


def run() -> int:
    chk = Checks()
    tmp = Path(tempfile.mkdtemp(prefix="semantic-delay-v02-"))
    sock = tmp / "daemon.sock"
    proc = subprocess.Popen(
        [sys.executable, str(HERE / "semantic_delay_daemon.py"),
         "--sock", str(sock), "--pidfile", str(tmp / "daemon.pid"),
         "--prompts-dir", str(tmp / "prompts"), "--log-level", "WARNING"],
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    try:
        _wait_for_socket(sock)
        _wait_model_loaded(sock)

        with DaemonClient(sock) as c:
            h = c.hello()
            chk.eq(h.get("protocol_version"), "0.2", "hello negotiates 0.2")
            chk.ok("coupling" in (h.get("features") or []), "hello advertises the coupling feature")
            chk.ok("0.1" in (h.get("supported_versions") or []), "hello lists 0.1 as still supported")
        with DaemonClient(sock) as c:
            chk.eq(c.hello(protocol_version="0.1").get("protocol_version"), "0.1",
                   "a 0.1 client is answered in 0.1")
        with DaemonClient(sock) as c:
            try:
                c.hello(protocol_version="0.3")
                chk.ok(False, "hello 0.3 is refused")
            except DaemonError as e:
                chk.eq(e.code, "E_PROTOCOL_MISMATCH", "hello 0.3 -> E_PROTOCOL_MISMATCH")

        pcm = _f32le_silence(4800)
        with DaemonClient(sock) as c:
            c.hello()
            c.prompts_register("spirit.test.v1", "Test", _f32le_silence(24000), 24000)

            r = c.convert("spirit.test.v1", pcm, 48000)
            chk.eq(r.audio_out, pcm, "no knob: still the bit-exact pass-through")
            chk.eq(r.coupling, None, "no knob: no coupling report")

            r = c.convert("spirit.test.v1", pcm, 48000, coupling={"k": 0.5, "seed": 3})
            chk.eq(r.audio_out, pcm, "knob set on the stub: audio still passes through")
            chk.eq((r.coupling or {}).get("k"), 0.5, "coupling report echoes k")
            chk.eq((r.coupling or {}).get("applied"), False, "stub says it did not bend the pitch")

            for bad, label in (({"k": 1.5}, "k out of range"), ({"k": "high"}, "k not a number"),
                               ({}, "k missing"), ({"k": 0.5, "scale": []}, "empty scale"),
                               ({"k": 0.5, "seed": 1.5}, "seed not an integer")):
                try:
                    c.convert("spirit.test.v1", pcm, 48000, coupling=bad)
                    chk.ok(False, f"{label} is refused")
                except DaemonError as e:
                    chk.eq(e.code, "E_OPTION_INVALID", f"{label} -> E_OPTION_INVALID")
            r = c.convert("spirit.test.v1", pcm, 48000, coupling={"k": 1.0})
            chk.eq(len(r.audio_out), len(pcm), "connection survives five refused knobs")

            try:
                c.convert("spirit.nobody.v1", pcm, 48000)
                chk.ok(False, "unknown prompt is refused")
            except DaemonError as e:
                chk.eq(e.code, "E_PROMPT_UNKNOWN", "unknown prompt -> E_PROMPT_UNKNOWN")
            r = c.convert("spirit.test.v1", pcm, 48000)
            chk.eq(len(r.audio_out), len(pcm), "same connection converts after a refused prompt")

            c.shutdown()
        proc.wait(timeout=10)
    finally:
        if proc.poll() is None:
            proc.terminate()

    print(f"\n  {chk.passed} checks passed, {len(chk.failures)} failed")
    if chk.failures:
        for f in chk.failures:
            print(f"  - {f}")
        return 1
    print("  RPC v0.2 contract holds.")
    return 0


if __name__ == "__main__":
    raise SystemExit(run())
