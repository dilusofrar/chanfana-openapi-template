import { ApiException, fromHono } from "chanfana";
import { Hono } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";
import {
	ArticleCreate,
	ArticleDelete,
	ArticleList,
	ArticleRead,
	ArticleUpdate,
} from "./endpoints/articles";
import { AiAssist, AiHistoryList, ArticleAiAssist } from "./endpoints/ai";
import { AssetUpload } from "./endpoints/assets";
import { LeadCreate, LeadList, NewsletterSubscribe } from "./endpoints/leads";
import {
	ProjectCreate,
	ProjectDelete,
	ProjectList,
	ProjectRead,
	ProjectUpdate,
} from "./endpoints/projects";
import {
	UserCreate,
	UserDelete,
	UserList,
	UserRead,
	UserUpdate,
} from "./endpoints/users";
import { WebhookList, WebhookRead, WebhookReceive } from "./endpoints/webhooks";
import type { AppEnv } from "./bindings";
import { adminHtml, adminLoginHtml } from "./admin";
import { nowIso } from "./db";
import { enforceRateLimit } from "./rateLimit";
import {
	clearAdminSessionCookie,
	createAdminSession,
	hasValidAdminSession,
	requireAdmin,
	setAdminSessionCookie,
	verifyAdminPassword,
} from "./adminAuth";
import {
	renderArticle,
	renderArticles,
	renderContact,
	renderHome,
	renderProject,
	renderProjects,
	renderRobots,
	renderRss,
	renderSitemap,
} from "./publicSite";

// Start a Hono app
const app = new Hono<{ Bindings: AppEnv }>();

app.use("*", async (c, next) => {
	const startedAt = Date.now();
	const requestId = crypto.randomUUID();
	c.header("x-request-id", requestId);
	const origin = c.req.header("Origin");
	const allowedOrigins = new Set([
		"https://api.ubuntucode.com",
		"https://ubuntucode.com",
		"http://localhost:8787",
		"http://127.0.0.1:8787",
	]);
	if (origin && allowedOrigins.has(origin)) {
		c.header("Access-Control-Allow-Origin", origin);
		c.header("Vary", "Origin");
	}
	c.header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
	c.header("Access-Control-Allow-Headers", "Content-Type,x-api-key,Authorization");
	if (c.req.method === "OPTIONS") return c.body(null, 204);

	try {
		await next();
	} finally {
		console.log(
			JSON.stringify({
				event: "request",
				requestId,
				method: c.req.method,
				path: c.req.path,
				status: c.res.status,
				durationMs: Date.now() - startedAt,
			}),
		);
	}
});

app.get("/health", (c) =>
	c.json({
		success: true,
		result: {
			service: "api-ubuntucode",
			status: "ok",
		},
	}),
);

app.get("/admin", async (c) => {
	const unauthorized = await requireAdmin(c);
	if (unauthorized) return unauthorized;

	const session = await createAdminSession(c.env.ADMIN_PASSWORD ?? c.env.API_KEY ?? "");
	setAdminSessionCookie(c, session);

	return c.html(adminHtml);
});

app.get("/admin/login", async (c) => {
	if (await hasValidAdminSession(c)) return c.redirect("/admin", 302);

	return c.html(adminLoginHtml);
});

app.post("/admin/login", async (c) => {
	const form = await c.req.raw.formData();
	const password = String(form.get("password") ?? "");

	if (!verifyAdminPassword(c, password)) {
		return c.redirect("/admin/login?error=1", 302);
	}

	const session = await createAdminSession(c.env.ADMIN_PASSWORD ?? c.env.API_KEY ?? "");
	setAdminSessionCookie(c, session);

	return c.redirect("/admin", 302);
});

app.post("/admin/logout", (c) => {
	clearAdminSessionCookie(c);

	return c.redirect("/admin/login", 302);
});

app.get("/", renderHome);
app.get("/projetos", renderProjects);
app.get("/projetos/:slug", renderProject);
app.get("/blog", renderArticles);
app.get("/blog/:slug", renderArticle);
app.get("/contato", renderContact);
app.post("/contato", async (c) => {
	const limited = await enforceRateLimit(c, {
		name: "contact-form",
		limit: 5,
		windowSeconds: 60,
	});
	if (limited) return limited;

	const form = await c.req.raw.formData();
	await c.env.DB.prepare(
		"INSERT INTO leads (name, email, message, source, created_at) VALUES (?, ?, ?, ?, ?)",
	)
		.bind(
			String(form.get("name") ?? ""),
			String(form.get("email") ?? ""),
			String(form.get("message") ?? ""),
			String(form.get("source") ?? "contact-page"),
			nowIso(),
		)
		.run();

	return c.redirect("/contato?sent=1", 303);
});
app.get("/sitemap.xml", renderSitemap);
app.get("/robots.txt", renderRobots);
app.get("/rss.xml", renderRss);
app.get("/site", renderHome);
app.get("/site/projects", renderProjects);
app.get("/site/projects/:slug", renderProject);
app.get("/site/articles", renderArticles);
app.get("/site/articles/:slug", renderArticle);
app.get("/assets/*", async (c) => {
	if (!c.env.ASSETS) return c.notFound();

	const key = c.req.path.replace(/^\/assets\//, "");
	const object = await c.env.ASSETS.get(key);
	if (!object) return c.notFound();

	const headers = new Headers();
	object.writeHttpMetadata(headers);
	headers.set("etag", object.httpEtag);

	return new Response(object.body, { headers });
});

app.onError((err, c) => {
	if (err instanceof ApiException) {
		// If it's a Chanfana ApiException, let Chanfana handle the response
		return c.json(
			{ success: false, errors: err.buildResponse() },
			err.status as ContentfulStatusCode,
		);
	}

	console.error("Global error handler caught:", err); // Log the error if it's not known

	// For other errors, return a generic 500 response
	return c.json(
		{
			success: false,
			errors: [{ code: 7000, message: "Internal Server Error" }],
		},
		500,
	);
});

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/docs",
	schema: {
		info: {
			title: "UbuntuCode API",
			version: "2.0.0",
			description:
				"Backend API for UbuntuCode projects, articles, webhooks, users, and AI workflows.",
		},
	},
});

openapi.get("/users", UserList);
openapi.post("/users", UserCreate);
openapi.get("/users/:id", UserRead);
openapi.patch("/users/:id", UserUpdate);
openapi.delete("/users/:id", UserDelete);
openapi.get("/projects", ProjectList);
openapi.post("/projects", ProjectCreate);
openapi.get("/projects/:slug", ProjectRead);
openapi.patch("/projects/:slug", ProjectUpdate);
openapi.delete("/projects/:slug", ProjectDelete);
openapi.get("/articles", ArticleList);
openapi.post("/articles", ArticleCreate);
openapi.get("/articles/:slug", ArticleRead);
openapi.patch("/articles/:slug", ArticleUpdate);
openapi.delete("/articles/:slug", ArticleDelete);
openapi.get("/webhooks/events", WebhookList);
openapi.post("/webhooks/events", WebhookReceive);
openapi.get("/webhooks/events/:id", WebhookRead);
openapi.post("/ai/assist", AiAssist);
openapi.post("/ai/articles", ArticleAiAssist);
openapi.get("/ai/history", AiHistoryList);
openapi.get("/leads", LeadList);
openapi.post("/leads", LeadCreate);
openapi.post("/newsletter", NewsletterSubscribe);
openapi.post("/assets/upload", AssetUpload);

// Export the Hono app
export default app;
