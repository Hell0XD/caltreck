# caltrek

caltrek is a mobile-first calorie tracking PWA for fast food search, barcode scanning, daily macro logging, and offline-aware use.

This repository is named `caltrek` and is structured as a monorepo.

## Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Vaul, Framer Motion.
- Backend: Java 25, Spring Boot 3.x, WebFlux, Spring Data R2DBC, PostgreSQL.
- Integrations: device camera barcode scanning, Nutridatabaze.cz, OpenFoodFacts.
- Tooling: pnpm workspaces, Gradle Kotlin DSL, Docker Compose.

## Structure

```text
apps/
  web/      Next.js PWA shell
  api/      Spring Boot WebFlux API shell
packages/
  shared-types/  Shared TypeScript contracts
  config/        Shared frontend tooling config
infra/
  postgres/migrations/  Database migrations
docs/       Source-of-truth planning documents
```

## Prerequisites

- Node.js 24+ with Corepack enabled.
- pnpm 10.x through Corepack.
- JDK 25.
- Docker Desktop or a compatible Docker runtime.

The current scaffold intentionally does not vendor dependencies. Install them after prerequisites are available.

## Setup

```bash
corepack enable
corepack prepare pnpm@10.11.0 --activate
pnpm install
docker compose up -d postgres
```

## Database Migrations

Database migrations are managed by Flyway and live in `infra/postgres/migrations`.

Migration files must use Flyway naming:

```text
V<version>__<description>.sql
```

Example:

```text
V1__init_schema.sql
```

Run migrations after PostgreSQL is up:

```bash
cd apps/api
gradle flywayMigrate
```

The Gradle Flyway task uses the `flywayDatabase` configuration for PostgreSQL support. In Kotlin
DSL this is declared with `add("flywayDatabase", "...")`. Keep `flyway-database-postgresql` there
when upgrading Flyway, otherwise Flyway can fail with
`No Flyway database plugin found to handle jdbc:postgresql://...`.

Flyway defaults to the local Docker database:

```text
FLYWAY_URL=jdbc:postgresql://localhost:5432/caltrek
FLYWAY_USER=caltrek
FLYWAY_PASSWORD=caltrek
```

Override those environment variables when targeting another database.

## Development

Frontend:

```bash
pnpm --filter @caltrek/web dev
```

Backend:

```bash
cd apps/api
gradle bootRun
```

OpenAPI and Swagger UI are available after the backend starts:

- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

Generate the `@caltrek/api-client` package from the OpenAPI definition after backend
contract changes:

```bash
pnpm generate:api
```

The script reads `http://localhost:8080/v3/api-docs` by default. Override it with
`CALTREK_OPENAPI_URL` when generating from another environment.

Add a Gradle wrapper once Gradle is available locally:

```bash
cd apps/api
gradle wrapper
```

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm build
```

Backend checks:

```bash
cd apps/api
gradle test
```

## Documentation

Planning documents live in `docs/` and should be updated before changing product scope or architecture.
