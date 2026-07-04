# Production Infrastructure

This folder contains the production-oriented Docker assets for Caltrek.

## Images

- `infra/docker/api.Dockerfile` builds the Spring Boot API image.
- `infra/docker/web.Dockerfile` builds the Next.js standalone web image.
- `infra/docker/migrations.Dockerfile` packages the Flyway SQL migrations.

Build all Docker Hub images with:

```bash
docker compose --env-file infra/prod.env -f infra/compose.prod.yml build
```

Push the images after setting `DOCKERHUB_NAMESPACE` and `CALTREK_IMAGE_TAG`:

```bash
docker compose --env-file infra/prod.env -f infra/compose.prod.yml push
```

## Runtime

Create a private env file from the example:

```bash
cp infra/prod.env.example infra/prod.env
```

Edit `infra/prod.env` with real secrets, your Docker Hub namespace, and public URL.

For the Nginx runtime stack, keep `NEXT_PUBLIC_API_BASE_URL` empty when building the web image.
That bakes same-origin API calls into the frontend, so browser requests go to `/api/...` on the
same address that serves the web app.

Start the production runtime stack with:

```bash
docker compose --env-file infra/prod.env -f infra/compose.runtime.yml up -d
```

Only Nginx is published to the host. It routes `/` to the web container and `/api/` to the API
container.

For local smoke testing the build compose directly, use:

```bash
docker compose --env-file infra/prod.env -f infra/compose.prod.yml up -d
```

The `migrations` service runs once and must complete before the API starts. The web image bakes
`NEXT_PUBLIC_API_BASE_URL` at build time, so rebuild and republish the web image if you change from
same-origin API calls to a separate public API origin.
