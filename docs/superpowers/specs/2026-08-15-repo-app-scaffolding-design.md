# Design: Repo & App Scaffolding Foundation

**Date:** 2026-08-15
**Status:** Approved
**Scope:** First of four foundation sub-projects for the Roomly platform. Establishes the monorepo structure and gets all three apps (mobile, backend, admin) building, linting, and testing with the tooling this project has standardized on. Excludes design token values, Firebase Hosting deploy config, CI/CD pipelines, and any real business/auth logic.

## 1. Context

The repository currently contains only documentation (`PRD.md`, `CLAUDE.md`, `AGENTS.md`, `README.md`) — no application code exists yet. `CLAUDE.md` and `PRD.md` define the target architecture (Clean Architecture across three apps, specific tech stack, RBAC model). This spec covers standing up that structure as runnable, empty-but-working scaffolds, deferring all feature and design-token work to later sub-projects.

### Related sub-projects (not covered here)

1. **Repo & app scaffolding foundation** — this document.
2. **Design system foundation** — design tokens, atomic design component structure, minimalist/responsive rules.
3. **Firebase setup** — Firebase Hosting config, hosting targets, dev/prod wiring.
4. **CI/CD (Codemagic)** — pipelines triggered on merge to `dev`/`prod`.

## 2. Repository Structure & Naming

```text
roomly/
├── apps/
│   ├── mobile/       # Flutter customer app
│   ├── backend/      # NestJS REST API
│   └── admin/        # Next.js admin portal
├── docs/
│   └── superpowers/specs/
├── package.json       # npm workspaces root
├── .nvmrc
├── .editorconfig
├── .husky/
├── .gitignore
├── README.md
├── CLAUDE.md
├── AGENTS.md
└── PRD.md
```

- The backend folder is named `apps/backend` (matches `README.md`; `CLAUDE.md`'s one `apps/api` reference will be corrected to `apps/backend` as part of this work).
- `apps/mobile` and `apps/admin` names already agree across docs.

### Branching model

- `main` — default/integration branch. All feature work merges here via PR.
- `dev` — long-lived deploy branch, tracks the `roomly-sandbox` Firebase project. Promoted from `main` periodically.
- `prod` — long-lived deploy branch, tracks the `roomly-44953` Firebase project. Promoted from `dev`.
- Merge triggers for Codemagic/Firebase Hosting deploys are wired up in the CI/CD sub-project, not here — this spec only establishes the branches exist and what they mean.

## 3. Root-Level Tooling

- **Package manager:** npm.
- **Workspaces:** root `package.json` declares `workspaces: ["apps/backend", "apps/admin"]`. This allows a single `npm install` from the root for both Node apps and leaves the door open for a future shared TS package (e.g. shared DTOs) without additional tooling. `apps/mobile` is not part of npm workspaces (Dart/Flutter, managed by `fvm`/`pub` instead).
- **Node version:** `.nvmrc` pins the latest Node.js LTS available at scaffold time.
- **Pre-commit hooks:** `husky` + `lint-staged` at the root, scoped to staged files — runs ESLint (`--fix`) and Prettier on staged `.ts`/`.tsx`/`.js` files in `apps/backend` and `apps/admin`, and `dart format` on staged `.dart` files in `apps/mobile`.
- **`.editorconfig`** for baseline formatting consistency (indentation, line endings, charset) across all three stacks.

## 4. Backend (`apps/backend`) — NestJS

Scaffolded via Nest CLI, restructured into the Clean Architecture layout from `CLAUDE.md`:

```text
apps/backend/
├── src/
│   ├── core/
│   │   ├── auth/          # empty — folders only, no guard logic yet
│   │   ├── database/
│   │   ├── errors/
│   │   └── config/
│   ├── modules/            # empty — feature modules added in future work
│   ├── main.ts
│   └── app.module.ts
├── prisma/
│   └── schema.prisma       # datasource + generator only, no models yet
├── test/
├── .env.example
└── package.json
```

Concrete pieces that make the scaffold provably working (not placeholders):

- Global `ValidationPipe` registered in `main.ts`.
- `/api/v1` URI versioning enabled.
- Swagger/OpenAPI served at `/api/docs`.
- One real endpoint: `GET /api/v1/health` returning a static `{ status: "ok" }`, with a passing Jest test.
- Prisma initialized against `DATABASE_URL` read from `.env` (no Docker Compose — you'll provide a connection string locally; this was explicitly deferred).
- ESLint + Prettier configured (Nest CLI defaults, no deviation).

No Firebase Admin SDK wiring, no auth guards, no feature modules in this pass — `core/auth/` exists as an empty directory to hold the future `firebase-auth.guard.ts` / `roles.guard.ts` / `roles.decorator.ts` / `authenticated-user.ts` described in `CLAUDE.md`, but implementing them is future auth work.

## 5. Admin (`apps/admin`) — Next.js

Scaffolded with the App Router, TypeScript, and Tailwind CSS:

```text
apps/admin/
├── src/
│   ├── app/
│   │   └── page.tsx         # placeholder home page
│   ├── core/
│   │   ├── auth/
│   │   ├── http/
│   │   ├── routing/
│   │   └── ui/
│   └── features/             # empty — feature folders added in future work
├── tailwind.config.ts        # placeholder theme, real tokens land in Design System sub-project
├── next.config.js            # output: 'export'
├── .env.example               # dev/prod Firebase web config placeholders
└── package.json
```

- `output: 'export'` in `next.config.js` — static export for Firebase Hosting. This constrains the admin to client-side data fetching against the NestJS API (no Server Component server-side fetching, no Next.js API routes). Documented here because it's a scaffold-time decision that shapes how every future admin feature is built.
- One placeholder home page proving the build succeeds, plus a Jest + React Testing Library smoke test.
- ESLint + Prettier configured.

## 6. Mobile (`apps/mobile`) — Flutter

- Flutter pinned via `fvm` to the latest stable release at scaffold time; `.fvmrc` committed.
- `flutter create` output restructured into `core/`/`features/` per `CLAUDE.md`.
- Dependencies added because they're mandated architecture, not features: `bloc_signals`, `dio`, `go_router`.
- **Android-only** product flavors for now (iOS explicitly deferred):
  - `dev` → applicationId `roomly.app.dev`, targets Firebase project `roomly-sandbox` (326356684667).
  - `prod` → applicationId `roomly.app`, targets Firebase project `roomly-44953` (706854547294).
  - `main_dev.dart` / `main_prod.dart` entry points selecting the flavor's configuration.
- Firebase config files (`google-services.json` per flavor) are generated by running `flutterfire configure --flavor <flavor>` against each project. This requires an interactive `firebase login` — that login step is performed by you when we reach it, not automated by the agent.
- One placeholder home screen, buildable and runnable in both flavors, with a smoke test per flavor.

## 7. Testing Baseline

Each app must have `npm test` / `flutter test` pass out of the box:

- **Backend:** Jest unit test for the `/api/v1/health` endpoint.
- **Admin:** Jest + React Testing Library smoke test rendering the placeholder home page.
- **Mobile:** `flutter_test` smoke test per flavor rendering the placeholder home screen.

## 8. Explicitly Out of Scope

Deferred to later sub-projects or future feature work — not built here:

- Design token values and the atomic design component library (Design System sub-project).
- Firebase Hosting config (`firebase.json`, hosting targets, actual deploys) (Firebase Setup sub-project).
- Codemagic pipelines (CI/CD sub-project).
- iOS Flutter flavors (deferred by you — revisit later).
- Docker Compose for local Postgres (deferred by you — you'll handle local DB setup later).
- Firebase Authentication / RBAC guard implementation (future auth work).
- Any business feature modules (products, cart, orders, wishlist, etc.).

## 9. Error Handling & Edge Cases

- If `flutterfire configure` or `firebase login` is needed mid-implementation, the agent stops and asks you to run the interactive login rather than attempting to automate it.
- If the exact "latest stable Flutter" or "latest Node LTS" version shifts between writing this spec and implementation, the implementation plan resolves the concrete version at build time rather than this spec hardcoding a version number that could go stale.

## 10. Definition of Done

- `npm install` from the repo root installs both `apps/backend` and `apps/admin`.
- `npm run lint` and `npm test` succeed for both `apps/backend` and `apps/admin`.
- `fvm flutter pub get`, `fvm flutter analyze`, and `fvm flutter test` succeed for `apps/mobile`, for both the `dev` and `prod` Android flavors.
- `apps/backend` boots and `GET /api/v1/health` returns `200`.
- `apps/admin` builds successfully with `next build` (static export) and renders the placeholder page.
- Pre-commit hook runs lint-staged on a sample staged change in each app.
- `main`, `dev`, and `prod` branches exist.
- `CLAUDE.md`'s stray `apps/api` reference is corrected to `apps/backend`.
