# Word Mahjong - Progress

This document tracks the completed tasks for the "Word Mahjong" project.

## Step 1: Project Setup & Foundation

- **Monorepo Initialized**: The project is set up as a pnpm workspace with `packages/client`, `packages/server`, and `packages/common`.
- **TypeScript Configured**: A base `tsconfig.base.json` is present, and each package has its own `tsconfig.json` that extends it.
- **Shared Code Created**:
  - Core data structures (`Tile`, `Player`, `GameState`, etc.) are defined in `packages/common/src/types.ts`.
  - WebSocket event payloads are defined in `packages/common/src/events.ts`.

## Step 2: Server-Side Core Logic

- **Basic Server Setup**: A Node.js server using Express and Socket.IO has been established in `packages/server`.
- **Game Logic Scaffolding**: The core game logic classes (`Game.ts`, `Player.ts`, `Deck.ts`) have been created within `packages/server/src/game`.
- **Room Management**: Basic socket handlers for room creation and joining are in place in `packages/server/src/socket/roomHandlers.ts`.

## Step 3: Client-Side UI & Canvas

- **React Project Setup**: The client is a React application with TypeScript. The initial entry point is `packages/client/src/main.tsx`.
- **UI Scaffolding**: While the file structure is in place, the actual UI components (`Lobby`, `GameUI`, etc.) and the Konva.js canvas implementation are not yet fully built out. The basic rendering logic is in `main.tsx`.

## Step 4: Core Gameplay Loop Integration

- **Client-Server Communication**: The client now connects to the server via Socket.IO and can send and receive events. A basic `App.tsx` component manages the connection and game state.
- **Basic Game Flow**:
  - The server can now start a game when four players have joined.
  - The server deals initial hands to players.
  - Turn management is implemented on the server.
  - The client can send a `playTile` event to the server.
  - The server handles the `playTile` event, updates the game state, and broadcasts it to all clients.
- **UI Updates**: The client UI dynamically updates to reflect the current game state, showing player hands, the discard pile, and whose turn it is.
