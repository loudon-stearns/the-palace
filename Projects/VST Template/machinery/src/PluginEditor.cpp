// PluginEditor.cpp — shared machinery. Don't edit per plugin.
//
// The page is built before the plugin by tools/ui.py (design tokens, fonts and
// JUCE's JavaScript bridge inlined into one file) and embedded as BinaryData.
// At load it asks for pluginInfo — the parameter table, name, version and the
// plugin.json ui block — and draws its controls from that. Every parameter is
// bound through a JUCE relay and attachment, so the page, the host's
// automation and the saved state stay one value.
#include "PluginEditor.h"
#include "EditorData.h"     // build/ui/index.html, embedded (tools/ui.py writes it)
#include "EditorConfig.h"   // build/ui: sizes and the plugin.json ui block (tools/ui.py writes it)

namespace
{
    const char* taperName (tpl::Taper t)
    {
        switch (t)
        {
            case tpl::Taper::Linear: return "linear";
            case tpl::Taper::Log:    return "log";
            case tpl::Taper::Choice: return "choice";
            case tpl::Taper::Toggle: return "toggle";
        }
        return "linear";
    }
}

Editor::Editor (Processor& p)
    : juce::AudioProcessorEditor (p), proc (p)
{
    using Options = juce::WebBrowserComponent::Options;

    auto options = Options{}
        .withNativeIntegrationEnabled()
        .withKeepPageLoadedWhenBrowserIsHidden()
        .withResourceProvider ([this] (const juce::String& url) { return provide (url); })
        .withNativeFunction ("pluginInfo",
            [this] (const juce::Array<juce::var>&, juce::WebBrowserComponent::NativeFunctionCompletion done)
            { done (pluginInfo()); });

    for (const auto& s : algo::kParams)
    {
        switch (s.taper)
        {
            case tpl::Taper::Toggle:
                toggles.push_back (std::make_unique<juce::WebToggleButtonRelay> (s.id));
                options = options.withOptionsFrom (*toggles.back());
                break;
            case tpl::Taper::Choice:
                combos.push_back (std::make_unique<juce::WebComboBoxRelay> (s.id));
                options = options.withOptionsFrom (*combos.back());
                break;
            case tpl::Taper::Linear:
            case tpl::Taper::Log:
                sliders.push_back (std::make_unique<juce::WebSliderRelay> (s.id));
                options = options.withOptionsFrom (*sliders.back());
                break;
        }
    }

    web = std::make_unique<juce::WebBrowserComponent> (options);
    addAndMakeVisible (*web);

    size_t si = 0, ti = 0, ci = 0;
    for (const auto& s : algo::kParams)
    {
        auto* param = proc.apvts.getParameter (s.id);
        if (param == nullptr) continue;
        switch (s.taper)
        {
            case tpl::Taper::Toggle:
                toggleLinks.push_back (std::make_unique<juce::WebToggleButtonParameterAttachment> (*param, *toggles[ti++]));
                break;
            case tpl::Taper::Choice:
                comboLinks.push_back (std::make_unique<juce::WebComboBoxParameterAttachment> (*param, *combos[ci++]));
                break;
            case tpl::Taper::Linear:
            case tpl::Taper::Log:
                sliderLinks.push_back (std::make_unique<juce::WebSliderParameterAttachment> (*param, *sliders[si++]));
                break;
        }
    }

    web->goToURL (juce::WebBrowserComponent::getResourceProviderRoot());

    setResizable (true, true);
    setResizeLimits (PLUGIN_UI_MIN_W, PLUGIN_UI_MIN_H, PLUGIN_UI_MAX_W, PLUGIN_UI_MAX_H);
    setSize (PLUGIN_UI_W, PLUGIN_UI_H);
}

Editor::~Editor()
{
    // Unbind before the page and the relays go.
    sliderLinks.clear(); toggleLinks.clear(); comboLinks.clear();
    web.reset();
    sliders.clear(); toggles.clear(); combos.clear();
}

void Editor::resized()
{
    if (web != nullptr)
        web->setBounds (getLocalBounds());
}

std::optional<juce::WebBrowserComponent::Resource> Editor::provide (const juce::String& url) const
{
    if (url == "/" || url == "/index.html")
    {
        const auto* bytes = reinterpret_cast<const std::byte*> (EditorData::index_html);
        return juce::WebBrowserComponent::Resource {
            std::vector<std::byte> (bytes, bytes + EditorData::index_htmlSize), "text/html" };
    }
    return std::nullopt;
}

juce::var Editor::pluginInfo() const
{
    juce::Array<juce::var> params;
    for (const auto& s : algo::kParams)
    {
        auto* o = new juce::DynamicObject();
        o->setProperty ("id", s.id);
        o->setProperty ("name", s.name);
        o->setProperty ("unit", s.unit);
        o->setProperty ("min", s.min);
        o->setProperty ("max", s.max);
        o->setProperty ("default", s.def);
        o->setProperty ("taper", taperName (s.taper));
        o->setProperty ("choices", juce::String (s.choices));
        o->setProperty ("automatable", s.automatable);
        o->setProperty ("group", s.group);
        o->setProperty ("hero", s.hero);
        params.add (juce::var (o));
    }
    auto* info = new juce::DynamicObject();
    info->setProperty ("name", PLUGIN_NAME);
    info->setProperty ("version", PLUGIN_VERSION);
    info->setProperty ("company", PLUGIN_COMPANY);
    info->setProperty ("params", params);
    info->setProperty ("ui", juce::JSON::parse (juce::String (kPluginUiJson)));
    return juce::var (info);
}
