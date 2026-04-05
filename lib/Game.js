var db = require("./Songs");

function Game(room, io) {
  this.room = room;
  this.io = io;
  this.MAX_USERS = 16;
  this.MAX_SCORE = 20;
  this.round = null;
  this.currentSong = null;
  this.currentSongErrors = 0;
}

Game.prototype.getRoomSocketName = function () {
  return `room:${this.room.getRoomCode()}`;
};

Game.prototype.removeUser = function (user) {
  this.room.removeUser(user);
  this.updatePlayers();
};

Game.prototype.newRound = function () {
  console.log(
    `[${this.room.getRoomCode()}] =================================================`
  );
  console.log(`[${this.room.getRoomCode()}] New round!`);
  //check that round is finished

  var users = this.room.getUsers();
  for (var i = 0; i < users.length; i++) {
    //Reset scores
    users[i].resetScore();
    //Pending users can play now
    users[i].join();
  }
  this.nextSong();
};

Game.prototype.nextSong = function () {
  var self = this;
  db.getRandomSong(function (data) {
    var song = data;
    self.currentSong = song;
    self.currentSongErrors = 0;
    console.log(
      `[${self.room.getRoomCode()}] Now playing : ${song.artist.name} - ${song.title}`
    );

    var users = self.room.getUsers();
    for (var i = 0; i < users.length; i++) {
      users[i].unlock();
    }

    self.io.to(self.getRoomSocketName()).emit("song", { song: song });
  });
};

Game.prototype.checkAnswer = function (user, button) {
  if (button < 0 || button > this.currentSong.suggestions.length) {
    return;
  }

  var self = this;
  var isRight = this.currentSong.suggestions[button].answer;
  if (isRight) {
    user.inc();
    if (user.getScore() >= this.MAX_SCORE) {
      console.log(
        `[${this.room.getRoomCode()}] ${user.getName()} is the winner!`
      );
      user.isWinner();
      setTimeout(() => {
        self.newRound();
      }, 10000);
    } else {
      console.log(`[${this.room.getRoomCode()}] ${user.getName()} is right!`);
      user.isRight();
      setTimeout(() => {
        self.nextSong();
      }, 5000);
    }
  } else {
    user.isWrong();
    console.log(`[${this.room.getRoomCode()}] ${user.getName()} is wrong!`);
    this.currentSongErrors++;
    if (this.currentSongErrors >= this.room.getUsers().length - 1) {
      console.log(`[${this.room.getRoomCode()}] All users are wrong`);
      this.io.to(this.getRoomSocketName()).emit("answer");
      setTimeout(() => {
        self.nextSong();
      }, 5000);
    }
  }
};

Game.prototype.updatePlayers = function () {
  var users = [];
  var gameUsers = this.room.getUsers();
  for (var i = 0; i < gameUsers.length; i++) {
    if ("" === gameUsers[i].getName()) {
      continue;
    }
    users.push({
      username: gameUsers[i].getName(),
      score: gameUsers[i].getScore(),
      hasJoined: gameUsers[i].hasJoined,
    });
  }
  this.io.to(this.getRoomSocketName()).emit("users", { users: users });
};

module.exports = Game;
