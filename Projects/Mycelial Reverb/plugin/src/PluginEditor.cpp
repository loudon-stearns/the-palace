// PluginEditor.cpp — see PluginEditor.h.
#include "PluginEditor.h"
#include "EditorData.h"     // ui/index.html, embedded

#include <cstdio>

Editor::Editor (Processor& p)
    : juce::AudioProcessorEditor (p), proc (p)
{
    using Options = juce::WebBrowserComponent::Options;
    auto options = Options{}
        .withNativeIntegrationEnabled()
        .withKeepPageLoadedWhenBrowserIsHidden()
        .withResourceProvider ([this] (const juce::String& url) { return provide (url); })
        .withEventListener ("dish", [this] (const juce::var& v) { fromPage (v); });

    web = std::make_unique<juce::WebBrowserComponent> (options);
    addAndMakeVisible (*web);
    web->goToURL (juce::WebBrowserComponent::getResourceProviderRoot());

    setResizable (true, true);
    setResizeLimits (PLUGIN_UI_MIN_W, PLUGIN_UI_MIN_H, PLUGIN_UI_MAX_W, PLUGIN_UI_MAX_H);
    setSize (PLUGIN_UI_W, PLUGIN_UI_H);
    json.reserve (32000);
    startTimerHz (30);
}

Editor::~Editor()
{
    stopTimer();
    web.reset();
}

void Editor::resized()
{
    if (web != nullptr) web->setBounds (getLocalBounds());
}

std::optional<juce::WebBrowserComponent::Resource> Editor::provide (const juce::String& url)
{
    if (url != "/" && url != "/index.html") return std::nullopt;
    const auto* bytes = reinterpret_cast<const std::byte*> (EditorData::index_html);
    return juce::WebBrowserComponent::Resource { std::vector<std::byte> (bytes, bytes + EditorData::index_htmlSize), "text/html" };
}

// The page's hands. A knob comes as begin / set / end, so the host records one move.
void Editor::fromPage (const juce::var& v)
{
    const auto t = v["t"].toString();
    if (t == "knock")      proc.knock (v.hasProperty ("n") ? (int) v["n"] : -1);
    else if (t == "frost") proc.frost();
    else if (t == "spore") proc.newSpore();
    else if (auto* param = proc.apvts.getParameter (v["id"].toString()))
    {
        if (t == "begin")    param->beginChangeGesture();
        else if (t == "end") param->endChangeGesture();
        else if (t == "set") param->setValueNotifyingHost (param->convertTo0to1 ((float) (double) v["v"]));
    }
}

// One frame: the colony as numbers, and where every knob stands (so automation moves the page).
void Editor::timerCallback()
{
    if (web == nullptr) return;
    proc.view (*colony);
    const auto& c = *colony;
    char b[160];
    json.clear();
    std::snprintf (b, sizeof b, "{\"time\":%.3f,\"in\":%d,\"seed\":%u,\"ev\":%u,\"sr\":%.0f,\"max\":%d,\"name\":\"%s\",\"version\":\"%s\",\"tier\":\"%s\",\"par\":{",
                   c.time, c.inNode, (unsigned) c.seed, (unsigned) c.eventCount, c.sr, c.maxSegs, PLUGIN_NAME, PLUGIN_VERSION, PLUGIN_TIER);
    json += b;
    for (int i = 0; i < algo::kNumParams; ++i)
    {
        std::snprintf (b, sizeof b, "%s\"%s\":%.5g", i ? "," : "", algo::kParams[i].id, (double) proc.apvts.getRawParameterValue (algo::kParams[i].id)->load());
        json += b;
    }
    std::snprintf (b, sizeof b, ",\"guard\":%.2f", (double) proc.guardDb());
    json += b;
    json += "},\"nodes\":[";
    for (int i = 0; i < c.nNodes; ++i)
    {
        const auto& n = c.nodes[(size_t) i];
        if (! n.used) { json += i ? ",0" : "0"; continue; }
        std::snprintf (b, sizeof b, "%s[%.1f,%.1f,%d,%d]", i ? "," : "", n.x, n.y, (int) n.nsegs, (n.tip && ! n.dormant) ? 1 : 0);
        json += b;
    }
    json += "],\"segs\":[";
    for (int i = 0; i < c.nSegs; ++i)
    {
        const auto& s = c.segs[(size_t) i];
        if (! s.used) { json += i ? ",0" : "0"; continue; }
        std::snprintf (b, sizeof b, "%s[%d,%d,%.3f,%.3g,%.3f,%.1f]", i ? "," : "", (int) s.a, (int) s.b, s.y, s.e, s.born, s.px);
        json += b;
    }
    json += "],\"fruit\":[";
    for (int i = 0; i < c.nFruit; ++i)
    {
        std::snprintf (b, sizeof b, "%s[%d,%.3f]", i ? "," : "", (int) c.fruit[(size_t) i].n, c.fruit[(size_t) i].born);
        json += b;
    }
    json += "],\"events\":[";
    const auto count = juce::jmin ((juce::uint32) algo::MycelColony::kEvents, (juce::uint32) c.eventCount);
    for (juce::uint32 i = 0; i < count; ++i)
    {
        const auto idx = c.eventCount - count + i;
        const auto& e = c.events[idx % algo::MycelColony::kEvents];
        std::snprintf (b, sizeof b, "%s[%u,%d,%d]", i ? "," : "", (unsigned) idx, (int) e.k, (int) e.n);
        json += b;
    }
    json += "]}";
    web->emitEventIfBrowserIsVisible ("frame", juce::String (json));
}
