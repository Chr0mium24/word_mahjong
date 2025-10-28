// packages/common/src/types.ts

/** 游戏中的单张字牌对象 */
export interface Tile {
  id: string;      // 唯一标识符
  text: string;    // 牌面汉字
  x: number;       // 在玩家画布上的 x 坐标 (网格单位)
  y: number;       // 在玩家画布上的 y 坐标 (网格单位)
}

/** 玩家状态 */
export type PlayerStatus = 'online' | 'disconnected' | 'managed';
/** 玩家惩罚状态 */
export type PlayerPenalty = 'none' | 'cannot_win_next_turn';
/** 投票决定 */
export type VoteDecision = 'approve' | 'deny' | 'pending';

/** 玩家对象 */
export interface Player {
  id: string;          // Socket ID
  name: string;
  hand: Tile[];        // 手牌，包含位置信息
  score: number;
  status: PlayerStatus;
  penalty: PlayerPenalty;
}

/** 公开的“吃”牌组合 (明牌) */
export interface Meld {
  ownerId: string;
  tiles: [Tile, Tile, Tile];
}

/** 当前投票的详细信息 */
export interface CurrentVote {
  type: 'chow' | 'win';
  claimantId: string;          // 发起投票的玩家ID
  targetTile?: Tile;           // "吃"或"胡"的目标牌
  claimedTiles: Tile[];        // 发起者用来组合的牌 (吃是2张，胡是所有牌)
  votes: Record<string, VoteDecision>; // key: 投票者ID, value: 决定
  expiresAt: number;           // 投票结束的时间戳
}

/** 游戏主状态对象 */
export interface GameState {
  roomId: string;
  players: Record<string, Player>;
  wall: string[];                  // 牌墙剩余的字 (为简化，只存字)
  turn: string;                    // 当前轮到谁的 Player ID
  turnExpiresAt: number;           // 回合结束的时间戳
  gameState: 'waiting' | 'playing' | 'voting' | 'ended';
  discards: Tile[];                // 公共弃牌堆 (保留ID等信息)
  melds: Meld[];                   // 所有玩家的明牌组合
  currentVote: CurrentVote | null;
}
