# Template machinery. Don't edit per plugin: the plugin's name, codes and kind
# come from plugin.json, its DSP from src/Algorithm.h.
cmake_minimum_required(VERSION 3.22)

file(READ "${CMAKE_CURRENT_SOURCE_DIR}/plugin.json" PLUGIN_JSON)
foreach(key name target company bundle_id manufacturer_code plugin_code kind version)
    string(JSON PLUGIN_${key} GET "${PLUGIN_JSON}" ${key})
endforeach()

project(${PLUGIN_target} VERSION ${PLUGIN_version})
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# JUCE 8.0.12, the version Tract Mirror shipped with. plugin.sh points
# FETCHCONTENT_SOURCE_DIR_JUCE at one shared copy, so it downloads once.
include(FetchContent)
FetchContent_Declare(JUCE
    GIT_REPOSITORY https://github.com/juce-framework/JUCE.git
    GIT_TAG        8.0.12
    GIT_SHALLOW    TRUE)
FetchContent_MakeAvailable(JUCE)

if(PLUGIN_kind STREQUAL "instrument")
    set(IS_SYNTH TRUE)
    set(AU_TYPE kAudioUnitType_MusicDevice)
else()
    set(IS_SYNTH FALSE)
    set(AU_TYPE kAudioUnitType_Effect)
endif()

set(COMMON_DEFS
    PLUGIN_NAME="${PLUGIN_name}"
    JUCE_WEB_BROWSER=0
    JUCE_USE_CURL=0)

# ── The plugin: VST3 + AU + Standalone ───────────────────────────────────────
juce_add_plugin(${PLUGIN_target}
    VERSION                  ${PLUGIN_version}
    BUNDLE_ID                ${PLUGIN_bundle_id}
    COMPANY_NAME             "${PLUGIN_company}"
    PRODUCT_NAME             "${PLUGIN_name}"
    PLUGIN_MANUFACTURER_CODE ${PLUGIN_manufacturer_code}
    PLUGIN_CODE              ${PLUGIN_plugin_code}
    FORMATS                  VST3 AU Standalone
    IS_SYNTH                 ${IS_SYNTH}
    NEEDS_MIDI_INPUT         ${IS_SYNTH}
    NEEDS_MIDI_OUTPUT        FALSE
    AU_MAIN_TYPE             ${AU_TYPE}
    EDITOR_WANTS_KEYBOARD_FOCUS FALSE)

target_sources(${PLUGIN_target} PRIVATE src/PluginProcessor.cpp)
target_include_directories(${PLUGIN_target} PRIVATE src)
target_compile_definitions(${PLUGIN_target} PUBLIC ${COMMON_DEFS} JUCE_VST3_CAN_REPLACE_VST2=0)
target_link_libraries(${PLUGIN_target}
    PRIVATE juce::juce_audio_utils
    PUBLIC  juce::juce_recommended_config_flags juce::juce_recommended_lto_flags juce::juce_recommended_warning_flags)

# ── Harness: runs the algorithm and the real processor for verify.py ────────
juce_add_console_app(${PLUGIN_target}Harness)
target_sources(${PLUGIN_target}Harness PRIVATE src/Harness.cpp src/PluginProcessor.cpp)
target_include_directories(${PLUGIN_target}Harness PRIVATE src)
target_compile_definitions(${PLUGIN_target}Harness PUBLIC ${COMMON_DEFS})
target_link_libraries(${PLUGIN_target}Harness
    PRIVATE juce::juce_audio_utils
    PUBLIC  juce::juce_recommended_config_flags juce::juce_recommended_warning_flags)

# ── HostCheck: loads the installed VST3 / AU the way a DAW does ─────────────
juce_add_console_app(${PLUGIN_target}HostCheck)
target_sources(${PLUGIN_target}HostCheck PRIVATE src/HostCheck.cpp)
target_compile_definitions(${PLUGIN_target}HostCheck PUBLIC
    JUCE_WEB_BROWSER=0 JUCE_USE_CURL=0 JUCE_PLUGINHOST_VST3=1 JUCE_PLUGINHOST_AU=1)
target_link_libraries(${PLUGIN_target}HostCheck
    PRIVATE juce::juce_audio_utils juce::juce_dsp
    PUBLIC  juce::juce_recommended_config_flags juce::juce_recommended_warning_flags)
