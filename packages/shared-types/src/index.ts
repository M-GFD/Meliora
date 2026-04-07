/** Tipos de voto en posts y enunciados de espacios de consenso. */
export const VOTE_TYPES = [
  "AGREE",
  "DISAGREE",
  "PARTIALLY",
  "RELEVANT",
  "IRRELEVANT",
  "NEW_TO_ME",
] as const;

export type VoteType = (typeof VOTE_TYPES)[number];

export type SpaceStatus = "ACTIVE" | "MATURE" | "ARCHIVED";

export type StatementIntent = "EXPAND_AGREEMENT" | "EXPLORE_DISAGREEMENT";

/** Eventos WebSocket (servidor → cliente y cliente → servidor). */
export interface ServerToClientEvents {
  "cluster:updated": (payload: { userId: string; clusterIds: string[] }) => void;
  "post:consensus_reached": (payload: { postId: string; clusterCount: number }) => void;
  "space:opened": (payload: { spaceId: string; anchorPostId: string }) => void;
  "space:statement_voted": (payload: {
    spaceId: string;
    statementId: string;
    voterCount: number;
  }) => void;
  "notification:new": (payload: { id: string; title: string; body: string }) => void;
}

export interface ClientToServerEvents {
  "space:join": (spaceId: string) => void;
  "space:leave": (spaceId: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId?: string;
}
