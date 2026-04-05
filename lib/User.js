const he = require("he");

class User {
  constructor(room, socket) {
    this.room = room;
    this.socket = socket;
    this.username = "";
    this.score = 0;
    this.locked = true;
    this.hasJoined = false;
    this.bindEvents();
  }

  bindEvents() {
    this.socket.on("login", (data) => {
      // No username?
      if (!data.username) {
        return;
      }
      const username = he.encode(data.username);
      this.username = username;
      this.socket.emit("login");
      this.room.getGame().updatePlayers();
      console.log(`[${this.room.getRoomCode()}] >>> ${username}`);
    });

    this.socket.on("disconnect", () => {
      this.room.getGame().removeUser(this);
    });

    // Monitor events
    this.socket.on("spectate", (data) => {
      this.socket.join(`room:${this.room.getRoomCode()}`);
      this.room.getGame().updatePlayers();
    });

    this.socket.on("start", (data) => {
      this.room.startGame();
    });

    this.socket.on("next", (data) => {
      console.log(`[${this.room.getRoomCode()}] Requesting next song`);
      this.room.getGame().nextSong();
    });

    // Player events
    this.socket.on("button", (data) => {
      if (this.locked) {
        return;
      }
      const button = parseInt(data.button, 10);
      this.lock();
      this.room.getGame().checkAnswer(this, button);
    });
  }

  join() {
    if (this.username !== "") {
      this.hasJoined = true;
      this.socket.join(`room:${this.room.getRoomCode()}`);
      this.room.getGame().updatePlayers();
      console.log(`[${this.room.getRoomCode()}] +++ ${this.username}`);
    }
  }

  refuse() {
    this.socket.emit("refused");
  }

  lock() {
    this.locked = true;
  }

  unlock() {
    this.locked = false;
  }

  isWrong() {
    this.socket.emit("answer");
  }

  isRight() {
    this.socket.emit("answer", { username: this.username });
    this.socket
      .to(`room:${this.room.getRoomCode()}`)
      .emit("answer", { username: this.username });
    this.room.getGame().updatePlayers();
  }

  isWinner() {
    this.socket.emit("winner", this.username);
    this.socket
      .to(`room:${this.room.getRoomCode()}`)
      .emit("winner", this.username);
    this.room.getGame().updatePlayers();
  }

  getName() {
    return this.username;
  }

  getScore() {
    return this.score;
  }

  resetScore() {
    this.score = 0;
  }

  inc() {
    this.score++;
  }
}

module.exports = User;
