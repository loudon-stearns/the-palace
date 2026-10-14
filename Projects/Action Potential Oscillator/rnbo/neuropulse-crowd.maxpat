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
   920.0,
   380.0
  ],
  "default_fontname": "Lato",
  "gridsize": [
   15.0,
   15.0
  ],
  "boxes": [
   {
    "box": {
     "id": "title",
     "maxclass": "comment",
     "fontsize": 18.0,
     "patching_rect": [
      20.0,
      10.0,
      700.0,
      27.0
     ],
     "text": "NeuroPulse crowd: 32 coupled neurons. Raise K past ~0.005 and listen for the lock."
    }
   },
   {
    "box": {
     "id": "lbl-0",
     "maxclass": "comment",
     "patching_rect": [
      20,
      45.0,
      105.0,
      20.0
     ],
     "text": "frequency Hz"
    }
   },
   {
    "box": {
     "id": "lm-0",
     "patching_rect": [
      20,
      70,
      90,
      22.0
     ],
     "fontsize": 12.0,
     "maxclass": "newobj",
     "text": "loadmess 110.0",
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
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      "bang"
     ],
     "parameter_enable": 0,
     "patching_rect": [
      20,
      100.0,
      70.0,
      22.0
     ]
    }
   },
   {
    "box": {
     "id": "sig-0",
     "patching_rect": [
      20,
      135,
      45,
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
     "id": "lbl-1",
     "maxclass": "comment",
     "patching_rect": [
      130,
      45.0,
      105.0,
      20.0
     ],
     "text": "coupling K"
    }
   },
   {
    "box": {
     "id": "lm-1",
     "patching_rect": [
      130,
      70,
      90,
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
     "id": "fl-1",
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
      130,
      100.0,
      70.0,
      22.0
     ]
    }
   },
   {
    "box": {
     "id": "sig-1",
     "patching_rect": [
      130,
      135,
      45,
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
     "id": "lbl-2",
     "maxclass": "comment",
     "patching_rect": [
      240,
      45.0,
      105.0,
      20.0
     ],
     "text": "spread"
    }
   },
   {
    "box": {
     "id": "lm-2",
     "patching_rect": [
      240,
      70,
      90,
      22.0
     ],
     "fontsize": 12.0,
     "maxclass": "newobj",
     "text": "loadmess 0.05",
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
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      "bang"
     ],
     "parameter_enable": 0,
     "patching_rect": [
      240,
      100.0,
      70.0,
      22.0
     ]
    }
   },
   {
    "box": {
     "id": "sig-2",
     "patching_rect": [
      240,
      135,
      45,
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
     "id": "lbl-3",
     "maxclass": "comment",
     "patching_rect": [
      350,
      45.0,
      105.0,
      20.0
     ],
     "text": "leak tau ms"
    }
   },
   {
    "box": {
     "id": "lm-3",
     "patching_rect": [
      350,
      70,
      90,
      22.0
     ],
     "fontsize": 12.0,
     "maxclass": "newobj",
     "text": "loadmess 5.0",
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
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      "bang"
     ],
     "parameter_enable": 0,
     "patching_rect": [
      350,
      100.0,
      70.0,
      22.0
     ]
    }
   },
   {
    "box": {
     "id": "sig-3",
     "patching_rect": [
      350,
      135,
      45,
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
     "id": "lbl-4",
     "maxclass": "comment",
     "patching_rect": [
      460,
      45.0,
      105.0,
      20.0
     ],
     "text": "spike ms"
    }
   },
   {
    "box": {
     "id": "lm-4",
     "patching_rect": [
      460,
      70,
      90,
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
     "id": "fl-4",
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
      460,
      100.0,
      70.0,
      22.0
     ]
    }
   },
   {
    "box": {
     "id": "sig-4",
     "patching_rect": [
      460,
      135,
      45,
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
     "id": "lbl-5",
     "maxclass": "comment",
     "patching_rect": [
      570,
      45.0,
      105.0,
      20.0
     ],
     "text": "hyperpolarization"
    }
   },
   {
    "box": {
     "id": "lm-5",
     "patching_rect": [
      570,
      70,
      90,
      22.0
     ],
     "fontsize": 12.0,
     "maxclass": "newobj",
     "text": "loadmess -0.2",
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
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      "bang"
     ],
     "parameter_enable": 0,
     "patching_rect": [
      570,
      100.0,
      70.0,
      22.0
     ]
    }
   },
   {
    "box": {
     "id": "sig-5",
     "patching_rect": [
      570,
      135,
      45,
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
     "id": "lbl-6",
     "maxclass": "comment",
     "patching_rect": [
      680,
      45.0,
      105.0,
      20.0
     ],
     "text": "recovery damping"
    }
   },
   {
    "box": {
     "id": "lm-6",
     "patching_rect": [
      680,
      70,
      90,
      22.0
     ],
     "fontsize": 12.0,
     "maxclass": "newobj",
     "text": "loadmess 0.3",
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
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      "bang"
     ],
     "parameter_enable": 0,
     "patching_rect": [
      680,
      100.0,
      70.0,
      22.0
     ]
    }
   },
   {
    "box": {
     "id": "sig-6",
     "patching_rect": [
      680,
      135,
      45,
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
     "id": "lbl-7",
     "maxclass": "comment",
     "patching_rect": [
      790,
      45.0,
      105.0,
      20.0
     ],
     "text": "refractory ms"
    }
   },
   {
    "box": {
     "id": "lm-7",
     "patching_rect": [
      790,
      70,
      90,
      22.0
     ],
     "fontsize": 12.0,
     "maxclass": "newobj",
     "text": "loadmess 1.5",
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
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      "bang"
     ],
     "parameter_enable": 0,
     "patching_rect": [
      790,
      100.0,
      70.0,
      22.0
     ]
    }
   },
   {
    "box": {
     "id": "sig-7",
     "patching_rect": [
      790,
      135,
      45,
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
     "id": "rnbo",
     "maxclass": "newobj",
     "text": "rnbo~ @title neuropulse-crowd",
     "numinlets": 8,
     "numoutlets": 3,
     "outlettype": [
      "signal",
      "signal",
      "list"
     ],
     "patching_rect": [
      20.0,
      200.0,
      860.0,
      22.0
     ],
     "rnboattrcache": {},
     "rnboversion": "1.4.0",
     "autosave": 1,
     "saved_object_attributes": {
      "optimization": "O1",
      "parameter_enable": 1
     },
     "varname": "neuropulse-crowd",
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
       680.0
      ],
      "default_fontname": "Lato",
      "gridsize": [
       15.0,
       15.0
      ],
      "title": "neuropulse-crowd",
      "boxes": [
       {
        "box": {
         "id": "in-1",
         "patching_rect": [
          20,
          20,
          48,
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
          "comment": "frequency Hz",
          "meta": ""
         }
        }
       },
       {
        "box": {
         "id": "in-2",
         "patching_rect": [
          110,
          20,
          48,
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
          "comment": "coupling K",
          "meta": ""
         }
        }
       },
       {
        "box": {
         "id": "in-3",
         "patching_rect": [
          200,
          20,
          48,
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
          "comment": "spread",
          "meta": ""
         }
        }
       },
       {
        "box": {
         "id": "in-4",
         "patching_rect": [
          290,
          20,
          48,
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
          "comment": "leak tau ms",
          "meta": ""
         }
        }
       },
       {
        "box": {
         "id": "in-5",
         "patching_rect": [
          380,
          20,
          48,
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
          "comment": "spike ms",
          "meta": ""
         }
        }
       },
       {
        "box": {
         "id": "in-6",
         "patching_rect": [
          470,
          20,
          48,
          22.0
         ],
         "fontsize": 12.0,
         "maxclass": "newobj",
         "text": "in~ 6",
         "numinlets": 0,
         "numoutlets": 1,
         "outlettype": [
          "signal"
         ],
         "rnbo_classname": "in~",
         "rnbo_extra_attributes": {
          "comment": "hyperpolarization",
          "meta": ""
         }
        }
       },
       {
        "box": {
         "id": "in-7",
         "patching_rect": [
          560,
          20,
          48,
          22.0
         ],
         "fontsize": 12.0,
         "maxclass": "newobj",
         "text": "in~ 7",
         "numinlets": 0,
         "numoutlets": 1,
         "outlettype": [
          "signal"
         ],
         "rnbo_classname": "in~",
         "rnbo_extra_attributes": {
          "comment": "recovery damping",
          "meta": ""
         }
        }
       },
       {
        "box": {
         "id": "in-8",
         "patching_rect": [
          650,
          20,
          48,
          22.0
         ],
         "fontsize": 12.0,
         "maxclass": "newobj",
         "text": "in~ 8",
         "numinlets": 0,
         "numoutlets": 1,
         "outlettype": [
          "signal"
         ],
         "rnbo_classname": "in~",
         "rnbo_extra_attributes": {
          "comment": "refractory ms",
          "meta": ""
         }
        }
       },
       {
        "box": {
         "id": "cb",
         "maxclass": "codebox~",
         "code": "// =============================================================================\r\n// NeuroPulse crowd \u2014 hand-written RNBO codebox~  (v0.1, 2026-10-14)\r\n// Action Potential Oscillator \u00b7 the crowd of 32 coupled Stage-4 neurons\r\n// =============================================================================\r\n// Why hand-written: faust2rnbo's codebox (neuropulse.codebox, 928 lines) runs\r\n// only 16 neurons and freezes every control as a @param. This project's rule is\r\n// Signal-Rate CV Architecture: every control is a signal inlet, so any of them\r\n// can be driven by an LFO, an envelope, or another oscillator. This file is the\r\n// same maths as neuropulse.dsp v0.2, one neuron per array slot, readable.\r\n//\r\n// PATCHER WIRING (inside rnbo~):\r\n//   [in~ 1] frequency Hz            (default sig~ 110)\r\n//   [in~ 2] coupling K              (default sig~ 0;  lock arrives near 0.005)\r\n//   [in~ 3] spread                  (default sig~ 0.05; rate + leak spread,\r\n//                                    threshold spread is 0.4 x this)\r\n//   [in~ 4] leak tau ms             (default sig~ 5)\r\n//   [in~ 5] spike ms                (default sig~ 1)\r\n//   [in~ 6] hyperpolarization       (default sig~ -0.2)\r\n//   [in~ 7] recovery damping        (default sig~ 0.3)\r\n//   [in~ 8] refractory ms           (default sig~ 1.5)\r\n//   [codebox~ out1] -> [*~ gain] -> [out~ 1]   the crowd's voice (DC-blocked)\r\n//   [codebox~ out2] -> [out~ 2]                synchrony: share of the crowd\r\n//                                              spiking right now (0..1), a CV\r\n// Every inlet is read every sample; nothing here is a @param.\r\n// =============================================================================\r\n\r\nconst NUM = 32;\r\nconst RISEFRAC = 0.3;\r\nconst PEAK = 1.5;\r\n\r\n// per-neuron state: voltage, phase (0 charge,1 rise,2 fall,3 recovery),\r\n// samples in phase, recovery velocity\r\n@state nV = new FixedDoubleArray(32);\r\n@state nPh = new FixedDoubleArray(32);\r\n@state nT = new FixedDoubleArray(32);\r\n@state nVel = new FixedDoubleArray(32);\r\n// fixed per-neuron offsets in [-1, 1], filled on the first sample\r\n@state jitF = new FixedDoubleArray(32);\r\n@state jitTau = new FixedDoubleArray(32);\r\n@state jitThr = new FixedDoubleArray(32);\r\n@state ready = 0;\r\n// last sample's synchrony, fed back as the coupling signal\r\n@state meanField = 0.0;\r\n// DC blocker registers (zero at 1, pole at 0.995 -- Faust fi.dcblocker)\r\n@state dcX = 0.0;\r\n@state dcY = 0.0;\r\n\r\nfunction fract(x) { return x - floor(x); }\r\nfunction jitter(i) { return fract(sin(i * 12.9898 + 78.233) * 43758.5453) * 2.0 - 1.0; }\r\n\r\nif (ready == 0) {\r\n    for (let i = 0; i < NUM; i++) {\r\n        jitF[i] = jitter(i);\r\n        jitTau[i] = jitter(i + 101);\r\n        jitThr[i] = jitter(i + 211);\r\n    }\r\n    ready = 1;\r\n}\r\n\r\nlet freq = max(1.0, in1);\r\nlet K = in2;\r\nlet spread = max(0.0, in3);\r\nlet tauMs = in4;\r\nlet spikeMs = in5;\r\nlet hyp = min(-0.01, in6);\r\nlet damp = in7;\r\nlet refrMs = in8;\r\n\r\nlet msToSamp = 0.001 * samplerate;\r\nlet spikeS = max(2.0, spikeMs * msToSamp);\r\nlet riseS = max(1.0, spikeS * RISEFRAC);\r\nlet fallS = max(1.0, spikeS - riseS);\r\nlet refrS = max(1.0, refrMs * msToSamp);\r\nlet fallRate = (hyp - PEAK) / fallS;\r\n\r\nlet sumV = 0.0;\r\nlet sumSpike = 0.0;\r\nlet coupling = K * meanField;\r\n\r\nfor (let i = 0; i < NUM; i++) {\r\n    // this neuron's own rate, leak and threshold\r\n    let myFreq = max(1.0, freq * (1.0 + spread * jitF[i]));\r\n    let myTau = max(0.1, tauMs * (1.0 + spread * jitTau[i]));\r\n    let thr = max(0.1, 1.0 + 0.4 * spread * jitThr[i]);\r\n\r\n    let leakTau = max(2.0, myTau * msToSamp);\r\n    let leakCoeff = 1.0 - 1.0 / leakTau;\r\n    let period = samplerate / myFreq;\r\n    // frequency compensation: spike + refractory come out of the period\r\n    let chargeS = max(1.0, period - spikeS - refrS);\r\n    // drive that reaches threshold in chargeS samples from rest, with leak\r\n    let drive = thr / (leakTau * (1.0 - pow(leakCoeff, chargeS))) + coupling;\r\n    let riseRate = (PEAK - thr) / riseS;\r\n    let springK = 1.0 / leakTau;\r\n\r\n    let V = nV[i];\r\n    let ph = nPh[i];\r\n    let t = nT[i];\r\n    let vel = nVel[i];\r\n\r\n    let newV = V;\r\n    let newPh = ph;\r\n    let newVel = 0.0;\r\n\r\n    if (ph == 0) {\r\n        let chargeV = V * leakCoeff + drive;\r\n        if (chargeV >= thr) { newV = thr; newPh = 1; }   // latch at threshold\r\n        else { newV = chargeV; }\r\n    } else if (ph == 1) {\r\n        newV = V + riseRate;\r\n        if (t + 1 >= riseS) { newPh = 2; }\r\n    } else if (ph == 2) {\r\n        newV = V + fallRate;\r\n        if (t + 1 >= fallS) { newPh = 3; }\r\n    } else {\r\n        let recVel = vel - springK * V - damp * 2.0 * sqrt(springK) * vel;\r\n        newV = V + recVel;\r\n        if (t + 1 >= refrS && V > hyp * 0.3) { newPh = 0; }\r\n        else { newVel = recVel; }\r\n    }\r\n\r\n    nV[i] = newV;\r\n    nPh[i] = newPh;\r\n    nT[i] = (newPh != ph) ? 0.0 : t + 1.0;\r\n    nVel[i] = newVel;\r\n\r\n    sumV += (newV - hyp) / (PEAK - hyp) * 2.0 - 1.0;\r\n    if (newPh == 1) { sumSpike += 1.0; }\r\n}\r\n\r\nmeanField = sumSpike / NUM;\r\nlet crowd = sumV / NUM;\r\n\r\n// DC blocker\r\nlet y = crowd - dcX + 0.995 * dcY;\r\ndcX = crowd;\r\ndcY = y;\r\n\r\nout1 = y;\r\nout2 = meanField;\r\n",
         "fontname": "<Monospaced>",
         "fontsize": 12.0,
         "numinlets": 8,
         "numoutlets": 2,
         "outlettype": [
          "signal",
          "signal"
         ],
         "patching_rect": [
          20.0,
          70.0,
          700.0,
          500.0
         ],
         "rnbo_classname": "codebox~"
        }
       },
       {
        "box": {
         "id": "out-1",
         "patching_rect": [
          20,
          600,
          45,
          22.0
         ],
         "fontsize": 12.0,
         "maxclass": "newobj",
         "text": "out~ 1",
         "numinlets": 1,
         "numoutlets": 0,
         "rnbo_classname": "out~",
         "rnbo_extra_attributes": {
          "comment": "crowd voice",
          "meta": ""
         }
        }
       },
       {
        "box": {
         "id": "out-2",
         "patching_rect": [
          380,
          600,
          45,
          22.0
         ],
         "fontsize": 12.0,
         "maxclass": "newobj",
         "text": "out~ 2",
         "numinlets": 1,
         "numoutlets": 0,
         "rnbo_classname": "out~",
         "rnbo_extra_attributes": {
          "comment": "synchrony 0..1",
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
          "in-3",
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
          "in-4",
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
          "in-5",
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
          "in-6",
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
          "in-7",
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
          "in-8",
          0
         ],
         "destination": [
          "cb",
          7
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
     "id": "gain",
     "patching_rect": [
      20,
      250,
      60,
      22.0
     ],
     "fontsize": 12.0,
     "maxclass": "newobj",
     "text": "*~ 0.4",
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
      290.0,
      45.0,
      45.0
     ]
    }
   },
   {
    "box": {
     "id": "num",
     "maxclass": "number~",
     "mode": 2,
     "numinlets": 2,
     "numoutlets": 2,
     "outlettype": [
      "signal",
      "float"
     ],
     "sig": 0.0,
     "patching_rect": [
      160.0,
      250.0,
      70.0,
      22.0
     ]
    }
   },
   {
    "box": {
     "id": "meter",
     "maxclass": "meter~",
     "numinlets": 1,
     "numoutlets": 1,
     "outlettype": [
      "float"
     ],
     "patching_rect": [
      240.0,
      250.0,
      120.0,
      13.0
     ]
    }
   },
   {
    "box": {
     "id": "synclbl",
     "maxclass": "comment",
     "patching_rect": [
      160.0,
      275.0,
      260.0,
      20.0
     ],
     "text": "synchrony out: share of the crowd spiking now"
    }
   },
   {
    "box": {
     "id": "lfo",
     "patching_rect": [
      400,
      250,
      80,
      22.0
     ],
     "fontsize": 12.0,
     "maxclass": "newobj",
     "text": "cycle~ 0.2",
     "numinlets": 2,
     "numoutlets": 1,
     "outlettype": [
      "signal"
     ]
    }
   },
   {
    "box": {
     "id": "lfoscale",
     "patching_rect": [
      400,
      280,
      150,
      22.0
     ],
     "fontsize": 12.0,
     "maxclass": "newobj",
     "text": "scale~ -1. 1. 0. 0.02",
     "numinlets": 6,
     "numoutlets": 1,
     "outlettype": [
      "signal"
     ]
    }
   },
   {
    "box": {
     "id": "lfolbl",
     "maxclass": "comment",
     "patching_rect": [
      400.0,
      305.0,
      330.0,
      34.0
     ],
     "linecount": 2,
     "text": "breathing K: unplug the K sig~ and wire this into rnbo~ inlet 2"
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
      "sig-0",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "sig-0",
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
      "sig-1",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "sig-1",
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
      "sig-2",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "sig-2",
      0
     ],
     "destination": [
      "rnbo",
      2
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
      "sig-3",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "sig-3",
      0
     ],
     "destination": [
      "rnbo",
      3
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
      "sig-4",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "sig-4",
      0
     ],
     "destination": [
      "rnbo",
      4
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
      "sig-5",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "sig-5",
      0
     ],
     "destination": [
      "rnbo",
      5
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
      "sig-6",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "sig-6",
      0
     ],
     "destination": [
      "rnbo",
      6
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
      "sig-7",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "sig-7",
      0
     ],
     "destination": [
      "rnbo",
      7
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
      "rnbo",
      1
     ],
     "destination": [
      "num",
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
      "meter",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "lfo",
      0
     ],
     "destination": [
      "lfoscale",
      0
     ]
    }
   }
  ]
 }
}