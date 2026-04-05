const Game = require("./Game");

/**
 * Room - Manages a game instance with a specific group of users
 * Each room is identified by a 4-letter code and can have multiple users
 */
class Room {
  constructor(roomCode, io) {
    this.roomCode = roomCode;
    this.io = io;
    this.users = [];
    this.game = new Game(this, io);
    this.status = "waiting"; // waiting, ready, playing, finished
    this.createdAt = Date.now();
  }

  getRoomCode() {
    return this.roomCode;
  }

  getStatus() {
    return this.status;
  }

  setStatus(status) {
    this.status = status;
    this.broadcastRoomStatus();
  }

  addUser(user) {
    if (this.users.length >= this.game.MAX_USERS) {
      user.refuse();
      return false;
    }
    this.users.push(user);
    console.log(`[${this.roomCode}] addUser: ${this.users.length} users`);
    this.broadcastRoomStatus();
    return true;
  }

  removeUser(user) {
    const idx = this.users.indexOf(user);
    if (idx >= 0) {
      this.users.splice(idx, 1);
      console.log(`[${this.roomCode}] removeUser: ${this.users.length} users`);
      this.broadcastRoomStatus();

      // Clean up empty rooms to prevent memory leaks
      if (this.users.length === 0) {
        const RoomManager = require("./RoomManager");
        console.log(`[${this.roomCode}] Room is empty, scheduling cleanup...`);
        // Delay cleanup slightly to allow for last broadcasts
        setTimeout(() => {
          RoomManager.removeRoom(this.roomCode);
        }, 100);
      }
    }
  }

  getUsers() {
    return this.users;
  }

  getUserCount() {
    return this.users.length;
  }

  getPlayersInfo() {
    const users = [];
    for (let i = 0; i < this.users.length; i++) {
      const user = this.users[i];
      if (user.getName() !== "") {
        users.push({
          username: user.getName(),
          score: user.getScore(),
          hasJoined: user.hasJoined,
        });
      }
    }
    return users;
  }

  broadcastRoomStatus() {
    const status = {
      roomCode: this.roomCode,
      gameStatus: this.status,
      players: this.getPlayersInfo(),
    };
    this.io.to(`room:${this.roomCode}`).emit("roomStatus", status);
  }

  getSocketRoom() {
    return `room:${this.roomCode}`;
  }

  startGame() {
    this.setStatus("playing");
    this.game.newRound();
  }

  getGame() {
    return this.game;
  }
}

module.exports = Room;
