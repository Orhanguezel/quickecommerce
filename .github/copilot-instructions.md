# AI Coding Agent Instructions

## Quick Start
This is a **monorepo** with three apps: Next.js admin panel, Laravel backend, and Flutter mobile/web client. **Always minimize diffs and avoid regressions.**

## Architecture Overview

### Monorepo Structure
```
quickecommerce/
├── admin-panel/          # Next.js 16 (TypeScript strict, App Router, Turbopack)
├── backend-laravel/      # Laravel 12 (PHP 8.2, modular via nwidart/laravel-modules)
└── customer-app-and-web-flutter/  # Flutter (Dart, shared mobile+web codebase)
```

### Data Flow
- **Admin Panel** → REST API at `NEXT_PUBLIC_REST_API_ENDPOINT` → Laravel backend
- **Flutter App** → Same REST API
- **Authentication:** Laravel Sanctum; tokens via `/api/auth` prefix routes
- **i18n:** Next.js with `next-intl`; Flutter with `intl` package; Messages in `/public/locales/{locale}.json`

### Key Integration Points
- **API client:** Next.js uses `axios` for HTTP; Flutter uses `dio`
- **State Management:** Next.js uses Redux Toolkit + React Query; Flutter uses Provider + BLoC
- **Firebase:** Integrated for messaging (admin-panel has `firebase-messaging-sw.js`)
- **Payment:** Stripe integration in Laravel backend

## Frontend (Admin Panel) Conventions

### TypeScript & Build
- **Strict mode enabled** (`"strict": true` in `tsconfig.json`)
- **Path alias:** `@/*` maps to `src/*`
- Build command: `npm run build` chains `next build` → `postbuild.js` → `fix-deploy-static.js`
- Dev command: `npm run dev --turbopack` (uses Turbopack bundler)
- **ESLint:** Via Next.js lint rules; violations block builds
- **Target:** ES2017, React 18

### Routing & Localization
- **Auth routes:** `/login`, `/registration`, `/forgot-password`, `/reset-password`, `/verify-email`, `/change-password`
- **Private routes:** `/dashboard` and derivatives; redirect unauthenticated users to `/settings`
- **Public routes:** `/`, `/auth/verification`
- **Route config file:** [src/routes.ts](src/routes.ts) (use as source of truth)
- **Middleware:** `src/proxy.ts` handles `next-intl` locale routing; applies to all paths except `_next` and static files

### Component Architecture
- **Structure:** `src/components/{blocks,layout,molecules,screen,ui,utils}`
- **UI kit:** Radix UI primitives with custom Tailwind styling
- **DnD:** `@dnd-kit` for drag-and-drop (accordion, sortable lists)
- **Rich text:** TipTap editor with extensions (color, image, link, table, text-align)
- **Forms:** `@hookform/resolvers` + Zod validation
- **Google Maps:** `@react-google-maps/api`

### Critical Files
- [src/env.mjs](src/env.mjs) — Zod schema validation for env vars; **DO NOT bypass SKIP_ENV_VALIDATION**
- [src/lib/](src/lib/) — Utilities: Firebase config, auth helpers, image loader, constants
- [src/modules/](src/modules/) — Feature modules (admin-section, seller-section, users, etc.)
- [src/redux/](src/redux/) — Redux slices; use Redux Toolkit syntax
- [src/i18n.tsx](src/i18n.tsx) — i18n server config; locale auto-detection from path

### Code Quality Standards
- **Avoid:** JSX in `.ts` files (use `.tsx` always)
- **Imports:** Use path aliases (`@/...`) instead of relative imports for cross-module imports
- **Unused imports:** Must be removed (linting requirement)
- **Naming:** Exact match imports (avoid wildcards `import *`)

## Backend (Laravel) Conventions

### Structure & Patterns
- **Modular:** Uses `nwidart/laravel-modules` (namespace: `App\Modules\*`)
- **Architecture:** Service + Repository pattern
  - Models in `app/Models/`
  - Business logic in `app/Services/`
  - Data access in `app/Repositories/` (via `prettus/l5-repository`)
  - HTTP logic in `app/Http/Controllers/`
- **Traits:** Reusable mixins in `app/Traits/` (e.g., for permissions, timestamps)
- **Observers:** In `app/Observers/` for Eloquent lifecycle hooks

### Key Packages
- **Auth:** `laravel/sanctum` for token-based API auth
- **Permissions:** `spatie/laravel-permission` (roles, gates)
- **Queries:** `spatie/laravel-query-builder` for flexible filtering/sorting
- **Media:** `spatie/laravel-medialibrary` for file uploads
- **Payments:** Stripe (`stripe/stripe-php`), PayTM checkout
- **Geo:** `laravel-eloquent-spatial` for spatial queries
- **Async:** Queues with `pusher/pusher-php-server` for real-time updates
- **SMS/Voice:** Twilio (`twilio/sdk`) + Vonage (`vonage/client`)
- **Data:** Excel import/export via `maatwebsite/excel`

### API Contracts
- **Auth prefix:** `/api/auth/*` routes (Sanctum tokens)
- **Response format:** JSON; error responses include status + message
- **Rate limiting:** Check `config/middleware.php`
- **CORS:** Configured in `config/cors.php`

## Flutter App Conventions

### Tooling
- **SDK:** Dart 3.5.4+
- **Architecture:** BLoC + Provider pattern
- **Routing:** `go_router` for declarative navigation
- **State:** `flutter_bloc` + `provider` (no Redux equivalent)
- **HTTP:** `dio` package; configure base URL from Laravel API endpoint
- **Localization:** `intl` + `flutter_localizations`
- **Responsive UI:** `flutter_screenutil` for adaptive layouts

### Key Packages
- **Auth:** Facebook (`flutter_facebook_auth`), Google (`google_sign_in`), custom token storage in `shared_preferences`
- **Networking:** `connectivity_plus` to detect offline; `dio` for HTTP
- **Equatable:** For value comparison in models/BLoCs

## Development Workflow

### Build & Deployment
1. **Admin Panel:**
   - Dev: `npm run dev --turbopack`
   - Build: `npm run build` (includes static file deployment fixups)
   - Start: `npm start`
2. **Laravel:**
   - Migrations auto-run in deployment
   - Use `artisan` CLI for schema changes
3. **Flutter:**
   - Web: `flutter run -d web`
   - Android: Requires signing config in `android/`
   - iOS: Requires provisioning profiles

### Code Review Checklist
- ✅ TypeScript strict mode compliance (admin-panel)
- ✅ No unused imports or exports
- ✅ Minimal diff (refactor in separate PRs from feature work)
- ✅ No breaking API changes (add endpoints, don't modify existing contracts)
- ✅ i18n keys added to all locale files (en.json, tr.json)
- ✅ Test edge cases: offline (Flutter), missing env vars (admin-panel), permission denial (Laravel)

## Project Goals & Constraints

From [codex.md](codex.md):
- **Senior Frontend Mindset:** Careful refactoring, avoid regressions
- **Minimal Diffs:** Prefer small focused changes
- **Code Quality:** Remove unused code, clarify naming, extract duplicate logic
- **Behavior Preserved:** No behavioral changes in refactors
- **TypeScript Strict:** All new code must pass strict mode
- **ESLint Clean:** No linting violations

## Examples

### Adding an Admin Feature
1. Create component in `src/components/{ui|molecules|screen}/MyFeature.tsx`
2. Add route to [src/routes.ts](src/routes.ts)
3. Use Redux for state: create slice in `src/redux/slices/`, dispatch in component
4. Add i18n keys to `public/locales/en.json` and `public/locales/tr.json`
5. Use `@/` path aliases for imports
6. Ensure TypeScript strict mode: no `any` types

### Adding an API Endpoint
1. Create Laravel module/controller in `app/Modules/*/Http/Controllers/`
2. Add route in module's routes file
3. Use Repository pattern for queries
4. Return JSON response with consistent error handling
5. Add Sanctum auth guard if private
6. Document in API comments for admin-panel integration

## Emergency Contacts in Code
- `.env.example` files not included; **assume env vars are configured in deployment**
- Build failures: Check [scripts/postbuild.js](scripts/postbuild.js) and [scripts/fix-deploy-static.js](scripts/fix-deploy-static.js)
- Locale loading: If i18n breaks, check [src/i18n.tsx](src/i18n.tsx) locale detection logic
