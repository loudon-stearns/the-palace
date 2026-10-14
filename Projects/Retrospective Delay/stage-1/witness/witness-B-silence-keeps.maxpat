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
      1040.0,
      640.0
    ],
    "openinpresentation": 0,
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
          "text": "Retrospective Delay \u2014 the Witness (B: silence keeps the past)",
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
            700,
            22.0
          ],
          "text": "Paste into a Max Audio Effect in Live, start the transport, play. Gain knob = the conduit."
        }
      },
      {
        "box": {
          "id": "buf",
          "maxclass": "newobj",
          "patching_rect": [
            760,
            80,
            198,
            22.0
          ],
          "text": "buffer~ ret-witness 4000 1"
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
          "id": "poke",
          "maxclass": "newobj",
          "patching_rect": [
            20,
            330,
            149,
            22.0
          ],
          "text": "poke~ ret-witness 1"
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
          "id": "old",
          "maxclass": "newobj",
          "patching_rect": [
            200,
            250,
            142,
            22.0
          ],
          "text": "index~ ret-witness"
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
          "id": "cB",
          "maxclass": "comment",
          "patching_rect": [
            200,
            290,
            560,
            22.0
          ],
          "text": "In silence the witness writes down what it already holds: the last measure stays and keeps coming back."
        }
      },
      {
        "box": {
          "id": "lag",
          "maxclass": "newobj",
          "patching_rect": [
            600,
            215,
            60,
            22.0
          ],
          "text": "-~ 0.5"
        }
      },
      {
        "box": {
          "id": "wrap",
          "maxclass": "newobj",
          "patching_rect": [
            600,
            245,
            60,
            22.0
          ],
          "text": "wrap~"
        }
      },
      {
        "box": {
          "id": "wave",
          "maxclass": "newobj",
          "patching_rect": [
            600,
            330,
            135,
            22.0
          ],
          "text": "wave~ ret-witness"
        }
      },
      {
        "box": {
          "id": "dial",
          "maxclass": "live.dial",
          "patching_rect": [
            820,
            300,
            44,
            22.0
          ],
          "varname": "gain",
          "parameter_enable": 1,
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_longname": "gain",
              "parameter_shortname": "gain",
              "parameter_type": 0,
              "parameter_mmin": 0.0,
              "parameter_mmax": 1.0,
              "parameter_initial_enable": 1,
              "parameter_initial": [
                0.0
              ],
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
            820,
            370,
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
            820,
            400,
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
            600,
            430,
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
            480,
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
            530,
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
            "gate",
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
            "clk",
            0
          ],
          "destination": [
            "lag",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "lag",
            0
          ],
          "destination": [
            "wrap",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "wrap",
            0
          ],
          "destination": [
            "wave",
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
            "wave",
            2
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
            "wave",
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
    "description": "Retrospective Delay \u2014 the Witness (B: silence keeps the past)"
  }
}