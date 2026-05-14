import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("Health endpoint", () => {
	it("returns the API health status", async () => {
		const response = await SELF.fetch("http://local.test/health");
		const body = await response.json<{
			success: boolean;
			result: { service: string; status: string };
		}>();

		expect(response.status).toBe(200);
		expect(body).toEqual({
			success: true,
			result: {
				service: "api-ubuntucode",
				status: "ok",
			},
		});
	});
});
