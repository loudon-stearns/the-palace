// PluginProcessor.h — template machinery: wraps algo::Algorithm as a JUCE plugin.
// Don't edit per plugin. Everything plugin-specific lives in Algorithm.h and
// plugin.json.
#pragma once

#include <juce_audio_processors/juce_audio_processors.h>
#include "Algorithm.h"

#include <array>
#include <atomic>

namespace tpl
{
    // An algorithm that plays notes gives itself noteOn (note, velocity 0..1) and
    // noteOff (note); the wrapper then delivers MIDI to it on the exact sample.
    template <typename A>
    concept HasNotes = requires (A a) { a.noteOn (60, 1.0); a.noteOff (60); };

    // A template, so an algorithm without notes never compiles the calls.
    template <typename A>
    void deliverNote (A& alg, bool on, int note, double velocity)
    {
        if constexpr (HasNotes<A>)
        {
            if (on) alg.noteOn (note, velocity);
            else    alg.noteOff (note);
        }
    }
}

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

    juce::AudioProcessorEditor* createEditor() override;   // the house editor; the harness builds the generic one
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

    // The CRT's feed: while an editor is open, processBlock writes a frame about every
    // 1/kFeedHz s, each the probes in kProbes order and then the output's peak since the
    // last frame, into a lock-free single-reader queue the editor drains on its timer.
    static constexpr int kFeedHz = 480;
    static constexpr int kFeedWidth = algo::kNumProbes + 1;
    static constexpr int kFeedFrames = 512;
    std::atomic<bool> feedOn { false };
    int readFeed (float* dest, int maxFrames);   // message thread only; returns frames read
    double feedRate() const { return feedRateHz; }

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

    juce::AbstractFifo feed { kFeedFrames };
    std::array<float, (size_t) kFeedFrames * kFeedWidth> feedRing {};
    int feedEvery = 100, feedCount = 0;
    float feedPeak = 0.0f;
    double feedRateHz = kFeedHz;

    void snapSmoothers();
    void handleMidi (const juce::MidiMessage&);

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (Processor)
};
