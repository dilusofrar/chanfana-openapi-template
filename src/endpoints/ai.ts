import { contentJson, OpenAPIRoute } from "chanfana";
import type { AppContext } from "../types";
import { requireApiKey } from "../auth";
import { enforceRateLimit } from "../rateLimit";
import {
	aiHistorySchema,
	aiDraftCreateSchema,
	aiDraftSchema,
	aiRequestSchema,
	articleAiActionSchema,
	errorResponse,
	listQuery,
	successResponse,
} from "../schemas";
import { z } from "zod";

const aiResponseSchema = z.object({
	answer: z.string(),
	provider: z.string(),
});

const articleAiResponseSchema = z.object({
	action: z.enum(["title", "excerpt", "improve", "tags", "full", "seo", "linkedin", "tone"]),
	suggestion: z.string(),
	provider: z.string(),
});

const articlePrompts = {
	title:
		"Sugira um titulo curto, claro e chamativo em portugues para este artigo tecnico. Responda apenas com o titulo.",
	excerpt:
		"Escreva um resumo de ate 220 caracteres em portugues para este artigo. Responda apenas com o resumo.",
	improve:
		"Revise e melhore o conteudo em portugues mantendo o sentido, deixando mais claro, direto e profissional. Responda com o texto revisado.",
	tags:
		"Sugira 5 tags curtas em portugues ou ingles para este artigo tecnico. Responda separadas por virgula.",
	full:
		"Escreva um artigo completo em portugues a partir do briefing. Use titulo, introducao, secoes claras e conclusao pratica.",
	seo:
		"Gere SEO title, meta description e 5 tags para este artigo. Responda em JSON com as chaves title, description e tags.",
	linkedin:
		"Crie um post curto para LinkedIn divulgando este artigo, com tom profissional e chamada para leitura.",
	tone:
		"Reescreva o conteudo no tom solicitado, mantendo as ideias principais e melhorando clareza.",
};

function parseJsonObject(value: string) {
	const first = value.indexOf("{");
	const last = value.lastIndexOf("}");
	if (first === -1 || last === -1 || last <= first) return null;

	try {
		return JSON.parse(value.slice(first, last + 1)) as Record<string, unknown>;
	} catch {
		return null;
	}
}

function articleContext(data: z.infer<typeof articleAiActionSchema>) {
	return [
		`Titulo atual: ${data.title || "(vazio)"}`,
		`Resumo atual: ${data.excerpt || "(vazio)"}`,
		`Conteudo atual: ${data.content || "(vazio)"}`,
		`Briefing: ${data.briefing || "(vazio)"}`,
		`Tom desejado: ${data.tone || "tecnico e claro"}`,
	].join("\n\n");
}

async function runAi(c: AppContext, prompt: string) {
	if (!c.env.AI) {
		return {
			answer: `Sugestao: ${prompt.slice(0, 220)}`,
			provider: "fallback",
		};
	}

	const response = await c.env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
		messages: [
			{
				role: "system",
				content:
					"Voce e o assistente editorial da UbuntuCode. Responda em portugues do Brasil, com clareza e sem enrolacao.",
			},
			{ role: "user", content: prompt },
		],
	});

	return {
		answer: String(response.response ?? ""),
		provider: "workers-ai",
	};
}

async function storeAiHistory(
	c: AppContext,
	kind: string,
	prompt: string,
	response: string,
	provider: string,
) {
	await c.env.DB.prepare(
		"INSERT INTO ai_history (kind, prompt, response, provider) VALUES (?, ?, ?, ?)",
	)
		.bind(kind, prompt.slice(0, 4000), response.slice(0, 8000), provider)
		.run();
}

export class AiAssist extends OpenAPIRoute {
	schema = {
		tags: ["AI"],
		summary: "Generate a short assistant response",
		request: { body: contentJson(aiRequestSchema) },
		responses: {
			"200": {
				description: "AI response",
				...contentJson(successResponse(aiResponseSchema)),
			},
			"401": { description: "Unauthorized", ...contentJson(errorResponse) },
		},
	};

	async handle(c: AppContext) {
		const limited = await enforceRateLimit(c, {
			name: "ai-assist",
			limit: 30,
			windowSeconds: 60,
		});
		if (limited) return limited;

		const unauthorized = await requireApiKey(c);
		if (unauthorized) return unauthorized;

		const data = await this.getValidatedData<typeof this.schema>();

		const result = await runAi(c, data.body.prompt);
		await storeAiHistory(c, "assist", data.body.prompt, result.answer, result.provider);

		return c.json({
			success: true,
			result: {
				answer: result.answer,
				provider: result.provider,
			},
		});
	}
}

export class ArticleAiAssist extends OpenAPIRoute {
	schema = {
		tags: ["AI"],
		summary: "Generate article editorial suggestions",
		request: { body: contentJson(articleAiActionSchema) },
		responses: {
			"200": {
				description: "Article suggestion",
				...contentJson(successResponse(articleAiResponseSchema)),
			},
			"401": { description: "Unauthorized", ...contentJson(errorResponse) },
		},
	};

	async handle(c: AppContext) {
		const limited = await enforceRateLimit(c, {
			name: "ai-articles",
			limit: 30,
			windowSeconds: 60,
		});
		if (limited) return limited;

		const unauthorized = await requireApiKey(c);
		if (unauthorized) return unauthorized;

		const data = await this.getValidatedData<typeof this.schema>();
		const prompt = `${articlePrompts[data.body.action]}\n\n${articleContext(data.body)}`;
		const result = await runAi(
			c,
			prompt,
		);
		await storeAiHistory(c, `article:${data.body.action}`, prompt, result.answer, result.provider);

		return c.json({
			success: true,
			result: {
				action: data.body.action,
				suggestion: result.answer.trim(),
				provider: result.provider,
			},
		});
	}
}

export class AiHistoryList extends OpenAPIRoute {
	schema = {
		tags: ["AI"],
		summary: "List AI usage history",
		request: { query: listQuery },
		responses: {
			"200": {
				description: "AI history",
				...contentJson(successResponse(z.array(aiHistorySchema))),
			},
			"401": { description: "Unauthorized", ...contentJson(errorResponse) },
		},
	};

	async handle(c: AppContext) {
		const unauthorized = await requireApiKey(c);
		if (unauthorized) return unauthorized;

		const data = await this.getValidatedData<typeof this.schema>();
		const result = await c.env.DB.prepare(
			"SELECT * FROM ai_history ORDER BY created_at DESC LIMIT ? OFFSET ?",
		)
			.bind(data.query.limit, data.query.offset)
			.all();

		return c.json({ success: true, result: result.results });
	}
}

export class AiDraftList extends OpenAPIRoute {
	schema = {
		tags: ["AI"],
		summary: "List AI generated article drafts",
		request: { query: listQuery },
		responses: {
			"200": {
				description: "AI drafts",
				...contentJson(successResponse(z.array(aiDraftSchema))),
			},
			"401": { description: "Unauthorized", ...contentJson(errorResponse) },
		},
	};

	async handle(c: AppContext) {
		const unauthorized = await requireApiKey(c);
		if (unauthorized) return unauthorized;

		const data = await this.getValidatedData<typeof this.schema>();
		const result = await c.env.DB.prepare(
			"SELECT * FROM ai_drafts ORDER BY created_at DESC LIMIT ? OFFSET ?",
		)
			.bind(data.query.limit, data.query.offset)
			.all();

		return c.json({ success: true, result: result.results });
	}
}

export class AiDraftCreate extends OpenAPIRoute {
	schema = {
		tags: ["AI"],
		summary: "Generate and store an article draft from a briefing",
		request: { body: contentJson(aiDraftCreateSchema) },
		responses: {
			"201": {
				description: "AI draft",
				...contentJson(successResponse(aiDraftSchema)),
			},
			"401": { description: "Unauthorized", ...contentJson(errorResponse) },
		},
	};

	async handle(c: AppContext) {
		const limited = await enforceRateLimit(c, {
			name: "ai-drafts",
			limit: 20,
			windowSeconds: 60,
		});
		if (limited) return limited;

		const unauthorized = await requireApiKey(c);
		if (unauthorized) return unauthorized;

		const data = await this.getValidatedData<typeof this.schema>();
		const prompt = [
			"Crie um rascunho de artigo para a UbuntuCode a partir do briefing.",
			"Responda apenas em JSON com title, excerpt, content, tags, seo_title e seo_description.",
			`Tom desejado: ${data.body.tone}`,
			`Briefing: ${data.body.briefing}`,
		].join("\n\n");
		const result = await runAi(c, prompt);
		await storeAiHistory(c, "draft", prompt, result.answer, result.provider);
		const parsed = parseJsonObject(result.answer);
		const title = String(parsed?.title ?? "Rascunho gerado por IA");
		const excerpt = String(parsed?.excerpt ?? data.body.briefing.slice(0, 220));
		const content = String(parsed?.content ?? result.answer);
		const tags = Array.isArray(parsed?.tags)
			? parsed.tags.join(", ")
			: parsed?.tags
				? String(parsed.tags)
				: null;
		const seoTitle = parsed?.seo_title ? String(parsed.seo_title) : title;
		const seoDescription = parsed?.seo_description ? String(parsed.seo_description) : excerpt;
		const insert = await c.env.DB.prepare(
			`INSERT INTO ai_drafts
				(title, excerpt, content, tags, seo_title, seo_description, provider)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`,
		)
			.bind(title, excerpt, content, tags, seoTitle, seoDescription, result.provider)
			.run();
		const draft = await c.env.DB.prepare("SELECT * FROM ai_drafts WHERE id = ?")
			.bind(insert.meta.last_row_id)
			.first();

		return c.json({ success: true, result: draft }, 201);
	}
}
