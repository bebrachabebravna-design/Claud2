/* ============================================================
   ЛОГИКА ПОДАРКА
   Слои: коробка → поздравление → обёртка → письмо → лента → финал
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
  })();

  /* ============================================================
     ГРАДИЕНТНЫЕ БУКВЫ
     Буквы анимируются через transform, а из за этого они рисуются
     отдельным слоем и выпадают из background-clip родителя, то есть
     просто пропадают. Поэтому раздаём каждой букве её кусочек
     общего градиента: вместе они складываются в единую заливку.
     Считаем по offsetLeft, он не зависит от текущего transform.
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

  // длинное имя не должно упираться в края экрана
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
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(paintAllGradients);
  }
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
    onEnter(index);

    await wait(500);
    busy = false;
  }

  function onEnter(i) {
    if (i > 0) hud.classList.add('is-visible');

    if (i === 0) resetBox();

    if (i === 1) {
      // пока слой был скрыт, ширины равнялись нулю, красим уже по факту
      paintAllGradients();
      setTimeout(paintAllGradients, 60);
      setTimeout(() => Confetti.rain(60, { sizeMin: 7, sizeMax: 16 }), 250);
      setTimeout(() => Confetti.sideCannons(24), 700);
      setTimeout(() => Sound.sfx.sparkle(4), 400);
    }
    if (i === 2) resetTear();
    if (i === 3) resetLetter();
    if (i === 4) {
      resetTimeline();
      setTimeout(() => Confetti.rain(26, { sizeMin: 6, sizeMax: 12, maxLife: 300 }), 300);
    }
    if (i === 5) resetFinal();
  }

  /* ============================================================
     СЛОЙ 1: КОРОБКА
     ============================================================ */
  const box = $('#giftbox');
  let boxOpened = false;

  function resetBox() {
    boxOpened = false;
    box.classList.remove('is-open');
    $('.intro-line').classList.remove('is-fading-out');
    $('.tap-hint').classList.remove('is-fading-out');
  }

  (function boxLayer() {
    box.addEventListener('click', async () => {
      if (boxOpened) return;
      boxOpened = true;

      Sound.unlock();
      Sound.sfx.boxOpen();
      Sound.music.duck(3.4);

      box.classList.add('is-open');
      $('.intro-line').classList.add('is-fading-out');
      $('.tap-hint').classList.add('is-fading-out');

      setTimeout(() => {
        Confetti.burstFrom(box, 110, { speedMin: 6, speedMax: 20, lift: 6, sizeMin: 7, sizeMax: 18 });
      }, 360);
      setTimeout(() => Confetti.sideCannons(26), 640);
      setTimeout(() => Confetti.rain(40), 820);

      await wait(1350);
      goTo(1);
    });
  })();

  /* ============================================================
     КНОПКИ ПЕРЕХОДА
     ============================================================ */
  $$('[data-go]').forEach(btn => {
    btn.addEventListener('click', () => {
      Sound.sfx.click();
      goTo(parseInt(btn.dataset.go, 10));
    });
  });

  /* ============================================================
     СЛОЙ 3: РВЁМ ОБЁРТКУ
     ============================================================ */
  const tearStage = $('#tearStage');
  const tearGrip = $('#tearGrip');
  const tearLabel = $('#tearLabel');
  const paperHint = $('#paperHint');
  let tear = 0, torn = false, dragging = false;
  let startX = 0, startY = 0, lastTick = 0, moved = 0;

  function setTear(v) {
    tear = clamp(v, 0, 1);
    tearStage.style.setProperty('--tear', tear.toFixed(3));
    tearLabel.textContent = Math.round(tear * 100) + '%';

    if (tear > 0.08) paperHint.style.opacity = String(1 - tear * 0.8);

    // потрескивание бумаги по мере разрыва
    if (tear - lastTick > 0.05) {
      lastTick = tear;
      Sound.sfx.tearTick();
    }
    if (tear < lastTick) lastTick = tear;

    if (tear >= 0.62 && !torn) completeTear();
  }

  async function completeTear() {
    if (torn) return;
    torn = true;
    dragging = false;

    tearStage.classList.remove('is-smooth');
    tearStage.classList.add('is-torn');
    tearStage.style.setProperty('--tear', '1');
    tearLabel.textContent = '100%';
    tearLabel.style.opacity = '0';

    Sound.sfx.tearBig();
    Sound.music.duck(2.6);
    setTimeout(() => Confetti.burstFrom(tearStage, 80, { speedMin: 5, speedMax: 17, lift: 4 }), 120);
    setTimeout(() => Sound.sfx.sparkle(4), 420);

    await wait(1150);
    goTo(3);
  }

  function resetTear() {
    torn = false;
    dragging = false;
    lastTick = 0;
    tearStage.classList.remove('is-torn', 'is-smooth');
    tearLabel.style.opacity = '';
    paperHint.style.opacity = '';
    setTear(0);
    lastTick = 0;
  }

  function onDown(e) {
    if (torn) return;
    dragging = true;
    moved = 0;
    const p = e.touches ? e.touches[0] : e;
    startX = p.clientX;
    startY = p.clientY;
    tearStage.classList.remove('is-smooth');
    if (tearGrip.setPointerCapture && e.pointerId != null) {
      try { tearGrip.setPointerCapture(e.pointerId); } catch (err) { /* не критично */ }
    }
  }

  function onMove(e) {
    if (!dragging || torn) return;
    const p = e.touches ? e.touches[0] : e;
    const dx = p.clientX - startX;
    const dy = p.clientY - startY;
    const dist = Math.hypot(dx, dy);
    moved = Math.max(moved, dist);
    setTear(dist / 240);
    if (e.cancelable) e.preventDefault();
  }

  function onUp() {
    if (!dragging || torn) return;
    dragging = false;

    // короткий тап тоже рвёт бумагу, просто в несколько заходов
    if (moved < 10) {
      tearStage.classList.add('is-smooth');
      setTear(tear + 0.34);
      Sound.sfx.tearTick();
      return;
    }
    if (!torn) {
      tearStage.classList.add('is-smooth');
      setTear(0);
      lastTick = 0;
    }
  }

  tearGrip.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove, { passive: false });
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);

  /* ============================================================
     СЛОЙ 4: КОНВЕРТ И ПИСЬМО
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
    return signDelay;
  }

  let letterSeen = false;

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

    // кнопка ждёт внизу письма, показываем не дожидаясь всех абзацев
    setTimeout(() => {
      letterNext.hidden = false;
      letterNext.classList.add('anim');
    }, 2200);
  });

  function resetLetter() {
    letterScrollHint.classList.remove('is-hidden');

    // письмо уже читали, не заставляем открывать конверт заново
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
     СЛОЙ 5: ЛЕНТА ЖИЗНИ
     ============================================================ */
  const tlViewport = $('#tlViewport');
  const tlTrack = $('#tlTrack');
  const tlBar = $('#tlBar');
  const tlYear = $('#tlYear');
  const tlPrev = $('#tlPrev');
  const tlNext = $('#tlNext');
  const swipeHint = $('#swipeHint');
  let cards = [];
  let activeCard = -1;

  function buildTimeline() {
    tlTrack.innerHTML = '';

    MEMORIES.forEach((m, i) => {
      const card = document.createElement('article');
      card.className = 'tl-card' + (m.last ? ' is-last' : '');
      card.style.setProperty('--tilt', (i % 2 ? 1 : -1) * rnd(0.6, 1.8).toFixed(2) + 'deg');

      const tape = document.createElement('span');
      tape.className = 'tl-tape';
      card.appendChild(tape);

      const photo = document.createElement('div');
      photo.className = 'tl-photo';

      const badge = document.createElement('span');
      badge.className = 'tl-badge';
      badge.textContent = yearLabel(m.year);
      photo.appendChild(badge);

      const ph = document.createElement('div');
      ph.className = 'ph-placeholder';
      ph.innerHTML = '<span class="ph-ico">🖼</span><span class="ph-txt">сюда встанет фото<br>' +
        m.photo.replace('photos/', '') + '</span>';
      photo.appendChild(ph);

      // Фото подставится само, если файл лежит в папке photos.
      // Картинку НЕ прячем через display none: скрытые картинки
      // с ленивой загрузкой браузер просто никогда не грузит.
      // Поэтому заглушка лежит поверх и убирается, когда фото готово.
      const img = new Image();
      img.alt = 'фото, ' + yearLabel(m.year);
      img.decoding = 'async';
      if (i > 3) img.loading = 'lazy';   // первые карточки грузим сразу
      img.addEventListener('load', () => ph.remove());
      img.addEventListener('error', () => img.remove());
      img.src = m.photo;
      photo.appendChild(img);
      card.appendChild(photo);

      const text = document.createElement('p');
      text.className = 'tl-text';
      text.textContent = m.text;
      card.appendChild(text);

      if (m.last) {
        const btn = document.createElement('button');
        btn.className = 'btn-next';
        btn.type = 'button';
        btn.innerHTML = 'последний слой <span class="btn-arrow" aria-hidden="true">→</span>';
        btn.addEventListener('click', () => {
          Sound.sfx.click();
          goTo(5);
        });
        card.appendChild(btn);
      }

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
      activeCard = best;
      tlYear.textContent = yearLabel(MEMORIES[best].year);
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
    tlRaf = requestAnimationFrame(() => {
      tlRaf = null;
      updateTimeline();
    });
    swipeHint.classList.add('is-hidden');
  }, { passive: true });

  tlPrev.addEventListener('click', () => { Sound.sfx.click(); scrollToCard(activeCard - 1); });
  tlNext.addEventListener('click', () => { Sound.sfx.click(); scrollToCard(activeCard + 1); });

  function resetTimeline() {
    if (!cards.length) buildTimeline();
    swipeHint.classList.remove('is-hidden');
    activeCard = -1;
    requestAnimationFrame(() => {
      scrollToCard(0, false);
      updateTimeline();
    });
  }

  document.addEventListener('keydown', e => {
    if (current !== 4) return;
    if (e.key === 'ArrowRight') scrollToCard(activeCard + 1);
    if (e.key === 'ArrowLeft') scrollToCard(activeCard - 1);
  });

  /* ============================================================
     СЛОЙ 6: ФИНАЛ
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
    // финал уже открывали, сразу показываем кодовое слово
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
    await goTo(0);
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

  // звук можно включить только после первого касания, так работают браузеры
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

  // лёгкий дождик из сердечек на старте, чтобы сразу было празднично
  setTimeout(() => Confetti.rain(22, { sizeMin: 6, sizeMax: 13, maxLife: 340 }), 900);
})();
