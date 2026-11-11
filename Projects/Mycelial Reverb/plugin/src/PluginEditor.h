// PluginEditor.h — the editor is one web page (ui/index.html) in a WebView, and the page is the dish.
//
// It holds no colony of its own. Thirty times a second it asks the processor for the colony
// as last published and sends it to the page as one "frame" event; the page draws it. The
// page's hands come back as "dish" events: a knock, a frost, a new spore, a knob moved.
#pragma once

#include <juce_gui_extra/juce_gui_extra.h>
#include "PluginProcessor.h"

class Editor : public juce::AudioProcessorEditor, private juce::Timer
{
public:
    explicit Editor (Processor&);
    ~Editor() override;
    void resized() override;

private:
    void timerCallback() override;
    void fromPage (const juce::var&);
    std::optional<juce::WebBrowserComponent::Resource> provide (const juce::String& url);

    Processor& proc;
    std::unique_ptr<algo::MycelColony> colony = std::make_unique<algo::MycelColony>();
    std::string json;
    std::unique_ptr<juce::WebBrowserComponent> web;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (Editor)
};
