# UbuntuCode API

Cloudflare Worker API for `api.ubuntucode.com`, built with Hono, Chanfana, generated OpenAPI documentation, D1, and Vitest integration tests.

## Endpoints

- `GET /health` returns the service health status.
- `GET /` serves the OpenAPI documentation UI.
- `GET /openapi.json` serves the generated OpenAPI schema.
- `POST /dummy/:slug` is a typed example endpoint.
- `/tasks` exposes the D1-backed task CRUD example.

## Local Setup

```bash
npm install
npm run seedLocalDb
npm run dev
```

## Validation

```bash
npm audit --omit=dev
npm run test
```

## Cloudflare Setup

Before the first deploy, authenticate Wrangler and create the production D1 database:

```bash
npx wrangler login
npx wrangler d1 create api-ubuntucode-db
```

Copy the generated `database_id` into `wrangler.jsonc`, replacing `00000000-0000-0000-0000-000000000000`.

Then apply migrations and deploy:

```bash
npx wrangler d1 migrations apply DB --remote
npm run deploy
```

The Worker is configured to publish on the custom domain `api.ubuntucode.com`. The zone for `ubuntucode.com` must be active in the same Cloudflare account used by Wrangler.
