var User = require("./User");
var db = require("./Songs");

var Game = {
  io: null,
  MAX_USERS: 16,
  MAX_SCORE: 20,
  users: [],
  round: null,
  currentSong: null,

  init: function(io) {
    Game.io = io;
    console.log("Launching...");
    Game.waitForUsers();
  },

  waitForUsers: function() {
    console.log("Waiting for players");
    Game.io.sockets.on("connection", function(socket) {
      var user = new User(Game, socket);
      Game.addUser(user);
    });
  },

  addUser: function(user) {
    Game.users.push(user);
    if (Game.users.length >= Game.MAX_USERS) {
      user.refuse();
      return;
    }
    console.log(`addUser: ${Game.users.length} users`);
  },

  removeUser: function(user) {
    var idx = Game.users.indexOf(user);
    Game.users.splice(idx, 1);
    console.log(`removeUser: ${Game.users.length} users`);
    Game.updatePlayers();
  },

  newRound: function() {
    console.log("=================================================");
    console.log("New round!");
    //check that round is finished

    for (var i = 0, l = Game.users.length; i < l; i++) {
      //Reset scores
      Game.users[i].resetScore();
      //Pending users can play now
      Game.users[i].join();
    }
    Game.nextSong();
  },

  nextSong: function() {
    db.getRandomSong(function(data) {
      song = data;
      Game.currentSong = song;
      Game.currentSongErrors = 0;
      console.log("Now playing : " + song.artist.name + " - " + song.title);

      for (var i = 0, l = Game.users.length; i < l; i++) {
        Game.users[i].unlock();
      }

      Game.io.sockets.in("game").emit("song", { song: song });
    });
  },

  checkAnswer: function(user, button) {
    if (button < 0 || button > Game.currentSong.suggestions.length) {
      return;
    }

    var isRight = Game.currentSong.suggestions[button].answer;
    if (isRight) {
      user.inc();
      if (user.getScore() >= Game.MAX_SCORE) {
        console.log(user.getName() + " is the winner!");
        user.isWinner();
        setTimeout(() => {
          Game.newRound();
        }, 10000);
      } else {
        console.log(user.getName() + " is right!");
        user.isRight();
        setTimeout(() => {
          Game.nextSong();
        }, 5000);
      }
    } else {
      user.isWrong();
      console.log(user.getName() + " is wrong!");
      Game.currentSongErrors++;
      if (Game.currentSongErrors >= Game.users.length - 1) {
        console.log("All users are wrong");
        Game.io.sockets.in("game").emit("answer");
        setTimeout(() => {
          Game.nextSong();
        }, 5000);
      }
    }
  },

  updatePlayers: function() {
    var users = [];
    for (var i = 0, l = Game.users.length; i < l; i++) {
      if ("" === Game.users[i].getName()) {
        continue;
      }
      users.push({
        username: Game.users[i].getName(),
        score: Game.users[i].getScore(),
        hasJoined: Game.users[i].hasJoined
      });
    }
    Game.io.sockets.in("game").emit("users", { users: users });
  }
};

module.exports = Game;
