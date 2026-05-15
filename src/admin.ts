export const adminLoginHtml = String.raw`<!doctype html>
<html lang="pt-BR">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>Entrar - UbuntuCode Admin</title>
	<style>
		:root {
			color-scheme: light;
			--ink: #172026;
			--muted: #65727d;
			--line: #d9e0e6;
			--brand: #0f766e;
			--accent: #b45309;
			font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
		}
		* { box-sizing: border-box; }
		body {
			margin: 0;
			min-height: 100vh;
			display: grid;
			place-items: center;
			background: #f4f7f9;
			color: var(--ink);
			padding: 22px;
		}
		.login {
			width: min(420px, 100%);
			background: white;
			border: 1px solid var(--line);
			border-radius: 8px;
			box-shadow: 0 18px 50px rgba(20, 37, 49, 0.12);
			overflow: hidden;
		}
		.head {
			background: #122029;
			color: white;
			padding: 22px;
			display: flex;
			align-items: center;
			gap: 12px;
		}
		.logo {
			width: 42px;
			height: 42px;
			border-radius: 8px;
			background: linear-gradient(135deg, #11a39a, #d97706);
			display: grid;
			place-items: center;
			font-weight: 800;
		}
		h1 { margin: 0; font-size: 20px; }
		p { margin: 5px 0 0; color: #b6c5ce; font-size: 13px; }
		form {
			padding: 22px;
			display: grid;
			gap: 14px;
		}
		label {
			display: grid;
			gap: 7px;
			color: var(--muted);
			font-size: 13px;
			font-weight: 650;
		}
		input {
			width: 100%;
			border: 1px solid var(--line);
			border-radius: 7px;
			padding: 12px;
			font: inherit;
		}
		input:focus {
			outline: none;
			border-color: var(--brand);
			box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.12);
		}
		button {
			min-height: 42px;
			border: 0;
			border-radius: 7px;
			background: var(--ink);
			color: white;
			font: inherit;
			cursor: pointer;
		}
		.note {
			color: var(--muted);
			font-size: 12px;
			line-height: 1.45;
		}
		.error {
			background: #fef2f2;
			color: #b91c1c;
			border: 1px solid #fecaca;
			border-radius: 7px;
			padding: 10px 12px;
			font-size: 13px;
			display: none;
		}
		.error.show { display: block; }
	</style>
</head>
<body>
	<section class="login">
		<div class="head">
			<div class="logo">UC</div>
			<div>
				<h1>UbuntuCode Admin</h1>
				<p>Acesso operacional</p>
			</div>
		</div>
		<form method="post" action="/admin/login">
			<div class="error" id="error">Senha inválida.</div>
			<label>
				Email
				<input name="email" type="email" autocomplete="username" placeholder="admin@ubuntucode.com" />
			</label>
			<label>
				Senha
				<input name="password" type="password" autocomplete="current-password" autofocus required />
			</label>
			<button type="submit">Entrar</button>
			<div class="note">Use seu usuário admin. Enquanto nenhum usuário estiver criado, o acesso continua aceitando a senha ADMIN_PASSWORD/API_KEY.</div>
		</form>
	</section>
	<script>
		if (new URLSearchParams(location.search).get("error")) {
			document.getElementById("error").classList.add("show");
		}
	</script>
</body>
</html>`;

export const adminHtml = String.raw`<!doctype html>
<html lang="pt-BR">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>UbuntuCode Admin</title>
	<style>
		:root {
			color-scheme: light;
			--ink: #172026;
			--muted: #65727d;
			--line: #d9e0e6;
			--panel: #ffffff;
			--surface: #f4f7f9;
			--soft: #e9f1f4;
			--brand: #0f766e;
			--brand-strong: #115e59;
			--accent: #b45309;
			--danger: #b91c1c;
			--ok: #166534;
			--radius: 8px;
			--shadow: 0 10px 30px rgba(20, 37, 49, 0.08);
			font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
		}

		* { box-sizing: border-box; }
		body {
			margin: 0;
			min-height: 100vh;
			background: var(--surface);
			color: var(--ink);
		}

		button, input, textarea, select {
			font: inherit;
		}

		button {
			border: 1px solid transparent;
			border-radius: 7px;
			background: var(--ink);
			color: white;
			min-height: 38px;
			padding: 0 12px;
			cursor: pointer;
		}

		button:hover { filter: brightness(0.96); }
		button.secondary {
			background: white;
			color: var(--ink);
			border-color: var(--line);
		}
		button.danger {
			background: var(--danger);
		}
		button.icon {
			width: 38px;
			padding: 0;
			display: inline-grid;
			place-items: center;
		}

		input, textarea, select {
			width: 100%;
			border: 1px solid var(--line);
			border-radius: 7px;
			background: white;
			color: var(--ink);
			padding: 10px 11px;
			outline: none;
		}
		textarea { min-height: 104px; resize: vertical; }
		input:focus, textarea:focus, select:focus {
			border-color: var(--brand);
			box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.12);
		}

		.shell {
			min-height: 100vh;
			display: grid;
			grid-template-columns: 270px minmax(0, 1fr);
		}
		.sidebar {
			background: #122029;
			color: white;
			padding: 22px;
			display: flex;
			flex-direction: column;
			gap: 22px;
		}
		.brand {
			display: flex;
			align-items: center;
			gap: 12px;
			min-width: 0;
		}
		.logo {
			width: 38px;
			height: 38px;
			border-radius: 8px;
			background: linear-gradient(135deg, #11a39a, #d97706);
			display: grid;
			place-items: center;
			font-weight: 800;
		}
		.brand strong { display: block; font-size: 15px; }
		.brand span { color: #b6c5ce; font-size: 12px; }
		.nav {
			display: grid;
			gap: 7px;
		}
		.nav button {
			background: transparent;
			border-color: transparent;
			color: #dce7ed;
			text-align: left;
			display: flex;
			align-items: center;
			gap: 10px;
		}
		.nav button.active {
			background: rgba(255,255,255,0.1);
			color: white;
			border-color: rgba(255,255,255,0.12);
		}
		.nav svg, .toolbar svg { width: 18px; height: 18px; }
		.keybox {
			margin-top: auto;
			display: grid;
			gap: 10px;
			padding: 14px;
			border: 1px solid rgba(255,255,255,0.1);
			border-radius: var(--radius);
			background: rgba(255,255,255,0.06);
		}
		.keybox label { color: #b6c5ce; font-size: 12px; }
		.keybox input {
			background: rgba(255,255,255,0.1);
			border-color: rgba(255,255,255,0.14);
			color: white;
		}

		.main {
			min-width: 0;
			display: flex;
			flex-direction: column;
		}
		.topbar {
			min-height: 72px;
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 16px;
			padding: 16px 24px;
			background: white;
			border-bottom: 1px solid var(--line);
		}
		.title h1 {
			margin: 0;
			font-size: 24px;
			line-height: 1.15;
		}
		.title p {
			margin: 4px 0 0;
			color: var(--muted);
			font-size: 14px;
		}
		.status {
			display: inline-flex;
			align-items: center;
			gap: 8px;
			border: 1px solid var(--line);
			border-radius: 999px;
			padding: 7px 11px;
			background: white;
			color: var(--muted);
			font-size: 13px;
		}
		.dot {
			width: 8px;
			height: 8px;
			border-radius: 50%;
			background: var(--accent);
		}
		.dot.ok { background: var(--ok); }

		.content {
			padding: 24px;
			display: grid;
			gap: 18px;
		}
		.metrics {
			display: grid;
			grid-template-columns: repeat(4, minmax(0, 1fr));
			gap: 14px;
		}
		.metric {
			background: white;
			border: 1px solid var(--line);
			border-radius: var(--radius);
			padding: 16px;
			box-shadow: var(--shadow);
		}
		.metric span {
			display: block;
			color: var(--muted);
			font-size: 12px;
			margin-bottom: 8px;
		}
		.metric strong { font-size: 28px; }

		.workbench {
			display: grid;
			grid-template-columns: minmax(0, 1.3fr) minmax(340px, 0.7fr);
			gap: 18px;
			align-items: start;
		}
		.panel {
			background: white;
			border: 1px solid var(--line);
			border-radius: var(--radius);
			box-shadow: var(--shadow);
			min-width: 0;
		}
		.panel-head {
			padding: 14px 16px;
			border-bottom: 1px solid var(--line);
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 12px;
		}
		.panel-head h2 {
			margin: 0;
			font-size: 16px;
		}
		.toolbar {
			display: flex;
			gap: 8px;
			align-items: center;
		}
		.table-wrap { overflow-x: auto; }
		table {
			width: 100%;
			border-collapse: collapse;
			min-width: 680px;
		}
		th, td {
			text-align: left;
			padding: 12px 14px;
			border-bottom: 1px solid var(--line);
			vertical-align: top;
			font-size: 14px;
		}
		th {
			color: var(--muted);
			font-size: 12px;
			font-weight: 650;
			background: #fbfcfd;
		}
		td .muted { color: var(--muted); font-size: 12px; margin-top: 4px; }
		.actions { display: flex; gap: 6px; justify-content: flex-end; }
		.pill {
			display: inline-flex;
			align-items: center;
			border-radius: 999px;
			padding: 4px 8px;
			background: var(--soft);
			color: var(--brand-strong);
			font-size: 12px;
		}

		form {
			padding: 16px;
			display: grid;
			gap: 12px;
		}
		.form-grid {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 12px;
		}
		.field {
			display: grid;
			gap: 6px;
		}
		.field.full { grid-column: 1 / -1; }
		.field label {
			color: var(--muted);
			font-size: 12px;
			font-weight: 650;
		}
		.empty {
			padding: 28px;
			color: var(--muted);
			text-align: center;
		}
		.chat {
			padding: 16px;
			display: grid;
			grid-template-rows: minmax(260px, 1fr) auto;
			gap: 12px;
		}
		.messages {
			min-height: 300px;
			max-height: 520px;
			overflow-y: auto;
			display: grid;
			align-content: start;
			gap: 10px;
			padding: 4px 2px;
		}
		.bubble {
			width: min(88%, 620px);
			border-radius: 8px;
			padding: 11px 12px;
			line-height: 1.45;
			white-space: pre-wrap;
			font-size: 14px;
		}
		.bubble.user {
			justify-self: end;
			background: var(--brand);
			color: white;
		}
		.bubble.assistant {
			justify-self: start;
			background: var(--soft);
			color: var(--ink);
		}
		.bubble.loading {
			color: var(--muted);
			font-style: italic;
		}
		.composer {
			display: grid;
			grid-template-columns: minmax(0, 1fr) auto;
			gap: 10px;
			padding: 0;
		}
		.composer textarea {
			min-height: 48px;
			max-height: 130px;
		}
		.composer button {
			min-width: 96px;
			height: 48px;
			align-self: end;
		}
		.ai-tools {
			grid-column: 1 / -1;
			display: grid;
			gap: 10px;
			padding: 12px;
			border: 1px solid var(--line);
			border-radius: var(--radius);
			background: #fbfcfd;
		}
		.ai-tools strong {
			font-size: 13px;
		}
		.ai-actions {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 8px;
		}
		.ai-actions button {
			background: white;
			color: var(--ink);
			border-color: var(--line);
		}
		.ai-suggestion {
			display: none;
			border-left: 3px solid var(--brand);
			padding: 10px 12px;
			background: white;
			color: var(--muted);
			font-size: 13px;
			line-height: 1.45;
			white-space: pre-wrap;
		}
		.ai-suggestion.show {
			display: block;
		}
		.upload-row {
			display: grid;
			grid-template-columns: minmax(0, 1fr) auto;
			gap: 8px;
		}
		.upload-row input[type="file"] {
			padding: 8px;
		}
		.detail {
			margin-top: 12px;
			padding: 14px;
			border: 1px solid var(--line);
			border-radius: var(--radius);
			background: #fbfcfd;
			display: grid;
			gap: 8px;
			white-space: pre-wrap;
			color: var(--muted);
			font-size: 13px;
		}
		.toast {
			position: fixed;
			right: 18px;
			bottom: 18px;
			max-width: 360px;
			background: #122029;
			color: white;
			border-radius: var(--radius);
			padding: 13px 14px;
			box-shadow: var(--shadow);
			transform: translateY(18px);
			opacity: 0;
			pointer-events: none;
			transition: 0.18s ease;
		}
		.toast.show {
			transform: translateY(0);
			opacity: 1;
		}

		@media (max-width: 980px) {
			.shell { grid-template-columns: 1fr; }
			.sidebar { position: static; }
			.metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
			.workbench { grid-template-columns: 1fr; }
		}
		@media (max-width: 620px) {
			.topbar { align-items: flex-start; flex-direction: column; }
			.content { padding: 16px; }
			.metrics { grid-template-columns: 1fr; }
			.form-grid { grid-template-columns: 1fr; }
			.sidebar { padding: 16px; }
			.composer { grid-template-columns: 1fr; }
			.composer button { width: 100%; }
			.ai-actions { grid-template-columns: 1fr; }
		}
	</style>
</head>
<body>
	<div class="shell">
		<aside class="sidebar">
			<div class="brand">
				<div class="logo">UC</div>
				<div>
					<strong>UbuntuCode</strong>
					<span>Admin Console</span>
				</div>
			</div>
			<nav class="nav" id="nav"></nav>
			<div class="keybox">
				<label>Sessão</label>
				<div style="color:#dce7ed;font-size:13px;line-height:1.45">Conectado por cookie seguro.</div>
				<form method="post" action="/admin/logout" style="padding:0;display:block">
					<button type="submit">Sair</button>
				</form>
			</div>
		</aside>
		<main class="main">
			<header class="topbar">
				<div class="title">
					<h1 id="pageTitle">Projetos</h1>
					<p id="pageSubtitle">Gerencie o que está publicado e em construção.</p>
				</div>
				<div class="status"><span class="dot" id="healthDot"></span><span id="healthText">Verificando API</span></div>
			</header>
			<section class="content">
				<div class="metrics" id="metrics"></div>
				<div class="workbench">
					<section class="panel">
						<div class="panel-head">
							<h2 id="listTitle">Registros</h2>
							<div class="toolbar">
								<button class="secondary icon" id="refresh" title="Atualizar" type="button">↻</button>
							</div>
						</div>
						<div class="table-wrap" id="table"></div>
					</section>
					<section class="panel">
						<div class="panel-head">
							<h2 id="formTitle">Novo registro</h2>
							<div class="toolbar">
								<button class="secondary" id="clearForm" type="button">Limpar</button>
							</div>
						</div>
						<form id="editor"></form>
					</section>
				</div>
			</section>
		</main>
	</div>
	<div class="toast" id="toast"></div>
	<script>
		const icons = {
			dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>',
			projects: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7h18"/><path d="M6 7V5h12v2"/><rect x="4" y="7" width="16" height="13" rx="2"/></svg>',
			articles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5V5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-1.5Z"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>',
			users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
			admins: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3Z"/><path d="m9 12 2 2 4-4"/></svg>',
			leads: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="m22 6-10 7L2 6"/></svg>',
			webhooks: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 16.98A6 6 0 0 0 12 7h-1"/><path d="M8 7H5"/><path d="m8 4-3 3 3 3"/><path d="M6 17a6 6 0 0 0 6-10"/><path d="M16 17h3"/><path d="m16 20 3-3-3-3"/></svg>',
			history: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 5 5.3L3 8"/><path d="M12 7v5l3 2"/></svg>',
			drafts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
			ai: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4"/><path d="M12 18v4"/><path d="m4.93 4.93 2.83 2.83"/><path d="m16.24 16.24 2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="m4.93 19.07 2.83-2.83"/><path d="m16.24 7.76 2.83-2.83"/><circle cx="12" cy="12" r="3"/></svg>'
		};
		const resources = {
			dashboard: {
				title: "Dashboard",
				subtitle: "Visão operacional do UbuntuCode.",
				dashboard: true
			},
			projects: {
				title: "Projetos",
				subtitle: "Gerencie produtos, repositórios e URLs públicas.",
				path: "/projects",
				id: "slug",
				columns: ["slug", "title", "status", "summary"],
				fields: [
					["slug", "Slug"], ["title", "Titulo"], ["summary", "Resumo", "textarea"],
					["status", "Status", "select", ["draft", "active", "archived"]],
					["repository_url", "Repositorio"], ["live_url", "URL publica"],
					["image_url", "Imagem de capa"], ["tags", "Tags"],
					["seo_title", "SEO title"], ["seo_description", "SEO description", "textarea"]
				]
			},
			articles: {
				title: "Artigos",
				subtitle: "Publique e mantenha conteúdo técnico.",
				path: "/articles",
				id: "slug",
				columns: ["slug", "title", "status", "excerpt"],
				fields: [
					["slug", "Slug"], ["title", "Titulo"], ["excerpt", "Resumo", "textarea"],
					["content", "Conteudo", "textarea"], ["status", "Status", "select", ["draft", "published", "archived"]],
					["image_url", "Imagem de capa"], ["category", "Categoria"], ["tags", "Tags"],
					["seo_title", "SEO title"], ["seo_description", "SEO description", "textarea"]
				]
			},
			users: {
				title: "Usuários",
				subtitle: "Controle autores, operadores e administradores.",
				path: "/users",
				id: "id",
				columns: ["id", "email", "name", "role"],
				fields: [["email", "Email"], ["name", "Nome"], ["role", "Papel", "select", ["member", "admin"]]]
			},
			admins: {
				title: "Admins",
				subtitle: "Crie logins reais para acessar o painel.",
				path: "/admin-users",
				id: "id",
				columns: ["id", "email", "name", "role"],
				fields: [["email", "Email"], ["name", "Nome"], ["password", "Senha"], ["role", "Papel", "select", ["admin", "editor"]]]
			},
			leads: {
				title: "Leads",
				subtitle: "Mensagens e oportunidades recebidas pelo site.",
				path: "/leads",
				id: "id",
				readOnly: true,
				authList: true,
				columns: ["id", "name", "email", "source", "message"]
			},
			history: {
				title: "Histórico de IA",
				subtitle: "Audite prompts, respostas e provedores usados.",
				path: "/ai/history",
				id: "id",
				readOnly: true,
				authList: true,
				columns: ["id", "kind", "provider", "created_at"]
			},
			drafts: {
				title: "Rascunhos IA",
				subtitle: "Gere e aprove rascunhos antes de publicar.",
				path: "/ai/drafts",
				id: "id",
				readOnly: true,
				authList: true,
				columns: ["id", "title", "provider", "created_at"],
				drafts: true
			},
			webhooks: {
				title: "Webhooks",
				subtitle: "Audite eventos recebidos pela API.",
				path: "/webhooks/events",
				id: "id",
				readOnly: true,
				authList: true,
				columns: ["id", "source", "event_type", "received_at"]
			},
			ai: {
				title: "Assistente",
				subtitle: "Teste fluxos de IA protegidos pela API key.",
				path: "/ai/assist",
				ai: true
			}
		};
		const state = { current: "dashboard", rows: [], editing: null, metrics: {}, aiMessages: [], dashboard: {} };
		const el = (id) => document.getElementById(id);
		function toast(message) {
			const node = el("toast");
			node.textContent = message;
			node.classList.add("show");
			setTimeout(() => node.classList.remove("show"), 2600);
		}
		function headers(json = true) {
			const h = {};
			if (json) h["Content-Type"] = "application/json";
			return h;
		}
		async function request(path, options = {}) {
			const response = await fetch(path, options);
			const body = await response.json().catch(() => ({}));
			if (!response.ok) {
				const message = body.errors?.[0]?.message || "Falha na requisicao";
				throw new Error(message);
			}
			return body.result;
		}
		function renderNav() {
			el("nav").innerHTML = Object.entries(resources).map(([key, item]) => (
				'<button type="button" class="' + (key === state.current ? "active" : "") + '" data-nav="' + key + '">' +
				icons[key] + '<span>' + item.title + '</span></button>'
			)).join("");
			document.querySelectorAll("[data-nav]").forEach((button) => {
				button.addEventListener("click", () => {
					state.current = button.dataset.nav;
					state.editing = null;
					load();
				});
			});
		}
		function renderMetrics() {
			const cards = [
				["Projetos", state.metrics.projects ?? "–"],
				["Artigos", state.metrics.articles ?? "–"],
				["Usuários", state.metrics.users ?? "–"],
				["Leads", state.metrics.leads ?? "–"],
				["Rascunhos", state.metrics.drafts ?? "–"]
			];
			el("metrics").innerHTML = cards.map(([label, value]) =>
				'<div class="metric"><span>' + label + '</span><strong>' + value + '</strong></div>'
			).join("");
		}
		function escapeHtml(value) {
			return String(value ?? "").replace(/[&<>"']/g, (char) => ({
				"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
			})[char]);
		}
		function renderTable(resource) {
			if (resource.dashboard) {
				const recentLeads = state.dashboard.leads || [];
				const recentHistory = state.dashboard.history || [];
				el("table").innerHTML = '<div class="detail"><strong>Leads recentes</strong>' +
					(recentLeads.length ? recentLeads.map((lead) => '<div>' + escapeHtml(lead.name) + ' · ' + escapeHtml(lead.email) + '<br>' + escapeHtml(lead.message) + '</div>').join("") : '<div>Nenhum lead recente.</div>') +
					'<strong>IA recente</strong>' +
					(recentHistory.length ? recentHistory.map((item) => '<div>' + escapeHtml(item.kind) + ' · ' + escapeHtml(item.provider) + '<br>' + escapeHtml(item.response).slice(0, 160) + '</div>').join("") : '<div>Nenhum uso recente de IA.</div>') +
					'</div>';
				return;
			}
			if (resource.ai) {
				el("table").innerHTML = '<div class="empty">A conversa acontece no painel ao lado.</div>';
				return;
			}
			if (!state.rows.length) {
				el("table").innerHTML = '<div class="empty">Nenhum registro por enquanto.</div>';
				return;
			}
			const head = resource.columns.map((column) => '<th>' + column + '</th>').join("") + "<th></th>";
			const rows = state.rows.map((row) => {
				const cells = resource.columns.map((column) => {
					const value = row[column];
					const displayValue = column === "message" || column === "prompt" || column === "response"
						? String(value ?? "").slice(0, 120)
						: value;
					const content = column === "status" || column === "role"
						? '<span class="pill">' + escapeHtml(displayValue) + '</span>'
						: escapeHtml(displayValue);
					return '<td>' + content + '</td>';
				}).join("");
				const key = row[resource.id];
				const actions = resource.readOnly
					? '<td><div class="actions"><button class="secondary icon" title="Detalhes" data-detail="' + key + '">…</button></div></td>'
					: '<td><div class="actions"><button class="secondary icon" title="Editar" data-edit="' + key + '">✎</button><button class="danger icon" title="Excluir" data-delete="' + key + '">×</button></div></td>';
				return '<tr>' + cells + actions + '</tr>';
			}).join("");
			el("table").innerHTML = '<table><thead><tr>' + head + '</tr></thead><tbody>' + rows + '</tbody></table>';
			document.querySelectorAll("[data-edit]").forEach((button) => button.addEventListener("click", () => editRow(button.dataset.edit)));
			document.querySelectorAll("[data-delete]").forEach((button) => button.addEventListener("click", () => deleteRow(button.dataset.delete)));
			document.querySelectorAll("[data-detail]").forEach((button) => button.addEventListener("click", () => showDetail(button.dataset.detail)));
		}
		function renderForm(resource) {
			if (resource.dashboard) {
				el("formTitle").textContent = "Ações rápidas";
				el("editor").innerHTML = '<div class="detail"><button type="button" data-jump="articles">Novo artigo</button><button type="button" data-jump="drafts">Gerar rascunho IA</button><button type="button" data-jump="leads">Ver leads</button><button type="button" data-jump="history">Histórico de IA</button></div>';
				document.querySelectorAll("[data-jump]").forEach((button) => button.addEventListener("click", () => {
					state.current = button.dataset.jump;
					state.editing = null;
					load();
				}));
				return;
			}
			if (resource.readOnly) {
				el("formTitle").textContent = resource.drafts ? "Gerar rascunho" : "Detalhes";
				el("editor").innerHTML = resource.drafts
					? '<div class="field"><label for="draftBriefing">Briefing</label><textarea id="draftBriefing" placeholder="Descreva o artigo, público, objetivo e pontos principais"></textarea></div><div class="field"><label for="draftTone">Tom</label><input id="draftTone" value="tecnico, claro e util" /></div><button type="button" id="generateDraft">Gerar rascunho</button><div class="detail" id="draftPreview">Os rascunhos gerados aparecem na lista.</div>'
					: '<div class="empty">Selecione um registro para ver os detalhes.</div>';
				const draftButton = el("generateDraft");
				if (draftButton) draftButton.addEventListener("click", generateDraft);
				return;
			}
			if (resource.ai) {
				el("formTitle").textContent = "Conversa";
				el("editor").innerHTML = '<div class="chat"><div class="messages" id="messages"></div><div class="composer"><textarea id="prompt" name="prompt" placeholder="Escreva e pressione Enter" required></textarea><button id="sendPrompt" type="submit">Enviar</button></div></div>';
				renderMessages();
				const prompt = el("prompt");
				prompt.addEventListener("keydown", (event) => {
					if (event.key === "Enter" && !event.shiftKey) {
						event.preventDefault();
						el("editor").requestSubmit();
					}
				});
				return;
			}
			el("formTitle").textContent = state.editing ? "Editar registro" : "Novo registro";
			const current = state.editing || {};
			const fields = resource.fields.map(([name, label, type, options]) => {
				const value = current[name] ?? "";
				if (type === "textarea") return '<div class="field full"><label for="' + name + '">' + label + '</label><textarea id="' + name + '" name="' + name + '">' + escapeHtml(value) + '</textarea></div>';
				if (type === "select") return '<div class="field"><label for="' + name + '">' + label + '</label><select id="' + name + '" name="' + name + '">' + options.map((option) => '<option value="' + option + '"' + (value === option ? " selected" : "") + '>' + option + '</option>').join("") + '</select></div>';
				if (name === "image_url") return '<div class="field full"><label for="' + name + '">' + label + '</label><input id="' + name + '" name="' + name + '" value="' + escapeHtml(value) + '" /><div class="upload-row"><input id="assetFile" type="file" accept="image/*" /><button type="button" class="secondary" id="uploadAsset">Upload</button></div></div>';
				return '<div class="field"><label for="' + name + '">' + label + '</label><input id="' + name + '" name="' + name + '" value="' + escapeHtml(value) + '" /></div>';
			}).join("");
			const articleTools = state.current === "articles"
				? '<div class="ai-tools"><strong>IA editorial</strong><div class="ai-actions"><button type="button" data-ai-article="title">Sugerir título</button><button type="button" data-ai-article="excerpt">Gerar resumo</button><button type="button" data-ai-article="improve">Melhorar texto</button><button type="button" data-ai-article="tags">Sugerir tags</button><button type="button" data-ai-article="full">Gerar artigo</button><button type="button" data-ai-article="seo">Gerar SEO</button><button type="button" data-ai-article="linkedin">Post LinkedIn</button><button type="button" data-ai-article="tone">Reescrever tom</button></div><div class="ai-suggestion" id="articleSuggestion"></div></div>'
				: '';
			const previewPath = state.current === "articles" ? "/blog/" : state.current === "projects" ? "/projetos/" : "";
			const preview = previewPath && (current.slug || el("slug")?.value)
				? '<a class="button secondary" target="_blank" href="' + previewPath + encodeURIComponent(current.slug || "") + '">Preview público</a>'
				: '';
			el("editor").innerHTML = '<div class="form-grid">' + fields + articleTools + '</div><div class="actions">' + preview + '<button type="submit">' + (state.editing ? "Salvar alteracoes" : "Criar") + '</button></div>';
			document.querySelectorAll("[data-ai-article]").forEach((button) => {
				button.addEventListener("click", () => runArticleAi(button.dataset.aiArticle));
			});
			const uploadButton = el("uploadAsset");
			if (uploadButton) uploadButton.addEventListener("click", uploadAsset);
		}
		async function generateDraft() {
			const briefing = String(el("draftBriefing")?.value || "").trim();
			const tone = String(el("draftTone")?.value || "tecnico, claro e util").trim();
			if (!briefing) {
				toast("Preencha o briefing");
				return;
			}
			try {
				el("generateDraft").textContent = "Gerando...";
				const draft = await request("/ai/drafts", {
					method: "POST",
					headers: headers(),
					body: JSON.stringify({ briefing, tone })
				});
				el("draftPreview").innerHTML = '<strong>' + escapeHtml(draft.title) + '</strong><div>' + escapeHtml(draft.excerpt) + '</div><button type="button" id="useDraft">Usar em novo artigo</button>';
				el("useDraft").addEventListener("click", () => {
					state.current = "articles";
					state.editing = {
						slug: draft.title.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72),
						title: draft.title,
						excerpt: draft.excerpt,
						content: draft.content,
						status: "draft",
						tags: draft.tags,
						seo_title: draft.seo_title,
						seo_description: draft.seo_description,
					};
					load();
				});
				toast("Rascunho gerado");
				await loadRows(resources.drafts);
				renderTable(resources.drafts);
			} catch (error) {
				toast(error.message);
			} finally {
				if (el("generateDraft")) el("generateDraft").textContent = "Gerar rascunho";
			}
		}
		function showDetail(key) {
			const resource = resources[state.current];
			const row = state.rows.find((item) => String(item[resource.id]) === String(key));
			if (!row) return;
			el("formTitle").textContent = "Detalhes";
			const parts = Object.entries(row).map(([name, value]) => '<strong>' + escapeHtml(name) + '</strong><div>' + escapeHtml(value) + '</div>');
			el("editor").innerHTML = '<div class="detail">' + parts.join("") + '</div>';
		}
		async function uploadAsset() {
			const input = el("assetFile");
			const file = input?.files?.[0];
			if (!file) {
				toast("Escolha uma imagem primeiro");
				return;
			}
			try {
				const data = new FormData();
				data.set("file", file);
				const result = await request("/assets/upload", {
					method: "POST",
					body: data,
				});
				el("image_url").value = result.url;
				toast("Imagem enviada");
			} catch (error) {
				toast(error.message);
			}
		}
		function editRow(key) {
			const resource = resources[state.current];
			state.editing = state.rows.find((row) => String(row[resource.id]) === String(key));
			renderForm(resource);
		}
		async function deleteRow(key) {
			const resource = resources[state.current];
			if (!confirm("Excluir este registro?")) return;
			try {
				await request(resource.path + "/" + encodeURIComponent(key), { method: "DELETE", headers: headers(false) });
				toast("Registro excluido");
				await load();
			} catch (error) {
				toast(error.message);
			}
		}
		function formPayload(resource) {
			const data = new FormData(el("editor"));
			const payload = {};
			const nullableFields = new Set(["repository_url", "live_url", "published_at", "image_url", "tags", "category", "seo_title", "seo_description"]);
			for (const [key, value] of data.entries()) {
				const text = String(value);
				payload[key] = nullableFields.has(key) && text.trim() === "" ? null : text;
			}
			if (state.current === "articles" && payload.status === "published") {
				const currentPublishedAt = state.editing?.published_at;
				payload.published_at = currentPublishedAt || new Date().toISOString();
			}
			if (state.current === "articles" && payload.status && payload.status !== "published") {
				payload.published_at = null;
			}
			if (!state.editing) return payload;
			for (const key of Object.keys(payload)) {
				if ((payload[key] ?? "") === (state.editing[key] ?? "")) delete payload[key];
			}
			return payload;
		}
		function articleDraft() {
			return {
				title: el("title")?.value || "",
				excerpt: el("excerpt")?.value || "",
				content: el("content")?.value || "",
				briefing: el("content")?.value || el("excerpt")?.value || "",
				tone: "tecnico, claro e util",
			};
		}
		async function runArticleAi(action) {
			const output = el("articleSuggestion");
			const button = document.querySelector('[data-ai-article="' + action + '"]');
			try {
				if (button) button.textContent = "Gerando...";
				const result = await request("/ai/articles", {
					method: "POST",
					headers: headers(),
					body: JSON.stringify({ action, ...articleDraft() })
				});
				const suggestion = result.suggestion || "";
				if (action === "title" && el("title")) el("title").value = suggestion;
				if (action === "excerpt" && el("excerpt")) el("excerpt").value = suggestion;
				if ((action === "improve" || action === "full" || action === "tone") && el("content")) el("content").value = suggestion;
				if (action === "tags" && el("tags")) el("tags").value = suggestion;
				if (action === "seo") {
					try {
						const seo = JSON.parse(suggestion);
						if (seo.title && el("seo_title")) el("seo_title").value = seo.title;
						if (seo.description && el("seo_description")) el("seo_description").value = seo.description;
						if (seo.tags && el("tags")) el("tags").value = Array.isArray(seo.tags) ? seo.tags.join(", ") : seo.tags;
					} catch {}
				}
				if (output) {
					output.textContent = action === "tags" ? "Tags sugeridas: " + suggestion : suggestion;
					output.classList.add("show");
				}
				toast("Sugestao aplicada");
			} catch (error) {
				if (output) {
					output.textContent = error.message;
					output.classList.add("show");
				}
				toast(error.message);
			} finally {
				if (button) {
					const labels = { title: "Sugerir título", excerpt: "Gerar resumo", improve: "Melhorar texto", tags: "Sugerir tags", full: "Gerar artigo", seo: "Gerar SEO", linkedin: "Post LinkedIn", tone: "Reescrever tom" };
					button.textContent = labels[action] || "Gerar";
				}
			}
		}
		async function submitForm(event) {
			event.preventDefault();
			const resource = resources[state.current];
			try {
				if (resource.ai) {
					const promptEl = el("prompt");
					const prompt = String(promptEl.value || "").trim();
					if (!prompt) return;
					promptEl.value = "";
					promptEl.focus();
					state.aiMessages.push({ role: "user", content: prompt });
					state.aiMessages.push({ role: "assistant", content: "Pensando...", loading: true });
					renderMessages();
					const result = await request(resource.path, {
						method: "POST",
						headers: headers(),
						body: JSON.stringify({ prompt })
					});
					state.aiMessages.pop();
					state.aiMessages.push({ role: "assistant", content: result.answer });
					renderMessages();
					return;
				}
				const key = state.editing?.[resource.id];
				const payload = formPayload(resource);
				const path = state.editing ? resource.path + "/" + encodeURIComponent(key) : resource.path;
				await request(path, {
					method: state.editing ? "PATCH" : "POST",
					headers: headers(),
					body: JSON.stringify(payload)
				});
				toast(state.editing ? "Registro atualizado" : "Registro criado");
				state.editing = null;
				await load();
			} catch (error) {
				if (resources[state.current].ai) {
					const last = state.aiMessages[state.aiMessages.length - 1];
					if (last?.loading) state.aiMessages.pop();
					state.aiMessages.push({ role: "assistant", content: error.message });
					renderMessages();
				}
				toast(error.message);
			}
		}
		function renderMessages() {
			const box = el("messages");
			if (!box) return;
			if (!state.aiMessages.length) {
				box.innerHTML = '<div class="empty">Comece com uma pergunta, ideia de artigo, resumo de projeto ou comando operacional.</div>';
				return;
			}
			box.innerHTML = state.aiMessages.map((message) =>
				'<div class="bubble ' + message.role + (message.loading ? ' loading' : '') + '">' + escapeHtml(message.content) + '</div>'
			).join("");
			box.scrollTop = box.scrollHeight;
		}
		async function loadMetrics() {
			const names = ["projects", "articles", "users", "admins", "leads", "drafts"];
			await Promise.all(names.map(async (name) => {
				try {
					state.metrics[name] = (await request(resources[name].path)).length;
				} catch {
					state.metrics[name] = "–";
				}
			}));
			state.metrics.webhooks = "●";
			renderMetrics();
		}
		async function loadRows(resource) {
			if (!resource.path) {
				state.rows = [];
				return [];
			}
			try {
				state.rows = await request(resource.path, { headers: resource.authList ? headers(false) : {} });
			} catch (error) {
				state.rows = [];
				toast(error.message);
			}
			return state.rows;
		}
		async function loadDashboard() {
			const [leads, history] = await Promise.all([
				request("/leads?limit=5", { headers: headers(false) }).catch(() => []),
				request("/ai/history?limit=5", { headers: headers(false) }).catch(() => []),
			]);
			state.dashboard = { leads, history };
		}
		async function load() {
			const resource = resources[state.current];
			renderNav();
			el("pageTitle").textContent = resource.title;
			el("pageSubtitle").textContent = resource.subtitle;
			el("listTitle").textContent = resource.title;
			el("clearForm").textContent = resource.ai ? "Nova conversa" : "Limpar";
			renderForm(resource);
			if (resource.dashboard) {
				await loadDashboard();
			} else if (!resource.ai) {
				await loadRows(resource);
			}
			renderTable(resource);
			loadMetrics();
		}
		async function checkHealth() {
			try {
				await request("/health");
				el("healthDot").classList.add("ok");
				el("healthText").textContent = "API online";
			} catch {
				el("healthText").textContent = "API indisponivel";
			}
		}
		el("clearForm").addEventListener("click", () => {
			if (resources[state.current].ai) {
				state.aiMessages = [];
			}
			state.editing = null;
			renderForm(resources[state.current]);
		});
		el("refresh").addEventListener("click", load);
		el("editor").addEventListener("submit", submitForm);
		checkHealth();
		load();
	</script>
</body>
</html>`;
