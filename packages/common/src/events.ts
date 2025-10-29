// packages/common/src/events.ts
import { GameState, Tile, CurrentVote, PlayerStatus } from './types';

// Client -> Server Payloads
export interface JoinRoomPayload { username: string; roomId: string; }
export interface CreateRoomPayload { username: string; customDeck?: string; }
export interface PlayTilePayload { tileId: string; }
export interface ClaimActionPayload { type: 'chow' | 'win'; tiles: string[]; targetTileId?: string; }
export interface SubmitVotePayload { decision: 'approve' | 'deny'; }
export interface ReadyForNextGamePayload {}

// Server -> Client Payloads
export type GameStateUpdatePayload = GameState;
export type StartVotePayload = CurrentVote;
export interface VoteResultPayload { 
    success: boolean;
    type: 'chow' | 'win';
    claimantId: string;
    votes: Record<string, 'approve' | 'deny'>;
}
export type NewTilePayload = { tile: Tile };
export type GameErrorPayload = { message: string };
export type PlayerConnectionUpdatePayload = { playerId: string; status: PlayerStatus };
