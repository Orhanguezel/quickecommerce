Pull Request oluştur.

## PR Template

```markdown
## Summary
[1-3 cümle ile değişikliğin özeti]

## Changes
- [Değişiklik 1]
- [Değişiklik 2]
- [Değişiklik 3]

## Type of Change
- [ ] Feature (yeni özellik)
- [ ] Bug fix (hata düzeltme)
- [ ] Refactor (davranış değişmez)
- [ ] Documentation
- [ ] Chore (maintenance)

## Testing
- [ ] Unit tests eklendi/güncellendi
- [ ] Manual test yapıldı
- [ ] Build başarılı

## Screenshots (UI değişiklikleri için)
[Ekran görüntüleri]

## Checklist
- [ ] Kod self-review yapıldı
- [ ] Yorum eklendi (gerekli yerlere)
- [ ] Değişiklikler documented
- [ ] Breaking change yok (veya belirtildi)
```

## PR Oluşturma

### GitHub CLI ile

```bash
# Basit PR
gh pr create --title "feat: add order tracking" --body "Description"

# Template ile
gh pr create --title "feat: add order tracking" --body "$(cat <<'EOF'
## Summary
Add order tracking functionality

## Changes
- Add tracking number field
- Create tracking endpoint
- Update order detail page

## Testing
- [x] Manual test yapıldı
- [x] Build başarılı
EOF
)"

# Draft PR
gh pr create --draft --title "WIP: order tracking"

# Reviewer ekle
gh pr create --reviewer username1,username2
```

### PR Workflow

```bash
# 1. Değişiklikleri push et
git push -u origin feature/branch-name

# 2. PR oluştur
gh pr create

# 3. PR durumunu kontrol et
gh pr status

# 4. PR görüntüle
gh pr view

# 5. PR merge et (onaylandıktan sonra)
gh pr merge --squash --delete-branch
```

## PR Boyutu

| Boyut | Satır | Önerilen |
|-------|-------|----------|
| XS | < 50 | En iyi |
| S | 50-200 | İyi |
| M | 200-500 | Kabul edilebilir |
| L | 500-1000 | Bölmeyi düşün |
| XL | > 1000 | Mutlaka böl |

## İyi PR Pratikleri

### Do's
- Küçük, focused PR'lar
- Açıklayıcı title ve description
- Self-review yap
- Test ekle
- Screenshots ekle (UI için)

### Don'ts
- Birden fazla feature bir PR'da
- Unrelated değişiklikler
- Büyük refactoring + feature
- WIP commit'ler (squash et)
- Conflict'li PR

## PR Review Checklist

### Code Quality
- [ ] Kod okunabilir
- [ ] Naming convention'lara uygun
- [ ] DRY prensibine uygun
- [ ] Error handling mevcut

### Security
- [ ] Input validation var
- [ ] Authentication/authorization kontrol edildi
- [ ] Sensitive data exposed değil

### Performance
- [ ] N+1 query yok
- [ ] Gereksiz computation yok
- [ ] Caching düşünüldü

### Testing
- [ ] Test coverage yeterli
- [ ] Edge case'ler covered
- [ ] Testler anlamlı
