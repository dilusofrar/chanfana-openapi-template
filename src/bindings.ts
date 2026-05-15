export type AppEnv = Env & {
	API_KEY?: string;
	ADMIN_PASSWORD?: string;
	PUBLIC_SITE_ORIGIN?: string;
	WEB_ANALYTICS_TOKEN?: string;
	ENVIRONMENT?: string;
	AI?: Ai;
	ASSETS?: R2Bucket;
};
