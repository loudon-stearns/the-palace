# Templates — what live-set.mjs clones from

Made by `make-templates.mjs` on 2026-10-21. Every shell is an element Live itself wrote; the writer changes only what must change (names, ids, values, references) and renumbers every pointee id from the set's `NextPointeeId`, which is GoButton's craft (`tools/v2-convert.js` § 2 THE XML in Loudon's GoButton Local repo).

- `blank-set.als` — copied from `<Live 12 Suite.app>/Contents/App-Resources/Builtin/Templates/DefaultLiveSet.als`, written by Ableton Live 12.1d1
- `Sampler.adv` — copied from `<Live 12 Suite.app>/Contents/App-Resources/Core Library/Defaults/Instruments/Sampler.adv`, written by Ableton Live 12.4d1
- `Limiter.adv` — copied from `<Live 12 Suite.app>/Contents/App-Resources/Core Library/Defaults/Audio Effects/Limiter.adv`, written by Ableton Live 12.4d1
- `midi-track.xml` — a <MidiTrack> from a set written by Ableton Live 12.4.6; devices, clips, automation lanes and name removed
- `plugin-device.xml` — a <PluginDevice> holding a VST3 instrument, from a set written by Ableton Live 12.4.6; the plugin's name, class id, state and parameter list removed
- `midi-clip.xml` — an arrangement <MidiClip> from a set written by Ableton Live 12.4.6; its notes and name removed
- `sample-part.xml` — a <MultiSamplePart> from a Simpler in a set written by Ableton Live 12.4.6; its sample reference blanked

The two `.adv` files and `blank-set.als` are Ableton's own defaults, kept as the gzipped originals. The `.xml` shells came from sets on Loudon's Mac and carry nothing of those sets but their shape.
