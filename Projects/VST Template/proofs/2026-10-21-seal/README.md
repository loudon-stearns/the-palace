---
title: README
born: 2026-10-21
links:
  - target: "[[VST Template]]"
    type: connects-to
    label: proof-for
forward_vector: "I hold the proof of the broken seal Live 12's scanner caught on 2026-10-20 after pluginval, auval and the host check had passed: the symptom, the cause, the strict check and the re-seal, and the Live 12 load still to do."
---

# A broken seal: why Live refused Frustration when every other check passed

On the night of 2026-10-20, the Ableton session found that Live 12's plug-in scanner refused the installed Frustration.vst3. pluginval, auval and the template's own host check had all passed it.

**The symptom.** `PluginScanner.txt` at 23:50:08 (`PluginScanner-excerpt.txt`): "Failed to load plugin: a sealed resource is missing or invalid / VST3: not a plugin". The plugin never reached Live, and a Set naming it opened with "The VST3 plug-in could not be found".

**The cause.** JUCE signs each bundle ad hoc as part of the build, and can then write the VST3's `Contents/Resources/moduleinfo.json` afterwards, so the signature no longer covers the bundle. Both AU components were sealed for resources they don't have. Simple Synth's VST3 happened to come out whole. `codesign --verify --deep --strict` shows all three faults (`codesign.txt`).

**Why the other checks passed.** pluginval, auval and the host check load a bundle's code without checking its seal strictly. Live's scanner does check it.

**The fix** (`machinery/plugin.sh`, commit 321f157c):
- `build` re-seals each bundle ad hoc after JUCE has finished writing into it, then checks it.
- `install` refuses a bundle whose seal fails the strict check.
- `validate` opens with the strict check on both installed bundles, before pluginval and auval.

After the fix, all four installed bundles pass. Live's scanner logged "found: Frustration" and "found: Simple Synth" at 00:03, and `validate` passes for both (`*-validate.txt`: 4 signatures, pluginval SUCCESS, AU VALIDATION SUCCEEDED).

## The Live 12 load

**Frustration did load in Live 12, from a Set, not from the browser.** The Ableton session opened its Frustration Set, which names the plugin by its class id, in a second Live 12.4.6 instance. Live's `Log.txt` (checked here):

    2026-10-21T00:16:02.164572: info: VST3: Going to restore: Frustration
    2026-10-21T00:16:02.203949: info: VST3: plugin processor successfully loaded: Loudon Live 'Frustration' v0.1.0 (cid: {ABCDEF01-9182-FAEB-4C6F-756446727374})
    2026-10-21T00:16:02.213880: info: VST3: Restored: Frustration

The same Set had failed with "VST3: Restore 1 failed: Frustration" at 23:56:43, before the re-seal. Simple Synth was restored the same way at 00:03:10. Neither has yet been inserted by hand from Live's browser.

**What was tried from the browser, and what it reached.** The app-control tools address an app by its bundle id. Live 11 and Live 12 share one, and the tools resolved it to Live 11 (his show Set "860_10OCT26"). They were used there for a single read-only screenshot. Everything else was driven by full-screen control, with Live 12 brought to the front by its path.

- **In Loudon's own Live 12** (pid 66009, an unsaved "Untitled" Set):
  - browser searches, then the Plug-Ins category, cleared afterwards;
  - one plain Rescan from Settings → Plug-Ins (scanner run at 00:08:01);
  - the browser put back on All with "limit" in the search.
  - No track, device or setting was changed. One view did change: the large EQ Eight display collapsed into its device.
- **In a second Live 12 opened for the check** (pid 82621):
  - a MIDI track added;
  - the Plug-Ins tree browsed;
  - a full Option-click rescan (scanner runs from about 00:17 to 00:36);
  - then Quit from that process's own menu, chosen by its process id.

By about 00:50 no Live was running at all. Loudon was at the machine.

**AU registration.** All three Loudon Live AUs are registered and validate (`auval -v aumu Frst|Smsy|Trkm Loud`: AU VALIDATION SUCCEEDED). `auval -a` cannot answer this on this Mac, because its listing stops partway through the effects, before any instrument.

## What was still open at the end of the night

- **Live's browser never listed the new plugins.** Live's scanner database holds both, enabled. Its browser index holds only Tract Mirror. That stayed true after a plain rescan in the running Live 12, and after a full rescan (655 VST3s, finished 00:37) in a second Live 12 instance launched fresh for this check. So neither plugin could be inserted from the browser.
- **The running Live 12 was not restarted.** It had been open since Oct 19, holding an unsaved Set with a Serum 2 track. It had closed by about 00:50, and not through this session.
- **No sound was checked in Live.** Its audio device was set to "No Device". What the plugins sound like is in the verify renders (`../2026-10-20-first-plugins/`).
- **Nothing was saved.** The second instance's scratch Set was discarded when it quit.
- **Still to try:** with no Live running now, launch Live 12 once and see whether the browser lists Frustration and Simple Synth under Plug-Ins → Loudon Live. Until then, the Ableton session's Sets load them by class id.
