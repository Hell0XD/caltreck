# caltrek

caltrek is a calorie tracker for searching foods, scanning barcodes, and logging daily calories and macros. It's built for mobile browsers, with offline support.

## Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Vaul, Framer Motion.
- Backend: Java 25, Spring Boot 3.x, WebFlux, Spring Data R2DBC, PostgreSQL.
- Integrations: device camera barcode scanning and OpenFoodFacts.
- Tooling: pnpm workspaces, Gradle Kotlin DSL, Docker Compose.

## Structure

```text
apps/
  web/      Next.js frontend
  api/      Spring Boot API
packages/
  config/        Shared frontend tooling config
infra/
  postgres/migrations/  Database migrations
```

## Prerequisites

- Node.js 24+ with Corepack enabled.
- pnpm 10.x through Corepack.
- JDK 25.
- Docker Desktop or a compatible Docker runtime.

## Setup

```bash
corepack enable
corepack prepare pnpm@10.11.0 --activate
pnpm install
docker compose up -d postgres
```

## Database Migrations

Flyway runs the database migrations in `infra/postgres/migrations`.

Name migration files using this format:

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

Keep `flyway-database-postgresql` in Gradle's `flywayDatabase` configuration when
upgrading Flyway. Without it, migrations can fail with
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

With the backend running:

- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

Regenerate `@caltrek/api-client` after changing the API:

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
