# UbuntuCode API

Cloudflare Worker API for `api.ubuntucode.com`, built with Hono, Chanfana, generated OpenAPI documentation, D1, and Vitest integration tests.

## Public Endpoints

- `GET /health` returns service health.
- `GET /admin` serves the browser admin console.
- `GET /` serves the public UbuntuCode website.
- `GET /projetos` lists public active projects.
- `GET /projetos/:slug` shows one public project.
- `GET /blog` lists public published articles.
- `GET /blog/:slug` shows one public article.
- `GET /contato` serves the public contact form.
- `GET /sitemap.xml`, `GET /robots.txt`, and `GET /rss.xml` serve SEO/discovery files.
- `GET /site` keeps the legacy public website alias.
- `GET /site/projects` lists public active projects.
- `GET /site/projects/:slug` shows one public project.
- `GET /site/articles` lists public published articles.
- `GET /site/articles/:slug` shows one public article.
- `GET /docs` serves Swagger/OpenAPI documentation.
- `GET /openapi.json` serves the generated OpenAPI schema.
- `GET /projects` lists projects.
- `GET /projects/:slug` reads one project.
- `GET /articles` lists articles.
- `GET /articles/:slug` reads one article.
- `POST /leads` stores a public contact lead.
- `POST /newsletter` subscribes an email to the newsletter.
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
- `GET /ai/history`
- `GET /ai/drafts`
- `POST /ai/drafts`
- `GET /leads`
- `POST /assets/upload`

## Admin Console

Open:

```text
https://api.ubuntucode.com/admin
```

The panel shows its own login screen. Prefer a dedicated admin password:

```bash
npx wrangler secret put ADMIN_PASSWORD
```

If `ADMIN_PASSWORD` is not configured, the panel falls back to:

- password: your production `API_KEY` secret

After login, the Worker sets a short-lived `HttpOnly` admin session cookie. The panel can call protected API routes without typing the key again.

The admin can manage projects, articles, members, admin users, leads, webhooks, and AI workflows. It starts on an operational dashboard with recent leads and AI usage. Articles and projects support cover image URLs, tags, SEO title, and SEO description. Article AI tools can suggest titles, excerpts, improved text, tags, full drafts, SEO metadata, LinkedIn posts, and tone rewrites.

When `ADMIN_PASSWORD` is configured, the Worker bootstraps the first admin user as `admin@ubuntucode.com` with a PBKDF2 password hash in D1. The old password-only login remains as a fallback while no dedicated admin user is present.

To create more panel logins, open **Admin > Admins** and create a user with email, name, password, and role. These users are stored in `admin_users` with PBKDF2 password hashes and can log in at `/admin/login`.

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
- Public site origin: `https://ubuntucode.com`
- D1 database: `openapi-template-db`
- D1 id: `c1648412-5ed9-48ff-bfbc-9b6bdc61ed5b`

Optional asset uploads use an `ASSETS` R2 binding. Without that binding, the upload endpoint returns a clear `503` and the admin can still use external image URLs.

Public lead/newsletter/webhook/AI traffic is rate limited through D1. CORS is restricted to UbuntuCode and local development origins.

### Public domain and analytics

The Worker config includes custom domains for:

- `api.ubuntucode.com`
- `ubuntucode.com`
- `www.ubuntucode.com`

Canonical URLs use the `PUBLIC_SITE_ORIGIN` variable. Production defaults to:

```ini
PUBLIC_SITE_ORIGIN=https://ubuntucode.com
```

To enable Cloudflare Web Analytics, set the token in `WEB_ANALYTICS_TOKEN`. When empty, the analytics script is not rendered.

### R2 assets

Create the R2 bucket once in the Cloudflare account:

```bash
npx wrangler r2 bucket create ubuntucode-assets
```

The Worker config binds it as `env.ASSETS`. After that, the admin image upload button stores images in R2 and writes the public `/assets/uploads/...` URL into the cover image field.

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

- members (`users` table/API)
- projects
- articles
- webhook events

## Webhooks

Webhooks are a technical inbox for events sent by other services. They are useful when another system needs to notify UbuntuCode automatically, for example:

- GitHub sends a `push` event after a repository update.
- Stripe or Mercado Pago sends a payment event.
- A no-code form tool sends a new lead.
- Another automation sends a deploy, backup, or job completion event.

For now, webhooks are stored in `webhook_events` for audit/history. Later they can trigger actions, such as creating leads, notifying Slack/email, starting AI summaries, or updating project status.

The `POST /ai/assist` and `POST /ai/articles` endpoints use the Cloudflare Workers AI binding in production with `@cf/meta/llama-3.1-8b-instruct`. In local/test environments without an AI binding, they return fallback responses so development stays fast and offline-friendly.

The admin article editor includes AI actions for title suggestions, summary generation, text improvement, and tag suggestions.
