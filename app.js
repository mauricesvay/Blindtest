var User = require('./lib/User');
var db = require('./lib/Songs');
var express = require('express');
var app = require('express').createServer()
var io = require('socket.io').listen(app);

var acceptUsers = true;
var started = false;
var MAX_PLAYERS = 16;
var MAX_SCORE = 5;

// var usernames = [];
var users = [];
var sockets = [];
var song;
var winner = '';

function userIndex(username) {
    for (var i=0,l=users.length; i<l; i++) {
        if (username === users[i].getName()) {
            return i;
        }
    }
    return -1;
}

var waitForPlayers = function() {
    //wait for players, when go is sent, start
    io.sockets.on('connection', function (socket) {

        sockets.push(socket);

        //Spectate events
        socket.on('start', function (data) {
            console.log("Game is starting...");
            acceptUsers = false;
            started = true;
            startGame();
        });
        socket.on('spectate', function (data) {
            socket.emit('users', {users: users});
        });
        socket.on('next', function (data) {
            getNextSong();
        });

        socket.on('login', function (data) {
            if (!acceptUsers) {
                console.log("refused");
                socket.emit('refused');
                return;
            }

            if (data.username) {

                console.log(">>> " + data.username);

                var username = data.username;
                var idx = userIndex(username);

                if (idx === -1) {
                    users.push(new User(username));
                    socket.set('username', data.username);

                    socket.emit('login');
                    socket.broadcast.emit('users', {users: users});
                } else {
                    console.log("refused");
                    socket.emit('refused');
                    //user already logged in, ignore
                }

                if (users.length >= MAX_PLAYERS) {
                    acceptUsers = false;
                }
            }
        });

        socket.on('disconnect', function(){
            sockets.splice(sockets.indexOf(socket), 1);
            socket.get('username', function(err, name){
                if (name) {
                    var idx = userIndex(name);
                    if (idx !== -1) {
                        users.splice(idx,1);
                        socket.broadcast.emit('users', {users: users});
                    }
                    console.log("<<< " + name);
                }
            });
        });

        socket.on('button', function(data){

            if (winner !== '') {
                return;
            }

            socket.get('username', function(err, username){
                var button = data.button;
                var idx = userIndex(username);

                if (song.suggestions[button].answer === true) {
                    //Score +1
                    users[idx].inc();

                    if (users[idx].getScore() >= MAX_SCORE) {
                        //Winner ?
                        socket.emit('winner', username);
                        socket.broadcast.emit('winner', username);
                        socket.broadcast.emit('users', {users: users});
                        winner = username;
                        console.log('=================================================');
                        console.log('WINNER : ' + username);
                    } else {
                        //Tell everyone we have a right answer
                        socket.emit('right');
                        socket.broadcast.emit('right', {username: username});
                        socket.broadcast.emit('users', {users: users});
                    }

                    console.log('=================================================');
                    for (var i=0,l=users.length; i<l; i++) {
                        console.log(users[i].getName() + " : " + users[idx].getScore());
                    }

                } else {
                    socket.emit('wrong');
                    // console.log(username + " is wrong");
                    //@TODO : prevent user from playing until next round
                }
            })
        });
    });
};

var resetGame = function() {
    acceptUsers = true;
    started = false;
    //@TODO: reset users
}

var startGame = function() {
    getNextSong();
};

var getNextSong = function() {

    if (winner !== '') {
        return;
    }

    db.getRandomSong(function(data){
        song = data;
        console.log('=================================================');
        console.log('Now playing : ' + song.artist.name + ' - ' + song.title);
        updateClients();
    });
};

var updateClients = function() {
    for (var i=0; i<sockets.length; i++) {
        sockets[i].emit('song', {song: song});
    }
    //Send new data to clients
};

var onCorrectAnswer = function() {
    getNextSong();
}

app.listen(8080);

app.configure('development', function(){
    app.use(express.static(__dirname + '/www'));
});

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/www/index.html');
});
app.get('/spectate', function (req, res) {
    res.sendfile(__dirname + '/www/spectate.html');
});

io.configure('development', function(){
    io.set('log level', 1);
});

waitForPlayers();
