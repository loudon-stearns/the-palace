#!/bin/sh
# tiles the before/after photographs into fit-sheet.png: top, 844x390 at the bow stop (v1.13 left, v1.14 right); bottom, 480x480 at the pitch stop
cd frames && ffmpeg -loglevel error -y -i before-844x390-6-bow.png -i after-844x390-6-bow.png -i before-480x480-4-pitch.png -i after-480x480-4-pitch.png -filter_complex '[0][1]hstack[top];[2]pad=844:480:182:0[c];[3]pad=844:480:182:0[d];[c][d]hstack[bot];[top][bot]vstack' ../fit-sheet.png
