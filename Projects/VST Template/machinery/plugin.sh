#!/bin/sh
# machinery/plugin.sh <plugin dir> <step> — build, check, install and validate one plugin.
# Each plugin's own ./plugin.sh calls this with its folder.
#
#   build       constants from the sketch, then cmake (plugin, harness, host check)
#   verify      the plugin against its numpy sketch (tools/verify.py; extra args pass through)
#   install     copy the VST3 and AU into ~/Library/Audio/Plug-Ins
#   validate    the installed bundles' code signatures checked strictly (what Live's scanner
#               needs), then pluginval on the VST3 (STRICTNESS, default 5) and auval on the AU
#   hostcheck   load the installed VST3 and AU as a DAW would, move the plugin.json parameters
#   all         all five, in that order, stopping at the first failure
#
# JUCE 8.0.12 is cloned once into $JUCE_DIR and shared by every plugin.
set -e
MACH="$(cd "$(dirname "$0")" && pwd)"
HERE="$(cd "$1" && pwd)"; shift
BUILD="$HERE/build"
JUCE_DIR="${JUCE_DIR:-$HOME/Library/Caches/palace-vst-template/JUCE-8.0.12}"
PLUGINVAL="${PLUGINVAL:-/Applications/pluginval.app/Contents/MacOS/pluginval}"

field() { python3 -c 'import json,sys; v=json.load(open(sys.argv[1]))[sys.argv[2]]; print(" ".join(v) if isinstance(v, list) else v)' "$HERE/plugin.json" "$1"; }
NAME="$(field name)"; TARGET="$(field target)"; KIND="$(field kind)"
PCODE="$(field plugin_code)"; MCODE="$(field manufacturer_code)"
VST3_DIR="$HOME/Library/Audio/Plug-Ins/VST3"; AU_DIR="$HOME/Library/Audio/Plug-Ins/Components"
built() { find "$BUILD/${TARGET}_artefacts" -maxdepth 3 -name "$1" | head -1; }

# JUCE signs a bundle ad hoc, but can write the VST3's Contents/Resources/moduleinfo.json
# after it signs, and Live's scanner then refuses the plugin ("a sealed resource is missing
# or invalid"). So every bundle is re-sealed, ad hoc as JUCE does it (no Developer ID on
# this Mac), once the build is finished, and checked strictly before it is installed.
seal() { codesign --force --sign - "$1" >/dev/null 2>&1 || { echo "could not sign $1"; exit 1; }; }
sealed() { codesign --verify --deep --strict "$1" || { echo "signature broken: $1"; exit 1; }; }

build() {
    if [ ! -f "$JUCE_DIR/CMakeLists.txt" ]; then
        mkdir -p "$(dirname "$JUCE_DIR")"
        git clone --depth 1 --branch 8.0.12 https://github.com/juce-framework/JUCE.git "$JUCE_DIR"
    fi
    python3 "$MACH/tools/constants.py" "$HERE"
    python3 "$MACH/tools/ui.py" build "$HERE" "$BUILD"
    cmake -S "$HERE" -B "$BUILD" -DCMAKE_BUILD_TYPE=Release -DFETCHCONTENT_SOURCE_DIR_JUCE="$JUCE_DIR" > "$BUILD.configure.log" 2>&1 \
        || { cat "$BUILD.configure.log"; exit 1; }
    cmake --build "$BUILD" --config Release -j "$(sysctl -n hw.logicalcpu)"
    for b in "$(built "$NAME.vst3")" "$(built "$NAME.component")"; do seal "$b"; sealed "$b"; echo "built: $b"; done
}

verify() { python3 "$MACH/tools/verify.py" "$HERE" "$@"; }

install() {
    mkdir -p "$VST3_DIR" "$AU_DIR"
    rm -rf "${VST3_DIR:?}/$NAME.vst3" "${AU_DIR:?}/$NAME.component"
    cp -R "$(built "$NAME.vst3")" "$VST3_DIR/"
    cp -R "$(built "$NAME.component")" "$AU_DIR/"
    sealed "$VST3_DIR/$NAME.vst3"
    sealed "$AU_DIR/$NAME.component"
    killall -9 AudioComponentRegistrar 2>/dev/null || true   # so the AU is seen without a logout
    echo "installed: $VST3_DIR/$NAME.vst3"
    echo "installed: $AU_DIR/$NAME.component"
}

validate() {
    # pluginval and auval load a bundle whose seal is broken; Live's scanner does not. Check first.
    for b in "$VST3_DIR/$NAME.vst3" "$AU_DIR/$NAME.component"; do sealed "$b"; echo "signature verified (strict): $b"; done
    "$PLUGINVAL" --strictness-level "${STRICTNESS:-5}" --validate "$VST3_DIR/$NAME.vst3"
    if [ "$KIND" = "instrument" ]; then AUTYPE=aumu; else AUTYPE=aufx; fi
    auval -v "$AUTYPE" "$PCODE" "$MCODE"
}

hostcheck() {
    HC="$(find "$BUILD/${TARGET}HostCheck_artefacts" -name "${TARGET}HostCheck" -type f | head -1)"
    # shellcheck disable=SC2046
    "$HC" "$VST3_DIR/$NAME.vst3" $(field hostcheck)
    # shellcheck disable=SC2046
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
