# The build is all in the shared machinery (machinery/plugin.cmake). This file
# only finds it: the nearest folder above this one that holds machinery/.
cmake_minimum_required(VERSION 3.22)
project(VSTTemplatePlugin)

set(_up "${CMAKE_CURRENT_SOURCE_DIR}")
while(NOT EXISTS "${_up}/machinery/plugin.cmake")
    get_filename_component(_parent "${_up}" DIRECTORY)
    if(_parent STREQUAL _up)
        message(FATAL_ERROR "no machinery/plugin.cmake above ${CMAKE_CURRENT_SOURCE_DIR}")
    endif()
    set(_up "${_parent}")
endwhile()
include("${_up}/machinery/plugin.cmake")
