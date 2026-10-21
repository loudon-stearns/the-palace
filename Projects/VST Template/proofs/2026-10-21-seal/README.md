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

## The Live 12 load: not done

- **Live's browser never listed the new plugins.** Live's scanner database holds both, enabled. Its browser index holds only Tract Mirror. That stayed true after a plain rescan in the running Live 12, and after a full rescan (655 VST3s, finished 00:37) in a second Live 12 instance launched fresh for this check. So neither plugin could be inserted from the browser.
- **The running Live 12 was left alone.** It is the instance that has been open since Oct 19, and it holds an unsaved Set with a Serum 2 track, so it wasn't restarted.
- **No sound could have been checked anyway.** Its audio device is set to "No Device".
- **Nothing was saved.** The second instance's scratch Set was discarded when it quit.
- **Still to try:** loading the plugins from a Set that names them by class id (the Ableton session's writer makes one), or quitting every Live 12 and relaunching so the index rebuilds.
