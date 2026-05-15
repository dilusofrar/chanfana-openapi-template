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

describe("Admin panel", () => {
	it("requires authentication", async () => {
		const response = await SELF.fetch("http://local.test/admin");

		expect(response.status).toBe(401);
		expect(response.headers.get("www-authenticate")).toContain(
			"UbuntuCode Admin",
		);
	});

	it("serves the admin console with valid credentials", async () => {
		const credentials = btoa("admin:test-api-key");
		const response = await SELF.fetch("http://local.test/admin", {
			headers: {
				Authorization: `Basic ${credentials}`,
			},
		});
		const html = await response.text();

		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toContain("text/html");
		expect(html).toContain("UbuntuCode Admin");
		expect(html).toContain("Admin Console");
		expect(response.headers.get("set-cookie")).toContain("uc_admin_session");
	});

	it("uses the admin session cookie for protected API calls", async () => {
		const credentials = btoa("admin:test-api-key");
		const loginResponse = await SELF.fetch("http://local.test/admin", {
			headers: {
				Authorization: `Basic ${credentials}`,
			},
		});
		const cookie = loginResponse.headers.get("set-cookie")?.split(";")[0];

		expect(cookie).toContain("uc_admin_session");

		const response = await SELF.fetch("http://local.test/webhooks/events", {
			headers: {
				Cookie: cookie ?? "",
			},
		});

		expect(response.status).toBe(200);
	});
});
