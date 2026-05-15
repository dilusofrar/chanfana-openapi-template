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
	image_url: string | null;
	tags: string | null;
	seo_title: string | null;
	seo_description: string | null;
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
	image_url: string | null;
	tags: string | null;
	category: string | null;
	seo_title: string | null;
	seo_description: string | null;
	created_at: string;
	updated_at: string;
};

type SeoOptions = {
	description?: string;
	path?: string;
	type?: "website" | "article";
	image?: string | null;
};

const DEFAULT_SITE_ORIGIN = "https://api.ubuntucode.com";
const DEFAULT_DESCRIPTION =
	"Projetos, artigos e experimentos da UbuntuCode sobre APIs, Cloudflare Workers, automacao e IA aplicada.";

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

function siteOrigin(c: Context<{ Bindings: AppEnv }>) {
	return c.env.PUBLIC_SITE_ORIGIN ?? DEFAULT_SITE_ORIGIN;
}

function absoluteUrl(c: Context<{ Bindings: AppEnv }>, path = "/") {
	if (/^https?:\/\//.test(path)) return path;

	return `${siteOrigin(c)}${path.startsWith("/") ? path : `/${path}`}`;
}

function compactText(value: string, fallback = DEFAULT_DESCRIPTION) {
	const normalized = value.replace(/\s+/g, " ").trim();
	const text = normalized || fallback;

	return text.length > 156 ? `${text.slice(0, 153).trim()}...` : text;
}

function tags(value: string | null) {
	return String(value ?? "")
		.split(",")
		.map((tag) => tag.trim())
		.filter(Boolean);
}

function xmlEscape(value: unknown) {
	return String(value ?? "").replace(/[<>&'"]/g, (char) => {
		const entities: Record<string, string> = {
			"<": "&lt;",
			">": "&gt;",
			"&": "&amp;",
			"'": "&apos;",
			'"': "&quot;",
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

function layout(
	c: Context<{ Bindings: AppEnv }>,
	title: string,
	body: string,
	options: SeoOptions = {},
) {
	const pageTitle = title === "UbuntuCode" ? title : `${title} - UbuntuCode`;
	const description = compactText(options.description ?? DEFAULT_DESCRIPTION);
	const canonical = absoluteUrl(c, options.path ?? "/");
	const type = options.type ?? "website";
	const image = options.image ? absoluteUrl(c, options.image) : null;
	const analyticsToken = c.env.WEB_ANALYTICS_TOKEN?.trim();

	return `<!doctype html>
<html lang="pt-BR">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>${escapeHtml(pageTitle)}</title>
	<meta name="description" content="${escapeHtml(description)}" />
	<link rel="canonical" href="${escapeHtml(canonical)}" />
	<meta property="og:title" content="${escapeHtml(pageTitle)}" />
	<meta property="og:description" content="${escapeHtml(description)}" />
	<meta property="og:type" content="${escapeHtml(type)}" />
	<meta property="og:url" content="${escapeHtml(canonical)}" />
	${image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : ""}
	<meta name="twitter:card" content="summary" />
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
		.hero-actions {
			display: flex;
			flex-wrap: wrap;
			gap: 10px;
			margin-top: 24px;
		}
		.main {
			max-width: 1120px;
			margin: 0 auto;
			padding: 34px 22px 64px;
		}
		.feature-strip {
			display: grid;
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 14px;
			margin-bottom: 34px;
		}
		.feature {
			background: white;
			border: 1px solid var(--line);
			border-radius: 8px;
			padding: 16px;
		}
		.feature strong {
			display: block;
			margin-bottom: 4px;
		}
		.feature span {
			color: var(--muted);
			font-size: 14px;
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
			transition: border-color 140ms ease, transform 140ms ease;
		}
		.card:hover {
			border-color: #9db1bd;
			transform: translateY(-2px);
		}
		.card h3 {
			margin: 0;
			font-size: 20px;
			line-height: 1.2;
		}
		.card-media {
			width: 100%;
			aspect-ratio: 16 / 9;
			object-fit: cover;
			border-radius: 7px;
			border: 1px solid var(--line);
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
		.cover {
			width: 100%;
			aspect-ratio: 16 / 8;
			object-fit: cover;
			border-radius: 7px;
			border: 1px solid var(--line);
			margin-bottom: 18px;
		}
		.article-shell {
			display: grid;
			grid-template-columns: minmax(0, 820px) 240px;
			gap: 22px;
			align-items: start;
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
		.sidebar {
			background: white;
			border: 1px solid var(--line);
			border-radius: 8px;
			padding: 16px;
			position: sticky;
			top: 18px;
		}
		.sidebar h2 {
			font-size: 15px;
			margin: 0 0 10px;
		}
		.sidebar p {
			color: var(--muted);
			font-size: 14px;
			margin: 0 0 12px;
		}
		.contact-form {
			display: grid;
			gap: 12px;
			margin-top: 18px;
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
		.button.light {
			background: #f2fbfa;
			color: var(--brand-strong);
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
			.grid, .feature-strip, .article-shell { grid-template-columns: 1fr; }
			.nav { align-items: flex-start; flex-direction: column; }
			.hero { padding-top: 42px; }
			.sidebar { position: static; }
		}
	</style>
</head>
<body>
	<header class="header">
		<nav class="nav">
			<a class="brand" href="/"><span class="logo">UC</span><span>UbuntuCode</span></a>
			<div class="links">
				<a href="/projetos">Projetos</a>
				<a href="/blog">Artigos</a>
				<a href="/contato">Contato</a>
				<a href="/admin">Admin</a>
				<a href="/docs">API</a>
			</div>
		</nav>
	</header>
	${body}
	<footer class="footer">UbuntuCode - API, automacao e produtos digitais.</footer>
	${analyticsToken ? `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"${escapeHtml(analyticsToken)}"}'></script>` : ""}
</body>
</html>`;
}

function hero(title: string, subtitle: string, actions = "") {
	return `<section class="header"><div class="hero"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(subtitle)}</p>${actions}</div></section>`;
}

function projectCard(project: ProjectRow) {
	return `<a class="card" href="/projetos/${encodeURIComponent(project.slug)}">
		${project.image_url ? `<img class="card-media" src="${escapeHtml(project.image_url)}" alt="" loading="lazy" />` : ""}
		<h3>${escapeHtml(project.title)}</h3>
		<p>${escapeHtml(project.summary)}</p>
		<div class="meta"><span class="badge">${escapeHtml(project.status)}</span>${tags(project.tags)
			.slice(0, 2)
			.map((tag) => `<span>${escapeHtml(tag)}</span>`)
			.join("")}</div>
	</a>`;
}

function articleCard(article: ArticleRow) {
	return `<a class="card" href="/blog/${encodeURIComponent(article.slug)}">
		${article.image_url ? `<img class="card-media" src="${escapeHtml(article.image_url)}" alt="" loading="lazy" />` : ""}
		<h3>${escapeHtml(article.title)}</h3>
		<p>${escapeHtml(article.excerpt)}</p>
		<div class="meta"><span>${escapeHtml(dateLabel(article.published_at || article.created_at))}</span>${article.category ? `<span class="badge">${escapeHtml(article.category)}</span>` : ""}</div>
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
		`<div class="hero-actions">
			<a class="button light" href="/projetos">Explorar projetos</a>
			<a class="button secondary" href="/blog">Ler artigos</a>
			<a class="button secondary" href="/contato">Contato</a>
		</div>`,
	)}
	<main class="main">
		<section class="feature-strip" aria-label="Areas de foco">
			<div class="feature"><strong>APIs serverless</strong><span>Backends pequenos, documentados e prontos para evoluir.</span></div>
			<div class="feature"><strong>IA aplicada</strong><span>Fluxos editoriais e automacoes usando Workers AI.</span></div>
			<div class="feature"><strong>Produtos digitais</strong><span>Projetos publicados com codigo, demo e aprendizado real.</span></div>
		</section>
		<div class="section-head"><h2>Projetos</h2><a href="/projetos">Ver todos</a></div>
		${projects.length ? `<div class="grid">${projects.map(projectCard).join("")}</div>` : '<div class="empty">Nenhum projeto publicado ainda.</div>'}
		<br>
		<div class="section-head"><h2>Artigos</h2><a href="/blog">Ver todos</a></div>
		${articles.length ? `<div class="grid">${articles.map(articleCard).join("")}</div>` : '<div class="empty">Nenhum artigo publicado ainda.</div>'}
	</main>`;

	return c.html(
		layout(c, "UbuntuCode", body, {
			description: DEFAULT_DESCRIPTION,
			path: "/",
		}),
	);
}

export async function renderProjects(c: Context<{ Bindings: AppEnv }>) {
	const projects = await listProjects(c.env.DB);
	const body = `${hero("Projetos", "Produtos e experimentos ativos da UbuntuCode.")}
	<main class="main">
		${projects.length ? `<div class="grid">${projects.map(projectCard).join("")}</div>` : '<div class="empty">Nenhum projeto publicado ainda.</div>'}
	</main>`;

	return c.html(
		layout(c, "Projetos", body, {
			description: "Projetos ativos da UbuntuCode com APIs, automacoes, demos e repositorios.",
			path: "/projetos",
		}),
	);
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
		<div class="article-shell">
			<article class="article">
				${project.image_url ? `<img class="cover" src="${escapeHtml(project.image_url)}" alt="" />` : ""}
				<div class="meta"><span class="badge">${escapeHtml(project.status)}</span><span>Atualizado em ${escapeHtml(dateLabel(project.updated_at))}</span></div>
				<h1>${escapeHtml(project.title)}</h1>
				<p class="lead">${escapeHtml(project.summary)}</p>
				<div class="actions">
					${project.live_url ? `<a class="button" href="${escapeHtml(project.live_url)}" rel="noopener noreferrer">Abrir projeto</a>` : ""}
					${project.repository_url ? `<a class="button secondary" href="${escapeHtml(project.repository_url)}" rel="noopener noreferrer">Repositorio</a>` : ""}
				</div>
			</article>
			<aside class="sidebar">
				<h2>Projeto</h2>
				<p>Status: ${escapeHtml(project.status)}</p>
				<p>Criado em ${escapeHtml(dateLabel(project.created_at))}</p>
				${tags(project.tags).map((tag) => `<span class="badge">${escapeHtml(tag)}</span>`).join(" ")}
				<a class="button secondary" href="/projetos">Todos os projetos</a>
			</aside>
		</div>
	</main>`;

	return c.html(
		layout(c, project.seo_title || project.title, body, {
			description: project.seo_description || project.summary,
			path: `/projetos/${project.slug}`,
			image: project.image_url,
		}),
	);
}

export async function renderArticles(c: Context<{ Bindings: AppEnv }>) {
	const articles = await listArticles(c.env.DB);
	const body = `${hero("Artigos", "Notas tecnicas, aprendizados e bastidores de construcao.")}
	<main class="main">
		${articles.length ? `<div class="grid">${articles.map(articleCard).join("")}</div>` : '<div class="empty">Nenhum artigo publicado ainda.</div>'}
	</main>`;

	return c.html(
		layout(c, "Artigos", body, {
			description: "Artigos da UbuntuCode sobre APIs, Cloudflare Workers, IA aplicada e construcao de produtos digitais.",
			path: "/blog",
		}),
	);
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
		<div class="article-shell">
			<article class="article">
				${article.image_url ? `<img class="cover" src="${escapeHtml(article.image_url)}" alt="" />` : ""}
				<div class="meta"><span>${escapeHtml(dateLabel(article.published_at || article.created_at))}</span></div>
				<h1>${escapeHtml(article.title)}</h1>
				<p class="lead">${escapeHtml(article.excerpt)}</p>
				${paragraphs(article.content)}
			</article>
			<aside class="sidebar">
				<h2>Artigo</h2>
				<p>Publicado em ${escapeHtml(dateLabel(article.published_at || article.created_at))}</p>
				${article.category ? `<p>Categoria: ${escapeHtml(article.category)}</p>` : ""}
				${tags(article.tags).map((tag) => `<span class="badge">${escapeHtml(tag)}</span>`).join(" ")}
				<p>Leitura tecnica da UbuntuCode.</p>
				<a class="button secondary" href="/blog">Todos os artigos</a>
			</aside>
		</div>
	</main>`;

	return c.html(
		layout(c, article.seo_title || article.title, body, {
			description: article.seo_description || article.excerpt,
			path: `/blog/${article.slug}`,
			type: "article",
			image: article.image_url,
		}),
	);
}

export async function renderContact(c: Context<{ Bindings: AppEnv }>) {
	const body = `${hero("Contato", "Fale com a UbuntuCode sobre APIs, automacoes, IA aplicada ou produtos digitais.")}
	<main class="main">
		<article class="article">
			<h1>Vamos construir algo util</h1>
			<p class="lead">Envie uma mensagem e ela sera registrada como lead na API.</p>
			<form class="contact-form" method="post" action="/contato">
				<input name="name" placeholder="Nome" required />
				<input name="email" type="email" placeholder="Email" required />
				<textarea name="message" placeholder="Mensagem" required></textarea>
				<input name="source" type="hidden" value="contact-page" />
				<button class="button" type="submit">Enviar mensagem</button>
			</form>
		</article>
	</main>`;

	return c.html(
		layout(c, "Contato", body, {
			description: "Entre em contato com a UbuntuCode para projetos de API, automacao, Workers e IA aplicada.",
			path: "/contato",
		}),
	);
}

export async function renderSitemap(c: Context<{ Bindings: AppEnv }>) {
	const [projects, articles] = await Promise.all([
		listProjects(c.env.DB, 100),
		listArticles(c.env.DB, 100),
	]);
	const staticUrls = ["/", "/projetos", "/blog", "/contato", "/docs"];
	const urls = [
		...staticUrls.map((path) => ({ loc: absoluteUrl(c, path), lastmod: null })),
		...projects.map((project) => ({
			loc: absoluteUrl(c, `/projetos/${project.slug}`),
			lastmod: project.updated_at,
		})),
		...articles.map((article) => ({
			loc: absoluteUrl(c, `/blog/${article.slug}`),
			lastmod: article.published_at || article.updated_at,
		})),
	];
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		(url) => `	<url>
		<loc>${xmlEscape(url.loc)}</loc>
		${url.lastmod ? `<lastmod>${xmlEscape(url.lastmod)}</lastmod>` : ""}
	</url>`,
	)
	.join("\n")}
</urlset>`;

	return c.body(xml, 200, { "Content-Type": "application/xml; charset=utf-8" });
}

export function renderRobots(c: Context<{ Bindings: AppEnv }>) {
	return c.text(
		[
			"User-agent: *",
			"Allow: /",
			"Disallow: /admin",
			`Sitemap: ${absoluteUrl(c, "/sitemap.xml")}`,
			"",
		].join("\n"),
	);
}

export async function renderRss(c: Context<{ Bindings: AppEnv }>) {
	const articles = await listArticles(c.env.DB, 30);
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
	<channel>
		<title>UbuntuCode</title>
		<link>${xmlEscape(absoluteUrl(c, "/blog"))}</link>
		<description>${xmlEscape(DEFAULT_DESCRIPTION)}</description>
${articles
	.map(
		(article) => `		<item>
			<title>${xmlEscape(article.title)}</title>
			<link>${xmlEscape(absoluteUrl(c, `/blog/${article.slug}`))}</link>
			<guid>${xmlEscape(absoluteUrl(c, `/blog/${article.slug}`))}</guid>
			<description>${xmlEscape(article.excerpt)}</description>
			<pubDate>${new Date(article.published_at || article.created_at).toUTCString()}</pubDate>
		</item>`,
	)
	.join("\n")}
	</channel>
</rss>`;

	return c.body(xml, 200, { "Content-Type": "application/rss+xml; charset=utf-8" });
}
