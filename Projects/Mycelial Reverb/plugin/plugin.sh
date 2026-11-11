#!/bin/sh
# ./plugin.sh gate | build | pluginval | install | validate | hostcheck | editor | uninstall
#
# The template's steps, kept in its order and its words where they fit (VST Template/machinery/plugin.sh).
# This plugin has its own build file (see CMakeLists.txt for why), so it has its own copy of the steps.
#
#   gate        the C++ engine against the JavaScript engine in the piece (check/gate.mjs; --quick passes through)
#   build       cmake: VST3, AU, Standalone and the template's host check; then every bundle re-sealed
#   pluginval   pluginval on the built VST3, before anything is installed (STRICTNESS, default 5)
#   install     copy the VST3 and AU into ~/Library/Audio/Plug-Ins (this is what makes Live see it)
#   validate    the installed bundles' signatures checked strictly, pluginval on the VST3, auval on the AU
#   hostcheck   load the installed VST3 and AU as a DAW would, move the plugin.json parameters
#   editor      open the installed VST3's editor as a DAW would and photograph it into out/editor-WxH.png
#   uninstall   remove the two installed bundles
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
BUILD="$HERE/build"
JUCE_DIR="${JUCE_DIR:-$HOME/Library/Caches/palace-vst-template/JUCE-8.0.12}"
PLUGINVAL="${PLUGINVAL:-/Applications/pluginval.app/Contents/MacOS/pluginval}"
field() { python3 -c 'import json,sys; v=json.load(open(sys.argv[1]))[sys.argv[2]]; print(" ".join(v) if isinstance(v, list) else v)' "$HERE/plugin.json" "$1"; }
NAME="$(field name)"; TARGET="$(field target)"; PCODE="$(field plugin_code)"; MCODE="$(field manufacturer_code)"
VST3_DIR="$HOME/Library/Audio/Plug-Ins/VST3"; AU_DIR="$HOME/Library/Audio/Plug-Ins/Components"
built() { find "$BUILD/${TARGET}_artefacts" -maxdepth 3 -name "$1" | head -1; }
# JUCE signs a bundle ad hoc but can write the VST3's moduleinfo.json after it signs, and Live's
# scanner then refuses the plugin. So every bundle is re-sealed once the build is finished.
seal() { codesign --force --sign - "$1" >/dev/null 2>&1 || { echo "could not sign $1"; exit 1; }; }
sealed() { codesign --verify --deep --strict "$1" || { echo "signature broken: $1"; exit 1; }; }
hostcheck_app() { find "$BUILD/${TARGET}HostCheck_artefacts" -name "${TARGET}HostCheck" -type f | head -1; }

case "${1:-}" in
    gate) shift; node "$HERE/check/gate.mjs" "$@" ;;
    build)
        [ -f "$JUCE_DIR/CMakeLists.txt" ] || { echo "no JUCE at $JUCE_DIR (the template's build clones it: VST Template/machinery/plugin.sh)"; exit 1; }
        cmake -S "$HERE" -B "$BUILD" -DCMAKE_BUILD_TYPE=Release -DFETCHCONTENT_SOURCE_DIR_JUCE="$JUCE_DIR" > "$BUILD.configure.log" 2>&1 \
            || { cat "$BUILD.configure.log"; exit 1; }
        cmake --build "$BUILD" --config Release -j "$(sysctl -n hw.logicalcpu)"
        for b in "$(built "$NAME.vst3")" "$(built "$NAME.component")"; do seal "$b"; sealed "$b"; echo "built: $b"; done ;;
    pluginval)
        b="$(built "$NAME.vst3")"; sealed "$b"
        "$PLUGINVAL" --strictness-level "${STRICTNESS:-5}" --validate "$b" ;;
    install)
        mkdir -p "$VST3_DIR" "$AU_DIR"
        rm -rf "${VST3_DIR:?}/$NAME.vst3" "${AU_DIR:?}/$NAME.component"
        cp -R "$(built "$NAME.vst3")" "$VST3_DIR/"; cp -R "$(built "$NAME.component")" "$AU_DIR/"
        sealed "$VST3_DIR/$NAME.vst3"; sealed "$AU_DIR/$NAME.component"
        killall -9 AudioComponentRegistrar 2>/dev/null || true   # so the AU is seen without a logout
        echo "installed: $VST3_DIR/$NAME.vst3"; echo "installed: $AU_DIR/$NAME.component" ;;
    validate)
        for b in "$VST3_DIR/$NAME.vst3" "$AU_DIR/$NAME.component"; do sealed "$b"; echo "signature verified (strict): $b"; done
        "$PLUGINVAL" --strictness-level "${STRICTNESS:-5}" --validate "$VST3_DIR/$NAME.vst3"
        auval -v aufx "$PCODE" "$MCODE" ;;
    hostcheck)
        HC="$(hostcheck_app)"
        # shellcheck disable=SC2046
        "$HC" "$VST3_DIR/$NAME.vst3" $(field hostcheck)
        # shellcheck disable=SC2046
        "$HC" "$AU_DIR/$NAME.component" $(field hostcheck) ;;
    editor)
        shift
        [ $# -gt 0 ] || set -- $(python3 -c 'import json,sys; u=json.load(open(sys.argv[1]))["ui"]; print("%dx%d %dx%d" % (*u["min"], u["width"], u["height"]))' "$HERE/plugin.json")
        HC="$(hostcheck_app)"; mkdir -p "$HERE/out"
        shots=""; for s in "$@"; do shots="$shots $s=editor-$s.png"; done
        # shellcheck disable=SC2086
        (cd "$HERE/out" && "$HC" "$VST3_DIR/$NAME.vst3" --editor $shots) ;;
    uninstall)
        rm -rf "${VST3_DIR:?}/$NAME.vst3" "${AU_DIR:?}/$NAME.component"
        killall -9 AudioComponentRegistrar 2>/dev/null || true
        echo "removed: $VST3_DIR/$NAME.vst3 and $AU_DIR/$NAME.component" ;;
    *) sed -n '2,14p' "$0"; exit 2 ;;
esac
