var Game = require("./Game");

/**
 * Room - Manages a game instance with a specific group of users
 * Each room is identified by a 4-letter code and can have multiple users
 */
function Room(roomCode, io) {
  this.roomCode = roomCode;
  this.io = io;
  this.users = [];
  this.game = new Game(this, io);
  this.status = "waiting"; // waiting, ready, playing, finished
}

Room.prototype.getRoomCode = function () {
  return this.roomCode;
};

Room.prototype.getStatus = function () {
  return this.status;
};

Room.prototype.setStatus = function (status) {
  this.status = status;
  this.broadcastRoomStatus();
};

Room.prototype.addUser = function (user) {
  if (this.users.length >= this.game.MAX_USERS) {
    user.refuse();
    return false;
  }
  this.users.push(user);
  console.log(`[${this.roomCode}] addUser: ${this.users.length} users`);
  this.broadcastRoomStatus();
  return true;
};

Room.prototype.removeUser = function (user) {
  var idx = this.users.indexOf(user);
  if (idx >= 0) {
    this.users.splice(idx, 1);
    console.log(`[${this.roomCode}] removeUser: ${this.users.length} users`);
    this.broadcastRoomStatus();
  }
};

Room.prototype.getUsers = function () {
  return this.users;
};

Room.prototype.getUserCount = function () {
  return this.users.length;
};

Room.prototype.getPlayersInfo = function () {
  var users = [];
  for (var i = 0; i < this.users.length; i++) {
    var user = this.users[i];
    if (user.getName() !== "") {
      users.push({
        username: user.getName(),
        score: user.getScore(),
        hasJoined: user.hasJoined,
      });
    }
  }
  return users;
};

Room.prototype.broadcastRoomStatus = function () {
  var status = {
    roomCode: this.roomCode,
    gameStatus: this.status,
    players: this.getPlayersInfo(),
  };
  this.io.to(`room:${this.roomCode}`).emit("roomStatus", status);
};

Room.prototype.getSocketRoom = function () {
  return `room:${this.roomCode}`;
};

Room.prototype.startGame = function () {
  this.setStatus("playing");
  this.game.newRound();
};

Room.prototype.getGame = function () {
  return this.game;
};

module.exports = Room;
