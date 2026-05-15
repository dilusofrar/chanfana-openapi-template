import { contentJson, OpenAPIRoute } from "chanfana";
import type { AppContext } from "../types";
import { requireApiKey } from "../auth";
import { hashPassword } from "../adminAuth";
import { getById, notFound, nowIso } from "../db";
import {
	adminUserCreateSchema,
	adminUserSchema,
	adminUserUpdateSchema,
	errorResponse,
	idParam,
	listQuery,
	successResponse,
} from "../schemas";
import { z } from "zod";

function publicAdminColumns() {
	return "id, email, name, role, created_at, updated_at";
}

export class AdminUserList extends OpenAPIRoute {
	schema = {
		tags: ["Admin Users"],
		summary: "List admin panel users",
		request: { query: listQuery },
		responses: {
			"200": {
				description: "Admin users list",
				...contentJson(successResponse(z.array(adminUserSchema))),
			},
			"401": { description: "Unauthorized", ...contentJson(errorResponse) },
		},
	};

	async handle(c: AppContext) {
		const unauthorized = await requireApiKey(c);
		if (unauthorized) return unauthorized;

		const data = await this.getValidatedData<typeof this.schema>();
		const result = await c.env.DB.prepare(
			`SELECT ${publicAdminColumns()} FROM admin_users ORDER BY created_at DESC LIMIT ? OFFSET ?`,
		)
			.bind(data.query.limit, data.query.offset)
			.all();

		return c.json({ success: true, result: result.results });
	}
}

export class AdminUserCreate extends OpenAPIRoute {
	schema = {
		tags: ["Admin Users"],
		summary: "Create an admin panel user",
		request: { body: contentJson(adminUserCreateSchema) },
		responses: {
			"201": {
				description: "Created admin user",
				...contentJson(successResponse(adminUserSchema)),
			},
			"401": { description: "Unauthorized", ...contentJson(errorResponse) },
		},
	};

	async handle(c: AppContext) {
		const unauthorized = await requireApiKey(c);
		if (unauthorized) return unauthorized;

		const data = await this.getValidatedData<typeof this.schema>();
		const credentials = await hashPassword(data.body.password);
		const now = nowIso();
		const insert = await c.env.DB.prepare(
			`INSERT INTO admin_users
				(email, name, password_hash, password_salt, role, created_at, updated_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`,
		)
			.bind(
				data.body.email.toLowerCase(),
				data.body.name,
				credentials.hash,
				credentials.salt,
				data.body.role,
				now,
				now,
			)
			.run();
		const user = await c.env.DB.prepare(
			`SELECT ${publicAdminColumns()} FROM admin_users WHERE id = ?`,
		)
			.bind(insert.meta.last_row_id)
			.first();

		return c.json({ success: true, result: user }, 201);
	}
}

export class AdminUserUpdate extends OpenAPIRoute {
	schema = {
		tags: ["Admin Users"],
		summary: "Update an admin panel user",
		request: {
			params: idParam,
			body: contentJson(adminUserUpdateSchema),
		},
		responses: {
			"200": {
				description: "Updated admin user",
				...contentJson(successResponse(adminUserSchema)),
			},
			"401": { description: "Unauthorized", ...contentJson(errorResponse) },
			"404": { description: "Not found", ...contentJson(errorResponse) },
		},
	};

	async handle(c: AppContext) {
		const unauthorized = await requireApiKey(c);
		if (unauthorized) return unauthorized;

		const data = await this.getValidatedData<typeof this.schema>();
		const existing = await getById(c.env.DB, "admin_users", data.params.id);
		if (!existing) return c.json(notFound("Admin user"), 404);

		const fields: string[] = [];
		const values: Array<string | number> = [];
		if (data.body.email !== undefined) {
			fields.push("email = ?");
			values.push(data.body.email.toLowerCase());
		}
		if (data.body.name !== undefined) {
			fields.push("name = ?");
			values.push(data.body.name);
		}
		if (data.body.role !== undefined) {
			fields.push("role = ?");
			values.push(data.body.role);
		}
		if (data.body.password !== undefined) {
			const credentials = await hashPassword(data.body.password);
			fields.push("password_hash = ?", "password_salt = ?");
			values.push(credentials.hash, credentials.salt);
		}
		fields.push("updated_at = ?");
		values.push(nowIso(), data.params.id);

		await c.env.DB.prepare(
			`UPDATE admin_users SET ${fields.join(", ")} WHERE id = ?`,
		)
			.bind(...values)
			.run();
		const user = await c.env.DB.prepare(
			`SELECT ${publicAdminColumns()} FROM admin_users WHERE id = ?`,
		)
			.bind(data.params.id)
			.first();

		return c.json({ success: true, result: user });
	}
}

export class AdminUserDelete extends OpenAPIRoute {
	schema = {
		tags: ["Admin Users"],
		summary: "Delete an admin panel user",
		request: { params: idParam },
		responses: {
			"200": {
				description: "Deleted admin user",
				...contentJson(successResponse(adminUserSchema)),
			},
			"401": { description: "Unauthorized", ...contentJson(errorResponse) },
			"404": { description: "Not found", ...contentJson(errorResponse) },
		},
	};

	async handle(c: AppContext) {
		const unauthorized = await requireApiKey(c);
		if (unauthorized) return unauthorized;

		const data = await this.getValidatedData<typeof this.schema>();
		const user = await c.env.DB.prepare(
			`SELECT ${publicAdminColumns()} FROM admin_users WHERE id = ?`,
		)
			.bind(data.params.id)
			.first();
		if (!user) return c.json(notFound("Admin user"), 404);

		const count = await c.env.DB.prepare("SELECT COUNT(*) as total FROM admin_users")
			.first<{ total: number }>();
		if ((count?.total ?? 0) <= 1) {
			return c.json(
				{
					success: false,
					errors: [
						{
							code: "LAST_ADMIN",
							message: "Keep at least one admin user.",
						},
					],
				},
				400,
			);
		}

		await c.env.DB.prepare("DELETE FROM admin_users WHERE id = ?")
			.bind(data.params.id)
			.run();

		return c.json({ success: true, result: user });
	}
}
