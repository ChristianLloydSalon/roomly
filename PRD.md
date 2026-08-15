# PRD: Furniture Shopping and AR Visualization Platform

## 1. Product Summary

Build a furniture shopping platform consisting of:

1. Flutter mobile application for customers.
2. NestJS REST API.
3. PostgreSQL database accessed through Prisma.
4. Next.js administration portal.
5. Firebase Authentication for identity.
6. AR visualization for supported furniture products.

The key product differentiator is the ability to view furniture in the user's real environment before purchasing.

## 2. Goals

### Primary Goals

- Allow users to discover and purchase furniture.
- Provide a high-quality mobile shopping experience.
- Allow users to visualize furniture in their room using AR.
- Allow administrators to manage furniture and AR assets.
- Provide a maintainable Clean Architecture across Flutter, NestJS, and Next.js.
- Keep infrastructure cost low during development and early usage.

### Non-Goals for MVP

Do not initially implement:

- Seller marketplace functionality.
- Multiple vendors.
- Complex recommendation ML.
- Full warehouse management.
- International tax calculation.
- Advanced payment settlement.
- AR room scanning and room reconstruction.
- Full room interior design editing.

## 3. Technology Requirements

### Customer App

- Flutter
- Dart
- Clean Architecture
- `bloc_signals`
- Dio
- Firebase Authentication
- GoRouter
- Secure local storage
- ARCore/ARKit integration behind an abstraction

### API

- NestJS
- TypeScript
- REST
- Clean Architecture
- Prisma ORM
- PostgreSQL
- Firebase Admin SDK
- Swagger/OpenAPI

### Admin

- Next.js
- TypeScript
- React
- Clean Architecture
- Firebase Authentication
- NestJS REST API

### Authentication

Firebase Authentication should support OAuth-based providers as required.

Initial provider support may include:

- Google
- Apple on supported platforms
- Email/password if desired

Firebase handles authentication and identity.

NestJS verifies Firebase ID tokens.

PostgreSQL stores the application user profile and authorization information.

## 4. User Roles

### Customer

Can:

- browse products
- search products
- filter products
- view product details
- use AR
- manage wishlist
- manage cart
- manage addresses
- checkout
- view orders
- manage profile

### Admin

Can:

- sign in
- view dashboard
- create products
- edit products
- archive products
- manage categories
- manage inventory
- upload product images
- configure AR support
- upload/manage 3D assets
- view orders
- manage selected application settings

Authorization must be enforced by the API.


## 4.1 Role-Based Access Control

The system must implement RBAC.

### Roles

#### CUSTOMER

Customers can:

- browse products
- search and filter products
- view product details
- use AR
- manage their own wishlist
- manage their own cart
- manage their own addresses
- checkout
- view their own orders
- manage their own profile

#### ADMIN

Admins can:

- manage products
- manage categories
- manage inventory
- manage product images
- manage AR assets
- view and manage orders
- access the administration portal

#### SUPER_ADMIN

Super admins can:

- perform all ADMIN operations
- manage administrative users
- manage roles
- perform system-level administrative operations

### Authorization Rules

Authorization must be enforced by the NestJS API.

Firebase Authentication establishes identity. It does not by itself determine application permissions.

PostgreSQL stores the application role associated with the Firebase UID.

The API must verify the Firebase ID token and resolve the authenticated application user before applying authorization.

Use RBAC together with resource ownership.

Example:

```text
CUSTOMER requesting /orders/:id
    ↓
Authenticate user
    ↓
Check role
    ↓
Check order belongs to authenticated user
    ↓
Allow or reject
```

Client-side authorization checks in Flutter and Next.js are for UX only and must never be treated as security controls.

## 5. Customer Mobile Requirements

### Authentication

Users can:

- sign in
- sign out
- create an account if email/password is enabled
- authenticate with configured OAuth providers
- restore an authenticated session

The application should show appropriate loading and error states.

### Home

Display:

- promotional banner
- categories
- featured products
- new arrivals
- popular products
- recommended products
- recently viewed products

### Catalog

Users can:

- browse categories
- browse all products
- paginate results
- refresh results
- open product details

### Search

Support:

- product name search
- category search
- brand search
- search suggestions
- recent searches
- debounced requests

### Filters

Support:

- category
- price range
- brand
- color
- material
- rating
- stock availability
- AR availability

Sorting:

- recommended
- newest
- price ascending
- price descending
- rating
- popularity

### Product Details

Display:

- product image gallery
- name
- brand
- description
- price
- sale price
- discount
- rating
- reviews count
- material
- colors
- dimensions
- weight
- stock
- delivery estimate

Actions:

- wishlist
- add to cart
- buy now
- share
- view in AR when supported

## 6. AR Requirements

### Primary AR Flow

1. User opens a supported product.
2. User taps "View in AR".
3. Application checks device/platform support.
4. Camera permission is requested if needed.
5. AR session starts.
6. Horizontal surfaces are detected.
7. User receives a placement indicator.
8. User taps a surface.
9. Furniture model is placed.
10. User manipulates the object.
11. User can reset or remove it.
12. User exits AR and returns to the product.

### Object Controls

Support:

- move
- rotate
- scale
- reset
- remove

### AR UI

Show:

- product name
- placement guidance
- dimensions
- reset
- remove
- add to cart

### AR Failure States

Handle:

- unsupported device
- denied camera permission
- AR initialization failure
- no detected surface
- model download failure
- model parsing failure
- insufficient device resources

Provide useful recovery actions.

### 3D Assets

Use GLB/glTF.

Models should represent realistic dimensions.

Products must include AR metadata:

```text
arSupported
arModelUrl
arModelFormat
width
height
depth
```

3D models must be optimized for mobile rendering.

## 7. Wishlist

Users can:

- add product
- remove product
- view wishlist
- open product
- add product to cart

## 8. Cart

Display:

- product
- variant
- quantity
- unit price
- subtotal

Actions:

- increase quantity
- decrease quantity
- remove item
- clear cart

Calculate:

```text
subtotal
delivery fee
discount
total
```

Server-side pricing must be authoritative during checkout.

## 9. Checkout

Checkout must include:

### Address

- list addresses
- create address
- edit address
- delete address
- select address

### Delivery

Initial options:

- Standard
- Express

### Payment

The payment system should be implemented behind an abstraction.

MVP may use a mock payment provider if no payment gateway has been selected.

Never trust client-calculated totals.

The API must calculate the authoritative order total.

## 10. Orders

Users can view:

- order list
- order details

Statuses:

```text
PENDING
CONFIRMED
PREPARING
SHIPPED
OUT_FOR_DELIVERY
DELIVERED
CANCELLED
```

Order details include:

- order number
- created date
- items
- quantity
- prices
- total
- address
- payment status
- order status

## 11. Notifications

Potential push notifications:

- order confirmation
- order status changes
- delivery updates
- promotions
- wishlist price changes

Notification implementation should be replaceable.

## 12. Admin Portal

### Dashboard

Display:

- total products
- active products
- inventory status
- total orders
- pending orders
- recent products
- recent orders

### Product Management

Admins can:

- list products
- search products
- filter products
- create product
- edit product
- archive product
- restore product
- manage stock
- manage pricing
- manage product images
- manage AR support

### Product Creation

Required fields:

- name
- slug
- description
- category
- price
- currency
- stock

Optional:

- sale price
- brand
- material
- colors
- dimensions
- weight
- images
- AR model

Validation must exist on both admin UI and API.

### AR Asset Management

Admins can:

- enable/disable AR for a product
- upload 3D model
- replace 3D model
- remove 3D model
- preview model metadata
- configure dimensions

The API must validate that an AR-enabled product has a valid model reference.

## 13. Database

Use PostgreSQL with Prisma.

Core entities:

```text
User
Role
Category
Product
ProductImage
ProductVariant
ARAsset
Wishlist
WishlistItem
Cart
CartItem
Address
Order
OrderItem
```

Potential future entities:

```text
Review
Promotion
Coupon
Payment
Notification
AuditLog
```

Firebase UID must be stored against the application User entity.

Do not store passwords in PostgreSQL when Firebase Authentication is used.

## 14. Suggested Product Model

```text
Product
- id
- name
- slug
- description
- price
- salePrice
- currency
- brand
- categoryId
- material
- colors
- width
- height
- depth
- weight
- stock
- status
- arSupported
- createdAt
- updatedAt
```

AR assets should be modeled separately rather than putting the entire asset record directly on Product.

## 15. API

Base URL:

```text
/api/v1
```

Public endpoints:

```text
GET /products
GET /products/:id
GET /categories
GET /categories/:id/products
```

Authenticated endpoints:

```text
GET /me
GET /wishlist
POST /wishlist/items
DELETE /wishlist/items/:productId

GET /cart
POST /cart/items
PATCH /cart/items/:productId
DELETE /cart/items/:productId

GET /addresses
POST /addresses
PATCH /addresses/:id
DELETE /addresses/:id

POST /orders
GET /orders
GET /orders/:id
```

Admin endpoints:

```text
POST /admin/products
PATCH /admin/products/:id
DELETE /admin/products/:id
POST /admin/products/:id/images
POST /admin/products/:id/ar-assets
PATCH /admin/products/:id/inventory
GET /admin/orders
```

Exact endpoints may evolve with implementation.

## 16. Clean Architecture

### Flutter

```text
Presentation
    ↓
Application
    ↓
Domain
    ↓
Data/Infrastructure
```

Use cases include:

```text
GetProducts
GetProduct
SearchProducts
FilterProducts
AddToWishlist
AddToCart
Checkout
GetOrders
StartARSession
PlaceARObject
```

### NestJS

```text
Presentation
    ↓
Application
    ↓
Domain
    ↓
Infrastructure
```

Controllers call application use cases.

Use cases depend on domain abstractions.

Prisma repositories implement domain repository interfaces.

### Next.js

```text
UI / Presentation
    ↓
Application
    ↓
Domain
    ↓
Infrastructure
```

The browser UI must not access Prisma.

The admin portal communicates with the NestJS API.

## 17. State Management

Flutter must use `bloc_signals`.

Use signals for:

- screen state
- filters
- selected category
- cart state
- wishlist state
- authentication state
- AR session state

Keep domain logic outside state objects.

Do not use `setState` for application-level state.

## 18. Networking

Flutter uses Dio.

Create:

- Dio client
- authentication interceptor
- API exception mapper
- request timeout configuration
- response handling

Dio must be hidden behind data-source/API abstractions.

Do not call Dio directly from widgets.

## 19. Performance

Requirements:

- pagination
- image caching
- lazy loading
- optimized rebuilds
- optimized AR models
- lazy 3D asset downloads
- caching of frequently accessed assets
- avoid unnecessary network requests

## 20. Accessibility

Support:

- semantic labels
- screen readers
- text scaling
- sufficient contrast
- accessible touch targets
- non-color-only status indicators

## 21. Analytics

Track:

```text
app_opened
product_viewed
product_searched
filter_applied
wishlist_added
wishlist_removed
cart_item_added
checkout_started
order_completed
ar_started
ar_model_loaded
ar_object_placed
ar_object_removed
```

Use an analytics abstraction.

## 22. Security

- Firebase ID tokens must be verified server-side.
- Admin authorization must be server-side.
- All API inputs must be validated.
- Use HTTPS in non-local environments.
- Never expose database credentials.
- Never expose Firebase Admin credentials.
- Never trust client-side pricing.
- Never trust client-side role claims without server verification.

## 23. MVP Acceptance Criteria

The MVP is complete when:

1. A customer can authenticate.
2. A customer can browse furniture.
3. A customer can search and filter furniture.
4. A customer can open product details.
5. A customer can add/remove wishlist items.
6. A customer can add/update/remove cart items.
7. A customer can create an order.
8. A customer can view order history.
9. A customer can launch AR for supported furniture.
10. A customer can place, move, rotate, scale, reset, and remove furniture in AR.
11. An admin can authenticate.
12. An admin can create furniture.
13. An admin can edit furniture.
14. An admin can manage product images.
15. An admin can configure AR support and model metadata.
16. Mobile and admin communicate only with the NestJS API.
17. The backend persists data through Prisma/PostgreSQL.
18. Automated tests exist for critical business logic.
19. The three applications follow Clean Architecture.
