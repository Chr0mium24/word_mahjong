# Word Mahjong - Task Breakdown 项目ui语言为中文

This document breaks down the development of the "Word Mahjong" project into major tasks, based on the `GOAL.md` file.

## Step 1: Project Setup & Foundation

1. **Initialize Monorepo**:

   * Set up a new pnpm workspace.
   * Create `packages/client`, `packages/server`, and `packages/common` directories.
   * Initialize `package.json` for each package and the root.
   * Configure `pnpm-workspace.yaml`.
2. **Setup TypeScript**:

   * Create a `tsconfig.base.json` in the root.
   * Create `tsconfig.json` for each package, extending the base configuration.
3. **Shared Code (`packages/common`)**:

   * Define all TypeScript types (`Tile`, `Player`, `GameState`, etc.) in `packages/common/src/types.ts`.
   * Define all WebSocket event payloads and their types in `packages/common/src/events.ts`.

## Step 2: Server-Side Core Logic (`packages/server`)

1. **Basic Server Setup**:

   * Set up a Node.js server with Express and TypeScript.
   * Integrate Socket.IO for real-time communication.
2. **Game Logic Implementation**:

   * Create a `Game.ts` class to manage the state of a single game room (`GameState`).
   * Create a `Player.ts` class to manage individual player data.
   * Create a `Deck.ts` class to handle card deck creation (including custom decks), shuffling, and dealing.
3. **Room and Connection Management**:

   * Implement socket handlers for creating and joining rooms (`roomHandlers.ts`).
   * Handle basic player connection and disconnection events.

## Step 3: Client-Side UI & Canvas (`packages/client`)

1. **React Project Setup**:

   * Create a new React application using TypeScript.
   * Install and configure Tailwind CSS.
   * Install `react-konva` and `konva`.
2. **Component Scaffolding**:

   * Create placeholder components for all UI elements described in `GOAL.md`: `Lobby`, `CreateRoom`, `GameUI`, `PlayerInfo`, `ActionButtons`, `VoteModal`, `ScoreboardModal`, and `GameCanvas`.
3. **Game Canvas Implementation (`GameCanvas.tsx`)**:

   * Set up the Konva Stage, Layer, and Groups.
   * Render the player's hand of tiles.
   * Implement drag-and-drop functionality for tiles within the canvas.
   * Implement grid snapping to ensure tiles are aligned.
   * Implement collision detection to prevent tiles from overlapping.

## Step 4: Core Gameplay Loop Integration

1. **Client-Server Communication**:

   * Implement Socket.IO client logic to connect to the server and handle events.
   * Use shared types from `packages/common` for all communication.
2. **Basic Game Flow**:

   * **Server**: Implement the game start logic, including dealing initial hands.
   * **Client**: Receive and render the initial game state.
   * **Server**: Implement turn management, including drawing a new tile for the current player.
   * **Client**:
     * Receive the new tile and add it to the player's hand.
     * Implement the double-click action on a tile to trigger the `playTile` event.
   * **Server**: Handle the `playTile` event, update the game state, and broadcast the changes.
   * **Client**: Update the UI to reflect the new game state (e.g., show the discarded tile in the public discard pile).

## Step 5: "Chow" and "Win" Actions & Voting System

1. **Claiming Actions**:

   * **Client**: Enable "Chow" and "Win" buttons based on game state and player status (e.g., penalty).
   * **Client**: Send `claimAction` event to the server when a button is clicked.
   * **Server**: Validate the `claimAction` request (e.g., check if the move is legal, check for penalties).
2. **Voting Logic**:

   * **Server**:
     * If a claim is valid, change `gameState` to `voting` and broadcast a `startVote` event with the vote details.
     * Start a timer for the vote.
     * Handle `submitVote` events from clients.
     * Tally the votes when the timer ends or all players have voted (treating pending votes as "approve").
     * Broadcast the `voteResult`.
   * **Client**:
     * On `startVote`, display the `VoteModal` with the vote details and a countdown.
     * Allow players to submit their vote.
     * On `voteResult`, hide the modal and update the UI based on the outcome.
3. **Handling Vote Outcomes**:

   * **Server**:
     * If a "Win" vote passes, end the game.
     * If a "Chow" vote passes, update the player's melds and continue the game.
     * If a "Win" vote fails, apply the `cannot_win_next_turn` penalty to the player.

## Step 6: Advanced Features & Polishing

1. **Custom Deck Creation**:

   * **Client**: Implement the `<textarea>` in `CreateRoom.tsx` for custom deck input.
   * **Server**: Implement the logic in `Deck.ts` to generate a deck from the custom string provided by the client.
2. **Disconnect/Reconnect Handling**:

   * **Server**: Implement the logic to handle player disconnection (set status to `disconnected`, start a timer).
   * **Server**: If the player reconnects in time, send them the full `GameState`.
   * **Server**: If the timer expires, set the player's status to `managed` and implement the auto-play logic for that player.
3. **Scoring and Game End**:

   * Implement scoring logic.
   * **Client**: Display the `ScoreboardModal` at the end of the game.
   * Implement a "Ready for Next Game" flow.
4. **UI/UX Refinement**:

   * Ensure all UI elements provide clear feedback to the user (e.g., whose turn it is, time remaining, penalties).
   * Add animations for dealing, drawing, and playing tiles.
   * Refine the layout and styling based on the vision in `GOAL.md`.
