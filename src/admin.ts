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
				<label for="apiKey">Chave manual</label>
				<input id="apiKey" type="password" autocomplete="off" placeholder="Opcional" />
				<button id="saveKey" type="button">Usar fallback</button>
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
			projects: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7h18"/><path d="M6 7V5h12v2"/><rect x="4" y="7" width="16" height="13" rx="2"/></svg>',
			articles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5V5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-1.5Z"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>',
			users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
			webhooks: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 16.98A6 6 0 0 0 12 7h-1"/><path d="M8 7H5"/><path d="m8 4-3 3 3 3"/><path d="M6 17a6 6 0 0 0 6-10"/><path d="M16 17h3"/><path d="m16 20 3-3-3-3"/></svg>',
			ai: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4"/><path d="M12 18v4"/><path d="m4.93 4.93 2.83 2.83"/><path d="m16.24 16.24 2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="m4.93 19.07 2.83-2.83"/><path d="m16.24 7.76 2.83-2.83"/><circle cx="12" cy="12" r="3"/></svg>'
		};
		const resources = {
			projects: {
				title: "Projetos",
				subtitle: "Gerencie produtos, repositórios e URLs públicas.",
				path: "/projects",
				id: "slug",
				columns: ["slug", "title", "status", "summary"],
				fields: [
					["slug", "Slug"], ["title", "Titulo"], ["summary", "Resumo", "textarea"],
					["status", "Status", "select", ["draft", "active", "archived"]],
					["repository_url", "Repositorio"], ["live_url", "URL publica"]
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
					["published_at", "Publicado em"]
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
		const state = { current: "projects", rows: [], editing: null, metrics: {} };
		const el = (id) => document.getElementById(id);
		const apiKey = () => localStorage.getItem("ubuntucode.apiKey") || "";

		function toast(message) {
			const node = el("toast");
			node.textContent = message;
			node.classList.add("show");
			setTimeout(() => node.classList.remove("show"), 2600);
		}
		function headers(json = true) {
			const h = {};
			if (json) h["Content-Type"] = "application/json";
			if (apiKey()) h["x-api-key"] = apiKey();
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
				["Webhooks", state.metrics.webhooks ?? "–"]
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
			if (resource.ai) {
				el("table").innerHTML = '<div class="empty">Use o formulario ao lado para consultar o assistente.</div>';
				return;
			}
			if (!state.rows.length) {
				el("table").innerHTML = '<div class="empty">Nenhum registro por enquanto.</div>';
				return;
			}
			const head = resource.columns.map((column) => '<th>' + column + '</th>').join("") + (resource.readOnly ? "" : "<th></th>");
			const rows = state.rows.map((row) => {
				const cells = resource.columns.map((column) => {
					const value = row[column];
					const content = column === "status" || column === "role"
						? '<span class="pill">' + escapeHtml(value) + '</span>'
						: escapeHtml(value);
					return '<td>' + content + '</td>';
				}).join("");
				const key = row[resource.id];
				const actions = resource.readOnly ? "" : '<td><div class="actions"><button class="secondary icon" title="Editar" data-edit="' + key + '">✎</button><button class="danger icon" title="Excluir" data-delete="' + key + '">×</button></div></td>';
				return '<tr>' + cells + actions + '</tr>';
			}).join("");
			el("table").innerHTML = '<table><thead><tr>' + head + '</tr></thead><tbody>' + rows + '</tbody></table>';
			document.querySelectorAll("[data-edit]").forEach((button) => button.addEventListener("click", () => editRow(button.dataset.edit)));
			document.querySelectorAll("[data-delete]").forEach((button) => button.addEventListener("click", () => deleteRow(button.dataset.delete)));
		}
		function renderForm(resource) {
			if (resource.readOnly) {
				el("formTitle").textContent = "Auditoria";
				el("editor").innerHTML = '<div class="empty">Eventos de webhook sao somente leitura neste painel.</div>';
				return;
			}
			if (resource.ai) {
				el("formTitle").textContent = "Perguntar";
				el("editor").innerHTML = '<div class="field"><label for="prompt">Prompt</label><textarea id="prompt" name="prompt" required></textarea></div><button type="submit">Enviar</button><div id="aiAnswer" class="empty"></div>';
				return;
			}
			el("formTitle").textContent = state.editing ? "Editar registro" : "Novo registro";
			const current = state.editing || {};
			const fields = resource.fields.map(([name, label, type, options]) => {
				const value = current[name] ?? "";
				if (type === "textarea") return '<div class="field full"><label for="' + name + '">' + label + '</label><textarea id="' + name + '" name="' + name + '">' + escapeHtml(value) + '</textarea></div>';
				if (type === "select") return '<div class="field"><label for="' + name + '">' + label + '</label><select id="' + name + '" name="' + name + '">' + options.map((option) => '<option value="' + option + '"' + (value === option ? " selected" : "") + '>' + option + '</option>').join("") + '</select></div>';
				return '<div class="field"><label for="' + name + '">' + label + '</label><input id="' + name + '" name="' + name + '" value="' + escapeHtml(value) + '" /></div>';
			}).join("");
			el("editor").innerHTML = '<div class="form-grid">' + fields + '</div><button type="submit">' + (state.editing ? "Salvar alteracoes" : "Criar") + '</button>';
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
			for (const [key, value] of data.entries()) {
				payload[key] = value === "" ? null : value;
			}
			if (!state.editing) return payload;
			for (const key of Object.keys(payload)) {
				if (payload[key] === state.editing[key]) delete payload[key];
			}
			return payload;
		}
		async function submitForm(event) {
			event.preventDefault();
			const resource = resources[state.current];
			try {
				if (resource.ai) {
					const prompt = new FormData(el("editor")).get("prompt");
					const result = await request(resource.path, {
						method: "POST",
						headers: headers(),
						body: JSON.stringify({ prompt })
					});
					el("aiAnswer").textContent = result.answer;
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
				toast(error.message);
			}
		}
		async function loadMetrics() {
			const names = ["projects", "articles", "users"];
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
		async function load() {
			const resource = resources[state.current];
			renderNav();
			el("pageTitle").textContent = resource.title;
			el("pageSubtitle").textContent = resource.subtitle;
			el("listTitle").textContent = resource.title;
			renderForm(resource);
			if (!resource.ai) {
				try {
					state.rows = await request(resource.path, { headers: resource.authList ? headers(false) : {} });
				} catch (error) {
					state.rows = [];
					toast(error.message);
				}
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
		el("saveKey").addEventListener("click", () => {
			localStorage.setItem("ubuntucode.apiKey", el("apiKey").value.trim());
			toast("Fallback salvo neste navegador");
			load();
		});
		el("clearForm").addEventListener("click", () => {
			state.editing = null;
			renderForm(resources[state.current]);
		});
		el("refresh").addEventListener("click", load);
		el("editor").addEventListener("submit", submitForm);
		el("apiKey").value = apiKey();
		checkHealth();
		load();
	</script>
</body>
</html>`;
