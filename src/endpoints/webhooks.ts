import { contentJson, OpenAPIRoute } from "chanfana";
import type { AppContext } from "../types";
import { requireApiKey } from "../auth";
import {
	errorResponse,
	idParam,
	listQuery,
	successResponse,
	webhookCreateSchema,
	webhookEventSchema,
} from "../schemas";
import { getById, notFound } from "../db";
import { enforceRateLimit } from "../rateLimit";
import { z } from "zod";

export class WebhookList extends OpenAPIRoute {
	schema = {
		tags: ["Webhooks"],
		summary: "List webhook events",
		request: { query: listQuery },
		responses: {
			"200": {
				description: "Webhook events",
				...contentJson(successResponse(z.array(webhookEventSchema))),
			},
			"401": { description: "Unauthorized", ...contentJson(errorResponse) },
		},
	};

	async handle(c: AppContext) {
		const unauthorized = await requireApiKey(c);
		if (unauthorized) return unauthorized;

		const data = await this.getValidatedData<typeof this.schema>();
		const result = await c.env.DB.prepare(
			"SELECT * FROM webhook_events ORDER BY received_at DESC LIMIT ? OFFSET ?",
		)
			.bind(data.query.limit, data.query.offset)
			.all();

		return c.json({ success: true, result: result.results });
	}
}

export class WebhookRead extends OpenAPIRoute {
	schema = {
		tags: ["Webhooks"],
		summary: "Read a webhook event",
		request: { params: idParam },
		responses: {
			"200": {
				description: "Webhook event",
				...contentJson(successResponse(webhookEventSchema)),
			},
			"401": { description: "Unauthorized", ...contentJson(errorResponse) },
			"404": { description: "Not found", ...contentJson(errorResponse) },
		},
	};

	async handle(c: AppContext) {
		const limited = await enforceRateLimit(c, {
			name: "webhooks",
			limit: 120,
			windowSeconds: 60,
		});
		if (limited) return limited;

		const unauthorized = await requireApiKey(c);
		if (unauthorized) return unauthorized;

		const data = await this.getValidatedData<typeof this.schema>();
		const event = await getById(c.env.DB, "webhook_events", data.params.id);
		if (!event) return c.json(notFound("Webhook event"), 404);

		return c.json({ success: true, result: event });
	}
}

export class WebhookReceive extends OpenAPIRoute {
	schema = {
		tags: ["Webhooks"],
		summary: "Receive a webhook event",
		request: { body: contentJson(webhookCreateSchema) },
		responses: {
			"202": {
				description: "Accepted webhook event",
				...contentJson(successResponse(webhookEventSchema)),
			},
			"401": { description: "Unauthorized", ...contentJson(errorResponse) },
		},
	};

	async handle(c: AppContext) {
		const unauthorized = await requireApiKey(c);
		if (unauthorized) return unauthorized;

		const data = await this.getValidatedData<typeof this.schema>();
		const insert = await c.env.DB.prepare(
			"INSERT INTO webhook_events (source, event_type, payload) VALUES (?, ?, ?)",
		)
			.bind(
				data.body.source,
				data.body.event_type,
				JSON.stringify(data.body.payload),
			)
			.run();
		const event = await c.env.DB.prepare(
			"SELECT * FROM webhook_events WHERE id = ?",
		)
			.bind(insert.meta.last_row_id)
			.first();

		return c.json({ success: true, result: event }, 202);
	}
}
