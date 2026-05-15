# UbuntuCode API

Cloudflare Worker API for `api.ubuntucode.com`, built with Hono, Chanfana, generated OpenAPI documentation, D1, and Vitest integration tests.

## Public Endpoints

- `GET /health` returns service health.
- `GET /admin` serves the browser admin console.
- `GET /` serves Swagger/OpenAPI documentation.
- `GET /openapi.json` serves the generated OpenAPI schema.
- `GET /projects` lists projects.
- `GET /projects/:slug` reads one project.
- `GET /articles` lists articles.
- `GET /articles/:slug` reads one article.
- `GET /users` lists users.
- `GET /users/:id` reads one user.

## Protected Endpoints

Protected routes require the `x-api-key` header.

- `POST /users`
- `PATCH /users/:id`
- `DELETE /users/:id`
- `POST /projects`
- `PATCH /projects/:slug`
- `DELETE /projects/:slug`
- `POST /articles`
- `PATCH /articles/:slug`
- `DELETE /articles/:slug`
- `GET /webhooks/events`
- `GET /webhooks/events/:id`
- `POST /webhooks/events`
- `POST /ai/assist`

## Admin Console

Open:

```text
https://api.ubuntucode.com/admin
```

The browser will ask for HTTP Basic Auth credentials:

- username: `admin`
- password: your production `API_KEY` secret

Inside the panel, paste the same API key in the sidebar so create, update, delete, webhook audit, and AI actions can call the protected API routes.

## Local Setup

Create `.dev.vars` for local development:

```ini
API_KEY=local-dev-key
```

Then run:

```bash
npm install
npm run seedLocalDb
npm run dev
```

## Cloudflare Setup

Set the production secret before deploying protected routes:

```bash
npx wrangler secret put API_KEY
```

The Worker uses:

- Worker name: `chanfana-openapi-template`
- Custom domain: `api.ubuntucode.com`
- D1 database: `openapi-template-db`
- D1 id: `c1648412-5ed9-48ff-bfbc-9b6bdc61ed5b`

## Deployment

The Cloudflare Git integration runs:

```bash
npm run deploy
```

That command applies remote D1 migrations and deploys the Worker.

## Validation

```bash
npm audit --omit=dev
npm run test
npm run check
```

## Domain Model

The API stores:

- users
- projects
- articles
- webhook events

The `POST /ai/assist` endpoint is already shaped for AI workflows. It returns a fallback response when no AI provider binding is configured, so the route remains stable while the provider is plugged in later.
