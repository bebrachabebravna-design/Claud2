#!/usr/bin/env bash
# Studio-grade finish for a vertical talking-head reel.
#
#   ./process_reel.sh SRC.mp4 OUT.mp4 [START] [END]
#
# START/END trim off the camera being placed and picked up again.
# Every filter value below was measured from the source, not guessed —
# see README.md for the diagnosis behind each one.
set -euo pipefail

SRC=${1:?source video}
OUT=${2:?output video}
START=${3:-1.60}
END=${4:-39.30}
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

DUR=$(python3 -c "print(f'{$END-$START:.3f}')")
FADE_OUT=$(python3 -c "print(f'{$END-$START-0.04:.3f}')")

# --- 1. repair: kill rumble, the mains-harmonic hum and the whistles that
#        sit on top of the room tone, then broadband-denoise what is left.
ffmpeg -v error -ss "$START" -to "$END" -i "$SRC" -vn -ac 1 -ar 48000 \
  -af "highpass=f=85:p=2,\
equalizer=f=102:t=q:w=14:g=-7,\
equalizer=f=136:t=q:w=14:g=-5,\
equalizer=f=351:t=q:w=20:g=-10,\
equalizer=f=526:t=q:w=20:g=-9,\
equalizer=f=3000:t=q:w=30:g=-5,\
afftdn=nr=20:nf=-46:tn=1,\
anlmdn=s=0.0006:p=0.003:r=0.008" \
  -c:a pcm_s16le "$WORK/clean.wav" -y

# --- 2. remove swallows / breaths / smacks from between the words
python3 "$(dirname "$0")/denoise_gate.py" "$WORK/clean.wav" "$WORK/gated.wav"

# --- 3. tone shaping and dynamics.
#   notches   1515/1563/1630 Hz  steady whistle artefacts
#   -11 dB    2500 Hz            10 dB mic/room resonance, the harshness
#   fills     1100-2000 Hz       the scooped intelligibility band
#   lifts     3400-6800 Hz       consonant definition the 64 kbps source lost
ffmpeg -v error -i "$WORK/gated.wav" \
  -af "equalizer=f=1515:t=q:w=45:g=-11,\
equalizer=f=1563:t=q:w=45:g=-10,\
equalizer=f=1630:t=q:w=45:g=-6,\
equalizer=f=2500:t=q:w=1.6:g=-11,\
equalizer=f=2450:t=q:w=4:g=-3,\
lowshelf=f=150:g=-6,\
equalizer=f=165:t=q:w=2.0:g=+3,\
equalizer=f=400:t=q:w=1.0:g=-2.5,\
equalizer=f=1300:t=q:w=0.75:g=+6,\
equalizer=f=2000:t=q:w=1.6:g=+4,\
equalizer=f=3400:t=q:w=1.3:g=+3,\
equalizer=f=5000:t=q:w=1.1:g=+7,\
equalizer=f=6800:t=q:w=1.4:g=+5,\
volume=10dB,\
deesser=i=0.35:m=0.5:f=0.22,\
acompressor=threshold=-18dB:ratio=3:attack=8:release=150:knee=6:makeup=1.5,\
acompressor=threshold=-9dB:ratio=4:attack=3:release=80:knee=4,\
alimiter=limit=0.891:attack=4:release=60:level=disabled" \
  -c:a pcm_s16le "$WORK/pre.wav" -y

# --- 4. loudness: two-pass to the -14 LUFS / -1 dBTP social target
MEAS=$(ffmpeg -i "$WORK/pre.wav" -af loudnorm=I=-14:TP=-1.0:LRA=7:print_format=json \
        -f null - 2>&1 | sed -n '/^{/,/^}/p')
read -r MI MTP MLRA MTH OFF < <(python3 -c "
import json,sys; d=json.loads(sys.stdin.read())
print(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'],d['target_offset'])" <<<"$MEAS")

ffmpeg -v error -i "$WORK/pre.wav" \
  -af "loudnorm=I=-13.3:TP=-1.0:LRA=7:measured_I=$MI:measured_TP=$MTP:\
measured_LRA=$MLRA:measured_thresh=$MTH:offset=$OFF,\
alimiter=limit=0.891:attack=4:release=60:level=disabled" \
  -ar 48000 -c:a pcm_s16le "$WORK/final.wav" -y

# --- 5. picture: light denoise, warm-cast correction on the subject,
#        a levels stretch (source highlights topped out at 206/255),
#        then upscale to 1080x1920 and sharpen at the target resolution.
ffmpeg -v error -stats -ss "$START" -to "$END" -i "$SRC" -i "$WORK/final.wav" \
  -map 0:v:0 -map 1:a:0 \
  -vf "hqdn3d=1.5:1.2:6:6,\
colorchannelmixer=rr=0.953:gg=0.998:bb=1.057,\
curves=all='0/0 0.25/0.26 0.5/0.545 0.81/0.965 1/1',\
eq=contrast=1.06:saturation=1.04:gamma=1.02,\
scale=1080:1920:flags=lanczos,\
unsharp=5:5:0.7:5:5:0.0" \
  -c:v libx264 -preset slower -crf 20 -profile:v high -level 4.0 -pix_fmt yuv420p \
  -g 60 -keyint_min 60 -sc_threshold 0 -r 30 \
  -af "afade=t=in:st=0:d=0.04,afade=t=out:st=$FADE_OUT:d=0.04,aresample=48000" \
  -c:a aac -b:a 192k -ar 48000 -ac 2 \
  -movflags +faststart -shortest "$OUT" -y

echo
echo "wrote $OUT (${DUR}s)"
ffmpeg -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | tail -13 | grep -E "I:|LRA:|Peak:"
