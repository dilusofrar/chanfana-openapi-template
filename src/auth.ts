import type { Context } from "hono";
import type { AppEnv } from "./bindings";
import { hasValidAdminSession } from "./adminAuth";

export async function requireApiKey(c: Context<{ Bindings: AppEnv }>) {
	const configuredKey = c.env.API_KEY;
	const providedKey = c.req.header("x-api-key");

	if (!configuredKey) {
		return c.json(
			{
				success: false,
				errors: [
					{
						code: "API_KEY_NOT_CONFIGURED",
						message: "API key is not configured for this environment.",
					},
				],
			},
			503,
		);
	}

	if (await hasValidAdminSession(c)) return;

	if (providedKey !== configuredKey) {
		return c.json(
			{
				success: false,
				errors: [
					{
						code: "UNAUTHORIZED",
						message: "Provide a valid x-api-key header.",
					},
				],
			},
			401,
		);
	}
}
