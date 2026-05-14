export function nowIso() {
	return new Date().toISOString();
}

export async function getById<T>(
	db: D1Database,
	tableName: string,
	id: number,
) {
	return db
		.prepare(`SELECT * FROM ${tableName} WHERE id = ?`)
		.bind(id)
		.first<T>();
}

export async function getBySlug<T>(
	db: D1Database,
	tableName: string,
	slug: string,
) {
	return db
		.prepare(`SELECT * FROM ${tableName} WHERE slug = ?`)
		.bind(slug)
		.first<T>();
}

export function notFound(resource: string) {
	return {
		success: false,
		errors: [{ code: "NOT_FOUND", message: `${resource} not found.` }],
	};
}
