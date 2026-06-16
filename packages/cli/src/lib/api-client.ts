import type { AppType } from "@flowcode/server";
import { hc } from "hono/client";

const baseUrl = process.env.API_URL?.trim() || "http://localhost:3000";
export const apiClient = hc<AppType>(baseUrl);
