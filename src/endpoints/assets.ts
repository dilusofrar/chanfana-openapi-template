import { contentJson, OpenAPIRoute } from "chanfana";
import type { AppContext } from "../types";
import { requireApiKey } from "../auth";
import { assetUploadResponseSchema, errorResponse, successResponse } from "../schemas";

function extensionFromType(type: string) {
	if (type === "image/png") return "png";
	if (type === "image/webp") return "webp";
	if (type === "image/gif") return "gif";

	return "jpg";
}

export class AssetUpload extends OpenAPIRoute {
	schema = {
		tags: ["Assets"],
		summary: "Upload an image asset to R2",
		responses: {
			"201": {
				description: "Uploaded asset",
				...contentJson(successResponse(assetUploadResponseSchema)),
			},
			"401": { description: "Unauthorized", ...contentJson(errorResponse) },
			"503": { description: "R2 not configured", ...contentJson(errorResponse) },
		},
	};

	async handle(c: AppContext) {
		const unauthorized = await requireApiKey(c);
		if (unauthorized) return unauthorized;

		if (!c.env.ASSETS) {
			return c.json(
				{
					success: false,
					errors: [
						{
							code: "ASSETS_NOT_CONFIGURED",
							message: "Configure an ASSETS R2 binding to enable uploads.",
						},
					],
				},
				503,
			);
		}

		const form = await c.req.raw.formData();
		const file = form.get("file");
		if (!(file instanceof File) || !file.type.startsWith("image/")) {
			return c.json(
				{
					success: false,
					errors: [{ code: "INVALID_FILE", message: "Send an image file." }],
				},
				400,
			);
		}

		const key = `uploads/${crypto.randomUUID()}.${extensionFromType(file.type)}`;
		await c.env.ASSETS.put(key, file.stream(), {
			httpMetadata: {
				contentType: file.type,
			},
		});
		const url = new URL(c.req.url);
		url.pathname = `/assets/${key}`;
		url.search = "";

		return c.json({ success: true, result: { key, url: url.toString() } }, 201);
	}
}
