import type { Context } from "hono";
import type { AppEnv } from "./bindings";

const ADMIN_SESSION_COOKIE = "uc_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

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

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array) {
	const array = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
	let binary = "";
	for (const byte of array) binary += String.fromCharCode(byte);

	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sign(value: string, secret: string) {
	const key = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign(
		"HMAC",
		key,
		new TextEncoder().encode(value),
	);

	return base64UrlEncode(signature);
}

function timingSafeEqual(a: string, b: string) {
	if (a.length !== b.length) return false;

	let diff = 0;
	for (let index = 0; index < a.length; index++) {
		diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
	}

	return diff === 0;
}

function getCookie(c: Context<{ Bindings: AppEnv }>, name: string) {
	const cookie = c.req.header("Cookie") ?? "";
	const match = cookie
		.split(";")
		.map((part) => part.trim())
		.find((part) => part.startsWith(`${name}=`));

	return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}

function unauthorized(c: Context<{ Bindings: AppEnv }>) {
	c.header("WWW-Authenticate", 'Basic realm="UbuntuCode Admin"');

	return c.text("Authentication required", 401);
}

export async function createAdminSession(secret: string) {
	const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
	const payload = `admin.${expiresAt}`;
	const signature = await sign(payload, secret);

	return `${payload}.${signature}`;
}

export async function hasValidAdminSession(c: Context<{ Bindings: AppEnv }>) {
	const configuredKey = c.env.API_KEY;
	if (!configuredKey) return false;

	const cookie = getCookie(c, ADMIN_SESSION_COOKIE);
	if (!cookie) return false;

	const [username, expiresAtValue, signature] = cookie.split(".");
	const expiresAt = Number(expiresAtValue);
	if (username !== "admin" || !Number.isFinite(expiresAt)) return false;
	if (expiresAt < Math.floor(Date.now() / 1000)) return false;

	const expected = await sign(`${username}.${expiresAt}`, configuredKey);

	return timingSafeEqual(signature ?? "", expected);
}

export function setAdminSessionCookie(
	c: Context<{ Bindings: AppEnv }>,
	session: string,
) {
	c.header(
		"Set-Cookie",
		`${ADMIN_SESSION_COOKIE}=${encodeURIComponent(session)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_MAX_AGE_SECONDS}`,
	);
}

export async function requireAdmin(c: Context<{ Bindings: AppEnv }>) {
	const configuredKey = c.env.API_KEY;
	if (!configuredKey) {
		return c.text("Admin authentication is not configured", 503);
	}

	if (await hasValidAdminSession(c)) return;

	const credentials = decodeBasicAuth(c.req.header("Authorization") ?? "");
	if (!credentials) return unauthorized(c);

	if (credentials.username !== "admin" || credentials.password !== configuredKey) {
		return unauthorized(c);
	}
}
