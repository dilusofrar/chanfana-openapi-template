export type AppEnv = Env & {
	API_KEY?: string;
	ADMIN_PASSWORD?: string;
	ENVIRONMENT?: string;
	AI?: Ai;
	ASSETS?: R2Bucket;
};
