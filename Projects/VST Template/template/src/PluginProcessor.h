// PluginProcessor.h — template machinery: wraps algo::Algorithm as a JUCE plugin.
// Don't edit per plugin. Everything plugin-specific lives in Algorithm.h and
// plugin.json.
#pragma once

#include <juce_audio_processors/juce_audio_processors.h>
#include "Algorithm.h"

#include <array>
#include <atomic>

class Processor : public juce::AudioProcessor
{
public:
    Processor();

    void prepareToPlay (double sampleRate, int maxBlock) override;
    void releaseResources() override {}
    void reset() override { needsReset = true; }
    bool isBusesLayoutSupported (const BusesLayout&) const override;
    void processBlock (juce::AudioBuffer<float>&, juce::MidiBuffer&) override;
    using juce::AudioProcessor::processBlock;

    juce::AudioProcessorEditor* createEditor() override { return new juce::GenericAudioProcessorEditor (*this); }
    bool hasEditor() const override { return true; }

    const juce::String getName() const override { return PLUGIN_NAME; }
    bool acceptsMidi() const override { return algo::kInputs == 0; }
    bool producesMidi() const override { return false; }
    double getTailLengthSeconds() const override { return 0.0; }

    int getNumPrograms() override { return 1; }
    int getCurrentProgram() override { return 0; }
    void setCurrentProgram (int) override {}
    const juce::String getProgramName (int) override { return {}; }
    void changeProgramName (int, const juce::String&) override {}

    void getStateInformation (juce::MemoryBlock&) override;
    void setStateInformation (const void*, int) override;

    juce::AudioProcessorValueTreeState apvts;

    // Harness only: when set, processBlock writes every probe of every sample
    // here, probe-major (probe j, sample i at data[j * steps + i]).
    struct ProbeSink { double* data = nullptr; long steps = 0; long pos = 0; };
    ProbeSink* probeSink = nullptr;

private:
    static BusesProperties buses();
    static juce::AudioProcessorValueTreeState::ParameterLayout createLayout();

    struct Smoother
    {
        double current = 0.0, coef = 0.0;
        bool   inLog = false;
    };

    algo::Algorithm alg;
    std::array<std::atomic<float>*, algo::kNumParams> raw {};
    std::array<Smoother, algo::kNumParams> smooth {};
    std::array<double, algo::kNumParams> values {};
    std::atomic<bool> needsReset { true };

    void snapSmoothers();

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (Processor)
};
