# title: Phoneme Choir — rich — render spellings
# born: 2026-11-03
# links: [[Phoneme Choir]] (connects-to · rich-face-workshop) · renders what "Phoneme Choir — rich — the spelling is the prompt.html" plays
# forward_vector: I re-render the trill audition the build lost — the seven spellings of brrrrahhh, two of the other repeated-letter
#   strings, and three phoneme strings handed straight to the model with the trill symbol in them — in two of the build's voices,
#   and I write down the phonemes kokoro-onnx's front end made of each spelling, so the piece shows the record, not a guess.
#   Run with Loudon's TTS venv:
#     /Users/loudonstearns/documents/TTS/.venv/bin/python -I "Projects/Phoneme Choir/Phoneme Choir — rich — render spellings.py"
import json, sys, datetime, importlib.metadata
from pathlib import Path
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = Path(__file__).resolve().parent
OUT = HERE / "rich-face"
TTS = Path("/Users/loudonstearns/documents/TTS")
VOICES = ["am_adam", "af_bella"]          # bold and warm; both sat in the bucket that would have voiced the trill key
SPELLINGS = ["brrrrahhh", "brah", "vrrrrah", "rrrrah", "brrah", "rraaaaah", "burrrrrah", "ssssss", "ahhh"]
ONLY_PHONEMIZED = ["fffff", "uuuuh", "knock", "rah rah rah", "b", "r", "s", "v"]   # the last four: what the front end says for a letter alone
# the door around the spelling: phonemes straight to the model (create(..., is_phonemes=True)), with "r", the trill symbol, in Kokoro's vocabulary
PHONEMES = {"door-brrrr-ah": "brrrrˈɑː", "door-burrrrr-ah": "bˈʌrrrrrɑː", "door-br-ah": "bˈrɑː"}

def main():
    OUT.mkdir(exist_ok=True)
    k = Kokoro(str(TTS / "kokoro-v1.0.onnx"), str(TTS / "voices-v1.0.bin"))
    rec = {"rendered": datetime.date.today().isoformat(), "engine": f"kokoro-onnx {importlib.metadata.version('kokoro-onnx')}, kokoro-v1.0.onnx, voices-v1.0.bin, en-us, speed 1.0, its own silence trim on (the build's settings)",
           "voices": VOICES, "spellings": {}, "phonemes": {}}
    for t in SPELLINGS + ONLY_PHONEMIZED:
        rec["spellings"][t] = {"ipa": k.tokenizer.phonemize(t, "en-us"), "files": {}}
    for v in VOICES:
        for t in SPELLINGS:
            a, sr = k.create(t, voice=v, speed=1.0, lang="en-us")
            name = f"spelling-{t}-{v}.wav"; sf.write(str(OUT / name), a, sr, subtype="PCM_16")
            rec["spellings"][t]["files"][v] = name
        for key, ipa in PHONEMES.items():
            a, sr = k.create(ipa, voice=v, speed=1.0, is_phonemes=True)
            name = f"{key}-{v}.wav"; sf.write(str(OUT / name), a, sr, subtype="PCM_16")
            rec["phonemes"].setdefault(key, {"ipa": ipa, "files": {}})["files"][v] = name
    (OUT / "renders.json").write_text(json.dumps(rec, ensure_ascii=False, indent=1) + "\n")
    print(json.dumps(rec, ensure_ascii=False, indent=1))

if __name__ == "__main__":
    main()
