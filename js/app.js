/* ============================================================
   ЛОГИКА ПОДАРКА
   Слои по порядку:
   0 коробка
   1 поздравление
   2 обёртка №1 (рвать)
   3 письмо
   4 голосовое
   5 обёртка №2 (рвать)
   6 видео-шутка
   7 свечи (приглушённый свет)
   8 обёртка №3 (рвать)
   9 скретч (стереть плёнку)
   10 лента жизни
   11 17 причин
   12 финал (кнопка в тг)
   ============================================================ */

(function () {
  'use strict';

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const wait = ms => new Promise(r => setTimeout(r, ms));

  const layers = $$('.layer');
  const curtain = $('#curtain');
  const hud = $('#hud');
  const hudDots = $('#hudDots');

  const idIndex = {};
  layers.forEach((l, i) => { idIndex[l.id] = i; });
  const indexOf = id => idIndex[id];

  let current = 0;
  let maxReached = 0;
  let busy = false;

  /* ============================================================
     ФОН: ЛЕПЕСТКИ
     ============================================================ */
  (function petals() {
    const box = $('#petals');
    const glyphs = ['♥', '♡', '❀', '✿', '❁', '♥'];
    const colors = ['#ff8fab', '#ff5c85', '#ffb0c9', '#e01e46', '#ffd68a', '#ffcbdd'];
    const count = window.innerWidth < 640 ? 14 : 22;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'petal';
      p.textContent = glyphs[(Math.random() * glyphs.length) | 0];
      p.style.left = rnd(-4, 100) + 'vw';
      p.style.setProperty('--sz', rnd(11, 26).toFixed(1) + 'px');
      p.style.setProperty('--c', colors[(Math.random() * colors.length) | 0]);
      p.style.setProperty('--dur', rnd(13, 26).toFixed(1) + 's');
      p.style.setProperty('--delay', rnd(-24, 6).toFixed(1) + 's');
      p.style.setProperty('--drift', rnd(-70, 70).toFixed(0) + 'px');
      p.style.setProperty('--op', rnd(.28, .7).toFixed(2));
      box.appendChild(p);
    }
  })();

  /* ============================================================
     ШАРИКИ НА СЛОЕ ПОЗДРАВЛЕНИЯ
     ============================================================ */
  (function balloons() {
    const box = $('#l-hello .balloons');
    const colors = ['#ff8fab', '#ff5c85', '#e01e46', '#ffb0c9', '#ffd68a', '#ffcbdd', '#c1122f'];
    for (let i = 0; i < 8; i++) {
      const b = document.createElement('span');
      b.className = 'balloon';
      b.style.left = rnd(2, 88) + '%';
      b.style.setProperty('--bw', rnd(34, 64).toFixed(0) + 'px');
      b.style.setProperty('--bc', colors[i % colors.length]);
      b.style.setProperty('--bd', rnd(11, 19).toFixed(1) + 's');
      b.style.setProperty('--bdelay', rnd(0, 9).toFixed(1) + 's');
      box.appendChild(b);
    }
  })();

  /* ============================================================
     ИМЯ И ВОЗРАСТ ИЗ НАСТРОЕК
     ============================================================ */
  (function personalize() {
    const title = $('.name-title');
    title.innerHTML = '';
    title.setAttribute('aria-label', CONFIG.name);
    Array.from(CONFIG.name).forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'anim-letter';
      s.style.setProperty('--d', (0.25 + i * 0.1).toFixed(2) + 's');
      s.textContent = ch;
      title.appendChild(s);
    });

    const ageEl = $('#ageNumber');
    ageEl.innerHTML = '';
    Array.from(String(CONFIG.age)).forEach((d, i) => {
      const s = document.createElement('span');
      s.className = 'age-digit';
      s.style.animationDelay = (i * 0.2) + 's';
      s.textContent = d;
      ageEl.appendChild(s);
    });

    $('#rcPs').innerHTML = 'с днём рождения, ' + CONFIG.name + '.<br>спасибо, что ты есть ♥';
    $('#codeWord').textContent = CONFIG.codeWord;
    $('#tgBtn').href = 'https://t.me/' + CONFIG.telegram + '?text=' + encodeURIComponent(CONFIG.codeWord);
    document.title = CONFIG.name + ', с днём рождения';

    const rt = $('#reasonsTitle');
    if (rt) rt.textContent = REASONS.length + ' причин';
  })();

  /* ============================================================
     ГРАДИЕНТНЫЕ БУКВЫ
     ============================================================ */
  function paintGradientText(parent, childSelector) {
    if (!parent) return;
    const kids = $$(childSelector, parent);
    if (!kids.length) return;

    const bg = getComputedStyle(parent).backgroundImage;
    if (!bg || bg === 'none') return;

    const w = parent.offsetWidth;
    const h = parent.offsetHeight;
    if (!w || !h) return;

    kids.forEach(k => {
      k.style.backgroundImage = bg;
      k.style.backgroundSize = w + 'px ' + h + 'px';
      k.style.backgroundPosition = (-k.offsetLeft) + 'px ' + (-k.offsetTop) + 'px';
      k.style.backgroundRepeat = 'no-repeat';
      k.style.webkitBackgroundClip = 'text';
      k.style.backgroundClip = 'text';
      k.style.color = 'transparent';
    });
  }

  function fitName() {
    const t = $('.name-title');
    if (!t || !t.parentElement) return;
    const avail = t.parentElement.clientWidth - 24;
    if (avail <= 0) return;
    t.style.fontSize = '';
    let size = parseFloat(getComputedStyle(t).fontSize);
    let guard = 0;
    while (t.scrollWidth > avail && size > 30 && guard++ < 60) {
      size -= 2;
      t.style.fontSize = size + 'px';
    }
  }

  function paintAllGradients() {
    fitName();
    paintGradientText($('.name-title'), '.anim-letter');
    paintGradientText($('#ageNumber'), '.age-digit');
  }

  paintAllGradients();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(paintAllGradients);
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(paintAllGradients, 160);
  });

  /* ============================================================
     ТОЧКИ ПРОГРЕССА
     ============================================================ */
  (function buildDots() {
    layers.forEach((l, i) => {
      const b = document.createElement('button');
      b.className = 'hud-dot';
      b.type = 'button';
      b.setAttribute('aria-label', 'слой ' + (i + 1));
      b.addEventListener('click', () => {
        if (i <= maxReached && i !== current) goTo(i);
      });
      hudDots.appendChild(b);
    });
    updateDots();
  })();

  function updateDots() {
    $$('.hud-dot', hudDots).forEach((d, i) => {
      d.classList.toggle('is-current', i === current);
      d.classList.toggle('is-done', i < current);
      d.disabled = i > maxReached;
    });
  }

  /* ============================================================
     ПЕРЕХОД МЕЖДУ СЛОЯМИ
     ============================================================ */
  function restartAnims(root) {
    $$('.anim, .reveal, .anim-letter', root).forEach(n => {
      n.style.animation = 'none';
      void n.offsetWidth;
      n.style.animation = '';
    });
  }

  async function goTo(index) {
    if (busy || index === current || !layers[index]) return;
    busy = true;

    Sound.sfx.swipe();
    curtain.classList.add('is-closed');
    await wait(520);

    const from = layers[current];
    const to = layers[index];

    onLeave(from.id);

    from.classList.remove('is-active');
    from.hidden = true;
    from.scrollTop = 0;

    to.hidden = false;
    void to.offsetWidth;
    restartAnims(to);
    to.classList.add('is-active');
    to.scrollTop = 0;

    current = index;
    maxReached = Math.max(maxReached, index);
    updateDots();

    curtain.classList.remove('is-closed');
    onEnter(to.id);

    await wait(500);
    busy = false;
  }

  function goNext() { goTo(current + 1); }

  function onEnter(id) {
    if (current > 0) hud.classList.add('is-visible');

    switch (id) {
      case 'l-box': resetBox(); break;
      case 'l-hello':
        paintAllGradients();
        setTimeout(paintAllGradients, 60);
        setTimeout(() => Confetti.rain(60, { sizeMin: 7, sizeMax: 16 }), 250);
        setTimeout(() => Confetti.sideCannons(24), 700);
        setTimeout(() => Sound.sfx.sparkle(4), 400);
        break;
      case 'l-paper':
      case 'l-paper2':
      case 'l-paper3': resetTear($('.tear-stage', layers[current])); break;
      case 'l-letter': resetLetter(); break;
      case 'l-voice': resetVoice(); break;
      case 'l-video': resetVideo(); break;
      case 'l-candles': enterCandles(); break;
      case 'l-scratch': resetScratch(); break;
      case 'l-timeline':
        resetTimeline();
        setTimeout(() => Confetti.rain(26, { sizeMin: 6, sizeMax: 12, maxLife: 300 }), 300);
        break;
      case 'l-reasons': resetReasons(); break;
      case 'l-final': resetFinal(); break;
    }
  }

  function onLeave(id) {
    if (id === 'l-voice') stopVoice();
    if (id === 'l-video') stopVideo();
    if (id === 'l-candles') leaveCandles();
    if (id === 'l-timeline') $$('.tl-vid', $('#tlTrack')).forEach(v => v.pause());
  }

  /* ============================================================
     КНОПКИ ПЕРЕХОДА
     ============================================================ */
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-go]');
    if (!btn) return;
    Sound.sfx.click();
    if (btn.dataset.go === 'next') goNext();
    else goTo(parseInt(btn.dataset.go, 10));
  });

  /* ============================================================
     СЛОЙ: КОРОБКА
     ============================================================ */
  const box = $('#giftbox');
  let boxOpened = false;

  function resetBox() {
    boxOpened = false;
    box.classList.remove('is-open');
    $('.intro-line').classList.remove('is-fading-out');
    $('.tap-hint').classList.remove('is-fading-out');
  }

  box.addEventListener('click', async () => {
    if (boxOpened) return;
    boxOpened = true;

    Sound.unlock();
    Sound.sfx.boxOpen();
    Sound.music.duck(3.4);

    box.classList.add('is-open');
    $('.intro-line').classList.add('is-fading-out');
    $('.tap-hint').classList.add('is-fading-out');

    setTimeout(() => Confetti.burstFrom(box, 110, { speedMin: 6, speedMax: 20, lift: 6, sizeMin: 7, sizeMax: 18 }), 360);
    setTimeout(() => Confetti.sideCannons(26), 640);
    setTimeout(() => Confetti.rain(40), 820);

    await wait(1350);
    goNext();
  });

  /* ============================================================
     РВЁМ ОБЁРТКУ (переиспользуемый компонент)
     На странице три бумажки, у каждой своё состояние.
     ============================================================ */
  let activeTear = null;   // за какую бумажку сейчас тянут

  function initTear(stage) {
    const layer = stage.closest('.layer');
    const grip = $('.tear-grip', stage);
    const label = $('.tear-progress-label', layer);
    const hint = $('.paper-hint', layer);

    const st = { tear: 0, torn: false, dragging: false, startX: 0, startY: 0, lastTick: 0, moved: 0 };
    stage._t = st;
    stage._label = label;
    stage._hint = hint;
    stage._grip = grip;

    grip.addEventListener('pointerdown', e => {
      if (st.torn) return;
      activeTear = stage;
      st.dragging = true;
      st.moved = 0;
      const p = e.touches ? e.touches[0] : e;
      st.startX = p.clientX;
      st.startY = p.clientY;
      stage.classList.remove('is-smooth');
      if (grip.setPointerCapture && e.pointerId != null) {
        try { grip.setPointerCapture(e.pointerId); } catch (err) { /* ничего */ }
      }
    });
  }

  function tearSet(stage, v) {
    const st = stage._t;
    st.tear = clamp(v, 0, 1);
    stage.style.setProperty('--tear', st.tear.toFixed(3));
    stage._label.textContent = Math.round(st.tear * 100) + '%';
    if (st.tear > 0.08) stage._hint.style.opacity = String(1 - st.tear * 0.8);

    if (st.tear - st.lastTick > 0.05) { st.lastTick = st.tear; Sound.sfx.tearTick(); }
    if (st.tear < st.lastTick) st.lastTick = st.tear;

    if (st.tear >= 0.62 && !st.torn) tearComplete(stage);
  }

  async function tearComplete(stage) {
    const st = stage._t;
    if (st.torn) return;
    st.torn = true;
    st.dragging = false;
    activeTear = null;

    stage.classList.remove('is-smooth');
    stage.classList.add('is-torn');
    stage.style.setProperty('--tear', '1');
    stage._label.textContent = '100%';
    stage._label.style.opacity = '0';

    Sound.sfx.tearBig();
    Sound.music.duck(2.6);
    setTimeout(() => Confetti.burstFrom(stage, 80, { speedMin: 5, speedMax: 17, lift: 4 }), 120);
    setTimeout(() => Sound.sfx.sparkle(4), 420);

    await wait(1150);
    goNext();
  }

  function resetTear(stage) {
    if (!stage) return;
    const st = stage._t;
    st.torn = false;
    st.dragging = false;
    st.lastTick = 0;
    stage.classList.remove('is-torn', 'is-smooth');
    stage._label.style.opacity = '';
    stage._hint.style.opacity = '';
    tearSet(stage, 0);
    st.lastTick = 0;
  }

  window.addEventListener('pointermove', e => {
    const stage = activeTear;
    if (!stage) return;
    const st = stage._t;
    if (!st.dragging || st.torn) return;
    const p = e.touches ? e.touches[0] : e;
    const dx = p.clientX - st.startX;
    const dy = p.clientY - st.startY;
    const dist = Math.hypot(dx, dy);
    st.moved = Math.max(st.moved, dist);
    tearSet(stage, dist / 240);
    if (e.cancelable) e.preventDefault();
  }, { passive: false });

  function tearUp() {
    const stage = activeTear;
    if (!stage) return;
    const st = stage._t;
    if (!st.dragging || st.torn) return;
    st.dragging = false;

    if (st.moved < 10) {
      // короткий тап тоже рвёт, в несколько заходов
      stage.classList.add('is-smooth');
      tearSet(stage, st.tear + 0.34);
      Sound.sfx.tearTick();
      if (!st.torn) activeTear = null;
      return;
    }
    stage.classList.add('is-smooth');
    tearSet(stage, 0);
    st.lastTick = 0;
    activeTear = null;
  }
  window.addEventListener('pointerup', tearUp);
  window.addEventListener('pointercancel', tearUp);

  $$('.tear-stage').forEach(initTear);

  /* ============================================================
     СЛОЙ: КОНВЕРТ И ПИСЬМО
     ============================================================ */
  const envStage = $('#envelopeStage');
  const envelope = $('#envelope');
  const envSeal = $('#envSeal');
  const envHint = $('#envHint');
  const letterEl = $('#letter');
  const letterBody = $('#letterBody');
  const letterNext = $('#letterNext');
  const letterScrollHint = $('#letterScrollHint');
  const letterLayer = $('#l-letter');
  let letterOpened = false;
  let letterSeen = false;

  function buildLetter() {
    letterBody.innerHTML = '';
    LETTER.forEach((para, i) => {
      const p = document.createElement('p');
      p.textContent = para;
      p.style.setProperty('--d', (0.3 + i * 0.3).toFixed(2) + 's');
      letterBody.appendChild(p);
    });
    const signDelay = 0.3 + LETTER.length * 0.3 + 0.25;
    $('.letter-sign').style.setProperty('--sign-d', signDelay.toFixed(2) + 's');
  }

  envSeal.addEventListener('click', async () => {
    if (letterOpened) return;
    letterOpened = true;
    letterSeen = true;

    Sound.sfx.sealCrack();
    Sound.music.duck(2.4);
    envelope.classList.add('is-open');
    envHint.classList.add('is-hidden');
    Confetti.burstFrom(envSeal, 34, { speedMin: 3, speedMax: 11, sizeMin: 5, sizeMax: 11 });

    await wait(560);
    Sound.sfx.paperSlide();
    await wait(700);
    envStage.classList.add('is-gone');
    await wait(560);
    envStage.hidden = true;
    letterEl.hidden = false;
    buildLetter();
    Sound.sfx.sparkle(3);

    setTimeout(() => { letterNext.hidden = false; letterNext.classList.add('anim'); }, 2200);
  });

  function resetLetter() {
    letterScrollHint.classList.remove('is-hidden');
    if (letterSeen) {
      letterOpened = true;
      envStage.hidden = true;
      letterEl.hidden = false;
      buildLetter();
      letterNext.hidden = false;
      return;
    }
    letterOpened = false;
    envelope.classList.remove('is-open');
    envStage.classList.remove('is-gone');
    envStage.hidden = false;
    envHint.classList.remove('is-hidden');
    letterEl.hidden = true;
    letterNext.hidden = true;
    letterBody.innerHTML = '';
  }

  letterLayer.addEventListener('scroll', () => {
    if (letterLayer.scrollTop > 40) letterScrollHint.classList.add('is-hidden');
  }, { passive: true });

  /* ============================================================
     СЛОЙ: ГОЛОСОВОЕ
     ============================================================ */
  const voiceAudio = $('#voiceAudio');
  const voicePlay = $('#voicePlay');
  const voiceWave = $('#voiceWave');
  const voiceTime = $('#voiceTime');
  const voiceHint = $('#voiceHint');
  const voiceNext = $('#voiceNext');
  let voiceWaveTimer = null;
  let voiceStarted = false;

  (function buildWave() {
    for (let i = 0; i < 34; i++) {
      const b = document.createElement('i');
      voiceWave.appendChild(b);
    }
  })();

  function fmtTime(s) {
    s = Math.max(0, Math.floor(s || 0));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  function waveTick() {
    $$('i', voiceWave).forEach(b => {
      b.style.height = (18 + Math.random() * 80) + '%';
    });
  }

  function setVoiceIcon(playing) {
    $('.vp-play', voicePlay).hidden = playing;
    $('.vp-pause', voicePlay).hidden = !playing;
    voicePlay.classList.toggle('is-playing', playing);
    voiceWave.classList.toggle('is-playing', playing);
  }

  voicePlay.addEventListener('click', () => {
    Sound.unlock();
    if (voiceAudio.paused) {
      // приглушаем фоновую музыку, чтобы голос было слышно
      Sound.music.duck(60);
      voiceAudio.play().catch(() => {});
    } else {
      voiceAudio.pause();
    }
  });

  voiceAudio.addEventListener('play', () => {
    voiceStarted = true;
    setVoiceIcon(true);
    voiceHint.classList.add('is-hidden');
    voiceNext.hidden = false;
    if (voiceWaveTimer) clearInterval(voiceWaveTimer);
    voiceWaveTimer = setInterval(waveTick, 120);
  });
  voiceAudio.addEventListener('pause', () => {
    setVoiceIcon(false);
    if (voiceWaveTimer) { clearInterval(voiceWaveTimer); voiceWaveTimer = null; }
  });
  voiceAudio.addEventListener('timeupdate', () => {
    voiceTime.textContent = fmtTime(voiceAudio.currentTime);
  });
  voiceAudio.addEventListener('ended', () => {
    setVoiceIcon(false);
    if (voiceWaveTimer) { clearInterval(voiceWaveTimer); voiceWaveTimer = null; }
    $$('i', voiceWave).forEach(b => b.style.height = '20%');
    voiceTime.textContent = fmtTime(voiceAudio.duration);
    Confetti.burstFrom(voicePlay, 30, { speedMin: 3, speedMax: 10 });
  });
  voiceAudio.addEventListener('error', () => {
    // если файла нет, не блокируем прохождение
    voiceHint.textContent = 'голосовое не загрузилось, но дальше всё работает';
    voiceNext.hidden = false;
  });

  function resetVoice() {
    setVoiceIcon(false);
    voiceTime.textContent = '0:00';
    $$('i', voiceWave).forEach(b => b.style.height = '20%');
    if (voiceStarted) { voiceHint.classList.add('is-hidden'); voiceNext.hidden = false; }
    else { voiceHint.classList.remove('is-hidden'); voiceNext.hidden = true; }
  }
  function stopVoice() {
    if (!voiceAudio.paused) voiceAudio.pause();
    if (voiceWaveTimer) { clearInterval(voiceWaveTimer); voiceWaveTimer = null; }
  }

  /* ============================================================
     СЛОЙ: ВИДЕО-ШУТКА
     ============================================================ */
  const videoStage = $('#videoStage');
  const videoBox = $('#videoBox');
  const videoWrap = $('#videoWrap');
  const jokeVideo = $('#jokeVideo');
  const videoReplay = $('#videoReplay');
  const videoAfter = $('#videoAfter');
  const videoNext = $('#videoNext');
  let videoOpened = false;
  let videoSeen = false;

  function showVideoTail() {
    videoAfter.hidden = false;
    videoReplay.hidden = false;
    videoNext.hidden = false;
  }

  videoBox.addEventListener('click', async () => {
    if (videoOpened) return;
    videoOpened = true;
    videoSeen = true;

    videoBox.classList.add('is-open');
    Sound.sfx.pop();
    Sound.music.duck(30);
    setTimeout(() => Confetti.burstFrom(videoBox, 70, { speedMin: 5, speedMax: 16, lift: 5 }), 180);

    await wait(650);
    videoStage.hidden = true;
    videoWrap.hidden = false;
    jokeVideo.currentTime = 0;
    jokeVideo.play().catch(() => showVideoTail());
  });

  jokeVideo.addEventListener('ended', () => {
    Sound.sfx.sparkle(3);
    showVideoTail();
  });
  jokeVideo.addEventListener('error', showVideoTail);

  videoReplay.addEventListener('click', () => {
    Sound.sfx.click();
    jokeVideo.currentTime = 0;
    jokeVideo.play().catch(() => {});
  });

  function resetVideo() {
    if (videoSeen) {
      videoOpened = true;
      videoStage.hidden = true;
      videoWrap.hidden = false;
      showVideoTail();
      return;
    }
    videoOpened = false;
    videoBox.classList.remove('is-open');
    videoStage.hidden = false;
    videoWrap.hidden = true;
    videoAfter.hidden = true;
    videoReplay.hidden = true;
    videoNext.hidden = true;
  }
  function stopVideo() {
    if (!jokeVideo.paused) jokeVideo.pause();
  }

  /* ============================================================
     СЛОЙ: СВЕЧИ (приглушённый свет)
     ============================================================ */
  const candlesLayer = $('#l-candles');
  const cakeCandles = $('#cakeCandles');
  const candleHint = $('#candleHint');
  const candleMic = $('#candleMic');
  const candleDone = $('#candleDone');
  const candleLead = $('#candleLead');
  const CANDLE_COUNT = 6;
  let candleEls = [];
  let candlesLeft = 0;
  let candlesDoneFlag = false;
  let micStream = null, micCtx = null, micRaf = null;

  function buildCandles() {
    cakeCandles.innerHTML = '';
    candleEls = [];
    for (let i = 0; i < CANDLE_COUNT; i++) {
      const c = document.createElement('div');
      c.className = 'candle';
      const flame = document.createElement('span');
      flame.className = 'flame';
      c.appendChild(flame);
      cakeCandles.appendChild(c);
      candleEls.push(c);
    }
  }
  buildCandles();

  function blowOne() {
    const lit = candleEls.filter(c => !c.classList.contains('is-out'));
    if (!lit.length) return;
    const c = lit[(Math.random() * lit.length) | 0];
    c.classList.add('is-out');
    const smoke = document.createElement('span');
    smoke.className = 'smoke';
    c.appendChild(smoke);
    Sound.sfx.whoosh();
    candlesLeft = candleEls.filter(x => !x.classList.contains('is-out')).length;
    if (candlesLeft === 0) candlesAllOut();
  }

  async function candlesAllOut() {
    if (candlesDoneFlag) return;
    candlesDoneFlag = true;
    stopMic();

    // свет возвращается
    candlesLayer.classList.remove('dark-on');
    candleHint.classList.add('is-hidden');
    candleMic.style.display = 'none';

    Sound.sfx.sparkle(6);
    setTimeout(() => Confetti.burstFrom($('#cake'), 90, { speedMin: 5, speedMax: 17, lift: 5 }), 150);
    setTimeout(() => Confetti.rain(40), 400);

    await wait(500);
    candleDone.hidden = false;
  }

  // задувание пальцем: провёл по свече, она гаснет
  cakeCandles.addEventListener('pointermove', e => {
    if (candlesDoneFlag) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const c = el && el.closest ? el.closest('.candle') : null;
    if (c && !c.classList.contains('is-out')) blowOne();
  });
  cakeCandles.addEventListener('pointerdown', e => {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const c = el && el.closest ? el.closest('.candle') : null;
    if (c && !c.classList.contains('is-out')) blowOne();
  });

  // задувание в микрофон (по-настоящему)
  candleMic.addEventListener('click', async () => {
    Sound.sfx.click();
    if (micStream) { stopMic(); candleMic.classList.remove('is-listening'); candleMic.textContent = '🎤 дунуть по-настоящему'; return; }
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AC = window.AudioContext || window.webkitAudioContext;
      micCtx = new AC();
      const src = micCtx.createMediaStreamSource(micStream);
      const an = micCtx.createAnalyser();
      an.fftSize = 512;
      src.connect(an);
      const data = new Uint8Array(an.fftSize);
      candleMic.classList.add('is-listening');
      candleMic.textContent = '🎤 дуй!';
      candleHint.textContent = 'дуй в микрофон посильнее';

      let blowFrames = 0, lastBlow = 0;
      const loop = () => {
        an.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) { const v = (data[i] - 128) / 128; sum += v * v; }
        const rms = Math.sqrt(sum / data.length);
        if (rms > 0.16) blowFrames++; else blowFrames = 0;
        const now = performance.now();
        if (blowFrames > 3 && now - lastBlow > 220) { blowOne(); lastBlow = now; }
        if (!candlesDoneFlag) micRaf = requestAnimationFrame(loop);
      };
      loop();
    } catch (err) {
      candleMic.classList.remove('is-listening');
      candleHint.textContent = 'микрофон не дали, тогда просто проведи пальцем по свечам';
    }
  });

  function stopMic() {
    if (micRaf) { cancelAnimationFrame(micRaf); micRaf = null; }
    if (micStream) { micStream.getTracks().forEach(t => t.stop()); micStream = null; }
    if (micCtx) { try { micCtx.close(); } catch (e) {} micCtx = null; }
    candleMic.classList.remove('is-listening');
  }

  function enterCandles() {
    if (candlesDoneFlag) {
      // уже задули раньше, показываем светлую версию с кнопкой
      candlesLayer.classList.remove('dark-on');
      candleHint.classList.add('is-hidden');
      candleMic.style.display = 'none';
      candleDone.hidden = false;
      return;
    }
    candlesLayer.classList.add('dark-on');
    candleHint.classList.remove('is-hidden');
    candleHint.textContent = 'нажми и дунь в микрофон, либо проведи пальцем по свечам';
    candleMic.style.display = '';
    candleDone.hidden = true;
  }
  function leaveCandles() { stopMic(); }

  /* ============================================================
     СЛОЙ: СКРЕТЧ (стереть плёнку)
     ============================================================ */
  const scratchStage = $('#scratchStage');
  const scratchUnder = $('#scratchUnder');
  const scratchCanvas = $('#scratchCanvas');
  const scratchProgress = $('#scratchProgress');
  const scratchNext = $('#scratchNext');
  const sctx = scratchCanvas.getContext('2d');
  let scratchReady = false, scratchDone = false, scratchDrawing = false;
  let scratchSeen = false;

  // пробуем подгрузить секретное фото, иначе останется надпись
  (function loadSecretPhoto() {
    if (typeof SCRATCH_PHOTO !== 'string' || !SCRATCH_PHOTO) return;
    const img = new Image();
    img.onload = () => {
      const el = document.createElement('img');
      el.src = img.src;
      el.alt = 'секрет';
      scratchUnder.innerHTML = '';
      scratchUnder.appendChild(el);
    };
    img.src = SCRATCH_PHOTO;
  })();

  function paintFoil() {
    const r = scratchStage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    scratchCanvas.width = Math.max(1, r.width * dpr);
    scratchCanvas.height = Math.max(1, r.height * dpr);
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const g = sctx.createLinearGradient(0, 0, r.width, r.height);
    g.addColorStop(0, '#ffb0c9');
    g.addColorStop(0.5, '#ff5c85');
    g.addColorStop(1, '#e01e46');
    sctx.globalCompositeOperation = 'source-over';
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, r.width, r.height);

    // блёстки на плёнке
    sctx.fillStyle = 'rgba(255,255,255,.35)';
    for (let i = 0; i < 60; i++) {
      sctx.beginPath();
      sctx.arc(Math.random() * r.width, Math.random() * r.height, Math.random() * 2 + 0.5, 0, 6.28);
      sctx.fill();
    }
    sctx.fillStyle = 'rgba(255,255,255,.9)';
    sctx.font = '600 20px Onest, sans-serif';
    sctx.textAlign = 'center';
    sctx.fillText('сотри меня ✨', r.width / 2, r.height / 2);
    scratchReady = true;
  }

  function scratchAt(x, y) {
    const r = scratchStage.getBoundingClientRect();
    sctx.globalCompositeOperation = 'destination-out';
    sctx.beginPath();
    sctx.arc(x - r.left, y - r.top, 26, 0, 6.28);
    sctx.fill();
  }

  function scratchPercent() {
    const w = scratchCanvas.width, h = scratchCanvas.height;
    if (!w || !h) return 0;
    // считаем по сетке, чтобы не тормозить
    const step = 16;
    let clear = 0, total = 0;
    const img = sctx.getImageData(0, 0, w, h).data;
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        total++;
        if (img[(y * w + x) * 4 + 3] < 40) clear++;
      }
    }
    return total ? clear / total : 0;
  }

  let scratchCheckTimer = 0;
  function scratchMaybeCheck() {
    const now = performance.now();
    if (now - scratchCheckTimer < 220) return;
    scratchCheckTimer = now;
    const pct = scratchPercent();
    scratchProgress.textContent = 'стёрто ' + Math.round(pct * 100) + '%';
    if (pct > 0.55 && !scratchDone) scratchFinish();
  }

  async function scratchFinish() {
    scratchDone = true;
    scratchSeen = true;
    scratchStage.classList.add('is-done');
    scratchProgress.textContent = 'вот она ♥';
    Sound.sfx.sparkle(5);
    Confetti.burstFrom(scratchStage, 60, { speedMin: 4, speedMax: 14, lift: 4 });
    await wait(500);
    scratchNext.hidden = false;
    scratchNext.classList.add('anim');
  }

  function scratchPointer(e) {
    if (!scratchReady || scratchDone) return;
    if (e.type === 'pointerdown') scratchDrawing = true;
    if (!scratchDrawing) return;
    const p = e.touches ? e.touches[0] : e;
    scratchAt(p.clientX, p.clientY);
    scratchMaybeCheck();
    if (e.cancelable) e.preventDefault();
  }
  scratchCanvas.addEventListener('pointerdown', scratchPointer);
  scratchCanvas.addEventListener('pointermove', scratchPointer, { passive: false });
  window.addEventListener('pointerup', () => { scratchDrawing = false; });

  function resetScratch() {
    if (scratchSeen && scratchDone) {
      requestAnimationFrame(() => {
        paintFoil();
        scratchStage.classList.add('is-done');
        scratchProgress.textContent = 'вот она ♥';
        scratchNext.hidden = false;
      });
      return;
    }
    scratchDone = false;
    scratchDrawing = false;
    scratchStage.classList.remove('is-done');
    scratchProgress.textContent = 'стёрто 0%';
    scratchNext.hidden = true;
    requestAnimationFrame(paintFoil);
  }

  /* ============================================================
     СЛОЙ: ЛЕНТА ЖИЗНИ
     ============================================================ */
  const tlViewport = $('#tlViewport');
  const tlTrack = $('#tlTrack');
  const tlBar = $('#tlBar');
  const tlPrev = $('#tlPrev');
  const tlNext = $('#tlNext');
  const swipeHint = $('#swipeHint');
  let cards = [];
  let activeCard = -1;

  function buildTimeline() {
    tlTrack.innerHTML = '';
    const lastIdx = MEMORIES.length - 1;

    MEMORIES.forEach((m, i) => {
      const card = document.createElement('article');
      card.className = 'tl-card' + (i === lastIdx ? ' is-last' : '') + (m.video ? ' is-video' : '');
      card.style.setProperty('--tilt', (i % 2 ? 1 : -1) * rnd(0.6, 1.8).toFixed(2) + 'deg');

      const tape = document.createElement('span');
      tape.className = 'tl-tape';
      card.appendChild(tape);

      const media = document.createElement('div');
      media.className = 'tl-photo';

      if (m.video) {
        // карточка-видео: заглушка, а как файл появится, встаёт плеер
        const ph = document.createElement('div');
        ph.className = 'ph-placeholder';
        ph.innerHTML = '<span class="ph-ico">🎬</span><span class="ph-txt">сюда встанет<br>видео</span>';
        media.appendChild(ph);

        const vid = document.createElement('video');
        vid.className = 'tl-vid';
        vid.playsInline = true;
        vid.setAttribute('playsinline', '');
        vid.preload = 'auto';   // чтобы сразу показывался первый кадр
        vid.muted = false;
        vid.style.display = 'none';
        const playBtn = document.createElement('button');
        playBtn.className = 'tl-vid-play';
        playBtn.type = 'button';
        playBtn.setAttribute('aria-label', 'играть видео');
        playBtn.textContent = '►';
        playBtn.style.display = 'none';

        vid.addEventListener('loadeddata', () => {
          ph.remove();
          vid.style.display = '';
          playBtn.style.display = '';
        });
        vid.addEventListener('error', () => { /* нет файла, остаётся заглушка */ });
        vid.addEventListener('play', () => { playBtn.style.display = 'none'; });
        vid.addEventListener('pause', () => { if (!vid.ended) playBtn.style.display = ''; });
        vid.addEventListener('ended', () => { playBtn.style.display = ''; });

        playBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          Sound.unlock();
          // ставим на паузу все прочие видео в ленте
          $$('.tl-vid', tlTrack).forEach(v => { if (v !== vid) v.pause(); });
          vid.play().catch(() => {});
        });

        vid.src = m.video;
        media.appendChild(vid);
        media.appendChild(playBtn);
      } else {
        const ph = document.createElement('div');
        ph.className = 'ph-placeholder';
        ph.innerHTML = '<span class="ph-ico">🖼</span><span class="ph-txt">сюда встанет<br>фото</span>';
        media.appendChild(ph);

        const img = new Image();
        img.alt = 'фото';
        img.decoding = 'async';
        if (i > 3) img.loading = 'lazy';
        img.addEventListener('load', () => ph.remove());
        img.addEventListener('error', () => img.remove());
        img.src = m.photo;
        media.appendChild(img);
      }
      card.appendChild(media);
      tlTrack.appendChild(card);
    });
    cards = $$('.tl-card', tlTrack);
  }

  function scrollToCard(i, smooth) {
    const card = cards[clamp(i, 0, cards.length - 1)];
    if (!card) return;
    const left = card.offsetLeft - (tlViewport.clientWidth - card.offsetWidth) / 2;
    tlViewport.scrollTo({ left, behavior: smooth === false ? 'auto' : 'smooth' });
  }

  function updateTimeline() {
    if (!cards.length) return;
    const center = tlViewport.scrollLeft + tlViewport.clientWidth / 2;
    let best = 0, bestDist = Infinity;
    cards.forEach((c, i) => {
      const cc = c.offsetLeft + c.offsetWidth / 2;
      const d = Math.abs(cc - center);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    if (best !== activeCard) {
      cards.forEach((c, i) => c.classList.toggle('is-active', i === best));
      // уезжая с карточки-видео, ставим его на паузу
      $$('.tl-vid', tlTrack).forEach(v => {
        if (!v.closest('.tl-card').classList.contains('is-active')) v.pause();
      });
      activeCard = best;
      Sound.sfx.tick();
    }
    const pct = cards.length > 1 ? (best / (cards.length - 1)) : 1;
    tlBar.style.width = (pct * 100) + '%';
    tlPrev.disabled = best === 0;
    tlNext.disabled = best === cards.length - 1;
  }

  let tlRaf = null;
  tlViewport.addEventListener('scroll', () => {
    if (tlRaf) return;
    tlRaf = requestAnimationFrame(() => { tlRaf = null; updateTimeline(); });
    swipeHint.classList.add('is-hidden');
  }, { passive: true });

  tlPrev.addEventListener('click', () => { Sound.sfx.click(); scrollToCard(activeCard - 1); });
  tlNext.addEventListener('click', () => { Sound.sfx.click(); scrollToCard(activeCard + 1); });

  function resetTimeline() {
    if (!cards.length) buildTimeline();
    swipeHint.classList.remove('is-hidden');
    activeCard = -1;
    requestAnimationFrame(() => { scrollToCard(0, false); updateTimeline(); });
  }

  document.addEventListener('keydown', e => {
    if (layers[current].id !== 'l-timeline') return;
    if (e.key === 'ArrowRight') scrollToCard(activeCard + 1);
    if (e.key === 'ArrowLeft') scrollToCard(activeCard - 1);
  });

  /* ============================================================
     СЛОЙ: 17 ПРИЧИН
     ============================================================ */
  const reasonsList = $('#reasonsList');
  const reasonsNext = $('#reasonsNext');
  const reasonsLayer = $('#l-reasons');
  let reasonsBuilt = false;

  function buildReasons() {
    reasonsList.innerHTML = '';
    REASONS.forEach((text, i) => {
      const li = document.createElement('li');
      li.className = 'reason';
      li.innerHTML = '<span class="reason-num">' + (i + 1) + '</span>' +
        '<span class="reason-text"></span>';
      $('.reason-text', li).textContent = text;
      reasonsList.appendChild(li);
    });
    reasonsBuilt = true;
  }

  const reasonIO = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('is-in');
        Sound.sfx.tick();
        reasonIO.unobserve(en.target);
        // последняя причина показалась → кнопка
        if (en.target === reasonsList.lastElementChild) {
          setTimeout(() => { reasonsNext.hidden = false; reasonsNext.classList.add('anim'); }, 400);
        }
      }
    });
  }, { root: reasonsLayer, threshold: 0.35 });

  function resetReasons() {
    if (!reasonsBuilt) buildReasons();
    reasonsNext.hidden = true;
    $$('.reason', reasonsList).forEach(r => {
      r.classList.remove('is-in');
      reasonIO.observe(r);
    });
    // первые видимые проявятся сразу
    requestAnimationFrame(() => {
      $$('.reason', reasonsList).slice(0, 3).forEach((r, i) => {
        setTimeout(() => r.classList.add('is-in'), 150 + i * 160);
      });
    });
  }

  /* ============================================================
     СЛОЙ: ФИНАЛ
     ============================================================ */
  const minibox = $('#minibox');
  const finalStage = $('#finalStage');
  const revealCard = $('#revealCard');
  let finalOpened = false;
  let finalSeen = false;

  minibox.addEventListener('click', async () => {
    if (finalOpened) return;
    finalOpened = true;
    finalSeen = true;

    minibox.classList.add('is-open');
    Sound.sfx.pop();
    Sound.sfx.fireworks();
    Sound.music.duck(4);

    setTimeout(() => Confetti.burstFrom(minibox, 100, { speedMin: 6, speedMax: 20, lift: 6 }), 200);
    setTimeout(() => Confetti.fireworks(6), 500);
    setTimeout(() => Confetti.sideCannons(30), 900);
    setTimeout(() => Confetti.rain(60), 1200);

    await wait(900);
    finalStage.classList.add('is-gone');
    await wait(620);
    finalStage.hidden = true;
    revealCard.hidden = false;
    Sound.sfx.sparkle(6);
  });

  function resetFinal() {
    if (finalSeen) {
      finalOpened = true;
      finalStage.hidden = true;
      revealCard.hidden = false;
      return;
    }
    finalOpened = false;
    minibox.classList.remove('is-open');
    finalStage.classList.remove('is-gone');
    finalStage.hidden = false;
    revealCard.hidden = true;
  }

  $('#tgBtn').addEventListener('click', () => {
    Sound.sfx.sparkle(4);
    Confetti.sideCannons(20);
  });

  $('#againBtn').addEventListener('click', async () => {
    Sound.sfx.click();
    location.reload();
  });

  /* ============================================================
     МУЗЫКА
     ============================================================ */
  const musicBtn = $('#musicBtn');
  musicBtn.addEventListener('click', () => {
    const on = Sound.toggleMusic();
    musicBtn.setAttribute('aria-pressed', String(on));
  });

  function firstTouch() {
    Sound.unlock();
    musicBtn.setAttribute('aria-pressed', String(Sound.isMusicOn));
    window.removeEventListener('pointerdown', firstTouch);
    window.removeEventListener('keydown', firstTouch);
  }
  window.addEventListener('pointerdown', firstTouch);
  window.addEventListener('keydown', firstTouch);

  /* ============================================================
     СТАРТ
     ============================================================ */
  buildTimeline();
  updateDots();
  setTimeout(() => Confetti.rain(22, { sizeMin: 6, sizeMax: 13, maxLife: 340 }), 900);
})();
