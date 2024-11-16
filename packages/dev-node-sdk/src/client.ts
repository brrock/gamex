import { CONFIG } from './config';
import { SecurityManager } from './security';
import { PlayerDataPayload, GameConfig } from './types';
import { GameSDKError } from './errors';
import { z } from 'zod';

export class PlayerDataClient {
    private security: SecurityManager;
    private baseUrl: string;
    private gameId: string;
    private userId: string | null = null;
    private dataSchema?: z.ZodType<any>;
    private devMode: boolean;

    constructor(config: GameConfig, dataSchema?: z.ZodType<any>) {
        if (!config.gameId || !config.gameSecret) {
            throw new GameSDKError(
                'Game ID and Game Secret are required',
                'INVALID_CONFIG'
            );
        }
        
        this.security = new SecurityManager(config.gameId, config.gameSecret);
        this.baseUrl = config.apiUrl || CONFIG.API_URL;
        this.gameId = config.gameId;
        this.dataSchema = dataSchema;
        this.devMode = CONFIG.DEV_MODE;
    }

    private async initializeUserId(): Promise<void> {
        if (this.userId) return;

        try {
            const response = await fetch(`${this.baseUrl}${CONFIG.ENDPOINTS.USER_ID}`);
            
            if (!response.ok) {
                throw new GameSDKError(
                    'Failed to fetch user ID',
                    'AUTH_ERROR',
                    response.status
                );
            }

            const data = await response.json();
            this.userId = data.userId;

            if (!this.userId) {
                throw new GameSDKError(
                    'No user ID returned from server',
                    'AUTH_ERROR'
                );
            }
        } catch (error) {
            if (error instanceof GameSDKError) {
                throw error;
            }
            throw new GameSDKError(
                `Failed to initialize user ID: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'AUTH_ERROR'
            );
        }
    }

    async sendPlayerData<T>(data: T): Promise<void> {
        // Validate data against schema if provided
        if (this.dataSchema) {
            try {
                this.dataSchema.parse(data);
            } catch (error) {
                if (error instanceof z.ZodError) {
                    throw new GameSDKError(
                        'Invalid player data format',
                        'VALIDATION_ERROR',
                        400,
                        error.errors
                    );
                }
                throw error;
            }
        }

        await this.initializeUserId();

        // In dev mode, log data instead of sending
        if (this.devMode) {
            console.log('[DEV MODE] Would send player data:', {
                userId: this.userId,
                gameId: this.gameId,
                data
            });
            return;
        }

        const payload = {
            userId: this.userId,
            data,
            game: this.gameId,
        };

        const stringifiedPayload = JSON.stringify(payload);
        const headers = this.security.getAuthHeaders(stringifiedPayload);

        try {
            const response = await fetch(`${this.baseUrl}${CONFIG.ENDPOINTS.PLAYER_DATA}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-ID': this.userId!,
                    ...headers
                },
                body: stringifiedPayload
            });

            if (!response.ok) {
                const error = await response.json();
                throw new GameSDKError(
                    error.message || 'Failed to send player data',
                    error.code,
                    response.status,
                    error.errors
                );
            }
        } catch (error) {
            if (error instanceof GameSDKError) {
                throw error;
            }
            throw new GameSDKError(
                `Failed to send player data: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'API_ERROR'
            );
        }
    }

    async getMyPlayerData<T>(): Promise<T> {
        await this.initializeUserId();

        // In dev mode, return mock data
        if (this.devMode) {
            console.log('[DEV MODE] Would fetch player data for user:', this.userId);
            return {} as T;
        }

        const headers = this.security.getAuthHeaders('');

        try {
            const response = await fetch(
                `${this.baseUrl}${CONFIG.ENDPOINTS.PLAYER_DATA}/me`,
                {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-User-ID': this.userId!,
                        ...headers
                    }
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new GameSDKError(
                    error.message || 'Failed to fetch player data',
                    error.code,
                    response.status
                );
            }

            const result = await response.json();
            const data = result.data?.data || null;

            // Validate response data against schema if provided
            if (data && this.dataSchema) {
                try {
                    return this.dataSchema.parse(data);
                } catch (error) {
                    if (error instanceof z.ZodError) {
                        throw new GameSDKError(
                            'Invalid player data format in response',
                            'VALIDATION_ERROR',
                            400,
                            error.errors
                        );
                    }
                    throw error;
                }
            }

            return data as T;
        } catch (error) {
            if (error instanceof GameSDKError) {
                throw error;
            }
            throw new GameSDKError(
                `Failed to fetch player data: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'API_ERROR'
            );
        }
    }

    async getGameData<T>(): Promise<T[]> {
        await this.initializeUserId();

        // In dev mode, return mock data
        if (this.devMode) {
            console.log('[DEV MODE] Would fetch all game data for game:', this.gameId);
            return [] as T[];
        }

        const headers = this.security.getAuthHeaders('');

        try {
            const response = await fetch(
                `${this.baseUrl}${CONFIG.ENDPOINTS.PLAYER_DATA}/game/${this.gameId}`,
                {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        ...headers
                    }
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new GameSDKError(
                    error.message || 'Failed to fetch game data',
                    error.code,
                    response.status
                );
            }

            const result = await response.json();
            const dataArray = result.data?.map((item: PlayerDataPayload) => item.data) || [];

            // Validate response data against schema if provided
            if (this.dataSchema) {
                try {
                    return dataArray.map(data => this.dataSchema!.parse(data));
                } catch (error) {
                    if (error instanceof z.ZodError) {
                        throw new GameSDKError(
                            'Invalid player data format in response',
                            'VALIDATION_ERROR',
                            400,
                            error.errors
                        );
                    }
                    throw error;
                }
            }

            return dataArray as T[];
        } catch (error) {
            if (error instanceof GameSDKError) {
                throw error;
            }
            throw new GameSDKError(
                `Failed to fetch game data: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'API_ERROR'
            );
        }
    }
}