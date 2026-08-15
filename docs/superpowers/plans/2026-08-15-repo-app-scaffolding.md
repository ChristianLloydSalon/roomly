# Repo & App Scaffolding Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Roomly monorepo as three runnable, empty-but-working app scaffolds (NestJS backend, Next.js admin, Flutter mobile) plus root-level tooling, with no business logic or design tokens yet.

**Architecture:** Three independent apps under `apps/` following the Clean Architecture folder layout from `CLAUDE.md`. `apps/backend` and `apps/admin` are linked via npm workspaces at the root; `apps/mobile` is managed separately via `fvm`/`pub`. Each app gets exactly one real, tested piece of functionality (a health endpoint, a placeholder page, a placeholder screen) to prove the scaffold actually runs — everything else is folder structure and tooling.

**Tech Stack:** NestJS (Nest CLI scaffold, Prisma, Swagger, class-validator), Next.js App Router + TypeScript + Tailwind CSS (static export), Flutter (fvm-pinned, bloc_signals, dio, go_router, Android product flavors), npm workspaces, husky + lint-staged.

## Global Constraints

- Package manager is npm; `apps/backend` and `apps/admin` are linked via npm workspaces. `apps/mobile` is excluded from npm workspaces (managed via `fvm`).
- Node version pinned via `.nvmrc` to the installed LTS release (currently `20.19.5`).
- Backend folder is named `apps/backend`, never `apps/api` — this must also be fixed in `CLAUDE.md`.
- Branches: `main` (default/integration), `dev` (tracks Firebase project `roomly-sandbox`, number `326356684667`), `prod` (tracks Firebase project `roomly-44953`, number `706854547294`). Branches are created locally only — do not push to any remote in this plan.
- No Docker Compose for local Postgres — deferred by the user. Only `DATABASE_URL` env var wiring.
- Admin uses Tailwind CSS and `output: 'export'` (static export) in `next.config.ts` — no Server Component server-side data fetching, no Next.js API routes.
- Mobile is pinned via `fvm` to the latest stable Flutter release. Only **Android** product flavors are configured (`dev` → `roomly.app.dev`, `prod` → `roomly.app`). iOS flavor configuration is explicitly deferred.
- `flutterfire configure` / `firebase login` are **not** run by this plan — they require interactive browser login the user must perform themselves in a later sub-project.
- Mobile dependencies `bloc_signals`, `dio`, `go_router` are added because they are mandated architecture (per `CLAUDE.md`/`PRD.md`), not features.
- No business feature modules, no Firebase Auth/RBAC guard logic, no design token values — those belong to later sub-projects.
- Every app must independently build, lint, and test before moving to the next task.

---

## File Structure

```text
roomly/
├── .gitignore                         # modified (Task 1)
├── .editorconfig                      # new (Task 1)
├── .nvmrc                              # new (Task 1)
├── package.json                        # new (Task 6) — npm workspaces root
├── .lintstagedrc.js                    # new (Task 11)
├── .husky/pre-commit                   # new (Task 11)
├── scripts/
│   └── format-mobile-staged.js        # new (Task 11)
├── CLAUDE.md                           # modified (Task 10)
├── apps/
│   ├── backend/                        # new (Tasks 2-3) — NestJS
│   │   ├── src/
│   │   │   ├── core/{auth,database,errors,config}/.gitkeep
│   │   │   ├── modules/.gitkeep
│   │   │   ├── app.controller.ts
│   │   │   ├── app.controller.spec.ts
│   │   │   ├── app.service.ts
│   │   │   ├── app.module.ts
│   │   │   ├── bootstrap.ts
│   │   │   └── main.ts
│   │   ├── test/app.e2e-spec.ts
│   │   ├── prisma/schema.prisma
│   │   └── .env.example
│   ├── admin/                          # new (Tasks 4-5) — Next.js
│   │   ├── src/
│   │   │   ├── app/{page.tsx,page.test.tsx}
│   │   │   ├── core/{auth,http,routing,ui}/.gitkeep
│   │   │   └── features/.gitkeep
│   │   ├── next.config.ts
│   │   ├── jest.config.ts
│   │   ├── jest.setup.ts
│   │   └── .env.example
│   └── mobile/                         # new (Tasks 7-9) — Flutter
│       ├── lib/
│       │   ├── core/{config,error,network,routing,storage,theme,widgets}/.gitkeep
│       │   ├── features/.gitkeep
│       │   ├── core/config/flavor_config.dart
│       │   ├── main_common.dart
│       │   ├── main_dev.dart
│       │   └── main_prod.dart
│       ├── test/{main_dev_test.dart,main_prod_test.dart}
│       └── android/app/build.gradle.kts  # modified (Task 9)
```

---

### Task 1: Commit pending docs and add root baseline tooling files

**Files:**
- Commit as-is: `AGENTS.md`, `CLAUDE.md`, `PRD.md`, `README.md` (already present/fixed in the working tree, just not yet committed)
- Modify: `.gitignore`
- Create: `.editorconfig`
- Create: `.nvmrc`

**Interfaces:**
- Produces: a clean `main` branch with docs committed and ignore/format/version baselines in place, ready for scaffolding commands in later tasks.

- [ ] **Step 1: Commit the pre-existing pending documentation**

These four files already exist in the working tree from before this plan (verify with `git status` — `AGENTS.md`, `CLAUDE.md`, `PRD.md` untracked, `README.md` modified). Commit them unmodified:

```bash
git add AGENTS.md CLAUDE.md PRD.md README.md
git commit -m "docs: add AGENTS.md, CLAUDE.md, PRD.md and fix backend folder name in README"
```

- [ ] **Step 2: Write the root `.gitignore`**

Each scaffolding tool used later (Nest CLI, `create-next-app`, `flutter create`) generates its own nested `.gitignore` covering its framework's build artifacts, so the root file only needs to cover root-level and cross-cutting concerns:

```gitignore
# Root-level dependencies (npm workspaces hoist here)
node_modules/

# Environment variables (all apps)
.env
.env.local
.env.*.local
!.env.example

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/*
!.vscode/extensions.json
.idea/
```

- [ ] **Step 3: Create `.editorconfig`**

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.dart]
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

- [ ] **Step 4: Create `.nvmrc`**

```text
20.19.5
```

- [ ] **Step 5: Verify and commit**

```bash
git status
```

Expected: `.gitignore` modified, `.editorconfig` and `.nvmrc` untracked, nothing else.

```bash
git add .gitignore .editorconfig .nvmrc
git commit -m "chore: add root gitignore, editorconfig, and nvmrc"
```

---

### Task 2: Scaffold the NestJS backend

**Files:**
- Create: `apps/backend/` (entire Nest CLI output)

**Interfaces:**
- Produces: a default Nest CLI app at `apps/backend` with working `npm run build`, `npm run lint`, `npm test`, `npm run test:e2e`.

- [ ] **Step 1: Generate the app**

```bash
mkdir -p apps
cd apps
npx @nestjs/cli new backend --package-manager npm --skip-git
cd ../..
```

- [ ] **Step 2: Verify the default scaffold works**

```bash
cd apps/backend
npm run build
npm test
npm run test:e2e
cd ../..
```

Expected: all three commands exit 0 (default Nest CLI scaffold ships a passing unit test and e2e test against the default `GET /` route).

- [ ] **Step 3: Commit**

```bash
git add apps/backend
git commit -m "feat(backend): scaffold NestJS app via Nest CLI"
```

---

### Task 3: Backend Clean Architecture structure, health endpoint, Prisma, Swagger

**Files:**
- Create: `apps/backend/src/core/auth/.gitkeep`, `apps/backend/src/core/database/.gitkeep`, `apps/backend/src/core/errors/.gitkeep`, `apps/backend/src/core/config/.gitkeep`, `apps/backend/src/modules/.gitkeep`
- Modify: `apps/backend/src/app.controller.ts`
- Modify: `apps/backend/src/app.controller.spec.ts`
- Modify: `apps/backend/src/app.service.ts`
- Create: `apps/backend/src/bootstrap.ts`
- Modify: `apps/backend/src/main.ts`
- Modify: `apps/backend/test/app.e2e-spec.ts`
- Create: `apps/backend/prisma/schema.prisma` (via `prisma init`)
- Create: `apps/backend/.env.example`

**Interfaces:**
- Produces: `configureApp(app: INestApplication): void` exported from `apps/backend/src/bootstrap.ts` — applies the global `/api` prefix, URI versioning (`/v1`), the global `ValidationPipe`, and Swagger setup at `/api/docs`. Both `main.ts` and `test/app.e2e-spec.ts` call this so there is one source of truth for app configuration.
- Produces: `GET /api/v1/health` → `{ status: 'ok' }`.

- [ ] **Step 1: Write the failing unit test for the health check**

Replace the contents of `apps/backend/src/app.controller.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getHealth', () => {
    it('should return status ok', () => {
      expect(appController.getHealth()).toEqual({ status: 'ok' });
    });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd apps/backend
npm test
```

Expected: FAIL — `appController.getHealth is not a function` (method doesn't exist yet).

- [ ] **Step 3: Implement the health check**

Replace `apps/backend/src/app.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): { status: string } {
    return { status: 'ok' };
  }
}
```

Replace `apps/backend/src/app.controller.ts`:

```typescript
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHealth(): { status: string } {
    return this.appService.getHealth();
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npm test
```

Expected: PASS.

- [ ] **Step 5: Install Swagger and validation dependencies**

```bash
npm install @nestjs/swagger swagger-ui-express class-validator class-transformer
```

- [ ] **Step 6: Create the shared app configuration used by both `main.ts` and the e2e test**

Create `apps/backend/src/bootstrap.ts`:

```typescript
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Roomly API')
    .setDescription('Roomly furniture shopping platform API')
    .setVersion('1.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument);
}
```

Replace `apps/backend/src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

- [ ] **Step 7: Write the failing e2e test proving the full route (`/api/v1/health`)**

Replace `apps/backend/test/app.e2e-spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/bootstrap';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/v1/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect({ status: 'ok' });
  });
});
```

- [ ] **Step 8: Run the e2e test to verify it passes**

```bash
npm run test:e2e
```

Expected: PASS — confirms `GET /api/v1/health` returns `200` with `{ status: 'ok' }`.

- [ ] **Step 9: Create the empty Clean Architecture folders**

```bash
mkdir -p src/core/auth src/core/database src/core/errors src/core/config src/modules
touch src/core/auth/.gitkeep src/core/database/.gitkeep src/core/errors/.gitkeep src/core/config/.gitkeep src/modules/.gitkeep
```

- [ ] **Step 10: Initialize Prisma**

```bash
npm install prisma --save-dev
npm install @prisma/client
npx prisma init --datasource-provider postgresql
```

This generates `prisma/schema.prisma` (datasource + generator, no models yet) and a `.env` file.

- [ ] **Step 11: Replace the generated `.env` with `.env.example`**

```bash
rm .env
```

Create `apps/backend/.env.example`:

```text
DATABASE_URL="postgresql://user:password@localhost:5432/roomly_dev?schema=public"
PORT=3000
```

- [ ] **Step 12: Final verification**

```bash
npm run build
npm run lint
npm test
npm run test:e2e
cd ../..
```

Expected: all four commands exit 0.

- [ ] **Step 13: Commit**

```bash
git add apps/backend
git commit -m "feat(backend): add health endpoint, Swagger/versioning/validation, Prisma init, Clean Architecture folders"
```

---

### Task 4: Scaffold the Next.js admin app

**Files:**
- Create: `apps/admin/` (entire `create-next-app` output)

**Interfaces:**
- Produces: a default `create-next-app` app at `apps/admin` (App Router, TypeScript, Tailwind, ESLint, `src/` dir) with working `npm run build` and `npm run lint`.

- [ ] **Step 1: Generate the app**

```bash
cd apps
npx create-next-app@latest admin --typescript --tailwind --app --eslint --src-dir --import-alias "@/*" --use-npm
cd ../..
```

- [ ] **Step 2: Verify the default scaffold works**

```bash
cd apps/admin
npm run lint
npm run build
cd ../..
```

Expected: both commands exit 0.

- [ ] **Step 3: Commit**

```bash
git add apps/admin
git commit -m "feat(admin): scaffold Next.js app via create-next-app"
```

---

### Task 5: Admin Clean Architecture structure, static export, placeholder page, smoke test

**Files:**
- Modify or create: `apps/admin/next.config.ts`
- Create: `apps/admin/jest.config.ts`
- Create: `apps/admin/jest.setup.ts`
- Modify: `apps/admin/src/app/page.tsx`
- Create: `apps/admin/src/app/page.test.tsx`
- Modify: `apps/admin/package.json` (add `test` script)
- Create: `apps/admin/src/core/{auth,http,routing,ui}/.gitkeep`, `apps/admin/src/features/.gitkeep`
- Create: `apps/admin/.env.example`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: `apps/admin` builds as a static export (`next build` with `output: 'export'`) and has a working `npm test` via Jest + React Testing Library.

- [ ] **Step 1: Write the failing smoke test**

Create `apps/admin/src/app/page.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import Home from './page';

describe('Home page', () => {
  it('renders the Roomly admin placeholder heading', () => {
    render(<Home />);
    expect(
      screen.getByRole('heading', { name: /roomly admin/i }),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Install the test dependencies**

```bash
cd apps/admin
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @types/jest
```

- [ ] **Step 3: Configure Jest**

Create `apps/admin/jest.config.ts`:

```typescript
import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};

export default createJestConfig(config);
```

Create `apps/admin/jest.setup.ts`:

```typescript
import '@testing-library/jest-dom';
```

Open `apps/admin/package.json` and add a `test` script to the existing `"scripts"` block:

```json
"test": "jest"
```

- [ ] **Step 4: Run the test to verify it fails**

```bash
npm test
```

Expected: FAIL — the default `create-next-app` home page doesn't render a "Roomly Admin" heading.

- [ ] **Step 5: Replace the placeholder home page**

Replace `apps/admin/src/app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main>
      <h1>Roomly Admin</h1>
    </main>
  );
}
```

- [ ] **Step 6: Run the test to verify it passes**

```bash
npm test
```

Expected: PASS.

- [ ] **Step 7: Configure static export**

If `create-next-app` generated `apps/admin/next.config.ts`, replace its contents; if it generated `next.config.js` instead, replace that file with the equivalent (delete the `.js` one and create `.ts`, since this plan standardizes on TypeScript config):

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
};

export default nextConfig;
```

- [ ] **Step 8: Verify the static export build**

```bash
npm run build
```

Expected: exits 0 and produces an `out/` directory (static export output).

- [ ] **Step 9: Create the Clean Architecture folders**

```bash
mkdir -p src/core/auth src/core/http src/core/routing src/core/ui src/features
touch src/core/auth/.gitkeep src/core/http/.gitkeep src/core/routing/.gitkeep src/core/ui/.gitkeep src/features/.gitkeep
```

- [ ] **Step 10: Create `.env.example`**

```text
# Copy to .env.development / .env.production and fill in per environment.
# dev -> Firebase project roomly-sandbox, prod -> Firebase project roomly-44953
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_API_BASE_URL=
```

- [ ] **Step 11: Final verification**

```bash
npm run lint
npm test
npm run build
cd ../..
```

Expected: all three commands exit 0.

- [ ] **Step 12: Commit**

```bash
git add apps/admin
git commit -m "feat(admin): static export config, placeholder page, Jest smoke test, Clean Architecture folders"
```

---

### Task 6: Root npm workspaces

**Files:**
- Create: `package.json` (repo root)

**Interfaces:**
- Consumes: `apps/backend` and `apps/admin` must already have their own `package.json` (Tasks 2–5).
- Produces: root-level `npm install`, `npm run lint`, `npm test`, `npm run build` that fan out to both workspaces.

- [ ] **Step 1: Create the root `package.json`**

```json
{
  "name": "roomly",
  "private": true,
  "workspaces": [
    "apps/backend",
    "apps/admin"
  ],
  "scripts": {
    "lint": "npm run lint --workspace=apps/backend && npm run lint --workspace=apps/admin",
    "test": "npm test --workspace=apps/backend && npm test --workspace=apps/admin",
    "build": "npm run build --workspace=apps/backend && npm run build --workspace=apps/admin"
  }
}
```

- [ ] **Step 2: Remove the now-redundant per-app lockfiles**

npm workspaces use a single lockfile at the root; the nested lockfiles from Tasks 2 and 4 would otherwise sit alongside it unused and out of date.

```bash
rm apps/backend/package-lock.json apps/admin/package-lock.json
```

- [ ] **Step 3: Verify the workspace links and scripts**

```bash
npm install
npm run lint
npm test
npm run build
```

Expected: `npm install` completes with both workspaces linked (no "workspace not found" warnings), regenerates a single root `package-lock.json` covering both workspaces, and all three aggregate scripts exit 0.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json apps/backend/package-lock.json apps/admin/package-lock.json
git commit -m "chore: wire apps/backend and apps/admin into npm workspaces, consolidate to a single root lockfile"
```

---

### Task 7: Scaffold the Flutter mobile app via fvm

**Files:**
- Create: `apps/mobile/` (entire `flutter create` output)

**Interfaces:**
- Produces: a default Flutter project at `apps/mobile`, pinned to the latest stable release via `fvm`, with working `fvm flutter analyze` and `fvm flutter test`.

- [ ] **Step 1: Install and pin the latest stable Flutter release**

```bash
fvm install stable
fvm global stable
```

- [ ] **Step 2: Generate the app**

```bash
fvm flutter create --org roomly --project-name roomly_mobile --platforms android,ios apps/mobile
```

- [ ] **Step 3: Pin the project locally to the stable version**

```bash
cd apps/mobile
fvm use stable
cd ../..
```

Expected: this writes `apps/mobile/.fvmrc` with the resolved concrete version number.

- [ ] **Step 4: Verify the default scaffold works**

```bash
cd apps/mobile
fvm flutter pub get
fvm flutter analyze
fvm flutter test
cd ../..
```

Expected: all three commands exit 0 (default `flutter create` ships a passing counter-app widget test).

- [ ] **Step 5: Commit**

```bash
git add apps/mobile
git commit -m "feat(mobile): scaffold Flutter app via fvm, pinned to latest stable"
```

---

### Task 8: Mobile Clean Architecture structure and mandated dependencies

**Files:**
- Modify: `apps/mobile/pubspec.yaml`
- Create: `apps/mobile/lib/core/{config,error,network,routing,storage,theme,widgets}/.gitkeep`, `apps/mobile/lib/features/.gitkeep`

**Interfaces:**
- Produces: `bloc_signals`, `dio`, `go_router` available as dependencies for later feature work (not used yet in this plan).

- [ ] **Step 1: Add the mandated dependencies**

```bash
cd apps/mobile
fvm flutter pub add bloc_signals dio go_router
cd ../..
```

- [ ] **Step 2: Create the Clean Architecture folders**

```bash
cd apps/mobile
mkdir -p lib/core/config lib/core/error lib/core/network lib/core/routing lib/core/storage lib/core/theme lib/core/widgets lib/features
touch lib/core/config/.gitkeep lib/core/error/.gitkeep lib/core/network/.gitkeep lib/core/routing/.gitkeep lib/core/storage/.gitkeep lib/core/theme/.gitkeep lib/core/widgets/.gitkeep lib/features/.gitkeep
cd ../..
```

- [ ] **Step 3: Verify**

```bash
cd apps/mobile
fvm flutter pub get
fvm flutter analyze
cd ../..
```

Expected: both commands exit 0.

- [ ] **Step 4: Commit**

```bash
git add apps/mobile
git commit -m "feat(mobile): add Clean Architecture folders and mandated dependencies (bloc_signals, dio, go_router)"
```

---

### Task 9: Android product flavors, flavor-aware entry points, placeholder screen

**Files:**
- Modify: `apps/mobile/android/app/build.gradle.kts`
- Create: `apps/mobile/lib/core/config/flavor_config.dart`
- Create: `apps/mobile/lib/main_common.dart`
- Create: `apps/mobile/lib/main_dev.dart`
- Create: `apps/mobile/lib/main_prod.dart`
- Delete: `apps/mobile/lib/main.dart`
- Delete: `apps/mobile/test/widget_test.dart`
- Create: `apps/mobile/test/main_dev_test.dart`
- Create: `apps/mobile/test/main_prod_test.dart`

**Interfaces:**
- Produces: `FlavorConfig` (`lib/core/config/flavor_config.dart`) — `FlavorConfig.initialize({required Flavor flavor})`, `FlavorConfig.isDev`, `FlavorConfig.isProd`.
- Produces: `RoomlyApp` widget and `runMainApp()` (`lib/main_common.dart`), used by both flavor entry points and both flavor tests.

- [ ] **Step 1: Write the failing flavor-aware widget tests**

Delete the default counter-app test:

```bash
rm apps/mobile/test/widget_test.dart
```

Create `apps/mobile/test/main_dev_test.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:roomly_mobile/core/config/flavor_config.dart';
import 'package:roomly_mobile/main_common.dart';

void main() {
  testWidgets('dev flavor renders the Roomly placeholder home screen', (
    tester,
  ) async {
    FlavorConfig.initialize(flavor: Flavor.dev);

    await tester.pumpWidget(const RoomlyApp());

    expect(find.byKey(const Key('home-placeholder-title')), findsOneWidget);
    expect(find.text('Roomly'), findsOneWidget);
  });
}
```

Create `apps/mobile/test/main_prod_test.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:roomly_mobile/core/config/flavor_config.dart';
import 'package:roomly_mobile/main_common.dart';

void main() {
  testWidgets('prod flavor renders the Roomly placeholder home screen', (
    tester,
  ) async {
    FlavorConfig.initialize(flavor: Flavor.prod);

    await tester.pumpWidget(const RoomlyApp());

    expect(find.byKey(const Key('home-placeholder-title')), findsOneWidget);
    expect(find.text('Roomly'), findsOneWidget);
  });
}
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
cd apps/mobile
fvm flutter test
cd ../..
```

Expected: FAIL — `package:roomly_mobile/core/config/flavor_config.dart` and `package:roomly_mobile/main_common.dart` don't exist yet.

- [ ] **Step 3: Implement `FlavorConfig`**

Create `apps/mobile/lib/core/config/flavor_config.dart`:

```dart
enum Flavor { dev, prod }

class FlavorConfig {
  final Flavor flavor;

  static FlavorConfig? _instance;

  FlavorConfig._internal(this.flavor);

  static void initialize({required Flavor flavor}) {
    _instance ??= FlavorConfig._internal(flavor);
  }

  static FlavorConfig get instance {
    final config = _instance;
    if (config == null) {
      throw StateError('FlavorConfig has not been initialized.');
    }
    return config;
  }

  static bool get isDev => instance.flavor == Flavor.dev;
  static bool get isProd => instance.flavor == Flavor.prod;
}
```

- [ ] **Step 4: Implement the shared app widget**

Create `apps/mobile/lib/main_common.dart`:

```dart
import 'package:flutter/material.dart';

import 'core/config/flavor_config.dart';

void runMainApp() {
  runApp(const RoomlyApp());
}

class RoomlyApp extends StatelessWidget {
  const RoomlyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: FlavorConfig.isDev ? 'Roomly Dev' : 'Roomly',
      home: const HomePlaceholderScreen(),
    );
  }
}

class HomePlaceholderScreen extends StatelessWidget {
  const HomePlaceholderScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Text('Roomly', key: const Key('home-placeholder-title')),
      ),
    );
  }
}
```

- [ ] **Step 5: Run the tests to verify they pass**

```bash
cd apps/mobile
fvm flutter test
cd ../..
```

Expected: PASS (both `main_dev_test.dart` and `main_prod_test.dart`).

- [ ] **Step 6: Create the flavor entry points and delete the default `main.dart`**

```bash
rm apps/mobile/lib/main.dart
```

Create `apps/mobile/lib/main_dev.dart`:

```dart
import 'core/config/flavor_config.dart';
import 'main_common.dart';

void main() {
  FlavorConfig.initialize(flavor: Flavor.dev);
  runMainApp();
}
```

Create `apps/mobile/lib/main_prod.dart`:

```dart
import 'core/config/flavor_config.dart';
import 'main_common.dart';

void main() {
  FlavorConfig.initialize(flavor: Flavor.prod);
  runMainApp();
}
```

- [ ] **Step 7: Configure Android product flavors**

Open `apps/mobile/android/app/build.gradle.kts`. Inside the `android { ... }` block, immediately after the closing brace of the existing `defaultConfig { ... }` block, insert:

```kotlin
    flavorDimensions += "environment"
    productFlavors {
        create("dev") {
            dimension = "environment"
            applicationId = "roomly.app.dev"
            resValue("string", "app_name", "Roomly Dev")
        }
        create("prod") {
            dimension = "environment"
            applicationId = "roomly.app"
            resValue("string", "app_name", "Roomly")
        }
    }
```

If this project generated `android/app/build.gradle` (Groovy) instead of `build.gradle.kts`, apply the equivalent Groovy syntax:

```groovy
    flavorDimensions "environment"
    productFlavors {
        dev {
            dimension "environment"
            applicationId "roomly.app.dev"
            resValue "string", "app_name", "Roomly Dev"
        }
        prod {
            dimension "environment"
            applicationId "roomly.app"
            resValue "string", "app_name", "Roomly"
        }
    }
```

- [ ] **Step 8: Verify analyze and tests still pass**

```bash
cd apps/mobile
fvm flutter analyze
fvm flutter test
cd ../..
```

Expected: both exit 0. (`flutter analyze`/`flutter test` don't take a `--flavor` flag — flavors are an Android build-time concept — so flavor coverage here comes from the two dedicated test files exercising `Flavor.dev` and `Flavor.prod` respectively, per the Global Constraints.)

- [ ] **Step 9: Commit**

```bash
git add apps/mobile
git commit -m "feat(mobile): Android dev/prod flavors, flavor-aware entry points, placeholder home screen"
```

---

### Task 10: Fix the `apps/api` reference in CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Find and fix the stray reference**

In `CLAUDE.md`, under "Project Overview", change:

```markdown
- `apps/api`: NestJS REST API
```

to:

```markdown
- `apps/backend`: NestJS REST API
```

- [ ] **Step 2: Verify no other stray references remain**

```bash
grep -rn "apps/api" --include="*.md" .
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: fix apps/api reference to apps/backend in CLAUDE.md"
```

---

### Task 11: Root husky + lint-staged across all three apps

**Files:**
- Create: `scripts/format-mobile-staged.js`
- Create: `.lintstagedrc.js`
- Create: `.husky/pre-commit`
- Modify: root `package.json` (add `husky`/`lint-staged` devDependencies, `prepare` script)

**Interfaces:**
- Consumes: `apps/backend` and `apps/admin` ESLint/Prettier configs (from Nest CLI / `create-next-app` defaults), `apps/mobile`'s `fvm`-pinned `dart format` (Task 7).

- [ ] **Step 1: Install husky and lint-staged at the root**

```bash
npm install --save-dev husky lint-staged
npx husky init
```

Expected: this creates `.husky/pre-commit` (with a default `npm test` body) and adds a `"prepare": "husky"` script to the root `package.json`.

- [ ] **Step 2: Create the mobile formatting helper script**

`fvm` resolves the pinned Flutter/Dart version from the nearest `.fvmrc` walking up from the current working directory, so formatting staged `.dart` files from the repo root requires explicitly running the command with `apps/mobile` as the working directory. Create `scripts/format-mobile-staged.js`:

```javascript
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const mobileDir = path.join(__dirname, '..', 'apps', 'mobile');
const files = process.argv
  .slice(2)
  .map((file) => path.relative(mobileDir, file));

if (files.length > 0) {
  execFileSync('fvm', ['dart', 'format', ...files], {
    cwd: mobileDir,
    stdio: 'inherit',
  });
}
```

- [ ] **Step 3: Configure lint-staged**

Create `.lintstagedrc.js`:

```javascript
module.exports = {
  'apps/backend/**/*.{ts,js}': ['eslint --fix', 'prettier --write'],
  'apps/admin/**/*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],
  'apps/mobile/**/*.dart': (filenames) =>
    `node scripts/format-mobile-staged.js ${filenames.join(' ')}`,
};
```

- [ ] **Step 4: Point the pre-commit hook at lint-staged**

Replace the contents of `.husky/pre-commit`:

```sh
npx lint-staged
```

- [ ] **Step 5: Verify the hook runs across all three apps**

Make a trivial, real change in each app and commit it through the hook:

```bash
echo "" >> apps/backend/src/app.service.ts
echo "" >> apps/admin/src/app/page.tsx
echo "" >> apps/mobile/lib/main_common.dart
git add apps/backend/src/app.service.ts apps/admin/src/app/page.tsx apps/mobile/lib/main_common.dart .lintstagedrc.js .husky/pre-commit scripts/format-mobile-staged.js package.json package-lock.json
git commit -m "chore: add husky + lint-staged pre-commit hook for backend, admin, and mobile"
```

Expected: the commit output shows `lint-staged` running ESLint/Prettier on the staged backend and admin files and `format-mobile-staged.js` invoking `fvm dart format` on the staged mobile file, and the commit succeeds.

---

### Task 12: Create local `dev` and `prod` branches

**Files:** none (git branches only)

- [ ] **Step 1: Create the branches from the current `main` tip**

```bash
git branch dev
git branch prod
```

- [ ] **Step 2: Verify**

```bash
git branch --list
```

Expected: `main`, `dev`, and `prod` all listed, all pointing at the same commit (`git log -1 --oneline main dev prod` shows identical hashes). These branches are local only — pushing them to a remote and wiring up deploy targets happens in the Firebase Setup and CI/CD sub-projects.

---

## Definition of Done

- [ ] `npm install` from the repo root installs both `apps/backend` and `apps/admin`.
- [ ] `npm run lint` and `npm test` succeed for both `apps/backend` and `apps/admin` (via root scripts).
- [ ] `fvm flutter pub get`, `fvm flutter analyze`, and `fvm flutter test` succeed for `apps/mobile`.
- [ ] `apps/backend` boots and `GET /api/v1/health` returns `200` with `{ status: 'ok' }` (proven by the e2e test).
- [ ] `apps/admin` builds successfully with `next build` (static export) and the smoke test passes.
- [ ] The pre-commit hook runs lint-staged across a staged change in each of the three apps.
- [ ] `main`, `dev`, and `prod` branches exist locally.
- [ ] `CLAUDE.md`'s `apps/api` reference is corrected to `apps/backend`.
