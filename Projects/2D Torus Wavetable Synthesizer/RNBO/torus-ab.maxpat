{
	"patcher": {
		"fileversion": 1,
		"appversion": {
			"major": 8,
			"minor": 6,
			"revision": 0,
			"architecture": "x64",
			"modernui": 1
		},
		"classnamespace": "box",
		"rect": [
			60,
			60,
			980,
			1100
		],
		"bglocked": 0,
		"openinpresentation": 0,
		"default_fontsize": 12,
		"default_fontface": 0,
		"default_fontname": "Arial",
		"gridonopen": 1,
		"gridsize": [
			15,
			15
		],
		"boxes": [
			{
				"box": {
					"id": "obj-1",
					"maxclass": "comment",
					"numinlets": 1,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						20,
						10,
						900,
						22
					],
					"text": "2D TORUS WAVETABLE — the codebox against 2d.wave~. Built without Max: nothing here has been opened yet. Set the engine to 48 kHz, vector 64.",
					"linecount": 2
				}
			},
			{
				"box": {
					"id": "obj-2",
					"maxclass": "comment",
					"numinlets": 1,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						20,
						50,
						560,
						22
					],
					"text": "1 · the surface. Penrose loads on open; click another to swap. Every path reads this one buffer.",
					"linecount": 2
				}
			},
			{
				"box": {
					"id": "obj-3",
					"maxclass": "newobj",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"float",
						"bang"
					],
					"patching_rect": [
						20,
						80,
						300,
						22
					],
					"text": "buffer~ tablebuf \"/Users/loudonstearns/Documents/The Palace/Projects/2D Torus Wavetable Synthesizer/Wavetables/15_penrose_lattice.wav\""
				}
			},
			{
				"box": {
					"id": "obj-4",
					"maxclass": "newobj",
					"numinlets": 3,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						340,
						160,
						300,
						22
					],
					"text": "combine \"/Users/loudonstearns/Documents/The Palace/Projects/2D Torus Wavetable Synthesizer/Wavetables/\" s .wav @triggers 1"
				}
			},
			{
				"box": {
					"id": "obj-5",
					"maxclass": "newobj",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						650,
						160,
						110,
						22
					],
					"text": "prepend replace"
				}
			},
			{
				"box": {
					"id": "obj-6",
					"maxclass": "message",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						340,
						80,
						140,
						22
					],
					"text": "10_membrane"
				}
			},
			{
				"box": {
					"id": "obj-7",
					"maxclass": "message",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						490,
						80,
						140,
						22
					],
					"text": "11_chladni_ghost"
				}
			},
			{
				"box": {
					"id": "obj-8",
					"maxclass": "message",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						640,
						80,
						140,
						22
					],
					"text": "12_theta_surface"
				}
			},
			{
				"box": {
					"id": "obj-9",
					"maxclass": "message",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						340,
						106,
						140,
						22
					],
					"text": "13_stiff_string"
				}
			},
			{
				"box": {
					"id": "obj-10",
					"maxclass": "message",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						490,
						106,
						140,
						22
					],
					"text": "14_knot_shadow"
				}
			},
			{
				"box": {
					"id": "obj-11",
					"maxclass": "message",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						640,
						106,
						140,
						22
					],
					"text": "15_penrose_lattice"
				}
			},
			{
				"box": {
					"id": "obj-12",
					"maxclass": "message",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						340,
						132,
						140,
						22
					],
					"text": "16_kuramoto_bloom"
				}
			},
			{
				"box": {
					"id": "obj-13",
					"maxclass": "message",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						490,
						132,
						140,
						22
					],
					"text": "17_matern_field"
				}
			},
			{
				"box": {
					"id": "obj-14",
					"maxclass": "message",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						640,
						132,
						140,
						22
					],
					"text": "18_fisher_ridge"
				}
			},
			{
				"box": {
					"id": "obj-15",
					"maxclass": "newobj",
					"numinlets": 1,
					"numoutlets": 9,
					"outlettype": [
						"",
						"",
						"",
						"",
						"",
						"",
						"",
						"",
						""
					],
					"patching_rect": [
						20,
						110,
						100,
						22
					],
					"text": "info~ tablebuf"
				}
			},
			{
				"box": {
					"id": "obj-16",
					"maxclass": "flonum",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"",
						"bang"
					],
					"patching_rect": [
						20,
						140,
						90,
						22
					],
					"format": 6
				}
			},
			{
				"box": {
					"id": "obj-17",
					"maxclass": "comment",
					"numinlets": 1,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						115,
						140,
						200,
						22
					],
					"text": "← should read 1048576 frames",
					"linecount": 1
				}
			},
			{
				"box": {
					"id": "obj-18",
					"maxclass": "comment",
					"numinlets": 1,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						20,
						180,
						700,
						22
					],
					"text": "2 · the four tests from the README, in order. Each sets base Hz and ratio. Reset puts the shared phasors at 0.",
					"linecount": 2
				}
			},
			{
				"box": {
					"id": "obj-19",
					"maxclass": "newobj",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"float",
						"float"
					],
					"patching_rect": [
						20,
						240,
						80,
						22
					],
					"text": "unpack f f"
				}
			},
			{
				"box": {
					"id": "obj-20",
					"maxclass": "message",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20,
						210,
						100,
						22
					],
					"text": "220 0"
				}
			},
			{
				"box": {
					"id": "obj-21",
					"maxclass": "comment",
					"numinlets": 1,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						20,
						232,
						100,
						22
					],
					"text": "static row",
					"linecount": 1
				}
			},
			{
				"box": {
					"id": "obj-22",
					"maxclass": "message",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						130,
						210,
						100,
						22
					],
					"text": "0.5 1000"
				}
			},
			{
				"box": {
					"id": "obj-23",
					"maxclass": "comment",
					"numinlets": 1,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						130,
						232,
						100,
						22
					],
					"text": "static column",
					"linecount": 1
				}
			},
			{
				"box": {
					"id": "obj-24",
					"maxclass": "message",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						240,
						210,
						100,
						22
					],
					"text": "220 1.5"
				}
			},
			{
				"box": {
					"id": "obj-25",
					"maxclass": "comment",
					"numinlets": 1,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						240,
						232,
						100,
						22
					],
					"text": "closed orbit",
					"linecount": 1
				}
			},
			{
				"box": {
					"id": "obj-26",
					"maxclass": "message",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						350,
						210,
						100,
						22
					],
					"text": "220 1.500625"
				}
			},
			{
				"box": {
					"id": "obj-27",
					"maxclass": "comment",
					"numinlets": 1,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						350,
						232,
						100,
						22
					],
					"text": "shimmer",
					"linecount": 1
				}
			},
			{
				"box": {
					"id": "obj-28",
					"maxclass": "flonum",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"",
						"bang"
					],
					"patching_rect": [
						20,
						270,
						70,
						22
					],
					"format": 6
				}
			},
			{
				"box": {
					"id": "obj-29",
					"maxclass": "flonum",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"",
						"bang"
					],
					"patching_rect": [
						120,
						270,
						70,
						22
					],
					"format": 6
				}
			},
			{
				"box": {
					"id": "obj-30",
					"maxclass": "comment",
					"numinlets": 1,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						200,
						270,
						120,
						22
					],
					"text": "base Hz · ratio",
					"linecount": 1
				}
			},
			{
				"box": {
					"id": "obj-31",
					"maxclass": "message",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						470,
						210,
						30,
						22
					],
					"text": "0"
				}
			},
			{
				"box": {
					"id": "obj-32",
					"maxclass": "comment",
					"numinlets": 1,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						505,
						210,
						50,
						22
					],
					"text": "reset",
					"linecount": 1
				}
			},
			{
				"box": {
					"id": "obj-33",
					"maxclass": "comment",
					"numinlets": 1,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						420,
						270,
						180,
						22
					],
					"text": "on open: shimmer, gain 1 →",
					"linecount": 2
				}
			},
			{
				"box": {
					"id": "obj-34",
					"maxclass": "newobj",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20,
						305,
						60,
						22
					],
					"text": "pak f f"
				}
			},
			{
				"box": {
					"id": "obj-35",
					"maxclass": "newobj",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20,
						335,
						100,
						22
					],
					"text": "expr $f1 * $f2"
				}
			},
			{
				"box": {
					"id": "obj-36",
					"maxclass": "newobj",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						"bang"
					],
					"patching_rect": [
						600,
						270,
						70,
						22
					],
					"text": "loadbang"
				}
			},
			{
				"box": {
					"id": "obj-37",
					"maxclass": "message",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						600,
						300,
						100,
						22
					],
					"text": "220 1.500625"
				}
			},
			{
				"box": {
					"id": "obj-38",
					"maxclass": "newobj",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						"signal"
					],
					"patching_rect": [
						20,
						380,
						70,
						22
					],
					"text": "phasor~"
				}
			},
			{
				"box": {
					"id": "obj-39",
					"maxclass": "newobj",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						"signal"
					],
					"patching_rect": [
						130,
						380,
						70,
						22
					],
					"text": "phasor~"
				}
			},
			{
				"box": {
					"id": "obj-40",
					"maxclass": "comment",
					"numinlets": 1,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						220,
						380,
						380,
						22
					],
					"text": "x phase · y phase — the same two signals feed path B and path A2",
					"linecount": 2
				}
			},
			{
				"box": {
					"id": "obj-41",
					"maxclass": "newobj",
					"numinlets": 4,
					"numoutlets": 1,
					"outlettype": [
						"signal"
					],
					"patching_rect": [
						20,
						430,
						200,
						22
					],
					"text": "2d.wave~ tablebuf @rows 1024"
				}
			},
			{
				"box": {
					"id": "obj-42",
					"maxclass": "comment",
					"numinlets": 1,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						230,
						430,
						440,
						22
					],
					"text": "B · 2d.wave~ (the reference). If it ignores @rows, set its rows to 1024 by hand. Force linear interpolation if it offers a choice.",
					"linecount": 3
				}
			},
			{
				"box": {
					"id": "obj-43",
					"maxclass": "newobj",
					"numinlets": 2,
					"numoutlets": 2,
					"outlettype": [
						"signal",
						"list"
					],
					"patching_rect": [
						20,
						480,
						70,
						22
					],
					"text": "rnbo~",
					"patcher": {
						"fileversion": 1,
						"appversion": {
							"major": 8,
							"minor": 6,
							"revision": 0,
							"architecture": "x64",
							"modernui": 1
						},
						"classnamespace": "rnbo",
						"rect": [
							100,
							100,
							600,
							520
						],
						"default_fontsize": 12,
						"default_fontface": 0,
						"default_fontname": "Arial",
						"boxes": [
							{
								"box": {
									"id": "obj-1",
									"maxclass": "comment",
									"numinlets": 1,
									"numoutlets": 0,
									"outlettype": [],
									"patching_rect": [
										20,
										10,
										520,
										22
									],
									"text": "torus_2d_lookup_extphase.codebox — pasted verbatim. If this rnbo~ will not compile, make a fresh rnbo~, drop in a codebox~ and paste the file.",
									"linecount": 2
								}
							},
							{
								"box": {
									"id": "obj-2",
									"maxclass": "newobj",
									"numinlets": 1,
									"numoutlets": 2,
									"outlettype": [
										"",
										""
									],
									"patching_rect": [
										20,
										50,
										120,
										22
									],
									"text": "buffer~ tablebuf"
								}
							},
							{
								"box": {
									"id": "obj-3",
									"maxclass": "comment",
									"numinlets": 1,
									"numoutlets": 0,
									"outlettype": [],
									"patching_rect": [
										150,
										50,
										300,
										22
									],
									"text": "binds to the parent patch's buffer~ tablebuf",
									"linecount": 2
								}
							},
							{
								"box": {
									"id": "obj-4",
									"maxclass": "newobj",
									"numinlets": 1,
									"numoutlets": 1,
									"outlettype": [
										"signal"
									],
									"patching_rect": [
										20,
										90,
										51,
										22
									],
									"text": "in~ 1"
								}
							},
							{
								"box": {
									"id": "obj-5",
									"maxclass": "newobj",
									"numinlets": 1,
									"numoutlets": 1,
									"outlettype": [
										"signal"
									],
									"patching_rect": [
										140,
										90,
										51,
										22
									],
									"text": "in~ 2"
								}
							},
							{
								"box": {
									"id": "obj-6",
									"maxclass": "codebox~",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										"signal"
									],
									"patching_rect": [
										20,
										130,
										520,
										300
									],
									"code": "// =====================================================================\n// torus_2d_lookup_extphase.codebox\n//\n// The bare lookup from torus_2d_lookup.codebox with its two phasors\n// taken OUT. The read position arrives on two signal inlets, so the\n// same two [phasor~] objects can drive this and [2d.wave~] at once.\n// Written 2026-10-14 (cycle 21) for RNBO/torus-ab.maxpat. UNVERIFIED in\n// Max.\n//\n// Why a second codebox: the free-running one counts its own phase, so\n// A - B against [2d.wave~] mixes two questions — is the lookup right,\n// and do two phase counters agree? Fed the same phases, A - B asks only\n// the first. If this one nulls and the free-running one does not, the\n// lookup is right and the difference is the counters.\n//\n// lookup2D() below is copied verbatim from torus_2d_lookup.codebox;\n// null_fingerprints.mjs checks that the two copies have not drifted.\n//\n// PATCHER WIRING (inside rnbo~):\n//   [in~ 1] x phase 0..1   [in~ 2] y phase 0..1\n//   [buffer~ tablebuf]     bound to the parent patch's buffer~\n//   [codebox~ out1] -> [out~ 1]\n// =====================================================================\n\n// --- Surface dimensions (must match the WAV) ---\nconst SURFACE_W = 1024;          // X resolution (samples per row)\nconst SURFACE_H = 1024;          // Y resolution (number of rows)\nconst SURFACE_LEN = 1048576;     // SURFACE_W * SURFACE_H\n\n// --- Bilinear lookup helper ---\n// pos1, pos2 are normalized phases in [0, 1) — we wrap and scale to\n// integer-and-fractional surface coordinates inside the function.\nfunction lookup2D(pos1, pos2) {\n    // Wrap into [0, 1) — phasor accumulators above already wrap, but\n    // belt-and-suspenders here for safety.\n    let p1 = pos1 - floor(pos1);\n    let p2 = pos2 - floor(pos2);\n\n    // Scale to surface coords (X is row-internal, Y is row-index).\n    // Convention chosen to match [2d.wave~]: position-along-row = X = phi1,\n    // row-select                = Y = phi2.\n    let xf = p1 * SURFACE_W;\n    let yf = p2 * SURFACE_H;\n\n    let x0 = floor(xf);\n    let y0 = floor(yf);\n    let xfrac = xf - x0;\n    let yfrac = yf - y0;\n\n    // Wrap neighbours on the torus (periodic boundary).\n    let x1 = x0 + 1; if (x1 >= SURFACE_W) x1 = 0;\n    let y1 = y0 + 1; if (y1 >= SURFACE_H) y1 = 0;\n\n    // Flatten 2D coords to 1D buffer indices: idx = row * SURFACE_W + col.\n    let idx00 = y0 * SURFACE_W + x0;\n    let idx10 = y0 * SURFACE_W + x1;\n    let idx01 = y1 * SURFACE_W + x0;\n    let idx11 = y1 * SURFACE_W + x1;\n\n    // peek() reads the sample at the given index from buffer \"tablebuf\",\n    // channel 0. RNBO's peek operator has signature peek(buffer, index, channel).\n    let s00 = peek(\"tablebuf\", idx00, 0);\n    let s10 = peek(\"tablebuf\", idx10, 0);\n    let s01 = peek(\"tablebuf\", idx01, 0);\n    let s11 = peek(\"tablebuf\", idx11, 0);\n\n    // Bilinear blend: lerp along X for both Y rows, then lerp along Y.\n    let row0 = s00 + xfrac * (s10 - s00);\n    let row1 = s01 + xfrac * (s11 - s01);\n    let s    = row0 + yfrac * (row1 - row0);\n\n    return s;\n}\n\n// --- Per-sample tick: the read point comes from outside ---\nout1 = lookup2D(in1, in2);\n",
									"fontface": 0,
									"fontname": "<Monospaced>",
									"fontsize": 12
								}
							},
							{
								"box": {
									"id": "obj-7",
									"maxclass": "newobj",
									"numinlets": 1,
									"numoutlets": 0,
									"outlettype": [],
									"patching_rect": [
										20,
										450,
										60,
										22
									],
									"text": "out~ 1"
								}
							}
						],
						"lines": [
							{
								"patchline": {
									"source": [
										"obj-4",
										0
									],
									"destination": [
										"obj-6",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-5",
										0
									],
									"destination": [
										"obj-6",
										1
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-6",
										0
									],
									"destination": [
										"obj-7",
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
					"id": "obj-44",
					"maxclass": "comment",
					"numinlets": 1,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						100,
						480,
						560,
						22
					],
					"text": "A2 · the codebox lookup, fed the same phases. This is the real test: only the surface reading can differ.",
					"linecount": 2
				}
			},
			{
				"box": {
					"id": "obj-45",
					"maxclass": "newobj",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"signal",
						"list"
					],
					"patching_rect": [
						20,
						530,
						70,
						22
					],
					"text": "rnbo~",
					"patcher": {
						"fileversion": 1,
						"appversion": {
							"major": 8,
							"minor": 6,
							"revision": 0,
							"architecture": "x64",
							"modernui": 1
						},
						"classnamespace": "rnbo",
						"rect": [
							100,
							100,
							600,
							520
						],
						"default_fontsize": 12,
						"default_fontface": 0,
						"default_fontname": "Arial",
						"boxes": [
							{
								"box": {
									"id": "obj-1",
									"maxclass": "comment",
									"numinlets": 1,
									"numoutlets": 0,
									"outlettype": [],
									"patching_rect": [
										20,
										10,
										520,
										22
									],
									"text": "torus_2d_lookup.codebox — pasted verbatim. If this rnbo~ will not compile, make a fresh rnbo~, drop in a codebox~ and paste the file.",
									"linecount": 2
								}
							},
							{
								"box": {
									"id": "obj-2",
									"maxclass": "newobj",
									"numinlets": 1,
									"numoutlets": 2,
									"outlettype": [
										"",
										""
									],
									"patching_rect": [
										20,
										50,
										120,
										22
									],
									"text": "buffer~ tablebuf"
								}
							},
							{
								"box": {
									"id": "obj-3",
									"maxclass": "comment",
									"numinlets": 1,
									"numoutlets": 0,
									"outlettype": [],
									"patching_rect": [
										150,
										50,
										300,
										22
									],
									"text": "binds to the parent patch's buffer~ tablebuf",
									"linecount": 2
								}
							},
							{
								"box": {
									"id": "obj-4",
									"maxclass": "codebox~",
									"numinlets": 1,
									"numoutlets": 1,
									"outlettype": [
										"signal"
									],
									"patching_rect": [
										20,
										130,
										520,
										300
									],
									"code": "// =====================================================================\n// torus_2d_lookup.codebox\n//\n// 2D torus wavetable scanner for the [[2D Torus Wavetable Synthesizer]]\n// project. Reads a 1024x1024 surface stored as a flat 1,048,576-sample\n// mono buffer, scans it with two phasors at omega1 and omega2, and\n// outputs the bilinearly-interpolated surface value as audio.\n//\n// This is the smallest playable instance — no warps yet. Once this\n// validates against Max's [2d.wave~] reading the same buffer with\n// rows 1024, the warp catalog (Tier-1 first) earns its turn.\n//\n// PATCHER WIRING REQUIRED (outside this codebox~):\n//   1. [buffer~ tablebuf <pathto>/15_penrose_lattice.wav]\n//        — the surface; mono 32-bit float 48 kHz, 1024 x 1024 samples.\n//   2. The codebox~ object MUST be told to bind to that buffer. In RNBO,\n//      the buffer reference is declared OUTSIDE the codebox~ as a\n//      [buffer] operator with the same name as used in peek() below.\n//      Add a [buffer tablebuf @file 15_penrose_lattice.wav] inside the\n//      rnbo~ subpatcher so peek(\"tablebuf\", ...) resolves correctly.\n//   3. [param baseHz] and [param ratio] driven from your two number boxes\n//      / sliders in the parent patch.\n//   4. [codebox~ out1] -> [out~ 1]  (mono; duplicate to out 2 for stereo)\n//\n// A/B HARNESS (outside the rnbo~ subpatcher):\n//   The same Max [buffer~ tablebuf] feeds:\n//     (A) the rnbo~ subpatcher containing this codebox~  -> output A\n//     (B) a parallel [2d.wave~ tablebuf @rows 1024]\n//         driven by two [phasor~] objects at the same baseHz and\n//         baseHz * ratio                                -> output B\n//   Patch both into a [matrix~ 2 1] or a simple toggle so you can A/B\n//   switch instantly. Optionally subtract A - B and meter the\n//   difference; if the math is correct, it should be at numerical-noise\n//   floor (under -100 dB).\n// =====================================================================\n\n// --- Surface dimensions (must match the WAV) ---\nconst SURFACE_W = 1024;          // X resolution (samples per row)\nconst SURFACE_H = 1024;          // Y resolution (number of rows)\nconst SURFACE_LEN = 1048576;     // SURFACE_W * SURFACE_H\n\n// --- Parameters ---\n@param({ min: 20.0,   max: 2000.0 }) baseHz = 220.0;        // omega1 / 2pi\n@param({ min: 0.1,    max: 4.0    }) ratio  = 1.500625;     // omega2 / omega1; 3:2 + tiny irrational detune\n@param({ min: 0.0,    max: 1.0    }) gain   = 0.5;          // output level\n\n// --- Phase accumulators (free-running, normalized 0..1) ---\n@state phi1 = 0.0;\n@state phi2 = 0.0;\n\n// --- Bilinear lookup helper ---\n// pos1, pos2 are normalized phases in [0, 1) — we wrap and scale to\n// integer-and-fractional surface coordinates inside the function.\nfunction lookup2D(pos1, pos2) {\n    // Wrap into [0, 1) — phasor accumulators above already wrap, but\n    // belt-and-suspenders here for safety.\n    let p1 = pos1 - floor(pos1);\n    let p2 = pos2 - floor(pos2);\n\n    // Scale to surface coords (X is row-internal, Y is row-index).\n    // Convention chosen to match [2d.wave~]: position-along-row = X = phi1,\n    // row-select                = Y = phi2.\n    let xf = p1 * SURFACE_W;\n    let yf = p2 * SURFACE_H;\n\n    let x0 = floor(xf);\n    let y0 = floor(yf);\n    let xfrac = xf - x0;\n    let yfrac = yf - y0;\n\n    // Wrap neighbours on the torus (periodic boundary).\n    let x1 = x0 + 1; if (x1 >= SURFACE_W) x1 = 0;\n    let y1 = y0 + 1; if (y1 >= SURFACE_H) y1 = 0;\n\n    // Flatten 2D coords to 1D buffer indices: idx = row * SURFACE_W + col.\n    let idx00 = y0 * SURFACE_W + x0;\n    let idx10 = y0 * SURFACE_W + x1;\n    let idx01 = y1 * SURFACE_W + x0;\n    let idx11 = y1 * SURFACE_W + x1;\n\n    // peek() reads the sample at the given index from buffer \"tablebuf\",\n    // channel 0. RNBO's peek operator has signature peek(buffer, index, channel).\n    let s00 = peek(\"tablebuf\", idx00, 0);\n    let s10 = peek(\"tablebuf\", idx10, 0);\n    let s01 = peek(\"tablebuf\", idx01, 0);\n    let s11 = peek(\"tablebuf\", idx11, 0);\n\n    // Bilinear blend: lerp along X for both Y rows, then lerp along Y.\n    let row0 = s00 + xfrac * (s10 - s00);\n    let row1 = s01 + xfrac * (s11 - s01);\n    let s    = row0 + yfrac * (row1 - row0);\n\n    return s;\n}\n\n// --- Per-sample tick ---\nlet f1 = baseHz;\nlet f2 = baseHz * ratio;\n\n// Advance phase accumulators (normalized 0..1, wrap).\nphi1 = phi1 + f1 / samplerate;\nphi2 = phi2 + f2 / samplerate;\nif (phi1 >= 1.0) phi1 = phi1 - floor(phi1);\nif (phi2 >= 1.0) phi2 = phi2 - floor(phi2);\n\n// Sample the surface and emit.\nlet y = lookup2D(phi1, phi2);\nout1 = y * gain;\n\n// =====================================================================\n// VERIFICATION CHECKLIST (run in this order before adding warps)\n//\n// 1. Static row test. Set ratio = 0.0 (so phi2 freezes at its initial\n//    value 0). The output should be the X = 0 row of the surface played\n//    at baseHz — for Penrose, a complex but periodic timbre. Switch to\n//    [2d.wave~] with the same setup; should be sonically identical.\n//\n// 2. Static column test. Set baseHz very low (e.g. 0.5 Hz) and ratio\n//    very high (e.g. 1000) so phi1 effectively freezes. Output should\n//    be the Y = 0 column played at ~baseHz*ratio. Same sound from both\n//    paths.\n//\n// 3. Closed-orbit test. baseHz = 220, ratio = 1.5 (exact 3:2). Output\n//    should be perfectly periodic at 220/2 = 110 Hz fundamental.\n//    Signal should look stable on a [scope~]. Both paths identical.\n//\n// 4. Kronecker shimmer test. baseHz = 220, ratio = 1.500625 (slight\n//    irrational). The signal should not close — listen for the\n//    characteristic slow-drift shimmer. A spectrum analyzer should\n//    show partials at every (m + 1.500625*n) * 220 Hz for nonzero\n//    surface coefficients (m,n).\n//\n// 5. Difference monitor. With both paths active and identical params,\n//    the (A - B) difference signal should be at numerical-noise floor.\n//    If it isn't, the most likely culprits (in order):\n//      - X/Y axis convention swapped between paths\n//      - peek channel index not 0\n//      - 1-sample phase offset between this codebox and [2d.wave~]\n//        (they may initialize phasors differently)\n//      - sample-rate mismatch between WAV (48 kHz) and DSP (44.1 kHz)\n//\n// =====================================================================\n",
									"fontface": 0,
									"fontname": "<Monospaced>",
									"fontsize": 12
								}
							},
							{
								"box": {
									"id": "obj-5",
									"maxclass": "newobj",
									"numinlets": 1,
									"numoutlets": 0,
									"outlettype": [],
									"patching_rect": [
										20,
										450,
										60,
										22
									],
									"text": "out~ 1"
								}
							}
						],
						"lines": [
							{
								"patchline": {
									"source": [
										"obj-4",
										0
									],
									"destination": [
										"obj-5",
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
					"id": "obj-46",
					"maxclass": "newobj",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20,
						560,
						110,
						22
					],
					"text": "prepend baseHz"
				}
			},
			{
				"box": {
					"id": "obj-47",
					"maxclass": "newobj",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						140,
						560,
						100,
						22
					],
					"text": "prepend ratio"
				}
			},
			{
				"box": {
					"id": "obj-48",
					"maxclass": "message",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						260,
						560,
						60,
						22
					],
					"text": "gain 1"
				}
			},
			{
				"box": {
					"id": "obj-49",
					"maxclass": "comment",
					"numinlets": 1,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						100,
						530,
						560,
						22
					],
					"text": "A1 · the codebox as written, its own phase counter (gain 1 so it matches B). The one you will play.",
					"linecount": 2
				}
			},
			{
				"box": {
					"id": "obj-50",
					"maxclass": "comment",
					"numinlets": 1,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						20,
						610,
						700,
						22
					],
					"text": "4 · A − B, peak in dB. The pass bar is below −100. Read null_fingerprints.json for what any other number means.",
					"linecount": 2
				}
			},
			{
				"box": {
					"id": "obj-51",
					"maxclass": "newobj",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						"signal"
					],
					"patching_rect": [
						20,
						640,
						40,
						22
					],
					"text": "-~"
				}
			},
			{
				"box": {
					"id": "obj-52",
					"maxclass": "newobj",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						"float"
					],
					"patching_rect": [
						20,
						670,
						100,
						22
					],
					"text": "peakamp~ 250"
				}
			},
			{
				"box": {
					"id": "obj-53",
					"maxclass": "newobj",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						"float"
					],
					"patching_rect": [
						20,
						700,
						50,
						22
					],
					"text": "atodb"
				}
			},
			{
				"box": {
					"id": "obj-54",
					"maxclass": "flonum",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"",
						"bang"
					],
					"patching_rect": [
						20,
						730,
						90,
						22
					],
					"format": 6
				}
			},
			{
				"box": {
					"id": "obj-55",
					"maxclass": "comment",
					"numinlets": 1,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						115,
						730,
						220,
						22
					],
					"text": "A2 − B: is the lookup right?",
					"linecount": 1
				}
			},
			{
				"box": {
					"id": "obj-56",
					"maxclass": "newobj",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						"signal"
					],
					"patching_rect": [
						360,
						640,
						40,
						22
					],
					"text": "-~"
				}
			},
			{
				"box": {
					"id": "obj-57",
					"maxclass": "newobj",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						"float"
					],
					"patching_rect": [
						360,
						670,
						100,
						22
					],
					"text": "peakamp~ 250"
				}
			},
			{
				"box": {
					"id": "obj-58",
					"maxclass": "newobj",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						"float"
					],
					"patching_rect": [
						360,
						700,
						50,
						22
					],
					"text": "atodb"
				}
			},
			{
				"box": {
					"id": "obj-59",
					"maxclass": "flonum",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"",
						"bang"
					],
					"patching_rect": [
						360,
						730,
						90,
						22
					],
					"format": 6
				}
			},
			{
				"box": {
					"id": "obj-60",
					"maxclass": "comment",
					"numinlets": 1,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						455,
						730,
						220,
						22
					],
					"text": "A1 − B: do the phase counters agree too?",
					"linecount": 2
				}
			},
			{
				"box": {
					"id": "obj-61",
					"maxclass": "scope~",
					"numinlets": 2,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						20,
						770,
						300,
						120
					]
				}
			},
			{
				"box": {
					"id": "obj-62",
					"maxclass": "newobj",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						"signal"
					],
					"patching_rect": [
						340,
						770,
						60,
						22
					],
					"text": "*~ 1000"
				}
			},
			{
				"box": {
					"id": "obj-63",
					"maxclass": "comment",
					"numinlets": 1,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						410,
						770,
						300,
						22
					],
					"text": "the A2 − B error on a scope, and ×1000 so you can hear it",
					"linecount": 2
				}
			},
			{
				"box": {
					"id": "obj-64",
					"maxclass": "comment",
					"numinlets": 1,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						20,
						910,
						760,
						22
					],
					"text": "5 · listen: 1 A1 codebox · 2 A2 codebox on shared phases · 3 B 2d.wave~ · 4 the error ×1000. Toggle 1 and 3 while it plays.",
					"linecount": 2
				}
			},
			{
				"box": {
					"id": "obj-65",
					"maxclass": "umenu",
					"numinlets": 1,
					"numoutlets": 3,
					"outlettype": [
						"int",
						"",
						""
					],
					"patching_rect": [
						20,
						940,
						200,
						22
					],
					"items": [
						"A1 codebox",
						",",
						"A2 codebox, shared phases",
						",",
						"B 2d.wave~",
						",",
						"error x1000"
					]
				}
			},
			{
				"box": {
					"id": "obj-66",
					"maxclass": "newobj",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						230,
						940,
						40,
						22
					],
					"text": "+ 1"
				}
			},
			{
				"box": {
					"id": "obj-67",
					"maxclass": "newobj",
					"numinlets": 5,
					"numoutlets": 1,
					"outlettype": [
						"signal"
					],
					"patching_rect": [
						20,
						975,
						100,
						22
					],
					"text": "selector~ 4 3"
				}
			},
			{
				"box": {
					"id": "obj-68",
					"maxclass": "newobj",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						"signal"
					],
					"patching_rect": [
						20,
						1005,
						60,
						22
					],
					"text": "*~ 0.25"
				}
			},
			{
				"box": {
					"id": "obj-69",
					"maxclass": "ezdac~",
					"numinlets": 2,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						20,
						1040,
						45,
						22
					]
				}
			},
			{
				"box": {
					"id": "obj-70",
					"maxclass": "comment",
					"numinlets": 1,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						90,
						1005,
						300,
						22
					],
					"text": "starts quiet (×0.25) — the surfaces are full-scale",
					"linecount": 2
				}
			}
		],
		"lines": [
			{
				"patchline": {
					"source": [
						"obj-4",
						0
					],
					"destination": [
						"obj-5",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-5",
						0
					],
					"destination": [
						"obj-3",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-6",
						0
					],
					"destination": [
						"obj-4",
						1
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-7",
						0
					],
					"destination": [
						"obj-4",
						1
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-8",
						0
					],
					"destination": [
						"obj-4",
						1
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-9",
						0
					],
					"destination": [
						"obj-4",
						1
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-10",
						0
					],
					"destination": [
						"obj-4",
						1
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-11",
						0
					],
					"destination": [
						"obj-4",
						1
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-12",
						0
					],
					"destination": [
						"obj-4",
						1
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-13",
						0
					],
					"destination": [
						"obj-4",
						1
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-14",
						0
					],
					"destination": [
						"obj-4",
						1
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-3",
						1
					],
					"destination": [
						"obj-15",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-15",
						6
					],
					"destination": [
						"obj-16",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-20",
						0
					],
					"destination": [
						"obj-19",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-22",
						0
					],
					"destination": [
						"obj-19",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-24",
						0
					],
					"destination": [
						"obj-19",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-26",
						0
					],
					"destination": [
						"obj-19",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-19",
						0
					],
					"destination": [
						"obj-28",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-19",
						1
					],
					"destination": [
						"obj-29",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-28",
						0
					],
					"destination": [
						"obj-34",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-29",
						0
					],
					"destination": [
						"obj-34",
						1
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-34",
						0
					],
					"destination": [
						"obj-35",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-36",
						0
					],
					"destination": [
						"obj-37",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-37",
						0
					],
					"destination": [
						"obj-19",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-28",
						0
					],
					"destination": [
						"obj-38",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-35",
						0
					],
					"destination": [
						"obj-39",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-31",
						0
					],
					"destination": [
						"obj-38",
						1
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-31",
						0
					],
					"destination": [
						"obj-39",
						1
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-38",
						0
					],
					"destination": [
						"obj-41",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-39",
						0
					],
					"destination": [
						"obj-41",
						1
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-38",
						0
					],
					"destination": [
						"obj-43",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-39",
						0
					],
					"destination": [
						"obj-43",
						1
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-28",
						0
					],
					"destination": [
						"obj-46",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-29",
						0
					],
					"destination": [
						"obj-47",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-46",
						0
					],
					"destination": [
						"obj-45",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-47",
						0
					],
					"destination": [
						"obj-45",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-36",
						0
					],
					"destination": [
						"obj-48",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-48",
						0
					],
					"destination": [
						"obj-45",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-43",
						0
					],
					"destination": [
						"obj-51",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-41",
						0
					],
					"destination": [
						"obj-51",
						1
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-51",
						0
					],
					"destination": [
						"obj-52",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-52",
						0
					],
					"destination": [
						"obj-53",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-53",
						0
					],
					"destination": [
						"obj-54",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-45",
						0
					],
					"destination": [
						"obj-56",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-41",
						0
					],
					"destination": [
						"obj-56",
						1
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-56",
						0
					],
					"destination": [
						"obj-57",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-57",
						0
					],
					"destination": [
						"obj-58",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-58",
						0
					],
					"destination": [
						"obj-59",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-51",
						0
					],
					"destination": [
						"obj-61",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-51",
						0
					],
					"destination": [
						"obj-62",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-65",
						0
					],
					"destination": [
						"obj-66",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-66",
						0
					],
					"destination": [
						"obj-67",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-45",
						0
					],
					"destination": [
						"obj-67",
						1
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-43",
						0
					],
					"destination": [
						"obj-67",
						2
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-41",
						0
					],
					"destination": [
						"obj-67",
						3
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-62",
						0
					],
					"destination": [
						"obj-67",
						4
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-67",
						0
					],
					"destination": [
						"obj-68",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-68",
						0
					],
					"destination": [
						"obj-69",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-68",
						0
					],
					"destination": [
						"obj-69",
						1
					]
				}
			}
		]
	}
}