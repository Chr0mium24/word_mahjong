class Deck {
  constructor(customDeck = '') {
    this.tiles = this.generateTiles(customDeck);
    this.shuffle();
  }

  generateTiles(customDeck) {
    let baseDeck = customDeck;
    if (baseDeck.length === 0) {
      // Default deck if none provided
      baseDeck = '一二三四五六七八九万筒条中发白东西南北';
    }

    if (baseDeck.length < 144) {
      console.log(`Custom deck has less than 144 tiles, repeating to fill.`);
      baseDeck = baseDeck.repeat(Math.ceil(144 / baseDeck.length));
    }

    if (baseDeck.length > 144) {
      console.log(`Custom deck has more than 144 tiles, truncating.`);
      baseDeck = baseDeck.substring(0, 144);
    }

    return baseDeck.split('').map((char, index) => ({ id: index, char }));
  }

  shuffle() {
    for (let i = this.tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.tiles[i], this.tiles[j]] = [this.tiles[j], this.tiles[i]];
    }
  }

  draw(count = 1) {
    return this.tiles.splice(0, count);
  }

  get remaining() {
    return this.tiles.length;
  }
}

module.exports = Deck;
