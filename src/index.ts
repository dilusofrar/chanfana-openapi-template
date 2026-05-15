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
import { AiAssist } from "./endpoints/ai";
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
import {
	clearAdminSessionCookie,
	createAdminSession,
	hasValidAdminSession,
	requireAdmin,
	setAdminSessionCookie,
	verifyAdminPassword,
} from "./adminAuth";

// Start a Hono app
const app = new Hono<{ Bindings: AppEnv }>();

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

	const session = await createAdminSession(c.env.API_KEY ?? "");
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

	const session = await createAdminSession(c.env.API_KEY ?? "");
	setAdminSessionCookie(c, session);

	return c.redirect("/admin", 302);
});

app.post("/admin/logout", (c) => {
	clearAdminSessionCookie(c);

	return c.redirect("/admin/login", 302);
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
	docs_url: "/",
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

// Export the Hono app
export default app;
