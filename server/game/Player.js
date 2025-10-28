class Player {
  constructor(id, username) {
    this.id = id;
    this.username = username;
    this.hand = [];
    this.melds = [];
    this.status = 'online'; // 'online', 'disconnected', 'managed'
    this.penalty = 'none'; // 'none', 'cannot_win_next_turn'
    this.score = 0;
  }
}

module.exports = Player;
