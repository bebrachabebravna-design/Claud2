#!/usr/bin/env python3
"""Speech-aware noise gate for talking-head footage.

Removes swallows, breaths, lip smacks and room tone from the gaps between
words while leaving speech — including word tails — untouched.

Usage:  denoise_gate.py IN.wav OUT.wav
"""
import sys
import numpy as np
import soundfile as sf

DUCK_DB = -26.0   # room tone left in ordinary pauses, so gaps don't sound dead
MUTE_DB = -60.0   # isolated mouth noises: removed outright
OPEN_DB, CLOSE_DB = 15.0, 9.0   # detector hysteresis, dB over the running floor
LOOKAHEAD_S, HOLD_S = 0.045, 0.130
MIN_RUN_S = 0.09  # openings shorter than this are stray clicks, not speech


def main(src, dst):
    x, sr = sf.read(src)
    if x.ndim > 1:
        x = x.mean(1)
    n = len(x)

    win, hop = 1024, 128
    w = np.hanning(win)
    nfr = (n - win) // hop + 1
    freqs = np.fft.rfftfreq(win, 1 / sr)
    S = np.empty((nfr, len(freqs)), dtype=np.float32)
    for i in range(nfr):
        S[i] = np.abs(np.fft.rfft(x[i * hop:i * hop + win] * w))
    t = np.arange(nfr) * hop / sr
    eps = 1e-10

    def band(lo, hi):
        m = (freqs >= lo) & (freqs < hi)
        return 20 * np.log10(np.sqrt((S[:, m] ** 2).sum(1)) / win + eps)

    full = 20 * np.log10(np.sqrt((S ** 2).sum(1)) / win + eps)
    voice = band(150, 1000)    # fundamental + first formants
    form = band(1000, 4000)    # formants and consonants
    low = band(20, 150)        # rumble, body contact
    high = band(6000, 16000)   # sibilance, clicks

    # Speech needs energy in the voice band *and* the formant band: mouth
    # noises are narrow-band or low-band only.
    score = np.minimum(voice - np.percentile(voice, 8),
                       form - np.percentile(form, 8) + 6)
    speech = np.zeros(nfr, bool)
    on = False
    for i in range(nfr):
        if not on and score[i] > OPEN_DB:
            on = True
        elif on and score[i] < CLOSE_DB:
            on = False
        speech[i] = on

    look, hold = int(LOOKAHEAD_S * sr / hop), int(HOLD_S * sr / hop)
    op = speech.copy()
    for k in np.where(speech)[0]:
        op[max(0, k - look):min(nfr, k + hold)] = True

    min_run = int(MIN_RUN_S * sr / hop)
    i = 0
    while i < nfr:
        if op[i]:
            j = i
            while j < nfr and op[j]:
                j += 1
            if (j - i) < min_run:
                op[i:j] = False
            i = j
        else:
            i += 1

    gain_db = np.where(op, 0.0, DUCK_DB)
    events = []
    i = 0
    while i < nfr:
        if not op[i]:
            j = i
            while j < nfr and not op[j]:
                j += 1
            loc = full[i:j]
            if len(loc) > 3:
                base, peak = np.percentile(loc, 15), loc.max()
                if peak - base > 7:      # a distinct noise, not steady room tone
                    k = i + int(loc.argmax())
                    a, b = k, k
                    while a > i and full[a] > base + 3:
                        a -= 1
                    while b < j - 1 and full[b] > base + 3:
                        b += 1
                    pad = int(0.02 * sr / hop)
                    gain_db[max(0, a - pad):min(nfr, b + 1 + pad)] = MUTE_DB
                    events.append((t[a], t[b], low[k] - form[k], high[k] - form[k]))
            i = j
        else:
            i += 1

    # A mute (or its padding) must never touch a frame the detector calls speech.
    gain_db[op] = 0.0

    print(f'{op.mean() * 100:.1f}% of timeline is speech')
    print(f'{len(events)} non-speech noises removed:')
    for a, b, lowness, brightness in events:
        kind = ('swallow/breath' if lowness > 0 else
                'click/smack' if brightness > -12 else 'mouth noise')
        print(f'  {a:6.2f}-{b:6.2f}s  {kind}')

    # Sample-rate envelope, fast to open (2 ms) and slower to close (25 ms) so
    # the gate never clips a consonant attack or chatters.
    g = np.interp(np.arange(n), np.clip(t * sr, 0, n - 1), 10 ** (gain_db / 20))
    att, rel = np.exp(-1 / (0.002 * sr)), np.exp(-1 / (0.025 * sr))
    env = np.empty(n)
    prev = g[0]
    for i in range(n):
        tgt = g[i]
        prev = tgt + (prev - tgt) * (att if tgt > prev else rel)
        env[i] = prev

    sf.write(dst, (x * env).astype(np.float32), sr, subtype='FLOAT')
    print(f'wrote {dst}')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
