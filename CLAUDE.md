# CLAUDE.md

## Project Overview

This repository contains a furniture shopping platform with three applications:

- `apps/mobile`: Flutter consumer application
- `apps/api`: NestJS REST API
- `apps/admin`: Next.js administration portal

The platform allows customers to browse furniture, search/filter products, manage wishlists and carts, checkout, view orders, and use AR to visualize supported furniture in their physical environment.

The admin portal allows authorized administrators to manage furniture products, categories, inventory, images, and AR/3D assets.

## Technology Stack

### Mobile

- Flutter
- Dart
- Clean Architecture
- `bloc_signals` for state management
- Dio for HTTP
- Firebase Authentication for customer authentication
- Firebase SDKs where appropriate
- GoRouter for navigation
- Secure local storage for sensitive credentials/tokens
- ARCore on Android and ARKit on iOS through a replaceable AR abstraction
- GLB/glTF for 3D furniture assets

### Backend

- NestJS
- TypeScript
- REST API
- Clean Architecture
- Prisma ORM
- PostgreSQL
- Firebase Admin SDK for token verification
- DTO validation
- Swagger/OpenAPI

### Admin

- Next.js
- TypeScript
- Clean Architecture
- React
- Firebase Authentication
- REST API through the NestJS backend
- Prisma must NOT be accessed directly from the browser
- Product and AR asset management

## Authentication

Firebase Authentication is the identity provider.

The Flutter app and Next.js admin portal authenticate users with Firebase Authentication and obtain Firebase ID tokens.

The NestJS API verifies Firebase ID tokens using Firebase Admin SDK.

The API is responsible for authorization.

Important:

- Firebase Authentication identifies the user.
- PostgreSQL stores application-specific user data.
- Firebase UID is the stable external identity identifier.
- Never trust a user ID supplied by the client when the authenticated Firebase UID is available from the verified token.
- Never put Firebase Admin credentials in Flutter or browser code.
- Admin authorization must be enforced by the NestJS API.

Do not implement a second password authentication system in NestJS.


## Role-Based Access Control (RBAC)

The platform must use Role-Based Access Control for authorization.

### Roles

Initial roles:

- `CUSTOMER`
- `ADMIN`
- `SUPER_ADMIN`

Role responsibilities:

```text
CUSTOMER
- Browse products
- Search and filter products
- View product details
- Use AR
- Manage wishlist
- Manage cart
- Manage own addresses
- Checkout
- View own orders
- Manage own profile

ADMIN
- All appropriate administrative operations
- Create and manage products
- Manage categories
- Manage inventory
- Manage product images
- Manage AR assets
- View and manage orders

SUPER_ADMIN
- All ADMIN capabilities
- Manage administrative users
- Manage roles and permissions
- Perform system-level administrative operations
```

### Authorization Model

Use two layers of authorization:

1. RBAC for broad application permissions.
2. Resource ownership checks for user-specific resources.

Examples:

```text
CUSTOMER → can view their own order
CUSTOMER → cannot view another customer's order

ADMIN → can view administrative order data
ADMIN → can manage products

SUPER_ADMIN → can manage administrators
```

Authentication and authorization are separate concerns:

```text
Firebase Authentication
    ↓
Who is the user?
    ↓
NestJS verifies Firebase ID token
    ↓
Application User
    ↓
What role does the user have?
    ↓
RBAC / ownership checks
    ↓
Allow or deny operation
```

Firebase Authentication identifies the user.

PostgreSQL stores the application user's role.

NestJS is the authoritative authorization boundary.

Do not rely on Flutter or Next.js role checks for security. Client-side role checks are only for UI and navigation.

Never trust a role supplied directly by a client.

Admin authorization must be enforced by NestJS guards and/or authorization policies.

Prefer a reusable authorization implementation such as:

```text
core/
└── auth/
    ├── guards/
    │   ├── firebase-auth.guard.ts
    │   └── roles.guard.ts
    ├── decorators/
    │   └── roles.decorator.ts
    └── types/
        └── authenticated-user.ts
```

Use explicit authorization metadata for protected administrative endpoints.

## Architecture

All applications must follow Clean Architecture.

### General dependency direction

```text
Presentation
    ↓
Application / Use Cases
    ↓
Domain
    ↓
Infrastructure
```

Dependencies must point inward.

Domain code must not depend on:

- Flutter
- React
- NestJS
- Prisma
- Dio
- Firebase
- Next.js
- browser APIs

Infrastructure implementations may depend on frameworks and external services.

### Flutter

Use feature-first Clean Architecture:

```text
lib/
├── core/
│   ├── config/
│   ├── error/
│   ├── network/
│   ├── routing/
│   ├── storage/
│   ├── theme/
│   └── widgets/
│
└── features/
    ├── auth/
    ├── home/
    ├── catalog/
    ├── product/
    ├── ar/
    ├── wishlist/
    ├── cart/
    ├── checkout/
    ├── orders/
    └── profile/
```

Each feature should generally contain:

```text
feature/
├── data/
│   ├── datasources/
│   ├── models/
│   └── repositories/
├── domain/
│   ├── entities/
│   ├── repositories/
│   └── usecases/
└── presentation/
    ├── pages/
    ├── widgets/
    └── signals/
```

Use `bloc_signals` for presentation/application state.

Do not place business logic inside widgets.

Use Dio through an API client abstraction.

### NestJS

Organize by bounded feature:

```text
src/
├── core/
│   ├── auth/
│   ├── database/
│   ├── errors/
│   └── config/
│
└── modules/
    ├── users/
    ├── products/
    ├── categories/
    ├── wishlist/
    ├── carts/
    ├── orders/
    ├── addresses/
    ├── ar-assets/
    └── admin/
```

Inside each module:

```text
module/
├── domain/
│   ├── entities/
│   ├── repositories/
│   └── services/
├── application/
│   └── use-cases/
├── infrastructure/
│   ├── persistence/
│   └── external/
└── presentation/
    ├── controllers/
    └── dto/
```

Prisma belongs in infrastructure.

Controllers must not contain business logic.

Use cases should depend on domain repository interfaces.

Prisma repositories implement those interfaces.

### Next.js Admin

Use feature-first Clean Architecture:

```text
src/
├── app/
├── core/
│   ├── auth/
│   ├── http/
│   ├── routing/
│   └── ui/
└── features/
    ├── dashboard/
    ├── products/
    ├── categories/
    ├── inventory/
    ├── ar-assets/
    └── users/
```

Do not call Prisma directly from client components.

The admin application communicates with the NestJS REST API.

Authentication tokens must be handled securely and never exposed unnecessarily to client-side code.

## AR Architecture

AR is a platform capability and must be isolated.

Flutter presentation code should depend on an `ArService` abstraction.

Example:

```text
ArService
├── AndroidArService
└── IOSArService
```

The AR domain should not know about ARCore, ARKit, camera plugins, or platform channels.

AR responsibilities include:

- initialize session
- detect horizontal planes
- show placement indicator
- load 3D model
- place model
- move model
- rotate model
- scale model
- reset model
- remove model
- dispose session

Products may or may not support AR.

Only products with `arSupported = true` should expose the AR action.

## Data and API Rules

- PostgreSQL is the source of truth for application data.
- Prisma is the persistence layer.
- Firebase Authentication is the identity provider.
- Firebase Storage may be used for images/3D assets if appropriate.
- The NestJS API is the only application backend boundary.
- Mobile and admin must not access PostgreSQL directly.
- Mobile and admin must not access Prisma directly.
- Use DTOs at API boundaries.
- Validate request payloads.
- Use pagination for product listings.
- Never return sensitive internal fields.

## Product and AR Asset Rules

A product should contain:

- name
- slug
- description
- price
- sale price
- category
- brand
- materials
- colors
- dimensions
- weight
- stock
- images
- rating
- review count
- AR support
- AR model reference

AR models should use optimized GLB/glTF assets.

Do not bundle the full furniture catalog's 3D assets into the mobile binary.

Use remote assets and cache them appropriately.

## API Rules

Use REST.

Use resource-oriented routes such as:

```text
GET    /api/v1/products
GET    /api/v1/products/:id
POST   /api/v1/products
PATCH  /api/v1/products/:id
DELETE /api/v1/products/:id
```

Admin-only mutations must require verified authentication and admin authorization.

Use `/api/v1` versioning.

Use consistent response and error formats.

## Code Quality

Before adding a dependency:

1. Check whether existing Flutter/TypeScript functionality is sufficient.
2. Explain why the dependency is necessary.
3. Prefer maintained, focused packages.
4. Avoid packages that duplicate existing project capabilities.

Do not introduce unnecessary abstractions.

Do not create generic helpers unless they have a clear reuse case.

Prefer explicit code over premature abstraction.

## Testing

Required:

- Domain unit tests
- Use case tests
- Repository tests
- API integration tests
- Flutter widget tests
- Critical Flutter integration tests
- Admin component tests
- Admin use case tests

AR interaction should be abstracted so most automated tests do not require a physical AR-capable device.

## Security

Never:

- commit secrets
- expose Firebase Admin credentials
- expose database credentials
- trust client-supplied authorization roles
- trust client-supplied user identity when verified token identity exists
- log authentication tokens
- log payment credentials
- access Prisma directly from mobile/admin clients

Validate all external input.

Use Firebase Admin SDK to verify Firebase ID tokens in NestJS.

## Development Workflow

Implement incrementally.

For every feature:

1. Understand the requirements.
2. Define or update domain entities.
3. Define repository interfaces.
4. Implement use cases.
5. Implement infrastructure.
6. Implement API/UI presentation.
7. Add tests.
8. Run formatting.
9. Run static analysis.
10. Fix all errors before moving on.

Do not generate the entire application in one pass.

When requirements are ambiguous, identify the ambiguity before making a major architectural decision.

## Commands

Expected commands should include equivalents for:

```text
Flutter:
flutter pub get
dart format .
flutter analyze
flutter test

NestJS:
npm install
npm run lint
npm test
npm run test:e2e
npm run build
npx prisma generate
npx prisma migrate dev

Next.js:
npm install
npm run lint
npm run test
npm run build
```

Use the package manager already established by the repository. Do not switch package managers without a reason.

## Documentation

Keep architectural decisions documented.

When changing architecture, update the relevant documentation.

The PRD defines product requirements.

AGENTS.md defines agent operating rules.

CLAUDE.md defines project-wide Claude-specific engineering context and constraints.
