#!/bin/sh
# plugin.sh — template machinery: build, check, install and validate this plugin.
#
#   ./plugin.sh build       constants from the sketch, then cmake (plugin, harness, host check)
#   ./plugin.sh verify      the plugin against its numpy sketch (tools/verify.py; extra args pass through)
#   ./plugin.sh install     copy the VST3 and AU into ~/Library/Audio/Plug-Ins
#   ./plugin.sh validate    pluginval on the installed VST3 (STRICTNESS, default 5), auval on the AU
#   ./plugin.sh hostcheck   load the installed VST3 and AU as a DAW would, move the plugin.json parameters
#   ./plugin.sh all         all five, in that order, stopping at the first failure
#
# JUCE 8.0.12 is cloned once into $JUCE_DIR and shared by every plugin.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
BUILD="$HERE/build"
JUCE_DIR="${JUCE_DIR:-$HOME/Library/Caches/palace-vst-template/JUCE-8.0.12}"
PLUGINVAL="${PLUGINVAL:-/Applications/pluginval.app/Contents/MacOS/pluginval}"

field() { python3 -c 'import json,sys; v=json.load(open(sys.argv[1]))[sys.argv[2]]; print(" ".join(v) if isinstance(v, list) else v)' "$HERE/plugin.json" "$1"; }
NAME="$(field name)"; TARGET="$(field target)"; KIND="$(field kind)"
PCODE="$(field plugin_code)"; MCODE="$(field manufacturer_code)"
VST3_DIR="$HOME/Library/Audio/Plug-Ins/VST3"; AU_DIR="$HOME/Library/Audio/Plug-Ins/Components"
built() { find "$BUILD/${TARGET}_artefacts" -name "$1" -maxdepth 3 | head -1; }

build() {
    if [ ! -f "$JUCE_DIR/CMakeLists.txt" ]; then
        mkdir -p "$(dirname "$JUCE_DIR")"
        git clone --depth 1 --branch 8.0.12 https://github.com/juce-framework/JUCE.git "$JUCE_DIR"
    fi
    python3 "$HERE/tools/constants.py" "$HERE"
    cmake -S "$HERE" -B "$BUILD" -DCMAKE_BUILD_TYPE=Release -DFETCHCONTENT_SOURCE_DIR_JUCE="$JUCE_DIR" > "$BUILD.configure.log" 2>&1 \
        || { cat "$BUILD.configure.log"; exit 1; }
    cmake --build "$BUILD" --config Release -j "$(sysctl -n hw.logicalcpu)"
    echo "built: $(built "$NAME.vst3")"
    echo "built: $(built "$NAME.component")"
}

verify() { python3 "$HERE/tools/verify.py" "$HERE" "$@"; }

install() {
    mkdir -p "$VST3_DIR" "$AU_DIR"
    rm -rf "$VST3_DIR/$NAME.vst3" "$AU_DIR/$NAME.component"
    cp -R "$(built "$NAME.vst3")" "$VST3_DIR/"
    cp -R "$(built "$NAME.component")" "$AU_DIR/"
    killall -9 AudioComponentRegistrar 2>/dev/null || true   # so the AU is seen without a logout
    echo "installed: $VST3_DIR/$NAME.vst3"
    echo "installed: $AU_DIR/$NAME.component"
}

validate() {
    "$PLUGINVAL" --strictness-level "${STRICTNESS:-5}" --validate "$VST3_DIR/$NAME.vst3"
    if [ "$KIND" = "instrument" ]; then AUTYPE=aumu; else AUTYPE=aufx; fi
    auval -v "$AUTYPE" "$PCODE" "$MCODE"
}

hostcheck() {
    HC="$(find "$BUILD/${TARGET}HostCheck_artefacts" -name "${TARGET}HostCheck" -type f | head -1)"
    # shellcheck disable=SC2046
    "$HC" "$VST3_DIR/$NAME.vst3" $(field hostcheck)
    "$HC" "$AU_DIR/$NAME.component" $(field hostcheck)
}

case "${1:-}" in
    build) build ;;
    verify) shift; verify "$@" ;;
    install) install ;;
    validate) validate ;;
    hostcheck) hostcheck ;;
    all) build; verify; install; validate; hostcheck ;;
    *) sed -n '2,12p' "$0"; exit 2 ;;
esac
