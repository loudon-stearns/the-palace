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
     "text": "Crystal Synthesizer, ringing: each mode a resonator whose ring time is the crystal's Raman line width. Turn on the dac, pick a crystal, strike.",
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
     "text": "lifetime 1 = the physics: Diamond rings for seconds, most of the rest knock. Raise lifetime to hear them as bells; the order of who outlasts whom stays."
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
     "text": "hardness ms"
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
     "text": "loadmess 1.0",
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
     "minimum": 0.05,
     "maximum": 50.0,
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
     "text": "prepend hardness",
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
     "text": "lifetime x"
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
     "text": "loadmess 1.0",
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
     "minimum": 0.05,
     "maximum": 50.0,
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
     "text": "prepend lifetime",
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
     "text": "loadmess 8.0",
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
     "text": "rnbo~ @title crystal-rings",
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
     "varname": "crystal-rings",
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
      "title": "crystal-rings",
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
         "text": "param hardness 1.0 @min 0.05 @max 50.0",
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
         "text": "sig~ 1.0",
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
         "text": "param lifetime 1.0 @min 0.05 @max 50.0",
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
         "text": "sig~ 1.0",
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
         "text": "param release 8.0 @min 0.01 @max 10.0",
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
         "text": "sig~ 8.0",
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
              "comment": "hardness",
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
              "comment": "lifetime",
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
             "code": "// =============================================================================\r\n// crystal-ring-voice.codebox \u2014 ONE voice of the ringing crystal\r\n// (Crystal Synthesizer, plan move \"let the crystal ring\")\r\n//\r\n// The earlier voices (../crystal-on-the-road/crystal-voice.codebox) ADD sine\r\n// waves and give each one a decay chosen by taste: decay / (1 + 0.15 k). Here\r\n// nothing is added. Each phonon mode is a resonator \u2014 a two-pole filter tuned\r\n// to the mode \u2014 and the note is a strike: a short raised-cosine pulse that\r\n// knocks every resonator at once. How long a mode rings is set by physics:\r\n//\r\n//     Q   = Raman line position / Raman line width      (no units)\r\n//     tau = Q / (pi * f)                                (seconds, to 1/e)\r\n//\r\n// Because Q has no units it survives the move from terahertz to audio: a mode\r\n// rings for about Q/pi cycles whatever pitch it is played at. Q values and\r\n// their sources are in linewidths.json (two measured, the rest estimated).\r\n//\r\n// Controls (in3..in7, from [param]s outside the voices, as in the poly patch):\r\n//   crystal   0..8   the nine-slot menu, same order as the playable crystal\r\n//   hardness  ms     how long the strike pulse is: short = bright, long = soft\r\n//   lifetime  x      multiplies every Q. 1 = the physics; >1 slows the decay\r\n//                    without changing which modes outlast which\r\n//   release   s      a damper after key up (default 8 s: barely touches it)\r\n//   rolloff          strike amplitude from one mode to the next (0.70 as in\r\n//                    the proofs, so the ring and the strike stay comparable)\r\n// out1 = sound, out2 = 1 once the voice is silent (-> [edge~] -> [voice]).\r\n//\r\n// UNVERIFIED IN MAX: checked in Node (check_rings.py) against a numpy\r\n// reference of the same filters; nobody has compiled it in RNBO.\r\n// =============================================================================\r\n\r\nconst NMAX = 9;\r\nconst TWOPI = 6.283185307179586;\r\nconst MPI = 3.141592653589793;\r\n\r\n@state y1 = new FixedDoubleArray(9);     // resonator memory, one sample back\r\n@state y2 = new FixedDoubleArray(9);     // two samples back\r\n@state a1 = new FixedDoubleArray(9);     // 2 R cos(w)\r\n@state a2 = new FixedDoubleArray(9);     // R^2\r\n@state b0 = new FixedDoubleArray(9);     // input gain: rolloff^k * sin(w)\r\n@state rr = new FixedDoubleArray(9);     // R, per sample amplitude decay\r\n@state envk = new FixedDoubleArray(9);   // each mode's expected amplitude, for \"is it silent\"\r\n@state lastC = -1;\r\n@state lastHz = -1.0;\r\n@state lastLife = -1.0;\r\n@state lastRoll = -1.0;\r\n@state pulseN = 0;                       // strike pulse length, samples\r\n@state pulseI = 0;                       // where we are in it (pulseN = done)\r\n@state relEnv = 0.0;\r\n@state held = 0;\r\n@state vel = 0.0;\r\n@state noteHz = 0.0;\r\n@state voiceHz = 0.0;\r\n@state prevGate = 0.0;\r\n@state steal = 0;\r\n@state stealN = 1;\r\n@state pendHz = 0.0;\r\n@state pendVel = 0.0;\r\n@state ringing = 0;\r\n\r\n// Mode ratios \u2014 identical to the playable crystal and the proofs.\r\nfunction ratio(c, k) {\r\n    if (c == 0) {          // Diamond\r\n        if (k == 0) return 1.00; if (k == 1) return 1.32; if (k == 2) return 1.48;\r\n        if (k == 3) return 1.57; if (k == 4) return 1.65; return 0.0;\r\n    }\r\n    if (c == 1) {          // Fluorite\r\n        if (k == 0) return 1.00; if (k == 1) return 1.00; if (k == 2) return 1.35;\r\n        if (k == 3) return 1.47; if (k == 4) return 1.69; if (k == 5) return 2.48; return 0.0;\r\n    }\r\n    if (c == 2) {          // Tetragonal \u2014 hypothesis\r\n        if (k == 0) return 1.00; if (k == 1) return 1.28; if (k == 2) return 1.41;\r\n        if (k == 3) return 1.70; if (k == 4) return 1.85; if (k == 5) return 2.00; return 0.0;\r\n    }\r\n    if (c == 3) {          // Emerald\r\n        if (k == 0) return 1.00; if (k == 1) return 1.23; if (k == 2) return 1.47;\r\n        if (k == 3) return 1.68; if (k == 4) return 2.13; if (k == 5) return 2.30;\r\n        if (k == 6) return 3.33; return 0.0;\r\n    }\r\n    if (c == 4) {          // Ruby\r\n        if (k == 0) return 1.00; if (k == 1) return 1.10; if (k == 2) return 1.14;\r\n        if (k == 3) return 1.19; if (k == 4) return 1.52; if (k == 5) return 1.70;\r\n        if (k == 6) return 1.98; return 0.0;\r\n    }\r\n    if (c == 5) {          // Amethyst\r\n        if (k == 0) return 1.00; if (k == 1) return 1.62; if (k == 2) return 2.07;\r\n        if (k == 3) return 2.77; if (k == 4) return 3.13; if (k == 5) return 3.63;\r\n        if (k == 6) return 5.45; if (k == 7) return 6.21; return 8.32;\r\n    }\r\n    if (c == 6) {          // Topaz\r\n        if (k == 0) return 1.00; if (k == 1) return 1.45; if (k == 2) return 1.91;\r\n        if (k == 3) return 2.37; if (k == 4) return 2.96; if (k == 5) return 3.68;\r\n        if (k == 6) return 4.80; if (k == 7) return 6.05; return 0.0;\r\n    }\r\n    if (c == 7) {          // Monoclinic \u2014 hypothesis\r\n        if (k == 0) return 1.00; if (k == 1) return 1.37; if (k == 2) return 1.71;\r\n        if (k == 3) return 1.94; if (k == 4) return 2.23; if (k == 5) return 2.61; return 0.0;\r\n    }\r\n    if (k == 0) return 1.00; if (k == 1) return 1.83; if (k == 2) return 3.17;\r\n    if (k == 3) return 4.67; if (k == 4) return 7.00; if (k == 5) return 9.50;\r\n    if (k == 6) return 13.3; if (k == 7) return 17.5; return 0.0;\r\n}\r\n\r\n// Q of mode k of crystal c: Raman line position / line width (linewidths.json).\r\nfunction qual(c, k) {\r\n    if (c == 0) return 807.0;              // Diamond 1332 / 1.65   measured\r\n    if (c == 1) return 27.0;               // Fluorite 323 / 12      measured (powder; likely too wide)\r\n    if (c == 3) return 57.0;               // Emerald 686 / 12       estimated\r\n    if (c == 4) return 120.0;              // Ruby 418 / 3.5         estimated\r\n    if (c == 5) {                          // Amethyst 464 / 7.5     measured\r\n        if (k == 1) return 17.0;           //   soft mode 207 / 12   estimated\r\n        return 62.0;\r\n    }\r\n    if (c == 6) return 58.0;               // Topaz 404 / 7          estimated\r\n    if (c == 8) return 30.0;               // Labradorite 508 / 17   estimated\r\n    return 100.0;                          // the two hypothesis slots: placeholder\r\n}\r\n\r\nlet hz = in1;\r\nlet gate = in2;\r\nlet crystal = in3;\r\nlet hardness = clamp(in4, 0.05, 50.0);\r\nlet lifetime = clamp(in5, 0.05, 50.0);\r\nlet release = max(0.01, in6);\r\nlet rolloff = in7;\r\n\r\n// Key down (or a new pitch while held): if the voice is still ringing, fade it\r\n// over 3 ms, clear the filters, then strike \u2014 retuning a filter that is still\r\n// ringing jumps its output, which is a click.\r\nlet strikeNow = 0;\r\nif (gate > 0.0001 && (prevGate <= 0.0001 || abs(hz - noteHz) > noteHz * 0.005)) {\r\n    pendHz = hz;\r\n    pendVel = gate;\r\n    noteHz = hz;\r\n    held = 1;\r\n    if (ringing == 1) {\r\n        stealN = max(1, floor(0.003 * samplerate));\r\n        steal = stealN;\r\n    } else {\r\n        steal = 0;\r\n        strikeNow = 1;\r\n    }\r\n}\r\nif (steal > 0) {\r\n    steal -= 1;\r\n    if (steal == 0) strikeNow = 1;\r\n}\r\nif (gate <= 0.0001 && prevGate > 0.0001) held = 0;\r\nprevGate = gate;\r\n\r\nlet c = clamp(floor(crystal + 0.5), 0, 8);\r\n\r\nif (strikeNow == 1) {\r\n    for (let k = 0; k < NMAX; k++) {\r\n        y1[k] = 0.0;\r\n        y2[k] = 0.0;\r\n    }\r\n    voiceHz = pendHz;\r\n    vel = pendVel;\r\n    relEnv = 1.0;\r\n    pulseN = max(1, floor(hardness * 0.001 * samplerate));\r\n    pulseI = 0;\r\n    ringing = 1;\r\n    lastHz = -1.0;                       // force the coefficients below\r\n}\r\n\r\n// Coefficients, only when something they depend on moved.\r\nif (c != lastC || voiceHz != lastHz || lifetime != lastLife || rolloff != lastRoll) {\r\n    let amp = 1.0;\r\n    for (let k = 0; k < NMAX; k++) {\r\n        let r = ratio(c, k);\r\n        let f = voiceHz * r;\r\n        if (r > 0.0 && f < samplerate * 0.45 && f > 0.0) {\r\n            let w = TWOPI * f / samplerate;\r\n            let R = exp(-MPI * f / (qual(c, k) * lifetime * samplerate));\r\n            a1[k] = 2.0 * R * cos(w);\r\n            a2[k] = R * R;\r\n            b0[k] = amp * sin(w);\r\n            rr[k] = R;\r\n            amp *= rolloff;\r\n        } else {\r\n            a1[k] = 0.0; a2[k] = 0.0; b0[k] = 0.0; rr[k] = 0.0;\r\n        }\r\n    }\r\n    if (strikeNow == 1 || c != lastC) {\r\n        let am = 1.0;\r\n        for (let k = 0; k < NMAX; k++) {\r\n            if (b0[k] != 0.0) { envk[k] = am; am *= rolloff; } else envk[k] = 0.0;\r\n        }\r\n    }\r\n    lastC = c; lastHz = voiceHz; lastLife = lifetime; lastRoll = rolloff;\r\n}\r\n\r\n// The strike: a raised-cosine pulse with area 1 (so a slow mode sees a unit\r\n// knock whatever the hardness; fast modes see less when the pulse is long).\r\nlet x = 0.0;\r\nif (pulseI < pulseN) {\r\n    x = (1.0 - cos(TWOPI * (pulseI + 0.5) / pulseN)) / pulseN;\r\n    pulseI += 1;\r\n}\r\n\r\nlet sum = 0.0;\r\nlet loud = 0.0;\r\nfor (let k = 0; k < NMAX; k++) {\r\n    let y = b0[k] * x + a1[k] * y1[k] - a2[k] * y2[k];\r\n    y2[k] = y1[k];\r\n    y1[k] = y;\r\n    sum += y;\r\n    envk[k] *= rr[k];\r\n    loud = max(loud, envk[k]);\r\n}\r\n\r\nlet fade = 1.0;\r\nif (steal > 0) fade = steal / stealN;\r\nlet yout = sum * vel * relEnv * 0.3 * fade;   // 0.3: the modes start in phase, so eight full strikes stack\r\nif (held == 0) relEnv *= exp(-1.0 / (release * samplerate));\r\n\r\n// The ring is over at -80 dB: the strike has finished and the loudest mode,\r\n// damper included, has fallen below 1e-4. The voice reports silent only once\r\n// the key is also up, so RNBO never hands a held key's voice to another note\r\n// (a key still down would otherwise never see the key-down edge it needs).\r\nif (ringing == 1 && pulseI >= pulseN && steal == 0 && loud * relEnv < 0.0001) {\r\n    ringing = 0;\r\n    for (let k = 0; k < NMAX; k++) { y1[k] = 0.0; y2[k] = 0.0; }\r\n}\r\nout1 = yout;\r\nlet silent = 0.0;\r\nif (ringing == 0 && steal == 0 && held == 0) silent = 1.0;\r\nout2 = silent;\r\n",
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