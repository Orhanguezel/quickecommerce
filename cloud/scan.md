Kod tabanında proje prensiplerine aykırı durumları tara: $ARGUMENTS

## Taranacak Alanlar

### 1. Backend (Laravel) Kontrolleri

#### Controller Kontrolleri
```bash
# Fat controller kontrolü (100+ satır)
find app/Http/Controllers -name "*.php" -exec wc -l {} \; | sort -rn | head -20

# Direct DB query in controller (should use repository)
grep -rn "DB::" app/Http/Controllers/

# Missing validation
grep -rn "public function store" app/Http/Controllers/ -A5 | grep -v "Request"
```

#### Security Kontrolleri
```bash
# Unprotected admin routes
grep -rn "Route::" routes/admin-api.php | grep -v "middleware"

# Raw SQL queries (SQL injection risk)
grep -rn "DB::raw" app/

# Exposed sensitive fields
grep -rn "protected \$hidden" app/Models/
```

#### Performance Kontrolleri
```bash
# N+1 query potential (eager loading missing)
grep -rn "->get()" app/Http/Controllers/ -B5 | grep -v "with("

# Missing pagination
grep -rn "->all()" app/Http/Controllers/
```

### 2. Admin Panel (Next.js) Kontrolleri

#### TypeScript/ESLint
```bash
cd admin-panel

# TypeScript errors
npx tsc --noEmit

# ESLint check
npm run lint

# Unused dependencies
npx depcheck
```

#### Code Quality
```bash
# Large component files (300+ lines)
find src -name "*.tsx" -exec wc -l {} \; | sort -rn | head -20

# Console.log statements
grep -rn "console.log" src/

# Hardcoded strings (should use i18n)
grep -rn "\"[A-Z][a-z]" src/app/ --include="*.tsx" | head -20

# Direct API calls (should use actions)
grep -rn "axios\." src/app/ --include="*.tsx"
```

#### Missing Types
```bash
# any type usage
grep -rn ": any" src/ --include="*.ts" --include="*.tsx"

# Type assertions
grep -rn "as any" src/
```

### 3. Ortak Kontroller

#### Duplicate Code
```bash
# Similar function names across files
grep -rn "const get.*List" admin-panel/src/modules/

# Repeated patterns
grep -rn "try {" admin-panel/src/ | wc -l
```

#### Environment Variables
```bash
# Hardcoded URLs
grep -rn "localhost" admin-panel/src/ backend-laravel/

# Exposed secrets
grep -rn "password\|secret\|key" .env*
```

## Tarama Çıktı Formatı

```markdown
## Tarama Raporu: [Kapsam]

### Kritik Sorunlar (Hemen düzeltilmeli)
| Dosya | Satır | Sorun | Öneri |
|-------|-------|-------|-------|
| ... | ... | ... | ... |

### Uyarılar (Düzeltilmesi önerilir)
| Dosya | Satır | Sorun | Öneri |
|-------|-------|-------|-------|
| ... | ... | ... | ... |

### Bilgi (İyileştirme fırsatları)
| Dosya | Satır | Açıklama |
|-------|-------|----------|
| ... | ... | ... |

### İstatistikler
- Taranan dosya sayısı: X
- Kritik sorun: X
- Uyarı: X
- Bilgi: X
```

## Otomatik Düzeltme Önerileri

### ESLint Auto-fix
```bash
cd admin-panel
npm run lint -- --fix
```

### Laravel Pint (Code Style)
```bash
cd backend-laravel
./vendor/bin/pint
```

## Kontrol Listesi

- [ ] Fat controllers identified
- [ ] Security vulnerabilities checked
- [ ] Performance issues found
- [ ] TypeScript errors resolved
- [ ] ESLint warnings fixed
- [ ] Unused code removed
- [ ] Hardcoded values extracted
- [ ] Missing types added
