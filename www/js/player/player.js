var socket;
var App = {
    currentSong: null,
    username: null,

    init: function() {
        socket = io.connect("http://" + location.hostname + ":" + location.port);

        //Login
        $("form").on("submit", function(e) {
            e.preventDefault();
            var username = $("#nickname").val();
            App.username = username;
            $("#username").text(username);
            socket.emit("login", {
                username: username
            });
        });

        socket.on("login", function() {
            $("form").hide();
            $("#suggestions").html('<span class="wait">Ready for next round</span>');
        });

        socket.on("refused", function() {
            alert("Server is full");
            socket.disconnect();
        });

        socket.on("song", function(song) {
            // if (App.userName) {
            App.onSong(song);
            // }
        });

        socket.on("right", function(data) {
            if (data) {
                App.onWrong();
            } else {
                App.onRight();
            }
        });

        socket.on("wrong", function() {
            App.onWrong();
        });

        //Suggestions
        var eventType = typeof window.ontouchstart === "undefined" ? "click" : "tap";
        $("#suggestions").on(eventType, function(e) {
            if ($(e.target).attr("data-value")) {
                var value = $(e.target).attr("data-value");
                socket.emit("button", {
                    button: value
                });
            }
        });
    },

    onSong: function(song) {
        App.currentSong = song.song;
        App.showSuggestions();
    },

    onRight: function() {
        $("#suggestions").html("<span class='right'>✔</span>");
    },

    //@TODO : add case when other user is right onOtherRight

    onWrong: function() {
        $("#suggestions").html("<span class='wrong'>✖</span>");
    },

    showSuggestions: function() {
        var out = "";
        for (var i = 0, l = App.currentSong.suggestions.length; i < l; i++) {
            out += '<li data-value="' + i + '">' + App.currentSong.suggestions[i].name + "</li>";
        }
        $("#suggestions").html("<ul>" + out + "</ul>");
    }
};
$(function() {
    App.init();
});
