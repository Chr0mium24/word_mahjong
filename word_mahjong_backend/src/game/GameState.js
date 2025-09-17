const { v4: uuidv4 } = require("uuid");

// 诗歌文字库 - 您可以尽情扩充
const CHARACTER_POOL =
    "风花雪月春江夜雨山空星河云梦竹影琴声棋局书卷画船诗酒茶禅".split("");

// 创建一个初始的文字方块（牌）集合
function createInitialTiles() {
    return CHARACTER_POOL.map((char, index) => ({
        id: uuidv4(),
        char: char,
        owner: null, // null 表示在牌墙中
        pos: { x: 50 + (index % 10) * 70, y: 50 }, // 牌墙的初始位置
        isPublic: false,
    }));
}

function createNewGameState(roomId) {
    return {
        roomId: roomId,
        players: {}, // key: socket.id, value: { name: 'playerName' }
        tiles: createInitialTiles(),
        turn: null, // 初始没有回合，等待玩家加入
        gameState: "waiting", // waiting, playing, voting, ended
        claimantId: null, // 宣布胜利的玩家ID
        votes: {}, // 存储投票结果
    };
}

module.exports = { createNewGameState };
