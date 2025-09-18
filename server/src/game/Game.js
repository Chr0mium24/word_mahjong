// Game.js
const { v4: uuidv4 } = require("uuid");

// 扩充的文字库
const CHARACTER_POOL = "风花雪月春江夜雨山空星河云梦竹影琴声棋局书卷画船诗酒茶禅梅兰松菊天地玄黄宇宙洪荒日月盈昃辰宿列张寒来暑往秋收冬藏".split("");

class Game {
    constructor(roomId, io) {
        this.io = io;
        this.roomId = roomId;

        // 游戏状态，与前端文档对齐
        this.state = {
            roomId: roomId,
            players: {},
            wall: [],
            turn: null,
            turnExpiresAt: null,
            gameState: "waiting", // 'waiting' | 'playing' | 'voting' | 'ended'
            lastDiscard: null, // 记录上一个打出的牌，用于“吃”牌判断
            currentVote: null,
        };

        this.turnTimer = null; // 用于存储回合倒计时的setTimeout
        this.voteTimer = null; // 用于存储投票倒计时的setTimeout
    }

    // --- 玩家管理 ---
    addPlayer(socket, username) {
        if (this.state.gameState !== 'waiting') {
            socket.emit('error', { message: '游戏已开始，无法加入' });
            return;
        }

        this.state.players[socket.id] = {
            id: socket.id,
            username: username,
            hand: [],
            claimedChows: [], // 存放“吃”成功的组合
        };
        
        // 通知客户端加入成功
        socket.emit('joinSuccess', { username, roomId: this.roomId });

        console.log(`玩家 ${username} (${socket.id}) 加入房间 ${this.roomId}`);
        
        // 示例：当有2个玩家时自动开始游戏（可调整）
        if (Object.keys(this.state.players).length === 2) {
            this.startGame();
        }

        this.broadcastGameState();
    }

    removePlayer(playerId) {
        delete this.state.players[playerId];

        // 如果游戏正在进行中，需要处理回合、投票等逻辑
        if (this.state.gameState !== 'waiting') {
            // 如果是当前回合的玩家掉线，则强制进入下一回合
            if(this.state.turn === playerId){
                clearTimeout(this.turnTimer);
                this.nextTurn();
            }
            // 如果投票发起人掉线，取消投票
            if(this.state.currentVote && this.state.currentVote.claimantId === playerId){
                clearTimeout(this.voteTimer);
                this.cancelVote();
            }
        }
        
        this.broadcastGameState();
    }

    // --- 核心游戏流程 ---
    startGame() {
        console.log(`房间 ${this.roomId} 游戏开始`);
        // 1. 初始化牌墙
        this.state.wall = CHARACTER_POOL.concat(CHARACTER_POOL) // 两套牌
            .map(char => ({ id: uuidv4(), char }))
            .sort(() => Math.random() - 0.5);

        // 2. 发牌
        const playerIds = Object.keys(this.state.players);
        playerIds.forEach(pid => {
            this.state.players[pid].hand = this.state.wall.splice(0, 13);
        });

        // 3. 设置游戏状态和第一个回合
        this.state.gameState = 'playing';
        this.startTurn(playerIds[0]);
    }
    
    startTurn(playerId) {
        if (this.state.wall.length === 0) {
            this.endGame({ result: 'draw', message: '牌墙已空，游戏平局' });
            return;
        }
        
        const player = this.state.players[playerId];
        if(!player) return; // 如果玩家已掉线，则跳过

        // 1. 摸牌
        const newTile = this.state.wall.pop();
        player.hand.push(newTile);

        // 2. 更新回合信息
        this.state.turn = playerId;
        this.state.turnExpiresAt = Date.now() + 20000; // 20秒回合时间

        // 3. 私信新牌给当前玩家
        this.io.to(playerId).emit('newTile', { tile: newTile });

        // 4. 广播回合变更
        this.io.to(this.roomId).emit('turnChanged', {
            nextPlayerId: playerId,
            turnExpiresAt: this.state.turnExpiresAt
        });

        // 5. 启动20秒打牌定时器
        this.turnTimer = setTimeout(() => {
            console.log(`玩家 ${player.username} 超时，自动打出刚摸的牌`);
            this.playTile(playerId, { tileId: newTile.id });
        }, 20000);

        this.broadcastGameState();
    }

    nextTurn() {
        const playerIds = Object.keys(this.state.players);
        const currentIndex = playerIds.indexOf(this.state.turn);
        // 如果找不到当前玩家（可能已掉线），则从第一个玩家开始
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % playerIds.length;
        
        if(playerIds[nextIndex]){
            this.startTurn(playerIds[nextIndex]);
        }
    }

    playTile(playerId, { tileId }) {
        // 验证
        if (this.state.turn !== playerId || this.state.gameState !== 'playing') {
            return;
        }
        
        const player = this.state.players[playerId];
        const tileIndex = player.hand.findIndex(t => t.id === tileId);

        if (tileIndex === -1) return; // 玩家手上没有这张牌

        // 状态更新
        clearTimeout(this.turnTimer); // 清除超时定时器
        const [playedTile] = player.hand.splice(tileIndex, 1);
        this.state.lastDiscard = { tile: playedTile, playerId: playerId };

        console.log(`玩家 ${player.username} 打出: ${playedTile.char}`);
        
        this.broadcastGameState(); // 先广播一次打牌动作
        this.nextTurn(); // 然后进入下一回合
    }

    endGame(result) {
        this.state.gameState = 'ended';
        this.io.to(this.roomId).emit('gameEnd', result);
        this.broadcastGameState();
    }

    // --- 动作与投票 ---
    claimAction(playerId, { type, tiles }) {
        const claimant = this.state.players[playerId];
        if (!claimant) return;

        // TODO: 在此添加更严格的服务器端验证逻辑
        // 例如，验证“吃”的牌是否合法，验证“胡”的牌是否满足14张等

        // 开始投票
        this.state.gameState = 'voting';
        const voters = Object.keys(this.state.players).filter(pid => pid !== playerId);
        
        this.state.currentVote = {
            type: type,
            claimantId: playerId,
            claimantName: claimant.username,
            claimedTiles: tiles, // 前端传来用于展示的牌
            votes: voters.reduce((acc, pid) => ({ ...acc, [pid]: 'pending' }), {}),
            expiresAt: Date.now() + 10000,
        };
        
        // 广播投票开始事件给所有投票者
        this.io.to(this.roomId).emit('startVote', this.state.currentVote);
        console.log(`玩家 ${claimant.username} 发起 ${type} 投票`);

        // 启动10秒投票计时器
        this.voteTimer = setTimeout(() => this.tallyVotes(), 10000);
        this.broadcastGameState();
    }
    
    submitVote(voterId, { decision }) {
        if (this.state.gameState !== 'voting' || !this.state.currentVote.votes.hasOwnProperty(voterId)) {
            return;
        }
        this.state.currentVote.votes[voterId] = decision;
        console.log(`玩家 ${this.state.players[voterId].username} 投票: ${decision}`);
        
        // 检查是否所有人都已投票
        const allVoted = Object.values(this.state.currentVote.votes).every(v => v !== 'pending');
        if (allVoted) {
            clearTimeout(this.voteTimer);
            this.tallyVotes();
        }
        this.broadcastGameState();
    }

    tallyVotes() {
        if (!this.state.currentVote) return;

        const { type, claimantId, votes, claimantName } = this.state.currentVote;
        
        // 核心规则：检查是否有任何一张“反对”票
        const hasDeny = Object.values(votes).some(v => v === 'deny');
        const result = hasDeny ? 'failure' : 'success';

        console.log(`投票结果: ${result}`);
        this.io.to(this.roomId).emit('voteResult', { result, type, claimantName });

        if (result === 'success') {
            if (type === 'win') {
                this.endGame({
                    result: 'win',
                    winner: claimantName,
                    winningHand: this.state.players[claimantId].hand,
                });
            } else if (type === 'chow') {
                // TODO: 处理“吃”牌成功的逻辑
                // 1. 从发起者手牌中移除对应的牌
                // 2. 将吃到的组合放入 claimedChows
                // 3. 要求发起者打一张牌
                // 4. 轮到下一个玩家
                this.state.gameState = 'playing'; // 暂时恢复状态
                this.nextTurn();
            }
        } else {
            // 投票失败，游戏继续
            this.state.gameState = 'playing';
            // 回合应该继续从原顺序的下家开始，`nextTurn()` 在 `playTile` 后已调用，所以这里无需额外操作
        }

        this.state.currentVote = null;
        this.broadcastGameState();
    }
    
    cancelVote(){
        this.state.gameState = 'playing';
        this.state.currentVote = null;
        // 可以在这里广播一个投票取消的事件
        this.io.to(this.roomId).emit('voteCancelled');
        this.broadcastGameState();
    }

    // --- 数据广播 ---
    /**
     * 向房间内的所有玩家广播游戏状态。
     * 每个玩家会收到为其过滤后的状态（隐藏他人手牌）。
     */
    broadcastGameState() {
        if (!this.io) return;
        
        Object.keys(this.state.players).forEach(playerId => {
            const filteredState = this.filterStateForPlayer(playerId);
            this.io.to(playerId).emit('gameStateUpdate', filteredState);
        });
    }

    /**
     * 为单个玩家过滤游戏状态，隐藏敏感信息。
     * @param {string} playerId
     * @returns {object} 过滤后的游戏状态
     */
    filterStateForPlayer(playerId) {
        const stateCopy = JSON.parse(JSON.stringify(this.state));

        // 隐藏其他玩家的手牌内容，只保留数量
        for (const pid in stateCopy.players) {
            if (pid !== playerId) {
                stateCopy.players[pid].hand = stateCopy.players[pid].hand.length;
            }
        }
        
        // 隐藏牌墙的具体内容
        stateCopy.wall = stateCopy.wall.length;

        return stateCopy;
    }
    
    // 客户端请求移动手牌位置（仅作美观，服务器不关心具体位置）
    moveTileInHand(playerId, data) {
        // 服务器是状态权威，不关心客户端牌的位置，但可以广播此事件
        // 让其他客户端看到“某人在整理手牌”的动画效果（如果需要）
        // 为简化，此处留空，因为核心逻辑不依赖它
    }
}

module.exports = { Game };