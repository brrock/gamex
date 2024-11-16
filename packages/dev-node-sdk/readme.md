# GameX Developer SDK Documentation

## Table of Contents

- [GameX Developer SDK Documentation](#gamex-developer-sdk-documentation)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Getting Started](#getting-started)
  - [Schema Definition](#schema-definition)
    - [Basic Schema Example](#basic-schema-example)
    - [Advanced Schema Examples](#advanced-schema-examples)
  - [SDK Initialization](#sdk-initialization)
    - [Environment Configuration](#environment-configuration)
  - [React Integration](#react-integration)
    - [Custom Hooks](#custom-hooks)
    - [React Component Examples](#react-component-examples)
    - [Auto-Save Implementation](#auto-save-implementation)
    - [Game State Management with Context](#game-state-management-with-context)
  - [Error Handling](#error-handling)
  - [TypeScript Integration](#typescript-integration)
  - [Best Practices](#best-practices)
  - [Troubleshooting](#troubleshooting)

## Installation

```bash
# Using npm
npm install @gamex-official/gamex-node-sdk zod

# Using yarn
yarn add @gamex-official/gamex-node-sdk zod

# Using pnpm
pnpm add @gamex-official/gamex-node-sdk zod
```

## Getting Started

The GameX SDK provides a type-safe way to manage game data with built-in validation. Import the necessary dependencies:

```typescript
import { GameSDK } from '@gamex-official/gamex-node-sdk';
import { z } from 'zod';
```

## Schema Definition

Define your game's data structure using Zod schemas. This ensures type safety and runtime validation.

### Basic Schema Example

```typescript
const PlayerProgressSchema = z.object({
    level: z.number().min(1).max(100),
    experience: z.number().nonnegative(),
    inventory: z.array(z.object({
        itemId: z.string(),
        quantity: z.number().positive(),
    })),
    lastSaved: z.string().datetime(),
    achievements: z.array(z.string()),
    settings: z.object({
        musicVolume: z.number().min(0).max(1),
        sfxVolume: z.number().min(0).max(1),
        difficulty: z.enum(['easy', 'normal', 'hard']),
    }).optional(),
});
```

### Advanced Schema Examples

```typescript
// Game State Schema
const GameStateSchema = z.object({
    currentLevel: z.string(),
    playerPosition: z.object({
        x: z.number(),
        y: z.number(),
        z: z.number()
    }),
    activeQuests: z.array(z.object({
        id: z.string(),
        progress: z.number().min(0).max(100),
        completed: z.boolean(),
        timeStarted: z.string().datetime()
    })),
    gameVersion: z.string(),
    lastCheckpoint: z.string().optional()
});

// Player Stats Schema
const PlayerStatsSchema = z.object({
    health: z.number().min(0).max(100),
    mana: z.number().min(0).max(100),
    attributes: z.object({
        strength: z.number().min(1),
        dexterity: z.number().min(1),
        intelligence: z.number().min(1)
    }),
    skills: z.record(z.string(), z.number().min(0).max(100))
});
```

## SDK Initialization

Initialize the SDK with your credentials:

```typescript
const gameSDK = new GameSDK({
    gameId: process.env.GAME_ID,
    gameSecret: process.env.GAME_SECRET,
    environment: process.env.NODE_ENV, // 'development' | 'production'
    options: {
        autoRetry: true,
        maxRetries: 3,
        timeout: 5000
    }
});

const client = gameSDK.client(PlayerProgressSchema);
```

### Environment Configuration

```typescript
// .env.local
NEXT_PUBLIC_GAME_ID=your_game_id
GAME_SECRET=your_game_secret
NEXT_PUBLIC_DEV_MODE=true  # Development mode
```

## React Integration

### Custom Hooks

```typescript
// hooks/useGameState.ts
import { useEffect, useState } from 'react';
import { GameSDK } from '@gamex-official/gamex-node-sdk';

export function useGameState<T>(client: GameSDK) {
    const [gameData, setGameData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchGameData() {
            try {
                const data = await client.getMyPlayerData<T>();
                setGameData(data);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Unknown error'));
            } finally {
                setLoading(false);
            }
        }

        fetchGameData();
    }, [client]);

    return { gameData, loading, error };
}
```

### React Component Examples

```typescript
// components/GameProgress.tsx
import React from 'react';
import { useGameState } from '../hooks/useGameState';

type PlayerProgress = z.infer<typeof PlayerProgressSchema>;

export function GameProgress({ client }: { client: GameSDK }) {
    const { gameData, loading, error } = useGameState<PlayerProgress>(client);

    if (loading) return <div>Loading game data...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!gameData) return <div>No game data available</div>;

    return (
        <div>
            <h2>Player Progress</h2>
            <div>Level: {gameData.level}</div>
            <div>Experience: {gameData.experience}</div>
            <div>
                <h3>Inventory</h3>
                {gameData.inventory.map(item => (
                    <div key={item.itemId}>
                        {item.itemId}: {item.quantity}
                    </div>
                ))}
            </div>
        </div>
    );
}
```

### Auto-Save Implementation

```typescript
// components/AutoSave.tsx
import React, { useEffect } from 'react';

export function AutoSave({ client, gameData, interval = 60000 }) {
    useEffect(() => {
        const saveInterval = setInterval(async () => {
            try {
                await client.sendPlayerData({
                    ...gameData,
                    lastSaved: new Date().toISOString()
                });
                console.log('Auto-save successful');
            } catch (error) {
                console.error('Auto-save failed:', error);
            }
        }, interval);

        return () => clearInterval(saveInterval);
    }, [client, gameData, interval]);

    return null;
}


## Advanced Examples

### Implementing a Save System

``ts
// utils/saveSystem.ts
export class SaveSystem {
    private client: GameSDK;
    private autoSaveInterval: number;
    private lastSave: Date;

    constructor(client: GameSDK, autoSaveInterval = 60000) {
        this.client = client;
        this.autoSaveInterval = autoSaveInterval;
        this.lastSave = new Date();
    }

    async quickSave(data: PlayerProgress) {
        try {
            await this.client.sendPlayerData({
                ...data,
                lastSaved: new Date().toISOString()
            });
            this.lastSave = new Date();
            return true;
        } catch (error) {
            console.error('Quick save failed:', error);
            return false;
        }
    }

    async loadGame(): Promise<PlayerProgress | null> {
        try {
            return await this.client.getMyPlayerData<PlayerProgress>();
        } catch (error) {
            console.error('Load game failed:', error);
            return null;
        }
    }

    startAutoSave(data: PlayerProgress) {
        return setInterval(() => this.quickSave(data), this.autoSaveInterval);
    }
}
```

### Game State Management with Context

```typescript
// context/GameContext.tsx
import React, { createContext, useContext, useState } from 'react';

const GameContext = createContext<{
    gameState: PlayerProgress | null;
    setGameState: (state: PlayerProgress) => void;
} | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
    const [gameState, setGameState] = useState<PlayerProgress | null>(null);

    return (
        <GameContext.Provider value={{ gameState, setGameState }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGameContext() {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGameContext must be used within a GameProvider');
    }
    return context;
}
```

## Error Handling

```typescript
// utils/errorHandling.ts
export class GameError extends Error {
    constructor(
        message: string,
        public code: string,
        public details?: any
    ) {
        super(message);
        this.name = 'GameError';
    }
}

export function handleGameError(error: unknown) {
    if (error instanceof GameSDKError) {
        switch (error.code) {
            case 'VALIDATION_ERROR':
                console.error('Data validation failed:', error.validationErrors);
                // Handle validation errors
                break;
            case 'NETWORK_ERROR':
                console.error('Network error:', error.message);
                // Handle network errors
                break;
            default:
                console.error('Unknown error:', error);
        }
    }
}
```

## TypeScript Integration

```typescript
// types/game.ts
type GameSDKOptions = {
    autoRetry: boolean;
    maxRetries: number;
    timeout: number;
};

type GameConfig = {
    gameId: string;
    gameSecret: string;
    environment: 'development' | 'production';
    options?: Partial<GameSDKOptions>;
};

// Utility types
type InventoryItem = z.infer<typeof PlayerProgressSchema>['inventory'][number];
type GameSettings = z.infer<typeof PlayerProgressSchema>['settings'];
```

## Best Practices

1. **State Management**
   - Use React Context for global game state
   - Implement proper data persistence strategies
   - Handle loading and error states appropriately

2. **Performance**
   - Implement debouncing for frequent save operations
   - Use memoization for expensive calculations
   - Optimize render cycles with React.memo and useMemo

3. **Security**
   - Never expose game secrets in client-side code
   - Implement proper validation for all user inputs
   - Use environment variables for sensitive data

4. **Error Recovery**
   - Implement auto-save recovery mechanisms
   - Provide manual save/load functionality
   - Keep backup saves when updating data

## Troubleshooting

Common issues and solutions:

1. **Validation Errors**
   - Check schema definitions match your data structure
   - Ensure all required fields are present
   - Verify data types and ranges

2. **Network Issues**
   - Implement retry logic for failed requests
   - Add proper error handling for offline scenarios
   - Cache data locally when appropriate

3. **State Management**
   - Use proper state initialization
   - Handle loading states correctly
   - Implement proper error boundaries

4. **Performance**
   - Optimize save frequency
   - Implement proper data caching
   - Monitor memory usage

For additional support, please refer to the official GameX documentation or contact support.
