# UbuntuCode API

Cloudflare Worker API for `api.ubuntucode.com`, built with Hono, Chanfana, generated OpenAPI documentation, D1, and Vitest integration tests.

## Public Endpoints

- `GET /health` returns service health.
- `GET /admin` serves the browser admin console.
- `GET /site` serves the public UbuntuCode website.
- `GET /site/projects` lists public active projects.
- `GET /site/projects/:slug` shows one public project.
- `GET /site/articles` lists public published articles.
- `GET /site/articles/:slug` shows one public article.
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
- `POST /ai/articles`

## Admin Console

Open:

```text
https://api.ubuntucode.com/admin
```

The panel shows its own login screen. Use:

- password: your production `API_KEY` secret

After login, the Worker sets a short-lived `HttpOnly` admin session cookie. The panel can call protected API routes without typing the key again.

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

The `POST /ai/assist` and `POST /ai/articles` endpoints use the Cloudflare Workers AI binding in production with `@cf/meta/llama-3.1-8b-instruct`. In local/test environments without an AI binding, they return fallback responses so development stays fast and offline-friendly.

The admin article editor includes AI actions for title suggestions, summary generation, text improvement, and tag suggestions.
