import { contentJson, OpenAPIRoute } from "chanfana";
import type { AppContext } from "../types";
import { requireApiKey } from "../auth";
import { getById, notFound, nowIso } from "../db";
import {
	errorResponse,
	idParam,
	listQuery,
	successResponse,
	userCreateSchema,
	userSchema,
} from "../schemas";
import { z } from "zod";

export class UserList extends OpenAPIRoute {
	schema = {
		tags: ["Users"],
		summary: "List users",
		request: { query: listQuery },
		responses: {
			"200": {
				description: "Users list",
				...contentJson(successResponse(z.array(userSchema))),
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const result = await c.env.DB.prepare(
			"SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?",
		)
			.bind(data.query.limit, data.query.offset)
			.all();

		return c.json({ success: true, result: result.results });
	}
}

export class UserCreate extends OpenAPIRoute {
	schema = {
		tags: ["Users"],
		summary: "Create a user",
		request: { body: contentJson(userCreateSchema) },
		responses: {
			"201": {
				description: "Created user",
				...contentJson(successResponse(userSchema)),
			},
			"401": { description: "Unauthorized", ...contentJson(errorResponse) },
		},
	};

	async handle(c: AppContext) {
		const unauthorized = requireApiKey(c);
		if (unauthorized) return unauthorized;

		const data = await this.getValidatedData<typeof this.schema>();
		const now = nowIso();
		const insert = await c.env.DB.prepare(
			"INSERT INTO users (email, name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
		)
			.bind(data.body.email, data.body.name, data.body.role, now, now)
			.run();
		const user = await getById(c.env.DB, "users", insert.meta.last_row_id);

		return c.json({ success: true, result: user }, 201);
	}
}

export class UserRead extends OpenAPIRoute {
	schema = {
		tags: ["Users"],
		summary: "Get a user",
		request: { params: idParam },
		responses: {
			"200": { description: "User", ...contentJson(successResponse(userSchema)) },
			"404": { description: "Not found", ...contentJson(errorResponse) },
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const user = await getById(c.env.DB, "users", data.params.id);

		if (!user) return c.json(notFound("User"), 404);

		return c.json({ success: true, result: user });
	}
}
