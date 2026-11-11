# Mycelial Reverb — its own build file, where every other plugin borrows the template's.
#
# VST Template's machinery wraps a per-sample Algorithm whose whole state is its knobs,
# and gives it the house editor. This plugin's state is a grown colony, it takes actions
# (knock, a frost, a new spore), and its editor is the dish. So it carries its own
# processor and editor in src/, and borrows from the machinery what still fits:
# the shared JUCE copy, ParamSpec.h, plugin.json's fields, and HostCheck.cpp unchanged.
cmake_minimum_required(VERSION 3.22)
project(MycelialReverb)

set(PLUGIN_DIR "${CMAKE_CURRENT_SOURCE_DIR}")
set(_up "${PLUGIN_DIR}")
set(MACHINERY_DIR "")
while(MACHINERY_DIR STREQUAL "")
    if(EXISTS "${_up}/VST Template/machinery/plugin.cmake")
        set(MACHINERY_DIR "${_up}/VST Template/machinery")
    else()
        get_filename_component(_parent "${_up}" DIRECTORY)
        if(_parent STREQUAL _up)
            message(FATAL_ERROR "no VST Template/machinery above ${PLUGIN_DIR}")
        endif()
        set(_up "${_parent}")
    endif()
endwhile()

file(READ "${PLUGIN_DIR}/plugin.json" PLUGIN_JSON)
foreach(key name target company bundle_id manufacturer_code plugin_code kind version)
    string(JSON PLUGIN_${key} GET "${PLUGIN_JSON}" ${key})
endforeach()
string(JSON UI_W GET "${PLUGIN_JSON}" ui width)
string(JSON UI_H GET "${PLUGIN_JSON}" ui height)
string(JSON UI_MIN_W GET "${PLUGIN_JSON}" ui min 0)
string(JSON UI_MIN_H GET "${PLUGIN_JSON}" ui min 1)
string(JSON UI_MAX_W GET "${PLUGIN_JSON}" ui max 0)
string(JSON UI_MAX_H GET "${PLUGIN_JSON}" ui max 1)
string(JSON UI_TIER GET "${PLUGIN_JSON}" ui tier)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# JUCE 8.0.12; plugin.sh points FETCHCONTENT_SOURCE_DIR_JUCE at the template's one shared copy.
include(FetchContent)
FetchContent_Declare(JUCE
    GIT_REPOSITORY https://github.com/juce-framework/JUCE.git
    GIT_TAG        8.0.12
    GIT_SHALLOW    TRUE)
FetchContent_MakeAvailable(JUCE)

juce_add_binary_data(${PLUGIN_target}_EditorData
    HEADER_NAME EditorData.h
    NAMESPACE   EditorData
    SOURCES     "${PLUGIN_DIR}/ui/index.html")

juce_add_plugin(${PLUGIN_target}
    VERSION                  ${PLUGIN_version}
    BUNDLE_ID                ${PLUGIN_bundle_id}
    COMPANY_NAME             "${PLUGIN_company}"
    PRODUCT_NAME             "${PLUGIN_name}"
    PLUGIN_MANUFACTURER_CODE ${PLUGIN_manufacturer_code}
    PLUGIN_CODE              ${PLUGIN_plugin_code}
    FORMATS                  VST3 AU Standalone
    IS_SYNTH                 FALSE
    NEEDS_MIDI_INPUT         FALSE
    NEEDS_MIDI_OUTPUT        FALSE
    AU_MAIN_TYPE             kAudioUnitType_Effect
    EDITOR_WANTS_KEYBOARD_FOCUS FALSE)

target_sources(${PLUGIN_target} PRIVATE "${PLUGIN_DIR}/src/PluginProcessor.cpp" "${PLUGIN_DIR}/src/PluginEditor.cpp")
target_include_directories(${PLUGIN_target} PRIVATE "${PLUGIN_DIR}/src" "${MACHINERY_DIR}/src")
# -ffp-contract=off: Algorithm.h must round as the JavaScript reference does (no fused a*b+c).
target_compile_options(${PLUGIN_target} PRIVATE -ffp-contract=off)
target_compile_definitions(${PLUGIN_target} PUBLIC
    PLUGIN_NAME="${PLUGIN_name}" PLUGIN_VERSION="${PLUGIN_version}" PLUGIN_COMPANY="${PLUGIN_company}" PLUGIN_TIER="${UI_TIER}"
    PLUGIN_UI_W=${UI_W} PLUGIN_UI_H=${UI_H} PLUGIN_UI_MIN_W=${UI_MIN_W} PLUGIN_UI_MIN_H=${UI_MIN_H} PLUGIN_UI_MAX_W=${UI_MAX_W} PLUGIN_UI_MAX_H=${UI_MAX_H}
    JUCE_USE_CURL=0 JUCE_WEB_BROWSER=1 JUCE_VST3_CAN_REPLACE_VST2=0)
target_link_libraries(${PLUGIN_target}
    PRIVATE juce::juce_audio_utils juce::juce_gui_extra ${PLUGIN_target}_EditorData
    PUBLIC  juce::juce_recommended_config_flags juce::juce_recommended_lto_flags juce::juce_recommended_warning_flags)

# The template's host check, unchanged: loads the installed VST3 / AU the way a DAW does.
juce_add_console_app(${PLUGIN_target}HostCheck VERSION ${PLUGIN_version})
target_sources(${PLUGIN_target}HostCheck PRIVATE "${MACHINERY_DIR}/src/HostCheck.cpp")
target_compile_definitions(${PLUGIN_target}HostCheck PUBLIC
    JUCE_WEB_BROWSER=0 JUCE_USE_CURL=0 JUCE_PLUGINHOST_VST3=1 JUCE_PLUGINHOST_AU=1
    JUCE_MODAL_LOOPS_PERMITTED=1)
target_link_libraries(${PLUGIN_target}HostCheck
    PRIVATE juce::juce_audio_utils juce::juce_dsp
    PUBLIC  juce::juce_recommended_config_flags juce::juce_recommended_warning_flags)
