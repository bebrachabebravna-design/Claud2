/* ============================================================
   СБОРЩИК ОДНОГО ФАЙЛА

   Запуск:  node build.js

   Берёт index.html, css, js, шрифты и (если есть) фотографии
   из папки photos, и запаковывает всё в один файл dist/index.html.
   Этот файл самодостаточный: его можно просто закинуть на хостинг
   или открыть двойным кликом, интернет ему не нужен.
   ============================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');

function b64(file) {
  return fs.readFileSync(path.join(ROOT, file)).toString('base64');
}

/* ---------- шрифты внутрь css ---------- */
let fontsCss = read('css/fonts.css');
fontsCss = fontsCss.replace(/url\('\.\.\/fonts\/([^']+)'\)/g, (m, name) => {
  const data = b64(path.join('fonts', name));
  return `url('data:font/woff2;base64,${data}')`;
});

const stylesCss = read('css/styles.css');

/* ---------- фотографии внутрь js ---------- */
const photosDir = path.join(ROOT, 'photos');
const photoMap = {};
if (fs.existsSync(photosDir)) {
  for (const file of fs.readdirSync(photosDir)) {
    const m = file.match(/^(\d+)\.(jpe?g|png|webp|gif)$/i);
    if (!m) continue;
    const ext = m[2].toLowerCase();
    const mime = ext === 'png' ? 'image/png'
      : ext === 'webp' ? 'image/webp'
      : ext === 'gif' ? 'image/gif' : 'image/jpeg';
    photoMap[m[1]] = `data:${mime};base64,${b64(path.join('photos', file))}`;
  }
}

let contentJs = read('js/content.js');
const embedded = Object.keys(photoMap);
if (embedded.length) {
  // подменяем пути на сами картинки
  contentJs = contentJs.replace(/photo:\s*'photos\/(\d+)\.\w+'/g, (m, year) =>
    photoMap[year] ? `photo: '${photoMap[year]}'` : m);
}

const js = [contentJs, read('js/audio.js'), read('js/confetti.js'), read('js/app.js')].join('\n\n');

/* ---------- собираем html ---------- */
let html = read('index.html');

// ВАЖНО: замену передаём функцией, а не строкой.
// В строке замены последовательности вида $$ и $& имеют особый смысл,
// и код с $$ (сокращение для querySelectorAll) молча ломается.
html = html
  .replace(/\n?\s*<link rel="preload"[^>]*>/g, '')
  .replace('<link rel="stylesheet" href="css/fonts.css">', () => `<style>\n${fontsCss}\n</style>`)
  .replace('<link rel="stylesheet" href="css/styles.css">', () => `<style>\n${stylesCss}\n</style>`)
  .replace(/\s*<script src="js\/(audio|confetti|content)\.js"><\/script>/g, '')
  .replace('<script src="js/app.js"></script>', () => `<script>\n${js}\n</script>`);

fs.mkdirSync(DIST, { recursive: true });
fs.writeFileSync(path.join(DIST, 'index.html'), html);

const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
console.log(`dist/index.html готов, ${kb} КБ`);
console.log(embedded.length
  ? `фотографий вшито: ${embedded.length} (${embedded.sort((a, b) => a - b).join(', ')})`
  : 'фотографий пока нет, карточки покажут заглушки');
