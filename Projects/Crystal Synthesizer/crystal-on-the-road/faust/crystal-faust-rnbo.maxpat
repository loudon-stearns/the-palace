{
    "patcher": {
        "fileversion": 1,
        "appversion": {
            "major": 8,
            "minor": 5,
            "revision": 5,
            "architecture": "x64",
            "modernui": 1
        },
        "classnamespace": "box",
        "rect": [
            85.0,
            104.0,
            640.0,
            480.0
        ],
        "bglocked": 0,
        "openinpresentation": 0,
        "default_fontsize": 12.0,
        "default_fontface": 0,
        "default_fontname": "Arial",
        "gridonopen": 1,
        "gridsize": [
            15.0,
            15.0
        ],
        "gridsnaponopen": 1,
        "objectsnaponopen": 1,
        "statusbarvisible": 2,
        "toolbarvisible": 1,
        "lefttoolbarpinned": 0,
        "toptoolbarpinned": 0,
        "righttoolbarpinned": 0,
        "bottomtoolbarpinned": 0,
        "toolbars_unpinned_last_save": 0,
        "tallnewobj": 0,
        "boxanimatetime": 200,
        "enablehscroll": 1,
        "enablevscroll": 1,
        "devicewidth": 0.0,
        "description": "",
        "digest": "",
        "tags": "",
        "style": "",
        "subpatcher_template": "",
        "assistshowspatchername": 0,
        "boxes": [
            {
                "box": {
                    "id": "obj-1",
                    "maxclass": "comment",
                    "numinlets": 0,
                    "numoutlets": 1,
                    "patching_rect": [
                        50.0,
                        10.0,
                        350.0,
                        100.0
                    ],
                    "text": "Faust generated RNBO patch, Copyright (c) 2023-2026 Grame",
                    "fontsize": 16
                }
            },
            {
                "box": {
                    "id": "obj-2",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 5,
                    "patching_rect": [
                        48.0,
                        48.0,
                        66.0,
                        22.0
                    ],
                    "patcher": {
                        "fileversion": 1,
                        "appversion": {
                            "major": 8,
                            "minor": 5,
                            "revision": 5,
                            "architecture": "x64",
                            "modernui": 1
                        },
                        "classnamespace": "rnbo",
                        "rect": [
                            85.0,
                            104.0,
                            640.0,
                            480.0
                        ],
                        "bglocked": 0,
                        "openinpresentation": 0,
                        "default_fontsize": 12.0,
                        "default_fontface": 0,
                        "default_fontname": "Arial",
                        "gridonopen": 1,
                        "gridsize": [
                            15.0,
                            15.0
                        ],
                        "gridsnaponopen": 1,
                        "objectsnaponopen": 1,
                        "statusbarvisible": 2,
                        "toolbarvisible": 1,
                        "lefttoolbarpinned": 0,
                        "toptoolbarpinned": 0,
                        "righttoolbarpinned": 0,
                        "bottomtoolbarpinned": 0,
                        "toolbars_unpinned_last_save": 0,
                        "tallnewobj": 0,
                        "boxanimatetime": 200,
                        "enablehscroll": 1,
                        "enablevscroll": 1,
                        "devicewidth": 0.0,
                        "description": "",
                        "digest": "",
                        "tags": "",
                        "style": "",
                        "subpatcher_template": "",
                        "assistshowspatchername": 0,
                        "boxes": [
                            {
                                "box": {
                                    "id": "obj-1",
                                    "maxclass": "codebox~",
                                    "numinlets": 0,
                                    "numoutlets": 1,
                                    "patching_rect": [
                                        500.0,
                                        500.0,
                                        400.0,
                                        200.0
                                    ],
                                    "code": "// Code generated with Faust version 2.88.0\r\n// Compilation options: -lang codebox -fpga-mem-th 4 -ec -ct 1 -es 1 -mcd 16 -mdd 1024 -mdy 33 -double -ftz 0 \r\n// Additional functions\r\n// Params\r\n@param({min: 1.0, max: 5e+02}) attack = 8e+01;\r\n@param({min: 0.0, max: 8.0}) crystal = 0.0;\r\n@param({min: 0.1, max: 2e+01}) decay = 5.5;\r\n@param({min: 2e+01, max: 5e+03}) freq = 1.1e+02;\r\n@param({min: 0.0, max: 1.0}) gain = 1.0;\r\n@param({min: 0., max: 1.}) gate = 0.;\r\n@param({min: 0.0, max: 1.0}) level = 0.5;\r\n@param({min: 0.01, max: 1e+01}) release = 0.4;\r\n@param({min: 0.3, max: 1.0}) rolloff = 0.7;\r\n// Globals\r\n// Fields\r\n@state fHslider0_cb : number = 0;\r\n@state fSlow0_cb : number = 0;\r\n@state fButton0_cb : number = 0;\r\n@state fSlow1_cb : number = 0;\r\n@state fVec0_cb = new FixedDoubleArray(2);\r\n@state iSlow2_cb : Int = 0;\r\n@state fHslider1_cb : number = 0;\r\n@state fSlow3_cb : number = 0;\r\n@state fRec0_cb = new FixedDoubleArray(2);\r\n@state fSampleRate_cb : Int = 0;\r\n@state fConst0_cb : number = 0;\r\n@state fConst1_cb : number = 0;\r\n@state fConst2_cb : number = 0;\r\n@state fHslider2_cb : number = 0;\r\n@state fSlow4_cb : number = 0;\r\n@state fSlow5_cb : number = 0;\r\n@state iRec1_cb = new FixedIntArray(2);\r\n@state fRec2_cb = new FixedDoubleArray(2);\r\n@state fHslider3_cb : number = 0;\r\n@state fSlow6_cb : number = 0;\r\n@state fHslider4_cb : number = 0;\r\n@state iSlow7_cb : Int = 0;\r\n@state iSlow8_cb : Int = 0;\r\n@state iSlow9_cb : Int = 0;\r\n@state iSlow10_cb : Int = 0;\r\n@state iSlow11_cb : Int = 0;\r\n@state iSlow12_cb : Int = 0;\r\n@state iSlow13_cb : Int = 0;\r\n@state iSlow14_cb : Int = 0;\r\n@state iSlow15_cb : Int = 0;\r\n@state fSlow16_cb : number = 0;\r\n@state iSlow17_cb : Int = 0;\r\n@state fConst3_cb : number = 0;\r\n@state fSlow18_cb : number = 0;\r\n@state fSlow19_cb : number = 0;\r\n@state fRec3_cb = new FixedDoubleArray(2);\r\n@state fSlow20_cb : number = 0;\r\n@state iSlow21_cb : Int = 0;\r\n@state fConst4_cb : number = 0;\r\n@state fSlow22_cb : number = 0;\r\n@state fSlow23_cb : number = 0;\r\n@state fRec4_cb = new FixedDoubleArray(2);\r\n@state fSlow24_cb : number = 0;\r\n@state iSlow25_cb : Int = 0;\r\n@state fConst5_cb : number = 0;\r\n@state fSlow26_cb : number = 0;\r\n@state fSlow27_cb : number = 0;\r\n@state fRec5_cb = new FixedDoubleArray(2);\r\n@state fSlow28_cb : number = 0;\r\n@state iSlow29_cb : Int = 0;\r\n@state fConst6_cb : number = 0;\r\n@state fSlow30_cb : number = 0;\r\n@state fSlow31_cb : number = 0;\r\n@state fRec6_cb = new FixedDoubleArray(2);\r\n@state fSlow32_cb : number = 0;\r\n@state iSlow33_cb : Int = 0;\r\n@state fConst7_cb : number = 0;\r\n@state fSlow34_cb : number = 0;\r\n@state fSlow35_cb : number = 0;\r\n@state fRec7_cb = new FixedDoubleArray(2);\r\n@state fSlow36_cb : number = 0;\r\n@state iSlow37_cb : Int = 0;\r\n@state fConst8_cb : number = 0;\r\n@state fSlow38_cb : number = 0;\r\n@state fSlow39_cb : number = 0;\r\n@state fRec8_cb = new FixedDoubleArray(2);\r\n@state fSlow40_cb : number = 0;\r\n@state iSlow41_cb : Int = 0;\r\n@state fConst9_cb : number = 0;\r\n@state fSlow42_cb : number = 0;\r\n@state fSlow43_cb : number = 0;\r\n@state fRec9_cb = new FixedDoubleArray(2);\r\n@state fSlow44_cb : number = 0;\r\n@state iSlow45_cb : Int = 0;\r\n@state fConst10_cb : number = 0;\r\n@state fSlow46_cb : number = 0;\r\n@state fSlow47_cb : number = 0;\r\n@state fRec10_cb = new FixedDoubleArray(2);\r\n@state fConst11_cb : number = 0;\r\n@state fHslider5_cb : number = 0;\r\n@state fSlow48_cb : number = 0;\r\n@state iSlow49_cb : Int = 0;\r\n@state fSlow50_cb : number = 0;\r\n@state fHslider6_cb : number = 0;\r\n@state fSlow51_cb : number = 0;\r\n@state fRec11_cb = new FixedDoubleArray(2);\r\n@state fHslider7_cb : number = 0;\r\n@state fSlow52_cb : number = 0;\r\n@state fRec12_cb = new FixedDoubleArray(2);\r\n@state fUpdated : Int = 0;\r\n// Init\r\nfunction dspsetup() {\r\n\tfUpdated = true;\r\n\tfHslider0_cb = 0.5;\r\n\tfButton0_cb = 0.0;\r\n\tfHslider1_cb = 1.1e+02;\r\n\tfHslider2_cb = 5.5;\r\n\tfHslider3_cb = 0.7;\r\n\tfHslider4_cb = 0.0;\r\n\tfHslider5_cb = 8e+01;\r\n\tfHslider6_cb = 0.4;\r\n\tfHslider7_cb = 1.0;\r\n\tfor (let l0_cb : Int = 0; (l0_cb < 2); l0_cb = iadd(l0_cb, 1)) {\r\n\t\tfVec0_cb[l0_cb] = 0.0;\r\n\t}\r\n\tfor (let l1_cb : Int = 0; (l1_cb < 2); l1_cb = iadd(l1_cb, 1)) {\r\n\t\tfRec0_cb[l1_cb] = 0.0;\r\n\t}\r\n\tfor (let l2_cb : Int = 0; (l2_cb < 2); l2_cb = iadd(l2_cb, 1)) {\r\n\t\tiRec1_cb[l2_cb] = 0;\r\n\t}\r\n\tfor (let l3_cb : Int = 0; (l3_cb < 2); l3_cb = iadd(l3_cb, 1)) {\r\n\t\tfRec2_cb[l3_cb] = 0.0;\r\n\t}\r\n\tfor (let l4_cb : Int = 0; (l4_cb < 2); l4_cb = iadd(l4_cb, 1)) {\r\n\t\tfRec3_cb[l4_cb] = 0.0;\r\n\t}\r\n\tfor (let l5_cb : Int = 0; (l5_cb < 2); l5_cb = iadd(l5_cb, 1)) {\r\n\t\tfRec4_cb[l5_cb] = 0.0;\r\n\t}\r\n\tfor (let l6_cb : Int = 0; (l6_cb < 2); l6_cb = iadd(l6_cb, 1)) {\r\n\t\tfRec5_cb[l6_cb] = 0.0;\r\n\t}\r\n\tfor (let l7_cb : Int = 0; (l7_cb < 2); l7_cb = iadd(l7_cb, 1)) {\r\n\t\tfRec6_cb[l7_cb] = 0.0;\r\n\t}\r\n\tfor (let l8_cb : Int = 0; (l8_cb < 2); l8_cb = iadd(l8_cb, 1)) {\r\n\t\tfRec7_cb[l8_cb] = 0.0;\r\n\t}\r\n\tfor (let l9_cb : Int = 0; (l9_cb < 2); l9_cb = iadd(l9_cb, 1)) {\r\n\t\tfRec8_cb[l9_cb] = 0.0;\r\n\t}\r\n\tfor (let l10_cb : Int = 0; (l10_cb < 2); l10_cb = iadd(l10_cb, 1)) {\r\n\t\tfRec9_cb[l10_cb] = 0.0;\r\n\t}\r\n\tfor (let l11_cb : Int = 0; (l11_cb < 2); l11_cb = iadd(l11_cb, 1)) {\r\n\t\tfRec10_cb[l11_cb] = 0.0;\r\n\t}\r\n\tfor (let l12_cb : Int = 0; (l12_cb < 2); l12_cb = iadd(l12_cb, 1)) {\r\n\t\tfRec11_cb[l12_cb] = 0.0;\r\n\t}\r\n\tfor (let l13_cb : Int = 0; (l13_cb < 2); l13_cb = iadd(l13_cb, 1)) {\r\n\t\tfRec12_cb[l13_cb] = 0.0;\r\n\t}\r\n\tfSampleRate_cb = samplerate();\r\n\tfConst0_cb = min(1.92e+05, max(1.0, fSampleRate_cb));\r\n\tfConst1_cb = (0.45 * fConst0_cb);\r\n\tfConst2_cb = (1.0 / fConst0_cb);\r\n\tfConst3_cb = (1.15 / fConst0_cb);\r\n\tfConst4_cb = (1.3 / fConst0_cb);\r\n\tfConst5_cb = (1.45 / fConst0_cb);\r\n\tfConst6_cb = (1.6 / fConst0_cb);\r\n\tfConst7_cb = (1.75 / fConst0_cb);\r\n\tfConst8_cb = (1.9000000000000001 / fConst0_cb);\r\n\tfConst9_cb = (2.05 / fConst0_cb);\r\n\tfConst10_cb = (2.2 / fConst0_cb);\r\n\tfConst11_cb = (0.001 * fConst0_cb);\r\n}\r\n// Control\r\nfunction control() {\r\n\tfSlow0_cb = (0.6 * fHslider0_cb);\r\n\tfSlow1_cb = fButton0_cb;\r\n\tiSlow2_cb = (fSlow1_cb > 0.0);\r\n\tfSlow3_cb = fHslider1_cb;\r\n\tfSlow4_cb = fHslider2_cb;\r\n\tfSlow5_cb = (fConst2_cb / fSlow4_cb);\r\n\tfSlow6_cb = fHslider3_cb;\r\n\tiSlow7_cb = trunc(max(0.0, min(8.0, floor((fHslider4_cb + 0.5)))));\r\n\tiSlow8_cb = (iSlow7_cb >= 5);\r\n\tiSlow9_cb = (iSlow7_cb >= 3);\r\n\tiSlow10_cb = (iSlow7_cb >= 2);\r\n\tiSlow11_cb = (iSlow7_cb >= 1);\r\n\tiSlow12_cb = (iSlow7_cb >= 4);\r\n\tiSlow13_cb = (iSlow7_cb >= 7);\r\n\tiSlow14_cb = (iSlow7_cb >= 6);\r\n\tiSlow15_cb = (iSlow7_cb >= 8);\r\n\tfSlow16_cb = ((iSlow8_cb) ? ((iSlow13_cb) ? ((iSlow15_cb) ? 1.83 : 1.37) : ((iSlow14_cb) ? 1.45 : 1.62)) : ((iSlow9_cb) ? ((iSlow12_cb) ? 1.1 : 1.23) : ((iSlow10_cb) ? 1.28 : ((iSlow11_cb) ? 1.0 : 1.32))));\r\n\tiSlow17_cb = (fSlow16_cb > 0.0);\r\n\tfSlow18_cb = (fConst3_cb / fSlow4_cb);\r\n\tfSlow19_cb = (fConst2_cb * fSlow16_cb);\r\n\tfSlow20_cb = ((iSlow8_cb) ? ((iSlow13_cb) ? ((iSlow15_cb) ? 3.17 : 1.71) : ((iSlow14_cb) ? 1.91 : 2.07)) : ((iSlow9_cb) ? ((iSlow12_cb) ? 1.14 : 1.47) : ((iSlow10_cb) ? 1.41 : ((iSlow11_cb) ? 1.35 : 1.48))));\r\n\tiSlow21_cb = (fSlow20_cb > 0.0);\r\n\tfSlow22_cb = (fConst4_cb / fSlow4_cb);\r\n\tfSlow23_cb = (fConst2_cb * fSlow20_cb);\r\n\tfSlow24_cb = ((iSlow8_cb) ? ((iSlow13_cb) ? ((iSlow15_cb) ? 4.67 : 1.94) : ((iSlow14_cb) ? 2.37 : 2.77)) : ((iSlow9_cb) ? ((iSlow12_cb) ? 1.19 : 1.68) : ((iSlow10_cb) ? 1.7 : ((iSlow11_cb) ? 1.47 : 1.57))));\r\n\tiSlow25_cb = (fSlow24_cb > 0.0);\r\n\tfSlow26_cb = (fConst5_cb / fSlow4_cb);\r\n\tfSlow27_cb = (fConst2_cb * fSlow24_cb);\r\n\tfSlow28_cb = ((iSlow8_cb) ? ((iSlow13_cb) ? ((iSlow15_cb) ? 7.0 : 2.23) : ((iSlow14_cb) ? 2.96 : 3.13)) : ((iSlow9_cb) ? ((iSlow12_cb) ? 1.52 : 2.13) : ((iSlow10_cb) ? 1.85 : ((iSlow11_cb) ? 1.69 : 1.65))));\r\n\tiSlow29_cb = (fSlow28_cb > 0.0);\r\n\tfSlow30_cb = (fConst6_cb / fSlow4_cb);\r\n\tfSlow31_cb = (fConst2_cb * fSlow28_cb);\r\n\tfSlow32_cb = ((iSlow8_cb) ? ((iSlow13_cb) ? ((iSlow15_cb) ? 9.5 : 2.61) : ((iSlow14_cb) ? 3.68 : 3.63)) : ((iSlow9_cb) ? ((iSlow12_cb) ? 1.7 : 2.3) : ((iSlow10_cb) ? 2.0 : ((iSlow11_cb) ? 2.48 : 0.0))));\r\n\tiSlow33_cb = (fSlow32_cb > 0.0);\r\n\tfSlow34_cb = (fConst7_cb / fSlow4_cb);\r\n\tfSlow35_cb = (fConst2_cb * fSlow32_cb);\r\n\tfSlow36_cb = ((iSlow8_cb) ? ((iSlow13_cb) ? ((iSlow15_cb) ? 13.3 : 0.0) : ((iSlow14_cb) ? 4.8 : 5.45)) : ((iSlow9_cb) ? ((iSlow12_cb) ? 1.98 : 3.33) : 0.0));\r\n\tiSlow37_cb = (fSlow36_cb > 0.0);\r\n\tfSlow38_cb = (fConst8_cb / fSlow4_cb);\r\n\tfSlow39_cb = (fConst2_cb * fSlow36_cb);\r\n\tfSlow40_cb = ((iSlow8_cb) ? ((iSlow13_cb) ? ((iSlow15_cb) ? 17.5 : 0.0) : ((iSlow14_cb) ? 6.05 : 6.21)) : 0.0);\r\n\tiSlow41_cb = (fSlow40_cb > 0.0);\r\n\tfSlow42_cb = (fConst9_cb / fSlow4_cb);\r\n\tfSlow43_cb = (fConst2_cb * fSlow40_cb);\r\n\tfSlow44_cb = ((iSlow8_cb) ? ((iSlow13_cb) ? 0.0 : ((iSlow14_cb) ? 0.0 : 8.32)) : 0.0);\r\n\tiSlow45_cb = (fSlow44_cb > 0.0);\r\n\tfSlow46_cb = (fConst10_cb / fSlow4_cb);\r\n\tfSlow47_cb = (fConst2_cb * fSlow44_cb);\r\n\tfSlow48_cb = floor((fConst11_cb * fHslider5_cb));\r\n\tiSlow49_cb = (fSlow48_cb > 1.0);\r\n\tfSlow50_cb = (1.0 / (fSlow48_cb + -1.0));\r\n\tfSlow51_cb = exp((-1.0 * (fConst2_cb / fHslider6_cb)));\r\n\tfSlow52_cb = fHslider7_cb;\r\n}\r\n// Update parameters\r\nfunction update(attack,crystal,decay,freq,gain,gate,level,release,rolloff) {\r\n\tfUpdated = int(fUpdated) | (attack != fHslider5_cb); fHslider5_cb = attack;\r\n\tfUpdated = int(fUpdated) | (crystal != fHslider4_cb); fHslider4_cb = crystal;\r\n\tfUpdated = int(fUpdated) | (decay != fHslider2_cb); fHslider2_cb = decay;\r\n\tfUpdated = int(fUpdated) | (freq != fHslider1_cb); fHslider1_cb = freq;\r\n\tfUpdated = int(fUpdated) | (gain != fHslider7_cb); fHslider7_cb = gain;\r\n\tfUpdated = int(fUpdated) | (gate != fButton0_cb); fButton0_cb = gate;\r\n\tfUpdated = int(fUpdated) | (level != fHslider0_cb); fHslider0_cb = level;\r\n\tfUpdated = int(fUpdated) | (release != fHslider6_cb); fHslider6_cb = release;\r\n\tfUpdated = int(fUpdated) | (rolloff != fHslider3_cb); fHslider3_cb = rolloff;\r\n\tif (fUpdated) { fUpdated = false; control(); }\r\n}\r\n// Compute one frame\r\nfunction compute() {\r\n\tlet output0_cb : number = 0;\r\n\tlet output1_cb : number = 0;\r\n\tfVec0_cb[0] = fSlow1_cb;\r\n\tlet iTemp0_cb : Int = (iSlow2_cb & (fVec0_cb[1] <= 0.0));\r\n\tfRec0_cb[0] = ((iTemp0_cb) ? fSlow3_cb : fRec0_cb[1]);\r\n\tlet iTemp1_cb : Int = (fRec0_cb[0] < fConst1_cb);\r\n\tiRec1_cb[0] = imul(iadd(1, iRec1_cb[1]), (1 - iTemp0_cb));\r\n\tlet fTemp2_cb : number = iRec1_cb[0];\r\n\tlet fTemp3_cb : number = (fRec2_cb[1] + (fConst2_cb * fRec0_cb[0]));\r\n\tfRec2_cb[0] = ((iTemp0_cb) ? 0.625095466604667 : (fTemp3_cb - floor(fTemp3_cb)));\r\n\tlet iTemp4_cb : Int = (iSlow17_cb & ((fSlow16_cb * fRec0_cb[0]) < fConst1_cb));\r\n\tlet fTemp5_cb : number = (fRec3_cb[1] + (fSlow19_cb * fRec0_cb[0]));\r\n\tfRec3_cb[0] = ((iTemp0_cb) ? 0.3269722766055607 : (fTemp5_cb - floor(fTemp5_cb)));\r\n\tlet iTemp6_cb : Int = (iSlow21_cb & ((fSlow20_cb * fRec0_cb[0]) < fConst1_cb));\r\n\tlet fTemp7_cb : number = ((iTemp4_cb) ? fSlow6_cb : 1.0);\r\n\tlet fTemp8_cb : number = (fRec4_cb[1] + (fSlow23_cb * fRec0_cb[0]));\r\n\tfRec4_cb[0] = ((iTemp0_cb) ? 0.8702492039700847 : (fTemp8_cb - floor(fTemp8_cb)));\r\n\tlet iTemp9_cb : Int = (iSlow25_cb & ((fSlow24_cb * fRec0_cb[0]) < fConst1_cb));\r\n\tlet fTemp10_cb : number = ((iTemp6_cb) ? fSlow6_cb : 1.0);\r\n\tlet fTemp11_cb : number = (fRec5_cb[1] + (fSlow27_cb * fRec0_cb[0]));\r\n\tfRec5_cb[0] = ((iTemp0_cb) ? 0.9560017096289753 : (fTemp11_cb - floor(fTemp11_cb)));\r\n\tlet fTemp12_cb : number = (fTemp7_cb * fTemp10_cb);\r\n\tlet iTemp13_cb : Int = (iSlow29_cb & ((fSlow28_cb * fRec0_cb[0]) < fConst1_cb));\r\n\tlet fTemp14_cb : number = ((iTemp9_cb) ? fSlow6_cb : 1.0);\r\n\tlet fTemp15_cb : number = (fRec6_cb[1] + (fSlow31_cb * fRec0_cb[0]));\r\n\tfRec6_cb[0] = ((iTemp0_cb) ? 0.12857020276919962 : (fTemp15_cb - floor(fTemp15_cb)));\r\n\tlet fTemp16_cb : number = (fTemp12_cb * fTemp14_cb);\r\n\tlet iTemp17_cb : Int = (iSlow33_cb & ((fSlow32_cb * fRec0_cb[0]) < fConst1_cb));\r\n\tlet fTemp18_cb : number = ((iTemp13_cb) ? fSlow6_cb : 1.0);\r\n\tlet fTemp19_cb : number = (fRec7_cb[1] + (fSlow35_cb * fRec0_cb[0]));\r\n\tfRec7_cb[0] = ((iTemp0_cb) ? 0.2508244581084461 : (fTemp19_cb - floor(fTemp19_cb)));\r\n\tlet fTemp20_cb : number = (fTemp16_cb * fTemp18_cb);\r\n\tlet iTemp21_cb : Int = (iSlow37_cb & ((fSlow36_cb * fRec0_cb[0]) < fConst1_cb));\r\n\tlet fTemp22_cb : number = ((iTemp17_cb) ? fSlow6_cb : 1.0);\r\n\tlet fTemp23_cb : number = (fRec8_cb[1] + (fSlow39_cb * fRec0_cb[0]));\r\n\tfRec8_cb[0] = ((iTemp0_cb) ? 0.8647975870165865 : (fTemp23_cb - floor(fTemp23_cb)));\r\n\tlet fTemp24_cb : number = (fTemp20_cb * fTemp22_cb);\r\n\tlet iTemp25_cb : Int = (iSlow41_cb & ((fSlow40_cb * fRec0_cb[0]) < fConst1_cb));\r\n\tlet fTemp26_cb : number = ((iTemp21_cb) ? fSlow6_cb : 1.0);\r\n\tlet fTemp27_cb : number = (fRec9_cb[1] + (fSlow43_cb * fRec0_cb[0]));\r\n\tfRec9_cb[0] = ((iTemp0_cb) ? 0.8309833188891115 : (fTemp27_cb - floor(fTemp27_cb)));\r\n\tlet fTemp28_cb : number = (fRec10_cb[1] + (fSlow47_cb * fRec0_cb[0]));\r\n\tfRec10_cb[0] = ((iTemp0_cb) ? 0.6927433679651523 : (fTemp28_cb - floor(fTemp28_cb)));\r\n\tfRec11_cb[0] = ((iTemp0_cb) ? 1.0 : ((iSlow2_cb) ? 1.0 : (fSlow51_cb * fRec11_cb[1])));\r\n\tfRec12_cb[0] = ((iTemp0_cb) ? fSlow52_cb : fRec12_cb[1]);\r\n\tlet fTemp29_cb : number = (fSlow0_cb * ((((((iTemp1_cb * exp((-1.0 * (fSlow5_cb * fTemp2_cb)))) * sin((6.283185307179586 * fRec2_cb[0]))) + (((iTemp1_cb) ? fSlow6_cb : 1.0) * (((((((((iTemp4_cb * exp((-1.0 * (fSlow18_cb * fTemp2_cb)))) * sin((6.283185307179586 * fRec3_cb[0]))) + (((iTemp6_cb * fTemp7_cb) * exp((-1.0 * (fSlow22_cb * fTemp2_cb)))) * sin((6.283185307179586 * fRec4_cb[0])))) + ((((fTemp7_cb * iTemp9_cb) * fTemp10_cb) * exp((-1.0 * (fSlow26_cb * fTemp2_cb)))) * sin((6.283185307179586 * fRec5_cb[0])))) + ((((fTemp12_cb * iTemp13_cb) * fTemp14_cb) * exp((-1.0 * (fSlow30_cb * fTemp2_cb)))) * sin((6.283185307179586 * fRec6_cb[0])))) + ((((fTemp16_cb * iTemp17_cb) * fTemp18_cb) * exp((-1.0 * (fSlow34_cb * fTemp2_cb)))) * sin((6.283185307179586 * fRec7_cb[0])))) + ((((fTemp20_cb * iTemp21_cb) * fTemp22_cb) * exp((-1.0 * (fSlow38_cb * fTemp2_cb)))) * sin((6.283185307179586 * fRec8_cb[0])))) + ((((fTemp24_cb * iTemp25_cb) * fTemp26_cb) * exp((-1.0 * (fSlow42_cb * fTemp2_cb)))) * sin((6.283185307179586 * fRec9_cb[0])))) + (((((fTemp24_cb * fTemp26_cb) * (iSlow45_cb & ((fSlow44_cb * fRec0_cb[0]) < fConst1_cb))) * ((iTemp25_cb) ? fSlow6_cb : 1.0)) * exp((-1.0 * (fSlow46_cb * fTemp2_cb)))) * sin((6.283185307179586 * fRec10_cb[0])))))) * ((iSlow49_cb) ? min(1.0, (fSlow50_cb * fTemp2_cb)) : 1.0)) * fRec11_cb[0]) * fRec12_cb[0]));\r\n\toutput0_cb = fTemp29_cb;\r\n\toutput1_cb = fTemp29_cb;\r\n\tfVec0_cb[1] = fVec0_cb[0];\r\n\tfRec0_cb[1] = fRec0_cb[0];\r\n\tiRec1_cb[1] = iRec1_cb[0];\r\n\tfRec2_cb[1] = fRec2_cb[0];\r\n\tfRec3_cb[1] = fRec3_cb[0];\r\n\tfRec4_cb[1] = fRec4_cb[0];\r\n\tfRec5_cb[1] = fRec5_cb[0];\r\n\tfRec6_cb[1] = fRec6_cb[0];\r\n\tfRec7_cb[1] = fRec7_cb[0];\r\n\tfRec8_cb[1] = fRec8_cb[0];\r\n\tfRec9_cb[1] = fRec9_cb[0];\r\n\tfRec10_cb[1] = fRec10_cb[0];\r\n\tfRec11_cb[1] = fRec11_cb[0];\r\n\tfRec12_cb[1] = fRec12_cb[0];\r\n\treturn [output0_cb,output1_cb];\r\n}\r\n// Update parameters\r\nupdate(attack,crystal,decay,freq,gain,gate,level,release,rolloff);\r\n// Compute one frame\r\noutputs = compute();\r\n// Write the outputs: audio ones and bargraph as additional audio signals\r\nout1 = outputs[0];\r\nout2 = outputs[1];\r\n",
                                    "outlettype": [
                                        ""
                                    ],
                                    "rnbo_classname": "codebox~",
                                    "rnbo_extra_attributes": {
                                        "code": "// Code generated with Faust version 2.88.0\r\n// Compilation options: -lang codebox -fpga-mem-th 4 -ec -ct 1 -es 1 -mcd 16 -mdd 1024 -mdy 33 -double -ftz 0 \r\n// Additional functions\r\n// Params\r\n@param({min: 1.0, max: 5e+02}) attack = 8e+01;\r\n@param({min: 0.0, max: 8.0}) crystal = 0.0;\r\n@param({min: 0.1, max: 2e+01}) decay = 5.5;\r\n@param({min: 2e+01, max: 5e+03}) freq = 1.1e+02;\r\n@param({min: 0.0, max: 1.0}) gain = 1.0;\r\n@param({min: 0., max: 1.}) gate = 0.;\r\n@param({min: 0.0, max: 1.0}) level = 0.5;\r\n@param({min: 0.01, max: 1e+01}) release = 0.4;\r\n@param({min: 0.3, max: 1.0}) rolloff = 0.7;\r\n// Globals\r\n// Fields\r\n@state fHslider0_cb : number = 0;\r\n@state fSlow0_cb : number = 0;\r\n@state fButton0_cb : number = 0;\r\n@state fSlow1_cb : number = 0;\r\n@state fVec0_cb = new FixedDoubleArray(2);\r\n@state iSlow2_cb : Int = 0;\r\n@state fHslider1_cb : number = 0;\r\n@state fSlow3_cb : number = 0;\r\n@state fRec0_cb = new FixedDoubleArray(2);\r\n@state fSampleRate_cb : Int = 0;\r\n@state fConst0_cb : number = 0;\r\n@state fConst1_cb : number = 0;\r\n@state fConst2_cb : number = 0;\r\n@state fHslider2_cb : number = 0;\r\n@state fSlow4_cb : number = 0;\r\n@state fSlow5_cb : number = 0;\r\n@state iRec1_cb = new FixedIntArray(2);\r\n@state fRec2_cb = new FixedDoubleArray(2);\r\n@state fHslider3_cb : number = 0;\r\n@state fSlow6_cb : number = 0;\r\n@state fHslider4_cb : number = 0;\r\n@state iSlow7_cb : Int = 0;\r\n@state iSlow8_cb : Int = 0;\r\n@state iSlow9_cb : Int = 0;\r\n@state iSlow10_cb : Int = 0;\r\n@state iSlow11_cb : Int = 0;\r\n@state iSlow12_cb : Int = 0;\r\n@state iSlow13_cb : Int = 0;\r\n@state iSlow14_cb : Int = 0;\r\n@state iSlow15_cb : Int = 0;\r\n@state fSlow16_cb : number = 0;\r\n@state iSlow17_cb : Int = 0;\r\n@state fConst3_cb : number = 0;\r\n@state fSlow18_cb : number = 0;\r\n@state fSlow19_cb : number = 0;\r\n@state fRec3_cb = new FixedDoubleArray(2);\r\n@state fSlow20_cb : number = 0;\r\n@state iSlow21_cb : Int = 0;\r\n@state fConst4_cb : number = 0;\r\n@state fSlow22_cb : number = 0;\r\n@state fSlow23_cb : number = 0;\r\n@state fRec4_cb = new FixedDoubleArray(2);\r\n@state fSlow24_cb : number = 0;\r\n@state iSlow25_cb : Int = 0;\r\n@state fConst5_cb : number = 0;\r\n@state fSlow26_cb : number = 0;\r\n@state fSlow27_cb : number = 0;\r\n@state fRec5_cb = new FixedDoubleArray(2);\r\n@state fSlow28_cb : number = 0;\r\n@state iSlow29_cb : Int = 0;\r\n@state fConst6_cb : number = 0;\r\n@state fSlow30_cb : number = 0;\r\n@state fSlow31_cb : number = 0;\r\n@state fRec6_cb = new FixedDoubleArray(2);\r\n@state fSlow32_cb : number = 0;\r\n@state iSlow33_cb : Int = 0;\r\n@state fConst7_cb : number = 0;\r\n@state fSlow34_cb : number = 0;\r\n@state fSlow35_cb : number = 0;\r\n@state fRec7_cb = new FixedDoubleArray(2);\r\n@state fSlow36_cb : number = 0;\r\n@state iSlow37_cb : Int = 0;\r\n@state fConst8_cb : number = 0;\r\n@state fSlow38_cb : number = 0;\r\n@state fSlow39_cb : number = 0;\r\n@state fRec8_cb = new FixedDoubleArray(2);\r\n@state fSlow40_cb : number = 0;\r\n@state iSlow41_cb : Int = 0;\r\n@state fConst9_cb : number = 0;\r\n@state fSlow42_cb : number = 0;\r\n@state fSlow43_cb : number = 0;\r\n@state fRec9_cb = new FixedDoubleArray(2);\r\n@state fSlow44_cb : number = 0;\r\n@state iSlow45_cb : Int = 0;\r\n@state fConst10_cb : number = 0;\r\n@state fSlow46_cb : number = 0;\r\n@state fSlow47_cb : number = 0;\r\n@state fRec10_cb = new FixedDoubleArray(2);\r\n@state fConst11_cb : number = 0;\r\n@state fHslider5_cb : number = 0;\r\n@state fSlow48_cb : number = 0;\r\n@state iSlow49_cb : Int = 0;\r\n@state fSlow50_cb : number = 0;\r\n@state fHslider6_cb : number = 0;\r\n@state fSlow51_cb : number = 0;\r\n@state fRec11_cb = new FixedDoubleArray(2);\r\n@state fHslider7_cb : number = 0;\r\n@state fSlow52_cb : number = 0;\r\n@state fRec12_cb = new FixedDoubleArray(2);\r\n@state fUpdated : Int = 0;\r\n// Init\r\nfunction dspsetup() {\r\n\tfUpdated = true;\r\n\tfHslider0_cb = 0.5;\r\n\tfButton0_cb = 0.0;\r\n\tfHslider1_cb = 1.1e+02;\r\n\tfHslider2_cb = 5.5;\r\n\tfHslider3_cb = 0.7;\r\n\tfHslider4_cb = 0.0;\r\n\tfHslider5_cb = 8e+01;\r\n\tfHslider6_cb = 0.4;\r\n\tfHslider7_cb = 1.0;\r\n\tfor (let l0_cb : Int = 0; (l0_cb < 2); l0_cb = iadd(l0_cb, 1)) {\r\n\t\tfVec0_cb[l0_cb] = 0.0;\r\n\t}\r\n\tfor (let l1_cb : Int = 0; (l1_cb < 2); l1_cb = iadd(l1_cb, 1)) {\r\n\t\tfRec0_cb[l1_cb] = 0.0;\r\n\t}\r\n\tfor (let l2_cb : Int = 0; (l2_cb < 2); l2_cb = iadd(l2_cb, 1)) {\r\n\t\tiRec1_cb[l2_cb] = 0;\r\n\t}\r\n\tfor (let l3_cb : Int = 0; (l3_cb < 2); l3_cb = iadd(l3_cb, 1)) {\r\n\t\tfRec2_cb[l3_cb] = 0.0;\r\n\t}\r\n\tfor (let l4_cb : Int = 0; (l4_cb < 2); l4_cb = iadd(l4_cb, 1)) {\r\n\t\tfRec3_cb[l4_cb] = 0.0;\r\n\t}\r\n\tfor (let l5_cb : Int = 0; (l5_cb < 2); l5_cb = iadd(l5_cb, 1)) {\r\n\t\tfRec4_cb[l5_cb] = 0.0;\r\n\t}\r\n\tfor (let l6_cb : Int = 0; (l6_cb < 2); l6_cb = iadd(l6_cb, 1)) {\r\n\t\tfRec5_cb[l6_cb] = 0.0;\r\n\t}\r\n\tfor (let l7_cb : Int = 0; (l7_cb < 2); l7_cb = iadd(l7_cb, 1)) {\r\n\t\tfRec6_cb[l7_cb] = 0.0;\r\n\t}\r\n\tfor (let l8_cb : Int = 0; (l8_cb < 2); l8_cb = iadd(l8_cb, 1)) {\r\n\t\tfRec7_cb[l8_cb] = 0.0;\r\n\t}\r\n\tfor (let l9_cb : Int = 0; (l9_cb < 2); l9_cb = iadd(l9_cb, 1)) {\r\n\t\tfRec8_cb[l9_cb] = 0.0;\r\n\t}\r\n\tfor (let l10_cb : Int = 0; (l10_cb < 2); l10_cb = iadd(l10_cb, 1)) {\r\n\t\tfRec9_cb[l10_cb] = 0.0;\r\n\t}\r\n\tfor (let l11_cb : Int = 0; (l11_cb < 2); l11_cb = iadd(l11_cb, 1)) {\r\n\t\tfRec10_cb[l11_cb] = 0.0;\r\n\t}\r\n\tfor (let l12_cb : Int = 0; (l12_cb < 2); l12_cb = iadd(l12_cb, 1)) {\r\n\t\tfRec11_cb[l12_cb] = 0.0;\r\n\t}\r\n\tfor (let l13_cb : Int = 0; (l13_cb < 2); l13_cb = iadd(l13_cb, 1)) {\r\n\t\tfRec12_cb[l13_cb] = 0.0;\r\n\t}\r\n\tfSampleRate_cb = samplerate();\r\n\tfConst0_cb = min(1.92e+05, max(1.0, fSampleRate_cb));\r\n\tfConst1_cb = (0.45 * fConst0_cb);\r\n\tfConst2_cb = (1.0 / fConst0_cb);\r\n\tfConst3_cb = (1.15 / fConst0_cb);\r\n\tfConst4_cb = (1.3 / fConst0_cb);\r\n\tfConst5_cb = (1.45 / fConst0_cb);\r\n\tfConst6_cb = (1.6 / fConst0_cb);\r\n\tfConst7_cb = (1.75 / fConst0_cb);\r\n\tfConst8_cb = (1.9000000000000001 / fConst0_cb);\r\n\tfConst9_cb = (2.05 / fConst0_cb);\r\n\tfConst10_cb = (2.2 / fConst0_cb);\r\n\tfConst11_cb = (0.001 * fConst0_cb);\r\n}\r\n// Control\r\nfunction control() {\r\n\tfSlow0_cb = (0.6 * fHslider0_cb);\r\n\tfSlow1_cb = fButton0_cb;\r\n\tiSlow2_cb = (fSlow1_cb > 0.0);\r\n\tfSlow3_cb = fHslider1_cb;\r\n\tfSlow4_cb = fHslider2_cb;\r\n\tfSlow5_cb = (fConst2_cb / fSlow4_cb);\r\n\tfSlow6_cb = fHslider3_cb;\r\n\tiSlow7_cb = trunc(max(0.0, min(8.0, floor((fHslider4_cb + 0.5)))));\r\n\tiSlow8_cb = (iSlow7_cb >= 5);\r\n\tiSlow9_cb = (iSlow7_cb >= 3);\r\n\tiSlow10_cb = (iSlow7_cb >= 2);\r\n\tiSlow11_cb = (iSlow7_cb >= 1);\r\n\tiSlow12_cb = (iSlow7_cb >= 4);\r\n\tiSlow13_cb = (iSlow7_cb >= 7);\r\n\tiSlow14_cb = (iSlow7_cb >= 6);\r\n\tiSlow15_cb = (iSlow7_cb >= 8);\r\n\tfSlow16_cb = ((iSlow8_cb) ? ((iSlow13_cb) ? ((iSlow15_cb) ? 1.83 : 1.37) : ((iSlow14_cb) ? 1.45 : 1.62)) : ((iSlow9_cb) ? ((iSlow12_cb) ? 1.1 : 1.23) : ((iSlow10_cb) ? 1.28 : ((iSlow11_cb) ? 1.0 : 1.32))));\r\n\tiSlow17_cb = (fSlow16_cb > 0.0);\r\n\tfSlow18_cb = (fConst3_cb / fSlow4_cb);\r\n\tfSlow19_cb = (fConst2_cb * fSlow16_cb);\r\n\tfSlow20_cb = ((iSlow8_cb) ? ((iSlow13_cb) ? ((iSlow15_cb) ? 3.17 : 1.71) : ((iSlow14_cb) ? 1.91 : 2.07)) : ((iSlow9_cb) ? ((iSlow12_cb) ? 1.14 : 1.47) : ((iSlow10_cb) ? 1.41 : ((iSlow11_cb) ? 1.35 : 1.48))));\r\n\tiSlow21_cb = (fSlow20_cb > 0.0);\r\n\tfSlow22_cb = (fConst4_cb / fSlow4_cb);\r\n\tfSlow23_cb = (fConst2_cb * fSlow20_cb);\r\n\tfSlow24_cb = ((iSlow8_cb) ? ((iSlow13_cb) ? ((iSlow15_cb) ? 4.67 : 1.94) : ((iSlow14_cb) ? 2.37 : 2.77)) : ((iSlow9_cb) ? ((iSlow12_cb) ? 1.19 : 1.68) : ((iSlow10_cb) ? 1.7 : ((iSlow11_cb) ? 1.47 : 1.57))));\r\n\tiSlow25_cb = (fSlow24_cb > 0.0);\r\n\tfSlow26_cb = (fConst5_cb / fSlow4_cb);\r\n\tfSlow27_cb = (fConst2_cb * fSlow24_cb);\r\n\tfSlow28_cb = ((iSlow8_cb) ? ((iSlow13_cb) ? ((iSlow15_cb) ? 7.0 : 2.23) : ((iSlow14_cb) ? 2.96 : 3.13)) : ((iSlow9_cb) ? ((iSlow12_cb) ? 1.52 : 2.13) : ((iSlow10_cb) ? 1.85 : ((iSlow11_cb) ? 1.69 : 1.65))));\r\n\tiSlow29_cb = (fSlow28_cb > 0.0);\r\n\tfSlow30_cb = (fConst6_cb / fSlow4_cb);\r\n\tfSlow31_cb = (fConst2_cb * fSlow28_cb);\r\n\tfSlow32_cb = ((iSlow8_cb) ? ((iSlow13_cb) ? ((iSlow15_cb) ? 9.5 : 2.61) : ((iSlow14_cb) ? 3.68 : 3.63)) : ((iSlow9_cb) ? ((iSlow12_cb) ? 1.7 : 2.3) : ((iSlow10_cb) ? 2.0 : ((iSlow11_cb) ? 2.48 : 0.0))));\r\n\tiSlow33_cb = (fSlow32_cb > 0.0);\r\n\tfSlow34_cb = (fConst7_cb / fSlow4_cb);\r\n\tfSlow35_cb = (fConst2_cb * fSlow32_cb);\r\n\tfSlow36_cb = ((iSlow8_cb) ? ((iSlow13_cb) ? ((iSlow15_cb) ? 13.3 : 0.0) : ((iSlow14_cb) ? 4.8 : 5.45)) : ((iSlow9_cb) ? ((iSlow12_cb) ? 1.98 : 3.33) : 0.0));\r\n\tiSlow37_cb = (fSlow36_cb > 0.0);\r\n\tfSlow38_cb = (fConst8_cb / fSlow4_cb);\r\n\tfSlow39_cb = (fConst2_cb * fSlow36_cb);\r\n\tfSlow40_cb = ((iSlow8_cb) ? ((iSlow13_cb) ? ((iSlow15_cb) ? 17.5 : 0.0) : ((iSlow14_cb) ? 6.05 : 6.21)) : 0.0);\r\n\tiSlow41_cb = (fSlow40_cb > 0.0);\r\n\tfSlow42_cb = (fConst9_cb / fSlow4_cb);\r\n\tfSlow43_cb = (fConst2_cb * fSlow40_cb);\r\n\tfSlow44_cb = ((iSlow8_cb) ? ((iSlow13_cb) ? 0.0 : ((iSlow14_cb) ? 0.0 : 8.32)) : 0.0);\r\n\tiSlow45_cb = (fSlow44_cb > 0.0);\r\n\tfSlow46_cb = (fConst10_cb / fSlow4_cb);\r\n\tfSlow47_cb = (fConst2_cb * fSlow44_cb);\r\n\tfSlow48_cb = floor((fConst11_cb * fHslider5_cb));\r\n\tiSlow49_cb = (fSlow48_cb > 1.0);\r\n\tfSlow50_cb = (1.0 / (fSlow48_cb + -1.0));\r\n\tfSlow51_cb = exp((-1.0 * (fConst2_cb / fHslider6_cb)));\r\n\tfSlow52_cb = fHslider7_cb;\r\n}\r\n// Update parameters\r\nfunction update(attack,crystal,decay,freq,gain,gate,level,release,rolloff) {\r\n\tfUpdated = int(fUpdated) | (attack != fHslider5_cb); fHslider5_cb = attack;\r\n\tfUpdated = int(fUpdated) | (crystal != fHslider4_cb); fHslider4_cb = crystal;\r\n\tfUpdated = int(fUpdated) | (decay != fHslider2_cb); fHslider2_cb = decay;\r\n\tfUpdated = int(fUpdated) | (freq != fHslider1_cb); fHslider1_cb = freq;\r\n\tfUpdated = int(fUpdated) | (gain != fHslider7_cb); fHslider7_cb = gain;\r\n\tfUpdated = int(fUpdated) | (gate != fButton0_cb); fButton0_cb = gate;\r\n\tfUpdated = int(fUpdated) | (level != fHslider0_cb); fHslider0_cb = level;\r\n\tfUpdated = int(fUpdated) | (release != fHslider6_cb); fHslider6_cb = release;\r\n\tfUpdated = int(fUpdated) | (rolloff != fHslider3_cb); fHslider3_cb = rolloff;\r\n\tif (fUpdated) { fUpdated = false; control(); }\r\n}\r\n// Compute one frame\r\nfunction compute() {\r\n\tlet output0_cb : number = 0;\r\n\tlet output1_cb : number = 0;\r\n\tfVec0_cb[0] = fSlow1_cb;\r\n\tlet iTemp0_cb : Int = (iSlow2_cb & (fVec0_cb[1] <= 0.0));\r\n\tfRec0_cb[0] = ((iTemp0_cb) ? fSlow3_cb : fRec0_cb[1]);\r\n\tlet iTemp1_cb : Int = (fRec0_cb[0] < fConst1_cb);\r\n\tiRec1_cb[0] = imul(iadd(1, iRec1_cb[1]), (1 - iTemp0_cb));\r\n\tlet fTemp2_cb : number = iRec1_cb[0];\r\n\tlet fTemp3_cb : number = (fRec2_cb[1] + (fConst2_cb * fRec0_cb[0]));\r\n\tfRec2_cb[0] = ((iTemp0_cb) ? 0.625095466604667 : (fTemp3_cb - floor(fTemp3_cb)));\r\n\tlet iTemp4_cb : Int = (iSlow17_cb & ((fSlow16_cb * fRec0_cb[0]) < fConst1_cb));\r\n\tlet fTemp5_cb : number = (fRec3_cb[1] + (fSlow19_cb * fRec0_cb[0]));\r\n\tfRec3_cb[0] = ((iTemp0_cb) ? 0.3269722766055607 : (fTemp5_cb - floor(fTemp5_cb)));\r\n\tlet iTemp6_cb : Int = (iSlow21_cb & ((fSlow20_cb * fRec0_cb[0]) < fConst1_cb));\r\n\tlet fTemp7_cb : number = ((iTemp4_cb) ? fSlow6_cb : 1.0);\r\n\tlet fTemp8_cb : number = (fRec4_cb[1] + (fSlow23_cb * fRec0_cb[0]));\r\n\tfRec4_cb[0] = ((iTemp0_cb) ? 0.8702492039700847 : (fTemp8_cb - floor(fTemp8_cb)));\r\n\tlet iTemp9_cb : Int = (iSlow25_cb & ((fSlow24_cb * fRec0_cb[0]) < fConst1_cb));\r\n\tlet fTemp10_cb : number = ((iTemp6_cb) ? fSlow6_cb : 1.0);\r\n\tlet fTemp11_cb : number = (fRec5_cb[1] + (fSlow27_cb * fRec0_cb[0]));\r\n\tfRec5_cb[0] = ((iTemp0_cb) ? 0.9560017096289753 : (fTemp11_cb - floor(fTemp11_cb)));\r\n\tlet fTemp12_cb : number = (fTemp7_cb * fTemp10_cb);\r\n\tlet iTemp13_cb : Int = (iSlow29_cb & ((fSlow28_cb * fRec0_cb[0]) < fConst1_cb));\r\n\tlet fTemp14_cb : number = ((iTemp9_cb) ? fSlow6_cb : 1.0);\r\n\tlet fTemp15_cb : number = (fRec6_cb[1] + (fSlow31_cb * fRec0_cb[0]));\r\n\tfRec6_cb[0] = ((iTemp0_cb) ? 0.12857020276919962 : (fTemp15_cb - floor(fTemp15_cb)));\r\n\tlet fTemp16_cb : number = (fTemp12_cb * fTemp14_cb);\r\n\tlet iTemp17_cb : Int = (iSlow33_cb & ((fSlow32_cb * fRec0_cb[0]) < fConst1_cb));\r\n\tlet fTemp18_cb : number = ((iTemp13_cb) ? fSlow6_cb : 1.0);\r\n\tlet fTemp19_cb : number = (fRec7_cb[1] + (fSlow35_cb * fRec0_cb[0]));\r\n\tfRec7_cb[0] = ((iTemp0_cb) ? 0.2508244581084461 : (fTemp19_cb - floor(fTemp19_cb)));\r\n\tlet fTemp20_cb : number = (fTemp16_cb * fTemp18_cb);\r\n\tlet iTemp21_cb : Int = (iSlow37_cb & ((fSlow36_cb * fRec0_cb[0]) < fConst1_cb));\r\n\tlet fTemp22_cb : number = ((iTemp17_cb) ? fSlow6_cb : 1.0);\r\n\tlet fTemp23_cb : number = (fRec8_cb[1] + (fSlow39_cb * fRec0_cb[0]));\r\n\tfRec8_cb[0] = ((iTemp0_cb) ? 0.8647975870165865 : (fTemp23_cb - floor(fTemp23_cb)));\r\n\tlet fTemp24_cb : number = (fTemp20_cb * fTemp22_cb);\r\n\tlet iTemp25_cb : Int = (iSlow41_cb & ((fSlow40_cb * fRec0_cb[0]) < fConst1_cb));\r\n\tlet fTemp26_cb : number = ((iTemp21_cb) ? fSlow6_cb : 1.0);\r\n\tlet fTemp27_cb : number = (fRec9_cb[1] + (fSlow43_cb * fRec0_cb[0]));\r\n\tfRec9_cb[0] = ((iTemp0_cb) ? 0.8309833188891115 : (fTemp27_cb - floor(fTemp27_cb)));\r\n\tlet fTemp28_cb : number = (fRec10_cb[1] + (fSlow47_cb * fRec0_cb[0]));\r\n\tfRec10_cb[0] = ((iTemp0_cb) ? 0.6927433679651523 : (fTemp28_cb - floor(fTemp28_cb)));\r\n\tfRec11_cb[0] = ((iTemp0_cb) ? 1.0 : ((iSlow2_cb) ? 1.0 : (fSlow51_cb * fRec11_cb[1])));\r\n\tfRec12_cb[0] = ((iTemp0_cb) ? fSlow52_cb : fRec12_cb[1]);\r\n\tlet fTemp29_cb : number = (fSlow0_cb * ((((((iTemp1_cb * exp((-1.0 * (fSlow5_cb * fTemp2_cb)))) * sin((6.283185307179586 * fRec2_cb[0]))) + (((iTemp1_cb) ? fSlow6_cb : 1.0) * (((((((((iTemp4_cb * exp((-1.0 * (fSlow18_cb * fTemp2_cb)))) * sin((6.283185307179586 * fRec3_cb[0]))) + (((iTemp6_cb * fTemp7_cb) * exp((-1.0 * (fSlow22_cb * fTemp2_cb)))) * sin((6.283185307179586 * fRec4_cb[0])))) + ((((fTemp7_cb * iTemp9_cb) * fTemp10_cb) * exp((-1.0 * (fSlow26_cb * fTemp2_cb)))) * sin((6.283185307179586 * fRec5_cb[0])))) + ((((fTemp12_cb * iTemp13_cb) * fTemp14_cb) * exp((-1.0 * (fSlow30_cb * fTemp2_cb)))) * sin((6.283185307179586 * fRec6_cb[0])))) + ((((fTemp16_cb * iTemp17_cb) * fTemp18_cb) * exp((-1.0 * (fSlow34_cb * fTemp2_cb)))) * sin((6.283185307179586 * fRec7_cb[0])))) + ((((fTemp20_cb * iTemp21_cb) * fTemp22_cb) * exp((-1.0 * (fSlow38_cb * fTemp2_cb)))) * sin((6.283185307179586 * fRec8_cb[0])))) + ((((fTemp24_cb * iTemp25_cb) * fTemp26_cb) * exp((-1.0 * (fSlow42_cb * fTemp2_cb)))) * sin((6.283185307179586 * fRec9_cb[0])))) + (((((fTemp24_cb * fTemp26_cb) * (iSlow45_cb & ((fSlow44_cb * fRec0_cb[0]) < fConst1_cb))) * ((iTemp25_cb) ? fSlow6_cb : 1.0)) * exp((-1.0 * (fSlow46_cb * fTemp2_cb)))) * sin((6.283185307179586 * fRec10_cb[0])))))) * ((iSlow49_cb) ? min(1.0, (fSlow50_cb * fTemp2_cb)) : 1.0)) * fRec11_cb[0]) * fRec12_cb[0]));\r\n\toutput0_cb = fTemp29_cb;\r\n\toutput1_cb = fTemp29_cb;\r\n\tfVec0_cb[1] = fVec0_cb[0];\r\n\tfRec0_cb[1] = fRec0_cb[0];\r\n\tiRec1_cb[1] = iRec1_cb[0];\r\n\tfRec2_cb[1] = fRec2_cb[0];\r\n\tfRec3_cb[1] = fRec3_cb[0];\r\n\tfRec4_cb[1] = fRec4_cb[0];\r\n\tfRec5_cb[1] = fRec5_cb[0];\r\n\tfRec6_cb[1] = fRec6_cb[0];\r\n\tfRec7_cb[1] = fRec7_cb[0];\r\n\tfRec8_cb[1] = fRec8_cb[0];\r\n\tfRec9_cb[1] = fRec9_cb[0];\r\n\tfRec10_cb[1] = fRec10_cb[0];\r\n\tfRec11_cb[1] = fRec11_cb[0];\r\n\tfRec12_cb[1] = fRec12_cb[0];\r\n\treturn [output0_cb,output1_cb];\r\n}\r\n// Update parameters\r\nupdate(attack,crystal,decay,freq,gain,gate,level,release,rolloff);\r\n// Compute one frame\r\noutputs = compute();\r\n// Write the outputs: audio ones and bargraph as additional audio signals\r\nout1 = outputs[0];\r\nout2 = outputs[1];\r\n",
                                        "hot": 0
                                    }
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-2",
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 1,
                                    "patching_rect": [
                                        48.0,
                                        48.0,
                                        60.0,
                                        22.0
                                    ],
                                    "text": "out~ 1",
                                    "outlettype": [
                                        ""
                                    ],
                                    "rnbo_classname": "out~"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-3",
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 1,
                                    "patching_rect": [
                                        192.0,
                                        48.0,
                                        60.0,
                                        22.0
                                    ],
                                    "text": "out~ 2",
                                    "outlettype": [
                                        ""
                                    ],
                                    "rnbo_classname": "out~"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-4",
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 1,
                                    "patching_rect": [
                                        336.0,
                                        48.0,
                                        66.0,
                                        22.0
                                    ],
                                    "text": "set attack",
                                    "outlettype": [
                                        ""
                                    ],
                                    "rnbo_classname": "set"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-5",
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 2,
                                    "patching_rect": [
                                        480.0,
                                        48.0,
                                        60.0,
                                        22.0
                                    ],
                                    "text": "param attack 80 @min 1 @max 500",
                                    "outlettype": [
                                        "",
                                        ""
                                    ],
                                    "rnbo_classname": "param"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-6",
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 1,
                                    "patching_rect": [
                                        48.0,
                                        120.0,
                                        66.0,
                                        22.0
                                    ],
                                    "text": "set crystal",
                                    "outlettype": [
                                        ""
                                    ],
                                    "rnbo_classname": "set"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-7",
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 2,
                                    "patching_rect": [
                                        192.0,
                                        120.0,
                                        60.0,
                                        22.0
                                    ],
                                    "text": "param crystal 0 @min 0 @max 8",
                                    "outlettype": [
                                        "",
                                        ""
                                    ],
                                    "rnbo_classname": "param"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-8",
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 1,
                                    "patching_rect": [
                                        336.0,
                                        120.0,
                                        66.0,
                                        22.0
                                    ],
                                    "text": "set decay",
                                    "outlettype": [
                                        ""
                                    ],
                                    "rnbo_classname": "set"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-9",
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 2,
                                    "patching_rect": [
                                        480.0,
                                        120.0,
                                        60.0,
                                        22.0
                                    ],
                                    "text": "param decay 5.5 @min 0.1 @max 20",
                                    "outlettype": [
                                        "",
                                        ""
                                    ],
                                    "rnbo_classname": "param"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-10",
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 1,
                                    "patching_rect": [
                                        48.0,
                                        192.0,
                                        66.0,
                                        22.0
                                    ],
                                    "text": "set freq",
                                    "outlettype": [
                                        ""
                                    ],
                                    "rnbo_classname": "set"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-11",
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 2,
                                    "patching_rect": [
                                        192.0,
                                        192.0,
                                        60.0,
                                        22.0
                                    ],
                                    "text": "param freq 110 @min 20 @max 5000",
                                    "outlettype": [
                                        "",
                                        ""
                                    ],
                                    "rnbo_classname": "param"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-12",
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 1,
                                    "patching_rect": [
                                        336.0,
                                        192.0,
                                        66.0,
                                        22.0
                                    ],
                                    "text": "set gain",
                                    "outlettype": [
                                        ""
                                    ],
                                    "rnbo_classname": "set"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-13",
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 2,
                                    "patching_rect": [
                                        480.0,
                                        192.0,
                                        60.0,
                                        22.0
                                    ],
                                    "text": "param gain 1 @min 0 @max 1",
                                    "outlettype": [
                                        "",
                                        ""
                                    ],
                                    "rnbo_classname": "param"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-14",
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 1,
                                    "patching_rect": [
                                        48.0,
                                        264.0,
                                        66.0,
                                        22.0
                                    ],
                                    "text": "set gate",
                                    "outlettype": [
                                        ""
                                    ],
                                    "rnbo_classname": "set"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-15",
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 2,
                                    "patching_rect": [
                                        192.0,
                                        264.0,
                                        60.0,
                                        22.0
                                    ],
                                    "text": "param gate 0 @min 0 @max 1",
                                    "outlettype": [
                                        "",
                                        ""
                                    ],
                                    "rnbo_classname": "param"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-16",
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 1,
                                    "patching_rect": [
                                        336.0,
                                        264.0,
                                        66.0,
                                        22.0
                                    ],
                                    "text": "set level",
                                    "outlettype": [
                                        ""
                                    ],
                                    "rnbo_classname": "set"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-17",
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 2,
                                    "patching_rect": [
                                        480.0,
                                        264.0,
                                        60.0,
                                        22.0
                                    ],
                                    "text": "param level 0.5 @min 0 @max 1",
                                    "outlettype": [
                                        "",
                                        ""
                                    ],
                                    "rnbo_classname": "param"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-18",
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 1,
                                    "patching_rect": [
                                        48.0,
                                        336.0,
                                        66.0,
                                        22.0
                                    ],
                                    "text": "set release",
                                    "outlettype": [
                                        ""
                                    ],
                                    "rnbo_classname": "set"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-19",
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 2,
                                    "patching_rect": [
                                        192.0,
                                        336.0,
                                        60.0,
                                        22.0
                                    ],
                                    "text": "param release 0.4 @min 0.01 @max 10",
                                    "outlettype": [
                                        "",
                                        ""
                                    ],
                                    "rnbo_classname": "param"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-20",
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 1,
                                    "patching_rect": [
                                        336.0,
                                        336.0,
                                        66.0,
                                        22.0
                                    ],
                                    "text": "set rolloff",
                                    "outlettype": [
                                        ""
                                    ],
                                    "rnbo_classname": "set"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-21",
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 2,
                                    "patching_rect": [
                                        480.0,
                                        336.0,
                                        60.0,
                                        22.0
                                    ],
                                    "text": "param rolloff 0.7 @min 0.3 @max 1",
                                    "outlettype": [
                                        "",
                                        ""
                                    ],
                                    "rnbo_classname": "param"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-22",
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 3,
                                    "patching_rect": [
                                        48.0,
                                        408.0,
                                        60.0,
                                        22.0
                                    ],
                                    "text": "notein",
                                    "outlettype": [
                                        "",
                                        "",
                                        ""
                                    ],
                                    "rnbo_classname": "notein"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-23",
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 1,
                                    "patching_rect": [
                                        192.0,
                                        408.0,
                                        60.0,
                                        22.0
                                    ],
                                    "text": "mtof",
                                    "outlettype": [
                                        ""
                                    ],
                                    "rnbo_classname": "mtof"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-24",
                                    "maxclass": "newobj",
                                    "numinlets": 6,
                                    "numoutlets": 1,
                                    "patching_rect": [
                                        336.0,
                                        408.0,
                                        60.0,
                                        22.0
                                    ],
                                    "text": "scale 0 127 0 1",
                                    "outlettype": [
                                        ""
                                    ],
                                    "rnbo_classname": "scale"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-25",
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 1,
                                    "patching_rect": [
                                        480.0,
                                        408.0,
                                        66.0,
                                        22.0
                                    ],
                                    "text": "> 0",
                                    "outlettype": [
                                        ""
                                    ],
                                    "rnbo_classname": ">"
                                }
                            }
                        ],
                        "lines": [
                            {
                                "patchline": {
                                    "source": [
                                        "obj-1",
                                        0
                                    ],
                                    "destination": [
                                        "obj-2",
                                        0
                                    ],
                                    "order": 0
                                }
                            },
                            {
                                "patchline": {
                                    "source": [
                                        "obj-1",
                                        1
                                    ],
                                    "destination": [
                                        "obj-3",
                                        0
                                    ],
                                    "order": 0
                                }
                            },
                            {
                                "patchline": {
                                    "source": [
                                        "obj-5",
                                        0
                                    ],
                                    "destination": [
                                        "obj-4",
                                        0
                                    ],
                                    "order": 0
                                }
                            },
                            {
                                "patchline": {
                                    "source": [
                                        "obj-4",
                                        0
                                    ],
                                    "destination": [
                                        "obj-1",
                                        0
                                    ],
                                    "order": 0
                                }
                            },
                            {
                                "patchline": {
                                    "source": [
                                        "obj-7",
                                        0
                                    ],
                                    "destination": [
                                        "obj-6",
                                        0
                                    ],
                                    "order": 0
                                }
                            },
                            {
                                "patchline": {
                                    "source": [
                                        "obj-6",
                                        0
                                    ],
                                    "destination": [
                                        "obj-1",
                                        0
                                    ],
                                    "order": 0
                                }
                            },
                            {
                                "patchline": {
                                    "source": [
                                        "obj-9",
                                        0
                                    ],
                                    "destination": [
                                        "obj-8",
                                        0
                                    ],
                                    "order": 0
                                }
                            },
                            {
                                "patchline": {
                                    "source": [
                                        "obj-8",
                                        0
                                    ],
                                    "destination": [
                                        "obj-1",
                                        0
                                    ],
                                    "order": 0
                                }
                            },
                            {
                                "patchline": {
                                    "source": [
                                        "obj-11",
                                        0
                                    ],
                                    "destination": [
                                        "obj-10",
                                        0
                                    ],
                                    "order": 0
                                }
                            },
                            {
                                "patchline": {
                                    "source": [
                                        "obj-10",
                                        0
                                    ],
                                    "destination": [
                                        "obj-1",
                                        0
                                    ],
                                    "order": 0
                                }
                            },
                            {
                                "patchline": {
                                    "source": [
                                        "obj-13",
                                        0
                                    ],
                                    "destination": [
                                        "obj-12",
                                        0
                                    ],
                                    "order": 0
                                }
                            },
                            {
                                "patchline": {
                                    "source": [
                                        "obj-12",
                                        0
                                    ],
                                    "destination": [
                                        "obj-1",
                                        0
                                    ],
                                    "order": 0
                                }
                            },
                            {
                                "patchline": {
                                    "source": [
                                        "obj-15",
                                        0
                                    ],
                                    "destination": [
                                        "obj-14",
                                        0
                                    ],
                                    "order": 0
                                }
                            },
                            {
                                "patchline": {
                                    "source": [
                                        "obj-14",
                                        0
                                    ],
                                    "destination": [
                                        "obj-1",
                                        0
                                    ],
                                    "order": 0
                                }
                            },
                            {
                                "patchline": {
                                    "source": [
                                        "obj-17",
                                        0
                                    ],
                                    "destination": [
                                        "obj-16",
                                        0
                                    ],
                                    "order": 0
                                }
                            },
                            {
                                "patchline": {
                                    "source": [
                                        "obj-16",
                                        0
                                    ],
                                    "destination": [
                                        "obj-1",
                                        0
                                    ],
                                    "order": 0
                                }
                            },
                            {
                                "patchline": {
                                    "source": [
                                        "obj-19",
                                        0
                                    ],
                                    "destination": [
                                        "obj-18",
                                        0
                                    ],
                                    "order": 0
                                }
                            },
                            {
                                "patchline": {
                                    "source": [
                                        "obj-18",
                                        0
                                    ],
                                    "destination": [
                                        "obj-1",
                                        0
                                    ],
                                    "order": 0
                                }
                            },
                            {
                                "patchline": {
                                    "source": [
                                        "obj-21",
                                        0
                                    ],
                                    "destination": [
                                        "obj-20",
                                        0
                                    ],
                                    "order": 0
                                }
                            },
                            {
                                "patchline": {
                                    "source": [
                                        "obj-20",
                                        0
                                    ],
                                    "destination": [
                                        "obj-1",
                                        0
                                    ],
                                    "order": 0
                                }
                            },
                            {
                                "patchline": {
                                    "source": [
                                        "obj-22",
                                        0
                                    ],
                                    "destination": [
                                        "obj-23",
                                        0
                                    ],
                                    "order": 0
                                }
                            },
                            {
                                "patchline": {
                                    "source": [
                                        "obj-23",
                                        0
                                    ],
                                    "destination": [
                                        "obj-10",
                                        0
                                    ],
                                    "order": 0
                                }
                            },
                            {
                                "patchline": {
                                    "source": [
                                        "obj-22",
                                        1
                                    ],
                                    "destination": [
                                        "obj-24",
                                        0
                                    ],
                                    "order": 0
                                }
                            },
                            {
                                "patchline": {
                                    "source": [
                                        "obj-24",
                                        0
                                    ],
                                    "destination": [
                                        "obj-12",
                                        0
                                    ],
                                    "order": 0
                                }
                            },
                            {
                                "patchline": {
                                    "source": [
                                        "obj-22",
                                        1
                                    ],
                                    "destination": [
                                        "obj-25",
                                        0
                                    ],
                                    "order": 0
                                }
                            },
                            {
                                "patchline": {
                                    "source": [
                                        "obj-25",
                                        0
                                    ],
                                    "destination": [
                                        "obj-14",
                                        0
                                    ],
                                    "order": 0
                                }
                            }
                        ],
                        "dependency_cache": [],
                        "autosave": 0
                    },
                    "text": "rnbo~",
                    "outlettype": [
                        ""
                    ],
                    "inletInfo": {
                        "IOInfo": [
                            {
                                "comment": "",
                                "index": 2,
                                "tag": "in2",
                                "type": "midi"
                            }
                        ]
                    },
                    "outletInfo": {
                        "IOInfo": [
                            {
                                "comment": "",
                                "index": 1,
                                "tag": "out1",
                                "type": "signal"
                            },
                            {
                                "comment": "",
                                "index": 2,
                                "tag": "out2",
                                "type": "signal"
                            },
                            {
                                "comment": "",
                                "index": 2,
                                "tag": "out2",
                                "type": "midi"
                            }
                        ]
                    },
                    "title": "crystal",
                    "saved_object_attributes": {
                        "optimization": "O3",
                        "title": "crystal",
                        "dumpoutlet": 1,
                        "polyphony": 8
                    }
                }
            },
            {
                "box": {
                    "id": "obj-3",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "patching_rect": [
                        192.0,
                        48.0,
                        60.0,
                        22.0
                    ],
                    "text": "attrui",
                    "outlettype": [
                        ""
                    ],
                    "attr": "attack",
                    "minimum": 1,
                    "maximum": 500,
                    "parameter_enable": 1,
                    "saved_attribute_attributes": {
                        "valueof": {
                            "parameter_initial": [
                                "attack",
                                80
                            ],
                            "parameter_initial_enable": 1
                        }
                    }
                }
            },
            {
                "box": {
                    "id": "obj-4",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "patching_rect": [
                        336.0,
                        48.0,
                        60.0,
                        22.0
                    ],
                    "text": "attrui",
                    "outlettype": [
                        ""
                    ],
                    "attr": "crystal",
                    "minimum": 0,
                    "maximum": 8,
                    "parameter_enable": 1,
                    "saved_attribute_attributes": {
                        "valueof": {
                            "parameter_initial": [
                                "crystal",
                                0
                            ],
                            "parameter_initial_enable": 1
                        }
                    }
                }
            },
            {
                "box": {
                    "id": "obj-5",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "patching_rect": [
                        480.0,
                        48.0,
                        60.0,
                        22.0
                    ],
                    "text": "attrui",
                    "outlettype": [
                        ""
                    ],
                    "attr": "decay",
                    "minimum": 0.1,
                    "maximum": 20,
                    "parameter_enable": 1,
                    "saved_attribute_attributes": {
                        "valueof": {
                            "parameter_initial": [
                                "decay",
                                5.5
                            ],
                            "parameter_initial_enable": 1
                        }
                    }
                }
            },
            {
                "box": {
                    "id": "obj-6",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "patching_rect": [
                        48.0,
                        120.0,
                        60.0,
                        22.0
                    ],
                    "text": "attrui",
                    "outlettype": [
                        ""
                    ],
                    "attr": "freq",
                    "minimum": 20,
                    "maximum": 5000,
                    "parameter_enable": 1,
                    "saved_attribute_attributes": {
                        "valueof": {
                            "parameter_initial": [
                                "freq",
                                110
                            ],
                            "parameter_initial_enable": 1
                        }
                    }
                }
            },
            {
                "box": {
                    "id": "obj-7",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "patching_rect": [
                        192.0,
                        120.0,
                        60.0,
                        22.0
                    ],
                    "text": "attrui",
                    "outlettype": [
                        ""
                    ],
                    "attr": "gain",
                    "minimum": 0,
                    "maximum": 1,
                    "parameter_enable": 1,
                    "saved_attribute_attributes": {
                        "valueof": {
                            "parameter_initial": [
                                "gain",
                                1
                            ],
                            "parameter_initial_enable": 1
                        }
                    }
                }
            },
            {
                "box": {
                    "id": "obj-8",
                    "maxclass": "toggle",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "patching_rect": [
                        336.0,
                        120.0,
                        24.0,
                        24.0
                    ],
                    "text": "toggle",
                    "outlettype": [
                        "int"
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-9",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "patching_rect": [
                        480.0,
                        120.0,
                        60.0,
                        22.0
                    ],
                    "text": "attrui",
                    "outlettype": [
                        ""
                    ],
                    "attr": "gate",
                    "parameter_enable": 1,
                    "minimum": 0,
                    "maximum": 1,
                    "saved_attribute_attributes": {
                        "valueof": {
                            "parameter_initial": [
                                "gate",
                                0
                            ],
                            "parameter_initial_enable": 1
                        }
                    }
                }
            },
            {
                "box": {
                    "id": "obj-10",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "patching_rect": [
                        48.0,
                        192.0,
                        60.0,
                        22.0
                    ],
                    "text": "attrui",
                    "outlettype": [
                        ""
                    ],
                    "attr": "level",
                    "minimum": 0,
                    "maximum": 1,
                    "parameter_enable": 1,
                    "saved_attribute_attributes": {
                        "valueof": {
                            "parameter_initial": [
                                "level",
                                0.5
                            ],
                            "parameter_initial_enable": 1
                        }
                    }
                }
            },
            {
                "box": {
                    "id": "obj-11",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "patching_rect": [
                        192.0,
                        192.0,
                        60.0,
                        22.0
                    ],
                    "text": "attrui",
                    "outlettype": [
                        ""
                    ],
                    "attr": "release",
                    "minimum": 0.01,
                    "maximum": 10,
                    "parameter_enable": 1,
                    "saved_attribute_attributes": {
                        "valueof": {
                            "parameter_initial": [
                                "release",
                                0.4
                            ],
                            "parameter_initial_enable": 1
                        }
                    }
                }
            },
            {
                "box": {
                    "id": "obj-12",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "patching_rect": [
                        336.0,
                        192.0,
                        60.0,
                        22.0
                    ],
                    "text": "attrui",
                    "outlettype": [
                        ""
                    ],
                    "attr": "rolloff",
                    "minimum": 0.3,
                    "maximum": 1,
                    "parameter_enable": 1,
                    "saved_attribute_attributes": {
                        "valueof": {
                            "parameter_initial": [
                                "rolloff",
                                0.7
                            ],
                            "parameter_initial_enable": 1
                        }
                    }
                }
            },
            {
                "box": {
                    "id": "obj-13",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "patching_rect": [
                        480.0,
                        192.0,
                        60.0,
                        22.0
                    ],
                    "text": "midiin",
                    "outlettype": [
                        ""
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-14",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "patching_rect": [
                        48.0,
                        264.0,
                        60.0,
                        22.0
                    ],
                    "text": "midiout",
                    "outlettype": [
                        ""
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-15",
                    "maxclass": "toggle",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "patching_rect": [
                        192.0,
                        264.0,
                        24.0,
                        24.0
                    ],
                    "text": "toggle",
                    "outlettype": [
                        "int"
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-16",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "patching_rect": [
                        336.0,
                        264.0,
                        60.0,
                        22.0
                    ],
                    "text": "dac~ 1 2",
                    "outlettype": [
                        ""
                    ]
                }
            }
        ],
        "lines": [
            {
                "patchline": {
                    "source": [
                        "obj-3",
                        0
                    ],
                    "destination": [
                        "obj-2",
                        0
                    ],
                    "order": 0
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-4",
                        0
                    ],
                    "destination": [
                        "obj-2",
                        0
                    ],
                    "order": 0
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-5",
                        0
                    ],
                    "destination": [
                        "obj-2",
                        0
                    ],
                    "order": 0
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-6",
                        0
                    ],
                    "destination": [
                        "obj-2",
                        0
                    ],
                    "order": 0
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-7",
                        0
                    ],
                    "destination": [
                        "obj-2",
                        0
                    ],
                    "order": 0
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-8",
                        0
                    ],
                    "destination": [
                        "obj-9",
                        0
                    ],
                    "order": 0
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-9",
                        0
                    ],
                    "destination": [
                        "obj-2",
                        0
                    ],
                    "order": 0
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-10",
                        0
                    ],
                    "destination": [
                        "obj-2",
                        0
                    ],
                    "order": 0
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-11",
                        0
                    ],
                    "destination": [
                        "obj-2",
                        0
                    ],
                    "order": 0
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-12",
                        0
                    ],
                    "destination": [
                        "obj-2",
                        0
                    ],
                    "order": 0
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-13",
                        0
                    ],
                    "destination": [
                        "obj-2",
                        1
                    ],
                    "order": 0
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-2",
                        2
                    ],
                    "destination": [
                        "obj-14",
                        0
                    ],
                    "order": 0
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-15",
                        0
                    ],
                    "destination": [
                        "obj-16",
                        0
                    ],
                    "order": 0
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-2",
                        0
                    ],
                    "destination": [
                        "obj-16",
                        0
                    ],
                    "order": 0
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-2",
                        1
                    ],
                    "destination": [
                        "obj-16",
                        1
                    ],
                    "order": 1
                }
            }
        ],
        "dependency_cache": [],
        "autosave": 0
    }
}