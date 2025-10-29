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

## Step 5: Client-Side Refactoring & Type Safety

- **Component-Based Architecture**: The main `App.tsx` has been refactored. The UI is now split into distinct `Lobby.tsx` and `GameUI.tsx` components, improving code organization and maintainability.
- **Improved State Management**: The root `App.tsx` component now properly manages the socket connection and game state, passing data and callbacks down to child components as props.
- **Full Type Safety**: All client-server communication (socket event emissions and listeners) now uses the strictly-typed payloads defined in the `@word-mahjong/common` package. This eliminates a class of potential runtime errors and improves developer experience.
- **UI Logic Cleanup**: Removed the manual "Start Game" button, aligning the client with the server's automatic game start logic. The UI now correctly reflects the "waiting for players" and "playing" states.

## Step 6: Advanced Features & Polishing

- **Custom Deck Creation**: The client now features a textarea in the lobby for players to input a custom set of characters for the game deck. The server correctly generates the deck based on this input, ensuring the deck size is exactly 144 characters by either repeating or truncating the provided string.
- **Disconnect/Reconnect Handling**: The server can now handle player disconnections. A disconnected player has a 3-minute window to reconnect. If they fail to do so, their status changes to "managed," and the server will automatically play for them to keep the game moving. Reconnecting players are seamlessly integrated back into the game with the current state.
- **Scoring and Game End**: A basic scoring system has been implemented. The winner of a round receives 10 points. At the end of a game, a scoreboard is displayed, and players can signal their readiness for the next round.
- **UI/UX Refinements**: The game UI now provides better user feedback. It displays whose turn it is, highlights the current player in the player list, and features a countdown timer to show the remaining time for the current turn. Buttons are disabled when it is not the player's turn.