**项目名称：字牌风云 (Word Mahjong) - TypeScript Monorepo 版**

#### **1. 项目概述**

“字牌风云”是一款基于 Web 的多人在线文字组合游戏，其灵感源于麻将，但以汉字卡牌的自由组合与社交判断取代了传统的牌型规则。游戏的核心在于玩家的创造力、语言组织能力以及说服他人的能力。玩家需要利用手中的“字”牌，通过摸牌、打牌、“吃”牌来组合成有意义、有韵味甚至有趣的诗句或句子。当玩家认为自己的牌在画布上组合完毕（“胡”）或希望利用上家的牌组成词语（“吃”）时，必须发起一次全体投票。只有在规定时间内获得除自己外**至少两名**其他玩家的“同意”，操作才能成功。这是一个考验语言智慧与社交博弈的“文人”麻将。

#### **1.5 界面风格**

游戏采用横屏布局。屏幕下半部分约40%是玩家专属的**个人创作画布**，这是一个二维空间，玩家可以在此自由拖动、排列自己的手牌，牌与牌之间有网格吸附效果，**确保它们对齐且不能重叠**。画布之外的区域用于展示公共信息：中央是所有玩家打出的弃牌池，同时会渲染其他三位玩家的牌背视图及其公开的“吃”牌组合（明牌）。

---

#### **2. 核心玩法机制**

* **基本流程**: 每局游戏四人参与。每位玩家起手13张字牌。轮到自己时，系统自动摸一张新牌，玩家有20秒时间思考并双击打出一张最不需要的牌。若超时未打，则系统自动打出刚摸到的那张牌。
* **胡牌 (Win)**: 当玩家认为自己手中的所有牌（包括起手牌、摸到的牌以及所有公开的“吃”牌组合）已经可以**全部用上**，共同组成一句或多句通顺、有意义或有艺术感的诗句/句子时，可以宣布“胡牌”。宣布后，该玩家在个人画布上的牌面布局将对所有其他玩家公开，以供投票。
* **吃牌 (Chow)**: **仅当上家**打出一张字牌，而你认为这张牌可以与你手中的任意两张牌组合成一个有意义的词语时，你可以选择“吃”。点击“吃”后，你需要从手牌中选出对应的两张牌并公开。这三张牌（上家打的1张 + 你自己的2张）将作为一个组合，**像麻将一样横置在你的牌堆前，永久公开**，然后你需要从剩余手牌中打出一张。
* **操作优先级**: 当一名玩家打出一张牌后，其他玩家可能可以对这张牌进行“吃”或“胡”的操作。服务器将遵循麻将规则，**“胡”的优先级高于“吃”**。若有多个玩家可以“胡”这张牌，则按逆时针顺序，离打牌者最近的玩家优先。
* **流局 (Draw)**: 如果牌墙的所有牌都被摸完，但仍然没有玩家成功“胡牌”，则本局游戏为“流局”。本局不进行计分，所有玩家准备后直接开始新的一局。
* **社交投票机制 (核心)**:
  * 无论是“胡”还是“吃”，发起后都会立即触发一次对所有其他玩家的投票。
  * **通过条件**: 操作必须获得**至少两位**其他玩家的“同意”票才算成功。发起投票的玩家本人不需要投票。
  * **投票时限**: 投票时间为10秒。其他玩家的界面会弹出投票窗口，并显示倒计时。
  * **默认同意**: 在10秒内未做出选择的玩家，系统将视为“同意”。
  * **结果**:
    * **投票通过**: “胡牌”则游戏结束，该玩家获胜，进入结算界面；“吃牌”则将该组合收入自己牌面，并打出一张手牌，轮到下家摸牌。
    * **投票失败**: 若未能获得至少两票“同意”（即有两名或以上的玩家投了“反对”），则操作失败。
      * “吃”失败: 游戏继续，轮到原顺序的下家摸牌。
      * “胡”失败 (惩罚机制): 若是“胡牌”投票失败，**该玩家在自己的下一个出牌回合内不能再次宣告“胡牌”**。游戏继续，轮到原顺序的下家摸牌。

---

#### **3. 核心技术栈**

* **Monorepo 管理**: PNPM Workspaces
* **前端UI框架**: React (with TypeScript)
* **UI样式库**: Tailwind CSS
* **2D图形渲染库**: Konva.js (with `react-konva`)
* **后端 & 实时通信**: Node.js + Express (with TypeScript) + Socket.IO
* **共享代码**: `packages/common` 用于存放前后端共享的类型定义和工具函数。

---

#### **4. 共享类型定义 (`packages/common/src/types.ts`)**

这是 Monorepo 架构的核心优势，确保前后端数据结构的一致性。

```typescript
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
```

---

#### **5. 功能模块详述**

**5.1. 前端应用 (`packages/client`)**

* **技术栈**: React, TypeScript, Tailwind CSS, `react-konva`, Socket.IO Client
* **组件 (`/src/components`)**:
  * `Lobby.tsx`: 游戏入口。
  * `CreateRoom.tsx`: 创建房间界面，可定义投票/打牌时间及**自定义牌库**。
    * **自定义牌库逻辑**: 房主在 `<textarea>` 中输入一串汉字。创建时，若长度不足144，则循环填充并提示；若超过144，则截取前144个并提示。
  * `GameUI.tsx`: 游戏界面外壳，管理整体布局。
  * `PlayerInfo.tsx`: 显示玩家列表、得分、明牌区、弃牌池等。
  * `ActionButtons.tsx`: "吃"、"胡"按钮。根据 `GameState` 中的 `penalty` 状态和游戏时机动态启用或禁用。
  * `VoteModal.tsx`: 核心投票弹窗。
    * `Props: { vote: CurrentVote, onVote: (decision: 'approve' | 'deny') => void }`
    * 清晰展示投票内容，如“玩家A试图用‘X’组成‘XYZ’”、“玩家B宣布胡牌，其组合为：...”，并附带倒计时。
  * `ScoreboardModal.tsx`: 计分板。
  * `GameCanvas.tsx`: Konva.js 画布。
    * 使用 `react-konva` 的 `<Stage>`, `<Layer>`, `<Group>` 组件。
    * **拖放与对齐**: 牌的拖放整理**完全在客户端进行**，`onDragEnd` 事件仅更新本地 React State。拖动结束后，根据位置计算最近的网格点并吸附，同时进行碰撞检测，**禁止牌与牌重叠**。
    * **打牌**: `onDblClick` 事件触发向服务器发送 `playTile` WebSocket 事件。
    * **胡牌展示**: 投票时，根据服务器广播的布局数据，只读地渲染胡牌玩家的画布。可考虑将布局生成为图片URL或JSON数据进行广播，以优化性能。

**5.2. 服务器 (`packages/server`)**

* **技术栈**: Node.js, TypeScript, Express, Socket.IO
* **状态权威**: 服务器是游戏状态的唯一和最终决策者。
* **核心逻辑 (`/src/game`)**:
  * `Game.ts`: 游戏房间类。封装所有与单个房间相关的状态 (`GameState`) 和逻辑（发牌、处理出牌、投票、结算等）。
  * `Player.ts`: 玩家类，管理单个玩家的数据。
  * `Deck.ts`: 牌库类，负责根据房主输入生成、洗牌和摸牌。
* **Socket 事件处理 (`/src/socket`)**:
  * `gameHandlers.ts`: 集中处理所有游戏内核心事件，如 `playTile`, `claimAction`。
  * `roomHandlers.ts`: 处理房间的创建、加入、断线重连等。
* **投票逻辑**:
  1. 客户端发起 `claimAction`。服务器验证其合法性（如玩家是否处于 `cannot_win_next_turn` 惩罚状态）。
  2. 服务器更新 `gameState` 为 `voting`，填充 `currentVote` 对象，并广播 `startVote`。
  3. 启动服务器端计时器。期间接收 `submitVote` 事件。
  4. 计时结束或所有人都投票后，计算结果：将所有 `pending` 状态的投票视为 `approve`。若 `approve` 票数 `>= 2`，则成功。
  5. 广播 `voteResult`。若“胡牌”投票失败，则更新发起者的 `penalty` 状态为 `cannot_win_next_turn`。
* **断线重连与托管**:
  1. 玩家断线，服务器更新其 `status` 为 `disconnected`，并启动3分钟重连计时器。
  2. **重连**: 玩家在时限内重连，服务器验证身份后，私信完整的 `GameState`。
  3. **托管**: 超时未重连，`status` 变为 `managed`。托管玩家在其回合会自动摸牌并立即打出，所有投票自动记为“同意”。

---

#### **6. 关键 WebSocket 事件流**

所有事件的负载（Payload）类型都应在 `packages/common/src/events.ts` 中定义，以实现前后端共享。

```typescript
// packages/common/src/events.ts
import { GameState, Tile, CurrentVote } from './types';

// Client -> Server Payloads
export interface JoinRoomPayload { username: string; roomId: string; }
export interface CreateRoomPayload { /* ..., */ customDeck?: string; }
export interface PlayTilePayload { tileId: string; }
export interface ClaimActionPayload { type: 'chow' | 'win'; tiles: string[]; targetTileId?: string; }
export interface SubmitVotePayload { decision: 'approve' | 'deny'; }

// Server -> Client Payloads
export type GameStateUpdatePayload = GameState;
export type StartVotePayload = CurrentVote;
export interface VoteResultPayload { /* ... */ }
export type NewTilePayload = { tile: Tile };
// ... etc.
```

* **Client -> Server**:
  * `joinRoom(payload: JoinRoomPayload)`
  * `createRoom(payload: CreateRoomPayload)`
  * `playTile(payload: PlayTilePayload)`
  * `claimAction(payload: ClaimActionPayload)`
  * `submitVote(payload: SubmitVotePayload)`
  * `readyForNextGame()`
* **Server -> Client(s)**:
  * `gameStateUpdate(payload: GameStateUpdatePayload)`: (广播) 关键动作后发送完整游戏状态。
  * `startVote(payload: StartVotePayload)`: (广播给投票者) 通知投票开始。
  * `voteResult(payload: VoteResultPayload)`: (广播) 公布投票结果。
  * `newTile(payload: NewTilePayload)`: (私信) 向当前回合玩家发送新摸的牌。
  * `gameError(payload: { message: string })`: (私信) 操作失败或非法时，向特定玩家发送错误信息。
  * `playerConnectionUpdate(payload: { playerId: string; status: PlayerStatus })`: (广播) 通知玩家连接状态变化。

---

#### **7. 实施要点**

* **类型安全**: 充分利用 `packages/common` 中的共享类型，确保客户端与服务器之间的数据契约是严格且无误的。
* **清晰的用户反馈**: UI 必须精确反映 `GameState`，包括：当前回合、剩余时间、投票详情、个人惩罚状态等。
* **关注点分离**: 严格分离 React (UI) 和 Konva (画布) 的职责。React State 是数据源，Konva 仅负责渲染该 State。
* **健壮的服务器逻辑**: 服务器必须是所有规则的最终裁决者，客户端的任何请求都需经过严格验证，防止作弊。断线重连和托管机制是保证多人体验流畅的关键。

---

#### **8. Monorepo 目录结构建议**

```
/word-mahjong
├── /packages
│   ├── /client           // React 前端应用
│   │   ├── /src
│   │   │   ├── /components
│   │   │   ├── /context
│   │   │   └── ...
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── /server           // Node.js 后端应用
│   │   ├── /src
│   │   │   ├── /game
│   │   │   ├── /socket
│   │   │   └── server.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── /common           // 共享代码 (类型定义, 工具函数)
│       ├── /src
│       │   ├── types.ts
│       │   └── events.ts
│       ├── package.json
│       └── tsconfig.json
│
├── package.json          // Monorepo 根 package.json
├── pnpm-workspace.yaml   // PNPM workspace 配置文件
└── tsconfig.base.json    // 基础 TypeScript 配置
```
