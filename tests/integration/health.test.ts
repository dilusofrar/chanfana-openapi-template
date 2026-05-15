import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("Health endpoint", () => {
	it("returns the API health status", async () => {
		const response = await SELF.fetch("http://local.test/health");
		const body = await response.json<{
			success: boolean;
			result: { service: string; status: string };
		}>();

		expect(response.status).toBe(200);
		expect(body).toEqual({
			success: true,
			result: {
				service: "api-ubuntucode",
				status: "ok",
			},
		});
	});
});

describe("Admin panel", () => {
	it("redirects unauthenticated users to login", async () => {
		const response = await SELF.fetch("http://local.test/admin", {
			redirect: "manual",
		});

		expect(response.status).toBe(302);
		expect(response.headers.get("location")).toBe("/admin/login");
	});

	it("serves the admin login page", async () => {
		const response = await SELF.fetch("http://local.test/admin/login");
		const html = await response.text();

		expect(response.status).toBe(200);
		expect(html).toContain("Entrar - UbuntuCode Admin");
		expect(html).toContain("Email");
		expect(html).toContain("Senha");
	});

	it("serves the admin console with a valid login session", async () => {
		const form = new FormData();
		form.set("password", "test-api-key");
		const loginResponse = await SELF.fetch("http://local.test/admin/login", {
			method: "POST",
			body: form,
			redirect: "manual",
		});
		const cookie = loginResponse.headers.get("set-cookie")?.split(";")[0];
		const response = await SELF.fetch("http://local.test/admin", {
			headers: {
				Cookie: cookie ?? "",
			},
		});
		const html = await response.text();

		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toContain("text/html");
		expect(html).toContain("UbuntuCode Admin");
		expect(html).toContain("Admin Console");
		expect(html).toContain("Dashboard");
		expect(html).toContain("Membros");
		expect(html).toContain("Admins");
		expect(html).toContain("Caixa de entrada técnica");
		expect(html).toContain("Histórico de IA");
		expect(html).toContain("Upload");
	});

	it("creates an admin session through the login form", async () => {
		const form = new FormData();
		form.set("password", "test-api-key");
		const response = await SELF.fetch("http://local.test/admin/login", {
			method: "POST",
			body: form,
			redirect: "manual",
		});

		expect(response.status).toBe(302);
		expect(response.headers.get("location")).toBe("/admin");
		expect(response.headers.get("set-cookie")).toContain("uc_admin_session");
	});

	it("uses the admin session cookie for protected API calls", async () => {
		const form = new FormData();
		form.set("password", "test-api-key");
		const loginResponse = await SELF.fetch("http://local.test/admin/login", {
			method: "POST",
			body: form,
			redirect: "manual",
		});
		const cookie = loginResponse.headers.get("set-cookie")?.split(";")[0];

		expect(cookie).toContain("uc_admin_session");

		const response = await SELF.fetch("http://local.test/webhooks/events", {
			headers: {
				Cookie: cookie ?? "",
			},
		});

		expect(response.status).toBe(200);
	});
});

describe("Public site", () => {
	it("serves the public home page at the root", async () => {
		const response = await SELF.fetch("http://local.test/");
		const html = await response.text();

		expect(response.status).toBe(200);
		expect(html).toContain("UbuntuCode");
		expect(html).toContain("Projetos");
		expect(html).toContain("Artigos");
		expect(html).toContain('href="/docs"');
		expect(html).not.toContain('href="/admin"');
		expect(html).toContain(
			'<link rel="canonical" href="https://api.ubuntucode.com/"',
		);
		expect(html).toContain("static.cloudflareinsights.com/beacon.min.js");
		expect(html).toContain("APIs serverless");
		expect(html).toContain("IA aplicada");
	});

	it("keeps the legacy public site alias", async () => {
		const response = await SELF.fetch("http://local.test/site");
		const html = await response.text();

		expect(response.status).toBe(200);
		expect(html).toContain("UbuntuCode");
	});

	it("serves OpenAPI documentation under /docs", async () => {
		const response = await SELF.fetch("http://local.test/docs");
		const html = await response.text();

		expect(response.status).toBe(200);
		expect(html).toContain("SwaggerUI");
	});

	it("serves public project detail pages", async () => {
		const slug = `public-project-${crypto.randomUUID()}`;
		await SELF.fetch("http://local.test/projects", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": "test-api-key",
			},
			body: JSON.stringify({
				slug,
				title: "Projeto publico",
				summary: "Resumo publico",
				status: "active",
			}),
		});

		const response = await SELF.fetch(`http://local.test/site/projects/${slug}`);
		const html = await response.text();

		expect(response.status).toBe(200);
		expect(html).toContain("Projeto publico");
		expect(html).toContain("Resumo publico");
		expect(html).toContain(
			`<link rel="canonical" href="https://api.ubuntucode.com/projetos/${slug}"`,
		);
		expect(html).toContain("Todos os projetos");
	});

	it("serves public article detail pages", async () => {
		const slug = `public-article-${crypto.randomUUID()}`;
		await SELF.fetch("http://local.test/articles", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": "test-api-key",
			},
			body: JSON.stringify({
				slug,
				title: "Artigo publico",
				excerpt: "Resumo do artigo publico",
				content: "Primeiro paragrafo.\n\nSegundo paragrafo.",
				status: "published",
				published_at: "2026-05-14T00:00:00.000Z",
			}),
		});

		const response = await SELF.fetch(`http://local.test/site/articles/${slug}`);
		const html = await response.text();

		expect(response.status).toBe(200);
		expect(html).toContain("Artigo publico");
		expect(html).toContain("Primeiro paragrafo.");
		expect(html).toContain("Segundo paragrafo.");
		expect(html).toContain('property="og:type" content="article"');
		expect(html).toContain("Todos os artigos");
	});

	it("serves public SEO utilities", async () => {
		const [robots, sitemap, rss] = await Promise.all([
			SELF.fetch("http://local.test/robots.txt"),
			SELF.fetch("http://local.test/sitemap.xml"),
			SELF.fetch("http://local.test/rss.xml"),
		]);

		expect(robots.status).toBe(200);
		expect(await robots.text()).toContain("Sitemap:");
		expect(sitemap.status).toBe(200);
		expect(await sitemap.text()).toContain("<urlset");
		expect(rss.status).toBe(200);
		expect(await rss.text()).toContain("<rss");
	});

	it("serves friendly public aliases", async () => {
		const [projects, articles, contact] = await Promise.all([
			SELF.fetch("http://local.test/projetos"),
			SELF.fetch("http://local.test/blog"),
			SELF.fetch("http://local.test/contato"),
		]);

		expect(projects.status).toBe(200);
		expect(articles.status).toBe(200);
		expect(contact.status).toBe(200);
		expect(await contact.text()).toContain("Enviar mensagem");
	});
});
