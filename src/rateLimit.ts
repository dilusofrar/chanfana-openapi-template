import type { AppContext } from "./types";

type RateLimitOptions = {
	name: string;
	limit: number;
	windowSeconds: number;
};

function clientKey(c: AppContext, name: string) {
	const ip =
		c.req.header("cf-connecting-ip") ??
		c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
		"local";

	return `${name}:${ip}`;
}

export async function enforceRateLimit(
	c: AppContext,
	options: RateLimitOptions,
) {
	const now = Math.floor(Date.now() / 1000);
	const resetAt = now + options.windowSeconds;
	const key = clientKey(c, options.name);
	const current = await c.env.DB.prepare(
		"SELECT count, reset_at FROM rate_limits WHERE key = ?",
	)
		.bind(key)
		.first<{ count: number; reset_at: number }>();

	if (!current || current.reset_at <= now) {
		await c.env.DB.prepare(
			"INSERT OR REPLACE INTO rate_limits (key, count, reset_at) VALUES (?, ?, ?)",
		)
			.bind(key, 1, resetAt)
			.run();

		return;
	}

	if (current.count >= options.limit) {
		c.header("Retry-After", String(Math.max(1, current.reset_at - now)));

		return c.json(
			{
				success: false,
				errors: [
					{
						code: "RATE_LIMITED",
						message: "Muitas requisicoes. Tente novamente em instantes.",
					},
				],
			},
			429,
		);
	}

	await c.env.DB.prepare("UPDATE rate_limits SET count = count + 1 WHERE key = ?")
		.bind(key)
		.run();
}
