import type { Context } from "hono";
import type { AppEnv } from "./bindings";

type ProjectRow = {
	id: number;
	slug: string;
	title: string;
	summary: string;
	status: string;
	repository_url: string | null;
	live_url: string | null;
	created_at: string;
	updated_at: string;
};

type ArticleRow = {
	id: number;
	slug: string;
	title: string;
	excerpt: string;
	content: string;
	status: string;
	published_at: string | null;
	created_at: string;
	updated_at: string;
};

function escapeHtml(value: unknown) {
	return String(value ?? "").replace(/[&<>"']/g, (char) => {
		const entities: Record<string, string> = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#039;",
		};

		return entities[char] ?? char;
	});
}

function dateLabel(value: string | null) {
	if (!value) return "";

	return new Intl.DateTimeFormat("pt-BR", {
		dateStyle: "medium",
		timeZone: "America/Sao_Paulo",
	}).format(new Date(value));
}

function paragraphs(markdownish: string) {
	return markdownish
		.split(/\n{2,}/)
		.map((part) => part.trim())
		.filter(Boolean)
		.map((part) => `<p>${escapeHtml(part).replace(/\n/g, "<br>")}</p>`)
		.join("");
}

function layout(title: string, body: string) {
	return `<!doctype html>
<html lang="pt-BR">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>${escapeHtml(title)} - UbuntuCode</title>
	<meta name="description" content="Projetos e artigos da UbuntuCode." />
	<style>
		:root {
			color-scheme: light;
			--ink: #172026;
			--muted: #65727d;
			--line: #d9e0e6;
			--surface: #f4f7f9;
			--brand: #0f766e;
			--brand-strong: #115e59;
			--accent: #b45309;
			font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
		}
		* { box-sizing: border-box; }
		body {
			margin: 0;
			background: var(--surface);
			color: var(--ink);
			line-height: 1.55;
		}
		a { color: inherit; }
		.header {
			background: #122029;
			color: white;
			border-bottom: 4px solid var(--brand);
		}
		.nav {
			max-width: 1120px;
			margin: 0 auto;
			padding: 18px 22px;
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 16px;
		}
		.brand {
			display: flex;
			align-items: center;
			gap: 12px;
			text-decoration: none;
			font-weight: 800;
		}
		.logo {
			width: 38px;
			height: 38px;
			border-radius: 8px;
			display: grid;
			place-items: center;
			background: linear-gradient(135deg, #11a39a, #d97706);
		}
		.links {
			display: flex;
			gap: 14px;
			flex-wrap: wrap;
			color: #dce7ed;
			font-size: 14px;
		}
		.links a { text-decoration: none; }
		.hero {
			max-width: 1120px;
			margin: 0 auto;
			padding: 56px 22px 64px;
		}
		.hero h1 {
			max-width: 820px;
			margin: 0;
			font-size: clamp(38px, 7vw, 76px);
			line-height: 0.96;
			letter-spacing: 0;
		}
		.hero p {
			max-width: 680px;
			margin: 18px 0 0;
			color: #dce7ed;
			font-size: 18px;
		}
		.main {
			max-width: 1120px;
			margin: 0 auto;
			padding: 34px 22px 64px;
		}
		.section-head {
			display: flex;
			align-items: end;
			justify-content: space-between;
			gap: 16px;
			margin-bottom: 16px;
		}
		.section-head h2 {
			margin: 0;
			font-size: 28px;
		}
		.section-head a {
			color: var(--brand-strong);
			font-weight: 700;
			text-decoration: none;
		}
		.grid {
			display: grid;
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 16px;
		}
		.card {
			min-height: 180px;
			display: flex;
			flex-direction: column;
			gap: 10px;
			background: white;
			border: 1px solid var(--line);
			border-radius: 8px;
			padding: 18px;
			text-decoration: none;
			box-shadow: 0 10px 30px rgba(20, 37, 49, 0.08);
		}
		.card h3 {
			margin: 0;
			font-size: 20px;
			line-height: 1.2;
		}
		.card p {
			margin: 0;
			color: var(--muted);
		}
		.meta {
			margin-top: auto;
			display: flex;
			gap: 8px;
			flex-wrap: wrap;
			color: var(--brand-strong);
			font-size: 13px;
			font-weight: 700;
		}
		.badge {
			display: inline-flex;
			align-items: center;
			border-radius: 999px;
			background: #e9f1f4;
			padding: 4px 8px;
		}
		.article {
			max-width: 820px;
			background: white;
			border: 1px solid var(--line);
			border-radius: 8px;
			padding: 28px;
			box-shadow: 0 10px 30px rgba(20, 37, 49, 0.08);
		}
		.article h1 {
			margin: 0 0 10px;
			font-size: clamp(34px, 6vw, 58px);
			line-height: 1;
		}
		.article .lead {
			color: var(--muted);
			font-size: 18px;
			margin-bottom: 24px;
		}
		.article p {
			font-size: 17px;
		}
		.actions {
			display: flex;
			gap: 10px;
			flex-wrap: wrap;
			margin-top: 18px;
		}
		.button {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			min-height: 40px;
			border-radius: 7px;
			padding: 0 13px;
			background: var(--ink);
			color: white;
			text-decoration: none;
			font-weight: 700;
		}
		.button.secondary {
			background: white;
			color: var(--ink);
			border: 1px solid var(--line);
		}
		.empty {
			background: white;
			border: 1px solid var(--line);
			border-radius: 8px;
			padding: 26px;
			color: var(--muted);
		}
		.footer {
			border-top: 1px solid var(--line);
			color: var(--muted);
			padding: 24px 22px;
			text-align: center;
		}
		@media (max-width: 860px) {
			.grid { grid-template-columns: 1fr; }
			.nav { align-items: flex-start; flex-direction: column; }
			.hero { padding-top: 42px; }
		}
	</style>
</head>
<body>
	<header class="header">
		<nav class="nav">
			<a class="brand" href="/site"><span class="logo">UC</span><span>UbuntuCode</span></a>
			<div class="links">
				<a href="/site/projects">Projetos</a>
				<a href="/site/articles">Artigos</a>
				<a href="/admin">Admin</a>
				<a href="/">API</a>
			</div>
		</nav>
	</header>
	${body}
	<footer class="footer">UbuntuCode - API, automacao e produtos digitais.</footer>
</body>
</html>`;
}

function hero(title: string, subtitle: string) {
	return `<section class="header"><div class="hero"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(subtitle)}</p></div></section>`;
}

function projectCard(project: ProjectRow) {
	return `<a class="card" href="/site/projects/${encodeURIComponent(project.slug)}">
		<h3>${escapeHtml(project.title)}</h3>
		<p>${escapeHtml(project.summary)}</p>
		<div class="meta"><span class="badge">${escapeHtml(project.status)}</span></div>
	</a>`;
}

function articleCard(article: ArticleRow) {
	return `<a class="card" href="/site/articles/${encodeURIComponent(article.slug)}">
		<h3>${escapeHtml(article.title)}</h3>
		<p>${escapeHtml(article.excerpt)}</p>
		<div class="meta"><span>${escapeHtml(dateLabel(article.published_at || article.created_at))}</span></div>
	</a>`;
}

async function listProjects(db: D1Database, limit = 24) {
	const result = await db
		.prepare("SELECT * FROM projects WHERE status = 'active' ORDER BY created_at DESC LIMIT ?")
		.bind(limit)
		.all<ProjectRow>();

	return result.results;
}

async function listArticles(db: D1Database, limit = 24) {
	const result = await db
		.prepare("SELECT * FROM articles WHERE status = 'published' ORDER BY COALESCE(published_at, created_at) DESC LIMIT ?")
		.bind(limit)
		.all<ArticleRow>();

	return result.results;
}

export async function renderHome(c: Context<{ Bindings: AppEnv }>) {
	const [projects, articles] = await Promise.all([
		listProjects(c.env.DB, 3),
		listArticles(c.env.DB, 3),
	]);
	const body = `${hero(
		"UbuntuCode",
		"Projetos, artigos e experimentos sobre APIs, automacao, Cloudflare Workers e IA aplicada.",
	)}
	<main class="main">
		<div class="section-head"><h2>Projetos</h2><a href="/site/projects">Ver todos</a></div>
		${projects.length ? `<div class="grid">${projects.map(projectCard).join("")}</div>` : '<div class="empty">Nenhum projeto publicado ainda.</div>'}
		<br>
		<div class="section-head"><h2>Artigos</h2><a href="/site/articles">Ver todos</a></div>
		${articles.length ? `<div class="grid">${articles.map(articleCard).join("")}</div>` : '<div class="empty">Nenhum artigo publicado ainda.</div>'}
	</main>`;

	return c.html(layout("Inicio", body));
}

export async function renderProjects(c: Context<{ Bindings: AppEnv }>) {
	const projects = await listProjects(c.env.DB);
	const body = `${hero("Projetos", "Produtos e experimentos ativos da UbuntuCode.")}
	<main class="main">
		${projects.length ? `<div class="grid">${projects.map(projectCard).join("")}</div>` : '<div class="empty">Nenhum projeto publicado ainda.</div>'}
	</main>`;

	return c.html(layout("Projetos", body));
}

export async function renderProject(c: Context<{ Bindings: AppEnv }>) {
	const slug = c.req.param("slug");
	const project = await c.env.DB.prepare(
		"SELECT * FROM projects WHERE slug = ? AND status = 'active'",
	)
		.bind(slug)
		.first<ProjectRow>();

	if (!project) return c.notFound();

	const body = `<main class="main">
		<article class="article">
			<div class="meta"><span class="badge">${escapeHtml(project.status)}</span></div>
			<h1>${escapeHtml(project.title)}</h1>
			<p class="lead">${escapeHtml(project.summary)}</p>
			<div class="actions">
				${project.live_url ? `<a class="button" href="${escapeHtml(project.live_url)}">Abrir projeto</a>` : ""}
				${project.repository_url ? `<a class="button secondary" href="${escapeHtml(project.repository_url)}">Repositorio</a>` : ""}
			</div>
		</article>
	</main>`;

	return c.html(layout(project.title, body));
}

export async function renderArticles(c: Context<{ Bindings: AppEnv }>) {
	const articles = await listArticles(c.env.DB);
	const body = `${hero("Artigos", "Notas tecnicas, aprendizados e bastidores de construcao.")}
	<main class="main">
		${articles.length ? `<div class="grid">${articles.map(articleCard).join("")}</div>` : '<div class="empty">Nenhum artigo publicado ainda.</div>'}
	</main>`;

	return c.html(layout("Artigos", body));
}

export async function renderArticle(c: Context<{ Bindings: AppEnv }>) {
	const slug = c.req.param("slug");
	const article = await c.env.DB.prepare(
		"SELECT * FROM articles WHERE slug = ? AND status = 'published'",
	)
		.bind(slug)
		.first<ArticleRow>();

	if (!article) return c.notFound();

	const body = `<main class="main">
		<article class="article">
			<div class="meta"><span>${escapeHtml(dateLabel(article.published_at || article.created_at))}</span></div>
			<h1>${escapeHtml(article.title)}</h1>
			<p class="lead">${escapeHtml(article.excerpt)}</p>
			${paragraphs(article.content)}
		</article>
	</main>`;

	return c.html(layout(article.title, body));
}
