Tüm değişiklikleri hızlıca commit ve push et.

## Quick Push Workflow

### 1. Değişiklikleri Kontrol Et

```bash
git status
git diff --stat
```

### 2. Stage Et

```bash
# Tüm değişiklikleri
git add -A

# Veya belirli dosyaları
git add path/to/files
```

### 3. Commit

```bash
git commit -m "feat(scope): description"
```

### 4. Push

```bash
# Current branch
git push

# Yeni branch için upstream set
git push -u origin branch-name
```

## Tek Satırda

```bash
git add -A && git commit -m "feat(scope): description" && git push
```

## Pre-push Kontrolleri

### Laravel Backend
```bash
cd backend-laravel

# Code style
./vendor/bin/pint --test

# Tests
php artisan test
```

### Admin Panel
```bash
cd admin-panel

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build
npm run build
```

## Kontrol Listesi

- [ ] Değişiklikler review edildi
- [ ] Sensitive bilgi yok
- [ ] Build başarılı
- [ ] Testler geçiyor
- [ ] Commit mesajı açıklayıcı
- [ ] Doğru branch'e push ediliyor

## Dikkat

- main/master branch'e direkt push etme
- Force push kullanmaktan kaçın
- Büyük dosyalar (.zip, media) commit etme
- .env dosyalarını commit etme
