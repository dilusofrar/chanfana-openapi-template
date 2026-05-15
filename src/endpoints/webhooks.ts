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

function readPayloadValue(payload: Record<string, unknown>, key: string) {
	const value = payload[key];
	return typeof value === "string" ? value.trim() : "";
}

async function processWebhookAction(
	c: AppContext,
	source: string,
	eventType: string,
	payload: Record<string, unknown>,
) {
	if (eventType === "lead.created" || eventType === "contact.created") {
		const name = readPayloadValue(payload, "name") || "Webhook lead";
		const email = readPayloadValue(payload, "email");
		const message = readPayloadValue(payload, "message") || JSON.stringify(payload);
		if (!email) return "ignored: missing email for lead";

		const now = new Date().toISOString();
		await c.env.DB.prepare(
			"INSERT INTO leads (name, email, message, source, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'new', ?, ?)",
		)
			.bind(name, email, message, `webhook:${source}`, now, now)
			.run();

		return "created lead";
	}

	if (eventType === "newsletter.subscribe") {
		const email = readPayloadValue(payload, "email");
		if (!email) return "ignored: missing email for newsletter";

		await c.env.DB.prepare(
			`INSERT INTO newsletter_subscribers (email, status)
			 VALUES (?, 'active')
			 ON CONFLICT(email) DO UPDATE SET status = 'active'`,
		)
			.bind(email)
			.run();

		return "subscribed newsletter";
	}

	return "stored only";
}

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
		const actionResult = await processWebhookAction(
			c,
			data.body.source,
			data.body.event_type,
			data.body.payload,
		);
		await c.env.DB.prepare(
			"UPDATE webhook_events SET processed_at = ?, action_result = ? WHERE id = ?",
		)
			.bind(new Date().toISOString(), actionResult, insert.meta.last_row_id)
			.run();
		const event = await c.env.DB.prepare(
			"SELECT * FROM webhook_events WHERE id = ?",
		)
			.bind(insert.meta.last_row_id)
			.first();

		return c.json({ success: true, result: event }, 202);
	}
}
