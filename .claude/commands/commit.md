Git değişikliklerini incele ve commit oluştur.

## Conventional Commit Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Type'lar

| Type | Açıklama |
|------|----------|
| `feat` | Yeni özellik |
| `fix` | Bug düzeltme |
| `docs` | Dokümantasyon |
| `style` | Kod formatı (logic değişmez) |
| `refactor` | Refactoring |
| `perf` | Performans iyileştirme |
| `test` | Test ekleme/düzeltme |
| `chore` | Build, config değişiklikleri |

### Scope Örnekleri

- `admin`: Admin panel
- `api`: Backend API
- `auth`: Authentication
- `product`: Product modülü
- `order`: Order modülü
- `ui`: UI components

### Commit Mesajı Örnekleri

```bash
# Feature
feat(product): add bulk import functionality

# Bug fix
fix(order): resolve payment status not updating

# Refactoring
refactor(api): extract order service from controller

# Performance
perf(product): add index for category_id column

# Documentation
docs(readme): update installation instructions

# Chore
chore(deps): update laravel to v12.1
```

## Commit Workflow

### 1. Değişiklikleri Kontrol Et

```bash
# Status
git status

# Diff
git diff

# Staged diff
git diff --staged
```

### 2. Seçici Staging

```bash
# Tek dosya
git add path/to/file.php

# Pattern
git add "*.php"

# Interactive
git add -p
```

### 3. Commit

```bash
git commit -m "feat(scope): description"
```

### Multi-line Commit

```bash
git commit -m "feat(order): add order tracking system

- Add tracking number field to orders
- Create tracking status endpoint
- Update order detail page

Closes #123"
```

## Kontrol Listesi

Commit öncesi kontrol et:

- [ ] Sadece ilgili dosyalar staged
- [ ] Sensitive bilgi yok (.env, credentials)
- [ ] Build başarılı
- [ ] Testler geçiyor
- [ ] Commit mesajı açıklayıcı
- [ ] Type doğru seçildi
- [ ] Scope belirtildi

## Örnek Workflow

```bash
# 1. Değişiklikleri gör
git status
git diff

# 2. İlgili dosyaları stage et
git add app/Http/Controllers/Api/Admin/ProductController.php
git add app/Services/ProductService.php
git add tests/Feature/ProductTest.php

# 3. Commit
git commit -m "refactor(product): extract business logic to service

- Move product creation logic to ProductService
- Add unit tests for service methods
- Update controller to use service"

# 4. Push (gerekirse)
git push origin feature/product-service
```
