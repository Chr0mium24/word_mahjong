// Game.js
const { v4: uuidv4 } = require("uuid");

const CHARACTER_POOL = "风花雪月春江夜雨山空星河云梦竹影琴声棋局书卷画船诗酒茶禅梅兰松菊天地玄黄宇宙洪荒日月盈昃辰宿列张寒来暑往秋收冬藏".split("");

class Game {
    constructor(roomId, io) {
        this.io = io;
        this.roomId = roomId;

        this.state = {
            roomId: roomId,
            players: {},
            wall: [],
            turn: null,
            turnExpiresAt: null,
            gameState: "waiting",
            lastDiscard: null,
            currentVote: null,
        };

        this.turnTimer = null;
        this.voteTimer = null;
    }

    addPlayer(socket, username) {
        if (this.state.gameState !== 'waiting') {
            socket.emit('error', { message: '游戏已开始，无法加入' });
            return;
        }

        this.state.players[socket.id] = {
            id: socket.id,
            username: username,
            hand: [],
            claimedChows: [], // 用于存放“吃”成功的组合
        };
        
        socket.emit('joinSuccess', { username, roomId: this.roomId });
        console.log(`玩家 ${username} (${socket.id}) 加入房间 ${this.roomId}`);
        
        if (Object.keys(this.state.players).length === 2) {
            this.startGame();
        }

        this.broadcastGameState();
    }

    removePlayer(playerId) {
        delete this.state.players[playerId];

        if (this.state.gameState !== 'waiting' && Object.keys(this.state.players).length > 0) {
            if(this.state.turn === playerId){
                clearTimeout(this.turnTimer);
                this.nextTurn();
            }
            if(this.state.currentVote && this.state.currentVote.claimantId === playerId){
                clearTimeout(this.voteTimer);
                this.cancelVote();
            }
        }
        
        this.broadcastGameState();
    }

    startGame() {
        console.log(`房间 ${this.roomId} 游戏开始`);
        this.state.wall = CHARACTER_POOL.concat(CHARACTER_POOL)
            .map(char => ({ id: uuidv4(), char }))
            .sort(() => Math.random() - 0.5);

        const playerIds = Object.keys(this.state.players);
        playerIds.forEach(pid => {
            this.state.players[pid].hand = this.state.wall.splice(0, 13);
        });

        this.state.gameState = 'playing';
        this.startTurn(playerIds[0]);
    }
    
    startTurn(playerId) {
        if (this.state.wall.length === 0) {
            this.endGame({ result: 'draw', message: '牌墙已空，游戏平局' });
            return;
        }
        
        const player = this.state.players[playerId];
        if(!player) {
            this.nextTurn();
            return;
        }

        const newTile = this.state.wall.pop();
        player.hand.push(newTile);

        this.state.turn = playerId;
        this.state.turnExpiresAt = Date.now() + 20000;

        this.io.to(playerId).emit('newTile', { tile: newTile });
        this.io.to(this.roomId).emit('turnChanged', {
            nextPlayerId: playerId,
            turnExpiresAt: this.state.turnExpiresAt
        });

        clearTimeout(this.turnTimer);
        this.turnTimer = setTimeout(() => {
            console.log(`玩家 ${player.username} 超时，自动打出刚摸的牌`);
            this.playTile(playerId, { tileId: newTile.id });
        }, 20000);

        this.broadcastGameState();
    }

    nextTurn() {
        const playerIds = Object.keys(this.state.players);
        if (playerIds.length === 0) return;

        const currentIndex = playerIds.indexOf(this.state.turn);
        const nextIndex = (currentIndex + 1) % playerIds.length;
        
        this.startTurn(playerIds[nextIndex]);
    }

    playTile(playerId, { tileId }) {
        if (this.state.turn !== playerId || this.state.gameState !== 'playing') {
            return;
        }
        
        const player = this.state.players[playerId];
        const tileIndex = player.hand.findIndex(t => t.id === tileId);

        if (tileIndex === -1) return;

        clearTimeout(this.turnTimer);
        const [playedTile] = player.hand.splice(tileIndex, 1);
        this.state.lastDiscard = { tile: playedTile, playerId: playerId };

        console.log(`玩家 ${player.username} 打出: ${playedTile.char}`);
        
        this.broadcastGameState();
        this.nextTurn();
    }

    endGame(result) {
        this.state.gameState = 'ended';
        this.io.to(this.roomId).emit('gameEnd', result);
        this.broadcastGameState();
    }

    claimAction(playerId, { type, tiles }) {
        const claimant = this.state.players[playerId];
        if (!claimant) return;

        // --- [TODO 1 COMPLETED] 服务器端验证逻辑 ---
        if (type === 'chow') {
            if (!this.state.lastDiscard) {
                console.warn(`[Validation] "吃"牌请求失败: 没有可以吃的牌。`);
                return;
            }
            const lastDiscardId = this.state.lastDiscard.tile.id;
            if (!tiles || !tiles.some(t => t.id === lastDiscardId)) {
                 console.warn(`[Validation] "吃"牌请求失败: 提交的牌组不包含上家打出的牌。`);
                 return;
            }
            const handTilesInClaim = tiles.filter(t => t.id !== lastDiscardId);
            if (handTilesInClaim.length !== 2) {
                console.warn(`[Validation] "吃"牌请求失败: 请求必须包含两张手牌。`);
                return;
            }
            const hasTilesInHand = handTilesInClaim.every(claimTile => 
                claimant.hand.some(handTile => handTile.id === claimTile.id)
            );
            if (!hasTilesInHand) {
                console.warn(`[Validation] "吃"牌请求失败: 玩家手上没有其声称用于"吃"的牌。`);
                return;
            }
        } else if (type === 'win') {
            if (claimant.hand.length !== 14 || tiles.length !== 14) {
                 console.warn(`[Validation] "胡"牌请求失败: 手牌数量不正确(${claimant.hand.length})。`);
                 return;
            }
        }
        // --- 验证结束 ---

        this.state.gameState = 'voting';
        const voters = Object.keys(this.state.players).filter(pid => pid !== playerId);
        
        this.state.currentVote = {
            type: type,
            claimantId: playerId,
            claimantName: claimant.username,
            claimedTiles: tiles,
            votes: voters.reduce((acc, pid) => ({ ...acc, [pid]: 'pending' }), {}),
            expiresAt: Date.now() + 10000,
        };
        
        this.io.to(this.roomId).emit('startVote', this.state.currentVote);
        console.log(`玩家 ${claimant.username} 发起 ${type} 投票`);

        clearTimeout(this.voteTimer);
        this.voteTimer = setTimeout(() => this.tallyVotes(), 10000);
        this.broadcastGameState();
    }
    
    submitVote(voterId, { decision }) {
        if (this.state.gameState !== 'voting' || !this.state.currentVote.votes.hasOwnProperty(voterId)) {
            return;
        }
        this.state.currentVote.votes[voterId] = decision;
        console.log(`玩家 ${this.state.players[voterId].username} 投票: ${decision}`);
        
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
                // --- [TODO 2 COMPLETED] 处理“吃”牌成功的逻辑 ---
                const claimant = this.state.players[claimantId];
                const claimedTiles = this.state.currentVote.claimedTiles;
                const lastDiscardedTile = this.state.lastDiscard.tile;

                // 1. 从发起者手牌中移除对应的牌
                const tilesFromHandIds = claimedTiles
                    .filter(t => t.id !== lastDiscardedTile.id)
                    .map(t => t.id);
                claimant.hand = claimant.hand.filter(t => !tilesFromHandIds.includes(t.id));

                // 2. 将吃到的组合放入公开区域
                claimant.claimedChows.push(claimedTiles);
                
                // 3. 中断回合，轮到“吃”牌者打出一张牌
                this.state.gameState = 'playing';
                this.state.turn = claimantId;
                this.state.turnExpiresAt = Date.now() + 20000;
                this.state.lastDiscard = null; // 被吃的牌已被处理

                this.io.to(this.roomId).emit('turnChanged', {
                    nextPlayerId: claimantId,
                    turnExpiresAt: this.state.turnExpiresAt
                });

                // 4. 启动打牌倒计时
                clearTimeout(this.turnTimer);
                this.turnTimer = setTimeout(() => {
                    const tileToDiscard = claimant.hand[claimant.hand.length - 1];
                    if (tileToDiscard) {
                        console.log(`玩家 ${claimant.username} "吃"牌后超时，自动打牌`);
                        this.playTile(claimantId, { tileId: tileToDiscard.id });
                    }
                }, 20000);
                // --- “吃”牌逻辑结束 ---
            }
        } else {
            this.state.gameState = 'playing';
        }

        this.state.currentVote = null;
        this.broadcastGameState();
    }
    
    cancelVote(){
        this.state.gameState = 'playing';
        this.state.currentVote = null;
        this.io.to(this.roomId).emit('voteCancelled');
        this.broadcastGameState();
    }

    broadcastGameState() {
        if (!this.io) return;
        Object.keys(this.state.players).forEach(playerId => {
            const filteredState = this.filterStateForPlayer(playerId);
            this.io.to(playerId).emit('gameStateUpdate', filteredState);
        });
    }

    filterStateForPlayer(playerId) {
        const stateCopy = JSON.parse(JSON.stringify(this.state));
        for (const pid in stateCopy.players) {
            if (pid !== playerId) {
                // 隐藏手牌内容，只显示数量
                stateCopy.players[pid].hand = stateCopy.players[pid].hand.map(t => ({ id: t.id }));
            }
        }
        stateCopy.wall = stateCopy.wall.length;
        return stateCopy;
    }
    
    moveTileInHand(playerId, data) {
        // 此逻辑纯客户端表现，服务器无需处理，留空
    }
}

module.exports = { Game };