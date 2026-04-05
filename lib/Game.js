const db = require("./Songs");

class Game {
  constructor(room, io) {
    this.room = room;
    this.io = io;
    this.MAX_USERS = 16;
    this.MAX_SCORE = 20;
    this.round = null;
    this.currentSong = null;
    this.currentSongErrors = 0;
  }

  getRoomSocketName() {
    return `room:${this.room.getRoomCode()}`;
  }

  removeUser(user) {
    this.room.removeUser(user);
    this.updatePlayers();
  }

  newRound() {
    console.log(
      `[${this.room.getRoomCode()}] =================================================`
    );
    console.log(`[${this.room.getRoomCode()}] New round!`);

    const users = this.room.getUsers();
    for (let i = 0; i < users.length; i++) {
      // Reset scores
      users[i].resetScore();
      // Pending users can play now
      users[i].join();
    }
    this.nextSong();
  }

  nextSong() {
    db.getRandomSong((data) => {
      const song = data;
      this.currentSong = song;
      this.currentSongErrors = 0;
      console.log(
        `[${this.room.getRoomCode()}] Now playing : ${song.artist.name} - ${song.title}`
      );

      const users = this.room.getUsers();
      for (let i = 0; i < users.length; i++) {
        users[i].unlock();
      }

      this.io.to(this.getRoomSocketName()).emit("song", { song: song });
    });
  }

  checkAnswer(user, button) {
    if (button < 0 || button > this.currentSong.suggestions.length) {
      return;
    }

    const isRight = this.currentSong.suggestions[button].answer;
    if (isRight) {
      user.inc();
      if (user.getScore() >= this.MAX_SCORE) {
        console.log(
          `[${this.room.getRoomCode()}] ${user.getName()} is the winner!`
        );
        user.isWinner();
        setTimeout(() => {
          this.newRound();
        }, 10000);
      } else {
        console.log(`[${this.room.getRoomCode()}] ${user.getName()} is right!`);
        user.isRight();
        setTimeout(() => {
          this.nextSong();
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
          this.nextSong();
        }, 5000);
      }
    }
  }

  updatePlayers() {
    const users = [];
    const gameUsers = this.room.getUsers();
    for (let i = 0; i < gameUsers.length; i++) {
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
  }
}

module.exports = Game;
