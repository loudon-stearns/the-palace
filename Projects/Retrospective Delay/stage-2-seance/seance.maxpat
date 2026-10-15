{
  "patcher": {
    "fileversion": 1,
    "appversion": {
      "major": 9,
      "minor": 0,
      "revision": 0,
      "architecture": "x64",
      "modernui": 1
    },
    "classnamespace": "box",
    "rect": [
      60.0,
      80.0,
      1120.0,
      700.0
    ],
    "openinpresentation": 1,
    "default_fontname": "Arial",
    "default_fontsize": 12.0,
    "gridsize": [
      15.0,
      15.0
    ],
    "boxes": [
      {
        "box": {
          "id": "title",
          "maxclass": "comment",
          "patching_rect": [
            20,
            10,
            700,
            22.0
          ],
          "text": "Retrospective Delay \u2014 the Seance",
          "fontsize": 16.0
        }
      },
      {
        "box": {
          "id": "note",
          "maxclass": "comment",
          "patching_rect": [
            20,
            36,
            900,
            22.0
          ],
          "text": "Paste into a Max Audio Effect in Live, start the transport. Play, stop, and turn the knob: silence is the gesture that summons."
        }
      },
      {
        "box": {
          "id": "buf",
          "maxclass": "newobj",
          "patching_rect": [
            900,
            80,
            191,
            22.0
          ],
          "text": "buffer~ ret-seance 4000 1"
        }
      },
      {
        "box": {
          "id": "lb",
          "maxclass": "newobj",
          "patching_rect": [
            420,
            80,
            72,
            22.0
          ],
          "text": "loadbang"
        }
      },
      {
        "box": {
          "id": "one",
          "maxclass": "message",
          "patching_rect": [
            420,
            110,
            40,
            22.0
          ],
          "text": "1n"
        }
      },
      {
        "box": {
          "id": "tr",
          "maxclass": "newobj",
          "patching_rect": [
            420,
            140,
            247,
            22.0
          ],
          "text": "translate notevalues ms @listen 1"
        }
      },
      {
        "box": {
          "id": "m2s",
          "maxclass": "newobj",
          "patching_rect": [
            420,
            175,
            79,
            22.0
          ],
          "text": "mstosamps"
        }
      },
      {
        "box": {
          "id": "in",
          "maxclass": "newobj",
          "patching_rect": [
            20,
            80,
            65,
            22.0
          ],
          "text": "plugin~"
        }
      },
      {
        "box": {
          "id": "clk",
          "maxclass": "newobj",
          "patching_rect": [
            200,
            80,
            142,
            22.0
          ],
          "text": "phasor~ 1n @lock 1"
        }
      },
      {
        "box": {
          "id": "widx",
          "maxclass": "newobj",
          "patching_rect": [
            200,
            215,
            79,
            22.0
          ],
          "text": "*~ 96000."
        }
      },
      {
        "box": {
          "id": "abs",
          "maxclass": "newobj",
          "patching_rect": [
            20,
            120,
            60,
            22.0
          ],
          "text": "abs~"
        }
      },
      {
        "box": {
          "id": "env",
          "maxclass": "newobj",
          "patching_rect": [
            20,
            150,
            107,
            22.0
          ],
          "text": "slide~ 1 4800"
        }
      },
      {
        "box": {
          "id": "gate",
          "maxclass": "newobj",
          "patching_rect": [
            20,
            180,
            72,
            22.0
          ],
          "text": ">~ 0.003"
        }
      },
      {
        "box": {
          "id": "seam",
          "maxclass": "newobj",
          "patching_rect": [
            20,
            210,
            149,
            22.0
          ],
          "text": "rampsmooth~ 240 240"
        }
      },
      {
        "box": {
          "id": "cSeam",
          "maxclass": "comment",
          "patching_rect": [
            200,
            140,
            200,
            22.0
          ],
          "text": "the input crossfade: 5 ms (240 samples) between listening and holding, both ways. No click where you stop or where you come back in."
        }
      },
      {
        "box": {
          "id": "old",
          "maxclass": "newobj",
          "patching_rect": [
            200,
            250,
            135,
            22.0
          ],
          "text": "index~ ret-seance"
        }
      },
      {
        "box": {
          "id": "diff",
          "maxclass": "newobj",
          "patching_rect": [
            20,
            250,
            60,
            22.0
          ],
          "text": "-~"
        }
      },
      {
        "box": {
          "id": "gated",
          "maxclass": "newobj",
          "patching_rect": [
            20,
            280,
            60,
            22.0
          ],
          "text": "*~"
        }
      },
      {
        "box": {
          "id": "wsum",
          "maxclass": "newobj",
          "patching_rect": [
            20,
            305,
            40,
            22.0
          ],
          "text": "+~"
        }
      },
      {
        "box": {
          "id": "poke",
          "maxclass": "newobj",
          "patching_rect": [
            20,
            340,
            142,
            22.0
          ],
          "text": "poke~ ret-seance 1"
        }
      },
      {
        "box": {
          "id": "tab",
          "maxclass": "live.tab",
          "patching_rect": [
            640,
            80,
            120,
            22.0
          ],
          "varname": "lag",
          "parameter_enable": 1,
          "num_lines_patching": 1,
          "num_lines_presentation": 1,
          "presentation": 1,
          "presentation_rect": [
            70.0,
            12.0,
            110.0,
            20.0
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_longname": "lag",
              "parameter_shortname": "lag",
              "parameter_type": 2,
              "parameter_initial_enable": 1,
              "parameter_initial": [
                1
              ],
              "parameter_enum": [
                "1/4",
                "1/2",
                "1/1"
              ],
              "parameter_mmax": 2
            }
          }
        }
      },
      {
        "box": {
          "id": "sel",
          "maxclass": "newobj",
          "patching_rect": [
            640,
            110,
            79,
            22.0
          ],
          "text": "sel 0 1 2"
        }
      },
      {
        "box": {
          "id": "q",
          "maxclass": "message",
          "patching_rect": [
            640,
            140,
            40,
            22.0
          ],
          "text": "0.25"
        }
      },
      {
        "box": {
          "id": "h",
          "maxclass": "message",
          "patching_rect": [
            690,
            140,
            40,
            22.0
          ],
          "text": "0.5"
        }
      },
      {
        "box": {
          "id": "w",
          "maxclass": "message",
          "patching_rect": [
            740,
            140,
            50,
            22.0
          ],
          "text": "0.999"
        }
      },
      {
        "box": {
          "id": "tbfb",
          "maxclass": "newobj",
          "patching_rect": [
            640,
            175,
            65,
            22.0
          ],
          "text": "t b f b"
        }
      },
      {
        "box": {
          "id": "ctr",
          "maxclass": "newobj",
          "patching_rect": [
            760,
            205,
            93,
            22.0
          ],
          "text": "counter 0 1"
        }
      },
      {
        "box": {
          "id": "tii",
          "maxclass": "newobj",
          "patching_rect": [
            760,
            235,
            60,
            22.0
          ],
          "text": "t i i"
        }
      },
      {
        "box": {
          "id": "plus1",
          "maxclass": "newobj",
          "patching_rect": [
            800,
            265,
            40,
            22.0
          ],
          "text": "+ 1"
        }
      },
      {
        "box": {
          "id": "route",
          "maxclass": "newobj",
          "patching_rect": [
            700,
            295,
            60,
            22.0
          ],
          "text": "gate 2"
        }
      },
      {
        "box": {
          "id": "held",
          "maxclass": "newobj",
          "patching_rect": [
            640,
            265,
            40,
            22.0
          ],
          "text": "i"
        }
      },
      {
        "box": {
          "id": "xpk",
          "maxclass": "newobj",
          "patching_rect": [
            640,
            330,
            79,
            22.0
          ],
          "text": "pack f 30"
        }
      },
      {
        "box": {
          "id": "xramp",
          "maxclass": "newobj",
          "patching_rect": [
            640,
            360,
            60,
            22.0
          ],
          "text": "line~"
        }
      },
      {
        "box": {
          "id": "cHeads",
          "maxclass": "comment",
          "patching_rect": [
            820,
            330,
            260,
            22.0
          ],
          "text": "two read heads: the idle one jumps to the new lag, then a 30 ms fade hands over to it"
        }
      },
      {
        "box": {
          "id": "lagA",
          "maxclass": "newobj",
          "patching_rect": [
            420,
            400,
            60,
            22.0
          ],
          "text": "-~ 0.5"
        }
      },
      {
        "box": {
          "id": "wrapA",
          "maxclass": "newobj",
          "patching_rect": [
            420,
            430,
            60,
            22.0
          ],
          "text": "wrap~"
        }
      },
      {
        "box": {
          "id": "waveA",
          "maxclass": "newobj",
          "patching_rect": [
            420,
            460,
            128,
            22.0
          ],
          "text": "wave~ ret-seance"
        }
      },
      {
        "box": {
          "id": "lagB",
          "maxclass": "newobj",
          "patching_rect": [
            530,
            400,
            60,
            22.0
          ],
          "text": "-~ 0.5"
        }
      },
      {
        "box": {
          "id": "wrapB",
          "maxclass": "newobj",
          "patching_rect": [
            530,
            430,
            60,
            22.0
          ],
          "text": "wrap~"
        }
      },
      {
        "box": {
          "id": "waveB",
          "maxclass": "newobj",
          "patching_rect": [
            530,
            460,
            128,
            22.0
          ],
          "text": "wave~ ret-seance"
        }
      },
      {
        "box": {
          "id": "inv",
          "maxclass": "newobj",
          "patching_rect": [
            640,
            400,
            60,
            22.0
          ],
          "text": "!-~ 1"
        }
      },
      {
        "box": {
          "id": "vA",
          "maxclass": "newobj",
          "patching_rect": [
            420,
            495,
            40,
            22.0
          ],
          "text": "*~"
        }
      },
      {
        "box": {
          "id": "vB",
          "maxclass": "newobj",
          "patching_rect": [
            530,
            495,
            40,
            22.0
          ],
          "text": "*~"
        }
      },
      {
        "box": {
          "id": "heads",
          "maxclass": "newobj",
          "patching_rect": [
            420,
            525,
            40,
            22.0
          ],
          "text": "+~"
        }
      },
      {
        "box": {
          "id": "dial",
          "maxclass": "live.dial",
          "patching_rect": [
            900,
            400,
            44,
            22.0
          ],
          "varname": "gain",
          "parameter_enable": 1,
          "presentation": 1,
          "presentation_rect": [
            12.0,
            6.0,
            44.0,
            48.0
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_longname": "gain",
              "parameter_shortname": "gain",
              "parameter_type": 0,
              "parameter_initial_enable": 1,
              "parameter_initial": [
                0.0
              ],
              "parameter_mmin": 0.0,
              "parameter_mmax": 1.0,
              "parameter_unitstyle": 1
            }
          }
        }
      },
      {
        "box": {
          "id": "pk",
          "maxclass": "newobj",
          "patching_rect": [
            900,
            460,
            79,
            22.0
          ],
          "text": "pack f 20"
        }
      },
      {
        "box": {
          "id": "ramp",
          "maxclass": "newobj",
          "patching_rect": [
            900,
            490,
            60,
            22.0
          ],
          "text": "line~"
        }
      },
      {
        "box": {
          "id": "vca",
          "maxclass": "newobj",
          "patching_rect": [
            420,
            560,
            40,
            22.0
          ],
          "text": "*~"
        }
      },
      {
        "box": {
          "id": "mix",
          "maxclass": "newobj",
          "patching_rect": [
            20,
            600,
            40,
            22.0
          ],
          "text": "+~"
        }
      },
      {
        "box": {
          "id": "out",
          "maxclass": "newobj",
          "patching_rect": [
            20,
            640,
            72,
            22.0
          ],
          "text": "plugout~"
        }
      }
    ],
    "lines": [
      {
        "patchline": {
          "source": [
            "lb",
            0
          ],
          "destination": [
            "one",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "one",
            0
          ],
          "destination": [
            "tr",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "tr",
            0
          ],
          "destination": [
            "m2s",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "clk",
            0
          ],
          "destination": [
            "widx",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "m2s",
            0
          ],
          "destination": [
            "widx",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "in",
            0
          ],
          "destination": [
            "abs",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "abs",
            0
          ],
          "destination": [
            "env",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "env",
            0
          ],
          "destination": [
            "gate",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "gate",
            0
          ],
          "destination": [
            "seam",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "widx",
            0
          ],
          "destination": [
            "old",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "in",
            0
          ],
          "destination": [
            "diff",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "old",
            0
          ],
          "destination": [
            "diff",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "diff",
            0
          ],
          "destination": [
            "gated",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "seam",
            0
          ],
          "destination": [
            "gated",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "gated",
            0
          ],
          "destination": [
            "wsum",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "old",
            0
          ],
          "destination": [
            "wsum",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "wsum",
            0
          ],
          "destination": [
            "poke",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "widx",
            0
          ],
          "destination": [
            "poke",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "tab",
            0
          ],
          "destination": [
            "sel",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "sel",
            0
          ],
          "destination": [
            "q",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "sel",
            1
          ],
          "destination": [
            "h",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "sel",
            2
          ],
          "destination": [
            "w",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "q",
            0
          ],
          "destination": [
            "tbfb",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "h",
            0
          ],
          "destination": [
            "tbfb",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "w",
            0
          ],
          "destination": [
            "tbfb",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "tbfb",
            2
          ],
          "destination": [
            "ctr",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "ctr",
            0
          ],
          "destination": [
            "tii",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "tii",
            1
          ],
          "destination": [
            "plus1",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "plus1",
            0
          ],
          "destination": [
            "route",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "tbfb",
            1
          ],
          "destination": [
            "route",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "tii",
            0
          ],
          "destination": [
            "held",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "tbfb",
            0
          ],
          "destination": [
            "held",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "held",
            0
          ],
          "destination": [
            "xpk",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "xpk",
            0
          ],
          "destination": [
            "xramp",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "clk",
            0
          ],
          "destination": [
            "lagA",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "lagA",
            0
          ],
          "destination": [
            "wrapA",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "wrapA",
            0
          ],
          "destination": [
            "waveA",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "tr",
            0
          ],
          "destination": [
            "waveA",
            2
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "route",
            0
          ],
          "destination": [
            "lagA",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "clk",
            0
          ],
          "destination": [
            "lagB",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "lagB",
            0
          ],
          "destination": [
            "wrapB",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "wrapB",
            0
          ],
          "destination": [
            "waveB",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "tr",
            0
          ],
          "destination": [
            "waveB",
            2
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "route",
            1
          ],
          "destination": [
            "lagB",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "xramp",
            0
          ],
          "destination": [
            "inv",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "waveA",
            0
          ],
          "destination": [
            "vA",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "inv",
            0
          ],
          "destination": [
            "vA",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "waveB",
            0
          ],
          "destination": [
            "vB",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "xramp",
            0
          ],
          "destination": [
            "vB",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "vA",
            0
          ],
          "destination": [
            "heads",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "vB",
            0
          ],
          "destination": [
            "heads",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "dial",
            0
          ],
          "destination": [
            "pk",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "pk",
            0
          ],
          "destination": [
            "ramp",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "heads",
            0
          ],
          "destination": [
            "vca",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "ramp",
            0
          ],
          "destination": [
            "vca",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "in",
            0
          ],
          "destination": [
            "mix",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "vca",
            0
          ],
          "destination": [
            "mix",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "mix",
            0
          ],
          "destination": [
            "out",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "mix",
            0
          ],
          "destination": [
            "out",
            1
          ]
        }
      }
    ],
    "description": "Retrospective Delay \u2014 the Seance"
  }
}