/* ====================================================================
   Нейродокс — юридический слой сайта
   1) стили ссылок на документы в подвале;
   2) уведомление об использовании cookie (152-ФЗ, ст. 18.1 + практика РКН).
   Файл подключается на всех страницах одной строкой:
     <script src="/assets/legal.js" defer></script>
   ==================================================================== */
(function () {
  'use strict';

  var STORE_KEY = 'nrd_cookie_ok_v1';

  // ---------- стили ----------
  var css = ''
    + '.nrd-legal-links{display:flex;flex-wrap:wrap;gap:8px 18px;align-items:center}'
    + '.nrd-legal-links a{color:#8894b0;text-decoration:none;border-bottom:1px solid rgba(255,255,255,.14);transition:color .2s,border-color .2s}'
    + '.nrd-legal-links a:hover{color:#fff;border-bottom-color:rgba(255,255,255,.5)}'
    + '@media(max-width:760px){.nrd-legal-links{flex-direction:column;align-items:flex-start;gap:10px}}'

    + '.nrd-cookie{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:400px;'
    +   'background:#0F1732;color:#C4CFE6;border:1px solid rgba(255,255,255,.12);border-radius:14px;'
    +   'padding:14px 16px;box-shadow:0 20px 44px -18px rgba(0,0,0,.6);'
    +   'font:400 .78rem/1.5 Inter,-apple-system,system-ui,sans-serif;'
    +   'opacity:0;transform:translateY(14px);transition:opacity .3s ease,transform .3s cubic-bezier(.16,1,.3,1)}'
    + '.nrd-cookie.is-in{opacity:1;transform:none}'
    + '.nrd-cookie b{display:block;color:#fff;font:700 .86rem/1.3 Manrope,system-ui,sans-serif;margin-bottom:5px}'
    + '.nrd-cookie p{margin:0 0 12px}'
    + '.nrd-cookie a{color:#7FA8FF;text-decoration:underline}'
    + '.nrd-cookie-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}'
    + '.nrd-cookie button{border:none;cursor:pointer;font:600 .8rem/1 Manrope,system-ui,sans-serif;'
    +   'padding:9px 16px;border-radius:99px;transition:transform .2s,filter .2s}'
    + '.nrd-cookie button:hover{transform:translateY(-1px);filter:brightness(1.08)}'
    + '.nrd-cookie .ok{background:linear-gradient(135deg,#1D5DE3,#5B8AFF);color:#fff}'
    + '.nrd-cookie .no{background:transparent;color:#9AA6C4;border:1px solid rgba(255,255,255,.2)}'
    + '@media(max-width:480px){.nrd-cookie{left:10px;right:10px;bottom:10px;padding:13px 15px}'
    +   '.nrd-cookie button{flex:1 1 auto}}'

    + '.nrd-consent{display:flex;align-items:flex-start;gap:10px;margin:2px 0 0;'
    +   'font:400 .84rem/1.5 Inter,-apple-system,system-ui,sans-serif;cursor:pointer;-webkit-tap-highlight-color:transparent}'
    // атрибутный селектор нужен, чтобы перебить общие правила вида «.cta-form input»
    + '.nrd-consent input[type=checkbox]{appearance:none;-webkit-appearance:none;flex:0 0 auto;'
    +   'width:19px;height:19px;min-width:19px;margin:1px 0 0;padding:0;box-sizing:border-box;'
    +   'border:1.5px solid rgba(255,255,255,.45);border-radius:6px;background:rgba(255,255,255,.08);cursor:pointer;'
    +   'transition:background .18s,border-color .18s;position:relative}'
    + '.nrd-consent input[type=checkbox]:checked{background:#4D7AFF;border-color:#4D7AFF}'
    + '.nrd-consent input[type=checkbox]:checked::after{content:"";position:absolute;left:6px;top:2px;width:4px;height:9px;'
    +   'border:solid #fff;border-width:0 2px 2px 0;transform:rotate(42deg)}'
    + '.nrd-consent input[type=checkbox]:focus-visible{outline:2px solid #fff;outline-offset:2px}'
    + '.nrd-consent.is-bad input[type=checkbox]{border-color:#FF8A8D;background:rgba(255,138,141,.14)}'
    + '.nrd-consent span{color:rgba(255,255,255,.72)}'
    + '.nrd-consent a{color:rgba(255,255,255,.95);text-decoration:underline}'
    + '.nrd-consent--light span{color:var(--t-mute,#6B7896)}'
    + '.nrd-consent--light input[type=checkbox]{border-color:rgba(10,20,40,.3);background:rgba(10,20,40,.04)}'
    + '.nrd-consent--light a{color:var(--acc,#1D5DE3)}';

  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  // ---------- уведомление о cookie ----------
  function alreadyAnswered() {
    try { return !!localStorage.getItem(STORE_KEY); } catch (e) { return false; }
  }
  function remember(value) {
    try { localStorage.setItem(STORE_KEY, value + '|' + new Date().toISOString()); } catch (e) {}
  }

  function showCookieBar() {
    if (alreadyAnswered()) return;
    // на самих юридических страницах баннер не мешаем читать
    if (/^\/(privacy|consent|terms)\//.test(location.pathname)) return;

    var bar = document.createElement('div');
    bar.className = 'nrd-cookie';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Уведомление об использовании cookie');
    bar.innerHTML =
      '<b>Файлы cookie</b>' +
      '<p>Сайт использует cookie и Яндекс Метрику, чтобы работать лучше. Данные обезличены. ' +
      'Подробнее — в <a href="/privacy/">политике</a>.</p>' +
      '<div class="nrd-cookie-row">' +
        '<button type="button" class="ok">Принять</button>' +
        '<button type="button" class="no">Только нужные</button>' +
      '</div>';
    document.body.appendChild(bar);
    requestAnimationFrame(function () { bar.classList.add('is-in'); });

    function close(answer) {
      remember(answer);
      bar.classList.remove('is-in');
      setTimeout(function () { if (bar.parentNode) bar.parentNode.removeChild(bar); }, 400);
    }
    bar.querySelector('.ok').addEventListener('click', function () { close('all'); });
    bar.querySelector('.no').addEventListener('click', function () { close('necessary'); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showCookieBar);
  } else {
    showCookieBar();
  }
})();
