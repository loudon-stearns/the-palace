// PluginProcessor.cpp — template machinery. Don't edit per plugin.
//
// The parameter table in Algorithm.h becomes host parameters here; each sample
// the smoothed values go to Algorithm::step(). Nothing in processBlock
// allocates or locks.
#include "PluginProcessor.h"

#include <cmath>
#include <cstdio>

namespace
{
    using tpl::Taper;

    juce::String formatValue (double v, const tpl::ParamSpec& s)
    {
        char buf[64];
        std::snprintf (buf, sizeof buf, s.taper == Taper::Log ? "%.4g" : "%.2f", v);
        return juce::String (buf);
    }

    juce::NormalisableRange<float> rangeFor (const tpl::ParamSpec& s)
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

// Stereo out always; a mono algorithm is copied to both channels.
juce::AudioProcessor::BusesProperties Processor::buses()
{
    BusesProperties b;
    if constexpr (algo::kInputs > 0)
        b = b.withInput ("Input", juce::AudioChannelSet::stereo(), true);
    return b.withOutput ("Output", juce::AudioChannelSet::stereo(), true);
}

Processor::Processor()
    : juce::AudioProcessor (buses()),
      apvts (*this, nullptr, "PARAMS", createLayout())
{
    for (int i = 0; i < algo::kNumParams; ++i)
        raw[(size_t) i] = apvts.getRawParameterValue (algo::kParams[i].id);
}

juce::AudioProcessorValueTreeState::ParameterLayout Processor::createLayout()
{
    juce::AudioProcessorValueTreeState::ParameterLayout layout;

    for (const auto& s : algo::kParams)
    {
        const juce::ParameterID pid { s.id, 1 };

        switch (s.taper)
        {
            case Taper::Choice:
                layout.add (std::make_unique<juce::AudioParameterChoice> (
                    pid, s.name, juce::StringArray::fromTokens (s.choices, "|", ""), (int) s.def,
                    juce::AudioParameterChoiceAttributes().withAutomatable (s.automatable)));
                break;

            case Taper::Toggle:
                layout.add (std::make_unique<juce::AudioParameterBool> (
                    pid, s.name, s.def > 0.5,
                    juce::AudioParameterBoolAttributes().withAutomatable (s.automatable)));
                break;

            case Taper::Linear:
            case Taper::Log:
            {
                const auto spec = s;
                auto attrs = juce::AudioParameterFloatAttributes()
                                 .withLabel (s.unit)
                                 .withAutomatable (s.automatable)
                                 .withStringFromValueFunction ([spec] (float v, int) { return formatValue (v, spec); })
                                 .withValueFromStringFunction ([] (const juce::String& t) { return (float) t.getDoubleValue(); });
                layout.add (std::make_unique<juce::AudioParameterFloat> (pid, s.name, rangeFor (s), (float) s.def, attrs));
                break;
            }
        }
    }
    return layout;
}

bool Processor::isBusesLayoutSupported (const BusesLayout& layout) const
{
    const auto out = layout.getMainOutputChannelSet();
    if (out != juce::AudioChannelSet::mono() && out != juce::AudioChannelSet::stereo())
        return false;
    if constexpr (algo::kInputs > 0)
    {
        const auto in = layout.getMainInputChannelSet();
        if (in != juce::AudioChannelSet::mono() && in != juce::AudioChannelSet::stereo())
            return false;
    }
    return true;
}

void Processor::prepareToPlay (double sampleRate, int)
{
    alg.prepare (sampleRate);

    for (int i = 0; i < algo::kNumParams; ++i)
    {
        const auto& s = algo::kParams[i];
        auto& m = smooth[(size_t) i];
        m.inLog = (s.taper == Taper::Log);
        const bool smoothed = (s.taper == Taper::Linear || s.taper == Taper::Log) && s.smoothMs > 0.0;
        m.coef = smoothed ? std::exp (-1.0 / (s.smoothMs * 0.001 * sampleRate)) : 0.0;
    }
    needsReset = true;
}

void Processor::snapSmoothers()
{
    for (int i = 0; i < algo::kNumParams; ++i)
    {
        const double target = raw[(size_t) i]->load (std::memory_order_relaxed);
        auto& m = smooth[(size_t) i];
        m.current = m.inLog ? std::log (target) : target;
        values[(size_t) i] = target;
    }
}

void Processor::processBlock (juce::AudioBuffer<float>& buffer, juce::MidiBuffer&)
{
    juce::ScopedNoDenormals noDenormals;

    if (needsReset.exchange (false))
    {
        snapSmoothers();
        alg.reset (values.data());
    }

    // Targets are read once per block; the smoothing runs per sample.
    std::array<double, algo::kNumParams> target {};
    for (int i = 0; i < algo::kNumParams; ++i)
    {
        const double t = raw[(size_t) i]->load (std::memory_order_relaxed);
        target[(size_t) i] = smooth[(size_t) i].inLog ? std::log (t) : t;
    }

    const int numSamples  = buffer.getNumSamples();
    const int numChannels = buffer.getNumChannels();
    float in[algo::kInputs > 0 ? algo::kInputs : 1] {};
    float out[algo::kOutputs] {};

    for (int n = 0; n < numSamples; ++n)
    {
        for (int i = 0; i < algo::kNumParams; ++i)
        {
            auto& m = smooth[(size_t) i];
            const double t = target[(size_t) i];
            m.current = t + m.coef * (m.current - t);
            values[(size_t) i] = m.inLog ? std::exp (m.current) : m.current;
        }

        for (int c = 0; c < algo::kInputs; ++c)
            in[c] = numChannels > 0 ? buffer.getSample (juce::jmin (c, numChannels - 1), n) : 0.0f;

        alg.step (values.data(), in, out);

        for (int ch = 0; ch < numChannels; ++ch)
            buffer.setSample (ch, n, out[juce::jmin (ch, algo::kOutputs - 1)]);

        if (probeSink != nullptr && probeSink->pos < probeSink->steps)
        {
            for (int j = 0; j < algo::kNumProbes; ++j)
                probeSink->data[(size_t) j * (size_t) probeSink->steps + (size_t) probeSink->pos] = alg.probes[j];
            ++probeSink->pos;
        }
    }
}

void Processor::getStateInformation (juce::MemoryBlock& dest)
{
    if (auto xml = apvts.copyState().createXml())
        copyXmlToBinary (*xml, dest);
}

void Processor::setStateInformation (const void* data, int size)
{
    if (auto xml = getXmlFromBinary (data, size))
        if (xml->hasTagName (apvts.state.getType()))
            apvts.replaceState (juce::ValueTree::fromXml (*xml));
}

juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter()
{
    return new Processor();
}
