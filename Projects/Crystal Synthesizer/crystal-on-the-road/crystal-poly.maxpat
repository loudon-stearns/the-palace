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
   1140.0,
   380.0
  ],
  "default_fontname": "Arial",
  "default_fontsize": 12.0,
  "gridsize": [
   15.0,
   15.0
  ],
  "boxes": [
   {
    "box": {
     "id": "t",
     "maxclass": "comment",
     "patching_rect": [
      20.0,
      10.0,
      900.0,
      20.0
     ],
     "text": "Crystal Synthesizer, polyphonic: eight voices, one crystal knob. Turn on the dac, pick a crystal, play chords.",
     "fontsize": 16.0
    }
   },
   {
    "box": {
     "id": "s",
     "maxclass": "comment",
     "patching_rect": [
      20.0,
      36.0,
      900.0,
      20.0
     ],
     "text": "Try the same chord on Ruby, then Labradorite: the tight lattices fight in chords, the wide one doesn't."
    }
   },
   {
    "box": {
     "id": "kb",
     "maxclass": "kslider",
     "numinlets": 2,
     "numoutlets": 2,
     "outlettype": [
      "int",
      "int"
     ],
     "parameter_enable": 0,
     "patching_rect": [
      20.0,
      70.0,
      336.0,
      53.0
     ]
    }
   },
   {
    "box": {
     "id": "mk",
     "patching_rect": [
      20.0,
      135.0,
      120.0,
      22.0
     ],
     "fontsize": 12.0,
     "maxclass": "newobj",
     "text": "makenote 100 1500",
     "numinlets": 3,
     "numoutlets": 2,
     "outlettype": [
      "float",
      "float"
     ]
    }
   },
   {
    "box": {
     "id": "pk",
     "patching_rect": [
      20.0,
      165.0,
      60.0,
      22.0
     ],
     "fontsize": 12.0,
     "maxclass": "newobj",
     "text": "pack 0 0",
     "numinlets": 2,
     "numoutlets": 1,
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "mf",
     "patching_rect": [
      20.0,
      195.0,
      80.0,
      22.0
     ],
     "fontsize": 12.0,
     "maxclass": "newobj",
     "text": "midiformat",
     "numinlets": 7,
     "numoutlets": 2,
     "outlettype": [
      "int",
      ""
     ]
    }
   },
   {
    "box": {
     "id": "mi",
     "patching_rect": [
      200.0,
      195.0,
      50.0,
      22.0
     ],
     "fontsize": 12.0,
     "maxclass": "newobj",
     "text": "midiin",
     "numinlets": 1,
     "numoutlets": 1,
     "outlettype": [
      "int"
     ]
    }
   },
   {
    "box": {
     "id": "ml",
     "maxclass": "comment",
     "patching_rect": [
      400.0,
      70.0,
      200.0,
      20.0
     ],
     "text": "crystal"
    }
   },
   {
    "box": {
     "id": "mlm",
     "patching_rect": [
      400.0,
      92.0,
      70.0,
      22.0
     ],
     "fontsize": 12.0,
     "maxclass": "newobj",
     "text": "loadmess 0",
     "numinlets": 1,
     "numoutlets": 1,
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "menu",
     "maxclass": "umenu",
     "items": [
      "0",
      "Diamond",
      ",",
      "1",
      "Fluorite",
      ",",
      "2",
      "Tetragonal",
      "(hyp.)",
      ",",
      "3",
      "Emerald",
      ",",
      "4",
      "Ruby",
      ",",
      "5",
      "Amethyst",
      ",",
      "6",
      "Topaz",
      ",",
      "7",
      "Monoclinic",
      "(hyp.)",
      ",",
      "8",
      "Labradorite"
     ],
     "numinlets": 1,
     "numoutlets": 3,
     "outlettype": [
      "int",
      "",
      ""
     ],
     "parameter_enable": 0,
     "patching_rect": [
      400.0,
      120.0,
      200.0,
      22.0
     ]
    }
   },
   {
    "box": {
     "id": "mpp",
     "patching_rect": [
      400.0,
      150.0,
      100.0,
      22.0
     ],
     "fontsize": 12.0,
     "maxclass": "newobj",
     "text": "prepend crystal",
     "numinlets": 1,
     "numoutlets": 1,
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "lb-0",
     "maxclass": "comment",
     "patching_rect": [
      620.0,
      70.0,
      98.0,
      20.0
     ],
     "text": "attack ms"
    }
   },
   {
    "box": {
     "id": "lm-0",
     "patching_rect": [
      620.0,
      92.0,
      80.0,
      22.0
     ],
     "fontsize": 12.0,
     "maxclass": "newobj",
     "text": "loadmess 80.0",
     "numinlets": 1,
     "numoutlets": 1,
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "fl-0",
     "maxclass": "flonum",
     "format": 6,
     "minimum": 1.0,
     "maximum": 500.0,
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      "bang"
     ],
     "parameter_enable": 0,
     "patching_rect": [
      620.0,
      120.0,
      70.0,
      22.0
     ]
    }
   },
   {
    "box": {
     "id": "pp-0",
     "patching_rect": [
      620.0,
      150.0,
      95.0,
      22.0
     ],
     "fontsize": 12.0,
     "maxclass": "newobj",
     "text": "prepend attack",
     "numinlets": 1,
     "numoutlets": 1,
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "lb-1",
     "maxclass": "comment",
     "patching_rect": [
      720.0,
      70.0,
      98.0,
      20.0
     ],
     "text": "decay s"
    }
   },
   {
    "box": {
     "id": "lm-1",
     "patching_rect": [
      720.0,
      92.0,
      80.0,
      22.0
     ],
     "fontsize": 12.0,
     "maxclass": "newobj",
     "text": "loadmess 5.5",
     "numinlets": 1,
     "numoutlets": 1,
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "fl-1",
     "maxclass": "flonum",
     "format": 6,
     "minimum": 0.1,
     "maximum": 20.0,
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      "bang"
     ],
     "parameter_enable": 0,
     "patching_rect": [
      720.0,
      120.0,
      70.0,
      22.0
     ]
    }
   },
   {
    "box": {
     "id": "pp-1",
     "patching_rect": [
      720.0,
      150.0,
      95.0,
      22.0
     ],
     "fontsize": 12.0,
     "maxclass": "newobj",
     "text": "prepend decay",
     "numinlets": 1,
     "numoutlets": 1,
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "lb-2",
     "maxclass": "comment",
     "patching_rect": [
      820.0,
      70.0,
      98.0,
      20.0
     ],
     "text": "release s"
    }
   },
   {
    "box": {
     "id": "lm-2",
     "patching_rect": [
      820.0,
      92.0,
      80.0,
      22.0
     ],
     "fontsize": 12.0,
     "maxclass": "newobj",
     "text": "loadmess 0.4",
     "numinlets": 1,
     "numoutlets": 1,
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "fl-2",
     "maxclass": "flonum",
     "format": 6,
     "minimum": 0.01,
     "maximum": 10.0,
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      "bang"
     ],
     "parameter_enable": 0,
     "patching_rect": [
      820.0,
      120.0,
      70.0,
      22.0
     ]
    }
   },
   {
    "box": {
     "id": "pp-2",
     "patching_rect": [
      820.0,
      150.0,
      95.0,
      22.0
     ],
     "fontsize": 12.0,
     "maxclass": "newobj",
     "text": "prepend release",
     "numinlets": 1,
     "numoutlets": 1,
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "lb-3",
     "maxclass": "comment",
     "patching_rect": [
      920.0,
      70.0,
      98.0,
      20.0
     ],
     "text": "rolloff"
    }
   },
   {
    "box": {
     "id": "lm-3",
     "patching_rect": [
      920.0,
      92.0,
      80.0,
      22.0
     ],
     "fontsize": 12.0,
     "maxclass": "newobj",
     "text": "loadmess 0.7",
     "numinlets": 1,
     "numoutlets": 1,
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "fl-3",
     "maxclass": "flonum",
     "format": 6,
     "minimum": 0.3,
     "maximum": 1.0,
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      "bang"
     ],
     "parameter_enable": 0,
     "patching_rect": [
      920.0,
      120.0,
      70.0,
      22.0
     ]
    }
   },
   {
    "box": {
     "id": "pp-3",
     "patching_rect": [
      920.0,
      150.0,
      95.0,
      22.0
     ],
     "fontsize": 12.0,
     "maxclass": "newobj",
     "text": "prepend rolloff",
     "numinlets": 1,
     "numoutlets": 1,
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "lb-4",
     "maxclass": "comment",
     "patching_rect": [
      1020.0,
      70.0,
      98.0,
      20.0
     ],
     "text": "level"
    }
   },
   {
    "box": {
     "id": "lm-4",
     "patching_rect": [
      1020.0,
      92.0,
      80.0,
      22.0
     ],
     "fontsize": 12.0,
     "maxclass": "newobj",
     "text": "loadmess 0.5",
     "numinlets": 1,
     "numoutlets": 1,
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "fl-4",
     "maxclass": "flonum",
     "format": 6,
     "minimum": 0.0,
     "maximum": 1.0,
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      "bang"
     ],
     "parameter_enable": 0,
     "patching_rect": [
      1020.0,
      120.0,
      70.0,
      22.0
     ]
    }
   },
   {
    "box": {
     "id": "pp-4",
     "patching_rect": [
      1020.0,
      150.0,
      95.0,
      22.0
     ],
     "fontsize": 12.0,
     "maxclass": "newobj",
     "text": "prepend level",
     "numinlets": 1,
     "numoutlets": 1,
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "rnbo",
     "maxclass": "newobj",
     "text": "rnbo~ @title crystal-poly",
     "numinlets": 2,
     "numoutlets": 3,
     "outlettype": [
      "signal",
      "signal",
      "list"
     ],
     "inletInfo": {
      "IOInfo": [
       {
        "type": "midi",
        "index": -1,
        "tag": "",
        "comment": ""
       }
      ]
     },
     "patching_rect": [
      20.0,
      250.0,
      1080.0,
      22.0
     ],
     "rnboattrcache": {},
     "rnboversion": "1.4.0",
     "autosave": 1,
     "saved_object_attributes": {
      "optimization": "O1",
      "parameter_enable": 0
     },
     "varname": "crystal-poly",
     "patcher": {
      "fileversion": 1,
      "appversion": {
       "major": 9,
       "minor": 0,
       "revision": 0,
       "architecture": "x64",
       "modernui": 1
      },
      "classnamespace": "rnbo",
      "rect": [
       100.0,
       100.0,
       820.0,
       300.0
      ],
      "default_fontname": "Lato",
      "gridsize": [
       15.0,
       15.0
      ],
      "title": "crystal-poly",
      "boxes": [
       {
        "box": {
         "id": "pm-0",
         "patching_rect": [
          20.0,
          20.0,
          140.0,
          22.0
         ],
         "fontsize": 12.0,
         "maxclass": "newobj",
         "text": "param crystal 0.0 @min 0.0 @max 8.0",
         "numinlets": 2,
         "numoutlets": 2,
         "outlettype": [
          "",
          ""
         ],
         "rnbo_classname": "param"
        }
       },
       {
        "box": {
         "id": "sg-0",
         "patching_rect": [
          20.0,
          55.0,
          60.0,
          22.0
         ],
         "fontsize": 12.0,
         "maxclass": "newobj",
         "text": "sig~ 0.0",
         "numinlets": 2,
         "numoutlets": 1,
         "outlettype": [
          "signal"
         ],
         "rnbo_classname": "sig~"
        }
       },
       {
        "box": {
         "id": "pm-1",
         "patching_rect": [
          170.0,
          20.0,
          140.0,
          22.0
         ],
         "fontsize": 12.0,
         "maxclass": "newobj",
         "text": "param attack 80.0 @min 1.0 @max 500.0",
         "numinlets": 2,
         "numoutlets": 2,
         "outlettype": [
          "",
          ""
         ],
         "rnbo_classname": "param"
        }
       },
       {
        "box": {
         "id": "sg-1",
         "patching_rect": [
          170.0,
          55.0,
          60.0,
          22.0
         ],
         "fontsize": 12.0,
         "maxclass": "newobj",
         "text": "sig~ 80.0",
         "numinlets": 2,
         "numoutlets": 1,
         "outlettype": [
          "signal"
         ],
         "rnbo_classname": "sig~"
        }
       },
       {
        "box": {
         "id": "pm-2",
         "patching_rect": [
          320.0,
          20.0,
          140.0,
          22.0
         ],
         "fontsize": 12.0,
         "maxclass": "newobj",
         "text": "param decay 5.5 @min 0.1 @max 20.0",
         "numinlets": 2,
         "numoutlets": 2,
         "outlettype": [
          "",
          ""
         ],
         "rnbo_classname": "param"
        }
       },
       {
        "box": {
         "id": "sg-2",
         "patching_rect": [
          320.0,
          55.0,
          60.0,
          22.0
         ],
         "fontsize": 12.0,
         "maxclass": "newobj",
         "text": "sig~ 5.5",
         "numinlets": 2,
         "numoutlets": 1,
         "outlettype": [
          "signal"
         ],
         "rnbo_classname": "sig~"
        }
       },
       {
        "box": {
         "id": "pm-3",
         "patching_rect": [
          470.0,
          20.0,
          140.0,
          22.0
         ],
         "fontsize": 12.0,
         "maxclass": "newobj",
         "text": "param release 0.4 @min 0.01 @max 10.0",
         "numinlets": 2,
         "numoutlets": 2,
         "outlettype": [
          "",
          ""
         ],
         "rnbo_classname": "param"
        }
       },
       {
        "box": {
         "id": "sg-3",
         "patching_rect": [
          470.0,
          55.0,
          60.0,
          22.0
         ],
         "fontsize": 12.0,
         "maxclass": "newobj",
         "text": "sig~ 0.4",
         "numinlets": 2,
         "numoutlets": 1,
         "outlettype": [
          "signal"
         ],
         "rnbo_classname": "sig~"
        }
       },
       {
        "box": {
         "id": "pm-4",
         "patching_rect": [
          620.0,
          20.0,
          140.0,
          22.0
         ],
         "fontsize": 12.0,
         "maxclass": "newobj",
         "text": "param rolloff 0.7 @min 0.3 @max 1.0",
         "numinlets": 2,
         "numoutlets": 2,
         "outlettype": [
          "",
          ""
         ],
         "rnbo_classname": "param"
        }
       },
       {
        "box": {
         "id": "sg-4",
         "patching_rect": [
          620.0,
          55.0,
          60.0,
          22.0
         ],
         "fontsize": 12.0,
         "maxclass": "newobj",
         "text": "sig~ 0.7",
         "numinlets": 2,
         "numoutlets": 1,
         "outlettype": [
          "signal"
         ],
         "rnbo_classname": "sig~"
        }
       },
       {
        "box": {
         "id": "poly",
         "maxclass": "newobj",
         "text": "p @polyphony 8 @title voice",
         "numinlets": 5,
         "numoutlets": 1,
         "outlettype": [
          "signal"
         ],
         "patching_rect": [
          20.0,
          100.0,
          700.0,
          22.0
         ],
         "rnbo_classname": "p",
         "rnbo_extra_attributes": {
          "polyphony": 8.0,
          "voicecontrol": "simple",
          "exposevoiceparams": 0,
          "receivemode": "local",
          "args": []
         },
         "patcher": {
          "fileversion": 1,
          "appversion": {
           "major": 9,
           "minor": 0,
           "revision": 0,
           "architecture": "x64",
           "modernui": 1
          },
          "classnamespace": "rnbo",
          "rect": [
           140.0,
           140.0,
           800.0,
           760.0
          ],
          "default_fontname": "Lato",
          "gridsize": [
           15.0,
           15.0
          ],
          "title": "voice",
          "boxes": [
           {
            "box": {
             "id": "ni",
             "patching_rect": [
              20.0,
              20.0,
              60.0,
              22.0
             ],
             "fontsize": 12.0,
             "maxclass": "newobj",
             "text": "notein",
             "numinlets": 2,
             "numoutlets": 4,
             "outlettype": [
              "",
              "",
              "",
              ""
             ],
             "rnbo_classname": "notein"
            }
           },
           {
            "box": {
             "id": "mtof",
             "patching_rect": [
              20.0,
              55.0,
              45.0,
              22.0
             ],
             "fontsize": 12.0,
             "maxclass": "newobj",
             "text": "mtof",
             "numinlets": 2,
             "numoutlets": 1,
             "outlettype": [
              ""
             ],
             "rnbo_classname": "mtof"
            }
           },
           {
            "box": {
             "id": "vn",
             "patching_rect": [
              120.0,
              55.0,
              50.0,
              22.0
             ],
             "fontsize": 12.0,
             "maxclass": "newobj",
             "text": "/ 127.",
             "numinlets": 2,
             "numoutlets": 1,
             "outlettype": [
              ""
             ],
             "rnbo_classname": "/"
            }
           },
           {
            "box": {
             "id": "sp",
             "patching_rect": [
              20.0,
              90.0,
              40.0,
              22.0
             ],
             "fontsize": 12.0,
             "maxclass": "newobj",
             "text": "sig~",
             "numinlets": 2,
             "numoutlets": 1,
             "outlettype": [
              "signal"
             ],
             "rnbo_classname": "sig~"
            }
           },
           {
            "box": {
             "id": "sv",
             "patching_rect": [
              120.0,
              90.0,
              40.0,
              22.0
             ],
             "fontsize": 12.0,
             "maxclass": "newobj",
             "text": "sig~",
             "numinlets": 2,
             "numoutlets": 1,
             "outlettype": [
              "signal"
             ],
             "rnbo_classname": "sig~"
            }
           },
           {
            "box": {
             "id": "vin-0",
             "patching_rect": [
              220.0,
              90.0,
              45.0,
              22.0
             ],
             "fontsize": 12.0,
             "maxclass": "newobj",
             "text": "in~ 1",
             "numinlets": 0,
             "numoutlets": 1,
             "outlettype": [
              "signal"
             ],
             "rnbo_classname": "in~",
             "rnbo_extra_attributes": {
              "comment": "crystal",
              "meta": ""
             }
            }
           },
           {
            "box": {
             "id": "vin-1",
             "patching_rect": [
              310.0,
              90.0,
              45.0,
              22.0
             ],
             "fontsize": 12.0,
             "maxclass": "newobj",
             "text": "in~ 2",
             "numinlets": 0,
             "numoutlets": 1,
             "outlettype": [
              "signal"
             ],
             "rnbo_classname": "in~",
             "rnbo_extra_attributes": {
              "comment": "attack",
              "meta": ""
             }
            }
           },
           {
            "box": {
             "id": "vin-2",
             "patching_rect": [
              400.0,
              90.0,
              45.0,
              22.0
             ],
             "fontsize": 12.0,
             "maxclass": "newobj",
             "text": "in~ 3",
             "numinlets": 0,
             "numoutlets": 1,
             "outlettype": [
              "signal"
             ],
             "rnbo_classname": "in~",
             "rnbo_extra_attributes": {
              "comment": "decay",
              "meta": ""
             }
            }
           },
           {
            "box": {
             "id": "vin-3",
             "patching_rect": [
              490.0,
              90.0,
              45.0,
              22.0
             ],
             "fontsize": 12.0,
             "maxclass": "newobj",
             "text": "in~ 4",
             "numinlets": 0,
             "numoutlets": 1,
             "outlettype": [
              "signal"
             ],
             "rnbo_classname": "in~",
             "rnbo_extra_attributes": {
              "comment": "release",
              "meta": ""
             }
            }
           },
           {
            "box": {
             "id": "vin-4",
             "patching_rect": [
              580.0,
              90.0,
              45.0,
              22.0
             ],
             "fontsize": 12.0,
             "maxclass": "newobj",
             "text": "in~ 5",
             "numinlets": 0,
             "numoutlets": 1,
             "outlettype": [
              "signal"
             ],
             "rnbo_classname": "in~",
             "rnbo_extra_attributes": {
              "comment": "rolloff",
              "meta": ""
             }
            }
           },
           {
            "box": {
             "id": "cb",
             "maxclass": "codebox~",
             "code": "// =============================================================================\r\n// crystal-voice.codebox \u2014 ONE voice of the polyphonic crystal\r\n// (Crystal Synthesizer, plan move \"take it on the road\")\r\n//\r\n// This is crystal-bank.codebox (the monophonic playable crystal) with exactly\r\n// two changes, so every voice is still the proofs' strike:\r\n//   1. The controls arrive as signals (in3..in7) instead of @params. They live\r\n//      as [param] objects at the top of the rnbo~ patcher, outside the voices,\r\n//      so the device has ONE \"crystal\" knob, not one per voice, and its name\r\n//      survives export (M4L / VST / H90) unchanged.\r\n//   2. out2 reports \"this voice has gone silent\" (key up and the release has\r\n//      run out). [edge~] turns that into a bang for [voice], which mutes the\r\n//      voice and hands it back to RNBO's voice allocator.\r\n// Level is applied once, after the voices are summed: [*~ 0.3] for headroom\r\n// (eight full-velocity notes peak near 0.93 at level 0.5), then [*~ level].\r\n//\r\n// UNVERIFIED IN MAX: checked in Node (check_poly.py) against the mono codebox\r\n// and the proofs; nobody has compiled it in RNBO.\r\n//\r\n// PATCHER WIRING (inside [p @polyphony 8 @title voice] \u2014 crystal-poly.maxpat has it):\r\n//   [notein] pitch -> [mtof] -> [sig~] -> codebox in1     pitch, Hz\r\n//   [notein] vel   -> [/ 127.] -> [sig~] -> codebox in2   velocity 0..1 (0 = key up)\r\n//   [in~ 1..5] -> codebox in3..in7   crystal, attack ms, decay s, release s, rolloff\r\n//   codebox out1 -> [out~ 1]          the voice's sound (RNBO sums the voices)\r\n//   codebox out2 -> [edge~] -> [voice] right inlet   mute when silent\r\n// =============================================================================\r\n\r\nconst NMAX = 9;\r\nconst TWOPI = 6.283185307179586;\r\n\r\n@state ph = new FixedDoubleArray(9);     // per-mode phase, cycles\r\n@state env = new FixedDoubleArray(9);    // per-mode decay envelope\r\n@state sinceOn = 0;                      // samples since the strike\r\n@state relEnv = 0.0;                     // 1 while held, falls after key up\r\n@state held = 0;\r\n@state vel = 0.0;\r\n@state noteHz = 0.0;                     // last pitch asked for\r\n@state voiceHz = 0.0;                    // pitch actually sounding\r\n@state prevGate = 0.0;\r\n@state steal = 0;                        // samples left in the 3 ms fade before a restrike\r\n@state stealN = 1;\r\n@state pendHz = 0.0;\r\n@state pendVel = 0.0;\r\n\r\n// Phase seeds: numpy default_rng(7 + k).uniform(0, 1), the proofs' own seeds.\r\nfunction seed(k) {\r\n    if (k == 0) return 0.625095466604667;\r\n    if (k == 1) return 0.3269722766055607;\r\n    if (k == 2) return 0.8702492039700847;\r\n    if (k == 3) return 0.9560017096289753;\r\n    if (k == 4) return 0.12857020276919962;\r\n    if (k == 5) return 0.2508244581084461;\r\n    if (k == 6) return 0.8647975870165865;\r\n    if (k == 7) return 0.8309833188891115;\r\n    return 0.6927433679651523;\r\n}\r\n\r\n// Mode k of crystal c, as a ratio over the played pitch. 0 means \"no mode\".\r\n// Ratios from Crystal Sonification Reference (palette) and\r\n// session-1-implementation.md (the two hypothesis lattices).\r\nfunction ratio(c, k) {\r\n    if (c == 0) {          // Diamond\r\n        if (k == 0) return 1.00; if (k == 1) return 1.32; if (k == 2) return 1.48;\r\n        if (k == 3) return 1.57; if (k == 4) return 1.65; return 0.0;\r\n    }\r\n    if (c == 1) {          // Fluorite \u2014 two modes share 1.00; the lone LO sits at 2.48\r\n        if (k == 0) return 1.00; if (k == 1) return 1.00; if (k == 2) return 1.35;\r\n        if (k == 3) return 1.47; if (k == 4) return 1.69; if (k == 5) return 2.48; return 0.0;\r\n    }\r\n    if (c == 2) {          // Tetragonal \u2014 hypothesis\r\n        if (k == 0) return 1.00; if (k == 1) return 1.28; if (k == 2) return 1.41;\r\n        if (k == 3) return 1.70; if (k == 4) return 1.85; if (k == 5) return 2.00; return 0.0;\r\n    }\r\n    if (c == 3) {          // Emerald \u2014 ring-breathing mode at 1.68\r\n        if (k == 0) return 1.00; if (k == 1) return 1.23; if (k == 2) return 1.47;\r\n        if (k == 3) return 1.68; if (k == 4) return 2.13; if (k == 5) return 2.30;\r\n        if (k == 6) return 3.33; return 0.0;\r\n    }\r\n    if (c == 4) {          // Ruby \u2014 the 1.10 / 1.14 doublet beats\r\n        if (k == 0) return 1.00; if (k == 1) return 1.10; if (k == 2) return 1.14;\r\n        if (k == 3) return 1.19; if (k == 4) return 1.52; if (k == 5) return 1.70;\r\n        if (k == 6) return 1.98; return 0.0;\r\n    }\r\n    if (c == 5) {          // Amethyst \u2014 three families, soft mode at 1.62\r\n        if (k == 0) return 1.00; if (k == 1) return 1.62; if (k == 2) return 2.07;\r\n        if (k == 3) return 2.77; if (k == 4) return 3.13; if (k == 5) return 3.63;\r\n        if (k == 6) return 5.45; if (k == 7) return 6.21; return 8.32;\r\n    }\r\n    if (c == 6) {          // Topaz \u2014 eight modes, evenly spread\r\n        if (k == 0) return 1.00; if (k == 1) return 1.45; if (k == 2) return 1.91;\r\n        if (k == 3) return 2.37; if (k == 4) return 2.96; if (k == 5) return 3.68;\r\n        if (k == 6) return 4.80; if (k == 7) return 6.05; return 0.0;\r\n    }\r\n    if (c == 7) {          // Monoclinic \u2014 hypothesis\r\n        if (k == 0) return 1.00; if (k == 1) return 1.37; if (k == 2) return 1.71;\r\n        if (k == 3) return 1.94; if (k == 4) return 2.23; if (k == 5) return 2.61; return 0.0;\r\n    }\r\n    // 8 Labradorite \u2014 four octaves, no organising ratio\r\n    if (k == 0) return 1.00; if (k == 1) return 1.83; if (k == 2) return 3.17;\r\n    if (k == 3) return 4.67; if (k == 4) return 7.00; if (k == 5) return 9.50;\r\n    if (k == 6) return 13.3; if (k == 7) return 17.5; return 0.0;\r\n}\r\n\r\nlet hz = in1;\r\nlet gate = in2;\r\nlet crystal = in3;\r\nlet attack = in4;\r\nlet decay = max(0.1, in5);\r\nlet release = max(0.01, in6);\r\nlet rolloff = in7;\r\n\r\n// Strike on key down, and on a new pitch while a key is still down (legato\r\n// playing from a mono keyboard sends the new pitch without a key-up between).\r\n// If the old note is still ringing, fade it out over 3 ms first and strike\r\n// after, so a restrike never cuts a sounding wave to zero (that was a click).\r\nif (gate > 0.0001 && (prevGate <= 0.0001 || abs(hz - noteHz) > noteHz * 0.005)) {\r\n    pendHz = hz;\r\n    pendVel = gate;\r\n    noteHz = hz;\r\n    held = 1;\r\n    if (relEnv > 0.0001 && sinceOn > 0) {\r\n        stealN = max(1, floor(0.003 * samplerate));\r\n        steal = stealN;\r\n    } else {\r\n        steal = 0;\r\n        sinceOn = -1;                    // marks \"strike now\", below\r\n    }\r\n}\r\nif (steal > 0) {\r\n    steal -= 1;\r\n    if (steal == 0) sinceOn = -1;\r\n}\r\nif (sinceOn < 0) {\r\n    for (let k = 0; k < NMAX; k++) {\r\n        ph[k] = seed(k);\r\n        env[k] = 1.0;\r\n    }\r\n    sinceOn = 0;\r\n    relEnv = 1.0;\r\n    vel = pendVel;\r\n    voiceHz = pendHz;\r\n}\r\nif (gate <= 0.0001 && prevGate > 0.0001) {\r\n    held = 0;\r\n}\r\nprevGate = gate;\r\n\r\nlet c = clamp(floor(crystal + 0.5), 0, 8);\r\nlet attackN = floor(attack * 0.001 * samplerate);\r\nlet atk = 1.0;\r\nif (attackN > 1) atk = min(1.0, sinceOn / (attackN - 1));\r\n\r\nlet sum = 0.0;\r\nlet amp = 1.0;\r\nfor (let k = 0; k < NMAX; k++) {\r\n    let r = ratio(c, k);\r\n    let tau = decay / (1.0 + 0.15 * k);\r\n    if (r > 0.0) {\r\n        let f = voiceHz * r;\r\n        if (f < samplerate * 0.45) {\r\n            sum += amp * env[k] * sin(TWOPI * ph[k]);\r\n            amp *= rolloff;\r\n        }\r\n        ph[k] += f / samplerate;\r\n        if (ph[k] >= 1.0) ph[k] -= floor(ph[k]);\r\n    }\r\n    env[k] *= exp(-1.0 / (tau * samplerate));\r\n}\r\n\r\nlet fade = 1.0;\r\nif (steal > 0) fade = steal / stealN;\r\nlet y = sum * atk * relEnv * vel * 0.6 * fade;\r\nif (held == 0) {\r\n    relEnv *= exp(-1.0 / (release * samplerate));\r\n    // Poly change: call the voice silent at -80 dB, judged on the slowest mode\r\n    // (env[0]; every higher mode dies faster), so a released voice hands\r\n    // itself back to the allocator in about a second instead of twenty.\r\n    if (relEnv < 0.000001 || relEnv * env[0] < 0.0001) relEnv = 0.0;\r\n}\r\nsinceOn += 1;\r\n\r\nout1 = y;\r\n// silent: key up, release run out, nothing pending. 1 here mutes the voice.\r\nlet silent = 0.0;\r\nif (held == 0 && relEnv == 0.0 && steal == 0) silent = 1.0;\r\nout2 = silent;\r\n",
             "fontname": "<Monospaced>",
             "fontsize": 12.0,
             "numinlets": 7,
             "numoutlets": 2,
             "outlettype": [
              "signal",
              "signal"
             ],
             "patching_rect": [
              20.0,
              130.0,
              720.0,
              520.0
             ],
             "rnbo_classname": "codebox~"
            }
           },
           {
            "box": {
             "id": "vout",
             "patching_rect": [
              20.0,
              670.0,
              45.0,
              22.0
             ],
             "fontsize": 12.0,
             "maxclass": "newobj",
             "text": "out~ 1",
             "numinlets": 1,
             "numoutlets": 0,
             "outlettype": [],
             "rnbo_classname": "out~",
             "rnbo_extra_attributes": {
              "comment": "voice",
              "meta": ""
             }
            }
           },
           {
            "box": {
             "id": "edge",
             "patching_rect": [
              380.0,
              670.0,
              50.0,
              22.0
             ],
             "fontsize": 12.0,
             "maxclass": "newobj",
             "text": "edge~",
             "numinlets": 1,
             "numoutlets": 2,
             "outlettype": [
              "bang",
              "bang"
             ],
             "rnbo_classname": "edge~"
            }
           },
           {
            "box": {
             "id": "voice",
             "patching_rect": [
              380.0,
              705.0,
              50.0,
              22.0
             ],
             "fontsize": 12.0,
             "maxclass": "newobj",
             "text": "voice",
             "numinlets": 2,
             "numoutlets": 4,
             "outlettype": [
              "",
              "",
              "",
              ""
             ],
             "rnbo_classname": "voice"
            }
           },
           {
            "box": {
             "id": "vc",
             "maxclass": "comment",
             "patching_rect": [
              440.0,
              670.0,
              300.0,
              20.0
             ],
             "text": "out2 = 1 when the voice has gone silent -> mute it"
            }
           }
          ],
          "lines": [
           {
            "patchline": {
             "source": [
              "ni",
              0
             ],
             "destination": [
              "mtof",
              0
             ]
            }
           },
           {
            "patchline": {
             "source": [
              "ni",
              1
             ],
             "destination": [
              "vn",
              0
             ]
            }
           },
           {
            "patchline": {
             "source": [
              "mtof",
              0
             ],
             "destination": [
              "sp",
              0
             ]
            }
           },
           {
            "patchline": {
             "source": [
              "vn",
              0
             ],
             "destination": [
              "sv",
              0
             ]
            }
           },
           {
            "patchline": {
             "source": [
              "sp",
              0
             ],
             "destination": [
              "cb",
              0
             ]
            }
           },
           {
            "patchline": {
             "source": [
              "sv",
              0
             ],
             "destination": [
              "cb",
              1
             ]
            }
           },
           {
            "patchline": {
             "source": [
              "vin-0",
              0
             ],
             "destination": [
              "cb",
              2
             ]
            }
           },
           {
            "patchline": {
             "source": [
              "vin-1",
              0
             ],
             "destination": [
              "cb",
              3
             ]
            }
           },
           {
            "patchline": {
             "source": [
              "vin-2",
              0
             ],
             "destination": [
              "cb",
              4
             ]
            }
           },
           {
            "patchline": {
             "source": [
              "vin-3",
              0
             ],
             "destination": [
              "cb",
              5
             ]
            }
           },
           {
            "patchline": {
             "source": [
              "vin-4",
              0
             ],
             "destination": [
              "cb",
              6
             ]
            }
           },
           {
            "patchline": {
             "source": [
              "cb",
              0
             ],
             "destination": [
              "vout",
              0
             ]
            }
           },
           {
            "patchline": {
             "source": [
              "cb",
              1
             ],
             "destination": [
              "edge",
              0
             ]
            }
           },
           {
            "patchline": {
             "source": [
              "edge",
              0
             ],
             "destination": [
              "voice",
              1
             ]
            }
           }
          ]
         }
        }
       },
       {
        "box": {
         "id": "mix",
         "patching_rect": [
          20.0,
          140.0,
          60.0,
          22.0
         ],
         "fontsize": 12.0,
         "maxclass": "newobj",
         "text": "*~ 0.3",
         "numinlets": 2,
         "numoutlets": 1,
         "outlettype": [
          "signal"
         ],
         "rnbo_classname": "*~"
        }
       },
       {
        "box": {
         "id": "pl",
         "patching_rect": [
          200.0,
          140.0,
          160.0,
          22.0
         ],
         "fontsize": 12.0,
         "maxclass": "newobj",
         "text": "param level 0.5 @min 0.0 @max 1.0",
         "numinlets": 2,
         "numoutlets": 2,
         "outlettype": [
          "",
          ""
         ],
         "rnbo_classname": "param"
        }
       },
       {
        "box": {
         "id": "lv",
         "patching_rect": [
          20.0,
          175.0,
          60.0,
          22.0
         ],
         "fontsize": 12.0,
         "maxclass": "newobj",
         "text": "*~ 0.5",
         "numinlets": 2,
         "numoutlets": 1,
         "outlettype": [
          "signal"
         ],
         "rnbo_classname": "*~"
        }
       },
       {
        "box": {
         "id": "o1",
         "patching_rect": [
          20.0,
          215.0,
          45.0,
          22.0
         ],
         "fontsize": 12.0,
         "maxclass": "newobj",
         "text": "out~ 1",
         "numinlets": 1,
         "numoutlets": 0,
         "outlettype": [],
         "rnbo_classname": "out~",
         "rnbo_extra_attributes": {
          "comment": "left",
          "meta": ""
         }
        }
       },
       {
        "box": {
         "id": "o2",
         "patching_rect": [
          120.0,
          215.0,
          45.0,
          22.0
         ],
         "fontsize": 12.0,
         "maxclass": "newobj",
         "text": "out~ 2",
         "numinlets": 1,
         "numoutlets": 0,
         "outlettype": [],
         "rnbo_classname": "out~",
         "rnbo_extra_attributes": {
          "comment": "right",
          "meta": ""
         }
        }
       }
      ],
      "lines": [
       {
        "patchline": {
         "source": [
          "pm-0",
          0
         ],
         "destination": [
          "sg-0",
          0
         ]
        }
       },
       {
        "patchline": {
         "source": [
          "sg-0",
          0
         ],
         "destination": [
          "poly",
          0
         ]
        }
       },
       {
        "patchline": {
         "source": [
          "pm-1",
          0
         ],
         "destination": [
          "sg-1",
          0
         ]
        }
       },
       {
        "patchline": {
         "source": [
          "sg-1",
          0
         ],
         "destination": [
          "poly",
          1
         ]
        }
       },
       {
        "patchline": {
         "source": [
          "pm-2",
          0
         ],
         "destination": [
          "sg-2",
          0
         ]
        }
       },
       {
        "patchline": {
         "source": [
          "sg-2",
          0
         ],
         "destination": [
          "poly",
          2
         ]
        }
       },
       {
        "patchline": {
         "source": [
          "pm-3",
          0
         ],
         "destination": [
          "sg-3",
          0
         ]
        }
       },
       {
        "patchline": {
         "source": [
          "sg-3",
          0
         ],
         "destination": [
          "poly",
          3
         ]
        }
       },
       {
        "patchline": {
         "source": [
          "pm-4",
          0
         ],
         "destination": [
          "sg-4",
          0
         ]
        }
       },
       {
        "patchline": {
         "source": [
          "sg-4",
          0
         ],
         "destination": [
          "poly",
          4
         ]
        }
       },
       {
        "patchline": {
         "source": [
          "poly",
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
          "mix",
          0
         ],
         "destination": [
          "lv",
          0
         ]
        }
       },
       {
        "patchline": {
         "source": [
          "pl",
          0
         ],
         "destination": [
          "lv",
          1
         ]
        }
       },
       {
        "patchline": {
         "source": [
          "lv",
          0
         ],
         "destination": [
          "o1",
          0
         ]
        }
       },
       {
        "patchline": {
         "source": [
          "lv",
          0
         ],
         "destination": [
          "o2",
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
     "id": "dac",
     "maxclass": "ezdac~",
     "numinlets": 2,
     "numoutlets": 0,
     "patching_rect": [
      20.0,
      300.0,
      45.0,
      45.0
     ]
    }
   }
  ],
  "lines": [
   {
    "patchline": {
     "source": [
      "kb",
      0
     ],
     "destination": [
      "mk",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "kb",
      1
     ],
     "destination": [
      "mk",
      1
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "mk",
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
      "mk",
      1
     ],
     "destination": [
      "pk",
      1
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
      "mf",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "mf",
      0
     ],
     "destination": [
      "rnbo",
      1
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "mi",
      0
     ],
     "destination": [
      "rnbo",
      1
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "mlm",
      0
     ],
     "destination": [
      "menu",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "menu",
      0
     ],
     "destination": [
      "mpp",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "mpp",
      0
     ],
     "destination": [
      "rnbo",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "lm-0",
      0
     ],
     "destination": [
      "fl-0",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "fl-0",
      0
     ],
     "destination": [
      "pp-0",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "pp-0",
      0
     ],
     "destination": [
      "rnbo",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "lm-1",
      0
     ],
     "destination": [
      "fl-1",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "fl-1",
      0
     ],
     "destination": [
      "pp-1",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "pp-1",
      0
     ],
     "destination": [
      "rnbo",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "lm-2",
      0
     ],
     "destination": [
      "fl-2",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "fl-2",
      0
     ],
     "destination": [
      "pp-2",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "pp-2",
      0
     ],
     "destination": [
      "rnbo",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "lm-3",
      0
     ],
     "destination": [
      "fl-3",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "fl-3",
      0
     ],
     "destination": [
      "pp-3",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "pp-3",
      0
     ],
     "destination": [
      "rnbo",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "lm-4",
      0
     ],
     "destination": [
      "fl-4",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "fl-4",
      0
     ],
     "destination": [
      "pp-4",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "pp-4",
      0
     ],
     "destination": [
      "rnbo",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "rnbo",
      0
     ],
     "destination": [
      "dac",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "rnbo",
      1
     ],
     "destination": [
      "dac",
      1
     ]
    }
   }
  ]
 }
}