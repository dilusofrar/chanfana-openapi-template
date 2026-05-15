import type { Context } from "hono";
import type { AppEnv } from "./bindings";

function decodeBasicAuth(header: string) {
	const [scheme, value] = header.split(" ");
	if (scheme !== "Basic" || !value) return null;

	try {
		const decoded = atob(value);
		const separator = decoded.indexOf(":");
		if (separator === -1) return null;

		return {
			username: decoded.slice(0, separator),
			password: decoded.slice(separator + 1),
		};
	} catch {
		return null;
	}
}

function unauthorized(c: Context<{ Bindings: AppEnv }>) {
	c.header("WWW-Authenticate", 'Basic realm="UbuntuCode Admin"');

	return c.text("Authentication required", 401);
}

export function requireAdmin(c: Context<{ Bindings: AppEnv }>) {
	const configuredKey = c.env.API_KEY;
	if (!configuredKey) {
		return c.text("Admin authentication is not configured", 503);
	}

	const credentials = decodeBasicAuth(c.req.header("Authorization") ?? "");
	if (!credentials) return unauthorized(c);

	if (credentials.username !== "admin" || credentials.password !== configuredKey) {
		return unauthorized(c);
	}
}
