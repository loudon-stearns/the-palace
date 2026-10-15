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
			60,
			60,
			1100,
			600
		],
		"default_fontname": "Lato",
		"gridsize": [
			15,
			15
		],
		"boxes": [
			{
				"box": {
					"fontsize": 18,
					"id": "title",
					"maxclass": "comment",
					"patching_rect": [
						20,
						10,
						900,
						27
					],
					"text": "The portal. The same séance, now one RNBO codebox that can leave Max."
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "c-how",
					"maxclass": "comment",
					"text": "Turn the dac on. Play into the mic input, then stop: the last measure is kept. Raise the knob to summon it. If the rnbo~ will not compile, read the UNVERIFIED SEAMS at the top of the codebox~. Then use the export sidebar: VST3/AU, Max for Live, or Web.",
					"patching_rect": [
						20,
						40,
						900,
						40
					],
					"linecount": 2
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "adc",
					"maxclass": "ezadc~",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"signal",
						"signal"
					],
					"patching_rect": [
						20,
						100,
						45,
						45
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "c-adc",
					"maxclass": "comment",
					"text": "input (or replace with sfplay~ and a dry loop)",
					"patching_rect": [
						75,
						115,
						300,
						20
					],
					"linecount": 2
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "c-gain",
					"maxclass": "comment",
					"text": "gain: the one gesture",
					"patching_rect": [
						20,
						170,
						200,
						20
					],
					"linecount": 1
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "gain",
					"maxclass": "flonum",
					"format": 6,
					"minimum": 0,
					"maximum": 1,
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"",
						"bang"
					],
					"parameter_enable": 0,
					"patching_rect": [
						20,
						195,
						60,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "gslider",
					"maxclass": "slider",
					"size": 1,
					"floatoutput": 1,
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"parameter_enable": 0,
					"patching_rect": [
						90,
						195,
						160,
						20
					],
					"orientation": 1
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "pg",
					"maxclass": "newobj",
					"text": "prepend gain",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20,
						225,
						90,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "c-lag",
					"maxclass": "comment",
					"text": "lag: how far back",
					"patching_rect": [
						300,
						170,
						200,
						20
					],
					"linecount": 1
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "lq",
					"maxclass": "message",
					"text": "lag 0.25",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						300,
						195,
						65,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "lh",
					"maxclass": "message",
					"text": "lag 0.5",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						370,
						195,
						60,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "lw",
					"maxclass": "message",
					"text": "lag 1",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						435,
						195,
						50,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "c-lagn",
					"maxclass": "comment",
					"text": "quarter · half · whole note — exactly 1 is safe here, as in gen~",
					"patching_rect": [
						300,
						222,
						380,
						20
					],
					"linecount": 2
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "c-bpm",
					"maxclass": "comment",
					"text": "bpm (Live and VST hosts can drive this from their transport)",
					"patching_rect": [
						700,
						170,
						300,
						34
					],
					"linecount": 2
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "lm-bpm",
					"maxclass": "newobj",
					"text": "loadmess 120",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						700,
						205,
						90,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "bpm",
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
						700,
						232,
						60,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "pb",
					"maxclass": "newobj",
					"text": "prepend bpm",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						700,
						260,
						85,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "rnbo",
					"maxclass": "newobj",
					"text": "rnbo~ @title retrospective-delay",
					"numinlets": 1,
					"numoutlets": 3,
					"outlettype": [
						"signal",
						"signal",
						"list"
					],
					"patching_rect": [
						20,
						300,
						600,
						22
					],
					"rnboattrcache": {},
					"rnboversion": "1.4.0",
					"autosave": 1,
					"saved_object_attributes": {
						"optimization": "O1",
						"parameter_enable": 1
					},
					"varname": "retrospective-delay",
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
							80,
							80,
							900,
							860
						],
						"default_fontname": "Lato",
						"gridsize": [
							15,
							15
						],
						"title": "retrospective-delay",
						"boxes": [
							{
								"box": {
									"fontsize": 12,
									"id": "c-in",
									"maxclass": "comment",
									"text": "One input. The codebox holds the tape itself: no buffer~, no transport, nothing a plugin host or the H9000 has to supply but audio and a tempo.",
									"patching_rect": [
										20,
										10,
										700,
										40
									],
									"linecount": 2
								}
							},
							{
								"box": {
									"fontsize": 12,
									"id": "in1",
									"maxclass": "newobj",
									"text": "in~ 1",
									"numinlets": 0,
									"numoutlets": 1,
									"outlettype": [
										"signal"
									],
									"patching_rect": [
										20,
										60,
										50,
										22
									],
									"rnbo_classname": "in~",
									"rnbo_extra_attributes": {
										"comment": "audio in",
										"meta": ""
									}
								}
							},
							{
								"box": {
									"fontsize": 12,
									"id": "cb",
									"maxclass": "codebox~",
									"code": "// Retrospective Delay — the portal (RNBO codebox~)\r\n// The face's séance from the fourth move, ported from gen~ to rnboscript so\r\n// it can leave Max: Max for Live, VST3/AU, the browser.\r\n//\r\n//   in1  audio                     out1  dry + ghost  (left)\r\n//                                  out2  dry + ghost  (right, the same)\r\n//                                  out3  the knob as you HEAR it    -> the cat's pose\r\n//                                  out4  presence on the tape       -> the ectoplasm\r\n//                                  out5  holding: 1 keeps, 0 listens -> the candle\r\n//\r\n// PATCHER WIRING REQUIRED (inside the rnbo~):\r\n//   [in~ 1] -> codebox~ in1\r\n//   codebox~ out1 -> [out~ 1]    codebox~ out2 -> [out~ 2]\r\n//   codebox~ out3/4/5 -> [snapshot~ 33] -> [outport pose] / [outport presence] / [outport holding]\r\n//   (a plugin host ignores the outports; the Max for Live face listens to them)\r\n//\r\n// What the port changed, and why:\r\n//   1. NO MEASURE-PHASE INLET. The gen~ version took phasor~ 1n @lock 1 from\r\n//      Live. A VST host may have no transport running and the H9000 has none\r\n//      at all; with the transport stopped a locked phasor stands still and the\r\n//      write head writes one slot forever. The ghost only ever needed the\r\n//      DISTANCE between the heads, never where the bar line is, so the write\r\n//      head now counts its own samples. Tempo arrives as the bpm param.\r\n//   2. THE TAPE IS SIZED FOR 96 kHz. gen~'s Data tape(192000) clipped any\r\n//      measure longer than 4 s at 48 kHz and 2 s at 96 kHz. 384000 slots hold\r\n//      one 4/4 measure down to 60 BPM at 96 kHz, 30 BPM at 48 kHz.\r\n//   3. THE TAPE LIVES IN THE CODEBOX, not a buffer~. The H9000's RNBO target\r\n//      does not support buffer~ yet; a FixedFloat64Array state does not need it.\r\n//\r\n// UNVERIFIED SEAMS — nothing here has been compiled in RNBO:\r\n//   a. FixedFloat64Array(384000): ~3 MB of state. Prior art in the palace uses\r\n//      it at 4097 slots; this size may be slow to compile or too big for a\r\n//      hardware target. If so, try FixedFloat32Array, or a [data tape 384000]\r\n//      bound with buffer(\"tape\").\r\n//   b. The measure is computed from bpm and samplerate once per sample; cheap,\r\n//      but a [param bpm] fed from [transport] is the seam most likely to need\r\n//      rewiring per target.\r\n// Mirrors portal_mirror.mjs, which runs this file's own text against the\r\n// face model sample for sample.\r\n\r\n@param({ min: 0.0, max: 1.0 }) gain = 0.0;        // the conduit: on the way OUT of the tape\r\n@param({ min: 0.25, max: 1.0 }) lag = 0.5;        // fraction of a measure: 0.25, 0.5 or 1\r\n@param({ min: 30.0, max: 300.0 }) bpm = 120.0;    // quarter notes per minute, 4/4\r\n@param({ min: 0.0, max: 1.0 }) thresh = 0.003;    // is anyone playing?\r\n@param({ min: 0.0, max: 16.0 }) pscale = 4.0;     // presence gain: a held phrase reads ~0.8\r\n\r\nconst TAPE = 384000;\r\n\r\n@state tape = new FixedFloat64Array(384000);\r\n@state w = 0;\r\n@state env = 0.0;\r\n@state listen = 0.0;\r\n@state gs = 0.0;\r\n@state penv = 0.0;\r\n@state lagA = 0.5;\r\n@state lagB = 0.5;\r\n@state lastlag = 0.5;\r\n@state fade = 0.0;\r\n@state target = 0.0;\r\n\r\nfunction wrapTo(x, n) {\r\n    let r = x - floor(x / n) * n;\r\n    return r >= n ? r - n : r;\r\n}\r\n\r\nlet M = min(floor(samplerate * 240.0 / bpm + 0.5), TAPE);   // samples per 4/4 measure\r\nif (w >= M) w = 0;                                          // the tempo dropped under the head\r\n\r\n// a new lag: the idle head jumps, then a 30 ms fade hands over to it\r\nif (lag != lastlag) {\r\n    if (target < 0.5) {\r\n        lagB = lag;\r\n        target = 1.0;\r\n    } else {\r\n        lagA = lag;\r\n        target = 0.0;\r\n    }\r\n    lastlag = lag;\r\n}\r\nlet xstep = 1000.0 / (30.0 * samplerate);\r\nfade = fade + clamp(target - fade, -xstep, xstep);\r\n\r\n// READ FIRST: at lag = 1 the read slot is the write slot, and reading\r\n// before writing means it hears one measure ago, not now.\r\nlet rA = floor(wrapTo(w - lagA * M, M));\r\nlet rB = floor(wrapTo(w - lagB * M, M));\r\nlet a0 = tape[rA];\r\nlet ghost = a0 + (tape[rB] - a0) * fade;\r\n\r\n// THEN WRITE. Silence keeps: listen while you play, hold in silence.\r\nlet x = in1;\r\nlet ax = abs(x);\r\nlet rel = exp(-1.0 / (samplerate * 0.1));      // 100 ms release\r\nenv = ax > env ? ax : env * rel;\r\nlet lstep = 1000.0 / (5.0 * samplerate);       // the input crossfade, 5 ms both ways\r\nlet want = env > thresh ? 1.0 : 0.0;\r\nlisten = listen + clamp(want - listen, -lstep, lstep);\r\nlet old = tape[w];\r\ntape[w] = old + listen * (x - old);\r\nw = w + 1;\r\nif (w >= M) w = 0;\r\n\r\n// the knob, slewed so a fast turn can't zipper\r\nlet gstep = 1000.0 / (20.0 * samplerate);\r\ngs = gs + clamp(gain - gs, -gstep, gstep);\r\n\r\nlet wet = gs * ghost;\r\nout1 = x + wet;\r\nout2 = x + wet;\r\n\r\n// FACE — three facts for the cat\r\nlet prel = exp(-1.0 / samplerate);             // 1 s release\r\nlet g = abs(ghost);\r\npenv = g > penv ? g : penv * prel;\r\nout3 = gs;\r\nout4 = clamp(penv * pscale, 0.0, 1.0);\r\nout5 = 1.0 - listen;\r\n",
									"fontname": "<Monospaced>",
									"numinlets": 1,
									"numoutlets": 5,
									"outlettype": [
										"signal",
										"signal",
										"signal",
										"signal",
										"signal"
									],
									"patching_rect": [
										20,
										100,
										760,
										620
									],
									"rnbo_classname": "codebox~"
								}
							},
							{
								"box": {
									"fontsize": 12,
									"id": "out-1",
									"maxclass": "newobj",
									"text": "out~ 1",
									"numinlets": 1,
									"numoutlets": 0,
									"outlettype": [],
									"patching_rect": [
										20,
										740,
										50,
										22
									],
									"rnbo_classname": "out~",
									"rnbo_extra_attributes": {
										"comment": "left",
										"meta": ""
									}
								}
							},
							{
								"box": {
									"fontsize": 12,
									"id": "out-2",
									"maxclass": "newobj",
									"text": "out~ 2",
									"numinlets": 1,
									"numoutlets": 0,
									"outlettype": [],
									"patching_rect": [
										140,
										740,
										50,
										22
									],
									"rnbo_classname": "out~",
									"rnbo_extra_attributes": {
										"comment": "right",
										"meta": ""
									}
								}
							},
							{
								"box": {
									"fontsize": 12,
									"id": "snap-pose",
									"maxclass": "newobj",
									"text": "snapshot~ 33",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										300,
										740,
										90,
										22
									],
									"rnbo_classname": "snapshot~"
								}
							},
							{
								"box": {
									"fontsize": 12,
									"id": "port-pose",
									"maxclass": "newobj",
									"text": "outport pose",
									"numinlets": 1,
									"numoutlets": 0,
									"outlettype": [],
									"patching_rect": [
										300,
										770,
										110,
										22
									],
									"rnbo_classname": "outport"
								}
							},
							{
								"box": {
									"fontsize": 12,
									"id": "snap-presence",
									"maxclass": "newobj",
									"text": "snapshot~ 33",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										460,
										740,
										90,
										22
									],
									"rnbo_classname": "snapshot~"
								}
							},
							{
								"box": {
									"fontsize": 12,
									"id": "port-presence",
									"maxclass": "newobj",
									"text": "outport presence",
									"numinlets": 1,
									"numoutlets": 0,
									"outlettype": [],
									"patching_rect": [
										460,
										770,
										110,
										22
									],
									"rnbo_classname": "outport"
								}
							},
							{
								"box": {
									"fontsize": 12,
									"id": "snap-holding",
									"maxclass": "newobj",
									"text": "snapshot~ 33",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										620,
										740,
										90,
										22
									],
									"rnbo_classname": "snapshot~"
								}
							},
							{
								"box": {
									"fontsize": 12,
									"id": "port-holding",
									"maxclass": "newobj",
									"text": "outport holding",
									"numinlets": 1,
									"numoutlets": 0,
									"outlettype": [],
									"patching_rect": [
										620,
										770,
										110,
										22
									],
									"rnbo_classname": "outport"
								}
							},
							{
								"box": {
									"fontsize": 12,
									"id": "c-face",
									"maxclass": "comment",
									"text": "the face listens to these about 30 times a second; a plugin host ignores them",
									"patching_rect": [
										300,
										800,
										480,
										20
									],
									"linecount": 2
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
										"snap-pose",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"snap-pose",
										0
									],
									"destination": [
										"port-pose",
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
										"snap-presence",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"snap-presence",
										0
									],
									"destination": [
										"port-presence",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"cb",
										4
									],
									"destination": [
										"snap-holding",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"snap-holding",
										0
									],
									"destination": [
										"port-holding",
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
					"fontsize": 12,
					"id": "dac",
					"maxclass": "ezdac~",
					"numinlets": 2,
					"numoutlets": 0,
					"patching_rect": [
						20,
						350,
						45,
						45
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "route",
					"maxclass": "newobj",
					"text": "route pose presence holding",
					"numinlets": 1,
					"numoutlets": 4,
					"outlettype": [
						"",
						"",
						"",
						""
					],
					"patching_rect": [
						300,
						350,
						200,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "f-pose",
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
						300,
						385,
						70,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "c-f-pose",
					"maxclass": "comment",
					"text": "pose",
					"patching_rect": [
						300,
						410,
						100,
						20
					],
					"linecount": 1
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "f-presence",
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
						410,
						385,
						70,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "c-f-presence",
					"maxclass": "comment",
					"text": "presence",
					"patching_rect": [
						410,
						410,
						100,
						20
					],
					"linecount": 1
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "f-holding",
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
						520,
						385,
						70,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "c-f-holding",
					"maxclass": "comment",
					"text": "holding",
					"patching_rect": [
						520,
						410,
						100,
						20
					],
					"linecount": 1
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "c-cat",
					"maxclass": "comment",
					"text": "These three numbers are what the cat from the fourth move reads: wire them to seance-cat.js (stage-4-character/jsui) through [prepend set_gain], [prepend presence], [prepend holding].",
					"patching_rect": [
						300,
						440,
						450,
						40
					],
					"linecount": 3
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "c-ref",
					"maxclass": "comment",
					"text": "Reference: portal-performance.wav is this codebox's own output through the séance performance; it matches the gen~ face model to the last bit.",
					"patching_rect": [
						20,
						500,
						700,
						20
					],
					"linecount": 2
				}
			}
		],
		"lines": [
			{
				"patchline": {
					"source": [
						"adc",
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
						"gslider",
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
						"pg",
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
						"rnbo",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"lq",
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
						"lh",
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
						"lw",
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
						"lm-bpm",
						0
					],
					"destination": [
						"bpm",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"bpm",
						0
					],
					"destination": [
						"pb",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"pb",
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
			},
			{
				"patchline": {
					"source": [
						"rnbo",
						2
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
						"route",
						0
					],
					"destination": [
						"f-pose",
						0
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
						"f-presence",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"route",
						2
					],
					"destination": [
						"f-holding",
						0
					]
				}
			}
		]
	}
}