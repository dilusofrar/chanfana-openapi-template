import type { Context } from "hono";
import type { AppEnv } from "./bindings";

export type AppContext = Context<{ Bindings: AppEnv }>;
export type HandleArgs = [AppContext];
