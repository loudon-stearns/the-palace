// PluginProcessor.cpp — see PluginProcessor.h. Nothing in processBlock allocates or waits on a lock.
#include "PluginProcessor.h"
#include "PluginEditor.h"

#include <cmath>
#include <cstdio>

namespace
{
    using tpl::Taper;

    juce::NormalisableRange<float> rangeFor (const tpl::ParamSpec& s)   // as the template's processor has it
    {
        if (s.taper == Taper::Log)
        {
            const double lo = std::log (s.min), hi = std::log (s.max);
            return { (float) s.min, (float) s.max,
                     [lo, hi] (float, float, float x) { return (float) std::exp (lo + (hi - lo) * x); },
                     [lo, hi] (float, float, float v) { return (float) ((std::log ((double) v) - lo) / (hi - lo)); },
                     [] (float a, float b, float v) { return juce::jlimit (a, b, v); } };
        }
        return { (float) s.min, (float) s.max };
    }
}

juce::AudioProcessorValueTreeState::ParameterLayout Processor::createLayout()
{
    juce::AudioProcessorValueTreeState::ParameterLayout layout;
    for (const auto& s : algo::kParams)
    {
        const juce::ParameterID pid { s.id, 1 };
        if (s.taper == Taper::Toggle)
        {
            layout.add (std::make_unique<juce::AudioParameterBool> (pid, s.name, s.def > 0.5, juce::AudioParameterBoolAttributes().withAutomatable (s.automatable)));
            continue;
        }
        auto attrs = juce::AudioParameterFloatAttributes()
                         .withLabel (s.unit)
                         .withAutomatable (s.automatable)
                         .withStringFromValueFunction ([] (float v, int) { char b[32]; std::snprintf (b, sizeof b, "%.2f", (double) v); return juce::String (b); })
                         .withValueFromStringFunction ([] (const juce::String& t) { return (float) t.getDoubleValue(); });
        layout.add (std::make_unique<juce::AudioParameterFloat> (pid, s.name, rangeFor (s), (float) s.def, attrs));
    }
    return layout;
}

Processor::Processor()
    : juce::AudioProcessor (BusesProperties().withInput ("Input", juce::AudioChannelSet::stereo(), true)
                                             .withOutput ("Output", juce::AudioChannelSet::stereo(), true)),
      apvts (*this, nullptr, "PARAMS", createLayout())
{
    for (int i = 0; i < algo::kNumParams; ++i)
        raw[(size_t) i] = apvts.getRawParameterValue (algo::kParams[i].id);

    // A spore from the start, so a state saved before any sound has a colony in it.
    dish->col.reset ((juce::uint32) (1 + random.nextInt (0x7ffffffe)), algo::kDishW, algo::kDishH);
    *shared = dish->col;
}

bool Processor::isBusesLayoutSupported (const BusesLayout& layout) const
{
    const auto out = layout.getMainOutputChannelSet(), in = layout.getMainInputChannelSet();
    const auto ok = [] (const juce::AudioChannelSet& s) { return s == juce::AudioChannelSet::mono() || s == juce::AudioChannelSet::stereo(); };
    return ok (out) && ok (in);
}

void Processor::prepareToPlay (double sampleRate, int maxBlock)
{
    sr = sampleRate;
    {
        const juce::SpinLock::ScopedLockType l (lock);
        if (hasPending.exchange (false)) { dish->col = *shared; dish->col.net = &dish->net; }
    }
    const double carry = raw[algo::pCarry]->load(), wetness = raw[algo::pWetness]->load();
    dish->prepare (sampleRate, carry, wetness);     // the same colony, rebuilt silent at this rate
    lastCarry = carry; lastWetness = wetness;
    dish->col.hold = raw[algo::pHold]->load() > 0.5f;

    const auto cap = (size_t) juce::jmax (maxBlock, algo::kBlock);
    mono.assign (cap, 0.0f); extra.assign (cap, 0.0f); wetL.assign (cap, 0.0f); wetR.assign (cap, 0.0f);

    // The page's knock: two decaying sines and a 96-sample burst of noise.
    const int n = (int) std::lround (0.09 * sampleRate);
    knockBuf.assign ((size_t) n, 0.0f);
    for (int i = 0; i < n; ++i)
    {
        const double t = i / sampleRate;
        knockBuf[(size_t) i] = (float) (0.55 * std::sin (6.283 * 640 * t) * std::exp (-t * 70) + 0.3 * std::sin (6.283 * 1510 * t) * std::exp (-t * 110)
                                        + (i < 96 ? (random.nextDouble() * 2 - 1) * 0.5 * (1 - i / 96.0) : 0.0));
    }
    knockPos.fill (-1);

    smooth = std::exp (-1.0 / (0.02 * sampleRate));
    guardAtk = std::exp (-1.0 / (0.003 * sampleRate)); guardRel = std::exp (-1.0 / (0.2 * sampleRate)); guardEnv = 0.0;
    dryNow = raw[algo::pDry]->load();
    wetNow = algo::Dish::wetGain (carry) * juce::Decibels::decibelsToGain ((double) raw[algo::pLevel]->load());

    const juce::SpinLock::ScopedLockType l (lock);
    *shared = dish->col; lastFeeds = dish->feeds;
}

void Processor::knock (int node) { if (node >= 0) knockNode.store (node); knockReq.fetch_add (1); }
void Processor::newSpore() { sporeReq.store ((juce::uint32) (1 + random.nextInt (0x7ffffffe))); }

void Processor::view (algo::MycelColony& into)
{
    const juce::SpinLock::ScopedLockType l (lock);
    into = *shared;
}

void Processor::processBlock (juce::AudioBuffer<float>& buffer, juce::MidiBuffer&)
{
    juce::ScopedNoDenormals noDenormals;
    auto& d = *dish;

    // A loaded state: the whole colony, taken here so the network is only ever rebuilt on this thread.
    if (hasPending.load (std::memory_order_relaxed))
    {
        bool got = false;
        {
            const juce::SpinLock::ScopedTryLockType l (lock);
            if (l.isLocked() && hasPending.exchange (false)) { *incoming = *shared; got = true; }
        }
        if (got) d.adopt (*incoming);
    }

    const double carry = raw[algo::pCarry]->load (std::memory_order_relaxed), wetness = raw[algo::pWetness]->load (std::memory_order_relaxed);
    const bool hold = raw[algo::pHold]->load (std::memory_order_relaxed) > 0.5f;
    if (carry != lastCarry || wetness != lastWetness) { d.net.par (carry, wetness, d.tipKeep); lastCarry = carry; lastWetness = wetness; }

    if (const auto seed = sporeReq.exchange (0)) d.spore (seed, hold);
    d.col.hold = hold;
    if (frostReq.exchange (0) > 0) { d.col.frost(); d.feeds++; }
    if (knockReq.exchange (0) > 0)
    {
        const int node = knockNode.exchange (-1);
        if (node >= 0 && node < d.col.nNodes && d.col.nodes[(size_t) node].used && d.col.nodes[(size_t) node].nsegs > 0) { d.col.setIn (node); d.feeds++; }
        for (auto& p : knockPos) if (p < 0) { p = 0; break; }
    }

    const int numSamples = buffer.getNumSamples(), numIn = getTotalNumInputChannels(), numOut = getTotalNumOutputChannels();
    const int chans = buffer.getNumChannels(), cap = (int) mono.size();
    const double dryTarget = raw[algo::pDry]->load (std::memory_order_relaxed);
    const double wetTarget = algo::Dish::wetGain (carry) * juce::Decibels::decibelsToGain ((double) raw[algo::pLevel]->load (std::memory_order_relaxed));
    const int knockLen = (int) knockBuf.size();
    constexpr double guardAt = 0.31622776601683794;   // −10 dBFS
    double guardMin = 1.0;

    for (int o = 0; o < numSamples && cap > 0; )
    {
        const int m = juce::jmin (numSamples - o, cap);
        const float* inL = numIn > 0 && chans > 0 ? buffer.getReadPointer (0, o) : nullptr;
        const float* inR = numIn > 1 && chans > 1 ? buffer.getReadPointer (1, o) : inL;
        for (int i = 0; i < m; ++i)
        {
            float k = 0.0f;
            for (auto& p : knockPos) if (p >= 0) { k += knockBuf[(size_t) p]; if (++p >= knockLen) p = -1; }
            extra[(size_t) i] = k;
            mono[(size_t) i] = k + (inL ? 0.5f * (inL[i] + inR[i]) : 0.0f);
        }

        d.process (mono.data(), wetL.data(), wetR.data(), m);

        float* outL = chans > 0 ? buffer.getWritePointer (0, o) : nullptr;
        float* outR = numOut > 1 && chans > 1 ? buffer.getWritePointer (1, o) : nullptr;
        for (int i = 0; i < m; ++i)
        {
            dryNow = dryTarget + smooth * (dryNow - dryTarget);
            wetNow = wetTarget + smooth * (wetNow - wetTarget);
            const double k = extra[(size_t) i], l = inL ? inL[i] : 0.0, r = inR ? inR[i] : 0.0;
            double wl = wetNow * wetL[(size_t) i], wr = wetNow * wetR[(size_t) i];
            const double pk = std::max (std::fabs (wl), std::fabs (wr));
            guardEnv = pk + (pk > guardEnv ? guardAtk : guardRel) * (guardEnv - pk);
            if (guardEnv > guardAt) { const double gr = std::pow (guardEnv / guardAt, 1.0 / 12.0 - 1.0); wl *= gr; wr *= gr; if (gr < guardMin) guardMin = gr; }
            if (outR != nullptr)
            {
                outL[i] = (float) (dryNow * (l + k) + wl);
                outR[i] = (float) (dryNow * (r + k) + wr);
            }
            else if (outL != nullptr)
                outL[i] = (float) (dryNow * (0.5 * (l + r) + k) + 0.7071 * (wl + wr));
        }
        o += m;
    }
    for (int c = numOut; c < chans; ++c) buffer.clear (c, 0, numSamples);
    guardShown.store ((float) (20.0 * std::log10 (guardMin)), std::memory_order_relaxed);

    // The picture for the editor and the host's save: only when the colony has eaten or been touched,
    // and only if the lock is free right now.
    if (d.feeds != lastFeeds)
    {
        const juce::SpinLock::ScopedTryLockType l (lock);
        if (l.isLocked() && ! hasPending.load (std::memory_order_relaxed)) { *shared = d.col; lastFeeds = d.feeds; }
    }
}

juce::AudioProcessorEditor* Processor::createEditor() { return new Editor (*this); }

// The state: the knobs, and the whole colony as text (Algorithm.h, MycelColony::save).
void Processor::getStateInformation (juce::MemoryBlock& dest)
{
    auto colony = std::make_unique<algo::MycelColony>();
    view (*colony);
    std::string text; text.reserve (40000);
    colony->save (text);

    juce::ValueTree root ("MycelialReverb");
    root.setProperty ("version", 1, nullptr);
    root.setProperty ("colony", juce::String (text), nullptr);
    root.appendChild (apvts.copyState(), nullptr);
    if (auto xml = root.createXml())
        copyXmlToBinary (*xml, dest);
}

void Processor::setStateInformation (const void* data, int size)
{
    auto xml = getXmlFromBinary (data, size);
    if (xml == nullptr || ! xml->hasTagName ("MycelialReverb")) return;
    const auto root = juce::ValueTree::fromXml (*xml);

    const auto params = root.getChildWithName (apvts.state.getType());
    if (params.isValid()) apvts.replaceState (params.createCopy());

    auto colony = std::make_unique<algo::MycelColony>();
    if (colony->load (root.getProperty ("colony").toString().toRawUTF8()))   // damaged text is refused: the dish stays as it is
    {
        const juce::SpinLock::ScopedLockType l (lock);
        *shared = *colony;
        hasPending.store (true);
    }
}

juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter() { return new Processor(); }
