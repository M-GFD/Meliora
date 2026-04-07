import { consensusCheck } from "./mlClient.js";

export async function checkTransversalConsensus(payload: unknown): Promise<unknown> {
  return consensusCheck(payload);
}
