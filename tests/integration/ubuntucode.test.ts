import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

const authHeaders = {
	"Content-Type": "application/json",
	"x-api-key": "test-api-key",
};

describe("UbuntuCode API", () => {
	it("blocks protected writes without an API key", async () => {
		const response = await SELF.fetch("http://local.test/projects", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				slug: "blocked-project",
				title: "Blocked Project",
				summary: "Should not be created",
			}),
		});

		expect(response.status).toBe(401);
	});

	it("creates and reads a project", async () => {
		const slug = `project-${crypto.randomUUID()}`;
		const createResponse = await SELF.fetch("http://local.test/projects", {
			method: "POST",
			headers: authHeaders,
			body: JSON.stringify({
				slug,
				title: "UbuntuCode API",
				summary: "Backend project for UbuntuCode",
				status: "active",
				repository_url: "https://github.com/dilusofrar/chanfana-openapi-template",
				live_url: "https://api.ubuntucode.com",
				image_url: "https://api.ubuntucode.com/assets/example.jpg",
				tags: "workers,api",
				seo_title: "UbuntuCode API",
				seo_description: "Backend serverless da UbuntuCode",
			}),
		});
		const created = await createResponse.json<{
			success: boolean;
			result: { slug: string; status: string; tags: string };
		}>();

		expect(createResponse.status).toBe(201);
		expect(created.result.slug).toBe(slug);
		expect(created.result.status).toBe("active");
		expect(created.result.tags).toBe("workers,api");

		const readResponse = await SELF.fetch(`http://local.test/projects/${slug}`);
		const read = await readResponse.json<{
			success: boolean;
			result: { title: string };
		}>();

		expect(readResponse.status).toBe(200);
		expect(read.result.title).toBe("UbuntuCode API");
	});

	it("updates and deletes a project", async () => {
		const slug = `project-${crypto.randomUUID()}`;
		await SELF.fetch("http://local.test/projects", {
			method: "POST",
			headers: authHeaders,
			body: JSON.stringify({
				slug,
				title: "Draft Project",
				summary: "Draft summary",
				status: "draft",
			}),
		});

		const updateResponse = await SELF.fetch(
			`http://local.test/projects/${slug}`,
			{
				method: "PATCH",
				headers: authHeaders,
				body: JSON.stringify({
					title: "Published Project",
					status: "active",
				}),
			},
		);
		const updated = await updateResponse.json<{
			result: { title: string; status: string };
		}>();

		expect(updateResponse.status).toBe(200);
		expect(updated.result.title).toBe("Published Project");
		expect(updated.result.status).toBe("active");

		const deleteResponse = await SELF.fetch(
			`http://local.test/projects/${slug}`,
			{
				method: "DELETE",
				headers: authHeaders,
			},
		);

		expect(deleteResponse.status).toBe(200);
		expect(await SELF.fetch(`http://local.test/projects/${slug}`)).toHaveProperty(
			"status",
			404,
		);
	});

	it("creates and lists articles", async () => {
		const slug = `article-${crypto.randomUUID()}`;
		const createResponse = await SELF.fetch("http://local.test/articles", {
			method: "POST",
			headers: authHeaders,
			body: JSON.stringify({
				slug,
				title: "Primeiro artigo",
				excerpt: "Uma introducao ao UbuntuCode.",
				content: "Conteudo do artigo.",
				status: "published",
				published_at: "2026-05-14T00:00:00.000Z",
				category: "Cloudflare",
				tags: "workers,d1",
				seo_title: "Primeiro artigo SEO",
				seo_description: "Uma introducao otimizada ao UbuntuCode.",
			}),
		});

		expect(createResponse.status).toBe(201);

		const listResponse = await SELF.fetch("http://local.test/articles");
		const list = await listResponse.json<{
			success: boolean;
			result: Array<{ slug: string }>;
		}>();

		expect(listResponse.status).toBe(200);
		expect(list.result.some((article) => article.slug === slug)).toBe(true);
	});

	it("updates and deletes articles", async () => {
		const slug = `article-${crypto.randomUUID()}`;
		await SELF.fetch("http://local.test/articles", {
			method: "POST",
			headers: authHeaders,
			body: JSON.stringify({
				slug,
				title: "Rascunho",
				excerpt: "Resumo",
				content: "Conteudo inicial",
				status: "draft",
			}),
		});

		const updateResponse = await SELF.fetch(
			`http://local.test/articles/${slug}`,
			{
				method: "PATCH",
				headers: authHeaders,
				body: JSON.stringify({
					status: "published",
					published_at: "2026-05-14T00:00:00.000Z",
				}),
			},
		);
		const updated = await updateResponse.json<{
			result: { status: string; published_at: string };
		}>();

		expect(updateResponse.status).toBe(200);
		expect(updated.result.status).toBe("published");
		expect(updated.result.published_at).toBe("2026-05-14T00:00:00.000Z");

		const deleteResponse = await SELF.fetch(
			`http://local.test/articles/${slug}`,
			{
				method: "DELETE",
				headers: authHeaders,
			},
		);

		expect(deleteResponse.status).toBe(200);
		expect(await SELF.fetch(`http://local.test/articles/${slug}`)).toHaveProperty(
			"status",
			404,
		);
	});

	it("creates users with API key auth", async () => {
		const email = `user-${crypto.randomUUID()}@ubuntucode.com`;
		const response = await SELF.fetch("http://local.test/users", {
			method: "POST",
			headers: authHeaders,
			body: JSON.stringify({
				email,
				name: "UbuntuCode User",
				role: "member",
			}),
		});
		const body = await response.json<{
			success: boolean;
			result: { email: string; role: string };
		}>();

		expect(response.status).toBe(201);
		expect(body.result.email).toBe(email);
		expect(body.result.role).toBe("member");

		const updateResponse = await SELF.fetch(
			`http://local.test/users/${body.result.id}`,
			{
				method: "PATCH",
				headers: authHeaders,
				body: JSON.stringify({ role: "admin" }),
			},
		);
		const updated = await updateResponse.json<{
			result: { role: string };
		}>();

		expect(updateResponse.status).toBe(200);
		expect(updated.result.role).toBe("admin");
	});

	it("stores webhook events", async () => {
		const response = await SELF.fetch("http://local.test/webhooks/events", {
			method: "POST",
			headers: authHeaders,
			body: JSON.stringify({
				source: "github",
				event_type: "push",
				payload: { branch: "main" },
			}),
		});
		const body = await response.json<{
			success: boolean;
			result: { source: string; event_type: string; payload: string };
		}>();

		expect(response.status).toBe(202);
		expect(body.result.source).toBe("github");
		expect(body.result.event_type).toBe("push");
		expect(JSON.parse(body.result.payload)).toEqual({ branch: "main" });

		const listResponse = await SELF.fetch("http://local.test/webhooks/events", {
			headers: { "x-api-key": "test-api-key" },
		});
		const list = await listResponse.json<{
			result: Array<{ id: number; source: string }>;
		}>();

		expect(listResponse.status).toBe(200);
		expect(list.result.some((event) => event.source === "github")).toBe(true);
	});

	it("responds to AI assist requests", async () => {
		const response = await SELF.fetch("http://local.test/ai/assist", {
			method: "POST",
			headers: authHeaders,
			body: JSON.stringify({ prompt: "Explique o UbuntuCode em uma frase." }),
		});
		const body = await response.json<{
			success: boolean;
			result: { answer: string; provider: string };
		}>();

		expect(response.status).toBe(200);
		expect(body.result.answer.length).toBeGreaterThan(0);
		expect(["fallback", "workers-ai"]).toContain(body.result.provider);

		const historyResponse = await SELF.fetch("http://local.test/ai/history", {
			headers: { "x-api-key": "test-api-key" },
		});
		const history = await historyResponse.json<{
			result: Array<{ kind: string; response: string }>;
		}>();

		expect(historyResponse.status).toBe(200);
		expect(history.result.some((item) => item.kind === "assist")).toBe(true);
	});

	it("generates article AI suggestions", async () => {
		const response = await SELF.fetch("http://local.test/ai/articles", {
			method: "POST",
			headers: authHeaders,
			body: JSON.stringify({
				action: "excerpt",
				title: "Como construir APIs com Workers",
				content: "Texto sobre Cloudflare Workers, D1 e OpenAPI.",
			}),
		});
		const body = await response.json<{
			success: boolean;
			result: { action: string; suggestion: string; provider: string };
		}>();

		expect(response.status).toBe(200);
		expect(body.result.action).toBe("excerpt");
		expect(body.result.suggestion.length).toBeGreaterThan(0);
		expect(["fallback", "workers-ai"]).toContain(body.result.provider);
	});

	it("generates and stores AI article drafts", async () => {
		const response = await SELF.fetch("http://local.test/ai/drafts", {
			method: "POST",
			headers: authHeaders,
			body: JSON.stringify({
				briefing: "Artigo sobre usar Cloudflare Workers, D1 e Workers AI.",
				tone: "pratico e didatico",
			}),
		});
		const body = await response.json<{
			result: { id: number; title: string; content: string };
		}>();

		expect(response.status).toBe(201);
		expect(body.result.id).toBeGreaterThan(0);
		expect(body.result.title.length).toBeGreaterThan(0);

		const listResponse = await SELF.fetch("http://local.test/ai/drafts", {
			headers: { "x-api-key": "test-api-key" },
		});
		const list = await listResponse.json<{
			result: Array<{ id: number }>;
		}>();

		expect(listResponse.status).toBe(200);
		expect(list.result.some((draft) => draft.id === body.result.id)).toBe(true);
	});

	it("accepts contact leads and newsletter subscribers", async () => {
		const email = `lead-${crypto.randomUUID()}@ubuntucode.com`;
		const leadResponse = await SELF.fetch("http://local.test/leads", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: "Lead UbuntuCode",
				email,
				message: "Quero falar sobre APIs.",
			}),
		});
		const lead = await leadResponse.json<{
			result: { email: string; source: string };
		}>();

		expect(leadResponse.status).toBe(201);
		expect(lead.result.email).toBe(email);
		expect(lead.result.source).toBe("contact");

		const newsletterResponse = await SELF.fetch("http://local.test/newsletter", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email }),
		});

		expect(newsletterResponse.status).toBe(201);
	});

	it("returns a clear asset upload error when R2 is not bound in tests", async () => {
		const data = new FormData();
		data.set("file", new File(["fake"], "cover.png", { type: "image/png" }));
		const response = await SELF.fetch("http://local.test/assets/upload", {
			method: "POST",
			headers: { "x-api-key": "test-api-key" },
			body: data,
		});
		const body = await response.json<{
			errors: Array<{ code: string }>;
		}>();

		expect(response.status).toBe(503);
		expect(body.errors[0].code).toBe("ASSETS_NOT_CONFIGURED");
	});
});
