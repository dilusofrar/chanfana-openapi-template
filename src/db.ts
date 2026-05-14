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

export function buildUpdate(
	tableName: string,
	fields: Record<string, string | number | null | undefined>,
	whereColumn: string,
) {
	const entries = Object.entries(fields).filter(
		(entry): entry is [string, string | number | null] =>
			entry[1] !== undefined,
	);
	const assignments = entries.map(([key]) => `${key} = ?`).join(", ");
	const values = entries.map(([, value]) => value);

	return {
		sql: `UPDATE ${tableName} SET ${assignments}, updated_at = ? WHERE ${whereColumn} = ?`,
		values,
	};
}
