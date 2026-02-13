# Dark Mode & i18n Düzeltme Listesi

## ✅ Tamamlanan

- [x] Product Card (`product-card.tsx`)
- [x] Filter Sidebar (`filter-sidebar.tsx`)
- [x] Header Variant 1 (`header-variant-1.tsx`)
- [x] Featured çevirisi (`tr.json`, `en.json`)

## 🔄 Yapılacak Bileşenler

### Layout Bileşenleri

- [ ] Header Variant 2 (`header-variant-2.tsx`)
- [ ] Footer (`footer.tsx`)
- [ ] Mobile Nav (`mobile-nav.tsx`)
- [ ] Floating Cart (`floating-cart.tsx`)

### Home Bileşenleri

- [ ] Newsletter Section (`newsletter-section.tsx`)
- [ ] Top Stores Section (`top-stores-section.tsx`)
- [ ] Flash Sale Section (`flash-sale-section.tsx`)

### Chat

- [ ] Chat Widget (`chat-widget.tsx`)

### Diğer

- [ ] Maintenance Page (`maintenance-page.tsx`)
- [ ] UI Components (`ui/switch.tsx`)

## 🎯 Değiştirilecek Renkler

### Hardcoded → Semantic

- `bg-white` → `bg-card` veya `bg-background`
- `bg-gray-50` → `bg-muted`
- `bg-gray-100` → `bg-muted`
- `text-gray-900` → `text-foreground`
- `text-gray-700` → `text-foreground`
- `text-gray-600` → `text-muted-foreground`
- `text-gray-500` → `text-muted-foreground`
- `text-gray-400` → `text-muted-foreground`
- `border-gray-200` → `border`
- `border-gray-300` → `border`

## 📝 Notlar

- Her bileşende `bg-white` yerine `bg-card` kullan
- Transparent/overlay renkler olduğu gibi kalabilir (`bg-white/10`, `bg-white/20`)
- Özel tasarım gerektiren yerler (gradients, shadows) dikkatli değiştirilmeli
