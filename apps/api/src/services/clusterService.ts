import { runClustering } from "./mlClient.js";

/** Invoca el microservicio ML para recalcular clusters (placeholder de matriz de votos). */
export async function requestClusterRun(voteMatrix: unknown): Promise<unknown> {
  return runClustering({ votes: voteMatrix });
}
