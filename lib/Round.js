var db = require('./Songs');

function Round() {
	this.players = [];
	this.max_score = 5;
}

Round.prototype.start = function(players) {
	this.players = players;
}