import { z } from "zod";

export const idParam = z.object({
	id: z.coerce.number().int().positive(),
});

export const slugParam = z.object({
	slug: z.string().min(1),
});

export const listQuery = z.object({
	limit: z.coerce.number().int().min(1).max(100).default(20),
	offset: z.coerce.number().int().min(0).default(0),
});

export const successResponse = <T extends z.ZodTypeAny>(result: T) =>
	z.object({
		success: z.literal(true),
		result,
	});

export const errorResponse = z.object({
	success: z.literal(false),
	errors: z.array(
		z.object({
			code: z.string(),
			message: z.string(),
		}),
	),
});

export const userSchema = z.object({
	id: z.number().int(),
	email: z.string().email(),
	name: z.string(),
	role: z.enum(["admin", "member"]),
	created_at: z.string(),
	updated_at: z.string(),
});

export const userCreateSchema = z.object({
	email: z.string().email(),
	name: z.string().min(1),
	role: z.enum(["admin", "member"]).default("member"),
});

export const projectSchema = z.object({
	id: z.number().int(),
	slug: z.string(),
	title: z.string(),
	summary: z.string(),
	status: z.enum(["draft", "active", "archived"]),
	repository_url: z.string().url().nullable(),
	live_url: z.string().url().nullable(),
	created_at: z.string(),
	updated_at: z.string(),
});

export const projectCreateSchema = z.object({
	slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
	title: z.string().min(1),
	summary: z.string().min(1),
	status: z.enum(["draft", "active", "archived"]).default("draft"),
	repository_url: z.string().url().nullable().optional(),
	live_url: z.string().url().nullable().optional(),
});

export const articleSchema = z.object({
	id: z.number().int(),
	slug: z.string(),
	title: z.string(),
	excerpt: z.string(),
	content: z.string(),
	status: z.enum(["draft", "published", "archived"]),
	published_at: z.string().nullable(),
	created_at: z.string(),
	updated_at: z.string(),
});

export const articleCreateSchema = z.object({
	slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
	title: z.string().min(1),
	excerpt: z.string().min(1),
	content: z.string().min(1),
	status: z.enum(["draft", "published", "archived"]).default("draft"),
	published_at: z.string().datetime().nullable().optional(),
});

export const webhookEventSchema = z.object({
	id: z.number().int(),
	source: z.string(),
	event_type: z.string(),
	payload: z.string(),
	received_at: z.string(),
});

export const webhookCreateSchema = z.object({
	source: z.string().min(1),
	event_type: z.string().min(1),
	payload: z.record(z.unknown()),
});

export const aiRequestSchema = z.object({
	prompt: z.string().min(1).max(2000),
});
