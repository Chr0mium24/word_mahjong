import React, { useState } from 'react';

interface LobbyProps {
  username: string;
  setUsername: (name: string) => void;
  onCreateRoom: (customDeck?: string) => void;
  onJoinRoom: (roomId: string) => void;
}

const Lobby: React.FC<LobbyProps> = ({ username, setUsername, onCreateRoom, onJoinRoom }) => {
  const [roomId, setRoomId] = useState('');
  const [customDeck, setCustomDeck] = useState('');

  return (
    <div>
      <h1>字牌风云 (Word Mahjong)</h1>
      <input
        type="text"
        placeholder="输入你的名字"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <div>
        <textarea
          placeholder="输入自定义牌库（可选，留空则使用默认牌库）"
          value={customDeck}
          onChange={(e) => setCustomDeck(e.target.value)}
          rows={4}
          cols={50}
        />
      </div>
      <button onClick={() => onCreateRoom(customDeck)} disabled={!username.trim()}>
        创建房间
      </button>
      <hr />
      <input
        type="text"
        placeholder="输入房间号"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button onClick={() => onJoinRoom(roomId)} disabled={!username.trim() || !roomId.trim()}>
        加入房间
      </button>
    </div>
  );
};

export default Lobby;
