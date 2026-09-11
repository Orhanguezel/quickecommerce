// playwright-core standartta market_pulse/frontend altinda gosteriliyor ama o
// projede node_modules kurulu degil; kurulu bir kopyadan ilk bulunani kullan.
import { existsSync } from 'node:fs';
const CANDIDATES = [
  '/home/orhan/Documents/Projeler/market_pulse/frontend/node_modules/playwright-core/index.js',
  '/home/orhan/Documents/Projeler/ekosistem-sosyal-medya/node_modules/playwright-core/index.js',
  '/home/orhan/Documents/Projeler/ihracatradari.com.tr/node_modules/playwright-core/index.js',
  '/home/orhan/Documents/Projeler/keslerplastic/node_modules/playwright-core/index.js',
];
const found = CANDIDATES.find(existsSync);
if (!found) throw new Error('playwright-core bulunamadi: ' + CANDIDATES.join(', '));
const pkg = (await import(found)).default;
const { chromium } = pkg;
const file = process.argv[2], out = process.argv[3];
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 });
await page.goto('file://' + file);
await page.waitForTimeout(400);
await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1600, height: 1000 } });
await browser.close();
console.log('saved', out);
