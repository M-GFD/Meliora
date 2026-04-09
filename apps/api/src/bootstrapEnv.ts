import { config as loadDotenv } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
loadDotenv({ path: resolve(apiRoot, ".env") });

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL es obligatoria (PostgreSQL)"),
  JWT_SECRET: z.string().min(8, "JWT_SECRET debe tener al menos 8 caracteres"),
  ML_SERVICE_URL: z.string().url().default("http://localhost:8000"),
});

/** Variables de entorno validadas; falla al importar el módulo si falta algo crítico. */
export const env = schema.parse(process.env);
