import { PlayerDataClient } from './client';
import { GameSDKError } from './errors';
import type { GameConfig } from './types';

export class GameSDK {
    private client: PlayerDataClient;
    
    constructor(config: GameConfig) {
        this.client = new PlayerDataClient(config);
    }

    async savePlayerData(data: Record<string, unknown>): Promise<void> {
        await this.client.sendPlayerData(data);
    }
}

export type { GameConfig, GameSDKError };