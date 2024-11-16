import { createHmac } from 'crypto';
export class SecurityManager {
    private gameId: string;
    private gameSecret: string;

    constructor(gameId: string, gameSecret: string) {
        this.gameId = gameId;
        this.gameSecret = gameSecret;
    }

    generateRequestSignature(payload: string, timestamp: number): string {
        const data = `${payload}:${timestamp}`;
        return createHmac('sha256', this.gameSecret)
            .update(data)
            .digest('hex');
    }

    getAuthHeaders(payload: string): Record<string, string> {
        const timestamp = Date.now();
        const signature = this.generateRequestSignature(payload, timestamp);
        
        return {
            'X-Game-ID': this.gameId,
            'X-Timestamp': timestamp.toString(),
            'X-Signature': signature
        };
    }
}
