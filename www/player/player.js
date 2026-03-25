var socket;
var App = {
  currentSong: null,
  username: null,

  init: function () {
    socket = io.connect("http://" + location.hostname + ":" + location.port);

    // Login
    const form = document.querySelector("form");
    const nicknameInput = document.getElementById("nickname");
    const usernameDisplay = document.getElementById("username");
    const suggestionsContainer = document.getElementById("suggestions");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const username = nicknameInput.value;
      App.username = username;
      usernameDisplay.textContent = username;
      socket.emit("login", {
        username: username,
      });
    });

    socket.on("login", function () {
      form.style.display = "none";
      suggestionsContainer.innerHTML =
        '<span class="wait">Ready for next round</span>';
    });

    socket.on("refused", function () {
      alert("Server is full");
      socket.disconnect();
    });

    socket.on("song", function (song) {
      // if (App.userName) {
      App.onSong(song);
      // }
    });

    socket.on("answer", function (data) {
      if (data && data.username === App.username) {
        App.onRight();
      } else {
        App.onWrong();
      }
    });

    // Suggestions
    const eventType =
      typeof window.ontouchstart === "undefined" ? "click" : "touchend";
    suggestionsContainer.addEventListener(eventType, function (e) {
      const dataValue = e.target.dataset.value;
      if (dataValue !== undefined) {
        socket.emit("button", {
          button: dataValue,
        });
      }
    });
  },

  onSong: function (song) {
    App.currentSong = song.song;
    App.showSuggestions();
  },

  onRight: function () {
    document.getElementById("suggestions").innerHTML =
      "<span class='right'>✅</span>";
  },

  // @TODO : add case when other user is right onOtherRight

  onWrong: function () {
    document.getElementById("suggestions").innerHTML =
      "<span class='wrong'>❌</span>";
  },

  showSuggestions: function () {
    let out = "";
    for (let i = 0, l = App.currentSong.suggestions.length; i < l; i++) {
      out +=
        '<li data-value="' +
        i +
        '">' +
        App.currentSong.suggestions[i].name +
        "</li>";
    }
    document.getElementById("suggestions").innerHTML = "<ul>" + out + "</ul>";
  },
};

document.addEventListener("DOMContentLoaded", function () {
  App.init();
});

module.exports = App;
