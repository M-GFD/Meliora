import { generateDocument } from "./mlClient.js";

export async function requestConsensusDocument(payload: unknown): Promise<unknown> {
  return generateDocument(payload);
}
