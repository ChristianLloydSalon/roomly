# Roomly

A cross-platform furniture shopping platform with **AR visualization**, allowing users to preview furniture in their own space before buying.

## Stack

* **Mobile:** Flutter, `bloc_signals`, Dio
* **Backend:** NestJS, Prisma, PostgreSQL
* **Admin:** Next.js
* **Auth:** Firebase Authentication
* **AR:** ARCore / ARKit
* **Architecture:** Clean Architecture
* **Authorization:** RBAC

## Project Structure

```text
roomly/
├── apps/
│   ├── mobile/
│   ├── backend/
│   └── admin/
└── README.md
```

## Core Features

* Furniture catalog and search
* Product filtering
* Wishlist and shopping cart
* Checkout and orders
* AR furniture visualization
* Product and AR asset management
* Firebase authentication
* Role-based access control

## Architecture

All applications follow **Clean Architecture** with clear separation between presentation, application, domain, and infrastructure layers.

## Getting Started

Node version is pinned via `.nvmrc` — run `nvm use` (or your version manager's equivalent) before installing.

`apps/backend` and `apps/admin` are npm workspaces: `npm install` from the repo root installs both. `apps/mobile` is Flutter and is managed separately via `fvm` — it is **not** part of the npm workspaces.

Copy each app's `.env.example` to a real env file before running it:

* `apps/backend/.env.example` → `apps/backend/.env`
* `apps/admin/.env.example` → `apps/admin/.env.development` / `.env.production`

### Backend

```bash
npm run start:dev --workspace=apps/backend
# or: cd apps/backend && npm run start:dev
```

Health check: `http://localhost:3000/api/v1/health`
Swagger docs: `http://localhost:3000/api/docs`

### Admin

```bash
npm run dev --workspace=apps/admin
# or: cd apps/admin && npm run dev
```

### Mobile

Requires `fvm` installed.

```bash
cd apps/mobile && fvm flutter pub get
```

`lib/main.dart` does not exist — run a flavor explicitly:

```bash
fvm flutter run --flavor dev -t lib/main_dev.dart    # dev
fvm flutter run --flavor prod -t lib/main_prod.dart  # prod
```

Only Android flavors are configured currently; iOS is deferred.
