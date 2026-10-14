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
			960,
			560
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
					"text": "The believing cloud. Hold a chord and keep holding: the clicks condense into it."
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "c-how",
					"maxclass": "comment",
					"text": "Play the keyboard below, or any MIDI keyboard (midiin). Turn the dac on. If the rnbo~ will not compile, read the UNVERIFIED SEAMS at the top of the codebox~.",
					"patching_rect": [
						20,
						40,
						900,
						20
					],
					"linecount": 2
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "kb",
					"maxclass": "kslider",
					"mode": 1,
					"numinlets": 2,
					"numoutlets": 2,
					"outlettype": [
						"int",
						"int"
					],
					"parameter_enable": 0,
					"patching_rect": [
						20,
						80,
						336,
						53
					],
					"offset": 36,
					"range": 60
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "c-kb",
					"maxclass": "comment",
					"text": "polyphonic keyboard: click a key to hold it, click again to let go",
					"patching_rect": [
						370,
						95,
						300,
						20
					],
					"linecount": 2
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "pk",
					"maxclass": "newobj",
					"text": "pack i i",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20,
						140,
						60,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "mf",
					"maxclass": "newobj",
					"text": "midiformat",
					"numinlets": 7,
					"numoutlets": 1,
					"outlettype": [
						"int"
					],
					"patching_rect": [
						20,
						165,
						80,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "midiin",
					"maxclass": "newobj",
					"text": "midiin",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						"int"
					],
					"patching_rect": [
						120,
						165,
						55,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "flat",
					"maxclass": "message",
					"text": "priorShape 0",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						400,
						150,
						90,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "penta",
					"maxclass": "message",
					"text": "priorShape 1",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						500,
						150,
						90,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "paint",
					"maxclass": "message",
					"text": "priorShape 2",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						600,
						150,
						90,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "c-prior",
					"maxclass": "comment",
					"text": "the prior: flat · A-minor-pentatonic hills · the painted \"prior\" table",
					"patching_rect": [
						400,
						125,
						400,
						20
					],
					"linecount": 2
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "k-l-0",
					"maxclass": "comment",
					"text": "doubt",
					"patching_rect": [
						20,
						190,
						110,
						20
					],
					"linecount": 1
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "k-lm-0",
					"maxclass": "newobj",
					"text": "loadmess 0.25",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20,
						212,
						100,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "k-f-0",
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
						240,
						70,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "k-p-0",
					"maxclass": "newobj",
					"text": "prepend doubt",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20,
						268,
						110,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "k-l-1",
					"maxclass": "comment",
					"text": "tauFocus",
					"patching_rect": [
						140,
						190,
						110,
						20
					],
					"linecount": 1
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "k-lm-1",
					"maxclass": "newobj",
					"text": "loadmess 1.6",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						140,
						212,
						100,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "k-f-1",
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
						140,
						240,
						70,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "k-p-1",
					"maxclass": "newobj",
					"text": "prepend tauFocus",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						140,
						268,
						110,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "k-l-2",
					"maxclass": "comment",
					"text": "tauOff",
					"patching_rect": [
						260,
						190,
						110,
						20
					],
					"linecount": 1
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "k-lm-2",
					"maxclass": "newobj",
					"text": "loadmess 1.4",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						260,
						212,
						100,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "k-f-2",
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
						260,
						240,
						70,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "k-p-2",
					"maxclass": "newobj",
					"text": "prepend tauOff",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						260,
						268,
						110,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "k-l-3",
					"maxclass": "comment",
					"text": "rate",
					"patching_rect": [
						380,
						190,
						110,
						20
					],
					"linecount": 1
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "k-lm-3",
					"maxclass": "newobj",
					"text": "loadmess 160",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						380,
						212,
						100,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "k-f-3",
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
						380,
						240,
						70,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "k-p-3",
					"maxclass": "newobj",
					"text": "prepend rate",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						380,
						268,
						110,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "k-l-4",
					"maxclass": "comment",
					"text": "nMax",
					"patching_rect": [
						500,
						190,
						110,
						20
					],
					"linecount": 1
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "k-lm-4",
					"maxclass": "newobj",
					"text": "loadmess 128",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						500,
						212,
						100,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "k-f-4",
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
						500,
						240,
						70,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "k-p-4",
					"maxclass": "newobj",
					"text": "prepend nMax",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						500,
						268,
						110,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "rnbo",
					"maxclass": "newobj",
					"text": "rnbo~ @title belief-cloud",
					"numinlets": 1,
					"numoutlets": 4,
					"outlettype": [
						"signal",
						"signal",
						"signal",
						"list"
					],
					"patching_rect": [
						20,
						320,
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
					"varname": "belief-cloud",
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
							1000,
							900
						],
						"default_fontname": "Lato",
						"gridsize": [
							15,
							15
						],
						"title": "belief-cloud",
						"boxes": [
							{
								"box": {
									"fontsize": 12,
									"id": "c-in",
									"maxclass": "comment",
									"text": "MIDI arrives here. notein sends velocity, then pitch; notes-in stamps each press into the table \"held\".",
									"patching_rect": [
										20,
										10,
										640,
										20
									],
									"linecount": 2
								}
							},
							{
								"box": {
									"fontsize": 12,
									"id": "notein",
									"maxclass": "newobj",
									"text": "notein",
									"numinlets": 1,
									"numoutlets": 3,
									"outlettype": [
										"",
										"",
										""
									],
									"patching_rect": [
										20,
										40,
										70,
										22
									],
									"rnbo_classname": "notein"
								}
							},
							{
								"box": {
									"fontsize": 12,
									"id": "notes",
									"maxclass": "codebox",
									"code": "// =====================================================================\r\n// notes-in.codebox   (goes in an event-rate codebox — no tilde — inside\r\n// the rnbo~, beside belief-cloud.codebox)\r\n//\r\n// Turns MIDI notes into the shared `held` table that the grain cloud\r\n// reads. Each pitch's slot holds 0 while the key is up, or a press stamp\r\n// (1, 2, 3, … counting every press) while it is down. The stamps let the\r\n// cloud admit a chord's notes in the order they were played even though\r\n// they land in the same instant.\r\n//\r\n// in1 = pitch (hot, the leftmost inlet), in2 = velocity (cold). [notein]\r\n// sends velocity before pitch (right to left), so in2 is already set when\r\n// in1 fires. A note-on with velocity 0 counts as a release.\r\n//\r\n// UNVERIFIED: the poke argument order. The codebox reference shows\r\n// poke(buf, index, value); if the table fills with nonsense, swap to\r\n// poke(buf, value, index) — the gen order — in the two lines below.\r\n//\r\n// PATCHER WIRING REQUIRED: [data held 128]; [notein] outlet 0 → in1,\r\n// outlet 1 → in2. out1 echoes the stamp for a [print] while debugging.\r\n// =====================================================================\r\n\r\n@state held = buffer(\"held\");\r\n@state count = 0;\r\n\r\nlet pitch = floor(clamp(in1, 0, 127));\r\nlet stamp = 0;\r\nif (in2 > 0) {\r\n    count += 1;\r\n    stamp = count;\r\n}\r\npoke(held, pitch, stamp);\r\nout1 = stamp;\r\n",
									"fontname": "<Monospaced>",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										20,
										80,
										520,
										160
									],
									"rnbo_classname": "codebox"
								}
							},
							{
								"box": {
									"fontsize": 12,
									"id": "held",
									"maxclass": "newobj",
									"text": "data held 128",
									"numinlets": 1,
									"numoutlets": 2,
									"outlettype": [
										"",
										""
									],
									"patching_rect": [
										560,
										80,
										110,
										22
									],
									"rnbo_classname": "data"
								}
							},
							{
								"box": {
									"fontsize": 12,
									"id": "prior",
									"maxclass": "newobj",
									"text": "data prior 630",
									"numinlets": 1,
									"numoutlets": 2,
									"outlettype": [
										"",
										""
									],
									"patching_rect": [
										560,
										110,
										110,
										22
									],
									"rnbo_classname": "data"
								}
							},
							{
								"box": {
									"fontsize": 12,
									"id": "c-data",
									"maxclass": "comment",
									"text": "the shared tables, found by name from inside both codeboxes. \"prior\" is for a painted prior (priorShape 2).",
									"patching_rect": [
										680,
										80,
										300,
										60
									],
									"linecount": 3
								}
							},
							{
								"box": {
									"fontsize": 12,
									"id": "cb",
									"maxclass": "codebox~",
									"code": "// =====================================================================\r\n// belief-cloud.codebox   (goes in a codebox~ inside the rnbo~)\r\n//\r\n// The believing cloud as RNBO codebox~. Same instrument as the board\r\n// page (belief-instrument.html) and its engine (bayes_engine.js):\r\n//\r\n//   belief(pitch) = [ doubt·prior(pitch) + Σ weight·Gaussian(pitch; note, width) ]\r\n//                   / (doubt + Σ weight)\r\n//   cycles        = nMin · (nMax/nMin)^(closeness · weight · conviction)\r\n//   amplitude     ∝ sqrt(frequency / cycles)      every grain, equal energy\r\n//   onsets        Poisson at `rate` grains per second\r\n//   envelope      1 Hann cycle in, sustain, 1 Hann cycle out\r\n//\r\n// Each grain first picks the prior or a held note in proportion to their\r\n// weight, then draws a pitch inside that choice. A held note's width\r\n// narrows from 120 toward 5 cents (exponential, in log-cents); its weight\r\n// rises over 0.08 s and decays over 1.4 s after release. Grains near a\r\n// believed note grow long and pure; far ones stay short and clicky.\r\n//\r\n// THE NOTES arrive through a 128-slot table, not through params. A chord\r\n// lands as several note-ons in the same instant, and a @param only keeps\r\n// the last value it was set to before the next sample — so three notes\r\n// set as params would arrive as one. Instead the small event codebox\r\n// (notes-in.codebox) writes a press stamp per pitch into the shared\r\n// buffer `held` (0 = up, otherwise an ever-rising press count). This\r\n// codebox~ reads the table every 64 samples (1.3 ms at 48 kHz) and admits\r\n// new presses in the order they were played. Up to 16 notes are evidence\r\n// at once; more are ignored until one fades.\r\n//\r\n// ONE DIFFERENCE FROM THE BOARD ENGINE, on purpose: the board's random\r\n// generator uses 32-bit integer tricks (Math.imul, >>>) that codebox may\r\n// not have. Here it is the Park–Miller generator, s = s·48271 mod\r\n// (2³¹ − 1), whose product never leaves the exact range of a double. The\r\n// mirror hands the board engine this same generator before comparing.\r\n//\r\n// MIRROR: RNBO/codebox_mirror.mjs runs THIS FILE'S TEXT (and\r\n// notes-in.codebox) as JavaScript and holds it against bayes_engine.js,\r\n// sample by sample, through the same 42-second take as chord-belief.wav.\r\n// A match proves the arithmetic is the board instrument's. It does not\r\n// prove RNBO compiles it, its CPU cost in Live, or how it sounds in Max.\r\n// UNVERIFIED until opened in Max.\r\n//\r\n// UNVERIFIED SEAMS — the three lines most likely to need a fix in Max:\r\n//   1. `buffer(\"held\")` / `buffer(\"prior\")` and peek(buf, index):\r\n//      written from the codebox reference page; the palace has never\r\n//      compiled a codebox buffer read. If it errors, try\r\n//      peek(\"held\", index, 0) as the 2D Torus codeboxes do.\r\n//   2. samplerate(): the reference writes it as a call; the rnbo-codebox\r\n//      skill writes it bare. If one fails, use the other (one line).\r\n//   3. `%` on doubles in rand(): the crowd codebox already relies on %.\r\n//\r\n// PATCHER WIRING REQUIRED (inside the rnbo~):\r\n//   [data held 128]                       the note table (shared by name)\r\n//   [data prior 630]                      optional painted prior, 630 bins\r\n//   [notein] pitch    → [notes-in codebox in1]   (hot)\r\n//   [notein] velocity → [notes-in codebox in2]   (cold; arrives first)\r\n//   [codebox~ out1] → [out~ 1]\r\n//   [codebox~ out2] → [out~ 2]\r\n//   [codebox~ out3] → [out~ 3] or a snapshot~: belief focus, 0–1\r\n// in1 is unused audio; it is referenced once so the object has an inlet.\r\n// RNBO/belief-cloud.maxpat (built by build_patch.mjs) is this wiring.\r\n// =====================================================================\r\n\r\nconst LO = 33;          // MIDI A1\r\nconst BINC = 10;        // cents per prior bin\r\nconst NB = 630;         // bins, A1..C7\r\nconst MAXN = 16;        // notes held as evidence at once\r\nconst MAXV = 640;       // grain voices\r\nconst TN = 4096;        // sine table size\r\nconst CTL = 64;         // samples between belief updates\r\n\r\n// --- the belief ---\r\n@param({ min: 0.01, max: 4.0 })   doubt    = 0.25;  // prior weight against one fully believed note\r\n@param({ min: 0.005, max: 2.0 })  tauOn    = 0.08;  // s, a pressed note's weight rising\r\n@param({ min: 0.05, max: 10.0 })  tauOff   = 1.4;   // s, a released note's weight falling\r\n@param({ min: 0.05, max: 10.0 })  tauFocus = 1.6;   // s, a held note's width narrowing\r\n@param({ min: 0.05, max: 10.0 })  tauBlur  = 0.7;   // s, a released note's width widening\r\n@param({ min: 10.0, max: 600.0 }) sigWide  = 120.0; // cents, a new note's width\r\n@param({ min: 1.0, max: 100.0 })  sigFloor = 5.0;   // cents, full conviction\r\n@param({ min: 0, max: 2 })        priorShape = 0;   // 0 flat · 1 A-minor-pentatonic hills · 2 the `prior` buffer\r\n@param({ min: 0, max: 1 })        priorRead = 0;    // flip to re-read the `prior` buffer after painting it\r\n\r\n// --- the grains ---\r\n@param({ min: 5.0, max: 200.0 })  near     = 35.0;  // cents, how close counts as near a note\r\n@param({ min: 1.0, max: 32.0 })   nMin     = 4.0;   // cycles, far from any note\r\n@param({ min: 8.0, max: 512.0 })  nMax     = 128.0; // cycles, on a fully believed note\r\n@param({ min: 10.0, max: 600.0 }) rate     = 160.0; // grains per second\r\n@param({ min: 0.0, max: 1.0 })    spread   = 0.7;   // stereo\r\n@param({ min: 0.0, max: 2.0 })    vol      = 0.8;\r\n\r\n// --- shared tables ---\r\n@state held  = buffer(\"held\");\r\n@state paint = buffer(\"prior\");\r\n\r\n// --- state ---\r\n@state tab  = new FixedFloat64Array(4097);\r\n@state prior = new FixedFloat64Array(630);\r\n@state cdf  = new FixedFloat64Array(630);\r\n@state priorSum = 0.0;\r\n@state builtShape = -1;\r\n@state builtRead = -1;\r\n@state nM = new FixedFloat64Array(16);   // the notes, in the order first pressed\r\n@state nW = new FixedFloat64Array(16);   // weight\r\n@state nS = new FixedFloat64Array(16);   // width, cents\r\n@state nH = new FixedFloat64Array(16);   // held?\r\n@state nN = 0;\r\n@state lastStamp = 0;\r\n@state vPh  = new FixedFloat64Array(640);\r\n@state vInc = new FixedFloat64Array(640);\r\n@state vPos = new FixedFloat64Array(640);\r\n@state vLen = new FixedFloat64Array(640);\r\n@state vFade = new FixedFloat64Array(640);\r\n@state vAmp = new FixedFloat64Array(640);\r\n@state vL   = new FixedFloat64Array(640);\r\n@state vR   = new FixedFloat64Array(640);\r\n@state nv = 0;\r\n@state nextOn = 0.0;\r\n@state ctl = 0;\r\n@state seed = 12345;\r\n@state ready = 0;\r\n@state focus = 0.0;\r\n\r\nfunction rand() {                       // Park–Miller, exact in doubles\r\n    seed = (seed * 48271) % 2147483647;\r\n    return seed / 2147483647;\r\n}\r\nfunction gauss() {\r\n    let u = rand();\r\n    return sqrt(-2.0 * log(u)) * cos(2.0 * PI * rand());\r\n}\r\nfunction softclip(x) {                  // tanh, written out\r\n    let e = exp(-2.0 * abs(x));\r\n    let t = (1.0 - e) / (1.0 + e);\r\n    return x < 0.0 ? -t : t;\r\n}\r\nfunction binMidi(i) {\r\n    return LO + (i + 0.5) * BINC / 100.0;\r\n}\r\nfunction setup() {\r\n    for (let i = 0; i <= TN; i++) tab[i] = sin(2.0 * PI * i / TN);\r\n    ready = 1;\r\n}\r\n\r\n// ---- the prior\r\nfunction buildPrior() {\r\n    for (let i = 0; i < NB; i++) {\r\n        let v = 1.0;\r\n        if (priorShape > 1.5) {\r\n            v = max(0.0, peek(paint, i));\r\n        } else if (priorShape > 0.5) {  // A C D E G hills, 40 cents wide, on a low floor\r\n            let m = binMidi(i);\r\n            v = 0.04;\r\n            for (let oct = 1; oct < 9; oct++) {\r\n                for (let k = 0; k < 5; k++) {\r\n                    let pc = k == 0 ? 9 : (k == 1 ? 0 : (k == 2 ? 2 : (k == 3 ? 4 : 7)));\r\n                    let d = (m - (12 * oct + pc)) / 0.4;\r\n                    v += exp(-0.5 * d * d);\r\n                }\r\n            }\r\n        }\r\n        prior[i] = v;\r\n    }\r\n    let a = 0.0;\r\n    for (let i = 0; i < NB; i++) { a += prior[i]; cdf[i] = a; }\r\n    priorSum = a;\r\n    builtShape = priorShape;\r\n    builtRead = priorRead;\r\n}\r\n\r\n// ---- the notes\r\nfunction findNote(m) {\r\n    let at = -1;\r\n    for (let k = 0; k < nN; k++) { if (nM[k] == m) at = k; }\r\n    return at;\r\n}\r\nfunction noteOn(m) {\r\n    let k = findNote(m);\r\n    if (k >= 0) { nH[k] = 1; }\r\n    else if (nN < MAXN) { nM[nN] = m; nW[nN] = 0.0; nS[nN] = sigWide; nH[nN] = 1; nN += 1; }\r\n}\r\nfunction dropNote(k) {                  // keep the order of the rest\r\n    for (let j = k; j < nN - 1; j++) { nM[j] = nM[j + 1]; nW[j] = nW[j + 1]; nS[j] = nS[j + 1]; nH[j] = nH[j + 1]; }\r\n    nN -= 1;\r\n}\r\nfunction scanNotes() {\r\n    for (let k = 0; k < nN; k++) {      // releases\r\n        if (nH[k] > 0.5 && peek(held, nM[k]) <= 0.0) nH[k] = 0;\r\n    }\r\n    let more = 1;\r\n    while (more > 0) {                  // presses since last look, oldest first\r\n        let best = -1; let bestStamp = 0.0;\r\n        for (let m = 0; m < 128; m++) {\r\n            let st = peek(held, m);\r\n            if (st > lastStamp && (best < 0 || st < bestStamp)) { best = m; bestStamp = st; }\r\n        }\r\n        if (best < 0) { more = 0; }\r\n        else { noteOn(best); lastStamp = bestStamp; }\r\n    }\r\n}\r\nfunction conviction(k) {\r\n    return clamp((log(sigWide) - log(nS[k])) / (log(sigWide) - log(sigFloor)), 0.0, 1.0);\r\n}\r\nfunction evolve(dt) {\r\n    let kOn = 1.0 - exp(-dt / tauOn);\r\n    let dOff = exp(-dt / tauOff);\r\n    let kF = 1.0 - exp(-dt / tauFocus);\r\n    let kB = 1.0 - exp(-dt / tauBlur);\r\n    let lw = log(sigWide);\r\n    let lf = log(sigFloor);\r\n    let k = 0;\r\n    let sumW = 0.0;\r\n    while (k < nN) {\r\n        let ls = log(nS[k]);\r\n        let gone = 0;\r\n        if (nH[k] > 0.5) { nW[k] += (1.0 - nW[k]) * kOn; ls += (lf - ls) * kF; }\r\n        else { nW[k] *= dOff; ls += (lw - ls) * kB; if (nW[k] < 0.001) gone = 1; }\r\n        if (gone > 0) { dropNote(k); }\r\n        else { nS[k] = exp(ls); sumW += nW[k]; k += 1; }\r\n    }\r\n    focus = sumW / (doubt + sumW);\r\n}\r\n\r\n// ---- one grain (no early returns or breaks: flags instead, so nothing\r\n// rests on how codebox treats a bare `return;`)\r\nfunction spawn(sr) {\r\n    let Z = doubt;\r\n    for (let k = 0; k < nN; k++) Z += nW[k];\r\n    let u = rand() * Z;\r\n    let midi = 0.0;\r\n    let ok = 1;\r\n    if (u < doubt || nN == 0) {\r\n        if (priorSum <= 0.0) {\r\n            ok = 0;\r\n        } else {\r\n            let t = rand() * priorSum;\r\n            let a = 0; let b = NB - 1;\r\n            while (a < b) { let c = floor((a + b) / 2); if (cdf[c] < t) a = c + 1; else b = c; }\r\n            midi = LO + (a + rand()) * BINC / 100.0;\r\n        }\r\n    } else {\r\n        u -= doubt;\r\n        let pk = nN - 1;\r\n        let found = 0;\r\n        for (let k = 0; k < nN; k++) {\r\n            if (found == 0) {\r\n                if (u < nW[k]) { pk = k; found = 1; } else { u -= nW[k]; }\r\n            }\r\n        }\r\n        midi = nM[pk] + gauss() * nS[pk] / 100.0;\r\n    }\r\n    let f = 440.0 * pow(2.0, (midi - 69.0) / 12.0);\r\n    if (ok > 0 && nv < MAXV && f <= sr * 0.45) {\r\n        let best = 0.0;                 // nearest believed note → length\r\n        for (let k = 0; k < nN; k++) {\r\n            let d = (midi - nM[k]) * 100.0 / near;\r\n            let g = exp(-0.5 * d * d) * nW[k] * conviction(k);\r\n            if (g > best) best = g;\r\n        }\r\n        let cycles = nMin * pow(nMax / nMin, best);\r\n        let cyc = sr / f;\r\n        let v = nv;\r\n        nv += 1;\r\n        vPh[v] = rand(); vInc[v] = f / sr; vPos[v] = 0;\r\n        vFade[v] = max(2, floor(cyc + 0.5));\r\n        vLen[v] = floor(cyc * (cycles + 2.0) + 0.5);\r\n        vAmp[v] = sqrt(0.06 / rate) * sqrt(f / (cycles + 1.0));\r\n        let p = 0.5 + spread * (rand() - 0.5);\r\n        vL[v] = cos(p * PI / 2.0); vR[v] = sin(p * PI / 2.0);\r\n    }\r\n}\r\n\r\n// ---------------------------------------------------------------- tick\r\nlet sr = samplerate();\r\nif (ready == 0) setup();\r\nif (ctl <= 0) {\r\n    if (priorShape != builtShape || priorRead != builtRead) buildPrior();\r\n    scanNotes();\r\n    evolve(CTL / sr);\r\n    ctl = CTL;\r\n}\r\n\r\nlet L = 0.0;\r\nlet R = 0.0;\r\nlet v = 0;\r\nwhile (v < nv) {\r\n    let pos = vPos[v];\r\n    if (pos < vLen[v]) {\r\n        let fd = vFade[v];\r\n        let len = vLen[v];\r\n        let e = 1.0;\r\n        if (pos < fd) e = 0.5 - 0.5 * cos(PI * pos / fd);\r\n        else if (pos > len - fd) e = 0.5 - 0.5 * cos(PI * (len - pos) / fd);\r\n        let ph = vPh[v];\r\n        let x = ph * TN;\r\n        let j = floor(x);\r\n        let s = tab[j] + (tab[j + 1] - tab[j]) * (x - j);\r\n        ph += vInc[v];\r\n        if (ph >= 1.0) ph -= 1.0;\r\n        vPh[v] = ph;\r\n        vPos[v] = pos + 1;\r\n        let a = vAmp[v] * s * e;\r\n        L += a * vL[v];\r\n        R += a * vR[v];\r\n    }\r\n    if (vPos[v] >= vLen[v]) {           // retire: the last voice takes this slot\r\n        let w = nv - 1;\r\n        vPh[v] = vPh[w]; vInc[v] = vInc[w]; vPos[v] = vPos[w]; vLen[v] = vLen[w];\r\n        vFade[v] = vFade[w]; vAmp[v] = vAmp[w]; vL[v] = vL[w]; vR[v] = vR[w];\r\n        nv = w;\r\n    } else {\r\n        v += 1;\r\n    }\r\n}\r\n\r\nctl -= 1;\r\nnextOn -= 1.0;\r\nwhile (nextOn <= 0.0) {\r\n    spawn(sr);\r\n    let u = rand();\r\n    if (u < 0.000000000001) u = 0.000000000001;\r\n    nextOn += -log(u) / rate * sr;\r\n}\r\n\r\nout1 = softclip(L * vol) + in1 * 0.0;\r\nout2 = softclip(R * vol);\r\nout3 = focus;\r\n\r\n// =====================================================================\r\n// AUDITION ORDER (once it compiles):\r\n//   1. Nothing held: a flat, clicky scatter across the whole range.\r\n//   2. Hold C E G and keep holding. Over two or three seconds the clicks\r\n//      condense into the chord; out3 climbs from 0 toward 0.92.\r\n//   3. Let go of G and press A. C and E stay sharp; A has to earn it.\r\n//   4. Let go of everything: the chord blurs and drains back to clicks\r\n//      over a couple of seconds.\r\n//   5. priorShape 1: the scatter now lands on A-minor-pentatonic pitches,\r\n//      still clicky. Hold low A and E over it.\r\n//   6. Put it next to chord-belief.wav and codebox-take.wav — the second\r\n//      is this file's own output, rendered through the mirror.\r\n// =====================================================================\r\n",
									"fontname": "<Monospaced>",
									"numinlets": 1,
									"numoutlets": 3,
									"outlettype": [
										"signal",
										"signal",
										"signal"
									],
									"patching_rect": [
										20,
										260,
										760,
										560
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
										840,
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
										280,
										840,
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
									"id": "out-3",
									"maxclass": "newobj",
									"text": "out~ 3",
									"numinlets": 1,
									"numoutlets": 0,
									"outlettype": [],
									"patching_rect": [
										540,
										840,
										50,
										22
									],
									"rnbo_classname": "out~",
									"rnbo_extra_attributes": {
										"comment": "belief focus 0..1",
										"meta": ""
									}
								}
							}
						],
						"lines": [
							{
								"patchline": {
									"source": [
										"notein",
										0
									],
									"destination": [
										"notes",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"notein",
										1
									],
									"destination": [
										"notes",
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
							}
						]
					}
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "gl",
					"maxclass": "newobj",
					"text": "*~ 0.3",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						"signal"
					],
					"patching_rect": [
						20,
						370,
						55,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "gr",
					"maxclass": "newobj",
					"text": "*~ 0.3",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						"signal"
					],
					"patching_rect": [
						90,
						370,
						55,
						22
					]
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
						410,
						45,
						45
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "snap",
					"maxclass": "newobj",
					"text": "snapshot~ 50",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						"float"
					],
					"patching_rect": [
						300,
						370,
						90,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "focus",
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
						400,
						70,
						22
					]
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "slider",
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
						380,
						400,
						200,
						20
					],
					"orientation": 1
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "c-focus",
					"maxclass": "comment",
					"text": "belief focus: 0 with nothing held, ~0.92 once a chord is believed",
					"patching_rect": [
						300,
						430,
						400,
						20
					],
					"linecount": 2
				}
			},
			{
				"box": {
					"fontsize": 12,
					"id": "c-cmp",
					"maxclass": "comment",
					"text": "Reference: RNBO/codebox-take.wav is this codebox's own output through the same 42-second take as chord-belief.wav.",
					"patching_rect": [
						20,
						470,
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
						"kb",
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
						"kb",
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
						"mf",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"k-lm-0",
						0
					],
					"destination": [
						"k-f-0",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"k-f-0",
						0
					],
					"destination": [
						"k-p-0",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"k-p-0",
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
						"k-lm-1",
						0
					],
					"destination": [
						"k-f-1",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"k-f-1",
						0
					],
					"destination": [
						"k-p-1",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"k-p-1",
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
						"k-lm-2",
						0
					],
					"destination": [
						"k-f-2",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"k-f-2",
						0
					],
					"destination": [
						"k-p-2",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"k-p-2",
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
						"k-lm-3",
						0
					],
					"destination": [
						"k-f-3",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"k-f-3",
						0
					],
					"destination": [
						"k-p-3",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"k-p-3",
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
						"k-lm-4",
						0
					],
					"destination": [
						"k-f-4",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"k-f-4",
						0
					],
					"destination": [
						"k-p-4",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"k-p-4",
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
						"mf",
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
						"midiin",
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
						"flat",
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
						"penta",
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
						"paint",
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
						"gl",
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
						"gr",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"gl",
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
						"gr",
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
						2
					],
					"destination": [
						"snap",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"snap",
						0
					],
					"destination": [
						"focus",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"snap",
						0
					],
					"destination": [
						"slider",
						0
					]
				}
			}
		]
	}
}