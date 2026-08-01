# Claud2

Studio-grade finishing pipeline for a vertical talking-head reel.

```bash
./process_reel.sh source.mp4 out.mp4 [START] [END]
```

Requires `ffmpeg` (6.x) and Python with `numpy` + `soundfile`.

## What it does

**Edit.** Trims the head and tail where the camera is placed and picked up
again (defaults `1.60s` → `39.30s`, i.e. 40.8s → 37.7s).

**Audio.** The source was 64 kbps AAC, and measuring it turned up four
specific defects rather than generic "noise":

| Problem measured in the source | Fix |
| --- | --- |
| Mains-harmonic hum and rumble at 102 / 136 / 351 / 526 Hz | narrow notches + 85 Hz high-pass |
| Steady whistle artefacts at 1515 / 1563 / 1630 Hz, +9 dB above the room tone and audible even in the pauses | narrow notches |
| A ~10 dB mic/room resonance at 2.5 kHz — the source's harshest band, 12 dB above its neighbours | −11 dB bell |
| Scooped 800–2000 Hz, the intelligibility band | broad +6 dB fill |
| Consonant energy above 3.4 kHz lost to the low-bitrate encode | +3…+7 dB shelving lifts |

Then broadband denoise (`afftdn` + `anlmdn`), which drops the room floor
about 6.5 dB while costing speech under 1 dB, and the speech gate below.
Finally de-essing, two-stage compression and two-pass loudness normalisation
to **−14.5 LUFS / −1.0 dBTP**, the Instagram target.

**Picture.** The source is flat — highlights topped out at 206/255. A levels
stretch recovers the full range (peak 253, zero clipping), a partial
white-balance correction neutralises the warm cast on the shirt and skin
while keeping the purple LED look, then light denoise, upscale to 1080×1920
and sharpen at the target resolution.

## `denoise_gate.py`

Removes swallows, breaths and lip smacks from between the words. It requires
energy in *both* the voice band (150–1000 Hz) and the formant band
(1–4 kHz) to call something speech — mouth noises are low-band or
narrow-band only — and runs the detector with hysteresis, 45 ms of
lookahead and a 130 ms hold so consonant attacks and word tails are never
clipped. Ordinary pauses are ducked 26 dB (room tone is kept, so gaps don't
sound dead); isolated mouth noises inside those pauses are muted outright.

On the source clip it removed 22 noises. Verified against the ungated track:
**0.00 dB lost on clearly-voiced frames**, up to 60 dB of attenuation on the
noise.
