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

export const userUpdateSchema = userCreateSchema.partial().refine(
	(data) => Object.keys(data).length > 0,
	"Provide at least one field to update.",
);

export const projectSchema = z.object({
	id: z.number().int(),
	slug: z.string(),
	title: z.string(),
	summary: z.string(),
	status: z.enum(["draft", "active", "archived"]),
	repository_url: z.string().url().nullable(),
	live_url: z.string().url().nullable(),
	image_url: z.string().url().nullable(),
	tags: z.string().nullable(),
	seo_title: z.string().nullable(),
	seo_description: z.string().nullable(),
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
	image_url: z.string().url().nullable().optional(),
	tags: z.string().nullable().optional(),
	seo_title: z.string().nullable().optional(),
	seo_description: z.string().nullable().optional(),
});

export const projectUpdateSchema = projectCreateSchema.partial().refine(
	(data) => Object.keys(data).length > 0,
	"Provide at least one field to update.",
);

export const articleSchema = z.object({
	id: z.number().int(),
	slug: z.string(),
	title: z.string(),
	excerpt: z.string(),
	content: z.string(),
	status: z.enum(["draft", "published", "archived"]),
	published_at: z.string().nullable(),
	image_url: z.string().url().nullable(),
	tags: z.string().nullable(),
	category: z.string().nullable(),
	seo_title: z.string().nullable(),
	seo_description: z.string().nullable(),
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
	image_url: z.string().url().nullable().optional(),
	tags: z.string().nullable().optional(),
	category: z.string().nullable().optional(),
	seo_title: z.string().nullable().optional(),
	seo_description: z.string().nullable().optional(),
});

export const articleUpdateSchema = articleCreateSchema.partial().refine(
	(data) => Object.keys(data).length > 0,
	"Provide at least one field to update.",
);

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

export const articleAiActionSchema = z.object({
	action: z.enum(["title", "excerpt", "improve", "tags", "full", "seo", "linkedin", "tone"]),
	title: z.string().optional().default(""),
	excerpt: z.string().optional().default(""),
	content: z.string().optional().default(""),
	briefing: z.string().optional().default(""),
	tone: z.string().optional().default("tecnico e claro"),
});

export const leadCreateSchema = z.object({
	name: z.string().min(1).max(120),
	email: z.string().email(),
	message: z.string().min(1).max(2000),
	source: z.string().min(1).max(80).default("contact"),
});

export const leadSchema = z.object({
	id: z.number().int(),
	name: z.string(),
	email: z.string(),
	message: z.string(),
	source: z.string(),
	created_at: z.string(),
});

export const newsletterCreateSchema = z.object({
	email: z.string().email(),
});

export const newsletterSubscriberSchema = z.object({
	id: z.number().int(),
	email: z.string(),
	status: z.enum(["active", "unsubscribed"]),
	created_at: z.string(),
});

export const assetUploadResponseSchema = z.object({
	key: z.string(),
	url: z.string().url(),
});

export const aiHistorySchema = z.object({
	id: z.number().int(),
	kind: z.string(),
	prompt: z.string(),
	response: z.string(),
	provider: z.string(),
	created_at: z.string(),
});

export const aiDraftCreateSchema = z.object({
	briefing: z.string().min(1).max(4000),
	tone: z.string().optional().default("tecnico, claro e util"),
});

export const aiDraftSchema = z.object({
	id: z.number().int(),
	title: z.string(),
	excerpt: z.string(),
	content: z.string(),
	tags: z.string().nullable(),
	seo_title: z.string().nullable(),
	seo_description: z.string().nullable(),
	provider: z.string(),
	created_at: z.string(),
});
