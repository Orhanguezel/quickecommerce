Sistem mimarisini tasarla veya mevcut mimariyi analiz et: $ARGUMENTS

## QuickEcommerce Mimari Yapısı

### Genel Bakış

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN PANEL                               │
│  Next.js 16 + React 19 + TypeScript + shadcn-ui + Tailwind  │
│  State: Redux + Tanstack Query + Zustand                    │
├─────────────────────────────────────────────────────────────┤
│                    CUSTOMER APP                              │
│  Flutter (Mobile + Web)                                      │
├─────────────────────────────────────────────────────────────┤
│                       REST API                               │
│  Laravel 12 + Sanctum Auth                                  │
├─────────────────────────────────────────────────────────────┤
│                      BACKEND                                 │
│  Laravel 12 + PHP 8.2                                       │
│  Spatie: Media, Permission, Query Builder                   │
│  Modules: Chat, Blog, Payment, SMS, Wallet, Subscription    │
├─────────────────────────────────────────────────────────────┤
│                      DATABASE                                │
│  MySQL 8+                                                   │
├─────────────────────────────────────────────────────────────┤
│                  EXTERNAL SERVICES                           │
│  Stripe | Razorpay | PayTR | Twilio | Firebase | Pusher    │
└─────────────────────────────────────────────────────────────┘
```

### Backend Yapısı (Laravel)

```
backend-laravel/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── Admin/       ← Admin API controllers
│   │   │   │   ├── V1/          ← Public/Customer API
│   │   │   │   ├── Seller/      ← Seller API
│   │   │   │   └── Deliveryman/ ← Deliveryman API
│   │   │   └── Controller.php
│   │   ├── Middleware/
│   │   └── Requests/            ← Form validation
│   ├── Models/                  ← Eloquent models
│   ├── Repositories/            ← Data access layer
│   ├── Services/                ← Business logic
│   ├── Jobs/                    ← Queue jobs
│   ├── Events/                  ← Event classes
│   ├── Listeners/               ← Event listeners
│   ├── Mail/                    ← Email templates
│   └── Helpers/                 ← Global helpers
├── Modules/                     ← Laravel Modules
│   ├── Blog/
│   ├── Chat/
│   ├── PaymentGateways/
│   ├── Pos/
│   ├── SmsGateway/
│   ├── Subscription/
│   └── Wallet/
├── routes/
│   ├── admin-api.php           ← Admin routes
│   ├── customer-api.php        ← Customer routes
│   ├── seller-api.php          ← Seller routes
│   ├── deliveryman-api.php     ← Deliveryman routes
│   └── api.php                 ← Common routes
└── database/
    ├── migrations/
    ├── seeders/
    └── factories/
```

### Admin Panel Yapısı (Next.js)

```
admin-panel/src/
├── app/
│   └── [locale]/
│       └── admin/
│           ├── dashboard/
│           ├── product/
│           ├── orders/
│           └── ...
├── modules/
│   ├── admin-section/     ← 65+ admin modules
│   │   ├── product/
│   │   │   ├── product.action.ts
│   │   │   ├── product.schema.ts
│   │   │   ├── product.service.ts
│   │   │   └── product.type.ts
│   │   └── ...
│   ├── seller-section/    ← Seller modules
│   └── common/            ← Shared modules
├── components/
│   └── ui/                ← shadcn-ui components
├── endpoints/
│   ├── AdminApiEndPoints.ts
│   └── SellerApiEndPoints.ts
├── redux/                 ← Redux store
├── lib/                   ← Utilities
├── hooks/                 ← Custom hooks
└── config/                ← Configuration
```

### API Tasarımı

```
/api/v1/
├── /admin/                 ← Admin endpoints (auth:sanctum)
│   ├── /product/
│   ├── /orders/
│   ├── /customer/
│   └── /store/
├── /seller/                ← Seller endpoints (auth:sanctum)
│   ├── /product/
│   ├── /orders/
│   └── /store/
├── /customer/              ← Customer endpoints
│   ├── /login
│   ├── /register
│   ├── /orders/
│   └── /cart/
├── /deliveryman/           ← Deliveryman endpoints
│   ├── /orders/
│   └── /location/
└── /                       ← Public endpoints
    ├── /product-list
    ├── /category-list
    └── /banner-list
```

### Authentication Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐
│  Client │────▶│  Login  │────▶│ Sanctum │
└─────────┘     └─────────┘     └─────────┘
                     │
                     ▼
              ┌─────────────┐
              │ Access Token│
              │  (Bearer)   │
              └─────────────┘
                     │
                     ▼
              ┌─────────────┐
              │  API Call   │
              │  + Token    │
              └─────────────┘
```

### Database Schema (Key Tables)

```
users
├── id, name, email, password
├── role (admin, seller, customer, deliveryman)
└── timestamps

products
├── id, name, description, price
├── store_id, category_id, brand_id
├── status, featured
└── timestamps, soft_deletes

orders
├── id, order_number, user_id
├── store_id, deliveryman_id
├── status, payment_status
├── total, discount
└── timestamps

stores
├── id, name, owner_id
├── area_id, store_type_id
├── subscription_id
└── timestamps
```

### Güvenlik Kontrolleri

- [ ] Sanctum token authentication
- [ ] Spatie Permission (roles & permissions)
- [ ] FormRequest validation
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] SQL injection protection (Eloquent)

### Performans Stratejileri

- Database indexes
- Query optimization (eager loading)
- Redis caching (optional)
- Queue for heavy operations
- CDN for static assets
- Image optimization (Spatie Media)

### Ölçeklenebilirlik

- Horizontal: Load balancer + multiple instances
- Vertical: Server resources
- Database: Read replicas
- Caching: Redis cluster
- Files: S3/Cloud storage
