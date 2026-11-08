# Semantic Delay — Daemon RPC v0.2

> What v0.2 adds to [the v0.1 contract](RPC-v0.1.md). Everything in v0.1 still
> holds, and a v0.1 client is still served. v0.2 adds one thing: the melody
> knob, an optional `options.coupling` on `convert`.

Built 2026-10-14 (the cycle that ran it was cut off before it posted; its work
was committed late in 64883716). This page was written 2026-11-02, from the
code as it stands, so the contract the plugin will be built against is on paper.

---

## 1. What changes, in one line

`convert` may carry `options.coupling = {"k": 0..1, ...}`. The helper tracks
the phrase's pitch as before, then bends that contour by the knob before the
model sings it: at `k = 1` the echo sings your melody; as `k` falls it lets go,
and at `k = 0` it keeps your words and rhythm but sings its own line on the
scale the phrase already sits on.

No knob (absent or `null`) is exactly v0.1: the echo sings the phrase's own pitch.

## 2. `hello`

The client may send `"protocol_version": "0.1"` or `"0.2"`. The helper answers
in the client's own version (so a client pinned to `>=0.1,<0.2` still sees a
version it accepts) and adds two fields:

```json
{
  "ok": true,
  "protocol_version": "0.2",
  "supported_versions": ["0.1", "0.2"],
  "features": ["coupling"],
  "model": { "name": "SoulX-Singer-SVC", "sr": 24000, "loaded": true, "device": "mps" }
}
```

A client checks `"coupling" in features` before sending the knob. Any other
protocol version is still `E_PROTOCOL_MISMATCH`.

## 3. `convert` — the knob

```json
"options": {
  "n_steps": 32,
  "cfg": 3.0,
  "auto_shift": true,
  "pitch_shift": 0,
  "output_sample_rate": null,
  "coupling": {
    "k": 0.5,
    "seed": 7,
    "scale": [0, 3, 5, 7, 10],
    "drift_semitones": 3.0,
    "vibrato_semitones": 0.4
  }
}
```

| field | type | default | meaning |
|---|---|---|---|
| `k` | number in [0, 1] | required | how tightly the echo holds your melody. 1 locked, 0 free. |
| `seed` | integer | 7 | the wandering line's random draw; same seed, same line. |
| `scale` | non-empty list of integers (pitch classes, taken mod 12) | minor pentatonic | the notes a loosened echo may land on. Its root is fitted to the phrase. |
| `drift_semitones` | number | 3.0 | how far from the phrase's middle pitch the free line may roam. |
| `vibrato_semitones` | number | 0.4 | vibrato laid on the free line. |

What the helper does with it, in order: track the phrase's pitch (RMVPE);
fold octave slips the tracker made back into place; fit the scale's root to
the phrase; bend the contour toward a wandering line on that scale by `1 − k`
(the follower speeds up as `k` rises, so a locked echo does not slur note
changes); hand the bent contour to the model as the pitch to sing. The code is
`../standalone/coupling.py` (`couple_phrase`), shared with the proofs so the
helper and the proofs cannot drift.

`auto_shift` still applies after the knob: the model may move the whole line by
whole semitones into the reference singer's range, and says so in
`applied_pitch_shift` as before.

## 4. The response — the `coupling` report

When the request carried a knob, the response header carries what it did (the values here are an example):

```json
"coupling": {
  "k": 0.5,
  "applied": true,
  "voiced": true,
  "seed": 7,
  "scale": [0, 3, 5, 7, 10],
  "scale_root_midi": 57,
  "center_midi": 62.4,
  "asked_vs_source_st": 2.475
}
```

- `applied` — `true` from the real model; the placeholder backend (`--backend
  stub`) answers `false` with a `note`, because it has no pitch to bend.
- `asked_vs_source_st` — how far, in mean semitones over voiced frames, the
  contour the model was asked to sing sits from the phrase's own melody.
  This is what the knob did before the model sang; what the model then sang
  is measured by the proofs, not reported here.
- A phrase with no voiced frames returns silence of equal length (as in v0.1)
  and no `coupling` report.

A response without a knob carries no `coupling` field. A v0.1 client never
sends the knob, so it never sees one.

## 5. Errors

One new code, on `convert`, raised before any compute is spent:

| code | when |
|---|---|
| `E_OPTION_INVALID` | `coupling` is not an object or null; `k` missing, not a number, or outside [0, 1]; `seed` not an integer; `drift_semitones` or `vibrato_semitones` not a number; `scale` empty or not a list of integers. |

The connection stays open after it; the next `convert` on the same connection
is served.

## 6. What the plugin should do

- Send `"protocol_version": "0.2"` and pin `>=0.1,<0.3`.
- Send the knob only when `hello` lists `coupling`.
- One knob per echo, not per phrase: the first repeat can hold the melody and
  later ones let go (the dub feedback train). The standalone instrument does
  this with `tap_coupling=[1, 0.5, 0]`, one `convert` per echo.
- Treat the report as informational; ignore fields it does not know.

## 7. Checked by

- `test_rpc_v02_conformance.py` — 18 checks against the placeholder backend,
  no model needed: the feature is advertised, no-knob is still the v0.1
  pass-through, a knob is echoed back, each bad knob is refused with
  `E_OPTION_INVALID` and the connection survives.
- `test_rpc_v01_conformance.py` — the v0.1 contract still holds (19 checks).
- `../standalone/stage4_wander_through_helper.py` — the real model through
  the helper, on the Mac: three echoes at `k` = 1, 0.5, 0. Re-run 2026-11-02:
  the model sang within 0.18–0.31 semitones of what it was asked, and the
  echoes sat 0.81, 2.44 and 4.32 semitones from the source melody.
