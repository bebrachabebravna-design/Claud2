"""Голос: озвучка через espeak-ng (офлайн), слух через Vosk (опционально)."""
import json
import shutil
import subprocess


def speak(text: str):
    if shutil.which("espeak-ng"):
        subprocess.Popen(["espeak-ng", "-v", "ru", "-s", "165", text[:500]],
                         stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def listen_once(model_path: str, seconds=6) -> str:
    """Записать с микрофона и распознать. Нужны: pip install vosk sounddevice."""
    import queue
    import sounddevice as sd
    from vosk import KaldiRecognizer, Model
    q: "queue.Queue[bytes]" = queue.Queue()
    rec = KaldiRecognizer(Model(model_path), 16000)
    with sd.RawInputStream(samplerate=16000, blocksize=8000, dtype="int16",
                           channels=1, callback=lambda d, *_: q.put(bytes(d))):
        for _ in range(int(seconds * 2)):
            if rec.AcceptWaveform(q.get()):
                break
    return json.loads(rec.FinalResult()).get("text", "")
