# The build is all in VST Template's shared machinery (machinery/plugin.cmake). This
# file only finds it: machinery/ in the nearest folder above this one, or, for a
# plugin in a steward's bundle, VST Template/machinery beside a folder on the way up.
cmake_minimum_required(VERSION 3.22)
project(VSTTemplatePlugin)

set(_up "${CMAKE_CURRENT_SOURCE_DIR}")
set(_mach "")
while(_mach STREQUAL "")
    if(EXISTS "${_up}/machinery/plugin.cmake")
        set(_mach "${_up}/machinery")
    elseif(EXISTS "${_up}/VST Template/machinery/plugin.cmake")
        set(_mach "${_up}/VST Template/machinery")
    else()
        get_filename_component(_parent "${_up}" DIRECTORY)
        if(_parent STREQUAL _up)
            message(FATAL_ERROR "no machinery/plugin.cmake above ${CMAKE_CURRENT_SOURCE_DIR}")
        endif()
        set(_up "${_parent}")
    endif()
endwhile()
include("${_mach}/plugin.cmake")
