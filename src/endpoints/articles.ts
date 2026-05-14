import { contentJson, OpenAPIRoute } from "chanfana";
import type { AppContext } from "../types";
import { requireApiKey } from "../auth";
import { getBySlug, notFound, nowIso } from "../db";
import {
	articleCreateSchema,
	articleSchema,
	errorResponse,
	listQuery,
	slugParam,
	successResponse,
} from "../schemas";
import { z } from "zod";

export class ArticleList extends OpenAPIRoute {
	schema = {
		tags: ["Articles"],
		summary: "List articles",
		request: { query: listQuery },
		responses: {
			"200": {
				description: "Articles list",
				...contentJson(successResponse(z.array(articleSchema))),
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const result = await c.env.DB.prepare(
			"SELECT * FROM articles ORDER BY created_at DESC LIMIT ? OFFSET ?",
		)
			.bind(data.query.limit, data.query.offset)
			.all();

		return c.json({ success: true, result: result.results });
	}
}

export class ArticleCreate extends OpenAPIRoute {
	schema = {
		tags: ["Articles"],
		summary: "Create an article",
		request: { body: contentJson(articleCreateSchema) },
		responses: {
			"201": {
				description: "Created article",
				...contentJson(successResponse(articleSchema)),
			},
			"401": { description: "Unauthorized", ...contentJson(errorResponse) },
		},
	};

	async handle(c: AppContext) {
		const unauthorized = requireApiKey(c);
		if (unauthorized) return unauthorized;

		const data = await this.getValidatedData<typeof this.schema>();
		const now = nowIso();
		await c.env.DB.prepare(
			`INSERT INTO articles
				(slug, title, excerpt, content, status, published_at, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		)
			.bind(
				data.body.slug,
				data.body.title,
				data.body.excerpt,
				data.body.content,
				data.body.status,
				data.body.published_at ?? null,
				now,
				now,
			)
			.run();
		const article = await getBySlug(c.env.DB, "articles", data.body.slug);

		return c.json({ success: true, result: article }, 201);
	}
}

export class ArticleRead extends OpenAPIRoute {
	schema = {
		tags: ["Articles"],
		summary: "Get an article by slug",
		request: { params: slugParam },
		responses: {
			"200": {
				description: "Article",
				...contentJson(successResponse(articleSchema)),
			},
			"404": { description: "Not found", ...contentJson(errorResponse) },
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const article = await getBySlug(c.env.DB, "articles", data.params.slug);

		if (!article) return c.json(notFound("Article"), 404);

		return c.json({ success: true, result: article });
	}
}
