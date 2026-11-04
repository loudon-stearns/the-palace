#!/bin/sh
# build_app.sh <file.pdl> "<App Name>" — PDL to a double-clickable Mac app in build/.
# Also renders build/<App Name>.wav through host_render.cpp and prints its numbers.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"; PDL="$1"; NAME="$2"
[ -n "$PDL" ] && [ -n "$NAME" ] || { echo 'usage: build_app.sh <file.pdl> "<App Name>"'; exit 2; }
B="$HERE/build"; T="$B/.work/$NAME"; mkdir -p "$T"
node "$HERE/emit_native.js" "$PDL" --name "$NAME" --out "$T/patch.h"
cp "$HERE/gad_kit.h" "$HERE/host_common.h" "$T/"
clang++ -std=c++17 -O2 -DPATCH_H='"patch.h"' -I"$T" "$HERE/host_render.cpp" -o "$T/render"
"$T/render" "$B/$NAME.wav"
APP="$B/$NAME.app/Contents"; mkdir -p "$APP/MacOS"
clang++ -std=c++17 -O2 -fobjc-arc -DPATCH_H='"patch.h"' -I"$T" "$HERE/host_app.mm" -framework Cocoa -framework AudioToolbox -framework CoreAudio -o "$APP/MacOS/patch"
cat > "$APP/Info.plist" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleName</key><string>$NAME</string><key>CFBundleExecutable</key><string>patch</string>
<key>CFBundleIdentifier</key><string>palace.gad.$(echo "$NAME" | tr -cd 'A-Za-z0-9')</string>
<key>CFBundlePackageType</key><string>APPL</string><key>NSHighResolutionCapable</key><true/>
</dict></plist>
PL
codesign --force -s - "$B/$NAME.app" 2>/dev/null || true
