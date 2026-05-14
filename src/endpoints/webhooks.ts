import { contentJson, OpenAPIRoute } from "chanfana";
import type { AppContext } from "../types";
import { requireApiKey } from "../auth";
import {
	errorResponse,
	successResponse,
	webhookCreateSchema,
	webhookEventSchema,
} from "../schemas";

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
		const unauthorized = requireApiKey(c);
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
