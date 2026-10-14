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
      80.0,
      80.0,
      960.0,
      560.0
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
          "text": "Blood Compressor 0.1: the heartbeat through the vessel. Turn on the dac, drag threshold down from 0 to -40 and watch squeeze follow.",
          "fontsize": 16.0
        }
      },
      {
        "box": {
          "id": "beat",
          "maxclass": "newobj",
          "text": "rnbo~ @title heartbeat",
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "signal",
            "list"
          ],
          "patching_rect": [
            20.0,
            50.0,
            200.0,
            22.0
          ],
          "rnboattrcache": {},
          "rnboversion": "1.4.0",
          "autosave": 1,
          "saved_object_attributes": {
            "optimization": "O1",
            "parameter_enable": 0
          },
          "varname": "heartbeat",
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
            "title": "heartbeat",
            "boxes": [
              {
                "box": {
                  "id": "cb",
                  "maxclass": "codebox~",
                  "code": "// =============================================================================\r\n// Heartbeat test source \u2014 hand-written RNBO codebox~ (v0.1, 2026-10-14)\r\n// The browser vessel's test signal: lub (loud) then dub (softer) at 72 bpm over\r\n// a quiet diastolic hum, on a 110 Hz tone with two overtones. Peaks near -7 dB,\r\n// hum near -36 dB, so the threshold has a wide range to choose from.\r\n// PATCHER WIRING: codebox out1 -> [out~ 1]. No inlets.\r\n// =============================================================================\r\n\r\nconst TWOPI = 6.283185307179586;\r\n@state n = 0;\r\n@state ph = 0.0;\r\n\r\nlet sr = samplerate;\r\nlet t = n / sr;\r\nn = n + 1;\r\nlet T = 60.0 / 72.0;\r\nlet u = t - floor(t / T) * T;\r\nlet lub = 0.0;\r\nif (u < 0.012) { lub = u / 0.012; } else { lub = exp(-(u - 0.012) / 0.07); }\r\nlet v = u - 0.30;\r\nlet dub = 0.0;\r\nif (v < 0.0) { dub = 0.0; }\r\nelse if (v < 0.010) { dub = v / 0.010; }\r\nelse { dub = exp(-(v - 0.010) / 0.05); }\r\nlet env = min(1.0, 0.025 + 0.72 * lub + 0.40 * dub);\r\nph = ph + TWOPI * 110.0 / sr;\r\nif (ph > TWOPI) { ph = ph - TWOPI; }\r\nlet tone = (sin(ph) + 0.5 * sin(2.0 * ph) + 0.25 * sin(3.0 * ph)) / 1.45;\r\nout1 = env * tone;\r\n",
                  "fontname": "<Monospaced>",
                  "fontsize": 12.0,
                  "numinlets": 1,
                  "numoutlets": 1,
                  "outlettype": [
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
                    "comment": "heartbeat",
                    "meta": ""
                  }
                }
              }
            ],
            "lines": [
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
              }
            ]
          }
        }
      },
      {
        "box": {
          "id": "beat-l",
          "maxclass": "comment",
          "patching_rect": [
            230.0,
            50.0,
            400.0,
            20.0
          ],
          "text": "test source: lub-dub at 72 bpm, peaks near -7 dB, hum near -36 dB"
        }
      },
      {
        "box": {
          "id": "lbl-0",
          "maxclass": "comment",
          "patching_rect": [
            20.0,
            95.0,
            112.0,
            20.0
          ],
          "text": "threshold (systolic line)"
        }
      },
      {
        "box": {
          "id": "lm-0",
          "patching_rect": [
            20.0,
            120.0,
            90.0,
            22.0
          ],
          "fontsize": 12.0,
          "maxclass": "newobj",
          "text": "loadmess -20.0",
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
          "minimum": -60.0,
          "maximum": 0.0,
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "",
            "bang"
          ],
          "parameter_enable": 0,
          "patching_rect": [
            20.0,
            150.0,
            70.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "pp-0",
          "patching_rect": [
            20.0,
            180.0,
            100.0,
            22.0
          ],
          "fontsize": 12.0,
          "maxclass": "newobj",
          "text": "prepend threshold",
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
            135.0,
            95.0,
            112.0,
            20.0
          ],
          "text": "ratio (wall stiffness)"
        }
      },
      {
        "box": {
          "id": "lm-1",
          "patching_rect": [
            135.0,
            120.0,
            90.0,
            22.0
          ],
          "fontsize": 12.0,
          "maxclass": "newobj",
          "text": "loadmess 4.0",
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
          "minimum": 1.0,
          "maximum": 20.0,
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "",
            "bang"
          ],
          "parameter_enable": 0,
          "patching_rect": [
            135.0,
            150.0,
            70.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "pp-1",
          "patching_rect": [
            135.0,
            180.0,
            100.0,
            22.0
          ],
          "fontsize": 12.0,
          "maxclass": "newobj",
          "text": "prepend ratio",
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
            250.0,
            95.0,
            112.0,
            20.0
          ],
          "text": "knee (wall yield)"
        }
      },
      {
        "box": {
          "id": "lm-2",
          "patching_rect": [
            250.0,
            120.0,
            90.0,
            22.0
          ],
          "fontsize": 12.0,
          "maxclass": "newobj",
          "text": "loadmess 6.0",
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
          "minimum": 0.0,
          "maximum": 24.0,
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "",
            "bang"
          ],
          "parameter_enable": 0,
          "patching_rect": [
            250.0,
            150.0,
            70.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "pp-2",
          "patching_rect": [
            250.0,
            180.0,
            100.0,
            22.0
          ],
          "fontsize": 12.0,
          "maxclass": "newobj",
          "text": "prepend knee",
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
            365.0,
            95.0,
            112.0,
            20.0
          ],
          "text": "attack (reflex delay)"
        }
      },
      {
        "box": {
          "id": "lm-3",
          "patching_rect": [
            365.0,
            120.0,
            90.0,
            22.0
          ],
          "fontsize": 12.0,
          "maxclass": "newobj",
          "text": "loadmess 60.0",
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
          "minimum": 5.0,
          "maximum": 500.0,
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "",
            "bang"
          ],
          "parameter_enable": 0,
          "patching_rect": [
            365.0,
            150.0,
            70.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "pp-3",
          "patching_rect": [
            365.0,
            180.0,
            100.0,
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
          "id": "lbl-4",
          "maxclass": "comment",
          "patching_rect": [
            480.0,
            95.0,
            112.0,
            20.0
          ],
          "text": "release (muscle relaxing)"
        }
      },
      {
        "box": {
          "id": "lm-4",
          "patching_rect": [
            480.0,
            120.0,
            90.0,
            22.0
          ],
          "fontsize": 12.0,
          "maxclass": "newobj",
          "text": "loadmess 300.0",
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
          "minimum": 5.0,
          "maximum": 3000.0,
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "",
            "bang"
          ],
          "parameter_enable": 0,
          "patching_rect": [
            480.0,
            150.0,
            70.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "pp-4",
          "patching_rect": [
            480.0,
            180.0,
            100.0,
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
          "id": "lbl-5",
          "maxclass": "comment",
          "patching_rect": [
            595.0,
            95.0,
            112.0,
            20.0
          ],
          "text": "makeup (makeup)"
        }
      },
      {
        "box": {
          "id": "lm-5",
          "patching_rect": [
            595.0,
            120.0,
            90.0,
            22.0
          ],
          "fontsize": 12.0,
          "maxclass": "newobj",
          "text": "loadmess 0.0",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "fl-5",
          "maxclass": "flonum",
          "format": 6,
          "minimum": 0.0,
          "maximum": 24.0,
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "",
            "bang"
          ],
          "parameter_enable": 0,
          "patching_rect": [
            595.0,
            150.0,
            70.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "pp-5",
          "patching_rect": [
            595.0,
            180.0,
            100.0,
            22.0
          ],
          "fontsize": 12.0,
          "maxclass": "newobj",
          "text": "prepend makeup",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "lbl-6",
          "maxclass": "comment",
          "patching_rect": [
            710.0,
            95.0,
            112.0,
            20.0
          ],
          "text": "rmsTime (detector)"
        }
      },
      {
        "box": {
          "id": "lm-6",
          "patching_rect": [
            710.0,
            120.0,
            90.0,
            22.0
          ],
          "fontsize": 12.0,
          "maxclass": "newobj",
          "text": "loadmess 10.0",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "fl-6",
          "maxclass": "flonum",
          "format": 6,
          "minimum": 1.0,
          "maximum": 100.0,
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "",
            "bang"
          ],
          "parameter_enable": 0,
          "patching_rect": [
            710.0,
            150.0,
            70.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "pp-6",
          "patching_rect": [
            710.0,
            180.0,
            100.0,
            22.0
          ],
          "fontsize": 12.0,
          "maxclass": "newobj",
          "text": "prepend rmsTime",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "lbl-7",
          "maxclass": "comment",
          "patching_rect": [
            825.0,
            95.0,
            112.0,
            20.0
          ],
          "text": "bypass (bypass)"
        }
      },
      {
        "box": {
          "id": "lm-7",
          "patching_rect": [
            825.0,
            120.0,
            90.0,
            22.0
          ],
          "fontsize": 12.0,
          "maxclass": "newobj",
          "text": "loadmess 0.0",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "fl-7",
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
            825.0,
            150.0,
            70.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "pp-7",
          "patching_rect": [
            825.0,
            180.0,
            100.0,
            22.0
          ],
          "fontsize": 12.0,
          "maxclass": "newobj",
          "text": "prepend bypass",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "comp",
          "maxclass": "newobj",
          "text": "rnbo~ @title blood-compressor",
          "numinlets": 1,
          "numoutlets": 5,
          "outlettype": [
            "signal",
            "signal",
            "signal",
            "signal",
            "list"
          ],
          "patching_rect": [
            20.0,
            230.0,
            900.0,
            22.0
          ],
          "rnboattrcache": {},
          "rnboversion": "1.4.0",
          "autosave": 1,
          "saved_object_attributes": {
            "optimization": "O1",
            "parameter_enable": 0
          },
          "varname": "blood-compressor",
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
            "title": "blood-compressor",
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
                    "comment": "blood in",
                    "meta": ""
                  }
                }
              },
              {
                "box": {
                  "id": "cb",
                  "maxclass": "codebox~",
                  "code": "// =============================================================================\r\n// Blood Compressor \u2014 hand-written RNBO codebox~  (v0.1, 2026-10-14)\r\n// The same compressor as the browser vessel (stage2-vessel-prototype-v3.html),\r\n// line for line, so the Max device and the browser picture can be checked\r\n// against each other sample by sample (rnbo/check-codebox.mjs does that in Node).\r\n//\r\n//   sidechain high-pass (80 Hz, the detector only) -> RMS detector\r\n//   -> soft-knee gain computer (cubic: the vessel wall yielding)\r\n//   -> nerve-conduction delay (fixed 5 ms: the body always has reaction time)\r\n//   -> attack / release ballistics in dB (baroreceptor reflex / smooth muscle)\r\n//   -> gain on the dry signal\r\n//\r\n// PATCHER WIRING (inside rnbo~):\r\n//   [in~ 1]  -> codebox in1       the blood: audio in (mono)\r\n//   codebox out1 -> [out~ 1]      the blood past the vessel: audio out\r\n//   codebox out2 -> [out~ 2]      pressure: detector level, dB peak-equivalent\r\n//   codebox out3 -> [out~ 3]      squeeze: gain change, dB (0 = wide open, negative = constricted)\r\n//   codebox out4 -> [out~ 4]      baroreceptors: 1 while pressure is past the knee, else 0\r\n// Every control is a @param, so each one becomes a knob (M4L) or an\r\n// automatable parameter (VST/AU). Send \"threshold -24\" etc. to rnbo~'s left inlet.\r\n// =============================================================================\r\n\r\n@param({ min: -60.0, max: 0.0 })    threshold = -20.0;  // systolic line, dB\r\n@param({ min: 1.0,   max: 20.0 })   ratio = 4.0;        // vessel wall stiffness\r\n@param({ min: 0.0,   max: 24.0 })   knee = 6.0;         // wall yield, dB wide\r\n@param({ min: 5.0,   max: 500.0 })  attack = 60.0;      // baroreceptor reflex, ms (floor 5)\r\n@param({ min: 5.0,   max: 3000.0 }) release = 300.0;    // smooth muscle relaxing, ms\r\n@param({ min: 0.0,   max: 24.0 })   makeup = 0.0;       // dB\r\n@param({ min: 1.0,   max: 100.0 })  rmsTime = 10.0;     // detector time constant, ms\r\n@param({ min: 0.0,   max: 1.0 })    bypass = 0.0;\r\n\r\nconst NERVEMS = 5.0;           // fixed: nerve conduction, cannot be set to zero\r\nconst DLEN = 16384;            // control delay ring; 5 ms fits up to 3.2 MHz\r\nconst DB10 = 4.342944819032518; // 10 / ln(10): 10*log10(x) == DB10*log(x)\r\n\r\n@state hpX = 0.0;\r\n@state hpY = 0.0;\r\n@state ms = 0.0;\r\n@state g = 0.0;\r\n@state dline = new FixedDoubleArray(16384);\r\n@state dw = 0;\r\n\r\n// static curve: input level (dB) -> output level (dB)\r\nfunction curve(x, T, R, K) {\r\n    let lo = T - K / 2.0;\r\n    let hi = T + K / 2.0;\r\n    if (K <= 0.0 || x <= lo) {\r\n        if (x > T) { return T + (x - T) / R; }\r\n        return x;\r\n    }\r\n    if (x >= hi) { return T + (x - T) / R; }\r\n    // cubic Hermite between the two straight lines (slope 1 below, 1/R above)\r\n    let s = (x - lo) / K;\r\n    let y0 = lo;\r\n    let y1 = T + (K / 2.0) / R;\r\n    let m0 = K;\r\n    let m1 = K / R;\r\n    let s2 = s * s;\r\n    let s3 = s2 * s;\r\n    return (2.0 * s3 - 3.0 * s2 + 1.0) * y0 + (s3 - 2.0 * s2 + s) * m0\r\n         + (-2.0 * s3 + 3.0 * s2) * y1 + (s3 - s2) * m1;\r\n}\r\n\r\nlet x = in1;\r\nlet sr = samplerate;\r\nlet R = max(1.0, ratio);\r\nlet K = max(0.0, knee);\r\n\r\n// sidechain HPF, one pole at 80 Hz\r\nlet a = exp(-2.0 * PI * 80.0 / sr);\r\nlet hp = a * (hpY + x - hpX);\r\nhpX = x;\r\nhpY = hp;\r\n\r\n// RMS: one-pole mean square; +3.0103 dB so a sine reads at its peak level\r\nlet ar = exp(-1.0 / (sr * rmsTime / 1000.0));\r\nms = ar * ms + (1.0 - ar) * hp * hp;\r\nlet det = DB10 * log(ms + 1e-12) + 3.0103;\r\nlet target = min(0.0, curve(det, threshold, R, K) - det);\r\n\r\n// nerve-conduction delay on the control signal\r\nlet d = max(1, floor(sr * NERVEMS / 1000.0 + 0.5));\r\ndline[dw] = target;\r\nlet r = dw - d;\r\nif (r < 0) { r = r + DLEN; }\r\nlet delayed = dline[r];\r\ndw = dw + 1;\r\nif (dw >= DLEN) { dw = 0; }\r\n\r\n// ballistics in dB: toward more reduction = attack, back toward 0 = release\r\nlet atk = max(5.0, attack);\r\nlet rel = max(5.0, release);\r\nlet c = 0.0;\r\nif (delayed < g) { c = exp(-1.0 / (sr * atk / 1000.0)); }\r\nelse { c = exp(-1.0 / (sr * rel / 1000.0)); }\r\ng = c * g + (1.0 - c) * delayed;\r\n\r\nif (bypass >= 0.5) { out1 = x; }\r\nelse { out1 = x * pow(10.0, (g + makeup) / 20.0); }\r\nout2 = det;\r\nout3 = g;\r\nout4 = 0.0;\r\nif (target < -0.05) { out4 = 1.0; }\r\n",
                  "fontname": "<Monospaced>",
                  "fontsize": 12.0,
                  "numinlets": 1,
                  "numoutlets": 4,
                  "outlettype": [
                    "signal",
                    "signal",
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
                    "comment": "blood out",
                    "meta": ""
                  }
                }
              },
              {
                "box": {
                  "id": "out-2",
                  "patching_rect": [
                    200.0,
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
                    "comment": "pressure dB",
                    "meta": ""
                  }
                }
              },
              {
                "box": {
                  "id": "out-3",
                  "patching_rect": [
                    380.0,
                    650.0,
                    45.0,
                    22.0
                  ],
                  "fontsize": 12.0,
                  "maxclass": "newobj",
                  "text": "out~ 3",
                  "numinlets": 1,
                  "numoutlets": 0,
                  "rnbo_classname": "out~",
                  "rnbo_extra_attributes": {
                    "comment": "squeeze dB",
                    "meta": ""
                  }
                }
              },
              {
                "box": {
                  "id": "out-4",
                  "patching_rect": [
                    560.0,
                    650.0,
                    45.0,
                    22.0
                  ],
                  "fontsize": 12.0,
                  "maxclass": "newobj",
                  "text": "out~ 4",
                  "numinlets": 1,
                  "numoutlets": 0,
                  "rnbo_classname": "out~",
                  "rnbo_extra_attributes": {
                    "comment": "baroreceptors",
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
              },
              {
                "patchline": {
                  "source": [
                    "cb",
                    2
                  ],
                  "destination": [
                    "out-3",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "cb",
                    3
                  ],
                  "destination": [
                    "out-4",
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
          "id": "gain",
          "patching_rect": [
            20.0,
            280.0,
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
          ]
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
            320.0,
            45.0,
            45.0
          ]
        }
      },
      {
        "box": {
          "id": "snap-1",
          "patching_rect": [
            260.0,
            280.0,
            90.0,
            22.0
          ],
          "fontsize": 12.0,
          "maxclass": "newobj",
          "text": "snapshot~ 30",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            "float"
          ]
        }
      },
      {
        "box": {
          "id": "show-1",
          "maxclass": "flonum",
          "format": 6,
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "",
            "bang"
          ],
          "parameter_enable": 0,
          "patching_rect": [
            260.0,
            315.0,
            80.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "show-l-1",
          "maxclass": "comment",
          "patching_rect": [
            260.0,
            345.0,
            200.0,
            20.0
          ],
          "text": "pressure dB: detector"
        }
      },
      {
        "box": {
          "id": "snap-2",
          "patching_rect": [
            480.0,
            280.0,
            90.0,
            22.0
          ],
          "fontsize": 12.0,
          "maxclass": "newobj",
          "text": "snapshot~ 30",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            "float"
          ]
        }
      },
      {
        "box": {
          "id": "show-2",
          "maxclass": "flonum",
          "format": 6,
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "",
            "bang"
          ],
          "parameter_enable": 0,
          "patching_rect": [
            480.0,
            315.0,
            80.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "show-l-2",
          "maxclass": "comment",
          "patching_rect": [
            480.0,
            345.0,
            200.0,
            20.0
          ],
          "text": "squeeze dB: gain change"
        }
      },
      {
        "box": {
          "id": "snap-3",
          "patching_rect": [
            700.0,
            280.0,
            90.0,
            22.0
          ],
          "fontsize": 12.0,
          "maxclass": "newobj",
          "text": "snapshot~ 30",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            "float"
          ]
        }
      },
      {
        "box": {
          "id": "show-3",
          "maxclass": "flonum",
          "format": 6,
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "",
            "bang"
          ],
          "parameter_enable": 0,
          "patching_rect": [
            700.0,
            315.0,
            80.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "show-l-3",
          "maxclass": "comment",
          "patching_rect": [
            700.0,
            345.0,
            200.0,
            20.0
          ],
          "text": "baroreceptors: 1 while over"
        }
      },
      {
        "box": {
          "id": "scope",
          "maxclass": "scope~",
          "numinlets": 2,
          "numoutlets": 0,
          "patching_rect": [
            260.0,
            380.0,
            400.0,
            130.0
          ],
          "range": [
            -30.0,
            0.0
          ],
          "calccount": 128
        }
      },
      {
        "box": {
          "id": "scope-l",
          "maxclass": "comment",
          "patching_rect": [
            670.0,
            380.0,
            250.0,
            20.0
          ],
          "text": "squeeze over time: the vessel narrowing on every lub and dub"
        }
      }
    ],
    "lines": [
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
            "comp",
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
            "comp",
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
            "comp",
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
            "comp",
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
            "comp",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "lm-5",
            0
          ],
          "destination": [
            "fl-5",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "fl-5",
            0
          ],
          "destination": [
            "pp-5",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "pp-5",
            0
          ],
          "destination": [
            "comp",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "lm-6",
            0
          ],
          "destination": [
            "fl-6",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "fl-6",
            0
          ],
          "destination": [
            "pp-6",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "pp-6",
            0
          ],
          "destination": [
            "comp",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "lm-7",
            0
          ],
          "destination": [
            "fl-7",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "fl-7",
            0
          ],
          "destination": [
            "pp-7",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "pp-7",
            0
          ],
          "destination": [
            "comp",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "beat",
            0
          ],
          "destination": [
            "comp",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "comp",
            0
          ],
          "destination": [
            "gain",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "gain",
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
            "gain",
            0
          ],
          "destination": [
            "dac",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "comp",
            1
          ],
          "destination": [
            "snap-1",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap-1",
            0
          ],
          "destination": [
            "show-1",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "comp",
            2
          ],
          "destination": [
            "snap-2",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap-2",
            0
          ],
          "destination": [
            "show-2",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "comp",
            3
          ],
          "destination": [
            "snap-3",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap-3",
            0
          ],
          "destination": [
            "show-3",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "comp",
            2
          ],
          "destination": [
            "scope",
            0
          ]
        }
      }
    ]
  }
}