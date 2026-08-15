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
