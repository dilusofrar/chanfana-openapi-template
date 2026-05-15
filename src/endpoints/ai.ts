import { contentJson, OpenAPIRoute } from "chanfana";
import type { AppContext } from "../types";
import { requireApiKey } from "../auth";
import { aiRequestSchema, errorResponse, successResponse } from "../schemas";
import { z } from "zod";

const aiResponseSchema = z.object({
	answer: z.string(),
	provider: z.string(),
});

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

		if (!c.env.AI) {
			return c.json({
				success: true,
				result: {
					answer: `Recebi: ${data.body.prompt}`,
					provider: "fallback",
				},
			});
		}

		const response = await c.env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
			messages: [
				{
					role: "system",
					content:
						"Voce e o assistente da UbuntuCode. Responda de forma curta, pratica e em portugues.",
				},
				{ role: "user", content: data.body.prompt },
			],
		});

		return c.json({
			success: true,
			result: {
				answer: String(response.response ?? ""),
				provider: "workers-ai",
			},
		});
	}
}
