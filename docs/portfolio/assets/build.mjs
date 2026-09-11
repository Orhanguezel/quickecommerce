// Ortak HTML iskeleti + ikon kitapligi.
// Inline SVG'lere DAIMA width/height verilir; yoksa headless Chrome dev render eder.

export const ICON = {
  store: (s = 17) => `<svg class="ico" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9 4.5 4h15L21 9"/><path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9"/><path d="M9 20v-6h6v6"/></svg>`,
  box: (s = 17) => `<svg class="ico" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8v8a2 2 0 0 1-1 1.73l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 16V8a2 2 0 0 1 1-1.73l7-4a2 2 0 0 1 2 0l7 4A2 2 0 0 1 21 8Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
  cart: (s = 17) => `<svg class="ico" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2 2h2l2.7 12.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6L22 7H5"/></svg>`,
  tag: (s = 17) => `<svg class="ico" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2a2 2 0 0 1 1.4.6l6.7 6.7a2.4 2.4 0 0 1 0 3.4l-4.6 4.6a2.4 2.4 0 0 1-3.4 0l-6.7-6.7A2 2 0 0 1 6 9.2V3a1 1 0 0 1 1-1Z"/><circle cx="10.5" cy="6.5" r="1" fill="currentColor"/></svg>`,
  sync: (s = 17) => `<svg class="ico" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-7.9-4.7"/><path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 7.9 4.7"/><path d="M21 3v5h-5"/><path d="M3 21v-5h5"/></svg>`,
  chart: (s = 17) => `<svg class="ico" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 16v-5"/><path d="M12 16V7"/><path d="M17 16v-8"/></svg>`,
  users: (s = 17) => `<svg class="ico" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/></svg>`,
  card: (s = 17) => `<svg class="ico" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>`,
  truck: (s = 17) => `<svg class="ico" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><circle cx="7.5" cy="17.5" r="2.5"/><path d="M14 9h4l4 4v4h-2"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>`,
  shield: (s = 17) => `<svg class="ico" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>`,
  phone: (s = 17) => `<svg class="ico" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="3"/><path d="M11 19h2"/></svg>`,
  bolt: (s = 17) => `<svg class="ico" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a1 1 0 0 1-.8-1.6l9.9-10.2a.5.5 0 0 1 .9.5l-1.9 6a1 1 0 0 0 .9 1.3h7a1 1 0 0 1 .8 1.6l-9.9 10.2a.5.5 0 0 1-.9-.5l1.9-6A1 1 0 0 0 11 14Z"/></svg>`,
};

export function page({ title, css = '_base.css', body }) {
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8">
<title>${title}</title><link rel="stylesheet" href="${css}"></head><body>${body}</body></html>`;
}

/** Sol kenar cubugu — dort ekranda ayni, aktif ogesi degisir. */
export function sidebar(active) {
  const item = (key, label, icon) =>
    `<div class="nav-item${active === key ? ' on' : ''}">${icon}<span>${label}</span></div>`;
  return `<aside class="side">
  <div class="brand">
    <div class="brand-mark">${ICON.bolt(22)}</div>
    <div><div class="brand-name">QuickEcommerce</div><div class="brand-sub">sportoonline.com</div></div>
  </div>
  <nav class="nav">
    <div class="nav-label">MAĞAZA</div>
    ${item('catalog', 'Katalog', ICON.box())}
    ${item('orders', 'Siparişler', ICON.cart())}
    ${item('stores', 'Satıcılar', ICON.store())}
    ${item('campaigns', 'Kampanya ve kupon', ICON.tag())}
    <div class="nav-label">OTOMASYON</div>
    ${item('sync', 'Fiyat ve stok eşitleme', ICON.sync())}
    ${item('refund', 'Otomatik iade', ICON.shield())}
    <div class="nav-label">RAPOR</div>
    ${item('reports', 'Satış raporları', ICON.chart())}
    ${item('customers', 'Müşteriler', ICON.users())}
  </nav>
  <div class="side-foot">Laravel 12 · Next.js 16 · Flutter<br>MySQL · iyzico pazaryeri</div>
</aside>`;
}

export function topbar({ title, sub, pills = [] }) {
  return `<div class="top">
  <div><div class="h-title">${title}</div><div class="h-sub">${sub}</div></div>
  <div class="spacer"></div>
  ${pills.join('\n  ')}
</div>`;
}

export const pill = (text, kind = '') =>
  `<span class="pill ${kind}"><span class="dot"></span>${text}</span>`;

export const kpi = (k, v, d, cls = '') =>
  `<div class="kpi"><div class="kpi-k">${k}</div><div class="kpi-v">${v}</div><div class="kpi-d ${cls}">${d}</div></div>`;

export const card = (t, s, bodyHtml, extraHead = '') =>
  `<div class="card"><div class="card-h"><div><div class="card-t">${t}</div>${s ? `<div class="card-s">${s}</div>` : ''}</div><div class="spacer"></div>${extraHead}</div><div class="card-b">${bodyHtml}</div></div>`;

export const tl = (n) => new Intl.NumberFormat('tr-TR').format(n) + ' ₺';
