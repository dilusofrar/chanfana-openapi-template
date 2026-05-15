import { contentJson, OpenAPIRoute } from "chanfana";
import type { AppContext } from "../types";
import { requireApiKey } from "../auth";
import { nowIso } from "../db";
import { enforceRateLimit } from "../rateLimit";
import {
	errorResponse,
	leadCreateSchema,
	leadSchema,
	listQuery,
	newsletterCreateSchema,
	newsletterSubscriberSchema,
	successResponse,
} from "../schemas";
import { z } from "zod";

export class LeadList extends OpenAPIRoute {
	schema = {
		tags: ["Leads"],
		summary: "List contact leads",
		request: { query: listQuery },
		responses: {
			"200": {
				description: "Leads list",
				...contentJson(successResponse(z.array(leadSchema))),
			},
			"401": { description: "Unauthorized", ...contentJson(errorResponse) },
		},
	};

	async handle(c: AppContext) {
		const unauthorized = await requireApiKey(c);
		if (unauthorized) return unauthorized;

		const data = await this.getValidatedData<typeof this.schema>();
		const result = await c.env.DB.prepare(
			"SELECT * FROM leads ORDER BY created_at DESC LIMIT ? OFFSET ?",
		)
			.bind(data.query.limit, data.query.offset)
			.all();

		return c.json({ success: true, result: result.results });
	}
}

export class LeadCreate extends OpenAPIRoute {
	schema = {
		tags: ["Leads"],
		summary: "Create a contact lead",
		request: { body: contentJson(leadCreateSchema) },
		responses: {
			"201": {
				description: "Created lead",
				...contentJson(successResponse(leadSchema)),
			},
		},
	};

	async handle(c: AppContext) {
		const limited = await enforceRateLimit(c, {
			name: "leads",
			limit: 5,
			windowSeconds: 60,
		});
		if (limited) return limited;

		const data = await this.getValidatedData<typeof this.schema>();
		const now = nowIso();
		await c.env.DB.prepare(
			"INSERT INTO leads (name, email, message, source, created_at) VALUES (?, ?, ?, ?, ?)",
		)
			.bind(data.body.name, data.body.email, data.body.message, data.body.source, now)
			.run();
		const lead = await c.env.DB.prepare(
			"SELECT * FROM leads WHERE email = ? AND created_at = ?",
		)
			.bind(data.body.email, now)
			.first();

		return c.json({ success: true, result: lead }, 201);
	}
}

export class NewsletterSubscribe extends OpenAPIRoute {
	schema = {
		tags: ["Newsletter"],
		summary: "Subscribe an email to the newsletter",
		request: { body: contentJson(newsletterCreateSchema) },
		responses: {
			"201": {
				description: "Subscriber",
				...contentJson(successResponse(newsletterSubscriberSchema)),
			},
		},
	};

	async handle(c: AppContext) {
		const limited = await enforceRateLimit(c, {
			name: "newsletter",
			limit: 10,
			windowSeconds: 60,
		});
		if (limited) return limited;

		const data = await this.getValidatedData<typeof this.schema>();
		await c.env.DB.prepare(
			`INSERT INTO newsletter_subscribers (email, status)
			 VALUES (?, 'active')
			 ON CONFLICT(email) DO UPDATE SET status = 'active'`,
		)
			.bind(data.body.email)
			.run();
		const subscriber = await c.env.DB.prepare(
			"SELECT * FROM newsletter_subscribers WHERE email = ?",
		)
			.bind(data.body.email)
			.first();

		return c.json({ success: true, result: subscriber }, 201);
	}
}
