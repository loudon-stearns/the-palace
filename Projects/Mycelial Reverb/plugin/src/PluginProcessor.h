// PluginProcessor.h — the Mycelial Reverb as a JUCE plugin.
//
// The dish lives here, not in the editor: algo::Dish (Algorithm.h) holds the network and
// the colony, and processBlock feeds the colony every 512 samples, so it grows with the
// window closed. The whole colony travels in the host's saved state.
//
// Three threads touch the colony. The audio thread owns it. After every feed it copies
// it into `shared` if it can take the lock without waiting; the editor and the host's
// save read that copy. A loaded state goes the other way: into `shared`, flagged, and the
// audio thread takes it at the top of its next block.
#pragma once

#include <juce_audio_processors/juce_audio_processors.h>
#include "Algorithm.h"

#include <array>
#include <atomic>
#include <memory>
#include <vector>

class Processor : public juce::AudioProcessor
{
public:
    Processor();

    void prepareToPlay (double sampleRate, int maxBlock) override;
    void releaseResources() override {}
    bool isBusesLayoutSupported (const BusesLayout&) const override;
    void processBlock (juce::AudioBuffer<float>&, juce::MidiBuffer&) override;
    using juce::AudioProcessor::processBlock;

    juce::AudioProcessorEditor* createEditor() override;
    bool hasEditor() const override { return true; }

    const juce::String getName() const override { return PLUGIN_NAME; }
    bool acceptsMidi() const override { return false; }
    bool producesMidi() const override { return false; }
    double getTailLengthSeconds() const override { return (double) raw[algo::pCarry]->load(); }

    int getNumPrograms() override { return 1; }
    int getCurrentProgram() override { return 0; }
    void setCurrentProgram (int) override {}
    const juce::String getProgramName (int) override { return {}; }
    void changeProgramName (int, const juce::String&) override {}

    void getStateInformation (juce::MemoryBlock&) override;
    void setStateInformation (const void*, int) override;

    juce::AudioProcessorValueTreeState apvts;

    // The editor's hands (message thread). Each is picked up at the top of the next audio block.
    void knock (int node);          // node < 0: knock where the sound already goes in
    void frost()    { frostReq.fetch_add (1); }
    void newSpore();
    void view (algo::MycelColony& into);   // the colony as last published
    float guardDb() const { return guardShown.load(); }   // how hard the guard is holding the dish back, in dB (0 or below)

private:
    static juce::AudioProcessorValueTreeState::ParameterLayout createLayout();

    std::unique_ptr<algo::Dish> dish = std::make_unique<algo::Dish>();
    std::array<std::atomic<float>*, algo::kNumParams> raw {};

    juce::SpinLock lock;
    std::unique_ptr<algo::MycelColony> shared = std::make_unique<algo::MycelColony>();     // guarded by lock
    std::unique_ptr<algo::MycelColony> incoming = std::make_unique<algo::MycelColony>();   // audio thread's scratch
    std::atomic<bool> hasPending { false };   // shared holds a loaded state the audio thread has not taken yet

    std::atomic<int> knockReq { 0 }, knockNode { -1 }, frostReq { 0 };
    std::atomic<juce::uint32> sporeReq { 0 };

    double sr = 48000.0, lastCarry = -1.0, lastWetness = -1.0, dryNow = 0.0, wetNow = 0.0, smooth = 0.0;
    juce::uint32 lastFeeds = 0;
    // The guard: the page puts a compressor after everything (−10 dB, 12:1, 3 ms, 200 ms). Here the same
    // figures hold back the dish alone, so the dry sound passes untouched. A young dish is a few short
    // loops, a comb, and a note that lands on it rings many times louder than it went in.
    double guardEnv = 0.0, guardAtk = 0.0, guardRel = 0.0;
    std::atomic<float> guardShown { 0.0f };
    std::vector<float> mono, extra, wetL, wetR, knockBuf;
    std::array<int, 4> knockPos { -1, -1, -1, -1 };
    juce::Random random;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (Processor)
};
