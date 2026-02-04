# 🔥 QuickEcommerce API — Laravel REST API for Multi-Vendor / Multi-Store eCommerce

A robust, production-ready backend API built with **Laravel** — powering multi-vendor, multi-store eCommerce platforms (marketplaces, grocery, electronics, fashion, etc.). Designed for easy installation, customization and integration with any frontend (Next.js, React, Vue, mobile app).

## ✅ Key Features

* ✅ **Multi-Store & Multi-Vendor support** — manage multiple stores / vendors from a single API backend.
* ✅ **Product, Category & Inventory Management** — full CRUD for products, categories, stocks, variants.
* ✅ **Order & Checkout Management** — cart, orders, status updates, payment integration ready.
* ✅ **Role-Based Access Control** — admin, vendor/seller, customer roles (and more) supported.
* ✅ **Modular Structure (HMVC / Modules)** — extendable modules for custom features, easy to maintain.
* ✅ **Localization / Multi-Language Ready** — supports multiple languages via built-in `lang/`.
* ✅ **Secure Env-Based Configuration** — `.env.example` for environment variables and configuration.
* ✅ **API-First & Headless Ready** — can be paired with any frontend (web/mobile) or used as SaaS backend.

## 📂 Project Structure

```
/
├─ app/             # Core Laravel application code
├─ Modules/         # Modular components for vendors, stores, orders, etc.
├─ config/          # Configuration files
├─ database/        # Migrations & seeders
├─ routes/          # API route definitions
├─ public/          # Public folder (for possible uploads, assets)
├─ resources/       # Views / translations / assets (if any)
├─ storage/         # Storage & cache
├─ .env.example     # Environment config template
├─ composer.json    # PHP dependencies
└─ README.md        # ← This file
```


## 🚀 Installation & Setup (Quick Start)

```bash
# 1. Clone the repository  
git clone <repository-url>  
cd <project-folder>

# 2. Install dependencies  
composer install  

# 3. Copy env template and set environment variables  
cp .env.example .env  
# then update .env: DB credentials, APP_URL, etc.

# 4. Run migrations & seeders (if provided)  
php artisan migrate --seed  

# 5. Generate application key  
php artisan key:generate  

# 6. (Optional) serve API  
php artisan serve
```

Your API will now be accessible at `http://localhost:8000/api/...`.


## 🧩 Usage & Customization

* Customize modules inside `Modules/` — add or extend vendors, stores, products, etc.
* Add support for payment gateways, shipping, notifications via Laravel’s ecosystem (queues, events, jobs).
* Use built-in localization (`lang/`) to add multiple languages.
* Expose API endpoints via routes in `routes/` — easy to integrate with any frontend or mobile application.


## 📄 License & Commercial Use

This API is licensed under the license chosen at purchase.
You may **distribute only to end clients** per license — reselling or redistribution of source without license is prohibited.


## 💬 Support & Contact

Need help, customization, or support? Contact me at:
📧 **[bravosoftltd@gmail.com](mailto:bravosoftltd@gmail.com)**
