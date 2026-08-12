/* ============================================================
   КОНФЕТТИ
   Частицы на canvas: сердечки, кружочки, ленточки, звёздочки.
   Confetti.burst()      взрыв из точки
   Confetti.rain()       дождь сверху
   Confetti.fireworks()  финальный салют
   ============================================================ */

const Confetti = (function () {
  const cvs = document.getElementById('confetti');
  const ctx = cvs.getContext('2d');
  let W = 0, H = 0, dpr = 1;
  let parts = [];
  let raf = null;

  const COLORS = [
    '#ff6b95', '#ff3d68', '#e01e46', '#ffa8c5',
    '#ffd6e4', '#ffffff', '#ffd68a', '#ff8fab',
    '#c9184a', '#ffc2d9'
  ];
  const SHAPES = ['heart', 'rect', 'circle', 'heart', 'rect', 'star'];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    cvs.width = W * dpr;
    cvs.height = H * dpr;
    cvs.style.width = W + 'px';
    cvs.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }

  function makeParticle(x, y, o) {
    const angle = o.angle != null ? o.angle : rnd(0, Math.PI * 2);
    const speed = rnd(o.speedMin, o.speedMax);
    return {
      x, y,
      vx: Math.cos(angle) * speed * rnd(0.7, 1.3),
      vy: Math.sin(angle) * speed * rnd(0.7, 1.3) - (o.lift || 0),
      g: o.gravity != null ? o.gravity : rnd(0.16, 0.3),
      drag: rnd(0.982, 0.994),
      size: rnd(o.sizeMin || 6, o.sizeMax || 14),
      color: o.color || pick(COLORS),
      shape: o.shape || pick(SHAPES),
      rot: rnd(0, Math.PI * 2),
      vr: rnd(-0.22, 0.22),
      // имитация переворота ленточки в объёме
      flip: rnd(0, Math.PI * 2),
      vf: rnd(0.06, 0.2),
      life: 0,
      maxLife: o.maxLife || rnd(120, 220),
      wob: rnd(0, 6.28),
      wobSpeed: rnd(0.02, 0.06),
      wobAmp: rnd(0.2, 1.1)
    };
  }

  function drawHeart(c, s) {
    c.beginPath();
    const k = s / 16;
    c.moveTo(0, 4 * k);
    c.bezierCurveTo(0, 1 * k, -3 * k, -3 * k, -7 * k, -3 * k);
    c.bezierCurveTo(-13 * k, -3 * k, -13 * k, 5 * k, -13 * k, 5 * k);
    c.bezierCurveTo(-13 * k, 9 * k, -9 * k, 13.5 * k, 0, 18 * k);
    c.bezierCurveTo(9 * k, 13.5 * k, 13 * k, 9 * k, 13 * k, 5 * k);
    c.bezierCurveTo(13 * k, 5 * k, 13 * k, -3 * k, 7 * k, -3 * k);
    c.bezierCurveTo(3 * k, -3 * k, 0, 1 * k, 0, 4 * k);
    c.closePath();
    c.fill();
  }

  function drawStar(c, s) {
    const spikes = 5, outer = s * 0.6, inner = s * 0.26;
    c.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = (Math.PI / spikes) * i - Math.PI / 2;
      c[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * r, Math.sin(a) * r);
    }
    c.closePath();
    c.fill();
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);

    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life++;
      p.wob += p.wobSpeed;
      p.vx += Math.sin(p.wob) * p.wobAmp * 0.06;
      p.vy += p.g;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.flip += p.vf;

      if (p.life > p.maxLife || p.y > H + 60) { parts.splice(i, 1); continue; }

      const fade = p.life > p.maxLife - 40 ? (p.maxLife - p.life) / 40 : 1;
      ctx.save();
      ctx.globalAlpha = Math.max(0, fade);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        const sc = Math.abs(Math.cos(p.flip));
        ctx.scale(1, Math.max(0.12, sc));
        ctx.fillRect(-p.size * 0.35, -p.size * 0.7, p.size * 0.7, p.size * 1.4);
      } else if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.42, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'star') {
        drawStar(ctx, p.size);
      } else {
        ctx.scale(Math.max(0.2, Math.abs(Math.cos(p.flip))), 1);
        drawHeart(ctx, p.size);
      }
      ctx.restore();
    }

    if (parts.length) {
      raf = requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, W, H);
      raf = null;
    }
  }

  function run() { if (!raf) raf = requestAnimationFrame(frame); }

  function cap() {
    // на телефоне не даём разрастись, чтобы не лагало
    const max = window.innerWidth < 700 ? 420 : 900;
    if (parts.length > max) parts.splice(0, parts.length - max);
  }

  return {
    burst(x, y, count, opts) {
      const o = Object.assign({ speedMin: 4, speedMax: 15, lift: 3 }, opts || {});
      const n = count || 60;
      for (let i = 0; i < n; i++) parts.push(makeParticle(x, y, o));
      cap();
      run();
    },

    // взрыв из центра элемента
    burstFrom(el, count, opts) {
      const r = el.getBoundingClientRect();
      this.burst(r.left + r.width / 2, r.top + r.height / 2, count, opts);
    },

    rain(count, opts) {
      const n = count || 80;
      const o = Object.assign({ speedMin: 1, speedMax: 3, gravity: 0.14, angle: Math.PI / 2, lift: 0, maxLife: 400 }, opts || {});
      for (let i = 0; i < n; i++) {
        const p = makeParticle(rnd(0, W), rnd(-H * 0.6, -20), o);
        parts.push(p);
      }
      cap();
      run();
    },

    sideCannons(count) {
      const n = count || 70;
      for (let i = 0; i < n; i++) {
        parts.push(makeParticle(-10, rnd(H * 0.45, H * 0.85), { angle: rnd(-1.1, -0.35), speedMin: 12, speedMax: 24, gravity: 0.28 }));
        parts.push(makeParticle(W + 10, rnd(H * 0.45, H * 0.85), { angle: Math.PI + rnd(0.35, 1.1), speedMin: 12, speedMax: 24, gravity: 0.28 }));
      }
      cap();
      run();
    },

    fireworks(rounds) {
      const total = rounds || 5;
      for (let i = 0; i < total; i++) {
        setTimeout(() => {
          const x = rnd(W * 0.15, W * 0.85);
          const y = rnd(H * 0.15, H * 0.5);
          const color = pick(COLORS);
          for (let k = 0; k < 46; k++) {
            const a = (Math.PI * 2 * k) / 46 + rnd(-0.05, 0.05);
            parts.push(makeParticle(x, y, {
              angle: a, speedMin: 5, speedMax: 11,
              gravity: 0.12, sizeMin: 5, sizeMax: 11,
              color: Math.random() < 0.25 ? '#ffffff' : color
            }));
          }
          cap();
          run();
        }, i * 320);
      }
    },

    clear() { parts.length = 0; }
  };
})();
