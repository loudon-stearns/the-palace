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
          "text": "Retrospective Delay \u2014 the Face",
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
          "text": "The cat watches the instrument, not the knob: pose = gain as heard, ectoplasm = what's on the tape, candle = the tape is holding."
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
          "id": "mmsg",
          "maxclass": "message",
          "patching_rect": [
            420,
            205,
            80,
            22.0
          ],
          "text": "measure $1"
        }
      },
      {
        "box": {
          "id": "dial",
          "maxclass": "live.dial",
          "patching_rect": [
            640,
            80,
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
          "id": "gmsg",
          "maxclass": "message",
          "patching_rect": [
            640,
            205,
            60,
            22.0
          ],
          "text": "gain $1"
        }
      },
      {
        "box": {
          "id": "tab",
          "maxclass": "live.tab",
          "patching_rect": [
            760,
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
            12.0,
            62.0,
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
            760,
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
            760,
            140,
            60,
            22.0
          ],
          "text": "lag 0.25"
        }
      },
      {
        "box": {
          "id": "h",
          "maxclass": "message",
          "patching_rect": [
            830,
            140,
            60,
            22.0
          ],
          "text": "lag 0.5"
        }
      },
      {
        "box": {
          "id": "w",
          "maxclass": "message",
          "patching_rect": [
            890,
            140,
            60,
            22.0
          ],
          "text": "lag 1."
        }
      },
      {
        "box": {
          "id": "gen",
          "maxclass": "newobj",
          "patching_rect": [
            20,
            260,
            560,
            22.0
          ],
          "text": "gen~",
          "numinlets": 2,
          "numoutlets": 5,
          "outlettype": [
            "signal",
            "signal",
            "signal",
            "signal",
            "signal"
          ],
          "patcher": {
            "fileversion": 1,
            "appversion": {
              "major": 9,
              "minor": 0,
              "revision": 0,
              "architecture": "x64",
              "modernui": 1
            },
            "classnamespace": "dsp.gen",
            "rect": [
              100.0,
              100.0,
              700.0,
              900.0
            ],
            "boxes": [
              {
                "box": {
                  "id": "in1",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20.0,
                    20.0,
                    40.0,
                    22.0
                  ],
                  "text": "in 1",
                  "numinlets": 0,
                  "numoutlets": 1,
                  "outlettype": [
                    ""
                  ]
                }
              },
              {
                "box": {
                  "id": "in2",
                  "maxclass": "newobj",
                  "patching_rect": [
                    200.0,
                    20.0,
                    40.0,
                    22.0
                  ],
                  "text": "in 2",
                  "numinlets": 0,
                  "numoutlets": 1,
                  "outlettype": [
                    ""
                  ]
                }
              },
              {
                "box": {
                  "id": "code",
                  "maxclass": "codebox",
                  "patching_rect": [
                    20.0,
                    60.0,
                    620.0,
                    760.0
                  ],
                  "code": "// Retrospective Delay \u2014 the face (gen~ codebox)\n// The grammar's s\u00e9ance, unchanged, plus three outlets that tell the face\n// what the instrument is doing \u2014 not where the knob is.\n//\n//   in1  audio                     out1  dry + ghost\n//   in2  measure phase 0..1        out2  the ghost alone\n//                                  out3  the knob as you HEAR it (slewed gain)  -> the cat's pose\n//                                  out4  presence: is anything on the tape at the read head?\n//                                        (raw ghost level, before the knob)   -> the ectoplasm\n//                                  out5  holding: 1 while the tape keeps the past, 0 while it listens\n//                                                                             -> the candle\n//\n// Everything above the FACE block is seance.genexpr from the third move,\n// line for line. Mirrors face_model.py. UNVERIFIED: written without Max open.\n\nParam gain(0, min=0, max=1);          // the conduit: on the way OUT of the tape\nParam lag(0.5, min=0.25, max=1);      // fraction of a measure: 0.25, 0.5 or 1 (exactly 1 now)\nParam measure(96000, min=1);          // samples per measure, from translate -> mstosamps\nParam thresh(0.003, min=0, max=1);    // is anyone playing?\nParam pscale(4, min=0);               // presence gain: a held phrase reads ~0.8\n\nData tape(192000);                    // 4 s at 48 kHz: one 4/4 measure down to 60 BPM\n\nHistory env(0), listen(0), gs(0), penv(0);\nHistory lagA(0.5), lagB(0.5), lastlag(0.5), fade(0), target(0);\n\nM = min(measure, dim(tape));\nw = wrap(floor(in2 * M + 0.5), 0, M);  // write slot; round, don't truncate (see notes)\n\n// a new lag: the idle head jumps, then a 30 ms fade hands over to it\nif (lag != lastlag) {\n\tif (target < 0.5) {\n\t\tlagB = lag;\n\t\ttarget = 1;\n\t} else {\n\t\tlagA = lag;\n\t\ttarget = 0;\n\t}\n\tlastlag = lag;\n}\nxstep = 1 / mstosamps(30);\nfade = fade + clamp(target - fade, -xstep, xstep);\n\n// READ FIRST. At lag = 1 the read slot IS the write slot, and because this\n// line comes before the poke below, it hears one measure ago \u2014 not now.\n// In vanilla Max that order was a coin toss, so the whole note had to be 0.999.\nrA = wrap(w - lagA * M, 0, M);\nrB = wrap(w - lagB * M, 0, M);\nghost = mix(peek(tape, floor(rA)), peek(tape, floor(rB)), fade);\n\n// THEN WRITE. Silence keeps: listen while you play, hold in silence.\na = abs(in1);\nrel = exp(-1 / (samplerate * 0.1));    // 100 ms release\nenv = a > env ? a : env * rel;\nlstep = 1 / mstosamps(5);              // the input crossfade, 5 ms both ways\nlisten = listen + clamp((env > thresh) - listen, -lstep, lstep);\nold = peek(tape, w);\npoke(tape, old + listen * (in1 - old), w);\n\n// the knob, slewed so a fast turn can't zipper\ngstep = 1 / mstosamps(20);\ngs = gs + clamp(gain - gs, -gstep, gstep);\n\nout2 = gs * ghost;\nout1 = in1 + out2;\n\n// FACE \u2014 three facts for the cat, none of them the knob's raw position\nprel = exp(-1 / (samplerate * 1.0));   // 1 s release: rests in the phrase are not an empty tape\ng = abs(ghost);\npenv = g > penv ? g : penv * prel;\nout3 = gs;\nout4 = clamp(penv * pscale, 0, 1);\nout5 = 1 - listen;\n",
                  "fontface": 0,
                  "fontname": "<Monospaced>",
                  "fontsize": 12.0,
                  "numinlets": 2,
                  "numoutlets": 5,
                  "outlettype": [
                    "",
                    "",
                    "",
                    "",
                    ""
                  ]
                }
              },
              {
                "box": {
                  "id": "out1",
                  "maxclass": "newobj",
                  "patching_rect": [
                    20.0,
                    840.0,
                    45.0,
                    22.0
                  ],
                  "text": "out 1",
                  "numinlets": 1,
                  "numoutlets": 0
                }
              },
              {
                "box": {
                  "id": "out2",
                  "maxclass": "newobj",
                  "patching_rect": [
                    150.0,
                    840.0,
                    45.0,
                    22.0
                  ],
                  "text": "out 2",
                  "numinlets": 1,
                  "numoutlets": 0
                }
              },
              {
                "box": {
                  "id": "out3",
                  "maxclass": "newobj",
                  "patching_rect": [
                    280.0,
                    840.0,
                    45.0,
                    22.0
                  ],
                  "text": "out 3",
                  "numinlets": 1,
                  "numoutlets": 0
                }
              },
              {
                "box": {
                  "id": "out4",
                  "maxclass": "newobj",
                  "patching_rect": [
                    410.0,
                    840.0,
                    45.0,
                    22.0
                  ],
                  "text": "out 4",
                  "numinlets": 1,
                  "numoutlets": 0
                }
              },
              {
                "box": {
                  "id": "out5",
                  "maxclass": "newobj",
                  "patching_rect": [
                    540.0,
                    840.0,
                    45.0,
                    22.0
                  ],
                  "text": "out 5",
                  "numinlets": 1,
                  "numoutlets": 0
                }
              }
            ],
            "lines": [
              {
                "patchline": {
                  "source": [
                    "in1",
                    0
                  ],
                  "destination": [
                    "code",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "in2",
                    0
                  ],
                  "destination": [
                    "code",
                    1
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "code",
                    0
                  ],
                  "destination": [
                    "out1",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "code",
                    1
                  ],
                  "destination": [
                    "out2",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "code",
                    2
                  ],
                  "destination": [
                    "out3",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "code",
                    3
                  ],
                  "destination": [
                    "out4",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "code",
                    4
                  ],
                  "destination": [
                    "out5",
                    0
                  ]
                }
              }
            ]
          }
        }
      },
      {
        "box": {
          "id": "out",
          "maxclass": "newobj",
          "patching_rect": [
            20,
            340,
            72,
            22.0
          ],
          "text": "plugout~"
        }
      },
      {
        "box": {
          "id": "s3",
          "maxclass": "newobj",
          "patching_rect": [
            280,
            300,
            100,
            22.0
          ],
          "text": "snapshot~ 33"
        }
      },
      {
        "box": {
          "id": "s4",
          "maxclass": "newobj",
          "patching_rect": [
            400,
            300,
            100,
            22.0
          ],
          "text": "snapshot~ 33"
        }
      },
      {
        "box": {
          "id": "s5",
          "maxclass": "newobj",
          "patching_rect": [
            520,
            300,
            100,
            22.0
          ],
          "text": "snapshot~ 33"
        }
      },
      {
        "box": {
          "id": "pg",
          "maxclass": "newobj",
          "patching_rect": [
            280,
            335,
            128,
            22.0
          ],
          "text": "prepend set_gain"
        }
      },
      {
        "box": {
          "id": "pp",
          "maxclass": "newobj",
          "patching_rect": [
            400,
            335,
            128,
            22.0
          ],
          "text": "prepend presence"
        }
      },
      {
        "box": {
          "id": "ph",
          "maxclass": "newobj",
          "patching_rect": [
            520,
            335,
            121,
            22.0
          ],
          "text": "prepend holding"
        }
      },
      {
        "box": {
          "id": "cat",
          "maxclass": "jsui",
          "patching_rect": [
            280.0,
            380.0,
            240.0,
            240.0
          ],
          "filename": "seance-cat.js",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "presentation": 1,
          "presentation_rect": [
            132.0,
            0.0,
            169.0,
            169.0
          ]
        }
      },
      {
        "box": {
          "id": "cCat",
          "maxclass": "comment",
          "patching_rect": [
            20,
            380,
            240,
            22.0
          ],
          "text": "the cat never sees the dial: only what the gen~ reports"
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
            "m2s",
            0
          ],
          "destination": [
            "mmsg",
            0
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
            "gmsg",
            0
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
            "in",
            0
          ],
          "destination": [
            "gen",
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
            "gen",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "mmsg",
            0
          ],
          "destination": [
            "gen",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "gmsg",
            0
          ],
          "destination": [
            "gen",
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
            "gen",
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
            "gen",
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
            "gen",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "gen",
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
            "gen",
            0
          ],
          "destination": [
            "out",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "gen",
            2
          ],
          "destination": [
            "s3",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "gen",
            3
          ],
          "destination": [
            "s4",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "gen",
            4
          ],
          "destination": [
            "s5",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "s3",
            0
          ],
          "destination": [
            "pg",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "s4",
            0
          ],
          "destination": [
            "pp",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "s5",
            0
          ],
          "destination": [
            "ph",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "pg",
            0
          ],
          "destination": [
            "cat",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "pp",
            0
          ],
          "destination": [
            "cat",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "ph",
            0
          ],
          "destination": [
            "cat",
            0
          ]
        }
      }
    ],
    "description": "Retrospective Delay \u2014 the Face"
  }
}