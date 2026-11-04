// host_app.mm — a generated patch as a Mac app (native target, 2026-11-04).
// Opens a window, plays from the computer keyboard with Rack's own QWERTY map
// (Z = C4, Q = C5, ` and 1 shift octaves; Rack src/keyboard.cpp), and sounds
// on the MacBook speakers, falling back to the system output if they are not
// found: Loudon's two Standing Orders, carried to a second target.
// Built by build_app.sh; not meant to be compiled by hand.
#import <Cocoa/Cocoa.h>
#include <AudioToolbox/AudioToolbox.h>
#include <CoreAudio/CoreAudio.h>
#include <atomic>
#include <map>
#include <string>
#include "host_common.h"

static Engine gEngine;
static float gDt = 1.f / 48000.f;
struct Msg { int note; bool on; };
static Msg gRing[256]; static std::atomic<unsigned> gHead{0}, gTail{0};   // keys → audio thread
static void post(int n, bool on) { unsigned h = gHead.load(); gRing[h % 256] = {n, on}; gHead.store(h + 1); }

static OSStatus render(void*, AudioUnitRenderActionFlags*, const AudioTimeStamp*, UInt32, UInt32 frames, AudioBufferList* io) {
  for (unsigned t = gTail.load(); t != gHead.load(); t++) { Msg m = gRing[t % 256]; m.on ? gEngine.on(m.note) : gEngine.off(m.note); gTail.store(t + 1); }
  float* L = (float*)io->mBuffers[0].mData; float* R = io->mNumberBuffers > 1 ? (float*)io->mBuffers[1].mData : nullptr;
  for (UInt32 i = 0; i < frames; i++) {
    float l, r; gEngine.tick(gDt, l, r);
    if (!std::isfinite(l)) l = 0; if (!std::isfinite(r)) r = 0;
    L[i] = std::max(-1.f, std::min(1.f, l)); if (R) R[i] = std::max(-1.f, std::min(1.f, r));
  }
  return noErr;
}

static AudioDeviceID macbookSpeakers(std::string& name) {
  AudioObjectPropertyAddress a = {kAudioHardwarePropertyDevices, kAudioObjectPropertyScopeGlobal, kAudioObjectPropertyElementMain};
  UInt32 sz = 0; AudioObjectGetPropertyDataSize(kAudioObjectSystemObject, &a, 0, nullptr, &sz);
  std::vector<AudioDeviceID> ids(sz / sizeof(AudioDeviceID)); AudioObjectGetPropertyData(kAudioObjectSystemObject, &a, 0, nullptr, &sz, ids.data());
  for (AudioDeviceID d : ids) {
    CFStringRef cf = nullptr; UInt32 s = sizeof(cf);
    AudioObjectPropertyAddress n = {kAudioObjectPropertyName, kAudioObjectPropertyScopeGlobal, kAudioObjectPropertyElementMain};
    if (AudioObjectGetPropertyData(d, &n, 0, nullptr, &s, &cf) != noErr || !cf) continue;
    char buf[256]; CFStringGetCString(cf, buf, sizeof buf, kCFStringEncodingUTF8); CFRelease(cf);
    std::string nm(buf);
    AudioObjectPropertyAddress st = {kAudioDevicePropertyStreams, kAudioObjectPropertyScopeOutput, kAudioObjectPropertyElementMain};
    UInt32 ss = 0; AudioObjectGetPropertyDataSize(d, &st, 0, nullptr, &ss);
    if (ss > 0 && nm.find("MacBook") != std::string::npos && nm.find("Speakers") != std::string::npos) { name = nm; return d; }
  }
  return kAudioObjectUnknown;
}

static std::string startAudio() {
  AudioComponentDescription desc = {kAudioUnitType_Output, kAudioUnitSubType_HALOutput, kAudioUnitManufacturer_Apple, 0, 0};
  AudioUnit au; AudioComponentInstanceNew(AudioComponentFindNext(nullptr, &desc), &au);
  std::string name; AudioDeviceID dev = macbookSpeakers(name);
  if (dev == kAudioObjectUnknown) {
    UInt32 s = sizeof(dev); AudioObjectPropertyAddress a = {kAudioHardwarePropertyDefaultOutputDevice, kAudioObjectPropertyScopeGlobal, kAudioObjectPropertyElementMain};
    AudioObjectGetPropertyData(kAudioObjectSystemObject, &a, 0, nullptr, &s, &dev); name = "the system output (no MacBook speakers found)";
  }
  AudioUnitSetProperty(au, kAudioOutputUnitProperty_CurrentDevice, kAudioUnitScope_Global, 0, &dev, sizeof dev);
  AudioStreamBasicDescription f = {}; UInt32 fs = sizeof f;
  AudioUnitGetProperty(au, kAudioUnitProperty_StreamFormat, kAudioUnitScope_Output, 0, &f, &fs);
  double sr = f.mSampleRate > 0 ? f.mSampleRate : 48000; gDt = 1.f / (float)sr;
  AudioStreamBasicDescription want = {sr, kAudioFormatLinearPCM, kAudioFormatFlagIsFloat | kAudioFormatFlagIsPacked | kAudioFormatFlagIsNonInterleaved, 4, 1, 4, 2, 32, 0};
  AudioUnitSetProperty(au, kAudioUnitProperty_StreamFormat, kAudioUnitScope_Input, 0, &want, sizeof want);
  AURenderCallbackStruct cb = {render, nullptr};
  AudioUnitSetProperty(au, kAudioUnitProperty_SetRenderCallback, kAudioUnitScope_Input, 0, &cb, sizeof cb);
  AudioUnitInitialize(au); AudioOutputUnitStart(au);
  return name;
}

// Mac virtual key codes for Rack's QWERTY map (US layout, physical keys).
static const std::map<unsigned short, int> kKeys = {
  {6,0},{1,1},{7,2},{2,3},{8,4},{9,5},{5,6},{11,7},{4,8},{45,9},{38,10},{46,11},{43,12},{37,13},{47,14},{41,15},{44,16},
  {12,12},{19,13},{13,14},{20,15},{14,16},{15,17},{23,18},{17,19},{22,20},{16,21},{26,22},{32,23},{34,24},{25,25},{31,26},{29,27},{35,28},{33,29},{24,30},{30,31}};

@interface KeyView : NSView { int octave; std::map<unsigned short,int> pressed; NSString* device; }
- (instancetype)initWithFrame:(NSRect)r device:(NSString*)d;
@end
@implementation KeyView
- (instancetype)initWithFrame:(NSRect)r device:(NSString*)d { if ((self = [super initWithFrame:r])) { octave = 5; device = d; } return self; }
- (BOOL)acceptsFirstResponder { return YES; }
- (void)keyDown:(NSEvent*)e {
  if (e.isARepeat) return;
  if (e.keyCode == 50) { octave = std::max(0, octave - 1); [self setNeedsDisplay:YES]; return; }
  if (e.keyCode == 18) { octave = std::min(9, octave + 1); [self setNeedsDisplay:YES]; return; }
  auto it = kKeys.find(e.keyCode); if (it == kKeys.end()) return;
  int n = it->second + 12 * octave; if (n > 127) return;
  pressed[e.keyCode] = n; post(n, true);
}
- (void)keyUp:(NSEvent*)e { auto it = pressed.find(e.keyCode); if (it == pressed.end()) return; post(it->second, false); pressed.erase(it); }
- (void)drawRect:(NSRect)r {
  [[NSColor colorWithWhite:0.08 alpha:1] setFill]; NSRectFill(r);
  NSDictionary* big = @{NSFontAttributeName: [NSFont boldSystemFontOfSize:26], NSForegroundColorAttributeName: [NSColor colorWithRed:0.95 green:0.55 blue:0.43 alpha:1]};
  NSDictionary* sm = @{NSFontAttributeName: [NSFont monospacedSystemFontOfSize:13 weight:NSFontWeightRegular], NSForegroundColorAttributeName: [NSColor colorWithWhite:0.85 alpha:1]};
  [@(patch::NAME) drawAtPoint:NSMakePoint(24, 150) withAttributes:big];
  NSString* info = [NSString stringWithFormat:@"%d voice%s · lowest key Z = C%d · ` and 1 shift octaves\nZ S X D C V G B H N J M  — the lower octave\nQ 2 W 3 E R 5 T 6 Y 7 U I — the octave above\nsound: %@",
    patch::VOICES, patch::VOICES == 1 ? "" : "s", octave - 1, device];
  [info drawInRect:NSMakeRect(24, 20, r.size.width - 48, 115) withAttributes:sm];
}
@end

int main(int argc, char** argv) {
  if (argc > 1 && std::string(argv[1]) == "--probe") {   // name the output it would use, play nothing
    std::string n; AudioDeviceID d = macbookSpeakers(n);
    std::printf("{\"name\":\"%s\",\"voices\":%d,\"speakers\":\"%s\"}\n", patch::NAME, patch::VOICES, d == kAudioObjectUnknown ? "none found; would use the system output" : n.c_str());
    return 0;
  }
  @autoreleasepool {
    [NSApplication sharedApplication]; [NSApp setActivationPolicy:NSApplicationActivationPolicyRegular];
    NSString* dev = @(startAudio().c_str());
    NSWindow* w = [[NSWindow alloc] initWithContentRect:NSMakeRect(0, 0, 560, 200) styleMask:NSWindowStyleMaskTitled | NSWindowStyleMaskClosable backing:NSBackingStoreBuffered defer:NO];
    w.title = @(patch::NAME); KeyView* v = [[KeyView alloc] initWithFrame:NSMakeRect(0, 0, 560, 200) device:dev];
    w.contentView = v; [w center]; [w makeKeyAndOrderFront:nil]; [w makeFirstResponder:v];
    [[NSNotificationCenter defaultCenter] addObserverForName:NSWindowWillCloseNotification object:w queue:nil usingBlock:^(NSNotification*) { [NSApp terminate:nil]; }];
    [NSApp activateIgnoringOtherApps:YES]; [NSApp run];
  }
}
