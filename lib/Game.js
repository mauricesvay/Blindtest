var User = require('./User');
var db = require('./Songs');

var Game = {
    io: null,
    MAX_USERS : 16,
    MAX_SCORE : 5,
    users : [],
    round : null,
    currentSong : null,

    init : function(io) {
        Game.io = io;
        console.log("Launching...");
        Game.waitForUsers();
    },

    waitForUsers : function() {
        console.log("Waiting for players");
        Game.io.sockets.on('connection', function (socket) {
            var user = new User(Game, socket);
            Game.addUser(user);
        });
    },

    addUser : function(user) {
        Game.users.push(user);
        if (Game.users.length >= Game.MAX_USERS) {
            user.refuse();
            return;
        }
        console.log(Game.users.length + ' players');
    },

    removeUser : function(user) {
        var idx = Game.users.indexOf(user);
        Game.users.splice(idx,1);
        console.log(Game.users.length + ' players');
        Game.updatePlayers();
    },

    newRound : function() {
        console.log('=================================================');
        console.log("New round!");
        //check that round is finished

        for (var i=0,l=Game.users.length; i<l; i++) {
            //Reset scores
            Game.users[i].resetScore();
            //Pending users can play now
            Game.users[i].join();
        }
        Game.nextSong();
    },

    nextSong : function() {
        db.getRandomSong(function(data){
            song = data;
            Game.currentSong = song;
            console.log('=================================================');
            console.log('Now playing : ' + song.artist.name + ' - ' + song.title);

            for (var i=0,l=Game.users.length; i<l; i++) {
                Game.users[i].unlock();
            }

            Game.io.sockets.in('game').emit('song', {song: song});
        });
    },

    checkAnswer : function(user, button) {
        if (button < 0 || button > Game.currentSong.suggestions.length) {
            //Button out of bounds
        }

        var isRight = Game.currentSong.suggestions[button].answer;
        if (isRight) {
            user.inc();
            if (user.getScore() >= Game.MAX_SCORE) {
                user.isWinner();
                console.log(user.getName() + ' is the winner!');
            } else {
                user.isRight();
                console.log(user.getName() + ' is right!');
            }
        } else {
            user.isWrong();
            console.log(user.getName() + ' is wrong!');
        }
    },

    updatePlayers : function() {
        var users = [];
        for (var i=0,l=Game.users.length; i<l; i++) {
            if ('' === Game.users[i].getName()) {
                continue;
            }
            users.push({
                username: Game.users[i].getName(),
                score: Game.users[i].getScore(),
                hasJoined: Game.users[i].hasJoined,
            });
        }
        Game.io.sockets.in('game').emit('users',{users: users});
    }
}

module.exports = Game;