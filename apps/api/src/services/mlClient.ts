import { env } from "../bootstrapEnv.js";

const baseUrl = env.ML_SERVICE_URL;

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ML service error ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export async function runClustering(body: unknown): Promise<unknown> {
  return postJson("/cluster/run", body);
}

export async function consensusCheck(body: unknown): Promise<unknown> {
  return postJson("/cluster/consensus-check", body);
}

export async function generateDocument(body: unknown): Promise<unknown> {
  return postJson("/document/generate", body);
}
