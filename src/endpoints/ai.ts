import { contentJson, OpenAPIRoute } from "chanfana";
import type { AppContext } from "../types";
import { requireApiKey } from "../auth";
import {
	aiRequestSchema,
	articleAiActionSchema,
	errorResponse,
	successResponse,
} from "../schemas";
import { z } from "zod";

const aiResponseSchema = z.object({
	answer: z.string(),
	provider: z.string(),
});

const articleAiResponseSchema = z.object({
	action: z.enum(["title", "excerpt", "improve", "tags"]),
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
};

function articleContext(data: z.infer<typeof articleAiActionSchema>) {
	return [
		`Titulo atual: ${data.title || "(vazio)"}`,
		`Resumo atual: ${data.excerpt || "(vazio)"}`,
		`Conteudo atual: ${data.content || "(vazio)"}`,
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
		const unauthorized = await requireApiKey(c);
		if (unauthorized) return unauthorized;

		const data = await this.getValidatedData<typeof this.schema>();

		const result = await runAi(c, data.body.prompt);

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
		const unauthorized = await requireApiKey(c);
		if (unauthorized) return unauthorized;

		const data = await this.getValidatedData<typeof this.schema>();
		const result = await runAi(
			c,
			`${articlePrompts[data.body.action]}\n\n${articleContext(data.body)}`,
		);

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
