var App = {
  currentSong: null,
  audio: null,
  timestamp: 0,
  pause: 5 * 1000,
  roundPause: 10 * 1000,
  timerPlaceholder: "♫",
  currentRoom: null,

  init: function () {
    const url = window.location + "";
    document.getElementById("join-url").innerHTML = url.replace(
      "/spectate",
      ""
    );

    App.visualization.init();

    // socket.emit('next');
    if (!soundManager.usePeakData) {
      App.timerPlaceholder = "▶";
      document.getElementById("timer").addEventListener("click", function () {
        App.audio.play("preview");
      });
    }
  },

  showRoomSetup: function () {
    document.getElementById("room-setup").style.display = "block";
    document.getElementById("intro").style.display = "none";
  },

  hideRoomSetup: function () {
    document.getElementById("room-setup").style.display = "none";
    document.getElementById("intro").style.display = "block";
  },

  setRoomCode: function (roomCode) {
    App.currentRoom = roomCode;
    document.getElementById("room-code-display").textContent = roomCode;
  },

  goToGame: function (song) {
    const intro = document.getElementById("intro");
    intro.classList.add("animated", "bounceOutUp");
    setTimeout(function () {
      intro.style.display = "none";
    }, 1000);
    App.next(song);
  },

  next: function (song) {
    App.currentSong = song.song;
    if (App.audio && typeof App.audio.stop == "function") {
      App.audio.stop();
    }
    document.getElementById("suggestions").innerHTML = "";
    App.hideHint();
    App.hideAnswer();
    App.hideWinner();
    App.initTimer();
    App.play();
  },

  play: function () {
    App.showSuggestions();
    App.playPreview();
  },

  showSuggestions: function () {
    let out = "";
    App.currentSong.suggestions.forEach(function (value) {
      out += '<li data-answer="' + value.answer + '">' + value.name + "</li>";
    });
    const suggestionsEl = document.getElementById("suggestions");
    suggestionsEl.innerHTML = out;
    suggestionsEl.querySelectorAll("li").forEach(function (el) {
      el.classList.add("flipInX");
    });
  },

  showHint: function () {
    const answerEl = document.getElementById("answer");
    const winnerEl = document.getElementById("winner");

    if (
      answerEl.style.display === "block" ||
      winnerEl.style.display === "block"
    ) {
      return;
    }

    const hintEl = document.getElementById("hint");
    hintEl.textContent = App.currentSong.year;
    hintEl.classList.remove("fadeOutDown");
    hintEl.classList.add("fadeInUp");
    hintEl.style.display = "block";
  },

  hideHint: function () {
    const hintEl = document.getElementById("hint");
    hintEl.classList.remove("fadeInUp");
    hintEl.classList.add("fadeOutDown");
    setTimeout(function () {
      hintEl.style.display = "none";
    }, 450);
  },

  showAnswer: function (username) {
    const winnerEl = document.getElementById("winner");
    if (winnerEl.style.display === "block") {
      return;
    }

    App.hideHint();

    const playerRightEl = document.getElementById("player-right");
    if (typeof username !== "undefined") {
      playerRightEl.querySelector("span").textContent = username;
      playerRightEl.style.display = "block";
    } else {
      playerRightEl.querySelector("span").textContent = "Nobody";
      playerRightEl.style.display = "block";
      document.getElementById("answer").classList.add("no-winner");
    }

    document.getElementById("timer").textContent = "➜";
    const answerEl = document.getElementById("answer");
    answerEl.classList.add("fadeInUp");
    answerEl.style.display = "block";
    document
      .querySelectorAll("#suggestions [data-answer=false]")
      .forEach(function (el) {
        el.classList.add("wrong");
      });
  },

  hideAnswer: function () {
    document.getElementById("player-right").querySelector("span").textContent =
      "";
    const playerRightEl = document.getElementById("player-right");
    playerRightEl.style.display = "none";
    playerRightEl.style.backgroundColor = "inherit";
    const answerEl = document.getElementById("answer");
    answerEl.style.display = "none";
    answerEl.classList.remove("fadeInUp");
    answerEl.classList.remove("no-winner");
  },

  initTimer: function () {
    const timerEl = document.getElementById("timer");
    timerEl.classList.remove("warning");
    timerEl.textContent = App.timerPlaceholder;
  },

  timerNearEnd: function () {
    document.getElementById("timer").classList.add("warning");
  },

  playPreview: function () {
    document.querySelector(".artist").textContent = App.currentSong.artist.name;
    document.querySelector(".title").textContent =
      App.currentSong.title + " (" + App.currentSong.year + ")";
    soundManager.destroySound("preview");
    App.audio = soundManager.createSound({
      id: "preview",
      url: App.currentSong.preview,
      onload: function () {
        let timestamp = Math.round(App.audio.duration / 3);
        App.audio.onPosition(timestamp, App.showHint);

        timestamp = Math.round((App.audio.duration * 2) / 3);
        App.audio.onPosition(timestamp, App.hideHint);

        timestamp = Math.floor(App.audio.duration - 5000);
        App.audio.onPosition(timestamp, App.timerNearEnd);
      },
      whileloading: function () {},
      whileplaying: function () {
        let mean = 0;
        App.timestamp = Math.floor(
          (App.audio.durationEstimate - App.audio.position) / 1000
        );
        document.getElementById("timer").textContent = App.timestamp;
        if (soundManager.usePeakData) {
          mean = App.audio.peakData.left + App.audio.peakData.right / 2;
        }
        App.visualization.update(mean);
      },
      onfinish: function () {
        App.showAnswer();

        // Time is up, next
        setTimeout(function () {
          socket.emit("next");
        }, App.pause);
      },
    });
    App.audio.play();
  },

  showWinner: function (winner) {
    App.winner = winner;
    document.getElementById("winner-name").textContent = winner;
    document.getElementById("winner").style.display = "block";
    // setTimeout(function() {
    //   socket.emit("start");
    // }, App.roundPause);
  },

  hideWinner: function () {
    App.winner = "";
    document.getElementById("winner-name").textContent = "";
    document.getElementById("winner").style.display = "none";
  },
};

App.visualization = {
  ctx: null,
  width: 300,
  height: 300,
  minRadius: 50,
  factor: 50,

  init: function () {
    const paper = document.getElementById("visualization");
    paper.width = App.visualization.width;
    paper.height = App.visualization.height;
    App.visualization.ctx = paper.getContext("2d");
    App.visualization.update(0);
  },

  update: function (value) {
    const ctx = App.visualization.ctx;

    ctx.clearRect(0, 0, 300, 300);

    ctx.fillStyle = "#000";

    if (App.timestamp < 5) {
      ctx.fillStyle = "#F0C";
    }

    ctx.strokeStyle = "rgb(255,255,255)";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(
      Math.floor(App.visualization.width / 2),
      Math.floor(App.visualization.height / 2),
      App.visualization.minRadius + value * App.visualization.factor,
      0,
      Math.PI * 2,
      false
    );
    ctx.closePath();
    ctx.fill();
  },
};

var socket;
document.addEventListener("DOMContentLoaded", function () {
  App.init();
  App.showRoomSetup();

  socket = io.connect("http://" + location.hostname + ":" + location.port);

  // Room setup buttons
  document
    .getElementById("create-room-btn")
    .addEventListener("click", function () {
      socket.emit("createRoom", {});
    });

  document
    .getElementById("join-room-btn")
    .addEventListener("click", function () {
      var roomCode = document
        .getElementById("room-code-input")
        .value.toUpperCase();
      if (roomCode.length !== 4) {
        alert("Room code must be 4 letters");
        return;
      }
      socket.emit("joinRoom", { roomCode: roomCode });
    });

  // Allow pressing Enter in the room code input
  document
    .getElementById("room-code-input")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        document.getElementById("join-room-btn").click();
      }
    });

  // Convert room code to uppercase as user types
  document
    .getElementById("room-code-input")
    .addEventListener("input", function (e) {
      e.target.value = e.target.value.toUpperCase();
    });

  // Room events
  socket.on("roomCreated", function (data) {
    console.log("Room created: " + data.roomCode);
    App.setRoomCode(data.roomCode);
    App.hideRoomSetup();
    socket.emit("spectate", {});
  });

  socket.on("joinedRoom", function (data) {
    console.log("Joined room: " + data.roomCode);
    App.setRoomCode(data.roomCode);
    App.hideRoomSetup();
    socket.emit("spectate", {});
  });

  socket.on("joinRoomFailed", function (data) {
    alert("Failed to join room: " + data.reason);
  });

  socket.on("roomStatus", function (data) {
    console.log("Room status updated:", data);
  });

  document.getElementById("start").addEventListener("click", function () {
    socket.emit("start", {});
  });

  socket.on("users", function (data) {
    const users = data.users;
    let out = "";
    for (let i = 0, l = users.length; i < l; i++) {
      if (users[i].hasJoined) {
        out +=
          "<li>" + users[i].username + " (" + users[i].score + ")" + "</li>";
      } else {
        out += "<li>" + users[i].username + " (ready)" + "</li>";
      }
    }
    document.getElementById("players").innerHTML = out;
  });
  socket.on("song", function (song) {
    const intro = document.getElementById("intro");
    if (intro.style.display !== "none") {
      App.goToGame(song);
    } else {
      App.next(song);
    }
  });
  socket.on("answer", function (username) {
    if (username && username.username) {
      App.showAnswer(username.username);
    } else {
      App.showAnswer();
    }
  });
  socket.on("winner", function (winner) {
    App.showWinner(winner);
  });
});

module.exports = App;
