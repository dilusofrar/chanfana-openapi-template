import { contentJson, OpenAPIRoute } from "chanfana";
import type { AppContext } from "../types";
import { requireApiKey } from "../auth";
import { buildUpdate, getBySlug, notFound, nowIso } from "../db";
import {
	articleCreateSchema,
	articleSchema,
	articleUpdateSchema,
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
		const unauthorized = await requireApiKey(c);
		if (unauthorized) return unauthorized;

		const data = await this.getValidatedData<typeof this.schema>();
		const now = nowIso();
		await c.env.DB.prepare(
			`INSERT INTO articles
				(slug, title, excerpt, content, status, published_at, image_url, tags, category, seo_title, seo_description, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		)
			.bind(
				data.body.slug,
				data.body.title,
				data.body.excerpt,
				data.body.content,
				data.body.status,
				data.body.published_at ?? null,
				data.body.image_url ?? null,
				data.body.tags ?? null,
				data.body.category ?? null,
				data.body.seo_title ?? null,
				data.body.seo_description ?? null,
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

export class ArticleUpdate extends OpenAPIRoute {
	schema = {
		tags: ["Articles"],
		summary: "Update an article",
		request: {
			params: slugParam,
			body: contentJson(articleUpdateSchema),
		},
		responses: {
			"200": {
				description: "Updated article",
				...contentJson(successResponse(articleSchema)),
			},
			"401": { description: "Unauthorized", ...contentJson(errorResponse) },
			"404": { description: "Not found", ...contentJson(errorResponse) },
		},
	};

	async handle(c: AppContext) {
		const unauthorized = await requireApiKey(c);
		if (unauthorized) return unauthorized;

		const data = await this.getValidatedData<typeof this.schema>();
		const existing = await getBySlug(c.env.DB, "articles", data.params.slug);
		if (!existing) return c.json(notFound("Article"), 404);

		const update = buildUpdate(
			"articles",
			{
				slug: data.body.slug,
				title: data.body.title,
				excerpt: data.body.excerpt,
				content: data.body.content,
				status: data.body.status,
				published_at: data.body.published_at,
				image_url: data.body.image_url,
				tags: data.body.tags,
				category: data.body.category,
				seo_title: data.body.seo_title,
				seo_description: data.body.seo_description,
			},
			"slug",
		);
		const now = nowIso();
		await c.env.DB.prepare(update.sql)
			.bind(...update.values, now, data.params.slug)
			.run();
		const article = await getBySlug(
			c.env.DB,
			"articles",
			data.body.slug ?? data.params.slug,
		);

		return c.json({ success: true, result: article });
	}
}

export class ArticleDelete extends OpenAPIRoute {
	schema = {
		tags: ["Articles"],
		summary: "Delete an article",
		request: { params: slugParam },
		responses: {
			"200": {
				description: "Deleted article",
				...contentJson(successResponse(articleSchema)),
			},
			"401": { description: "Unauthorized", ...contentJson(errorResponse) },
			"404": { description: "Not found", ...contentJson(errorResponse) },
		},
	};

	async handle(c: AppContext) {
		const unauthorized = await requireApiKey(c);
		if (unauthorized) return unauthorized;

		const data = await this.getValidatedData<typeof this.schema>();
		const article = await getBySlug(c.env.DB, "articles", data.params.slug);
		if (!article) return c.json(notFound("Article"), 404);

		await c.env.DB.prepare("DELETE FROM articles WHERE slug = ?")
			.bind(data.params.slug)
			.run();

		return c.json({ success: true, result: article });
	}
}
