var he = require("he");

function User(room, socket) {
  this.room = room;
  this.socket = socket;
  this.username = "";
  this.score = 0;
  this.bindEvents();
  this.locked = true;
  this.hasJoined = false;
}

User.prototype.bindEvents = function () {
  var self = this;
  this.socket.on("login", function (data) {
    //No username?
    if (!data.username) {
      return;
    }
    var username = he.encode(data.username);
    self.username = username;
    self.socket.emit("login");
    self.room.getGame().updatePlayers();
    console.log(`[${self.room.getRoomCode()}] >>> ${username}`);
  });

  this.socket.on("disconnect", function () {
    self.room.getGame().removeUser(self);
  });

  //Monitor events
  this.socket.on("spectate", function (data) {
    self.socket.join(`room:${self.room.getRoomCode()}`);
    self.room.getGame().updatePlayers();
  });
  this.socket.on("start", function (data) {
    self.room.startGame();
  });
  this.socket.on("next", function (data) {
    console.log(`[${self.room.getRoomCode()}] Requesting next song`);
    self.room.getGame().nextSong();
  });

  //Player events
  this.socket.on("button", function (data) {
    if (self.locked) {
      return;
    }
    var button = parseInt(data.button, 10);
    self.lock();
    self.room.getGame().checkAnswer(self, button);
    // console.log(self.username + ' : ' + button);
  });
};

User.prototype.join = function () {
  if (this.username !== "") {
    this.hasJoined = true;
    this.socket.join(`room:${this.room.getRoomCode()}`);
    this.room.getGame().updatePlayers();
    console.log(`[${this.room.getRoomCode()}] +++ ${this.username}`);
  }
};

User.prototype.refuse = function () {
  this.socket.emit("refused");
};

User.prototype.lock = function () {
  this.locked = true;
};

User.prototype.unlock = function () {
  this.locked = false;
};

User.prototype.isWrong = function () {
  //this.score--;
  this.socket.emit("answer");
};

User.prototype.isRight = function () {
  this.socket.emit("answer", { username: this.username });
  this.socket
    .to(`room:${this.room.getRoomCode()}`)
    .emit("answer", { username: this.username });
  this.room.getGame().updatePlayers();
};

User.prototype.isWinner = function () {
  this.socket.emit("winner", this.username);
  this.socket
    .to(`room:${this.room.getRoomCode()}`)
    .emit("winner", this.username);
  this.room.getGame().updatePlayers();
};

User.prototype.getName = function () {
  return this.username;
};

User.prototype.getScore = function () {
  return this.score;
};

User.prototype.resetScore = function () {
  this.score = 0;
};

User.prototype.inc = function () {
  this.score++;
};

module.exports = User;
