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
	return c.text("Authentication required", 401);
}

function adminSecret(c: Context<{ Bindings: AppEnv }>) {
	return c.env.ADMIN_PASSWORD ?? c.env.API_KEY;
}

export async function hashPassword(password: string, salt?: string) {
	const passwordSalt = salt ?? base64UrlEncode(crypto.getRandomValues(new Uint8Array(16)));
	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(password),
		"PBKDF2",
		false,
		["deriveBits"],
	);
	const bits = await crypto.subtle.deriveBits(
		{
			name: "PBKDF2",
			hash: "SHA-256",
			salt: new TextEncoder().encode(passwordSalt),
			iterations: 100000,
		},
		keyMaterial,
		256,
	);

	return {
		hash: base64UrlEncode(bits),
		salt: passwordSalt,
	};
}

export async function createAdminSession(secret: string, email = "admin") {
	const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
	const subject = base64UrlEncode(new TextEncoder().encode(email));
	const payload = `${subject}.${expiresAt}`;
	const signature = await sign(payload, secret);

	return `${payload}.${signature}`;
}

export async function hasValidAdminSession(c: Context<{ Bindings: AppEnv }>) {
	const configuredKey = adminSecret(c);
	if (!configuredKey) return false;

	const cookie = getCookie(c, ADMIN_SESSION_COOKIE);
	if (!cookie) return false;

	const [username, expiresAtValue, signature] = cookie.split(".");
	const expiresAt = Number(expiresAtValue);
	if (!username || !Number.isFinite(expiresAt)) return false;
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

export function clearAdminSessionCookie(c: Context<{ Bindings: AppEnv }>) {
	c.header(
		"Set-Cookie",
		`${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`,
	);
}

export function verifyAdminPassword(
	c: Context<{ Bindings: AppEnv }>,
	password: string,
) {
	const configuredKey = c.env.ADMIN_PASSWORD ?? c.env.API_KEY;

	return Boolean(configuredKey && password === configuredKey);
}

export async function verifyAdminCredentials(
	c: Context<{ Bindings: AppEnv }>,
	email: string,
	password: string,
) {
	const normalizedEmail = email.trim().toLowerCase();
	const admin = await c.env.DB.prepare(
		"SELECT email, password_hash, password_salt FROM admin_users WHERE email = ?",
	)
		.bind(normalizedEmail)
		.first<{ email: string; password_hash: string; password_salt: string }>();

	if (admin) {
		const candidate = await hashPassword(password, admin.password_salt);

		return timingSafeEqual(candidate.hash, admin.password_hash)
			? { email: admin.email }
			: null;
	}

	if (!normalizedEmail || normalizedEmail === "admin@ubuntucode.com") {
		return verifyAdminPassword(c, password) ? { email: "admin@ubuntucode.com" } : null;
	}

	return null;
}

export async function bootstrapAdminUser(c: Context<{ Bindings: AppEnv }>) {
	const password = c.env.ADMIN_PASSWORD;
	if (!password) return;

	const existing = await c.env.DB.prepare("SELECT id FROM admin_users LIMIT 1").first();
	if (existing) return;

	const email = "admin@ubuntucode.com";
	const credentials = await hashPassword(password);
	await c.env.DB.prepare(
		`INSERT INTO admin_users
			(email, name, password_hash, password_salt, role)
		 VALUES (?, ?, ?, ?, 'admin')`,
	)
		.bind(email, "UbuntuCode Admin", credentials.hash, credentials.salt)
		.run();
}

export async function requireAdmin(c: Context<{ Bindings: AppEnv }>) {
	const configuredKey = adminSecret(c);
	if (!configuredKey) {
		return c.text("Admin authentication is not configured", 503);
	}

	if (await hasValidAdminSession(c)) return;

	const credentials = decodeBasicAuth(c.req.header("Authorization") ?? "");
	if (!credentials) return c.redirect("/admin/login", 302);

	if (credentials.username !== "admin" || credentials.password !== configuredKey) {
		return unauthorized(c);
	}
}
