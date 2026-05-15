import { contentJson, OpenAPIRoute } from "chanfana";
import type { AppContext } from "../types";
import { requireApiKey } from "../auth";
import { buildUpdate, getBySlug, notFound, nowIso } from "../db";
import {
	errorResponse,
	listQuery,
	projectCreateSchema,
	projectSchema,
	projectUpdateSchema,
	slugParam,
	successResponse,
} from "../schemas";
import { z } from "zod";

export class ProjectList extends OpenAPIRoute {
	schema = {
		tags: ["Projects"],
		summary: "List projects",
		request: { query: listQuery },
		responses: {
			"200": {
				description: "Projects list",
				...contentJson(successResponse(z.array(projectSchema))),
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const result = await c.env.DB.prepare(
			"SELECT * FROM projects ORDER BY created_at DESC LIMIT ? OFFSET ?",
		)
			.bind(data.query.limit, data.query.offset)
			.all();

		return c.json({ success: true, result: result.results });
	}
}

export class ProjectCreate extends OpenAPIRoute {
	schema = {
		tags: ["Projects"],
		summary: "Create a project",
		request: { body: contentJson(projectCreateSchema) },
		responses: {
			"201": {
				description: "Created project",
				...contentJson(successResponse(projectSchema)),
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
			`INSERT INTO projects
				(slug, title, summary, status, repository_url, live_url, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		)
			.bind(
				data.body.slug,
				data.body.title,
				data.body.summary,
				data.body.status,
				data.body.repository_url ?? null,
				data.body.live_url ?? null,
				now,
				now,
			)
			.run();
		const project = await getBySlug(c.env.DB, "projects", data.body.slug);

		return c.json({ success: true, result: project }, 201);
	}
}

export class ProjectRead extends OpenAPIRoute {
	schema = {
		tags: ["Projects"],
		summary: "Get a project by slug",
		request: { params: slugParam },
		responses: {
			"200": {
				description: "Project",
				...contentJson(successResponse(projectSchema)),
			},
			"404": { description: "Not found", ...contentJson(errorResponse) },
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const project = await getBySlug(c.env.DB, "projects", data.params.slug);

		if (!project) return c.json(notFound("Project"), 404);

		return c.json({ success: true, result: project });
	}
}

export class ProjectUpdate extends OpenAPIRoute {
	schema = {
		tags: ["Projects"],
		summary: "Update a project",
		request: {
			params: slugParam,
			body: contentJson(projectUpdateSchema),
		},
		responses: {
			"200": {
				description: "Updated project",
				...contentJson(successResponse(projectSchema)),
			},
			"401": { description: "Unauthorized", ...contentJson(errorResponse) },
			"404": { description: "Not found", ...contentJson(errorResponse) },
		},
	};

	async handle(c: AppContext) {
		const unauthorized = await requireApiKey(c);
		if (unauthorized) return unauthorized;

		const data = await this.getValidatedData<typeof this.schema>();
		const existing = await getBySlug(c.env.DB, "projects", data.params.slug);
		if (!existing) return c.json(notFound("Project"), 404);

		const update = buildUpdate(
			"projects",
			{
				slug: data.body.slug,
				title: data.body.title,
				summary: data.body.summary,
				status: data.body.status,
				repository_url: data.body.repository_url,
				live_url: data.body.live_url,
			},
			"slug",
		);
		const now = nowIso();
		await c.env.DB.prepare(update.sql)
			.bind(...update.values, now, data.params.slug)
			.run();
		const project = await getBySlug(
			c.env.DB,
			"projects",
			data.body.slug ?? data.params.slug,
		);

		return c.json({ success: true, result: project });
	}
}

export class ProjectDelete extends OpenAPIRoute {
	schema = {
		tags: ["Projects"],
		summary: "Delete a project",
		request: { params: slugParam },
		responses: {
			"200": {
				description: "Deleted project",
				...contentJson(successResponse(projectSchema)),
			},
			"401": { description: "Unauthorized", ...contentJson(errorResponse) },
			"404": { description: "Not found", ...contentJson(errorResponse) },
		},
	};

	async handle(c: AppContext) {
		const unauthorized = await requireApiKey(c);
		if (unauthorized) return unauthorized;

		const data = await this.getValidatedData<typeof this.schema>();
		const project = await getBySlug(c.env.DB, "projects", data.params.slug);
		if (!project) return c.json(notFound("Project"), 404);

		await c.env.DB.prepare("DELETE FROM projects WHERE slug = ?")
			.bind(data.params.slug)
			.run();

		return c.json({ success: true, result: project });
	}
}
