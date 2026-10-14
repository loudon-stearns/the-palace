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
     "id": "title",
     "maxclass": "comment",
     "patching_rect": [
      20.0,
      10.0,
      900.0,
      20.0
     ],
     "text": "Crystal Synthesizer: the playable crystal. Turn on the dac, pick a crystal, play the keys.",
     "fontsize": 16.0
    }
   },
   {
    "box": {
     "id": "sub",
     "maxclass": "comment",
     "patching_rect": [
      20.0,
      36.0,
      900.0,
      20.0
     ],
     "text": "Nine slots, falling symmetry. Default knobs = the proofs' strike exactly. Turn the menu while a note rings."
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
      110.0,
      22.0
     ],
     "fontsize": 12.0,
     "maxclass": "newobj",
     "text": "makenote 100 600",
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
     "id": "ni",
     "patching_rect": [
      200.0,
      135.0,
      50.0,
      22.0
     ],
     "fontsize": 12.0,
     "maxclass": "newobj",
     "text": "notein",
     "numinlets": 1,
     "numoutlets": 3,
     "outlettype": [
      "int",
      "int",
      "int"
     ]
    }
   },
   {
    "box": {
     "id": "mtof",
     "patching_rect": [
      20.0,
      175.0,
      45.0,
      22.0
     ],
     "fontsize": 12.0,
     "maxclass": "newobj",
     "text": "mtof",
     "numinlets": 1,
     "numoutlets": 1,
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "vnorm",
     "patching_rect": [
      120.0,
      175.0,
      50.0,
      22.0
     ],
     "fontsize": 12.0,
     "maxclass": "newobj",
     "text": "/ 127.",
     "numinlets": 2,
     "numoutlets": 1,
     "outlettype": [
      "float"
     ]
    }
   },
   {
    "box": {
     "id": "sigp",
     "patching_rect": [
      20.0,
      205.0,
      40.0,
      22.0
     ],
     "fontsize": 12.0,
     "maxclass": "newobj",
     "text": "sig~",
     "numinlets": 1,
     "numoutlets": 1,
     "outlettype": [
      "signal"
     ]
    }
   },
   {
    "box": {
     "id": "sigv",
     "patching_rect": [
      120.0,
      205.0,
      40.0,
      22.0
     ],
     "fontsize": 12.0,
     "maxclass": "newobj",
     "text": "sig~",
     "numinlets": 1,
     "numoutlets": 1,
     "outlettype": [
      "signal"
     ]
    }
   },
   {
    "box": {
     "id": "menu-l",
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
     "id": "menu-lm",
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
      "-",
      "cubic",
      ",",
      "1",
      "Fluorite",
      "-",
      "cubic",
      ",",
      "2",
      "Tetragonal",
      "-",
      "hypothesis",
      ",",
      "3",
      "Emerald",
      "-",
      "hexagonal",
      ",",
      "4",
      "Ruby",
      "-",
      "trigonal",
      ",",
      "5",
      "Amethyst",
      "-",
      "trigonal",
      ",",
      "6",
      "Topaz",
      "-",
      "orthorhombic",
      ",",
      "7",
      "Monoclinic",
      "-",
      "hypothesis",
      ",",
      "8",
      "Labradorite",
      "-",
      "triclinic"
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
     "id": "menu-pp",
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
     "id": "lbl-0",
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
     "id": "lbl-1",
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
     "id": "lbl-2",
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
     "id": "lbl-3",
     "maxclass": "comment",
     "patching_rect": [
      920.0,
      70.0,
      98.0,
      20.0
     ],
     "text": "rolloff mode to mode"
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
     "id": "lbl-4",
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
     "text": "rnbo~ @title crystal-bank",
     "numinlets": 2,
     "numoutlets": 3,
     "outlettype": [
      "signal",
      "signal",
      "list"
     ],
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
     "varname": "crystal-bank",
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
       800.0,
       720.0
      ],
      "default_fontname": "Lato",
      "gridsize": [
       15.0,
       15.0
      ],
      "title": "crystal-bank",
      "boxes": [
       {
        "box": {
         "id": "in-1",
         "patching_rect": [
          20.0,
          20.0,
          48.0,
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
          "comment": "pitch Hz",
          "meta": ""
         }
        }
       },
       {
        "box": {
         "id": "in-2",
         "patching_rect": [
          380.0,
          20.0,
          48.0,
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
          "comment": "velocity 0..1 (0 = key up)",
          "meta": ""
         }
        }
       },
       {
        "box": {
         "id": "cb",
         "maxclass": "codebox~",
         "code": "// =============================================================================\r\n// crystal-bank.codebox \u2014 the playable crystal (Crystal Synthesizer, plan move 1)\r\n//\r\n// A monophonic additive bank whose partials are chosen by a crystal, not by\r\n// taste. Nine slots on one selector, in order of falling symmetry. Seven are\r\n// the minerals already rendered as strikes on the proofs menu; two (tetragonal,\r\n// monoclinic) are the April session-1 hypothesis tables, kept so every one of\r\n// the seven crystal systems has a key on the selector.\r\n//\r\n//   0 Diamond      cubic        Fd-3m    5 modes   (palette)\r\n//   1 Fluorite     cubic        Fm-3m    6 modes   (palette)\r\n//   2 Tetragonal   hypothesis            6 modes   (session-1 table, no mineral yet)\r\n//   3 Emerald      hexagonal    P6/mcc   7 modes   (palette)\r\n//   4 Ruby         trigonal     R-3c     7 modes   (palette)\r\n//   5 Amethyst     trigonal     P3121    9 modes   (palette)\r\n//   6 Topaz        orthorhombic Pbnm     8 modes   (palette)\r\n//   7 Monoclinic   hypothesis            6 modes   (session-1 table, no mineral yet)\r\n//   8 Labradorite  triclinic    C-1      8 modes   (palette)\r\n//\r\n// THE ENGINE IS THE PROOFS' ENGINE. With the default knobs, one held note is,\r\n// sample for sample, additive_strike() from palette-strikes/render_palette.py:\r\n// same per-partial phase seeds, same 0.70 amplitude roll-off, same decay\r\n// shortening tau_k = decay / (1 + 0.15 k), same linear attack, partials at or\r\n// above 0.45 x samplerate skipped without spending a roll-off step.\r\n// check_crystal_bank.py proves it in Node before anyone opens Max. What is new\r\n// here is only what a keyboard needs: a gate, a release, velocity, and the\r\n// selector read live (turn it while a note rings and the lattice changes under\r\n// the same strike \u2014 phases stay continuous, so there is no click).\r\n//\r\n// UNVERIFIED IN MAX: written and checked in Node; nobody has compiled it in RNBO.\r\n//\r\n// PATCHER WIRING (inside rnbo~ \u2014 crystal-bank.maxpat already has it):\r\n//   [in~ 1] -> codebox in1   pitch, Hz (outside: kslider/notein -> mtof -> sig~)\r\n//   [in~ 2] -> codebox in2   velocity 0..1, also the gate (0 = key up)\r\n//   codebox out1 -> [out~ 1] left\r\n//   codebox out2 -> [out~ 2] right (same signal; the bank is mono)\r\n// Every control is a @param: send \"crystal 4\", \"decay 2.5\" etc. to rnbo~'s left inlet.\r\n// =============================================================================\r\n\r\n@param({ min: 0.0,  max: 8.0 })    crystal = 0.0;    // selector slot, see table above\r\n@param({ min: 1.0,  max: 500.0 })  attack = 80.0;    // ms \u2014 the proofs used 80\r\n@param({ min: 0.1,  max: 20.0 })   decay = 5.5;      // s \u2014 lowest mode's time constant\r\n@param({ min: 0.01, max: 10.0 })   release = 0.4;    // s \u2014 after key up\r\n@param({ min: 0.3,  max: 1.0 })    rolloff = 0.7;    // amplitude ratio between neighbouring modes\r\n@param({ min: 0.0,  max: 1.0 })    level = 0.5;\r\n\r\nconst NMAX = 9;\r\nconst TWOPI = 6.283185307179586;\r\n\r\n@state ph = new FixedDoubleArray(9);     // per-mode phase, cycles\r\n@state env = new FixedDoubleArray(9);    // per-mode decay envelope\r\n@state sinceOn = 0;                      // samples since the strike\r\n@state relEnv = 0.0;                     // 1 while held, falls after key up\r\n@state held = 0;\r\n@state vel = 0.0;\r\n@state noteHz = 0.0;                     // last pitch asked for\r\n@state voiceHz = 0.0;                    // pitch actually sounding\r\n@state prevGate = 0.0;\r\n@state steal = 0;                        // samples left in the 3 ms fade before a restrike\r\n@state stealN = 1;\r\n@state pendHz = 0.0;\r\n@state pendVel = 0.0;\r\n\r\n// Phase seeds: numpy default_rng(7 + k).uniform(0, 1), the proofs' own seeds.\r\nfunction seed(k) {\r\n    if (k == 0) return 0.625095466604667;\r\n    if (k == 1) return 0.3269722766055607;\r\n    if (k == 2) return 0.8702492039700847;\r\n    if (k == 3) return 0.9560017096289753;\r\n    if (k == 4) return 0.12857020276919962;\r\n    if (k == 5) return 0.2508244581084461;\r\n    if (k == 6) return 0.8647975870165865;\r\n    if (k == 7) return 0.8309833188891115;\r\n    return 0.6927433679651523;\r\n}\r\n\r\n// Mode k of crystal c, as a ratio over the played pitch. 0 means \"no mode\".\r\n// Ratios from Crystal Sonification Reference (palette) and\r\n// session-1-implementation.md (the two hypothesis lattices).\r\nfunction ratio(c, k) {\r\n    if (c == 0) {          // Diamond\r\n        if (k == 0) return 1.00; if (k == 1) return 1.32; if (k == 2) return 1.48;\r\n        if (k == 3) return 1.57; if (k == 4) return 1.65; return 0.0;\r\n    }\r\n    if (c == 1) {          // Fluorite \u2014 two modes share 1.00; the lone LO sits at 2.48\r\n        if (k == 0) return 1.00; if (k == 1) return 1.00; if (k == 2) return 1.35;\r\n        if (k == 3) return 1.47; if (k == 4) return 1.69; if (k == 5) return 2.48; return 0.0;\r\n    }\r\n    if (c == 2) {          // Tetragonal \u2014 hypothesis\r\n        if (k == 0) return 1.00; if (k == 1) return 1.28; if (k == 2) return 1.41;\r\n        if (k == 3) return 1.70; if (k == 4) return 1.85; if (k == 5) return 2.00; return 0.0;\r\n    }\r\n    if (c == 3) {          // Emerald \u2014 ring-breathing mode at 1.68\r\n        if (k == 0) return 1.00; if (k == 1) return 1.23; if (k == 2) return 1.47;\r\n        if (k == 3) return 1.68; if (k == 4) return 2.13; if (k == 5) return 2.30;\r\n        if (k == 6) return 3.33; return 0.0;\r\n    }\r\n    if (c == 4) {          // Ruby \u2014 the 1.10 / 1.14 doublet beats\r\n        if (k == 0) return 1.00; if (k == 1) return 1.10; if (k == 2) return 1.14;\r\n        if (k == 3) return 1.19; if (k == 4) return 1.52; if (k == 5) return 1.70;\r\n        if (k == 6) return 1.98; return 0.0;\r\n    }\r\n    if (c == 5) {          // Amethyst \u2014 three families, soft mode at 1.62\r\n        if (k == 0) return 1.00; if (k == 1) return 1.62; if (k == 2) return 2.07;\r\n        if (k == 3) return 2.77; if (k == 4) return 3.13; if (k == 5) return 3.63;\r\n        if (k == 6) return 5.45; if (k == 7) return 6.21; return 8.32;\r\n    }\r\n    if (c == 6) {          // Topaz \u2014 eight modes, evenly spread\r\n        if (k == 0) return 1.00; if (k == 1) return 1.45; if (k == 2) return 1.91;\r\n        if (k == 3) return 2.37; if (k == 4) return 2.96; if (k == 5) return 3.68;\r\n        if (k == 6) return 4.80; if (k == 7) return 6.05; return 0.0;\r\n    }\r\n    if (c == 7) {          // Monoclinic \u2014 hypothesis\r\n        if (k == 0) return 1.00; if (k == 1) return 1.37; if (k == 2) return 1.71;\r\n        if (k == 3) return 1.94; if (k == 4) return 2.23; if (k == 5) return 2.61; return 0.0;\r\n    }\r\n    // 8 Labradorite \u2014 four octaves, no organising ratio\r\n    if (k == 0) return 1.00; if (k == 1) return 1.83; if (k == 2) return 3.17;\r\n    if (k == 3) return 4.67; if (k == 4) return 7.00; if (k == 5) return 9.50;\r\n    if (k == 6) return 13.3; if (k == 7) return 17.5; return 0.0;\r\n}\r\n\r\nlet hz = in1;\r\nlet gate = in2;\r\n\r\n// Strike on key down, and on a new pitch while a key is still down (legato\r\n// playing from a mono keyboard sends the new pitch without a key-up between).\r\n// If the old note is still ringing, fade it out over 3 ms first and strike\r\n// after, so a restrike never cuts a sounding wave to zero (that was a click).\r\nif (gate > 0.0001 && (prevGate <= 0.0001 || abs(hz - noteHz) > noteHz * 0.005)) {\r\n    pendHz = hz;\r\n    pendVel = gate;\r\n    noteHz = hz;\r\n    held = 1;\r\n    if (relEnv > 0.0001 && sinceOn > 0) {\r\n        stealN = max(1, floor(0.003 * samplerate));\r\n        steal = stealN;\r\n    } else {\r\n        steal = 0;\r\n        sinceOn = -1;                    // marks \"strike now\", below\r\n    }\r\n}\r\nif (steal > 0) {\r\n    steal -= 1;\r\n    if (steal == 0) sinceOn = -1;\r\n}\r\nif (sinceOn < 0) {\r\n    for (let k = 0; k < NMAX; k++) {\r\n        ph[k] = seed(k);\r\n        env[k] = 1.0;\r\n    }\r\n    sinceOn = 0;\r\n    relEnv = 1.0;\r\n    vel = pendVel;\r\n    voiceHz = pendHz;\r\n}\r\nif (gate <= 0.0001 && prevGate > 0.0001) {\r\n    held = 0;\r\n}\r\nprevGate = gate;\r\n\r\nlet c = clamp(floor(crystal + 0.5), 0, 8);\r\nlet attackN = floor(attack * 0.001 * samplerate);\r\nlet atk = 1.0;\r\nif (attackN > 1) atk = min(1.0, sinceOn / (attackN - 1));\r\n\r\nlet sum = 0.0;\r\nlet amp = 1.0;\r\nfor (let k = 0; k < NMAX; k++) {\r\n    let r = ratio(c, k);\r\n    let tau = decay / (1.0 + 0.15 * k);\r\n    if (r > 0.0) {\r\n        let f = voiceHz * r;\r\n        if (f < samplerate * 0.45) {\r\n            sum += amp * env[k] * sin(TWOPI * ph[k]);\r\n            amp *= rolloff;\r\n        }\r\n        ph[k] += f / samplerate;\r\n        if (ph[k] >= 1.0) ph[k] -= floor(ph[k]);\r\n    }\r\n    env[k] *= exp(-1.0 / (tau * samplerate));\r\n}\r\n\r\nlet fade = 1.0;\r\nif (steal > 0) fade = steal / stealN;\r\nlet y = sum * atk * relEnv * vel * level * 0.6 * fade;\r\nif (held == 0) {\r\n    relEnv *= exp(-1.0 / (release * samplerate));\r\n    if (relEnv < 0.000001) relEnv = 0.0;\r\n}\r\nsinceOn += 1;\r\n\r\nout1 = y;\r\nout2 = y;\r\n",
         "fontname": "<Monospaced>",
         "fontsize": 12.0,
         "numinlets": 2,
         "numoutlets": 2,
         "outlettype": [
          "signal",
          "signal"
         ],
         "patching_rect": [
          20.0,
          60.0,
          720.0,
          560.0
         ],
         "rnbo_classname": "codebox~"
        }
       },
       {
        "box": {
         "id": "out-1",
         "patching_rect": [
          20.0,
          650.0,
          45.0,
          22.0
         ],
         "fontsize": 12.0,
         "maxclass": "newobj",
         "text": "out~ 1",
         "numinlets": 1,
         "numoutlets": 0,
         "rnbo_classname": "out~",
         "rnbo_extra_attributes": {
          "comment": "left",
          "meta": ""
         }
        }
       },
       {
        "box": {
         "id": "out-2",
         "patching_rect": [
          380.0,
          650.0,
          45.0,
          22.0
         ],
         "fontsize": 12.0,
         "maxclass": "newobj",
         "text": "out~ 2",
         "numinlets": 1,
         "numoutlets": 0,
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
          "in-1",
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
          "in-2",
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
          "cb",
          0
         ],
         "destination": [
          "out-1",
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
          "out-2",
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
   },
   {
    "box": {
     "id": "listen",
     "maxclass": "comment",
     "patching_rect": [
      90.0,
      300.0,
      820.0,
      20.0
     ],
     "text": "Listen for: Ruby's slow 4 Hz beating (the 1.10/1.14 doublet) - Fluorite's lone high mode after a gap - Labradorite's four octaves that never settle into a chord. Hold one key and step the menu: same strike, new lattice."
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
      "mtof",
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
      "vnorm",
      0
     ]
    }
   },
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
      "vnorm",
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
      "sigp",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "vnorm",
      0
     ],
     "destination": [
      "sigv",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "sigp",
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
      "sigv",
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
      "menu-lm",
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
      "menu-pp",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "menu-pp",
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