# AGENTS.md

## Purpose

This document defines the operating rules for coding agents working on the furniture shopping platform.

The project contains:

- Flutter customer application
- NestJS REST API
- Next.js admin portal
- PostgreSQL database
- Prisma ORM
- Firebase Authentication
- AR functionality

## 1. General Rules

Before modifying code:

1. Inspect the existing project structure.
2. Read relevant architecture and feature documentation.
3. Identify the affected application.
4. Understand existing abstractions before creating new ones.
5. Reuse existing patterns when they are appropriate.
6. Make the smallest coherent change that satisfies the requirement.

Do not rewrite unrelated code.

Do not introduce architectural changes without a clear reason.

## 2. Clean Architecture Rules

All applications must follow Clean Architecture.

Dependency direction:

```text
Presentation
    ↓
Application
    ↓
Domain
    ↓
Infrastructure
```

Never reverse this dependency direction.

### Domain

Domain code must contain business concepts and rules.

Domain must not import:

- Flutter
- React
- Next.js
- NestJS
- Prisma
- Dio
- Firebase SDK
- browser APIs

### Application

Application contains use cases and orchestration.

Use cases should:

- accept explicit inputs
- depend on abstractions
- return explicit results
- contain application-level business rules

### Infrastructure

Infrastructure implements interfaces defined by inner layers.

Examples:

- Prisma repository
- Dio data source
- Firebase authentication adapter
- AR platform implementation

### Presentation

Presentation should:

- render UI
- react to state
- dispatch user actions
- call application/use-case abstractions

Do not place business logic in UI components.

## 3. Flutter Rules

Use:

- Flutter
- Dart
- `bloc_signals`
- Dio
- Clean Architecture

Do not introduce another state management library unless explicitly required.

Do not use `setState` for application-level state.

`setState` may be used for genuinely local ephemeral UI state when it is simpler and does not belong in application state.

### Flutter Feature Structure

Prefer:

```text
features/
└── feature_name/
    ├── data/
    ├── domain/
    └── presentation/
```

### Signals

Use `bloc_signals` for application and presentation state.

Keep signal state models small and explicit.

Do not put repository implementations inside signal classes.

Do not perform direct HTTP requests inside signals.

## 4. Dio Rules

Dio must be centralized.

Create an API client abstraction around Dio.

Authentication headers should be attached through an interceptor or equivalent centralized mechanism.

Do not create a new Dio instance in every repository.

Handle:

- timeouts
- network failures
- authentication failures
- server errors
- serialization failures

Map transport errors into application/domain-friendly failures.

## 5. Firebase Authentication Rules

Firebase Authentication is the identity provider.

The mobile app may use Firebase Auth SDK to sign users in.

The admin portal may use Firebase Auth SDK for admin authentication.

The NestJS API must verify Firebase ID tokens with Firebase Admin SDK.

Never:

- send Firebase Admin credentials to clients
- store user passwords in PostgreSQL
- trust a user ID supplied by the client over the verified token
- trust client-side admin checks

Authorization belongs to the API.


## 5. Role-Based Access Control (RBAC)

Use RBAC for application authorization.

Initial roles:

```text
CUSTOMER
ADMIN
SUPER_ADMIN
```

### Authentication vs Authorization

Firebase Authentication answers:

```text
Who is the user?
```

NestJS authorization answers:

```text
What is the user allowed to do?
```

Do not combine these responsibilities.

### Server-Side Enforcement

RBAC must be enforced by the NestJS API.

Flutter and Next.js may hide or show UI based on the user's role, but this is only a UX optimization.

Never consider client-side role checks a security mechanism.

Every protected API endpoint must independently enforce authorization.

### Role Storage

The application's role should be stored in PostgreSQL on the application `User` entity.

The Firebase UID links the Firebase identity to the application user.

Never trust a role supplied by:

- request body
- query parameter
- URL parameter
- client-side state
- local storage
- Flutter application
- Next.js browser code

### Resource Ownership

RBAC alone is insufficient for user-owned resources.

For customer resources, perform ownership checks.

Examples:

```text
CUSTOMER + own order       → allowed
CUSTOMER + another order  → forbidden

CUSTOMER + own address     → allowed
CUSTOMER + another address → forbidden

CUSTOMER + own cart        → allowed
CUSTOMER + another cart    → forbidden
```

Administrative roles may access resources according to their assigned permissions.

### NestJS Authorization

Prefer reusable guards/decorators or policy-based authorization.

Example conceptual usage:

```text
@Roles(ADMIN, SUPER_ADMIN)
POST /admin/products
```

Authorization must execute before the protected use case.

Do not implement authorization only inside controllers.

Use cases may still enforce domain-specific authorization or ownership rules when required.

### Admin Portal

The Next.js admin portal should protect administrative routes for usability.

However, NestJS remains the security boundary.

A user must not gain administrative access merely by navigating directly to an admin URL.

### Role Changes

Role changes are sensitive operations.

Only authorized administrative users should be able to change roles.

Prefer restricting role management to `SUPER_ADMIN`.

When role information changes, subsequent API requests must use the updated role.

## 6. NestJS Rules

NestJS is the REST API boundary.

Controllers must be thin.

A controller should generally:

1. Receive request.
2. Validate DTO.
3. Extract authenticated identity.
4. Invoke a use case.
5. Map the result to an HTTP response.

Do not place complex business logic in controllers.

Do not call Prisma directly from controllers.

### NestJS Clean Architecture

Use:

```text
presentation/
application/
domain/
infrastructure/
```

Prisma belongs in infrastructure.

Repositories must be defined as domain/application-facing interfaces and implemented using Prisma.

## 7. Prisma Rules

Prisma is the persistence mechanism.

Do not expose Prisma types throughout the domain.

Prefer domain entities/value objects over leaking Prisma-generated models into business logic.

Database changes require:

1. Update Prisma schema.
2. Create migration.
3. Generate Prisma client.
4. Update affected repositories.
5. Update tests.

Do not manually modify generated Prisma client files.

## 8. Database Rules

PostgreSQL is the source of truth.

Use appropriate:

- primary keys
- foreign keys
- unique constraints
- indexes
- cascading behavior
- nullable fields

Use transactions when multiple database operations must succeed or fail together.

Examples:

- creating an order and order items
- checkout inventory updates
- cart-to-order conversion

Never trust the client for:

- price
- discount
- stock availability
- order total

The backend must recalculate authoritative values.

## 9. Next.js Admin Rules

Next.js is an administration UI.

The admin application must communicate with NestJS.

Do not access Prisma directly from the browser.

Do not duplicate backend business logic inside Next.js.

Next.js may contain:

- form validation for user experience
- UI state
- presentation mapping
- API client code

Server-side authorization remains the responsibility of NestJS.

### Next.js Clean Architecture

Prefer:

```text
src/
├── app/
├── core/
└── features/
    └── products/
        ├── domain/
        ├── application/
        ├── infrastructure/
        └── presentation/
```

Use Server Components where appropriate.

Use Client Components only when client-side interactivity is required.

Do not turn the entire application into Client Components unnecessarily.

## 10. AR Rules

AR is a platform-specific capability.

Do not allow ARCore/ARKit concepts to leak into product, cart, checkout, or catalog domains.

Use an abstraction such as:

```text
ArService
```

with platform implementations.

AR should support:

- initialization
- plane detection
- placement
- movement
- rotation
- scaling
- reset
- removal
- disposal

Products without valid AR assets must not expose AR functionality.

3D models should be downloaded lazily.

## 11. API Contract Rules

Use versioned APIs:

```text
/api/v1
```

Use consistent HTTP semantics.

Examples:

```text
GET    /products
GET    /products/:id
POST   /admin/products
PATCH  /admin/products/:id
DELETE /admin/products/:id
```

Use DTOs for incoming requests.

Validate DTOs.

Do not expose internal database models directly.

## 12. Error Handling

Use explicit error handling.

Flutter should distinguish at least:

```text
network failure
authentication failure
authorization failure
validation failure
not found
server failure
unknown failure
```

NestJS should return appropriate HTTP status codes.

Admin and mobile UI should display useful user-facing errors.

Do not expose stack traces or internal database errors to clients.

## 13. Testing Rules

Every non-trivial business rule should have a test.

Prioritize:

- pricing
- cart calculations
- stock validation
- checkout
- order creation
- authentication guards
- admin authorization
- product filtering
- repository behavior

AR should be tested through abstractions and mocks where possible.

Do not make all tests dependent on physical AR hardware.

## 14. Dependency Rules

Before adding a package:

1. Check existing dependencies.
2. Check whether the requirement can be implemented without a package.
3. Check package maintenance and compatibility.
4. Confirm the package fits the architecture.
5. Add only if justified.

Do not add multiple packages that solve the same problem.

## 15. Security Rules

Never commit:

- `.env` files containing secrets
- Firebase Admin service account credentials
- database passwords
- API secrets
- private keys

Use environment variables or secret management.

Never log:

- Firebase ID tokens
- access tokens
- passwords
- payment credentials
- private keys

Validate all external input.

## 16. Git Rules

Keep commits focused.

Avoid mixing:

- feature changes
- unrelated refactoring
- formatting entire repositories
- dependency upgrades

Use descriptive commit messages.

Do not modify generated files unless the repository explicitly requires committing them.

## 17. Agent Workflow

For each requested feature:

### Step 1: Analyze

Identify:

- affected app
- affected feature
- domain changes
- API changes
- database changes
- UI changes
- tests required

### Step 2: Plan

Before implementation, provide a concise implementation plan if the change is substantial.

### Step 3: Domain First

Implement or update:

- entities
- value objects
- repository contracts
- use cases

### Step 4: Infrastructure

Implement:

- API clients
- repositories
- Prisma persistence
- Firebase adapters
- external integrations

### Step 5: Presentation

Implement:

- controllers
- DTOs
- Flutter UI/state
- Next.js UI/state

### Step 6: Testing

Add tests for the changed behavior.

### Step 7: Verification

Run applicable:

```text
format
lint
analyze
unit tests
integration tests
build
```

Do not report a feature as complete when the project does not compile or tests fail.

## 18. Change Discipline

Prefer small, reversible changes.

Do not:

- rewrite the architecture without authorization
- replace `bloc_signals`
- replace Dio
- replace Prisma
- replace Firebase Authentication
- replace NestJS
- replace Next.js
- introduce another backend framework

unless explicitly requested.

## 19. Documentation

Update documentation when:

- architecture changes
- API contracts change
- database schema changes
- environment variables change
- deployment procedures change
- major dependencies change

Keep documentation synchronized with implementation.

## 20. Definition of Done

A feature is complete when:

- requirements are implemented
- architecture boundaries are respected
- authentication/authorization is secure
- errors are handled
- tests exist for important behavior
- formatting passes
- static analysis passes
- relevant tests pass
- build succeeds where applicable
- documentation is updated when necessary
- no unrelated files were changed
