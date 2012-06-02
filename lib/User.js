var sanitizer = require('sanitizer');

function User(game, socket) {
	this.game = game;
	this.socket = socket;
    this.username = '';
    this.score = 0;
    this.bindEvents();
    this.locked = true;
    this.hasJoined = false;
}

User.prototype.bindEvents = function() {
	var self = this;
	this.socket.on('login', function (data) {
        //No username?
        if (!data.username) {
            return;
        }
        var username = sanitizer.escape(data.username);
        self.username = username;
        self.socket.emit('login');
        self.game.updatePlayers();
        console.log(">>> " + username);
    });

    this.socket.on('disconnect', function(){
    	self.game.removeUser(self);
    });

    //Monitor events
    this.socket.on('spectate', function (data) {
        self.socket.join('game');
        self.game.updatePlayers();
    });
    this.socket.on('start', function (data) {
    	self.game.newRound();
    });
    this.socket.on('next', function (data) {
        console.log('Requesting next song');
        self.game.nextSong();
    });

    //Player events
    this.socket.on('button', function(data){
    	if (self.locked) {
    		return;
    	}
    	var button = parseInt(data.button,10);
    	self.lock();
    	self.game.checkAnswer(self, button);
    	// console.log(self.username + ' : ' + button);
    });
}

User.prototype.join = function() {
	if (this.username !== '') {
		this.hasJoined = true;
		this.socket.join('game');
		this.game.updatePlayers();
		console.log("+++ " + this.username);
	}
}

User.prototype.refuse = function() {
    this.socket.emit('refused');
}

User.prototype.lock = function() {
	this.locked = true;
}

User.prototype.unlock = function() {
	this.locked = false;
}

User.prototype.isWrong = function() {
	//this.score--;
	this.socket.emit('wrong');
}

User.prototype.isRight = function() {
	this.socket.emit('right');
	this.socket.broadcast.emit('right', {username: this.username});
	this.game.updatePlayers();
}

User.prototype.isWinner = function() {
	this.socket.emit('winner', this.username);
    this.socket.broadcast.emit('winner', this.username);
	this.game.updatePlayers();
}

User.prototype.getName = function() {
    return this.username;
}

User.prototype.getScore = function() {
    return this.score;
}

User.prototype.resetScore = function() {
	this.score = 0;
}

User.prototype.inc = function() {
    this.score++;
}

module.exports = User;