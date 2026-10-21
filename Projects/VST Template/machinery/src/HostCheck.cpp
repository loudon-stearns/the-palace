// HostCheck.cpp — shared machinery: load an installed plugin the way a DAW
// does, list its parameters, then move some and hear whether each one reaches
// the sound. Don't edit per plugin.
//
//   HostCheck <plugin.vst3 | plugin.component> [id=value ...]
//
// Every render is one second from a fresh start (releaseResources, then
// prepareToPlay). An instrument hears MIDI note 48 (C3) at the start, released
// at 0.75 s; an effect hears a quiet sawtooth. It renders the defaults twice:
// the two must match, or the plugin is not deterministic and the check says so.
// Then, for each id=value, it sets that one parameter through the host
// interface (by its display text, so "6e-5" means 6e-5 in the plugin's own
// units), every other parameter back at its default, renders again, and
// measures how far the result is from the defaults' render. A plugin whose
// sound evolves on its own (Frustration) would pass a before-and-after check
// with a dead knob; comparing two renders from the same start does not.
//
// Exit 0 when the plugin loaded, its defaults rendered the same twice, every
// named parameter was found and automatable, every render was finite, and
// every move changed the sound.
#include <juce_audio_processors/juce_audio_processors.h>
#include <juce_dsp/juce_dsp.h>

#include <cmath>
#include <cstdio>
#include <vector>

namespace
{
    struct Second { std::vector<float> x; double rms = 0, peak = 0, centroid = 0; bool finite = true; };

    Second render (juce::AudioPluginInstance& p, double sr, int block)
    {
        p.releaseResources();
        p.prepareToPlay (sr, block);

        const int total = (int) sr;
        juce::AudioBuffer<float> buf (juce::jmax (p.getTotalNumInputChannels(), p.getTotalNumOutputChannels()), block);
        juce::MidiBuffer midi;
        Second s;
        s.x.reserve ((size_t) total);
        double sawPhase = 0.0;                    // an effect hears a 110 Hz saw at -12 dBFS
        const int noteOff = (int) (0.75 * sr);    // an instrument hears C3 for three quarters of the second
        for (int done = 0; done < total; done += block)
        {
            buf.clear();
            midi.clear();
            if (p.acceptsMidi())
            {
                if (done == 0) midi.addEvent (juce::MidiMessage::noteOn (1, 48, (juce::uint8) 100), 0);
                if (noteOff >= done && noteOff < done + block) midi.addEvent (juce::MidiMessage::noteOff (1, 48), noteOff - done);
            }
            for (int k = 0; k < block; ++k)
            {
                const float x = (float) (0.25 * (2.0 * sawPhase - 1.0));
                sawPhase += 110.0 / sr; sawPhase -= std::floor (sawPhase);
                for (int c = 0; c < p.getTotalNumInputChannels(); ++c) buf.setSample (c, k, x);
            }
            p.processBlock (buf, midi);
            for (int k = 0; k < block; ++k) s.x.push_back (buf.getSample (0, k));
        }

        double sum = 0;
        for (float x : s.x) { if (! std::isfinite (x)) s.finite = false; sum += (double) x * x; s.peak = juce::jmax (s.peak, (double) std::abs (x)); }
        s.rms = std::sqrt (sum / (double) s.x.size());

        constexpr int order = 12, size = 1 << order;
        juce::dsp::FFT fft (order);
        std::vector<float> work (2 * size);
        double num = 0, den = 0;
        for (size_t start = 0; start + size <= s.x.size(); start += size / 2)
        {
            for (int k = 0; k < size; ++k)
                work[(size_t) k] = s.x[start + (size_t) k] * (float) (0.5 - 0.5 * std::cos (2.0 * M_PI * k / size));
            std::fill (work.begin() + size, work.end(), 0.0f);
            fft.performFrequencyOnlyForwardTransform (work.data());
            for (int b = 1; b < size / 2; ++b) { num += work[(size_t) b] * (b * sr / size); den += work[(size_t) b]; }
        }
        s.centroid = den > 0 ? num / den : 0;
        return s;
    }

    // Largest sample difference between two renders, as a fraction of the first one's peak.
    double distance (const Second& a, const Second& b)
    {
        double d = 0;
        for (size_t i = 0; i < a.x.size() && i < b.x.size(); ++i) d = juce::jmax (d, (double) std::abs (a.x[i] - b.x[i]));
        return d / juce::jmax (a.peak, 1e-9);
    }

    void report (const char* label, const Second& s, const char* note = "")
    {
        std::printf ("  %-26s rms %6.1f dBFS  peak %6.1f dBFS  centroid %6.0f Hz  %s%s\n", label,
                     20 * std::log10 (s.rms + 1e-12), 20 * std::log10 (s.peak + 1e-12), s.centroid, note,
                     s.finite ? "" : "  NOT FINITE");
    }
}

int main (int argc, char** argv)
{
    juce::ScopedJuceInitialiser_GUI juceInit;
    if (argc < 2) { std::fprintf (stderr, "usage: HostCheck <plugin file> [id=value ...]\n"); return 2; }

    const juce::String path = juce::File::getCurrentWorkingDirectory().getChildFile (argv[1]).getFullPathName();
    juce::AudioPluginFormatManager fm;
    juce::addDefaultFormatsToManager (fm);

    juce::OwnedArray<juce::PluginDescription> types;
    for (auto* format : fm.getFormats())
        if (format->fileMightContainThisPluginType (path))
            format->findAllTypesForFile (types, path);
    if (types.isEmpty()) { std::fprintf (stderr, "no plugin found in %s\n", path.toRawUTF8()); return 1; }

    const double sr = 44100.0;
    const int block = 512;
    juce::String error;
    auto plugin = fm.createPluginInstance (*types[0], sr, block, error);
    if (plugin == nullptr) { std::fprintf (stderr, "could not load: %s\n", error.toRawUTF8()); return 1; }

    std::printf ("loaded %s (%s, %s) from %s\n", plugin->getName().toRawUTF8(),
                 types[0]->pluginFormatName.toRawUTF8(), types[0]->manufacturerName.toRawUTF8(), path.toRawUTF8());

    // A JUCE plugin shows the host a hash of each string id (VST3 and AU alike),
    // so match the hash, the plain id, or the display name.
    auto findParam = [&] (const juce::String& id) -> juce::AudioProcessorParameter*
    {
        const auto hashed = juce::String ((juce::uint32) id.hashCode() & 0x7fffffffu);
        for (auto* p : plugin->getParameters())
            if (auto* hp = dynamic_cast<juce::HostedAudioProcessorParameter*> (p))
                if (hp->getParameterID() == id || hp->getParameterID() == hashed || p->getName (64) == id) return p;
        return nullptr;
    };

    // JUCE adds a hidden parameter per MIDI CC to a VST3 instrument; count them, don't list them.
    int midiProxies = 0;
    std::printf ("parameters:\n");
    for (auto* p : plugin->getParameters())
    {
        if (p->getName (64).startsWith ("MIDI CC")) { ++midiProxies; continue; }
        std::printf ("  %-18s %-16s %s\n", p->getName (64).toRawUTF8(),
                     (p->getCurrentValueAsText() + " " + p->getLabel()).toRawUTF8(),
                     p->isAutomatable() ? "automatable" : "fixed");
    }
    if (midiProxies > 0) std::printf ("  (and %d MIDI CC proxies the VST3 wrapper adds)\n", midiProxies);

    std::vector<float> defaults;
    for (auto* p : plugin->getParameters()) defaults.push_back (p->getValue());
    auto restoreDefaults = [&]
    {
        const auto params = plugin->getParameters();
        for (int i = 0; i < params.size(); ++i)
            if (params[i]->getValue() != defaults[(size_t) i]) params[i]->setValueNotifyingHost (defaults[(size_t) i]);
    };

    plugin->enableAllBuses();
    bool ok = true;
    std::printf ("render (one second each, from a fresh start):\n");
    const auto base = render (*plugin, sr, block);
    report ("defaults", base);
    const auto again = render (*plugin, sr, block);
    const double drift = distance (base, again);
    const bool deterministic = drift < 1e-6;
    report ("defaults again", again, deterministic ? "(same as the first)" : "");
    if (! deterministic) std::printf ("  the two renders of the defaults differ by %.2g of peak: not deterministic\n", drift);
    ok = ok && base.finite && base.rms > 1e-5 && deterministic;

    for (int a = 2; a < argc; ++a)
    {
        const juce::String arg (argv[a]);
        const auto id = arg.upToFirstOccurrenceOf ("=", false, false);
        const auto text = arg.fromFirstOccurrenceOf ("=", false, false);
        auto* p = findParam (id);
        if (p == nullptr) { std::printf ("  %s: NOT FOUND\n", id.toRawUTF8()); ok = false; continue; }
        if (! p->isAutomatable()) { std::printf ("  %s: not automatable\n", id.toRawUTF8()); ok = false; }
        restoreDefaults();
        p->setValueNotifyingHost (p->getValueForText (text));
        const auto s = render (*plugin, sr, block);
        const double d = distance (base, s);
        const bool changed = d > 1e-4;
        char note[64];
        std::snprintf (note, sizeof note, changed ? "differs from defaults by %.2g of peak" : "NO CHANGE (%.2g)", d);
        const juce::String label = id + " -> " + p->getCurrentValueAsText();
        report (label.toRawUTF8(), s, note);
        ok = ok && s.finite && changed;
    }
    restoreDefaults();

    plugin->releaseResources();
    std::printf ("%s\n", ok ? "HOST CHECK PASSED" : "HOST CHECK FAILED");
    return ok ? 0 : 1;
}
