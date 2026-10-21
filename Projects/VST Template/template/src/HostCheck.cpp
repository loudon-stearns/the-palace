// HostCheck.cpp — template machinery: load an installed plugin the way a DAW
// does, list its parameters, then move some and listen for a change.
// Don't edit per plugin.
//
//   HostCheck <plugin.vst3 | plugin.component> [id=value ...]
//
// It renders one second at the defaults, then, for each id=value, sets that
// parameter through the host interface (by its display text, so "6e-5" means
// 6e-5 in the plugin's own units), renders one more second, and prints the
// loudness and spectral centroid of each second. Exit 0 when the plugin loaded,
// every named parameter was found and automatable, the output was finite, and
// every move changed the sound.
#include <juce_audio_processors/juce_audio_processors.h>
#include <juce_dsp/juce_dsp.h>

#include <cmath>
#include <cstdio>

namespace
{
    struct Second { double rms = 0, peak = 0, centroid = 0; bool finite = true; };

    Second render (juce::AudioPluginInstance& p, double sr, int block)
    {
        const int total = (int) sr;
        juce::AudioBuffer<float> buf (juce::jmax (p.getTotalNumInputChannels(), p.getTotalNumOutputChannels()), block);
        juce::MidiBuffer midi;
        std::vector<float> mono;
        mono.reserve ((size_t) total);
        static double sawPhase = 0.0;   // an effect hears a 110 Hz saw at -12 dBFS
        for (int done = 0; done < total; done += block)
        {
            buf.clear();
            for (int k = 0; k < block; ++k)
            {
                const float x = (float) (0.25 * (2.0 * sawPhase - 1.0));
                sawPhase += 110.0 / sr; sawPhase -= std::floor (sawPhase);
                for (int c = 0; c < p.getTotalNumInputChannels(); ++c) buf.setSample (c, k, x);
            }
            p.processBlock (buf, midi);
            for (int k = 0; k < block; ++k) mono.push_back (buf.getSample (0, k));
        }

        Second s;
        double sum = 0;
        for (float x : mono) { if (! std::isfinite (x)) s.finite = false; sum += (double) x * x; s.peak = juce::jmax (s.peak, (double) std::abs (x)); }
        s.rms = std::sqrt (sum / (double) mono.size());

        constexpr int order = 12, size = 1 << order;
        juce::dsp::FFT fft (order);
        std::vector<float> work (2 * size);
        double num = 0, den = 0;
        for (size_t start = 0; start + size <= mono.size(); start += size / 2)
        {
            for (int k = 0; k < size; ++k)
                work[(size_t) k] = mono[start + (size_t) k] * (float) (0.5 - 0.5 * std::cos (2.0 * M_PI * k / size));
            std::fill (work.begin() + size, work.end(), 0.0f);
            fft.performFrequencyOnlyForwardTransform (work.data());
            for (int b = 1; b < size / 2; ++b) { num += work[(size_t) b] * (b * sr / size); den += work[(size_t) b]; }
        }
        s.centroid = den > 0 ? num / den : 0;
        return s;
    }

    void report (const char* label, const Second& s)
    {
        std::printf ("  %-28s rms %7.1f dBFS  peak %7.1f dBFS  centroid %7.0f Hz%s\n", label,
                     20 * std::log10 (s.rms + 1e-12), 20 * std::log10 (s.peak + 1e-12), s.centroid,
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

    plugin->enableAllBuses();
    plugin->prepareToPlay (sr, block);

    bool ok = true;
    auto base = render (*plugin, sr, block);
    std::printf ("render:\n");
    report ("defaults", base);
    ok = ok && base.finite && base.rms > 1e-5;

    auto previous = base;
    for (int a = 2; a < argc; ++a)
    {
        const juce::String arg (argv[a]);
        const auto id = arg.upToFirstOccurrenceOf ("=", false, false);
        const auto text = arg.fromFirstOccurrenceOf ("=", false, false);
        auto* p = findParam (id);
        if (p == nullptr) { std::printf ("  %s: NOT FOUND\n", id.toRawUTF8()); ok = false; continue; }
        if (! p->isAutomatable()) { std::printf ("  %s: not automatable\n", id.toRawUTF8()); ok = false; }
        p->setValueNotifyingHost (p->getValueForText (text));
        const auto s = render (*plugin, sr, block);
        const juce::String label = id + " -> " + p->getCurrentValueAsText();
        report (label.toRawUTF8(), s);
        const bool changed = std::abs (s.centroid - previous.centroid) > 1.0 || std::abs (s.rms - previous.rms) > 1e-4 * previous.rms;
        if (! changed) std::printf ("  (no change heard)\n");
        ok = ok && s.finite && changed;
        previous = s;
    }

    plugin->releaseResources();
    std::printf ("%s\n", ok ? "HOST CHECK PASSED" : "HOST CHECK FAILED");
    return ok ? 0 : 1;
}
