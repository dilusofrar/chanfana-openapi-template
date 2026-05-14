import { ApiException, fromHono } from "chanfana";
import { Hono } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";
import {
	ArticleCreate,
	ArticleList,
	ArticleRead,
} from "./endpoints/articles";
import { AiAssist } from "./endpoints/ai";
import { ProjectCreate, ProjectList, ProjectRead } from "./endpoints/projects";
import { UserCreate, UserList, UserRead } from "./endpoints/users";
import { WebhookReceive } from "./endpoints/webhooks";
import type { AppEnv } from "./bindings";

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
openapi.get("/projects", ProjectList);
openapi.post("/projects", ProjectCreate);
openapi.get("/projects/:slug", ProjectRead);
openapi.get("/articles", ArticleList);
openapi.post("/articles", ArticleCreate);
openapi.get("/articles/:slug", ArticleRead);
openapi.post("/webhooks/events", WebhookReceive);
openapi.post("/ai/assist", AiAssist);

// Export the Hono app
export default app;
