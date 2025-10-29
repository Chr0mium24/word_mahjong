import { Player as PlayerType, Tile } from '@word-mahjong/common';

export class Player implements PlayerType {
  id: string;
  name: string;
  hand: Tile[] = [];
  score = 0;
  status: 'online' | 'disconnected' | 'managed' = 'online';
  penalty: 'none' | 'cannot_win_next_turn' = 'none';
  isReady = false;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}
