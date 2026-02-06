Yeni bir feature branch oluştur: $ARGUMENTS

## Branch Naming Convention

```
<type>/<short-description>
```

### Type'lar

| Type | Kullanım |
|------|----------|
| `feature/` | Yeni özellik |
| `fix/` | Bug düzeltme |
| `hotfix/` | Acil production fix |
| `refactor/` | Refactoring |
| `docs/` | Dokümantasyon |
| `chore/` | Maintenance |

### Örnekler

```bash
feature/order-tracking
feature/bulk-product-import
fix/payment-status-update
hotfix/login-error
refactor/product-service
docs/api-documentation
chore/update-dependencies
```

## Branch Oluşturma

### 1. Ana Branch'ten Başla

```bash
# main/master'a geç
git checkout main

# Güncel çek
git pull origin main
```

### 2. Yeni Branch Oluştur

```bash
# Oluştur ve geç
git checkout -b feature/branch-name

# Veya ayrı ayrı
git branch feature/branch-name
git checkout feature/branch-name
```

### 3. Remote'a Push

```bash
# İlk push (upstream set)
git push -u origin feature/branch-name

# Sonraki push'lar
git push
```

## Branch Yönetimi

### Mevcut Branch'leri Listele

```bash
# Local
git branch

# Remote
git branch -r

# Tümü
git branch -a
```

### Branch Silme

```bash
# Local
git branch -d feature/branch-name

# Force delete (merge edilmemiş)
git branch -D feature/branch-name

# Remote
git push origin --delete feature/branch-name
```

### Branch Değiştirme

```bash
git checkout branch-name

# veya (Git 2.23+)
git switch branch-name
```

## Workflow

```
main
  │
  ├─▶ feature/order-tracking
  │     │
  │     ├─ commit 1
  │     ├─ commit 2
  │     └─ commit 3
  │           │
  │           ▼
  │     Pull Request
  │           │
  └───────────┘ (merge)
```

## Kontrol Listesi

- [ ] main branch güncel
- [ ] Branch adı convention'a uygun
- [ ] Branch açıklayıcı isimlendirilmiş
- [ ] Kısa ve öz (max 3-4 kelime)
- [ ] Kebab-case kullanıldı
