/* ============================================================
   ЗВУК
   Всё синтезируется прямо в браузере через Web Audio API,
   поэтому никаких mp3 файлов качать не нужно и сайт весит копейки.

   Sound.sfx.*   короткие звуки (лента, разрыв бумаги, хлопки)
   Sound.music.* мягкая фоновая музыка (шкатулка + подложка)
   ============================================================ */

const Sound = (function () {
  let ctx = null;
  let master, sfxBus, musicBus;
  let noiseBuf = null;
  let started = false;
  let musicOn = true;

  /* ---------- утилиты ---------- */
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const now = () => ctx.currentTime;
  const rnd = (a, b) => a + Math.random() * (b - a);

  function ensure() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();

    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);

    sfxBus = ctx.createGain();
    sfxBus.gain.value = 0.55;
    sfxBus.connect(master);

    musicBus = ctx.createGain();
    musicBus.gain.value = 0.0;
    musicBus.connect(master);

    // общая шумовая заготовка для шелеста и хлопков
    const len = ctx.sampleRate * 2;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

    return true;
  }

  function unlock() {
    if (!ensure()) return;
    if (ctx.state === 'suspended') ctx.resume();
    if (!started) {
      started = true;
      if (musicOn) music.start();
    }
  }

  /* ---------- кирпичики ---------- */
  function noise(dur, filterType, f0, f1, gain, q) {
    if (!ensure()) return;
    const t = now();
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;

    const flt = ctx.createBiquadFilter();
    flt.type = filterType || 'bandpass';
    flt.Q.value = q == null ? 1 : q;
    flt.frequency.setValueAtTime(Math.max(40, f0), t);
    flt.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + dur);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.04, dur * 0.3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    src.connect(flt).connect(g).connect(sfxBus);
    src.start(t);
    src.stop(t + dur + 0.05);
  }

  function tone(freq, dur, type, gain, bend, delay) {
    if (!ensure()) return;
    const t = now() + (delay || 0);
    const osc = ctx.createOscillator();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    if (bend) osc.frequency.exponentialRampToValueAtTime(Math.max(30, bend), t + dur);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(g).connect(sfxBus);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  // звонкая нота шкатулки
  function bell(freq, dur, gain, delay, bus) {
    if (!ensure()) return;
    const t = now() + (delay || 0);
    const out = bus || sfxBus;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(out);

    [1, 2.01, 3.02].forEach((mult, i) => {
      const o = ctx.createOscillator();
      o.type = i === 0 ? 'triangle' : 'sine';
      o.frequency.value = freq * mult;
      const og = ctx.createGain();
      og.gain.value = [1, 0.32, 0.12][i];
      o.connect(og).connect(g);
      o.start(t);
      o.stop(t + dur + 0.05);
    });
  }

  /* ---------- готовые звуки ---------- */
  const sfx = {
    click() { unlock(); tone(760, 0.07, 'sine', 0.10, 420); },

    hover() { unlock(); tone(1200, 0.05, 'sine', 0.04, 1500); },

    // лента развязывается, шелковое скольжение
    ribbon() {
      unlock();
      noise(0.55, 'bandpass', 700, 3400, 0.16, 1.6);
      noise(0.35, 'highpass', 2000, 5000, 0.06, 0.7);
    },

    // маленький рывок бумаги, дергается пока тянешь
    tearTick() {
      unlock();
      noise(rnd(0.05, 0.11), 'highpass', rnd(1400, 2600), rnd(2600, 5200), rnd(0.05, 0.13), 0.8);
    },

    // бумага рвётся целиком
    tearBig() {
      unlock();
      noise(0.5, 'highpass', 3200, 900, 0.28, 0.7);
      noise(0.28, 'bandpass', 1800, 600, 0.16, 1.2);
      tone(180, 0.22, 'triangle', 0.05, 90, 0.12);
    },

    // хлопок открытия
    pop() {
      unlock();
      tone(620, 0.10, 'sine', 0.22, 130);
      noise(0.09, 'bandpass', 1800, 600, 0.14, 1.4);
    },

    whoosh() {
      unlock();
      noise(0.6, 'lowpass', 320, 2600, 0.13, 0.6);
    },

    // печать на конверте ломается
    sealCrack() {
      unlock();
      noise(0.14, 'bandpass', 2400, 800, 0.2, 2.2);
      tone(140, 0.26, 'triangle', 0.10, 70);
      noise(0.3, 'highpass', 1200, 3000, 0.05, 0.8);
    },

    paperSlide() {
      unlock();
      noise(0.45, 'bandpass', 900, 2200, 0.09, 1.1);
    },

    // блёстки
    sparkle(n) {
      unlock();
      const scale = [84, 86, 88, 91, 93, 96];
      const count = n || 5;
      for (let i = 0; i < count; i++) {
        bell(mtof(scale[(Math.random() * scale.length) | 0]), rnd(0.5, 0.9), 0.07, i * 0.055);
      }
    },

    // большой момент: коробка открылась
    boxOpen() {
      unlock();
      sfx.ribbon();
      setTimeout(() => { sfx.pop(); sfx.whoosh(); }, 380);
      [65, 69, 72, 77, 81].forEach((m, i) => bell(mtof(m), 1.5, 0.10, 0.45 + i * 0.075));
      setTimeout(() => sfx.sparkle(6), 700);
    },

    // финальный салют
    fireworks() {
      unlock();
      for (let i = 0; i < 5; i++) {
        const d = i * 0.28;
        setTimeout(() => {
          tone(rnd(90, 150), 0.28, 'triangle', 0.14, 50);
          noise(0.55, 'highpass', rnd(2200, 4200), 700, 0.16, 0.6);
          for (let k = 0; k < 7; k++) {
            noise(rnd(0.03, 0.07), 'bandpass', rnd(2500, 6000), rnd(1200, 3000), rnd(0.03, 0.08), 3);
          }
        }, d * 1000);
      }
      [72, 76, 79, 84, 88].forEach((m, i) => bell(mtof(m), 2.2, 0.10, 0.5 + i * 0.09));
    },

    // мягкий переход между слоями
    swipe() {
      unlock();
      noise(0.4, 'bandpass', 400, 2000, 0.07, 0.9);
    },

    // карточка воспоминания встала на место
    tick() {
      unlock();
      bell(mtof(88 + ((Math.random() * 4) | 0)), 0.28, 0.05);
    }
  };

  /* ---------- фоновая музыка ---------- */
  const music = (function () {
    const BPM = 68;
    const beat = 60 / BPM;
    const step = beat / 2;              // восьмые
    const STEPS = 32;                   // 4 такта по 8 восьмых

    // F, Dm, Bb, C
    const chords = [
      [53, 57, 60],
      [50, 53, 57],
      [46, 50, 53],
      [48, 52, 55]
    ];
    const arpPattern = [0, 1, 2, 1, 2, 1, 0, 1];
    const lead = {
      2: 84, 6: 81,
      10: 79, 14: 81,
      18: 77, 22: 79,
      26: 81, 30: 84
    };

    let timer = null, nextTime = 0, stepIdx = 0, padNodes = [];

    function playPad(chord, t, dur) {
      chord.forEach((m, i) => {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = mtof(m - 12);
        o.detune.value = (i - 1) * 6;

        const f = ctx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.setValueAtTime(420, t);
        f.frequency.linearRampToValueAtTime(760, t + dur * 0.5);
        f.frequency.linearRampToValueAtTime(420, t + dur);
        f.Q.value = 0.6;

        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.028, t + dur * 0.35);
        g.gain.linearRampToValueAtTime(0.0001, t + dur);

        o.connect(f).connect(g).connect(musicBus);
        o.start(t);
        o.stop(t + dur + 0.1);
        padNodes.push(o);
        if (padNodes.length > 40) padNodes.shift();
      });
    }

    function playBass(m, t, dur) {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = mtof(m - 24);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.075, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(musicBus);
      o.start(t);
      o.stop(t + dur + 0.05);
    }

    function boxNote(freq, t, dur, gain) {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(gain, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      g.connect(musicBus);

      [1, 2.01, 3.86].forEach((mult, i) => {
        const o = ctx.createOscillator();
        o.type = i === 0 ? 'triangle' : 'sine';
        o.frequency.value = freq * mult;
        const og = ctx.createGain();
        og.gain.value = [1, 0.28, 0.1][i];
        o.connect(og).connect(g);
        o.start(t);
        o.stop(t + dur + 0.05);
      });
    }

    function scheduleStep(i, t) {
      const bar = (i / 8) | 0;
      const chord = chords[bar];
      const inBar = i % 8;

      if (inBar === 0) {
        playPad(chord, t, beat * 4);
        playBass(chord[0], t, beat * 1.6);
      }

      // шкатулка
      const note = chord[arpPattern[inBar]] + 12;
      boxNote(mtof(note), t, 1.1, 0.05);

      // редкая верхняя нота
      if (lead[i] != null) boxNote(mtof(lead[i]), t, 1.8, 0.045);
    }

    function scheduler() {
      if (!ctx) return;
      while (nextTime < ctx.currentTime + 0.2) {
        scheduleStep(stepIdx, nextTime);
        nextTime += step;
        stepIdx = (stepIdx + 1) % STEPS;
      }
    }

    return {
      start() {
        if (!ensure() || timer) return;
        nextTime = ctx.currentTime + 0.15;
        stepIdx = 0;
        scheduler();
        timer = setInterval(scheduler, 40);
        musicBus.gain.cancelScheduledValues(ctx.currentTime);
        musicBus.gain.setValueAtTime(musicBus.gain.value, ctx.currentTime);
        musicBus.gain.linearRampToValueAtTime(0.85, ctx.currentTime + 2.2);
      },
      stop() {
        if (!ctx) return;
        musicBus.gain.cancelScheduledValues(ctx.currentTime);
        musicBus.gain.setValueAtTime(musicBus.gain.value, ctx.currentTime);
        musicBus.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
        if (timer) { clearInterval(timer); timer = null; }
      },
      // тише во время важных моментов, чтобы не мешала
      duck(seconds) {
        if (!ctx || !timer) return;
        const t = ctx.currentTime;
        musicBus.gain.cancelScheduledValues(t);
        musicBus.gain.setValueAtTime(musicBus.gain.value, t);
        musicBus.gain.linearRampToValueAtTime(0.3, t + 0.15);
        musicBus.gain.linearRampToValueAtTime(0.85, t + (seconds || 2));
      }
    };
  })();

  return {
    unlock,
    sfx,
    music,
    get isMusicOn() { return musicOn; },
    toggleMusic() {
      unlock();
      musicOn = !musicOn;
      if (musicOn) music.start(); else music.stop();
      return musicOn;
    }
  };
})();
