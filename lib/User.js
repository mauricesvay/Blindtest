function User(username) {
    this.username = username;
    this.score = 0;
}

User.prototype.getName = function() {
    return this.username;
}

User.prototype.getScore = function() {
    return this.score;
}

User.prototype.inc = function() {
    this.score++;
}

module.exports = User;