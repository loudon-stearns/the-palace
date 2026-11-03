# title: Talking Keyboard — rich — render
# born: 2026-11-03
# links: [[Talking Keyboard]] (connects-to · rich-face-workshop) · renders what "Talking Keyboard — rich — three spellings of A.html" and "Talking Keyboard — rich — the next variant.html" play, into rich-face/
# forward_vector: I re-render the spoken-A bug the build fixed and the variants the page lists, with the build's own settings, and I write down
#   the phonemes kokoro-onnx's front end made of every string, so the pieces show the record, not a guess. With --verify I also re-render
#   all 352 shipped samples from generate.py's own text and say how far each lands from the file in git.
#   Run with Loudon's TTS venv:
#     /Users/loudonstearns/documents/TTS/.venv/bin/python -I "Projects/Talking Keyboard/Talking Keyboard — rich — render.py" [--verify]
import json, sys, datetime, importlib.metadata, importlib.util
from pathlib import Path
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = Path(__file__).resolve().parent
OUT = HERE / "rich-face"
PALACE = HERE.parent.parent
BUILD = PALACE / "_ops/sample-libraries/talking-keyboard"
TTS = Path("/Users/loudonstearns/documents/TTS")
VOICES = ["af_nova", "af_heart", "bf_emma", "am_michael"]   # the build's four layers, pp to ff
# the three spellings of the spoken A the build went through, on A4, as generate.py builds the string
LESSON = {"A": "A four", "ay": "ay four", "eigh": "eigh four"}
# the build log's seven-candidate audition (build-log.md), the two already above reused
AUDITION = {"ate": "ate four", "ace": "ace four", "aye": "aye four", "ey": "ey four", "A-dot": "A. four"}
AUDITION_VOICE = "af_heart"
# Future Variants: one octave, C4 to B4 on the white keys
SOLFEGE = ["do", "re", "mi", "fa", "sol", "la", "ti"]               # as the page writes it, "Do, Re, Mi"
RESPELT = ["doe", "ray", "mee", "fah", "soh", "lah", "tee"]          # the eigh move again: a spelling the English front end reads right
ITALIAN = ["do", "re", "mi", "fa", "sol", "la", "si"]                # the page's "Do quattro", Italian front end, Italian voice
FRENCH = ["do", "ré", "mi", "fa", "sol", "la", "si"]                 # the page's "Do quatre", French front end, French voice
VARIANT_VOICE = "af_heart"
PROBE = ["A", "C", "C four", "B four", "an A four", "eight"]          # what the front end says for a few strings alone

def render(k, text, voice, lang, name):
    a, sr = k.create(text, voice=voice, speed=1.0, lang=lang)
    sf.write(str(OUT / name), a, sr, subtype="PCM_16")
    return name

def main():
    OUT.mkdir(exist_ok=True)
    k = Kokoro(str(TTS / "kokoro-v1.0.onnx"), str(TTS / "voices-v1.0.bin"))
    ph = lambda t, lang="en-us": k.tokenizer.phonemize(t, lang)
    rec = {"rendered": datetime.date.today().isoformat(),
           "engine": f"kokoro-onnx {importlib.metadata.version('kokoro-onnx')}, kokoro-v1.0.onnx, voices-v1.0.bin, speed 1.0 (the build's settings; en-us for the English strings, as generate.py passes for all four voices)",
           "voices": VOICES, "lesson": {}, "audition": {}, "variants": {}, "probe": {t: ph(t) for t in PROBE}}
    for key, text in LESSON.items():
        rec["lesson"][key] = {"text": text, "ipa": ph(text), "files": {v: render(k, text, v, "en-us", f"lesson-{key}-{v}.wav") for v in VOICES}}
    for key, text in AUDITION.items():
        rec["audition"][key] = {"text": text, "ipa": ph(text), "files": {AUDITION_VOICE: render(k, text, AUDITION_VOICE, "en-us", f"audition-{key}-{AUDITION_VOICE}.wav")}}
    var = rec["variants"]
    var["solfege"] = {"lang": "en-us", "voice": VARIANT_VOICE, "keys": []}
    var["respelt"] = {"lang": "en-us", "voice": VARIANT_VOICE, "keys": []}
    var["italian"] = {"lang": "it", "voice": "if_sara", "keys": []}
    var["french"] = {"lang": "fr-fr", "voice": "ff_siwis", "keys": []}
    for i in range(7):
        for vk, syl, tail in (("solfege", SOLFEGE[i], " four"), ("respelt", RESPELT[i], " four"), ("italian", ITALIAN[i], " quattro"), ("french", FRENCH[i], " quatre")):
            v = var[vk]; text = syl + tail
            v["keys"].append({"syllable": syl, "text": text, "ipa": ph(text, v["lang"]), "syllable_ipa": ph(syl, v["lang"]),
                              "file": render(k, text, v["voice"], v["lang"], f"variant-{vk}-{i}-{v['voice']}.wav")})
    var["pitch-class"] = {"lang": "en-us", "voice": VARIANT_VOICE, "text": "C", "ipa": ph("C"), "file": render(k, "C", VARIANT_VOICE, "en-us", f"variant-pitchclass-C-{VARIANT_VOICE}.wav")}

    if "--verify" in sys.argv:
        spec = importlib.util.spec_from_file_location("gen", BUILD / "generate.py"); gen = importlib.util.module_from_spec(spec)
        sys.modules["kokoro_onnx"].Kokoro  # generate.py imports at top level; the venv has it
        spec.loader.exec_module(gen)
        rows, worst = [], 0
        for midi in range(gen.MIDI_LOW, gen.MIDI_HIGH + 1):
            stem, text = gen.midi_to_filename_stem(midi), gen.midi_to_spoken_text(midi)
            for L in gen.VELOCITY_LAYERS:
                a, sr = k.create(text, voice=L["voice"], speed=1.0, lang="en-us")
                q = np.round(np.clip(a, -1, 1) * 32767).astype(np.int32)
                b, sr2 = sf.read(str(BUILD / "samples" / f"kokoro_{stem}_v{L['layer']}.wav"), dtype="int16")
                same_len = len(q) == len(b)
                lsb = int(np.max(np.abs(q[:min(len(q), len(b))] - b[:min(len(q), len(b))].astype(np.int32)))) if min(len(q), len(b)) else None
                worst = max(worst, lsb if same_len else 1 << 16)
                rows.append({"midi": midi, "stem": stem, "layer": L["layer"], "voice": L["voice"], "text": text, "ipa": ph(text), "same_length": same_len, "max_lsb": lsb})
        rec["verify"] = {"what": "every shipped sample re-rendered from generate.py's own text and voice, compared sample by sample with the file in git, in 16-bit steps",
                         "files": len(rows), "worst_lsb": worst, "rows": rows}
    (OUT / "renders.json").write_text(json.dumps(rec, ensure_ascii=False, indent=1) + "\n")
    print(json.dumps({k2: v for k2, v in rec.items() if k2 != "verify"}, ensure_ascii=False, indent=1)[:6000])
    if "verify" in rec: print("verify:", rec["verify"]["files"], "files, worst", rec["verify"]["worst_lsb"], "LSB")

if __name__ == "__main__":
    main()
