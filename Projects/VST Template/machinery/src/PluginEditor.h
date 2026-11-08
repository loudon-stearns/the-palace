// PluginEditor.h — shared machinery: the plugin's editor, one web page drawn in
// the Loudon Live house dress (machinery/ui/editor.html), laid out from
// Algorithm.h's parameter table. Don't edit per plugin.
#pragma once

#include <juce_gui_extra/juce_gui_extra.h>
#include "PluginProcessor.h"

#include <array>
#include <memory>
#include <vector>

class Editor : public juce::AudioProcessorEditor,
               private juce::Timer
{
public:
    explicit Editor (Processor&);
    ~Editor() override;

    void resized() override;

private:
    std::optional<juce::WebBrowserComponent::Resource> provide (const juce::String& url) const;
    juce::var pluginInfo() const;
    void timerCallback() override;   // the CRT's feed, about 60 times a second

    std::array<float, Processor::kFeedWidth> lastFrame {};
    std::vector<float> feedFrames = std::vector<float> ((size_t) Processor::kFeedFrames * Processor::kFeedWidth);

    Processor& proc;

    // One relay per parameter, by kind, each bound both ways to its parameter.
    std::vector<std::unique_ptr<juce::WebSliderRelay>>       sliders;
    std::vector<std::unique_ptr<juce::WebToggleButtonRelay>> toggles;
    std::vector<std::unique_ptr<juce::WebComboBoxRelay>>     combos;
    std::vector<std::unique_ptr<juce::WebSliderParameterAttachment>>       sliderLinks;
    std::vector<std::unique_ptr<juce::WebToggleButtonParameterAttachment>> toggleLinks;
    std::vector<std::unique_ptr<juce::WebComboBoxParameterAttachment>>     comboLinks;

    std::unique_ptr<juce::WebBrowserComponent> web;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (Editor)
};
