export interface PlayerDataPayload {
    data: Record<string, unknown>;
    game: string;
}

export interface GameConfig {
    gameId: string;
    gameSecret: string;
    apiUrl?: string;
}

export interface ApiError extends Error {
    code?: string;
    status?: number;
}