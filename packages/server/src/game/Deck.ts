import { Tile } from '@word-mahjong/common';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_DECK_CHARS = "的一是了我不人在他有这个上们来到时大地为子中你说生国年着就那和要你 isch"; // A small default set for now

export class Deck {
  private tiles: string[] = [];

  constructor(customDeck?: string) {
    this.createDeck(customDeck);
    this.shuffle();
  }

  private createDeck(customDeck?: string) {
    let deckString = customDeck || DEFAULT_DECK_CHARS;
    
    if (deckString.length < 144) {
      console.log('Custom deck is smaller than 144, repeating characters to fill.')
      deckString = deckString.repeat(Math.ceil(144 / deckString.length));
    }
    
    if (deckString.length > 144) {
      console.log('Custom deck is larger than 144, truncating.')
      deckString = deckString.substring(0, 144);
    }

    this.tiles = Array.from(deckString);
  }

  private shuffle() {
    for (let i = this.tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.tiles[i], this.tiles[j]] = [this.tiles[j], this.tiles[i]];
    }
  }

  public draw(count: number): string[] {
    return this.tiles.splice(0, count);
  }

  public get remaining(): number {
    return this.tiles.length;
  }
}
